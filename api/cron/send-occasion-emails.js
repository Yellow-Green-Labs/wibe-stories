export const config = { runtime: 'nodejs' };

import { getRedis, KEYS } from '../../lib/redis.js';
import Sentry from '../../lib/sentry-node.js';
import { getOccasionForDate, sendOccasionEmail } from '../../lib/occasion-email.js';

const CONCURRENCY = 5;

function normalizeEmail(email) {
  return email.toLowerCase().trim();
}

export default async function handler(req, res) {
  try {
  const expected = process.env.CRON_SECRET;
  if (!expected || req.headers['authorization'] !== `Bearer ${expected}`) {
    res.statusCode = 401;
    res.end('Unauthorized');
    return;
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.error('[OccasionCron] RESEND_API_KEY not set');
    res.statusCode = 500;
    res.end('Server config error');
    return;
  }

  const today = new Date();
  const occasion = getOccasionForDate(today);

  if (!occasion) {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true, occasion: null, message: 'no occasion today' }));
    return;
  }

  console.log(`[OccasionCron] Today is ${occasion.name} — preparing emails`);

  const redis = getRedis();
  const [proEmails, subEmails] = await Promise.all([
    redis.smembers(KEYS.proEmailsSet),
    redis.smembers(KEYS.emailSubscribersSet),
  ]);
  const allEmails = [...new Set([...proEmails, ...subEmails])];

  const nameRows = await redis.mget(allEmails.map((e) => KEYS.subscriberName(e)));
  const nameMap = new Map();
  allEmails.forEach((email, i) => {
    if (nameRows[i]) nameMap.set(email, nameRows[i]);
  });

  console.log(`[OccasionCron] Recipients: ${allEmails.length} total (${proEmails.length} Pro, ${subEmails.length} subscriber)`);

  if (!allEmails || allEmails.length === 0) {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true, occasion: occasion.id, sent: 0, skipped: 0 }));
    return;
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

        const result = await sendOccasionEmail(resendApiKey, email, occasion, undefined, { name: nameMap.get(email) || '' });
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
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;
  res.end(JSON.stringify({ ok: true, occasion: occasion.id, sent, skipped, errors }));
  } catch (e) {
    Sentry.captureException(e);
    console.error('[OccasionCron] Unhandled error:', e.message);
    res.statusCode = 500;
    res.end('Internal server error');
  }
}
