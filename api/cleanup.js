// Scheduled cleanup of expired card blobs.
// Runs daily via Vercel Cron (see vercel.json `crons` block). Deletes any
// blob in `cards/`, `og/`, `voice/`, or `meta/` older than MAX_AGE_HOURS.
// Pro subscriber cards get 14 days (PRO_MAX_AGE_HOURS) from their metadata.
// Vault-protected cards (linked in vault_cards table) are never deleted.
// Triggered by Vercel with `Authorization: Bearer ${CRON_SECRET}`;
// rejects anything else with 401.

import { list, del } from '@vercel/blob';
import { getNeon } from '../lib/neon.js';
import Sentry from '../lib/sentry-node.js';

const MAX_AGE_HOURS = 168;
const PRO_MAX_AGE_HOURS = 336;
const PREFIXES = ['cards/', 'og/', 'voice/', 'meta/'];
const DELETE_BATCH = 50;

async function isVaultCard(shortId) {
  try {
    const sql = getNeon();
    const rows = await sql`
      SELECT 1 FROM vault_cards WHERE short_id = ${shortId} LIMIT 1
    `;
    return rows && rows.length > 0;
  } catch {
    return false;
  }
}

function shortIdFromCardUrl(blobUrl) {
  try {
    const url = new URL(blobUrl);
    const match = url.pathname.match(/\/cards\/(.+)\.png$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

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

          // Vault-protected card — never delete, regardless of age
          if (prefix === 'cards/') {
            const sid = shortIdFromCardUrl(blob.url);
            if (sid && await isVaultCard(sid)) continue;
          }

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

    fetch('https://uptime.betterstack.com/api/v1/heartbeat/J8eZQGgcV9t2s1EiF1yBTEqJ')
      .catch(function() { /* non-critical */ });
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      ok: true,
      deleted,
      cutoff: new Date(cutoff7d).toISOString(),
    }));
  } catch (e) {
    Sentry.captureException(e);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      ok: false,
      error: (e && e.message) || 'unknown',
    }));
  }
}
