// Milestone Celebration cron (marketing, Resend).
// For every active Pro key, counts vault cards and sends a Milestone
// Celebration email (lib/milestone-email.js) when a threshold
// (10/25/50/100/250/500) is crossed for the first time. Max one celebration
// per key per 90 days.
//
// Audience: `wispr:pro-emails` set → emailLookup → key → upgradeKey JSON.
// Active = not revoked, not cancelled, not expired (monthly keys have no
// expiresAt and are active until cancelled). Lapsed/revoked/cancelled keys are
// skipped.
//
// DORMANT BY DESIGN: no-ops unless MARKETING_ENABLED=1, so no email is sent
// before the user arms the program (post-deploy env var).
//
// Dedupe: `wispr:milestone:last:<key>` = JSON `{threshold, ts}`.
// - skip if the recorded threshold >= the current milestone (never celebrate a
//   lower threshold after a higher one)
// - skip if the last celebration was fewer than 90 days ago (cooldown)
// A re-purchase creates a NEW key string, so dedupe resets naturally.

export const config = { runtime: 'nodejs' };

import { getRedis, KEYS } from '../../../lib/redis.js';
import { getNeon } from '../../../lib/neon.js';
import Sentry from '../../../lib/sentry-node.js';
import { sendMilestoneEmail } from '../../../lib/milestone-email.js';

const CONCURRENCY = 5;
const THRESHOLDS = [10, 25, 50, 100, 250, 500];
const COOLDOWN_MS = 90 * 24 * 60 * 60 * 1000;

function normalizeEmail(email) {
  return email.toLowerCase().trim();
}

async function vaultCardCount(sql, key) {
  try {
    const rows = await sql`SELECT COUNT(*)::int AS n FROM vault_cards WHERE pro_key = ${key}`;
    return (rows && rows[0] && rows[0].n) || 0;
  } catch {
    return -1;
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
      console.error('[Milestones] RESEND_API_KEY not set');
      res.statusCode = 500;
      res.end('Server config error');
      return;
    }

    const redis = getRedis();
    const sql = getNeon();
    const emails = (await redis.smembers(KEYS.proEmailsSet)) || [];

    let fired = 0;
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

          // Active-key guards: revoked, cancelled, or expired annual → skip.
          if (data.revoked || data.cancelled) return 'skip';
          if (data.expiresAt && Date.now() > new Date(data.expiresAt).getTime()) return 'skip';

          const count = await vaultCardCount(sql, key);
          if (count <= 0) return 'skip';
          const milestone = THRESHOLDS.filter((t) => count >= t).pop();
          if (!milestone) return 'skip';

          // Dedupe + cooldown.
          const lastRaw = await redis.get(KEYS.milestoneLast(key));
          if (lastRaw) {
            const last = typeof lastRaw === 'string' ? JSON.parse(lastRaw) : lastRaw;
            if (last.threshold >= milestone) return 'skip';
            if (Date.now() - (last.ts || 0) < COOLDOWN_MS) return 'skip';
          }

          const name = (await redis.get(KEYS.subscriberName(email))) || '';
          const ok = await sendMilestoneEmail(resendApiKey, {
            toEmail: email, name, count, threshold: milestone,
          });
          if (!ok.ok) return 'error';
          await redis.set(KEYS.milestoneLast(key), JSON.stringify({ threshold: milestone, ts: Date.now() }));
          return 'fired';
        })
      );

      for (const result of results) {
        if (result.status === 'rejected') { errors++; continue; }
        const tag = result.value;
        if (tag === 'fired') fired++;
        else if (tag === 'error') errors++;
        else skipped++;
      }
    }

    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true, fired, skipped, errors }));
  } catch (e) {
    Sentry.captureException(e);
    console.error('[Milestones] run failed:', e);
    res.statusCode = 500;
    res.end('Milestones run failed');
  }
}