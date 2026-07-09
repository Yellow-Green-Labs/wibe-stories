export const config = { runtime: 'edge' };

import { getRedis, KEYS } from '../../lib/redis.js';
import { getOccasionForDate, sendOccasionEmail } from '../lib/occasion-email.js';

const CONCURRENCY = 5;

function normalizeEmail(email) {
  return email.toLowerCase().trim();
}

export default async function handler(req) {
  const expected = process.env.CRON_SECRET;
  if (!expected || req.headers.get('authorization') !== `Bearer ${expected}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const brevoApiKey = process.env.BREVO_API_KEY;
  if (!brevoApiKey) {
    console.error('[OccasionCron] BREVO_API_KEY not set');
    return new Response('Server config error', { status: 500 });
  }

  const today = new Date();
  const occasion = getOccasionForDate(today);

  if (!occasion) {
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

        const ok = await sendOccasionEmail(brevoApiKey, email, occasion);
        if (ok) {
          await redis.set(dedupKey, '1', { ex: 31536000 });
          return 'sent';
        } else {
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

  return new Response(JSON.stringify({ ok: true, occasion: occasion.id, sent, skipped, errors }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
