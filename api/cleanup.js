// Scheduled cleanup of expired card blobs.
// Runs daily via Vercel Cron (see vercel.json `crons` block). Deletes any
// blob in `cards/` or `og/` older than MAX_AGE_HOURS so shared cards live
// ~7 days, never longer. Pro subscriber cards get 14 days (PRO_MAX_AGE_HOURS).
// Pro status is checked from the card's metadata file (meta/<shortId>.json).
// Triggered by Vercel with `Authorization: Bearer ${CRON_SECRET}`;
// rejects anything else with 401.

import { list, del } from '@vercel/blob';

const MAX_AGE_HOURS = 168; // 7 days — cards live for a week
const PRO_MAX_AGE_HOURS = 336; // 14 days — Pro cards live for two weeks
const PREFIXES = ['cards/', 'og/', 'voice/', 'meta/'];
const DELETE_BATCH = 50;

async function isProCard(blobUrl) {
  try {
    const url = new URL(blobUrl);
    const match = url.pathname.match(/\/cards\/(.+)\.png$/);
    if (!match) return false;
    const shortId = match[1];
    url.pathname = `/meta/${shortId}.json`;
    const resp = await fetch(url.toString());
    if (!resp.ok) return false;
    const meta = await resp.json();
    return meta.pro === true;
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  // Reject anything that isn't the scheduled Vercel cron call
  const expected = process.env.CRON_SECRET;
  if (!expected || req.headers.authorization !== `Bearer ${expected}`) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Unauthorized');
    return;
  }

  const cutoff7d = Date.now() - MAX_AGE_HOURS * 60 * 60 * 1000;
  const cutoff14d = Date.now() - PRO_MAX_AGE_HOURS * 60 * 60 * 1000;
  const expiredUrls = [];

  try {
    for (const prefix of PREFIXES) {
      let cursor;
      do {
        const page = await list({ prefix, cursor });
        for (const blob of page.blobs) {
          const ageMs = new Date(blob.uploadedAt).getTime();
          if (ageMs < cutoff14d) {
            expiredUrls.push(blob.url);
          } else if (ageMs < cutoff7d) {
            if (prefix === 'cards/' && (await isProCard(blob.url))) {
              continue; // Pro card, keep for 14 days
            }
            expiredUrls.push(blob.url);
          }
        }
        cursor = page.cursor;
      } while (cursor);
    }

    let deleted = 0;
    for (let i = 0; i < expiredUrls.length; i += DELETE_BATCH) {
      const batch = expiredUrls.slice(i, i + DELETE_BATCH);
      await del(batch);
      deleted += batch.length;
    }

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      ok: true,
      deleted,
      cutoff: new Date(cutoff7d).toISOString(),
    }));
  } catch (e) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      ok: false,
      error: (e && e.message) || 'unknown',
    }));
  }
}
