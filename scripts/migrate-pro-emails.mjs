#!/usr/bin/env node
// One-time migration: backfill all existing Pro subscriber emails
// into the wispr:pro-emails Redis Set (for occasion email campaigns).
//
// Usage:
//   node scripts/migrate-pro-emails.mjs
//
// Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
// in environment variables (or .env file).

import { Redis } from '@upstash/redis';

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!url || !token) {
  console.error('Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN');
  process.exit(1);
}

const redis = new Redis({ url, token });
const PRO_EMAILS_KEY = 'wispr:pro-emails';
const EMAIL_PREFIX = 'wispr:emails:';

async function migrate() {
  console.log('Scanning for existing Pro subscriber emails...');

  let cursor = 0;
  let added = 0;
  let total = 0;

  do {
    const result = await redis.scan(cursor, { match: `${EMAIL_PREFIX}*`, count: 100 });
    cursor = result[0];
    const keys = result[1];

    for (const key of keys) {
      total++;
      const email = key.slice(EMAIL_PREFIX.length);
      await redis.sadd(PRO_EMAILS_KEY, email);
      added++;
    }
  } while (cursor !== 0);

  const count = await redis.scard(PRO_EMAILS_KEY);
  console.log(`Done. Scanned ${total} email keys, added ${added} to ${PRO_EMAILS_KEY}.`);
  console.log(`Set now has ${count} member(s).`);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
