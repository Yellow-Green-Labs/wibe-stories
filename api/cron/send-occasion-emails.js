export const config = { runtime: 'nodejs' };

import { getRedis, KEYS } from '../../lib/redis.js';
import Sentry from '../../lib/sentry-node.js';
import { getOccasionForDate, sendOccasionEmail } from '../lib/occasion-email.js';

const CONCURRENCY = 5;

function normalizeEmail(email) {
  return email.toLowerCase().trim();
}

export default async function handler(req) {
  try {
  const expected = process.env.CRON_SECRET;
  if (!expected || req.headers['authorization'] !== `Bearer ${expected}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.error('[OccasionCron] RESEND_API_KEY not set');
    return new Response('Server config error', { status: 500 });
  }

  const today = new Date();
  const occasion = getOccasionForDate(today);

  if (!occasion) {
    fetch('https://uptime.betterstack.com/api/v1/heartbeat/w3uksqCqLVNogZhx78Z8yvrh')
      .catch(function() { /* non-critical */ });
    return new Response(JSON.stringify({ ok: true, occasion: null, message: 'no occasion today' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  console.log(`[OccasionCron] Today is ${occasion.name} — preparing emails`);

  const redis = getRedis();
  const [proEmails, subEmails] = await Promise.all([
    redis.smembers(KEYS.proEmailsSet),
    redis.smembers(KEYS.emailSubscribersSet),
  ]);
  const allEmails = [...new Set([...proEmails, ...subEmails])];

  if (!allEmails || allEmails.length === 0) {
    fetch('https://uptime.betterstack.com/api/v1/heartbeat/w3uksqCqLVNogZhx78Z8yvrh')
      .catch(function() { /* non-critical */ });
    return new Response(JSON.stringify({ ok: true, occasion: occasion.id, sent: 0, skipped: 0 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let sent = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < allEmails.length; i += CONCURRENCY) {
    const batch = allEmails.slice(i, i + CONCURRENCY);
    const results = await Promise.allSettled(
      batch.map(async (rawEmail) => {
        const email = normalizeEmail(rawEmail);
        const dedupKey = KEYS.occasionSent(email, occasion.id);

        const alreadySent = await redis.get(dedupKey);
        if (alreadySent) {
          return 'skipped';
        }

        const result = await sendOccasionEmail(resendApiKey, email, occasion);
        if (result.ok) {
          await redis.set(dedupKey, '1', { ex: 31536000 });
          return 'sent';
        } else {
          console.error(`[OccasionCron] ${email} failed:`, result.error);
          return 'error';
        }
      })
    );

    for (const r of results) {
      if (r.status === 'fulfilled') {
        if (r.value === 'sent') sent++;
        else if (r.value === 'skipped') skipped++;
        else errors++;
      } else {
        errors++;
      }
    }
  }

  console.log(`[OccasionCron] ${occasion.name}: sent=${sent}, skipped=${skipped}, errors=${errors}`);

  fetch('https://uptime.betterstack.com/api/v1/heartbeat/w3uksqCqLVNogZhx78Z8yvrh')
    .catch(function() { /* non-critical */ });
  return new Response(JSON.stringify({ ok: true, occasion: occasion.id, sent, skipped, errors }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
  } catch (e) {
    Sentry.captureException(e);
    console.error('[OccasionCron] Unhandled error:', e.message);
    return new Response('Internal server error', { status: 500 });
  }
}
