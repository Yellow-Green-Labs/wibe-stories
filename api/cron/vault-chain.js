// Vault chain cron: T+30 / T+60 / T+90 emails after a Pro membership's
// expiresAt passes, only for users who still have cards in their vault.
//
//   T+30  Vault Warning    (cards > 0)
//   T+60  Last Call        (cards > 0)  + hadcards flag
//   T+90  Deleted Farewell (only if T+60 fired = cards existed)
//         deletes the vault rows + card/voice/meta blobs for that key, then
//         sends the farewell.
//
// Audience source: the `wispr:pro-emails` set (maintained by
// api/webhook-bmac.js on purchase/resend/cancel/refund; backfilled by
// scripts/migrate-pro-emails.mjs). Per email: emailLookup(email) → key →
// upgradeKey(key) JSON (expiresAt, tier, revoked, cancelled). Monthly keys
// have no expiresAt → never in the chain. Cancelled annual keys keep
// expiresAt → still in the chain (the paid year was honored, and the
// data-deletion promise applies after it ends).
//
// DORMANT BY DESIGN: the whole run no-ops unless VAULT_CHAIN_ENABLED=1 is
// set. Arming = one env var, no deploy needed.
//
// Edge cases:
// - Cron downtime: stages use lower-bound day checks (>= 30 / >= 60 / >= 90)
//   with per-stage dedupe keys, so a long outage can't silently skip a user.
// - User deletes vault cards between T+30 and T+60: count = 0 → no T+60, no
//   hadcards flag, no T+90 deletion or farewell. Correct.
// - Re-subscription after expiry: emailLookup points to the NEW key (future
//   expiresAt), so the old key's rows are never touched by this cron. They
//   stay in the DB (safer than deleting data the user may still want).

export const config = { runtime: 'nodejs' };

import { list, del } from '@vercel/blob';
import { getRedis, KEYS } from '../../lib/redis.js';
import { getNeon } from '../../lib/neon.js';
import Sentry from '../../lib/sentry-node.js';
import { sendVaultChainEmail } from '../../lib/vault-chain-email.js';

const CONCURRENCY = 5;
const DAY_MS = 24 * 60 * 60 * 1000;
const DEDUPE_TTL = 10 * 365 * 24 * 60 * 60; // 10 years, effectively permanent
const DELETE_BATCH = 50;

function normalizeEmail(email) {
  return email.toLowerCase().trim();
}

function daysSince(iso) {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return -1;
  return Math.floor((Date.now() - t) / DAY_MS);
}

function formatDate(iso) {
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return '';
  }
}

async function vaultCardCount(sql, key) {
  try {
    const rows = await sql`SELECT COUNT(*)::int AS n FROM vault_cards WHERE pro_key = ${key}`;
    return (rows && rows[0] && rows[0].n) || 0;
  } catch {
    return -1; // DB error — caller skips, retry next run
  }
}

function shortIdFromUrl(blobUrl) {
  try {
    const url = new URL(blobUrl);
    let m = url.pathname.match(/\/cards\/(.+)\.png$/);
    if (m) return m[1];
    m = url.pathname.match(/\/og\/(.+)\.png$/);
    if (m) return m[1];
    m = url.pathname.match(/\/meta\/(.+)\.json$/);
    if (m) return m[1];
    m = url.pathname.match(/\/voice\/([^/.]+)(?:\.m4a)?$/);
    if (m) return m[1];
    return null;
  } catch {
    return null;
  }
}

async function deleteVaultFiles(shortIds) {
  if (!shortIds.length) return 0;
  const wanted = new Set(shortIds);
  const urls = [];
  for (const prefix of ['cards/', 'og/', 'voice/', 'meta/']) {
    let cursor;
    do {
      const page = await list({ prefix, cursor });
      for (const blob of page.blobs) {
        const sid = shortIdFromUrl(blob.url);
        if (sid && wanted.has(sid)) urls.push(blob.url);
      }
      cursor = page.cursor;
    } while (cursor);
  }
  let deleted = 0;
  for (let i = 0; i < urls.length; i += DELETE_BATCH) {
    const batch = urls.slice(i, i + DELETE_BATCH);
    await del(batch);
    deleted += batch.length;
  }
  return deleted;
}

