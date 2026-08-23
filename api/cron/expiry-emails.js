// Expiry marketing emails cron (marketing, Resend).
// Three reminders around Pro membership expiry (annual keys only — monthly
// keys have no expiresAt and are never touched):
//   T-7  Expiry Warning      — sent when 1..7 days remain
//   T-1  Expiry Final Warning — sent when 1 day or less remains (expired users
//        within the same day get the final warning, not the T+7 nudge)
//   T+7  Post-Expiry Nudge   — sent 1..7 days after expiry (renewal hook)
//
// Audience: `wispr:pro-emails` set → emailLookup → key → upgradeKey JSON.
// Revoked and cancelled keys are skipped (cancelled monthly users never get
// reminders; cancelled annual keys keep expiresAt but were refunded — skipped
// here because the vault chain already handles their data-deletion promise).
//
// DORMANT BY DESIGN: no-ops unless MARKETING_ENABLED=1, so no email is sent
// before the user arms the program (post-deploy env var).
//
// Edge cases:
// - Cron downtime: lower-bound day checks (d <= 7 / d <= 1 / e <= 7) with
//   per-stage dedupe keys mean a missed run never double-sends and an overdue
//   run still fires the right stage.
// - Re-purchase before expiry: emailLookup points to the NEW key (future
//   expiresAt), so the old key is never reminded again.

export const config = { runtime: 'nodejs' };

import { getRedis, KEYS } from '../../lib/redis.js';
import Sentry from '../../lib/sentry-node.js';
import { sendExpiryEmail } from '../../lib/expiry-email.js';

const CONCURRENCY = 5;
const DAY_MS = 24 * 60 * 60 * 1000;
const DEDUPE_TTL = 10 * 365 * 24 * 60 * 60; // 10 years, effectively permanent

function normalizeEmail(email) {
  return email.toLowerCase().trim();
}

function formatDate(iso) {
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return '';
  }
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
    if (process.env.MARKETING_ENABLED !== '1') {
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      res.end(JSON.stringify({ ok: true, disabled: true }));
      return;
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error('[ExpiryEmails] RESEND_API_KEY not set');
      res.statusCode = 500;
      res.end('Server config error');
      return;
    }

    const redis = getRedis();
    const emails = (await redis.smembers(KEYS.proEmailsSet)) || [];

    let sent = { 't-7': 0, 't-1': 0, 't+7': 0 };
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
          if (data.revoked || data.cancelled) return 'skip';
          if (!data.expiresAt) return 'skip';

          const t = new Date(data.expiresAt).getTime();
          if (Number.isNaN(t)) return 'skip';
          const daysLeft = Math.ceil((t - Date.now()) / DAY_MS);
          const daysGone = Math.ceil((Date.now() - t) / DAY_MS);

          let stage = null;
          if (daysLeft > 0 && daysLeft <= 7) stage = 't-7';
          else if (daysLeft <= 1 && daysGone <= 0) stage = 't-1';
          else if (daysGone >= 1 && daysGone <= 7) stage = 't+7';
          if (!stage) return 'skip';

          const dedupe = KEYS.expirySent(stage, email);
          if (await redis.get(dedupe)) return 'skip';

          const name = (await redis.get(KEYS.subscriberName(email))) || '';
          const r = await sendExpiryEmail(resendApiKey, {
            stage, toEmail: email, name, endDate: formatDate(data.expiresAt),
          });
          if (!r.ok) {
            console.error(`[ExpiryEmails] ${stage} failed ${email}:`, r.error);
            return 'error';
          }
          await redis.set(dedupe, '1', { ex: DEDUPE_TTL });
          return stage;
        })
      );

      for (const result of results) {
        if (result.status === 'rejected') { errors++; continue; }
        const tag = result.value;
        if (tag === 't-7' || tag === 't-1' || tag === 't+7') sent[tag]++;
        else if (tag === 'error') errors++;
        else skipped++;
      }
    }

    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true, sent, skipped, errors }));
  } catch (e) {
    Sentry.captureException(e);
    console.error('[ExpiryEmails] run failed:', e);
    res.statusCode = 500;
    res.end('Expiry emails run failed');
  }
}