export default async function handler(req, res) {
  try {
    const expected = process.env.CRON_SECRET;
    if (!expected || req.headers['authorization'] !== `Bearer ${expected}`) {
      res.statusCode = 401;
      res.end('Unauthorized');
      return;
    }

    // Dormant gate — see header comment.
    if (process.env.VAULT_CHAIN_ENABLED !== '1') {
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      res.end(JSON.stringify({ ok: true, disabled: true }));
      return;
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error('[VaultChain] RESEND_API_KEY not set');
      res.statusCode = 500;
      res.end('Server config error');
      return;
    }

    const redis = getRedis();
    const sql = getNeon();
    const emails = (await redis.smembers(KEYS.proEmailsSet)) || [];

    let sent = { warning: 0, lastCall: 0, farewell: 0 };
    let skipped = 0;
    let errors = 0;

    for (let i = 0; i < emails.length; i += CONCURRENCY) {
      const batch = emails.slice(i, i + CONCURRENCY);
      const results = await Promise.allSettled(
        batch.map(async (rawEmail) => {
          const email = normalizeEmail(rawEmail);
          const key = await redis.get(KEYS.emailLookup(email));
          if (!key) return 'skip';
          const raw = await redis.get(KEYS.upgradeKey(key));
          if (!raw) return 'skip';
          const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
          if (data.revoked || !data.expiresAt) return 'skip';
          const d = daysSince(data.expiresAt);
          if (d < 0) return 'skip';

          const name = (await redis.get(KEYS.subscriberName(email))) || '';

          // T+30
          if (d >= 30 && d < 60) {
            const dedupe = KEYS.vaultChainSent(30, email);
            if (!(await redis.get(dedupe))) {
              const count = await vaultCardCount(sql, key);
              if (count <= 0) return 'skip';
              const r = await sendVaultChainEmail(resendApiKey, {
                stage: 'warning', toEmail: email, name, count, endDate: formatDate(data.expiresAt),
              });
              if (!r.ok) { console.error(`[VaultChain] warning failed ${email}:`, r.error); return 'error'; }
              await redis.set(dedupe, '1', { ex: DEDUPE_TTL });
              return 'warning';
            }
            return 'skip';
          }

          // T+60
          if (d >= 60 && d < 90) {
            const dedupe = KEYS.vaultChainSent(60, email);
            if (!(await redis.get(dedupe))) {
              const count = await vaultCardCount(sql, key);
              if (count <= 0) return 'skip';
              const r = await sendVaultChainEmail(resendApiKey, {
                stage: 'lastCall', toEmail: email, name, count, endDate: formatDate(data.expiresAt),
              });
              if (!r.ok) { console.error(`[VaultChain] lastCall failed ${email}:`, r.error); return 'error'; }
              await redis.set(dedupe, '1', { ex: DEDUPE_TTL });
              await redis.set(KEYS.vaultChainHadCards(email), '1', { ex: DEDUPE_TTL });
              return 'lastCall';
            }
            return 'skip';
          }

          // T+90
          if (d >= 90) {
            const dedupe = KEYS.vaultChainSent(90, email);
            if (!(await redis.get(dedupe))) {
              const hadCards = await redis.get(KEYS.vaultChainHadCards(email));
              if (!hadCards) return 'skip';
              // Delete vault rows + blobs for this key, then farewell.
              const rows = await sql`SELECT short_id FROM vault_cards WHERE pro_key = ${key}`;
              const shortIds = (rows || []).map((r) => r.short_id).filter(Boolean);
              const deleted = await deleteVaultFiles(shortIds);
              await sql`DELETE FROM vault_cards WHERE pro_key = ${key}`;
              const r = await sendVaultChainEmail(resendApiKey, {
                stage: 'farewell', toEmail: email, name,
              });
              if (!r.ok) { console.error(`[VaultChain] farewell failed ${email}:`, r.error); return 'error'; }
              await redis.set(dedupe, '1', { ex: DEDUPE_TTL });
              return 'farewell';
            }
            return 'skip';
          }

          return 'skip';
        })
      );

      for (const result of results) {
        if (result.status === 'rejected') { errors++; continue; }
        const tag = result.value;
        if (tag === 'warning') sent.warning++;
        else if (tag === 'lastCall') sent.lastCall++;
        else if (tag === 'farewell') sent.farewell++;
        else if (tag === 'error') errors++;
        else skipped++;
      }
    }

    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true, sent, skipped, errors }));
  } catch (e) {
    Sentry.captureException(e);
    console.error('[VaultChain] run failed:', e);
    res.statusCode = 500;
    res.end('Vault chain run failed');
  }
}