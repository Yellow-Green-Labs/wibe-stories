// Founder Letter manual trigger (marketing, Resend).
// The Founder Letter is a monthly letter from the team — sent manually, once
// per calendar month, because copy is written by a human each month. This
// endpoint is the trigger: POST it (with x-admin-secret) and the letter goes
// to every email subscriber (wispr:email-subscribers set).
//
// Dedupe: `wispr:founder:YYYY-MM` (10y TTL). If the month already ran, the
// endpoint refuses to send again. The dedupe is written ONLY when the whole
// run succeeded (zero errors), so a partial failure retries cleanly.
//
// Test path: POST with `{ "email": "you@example.com" }` sends only to that
// address and never touches the dedupe key.
//
// Send mechanism: plain Resend emails.send (no Broadcasts). Broadcasts are the
// future upgrade path (bulk mode) if the subscriber count ever grows.

export const config = { runtime: 'nodejs' };

import { getRedis, KEYS } from '../../lib/redis.js';
import Sentry from '../../lib/sentry-node.js';
import { sendFounderLetterEmail } from '../../lib/founder-letter-email.js';

const CONCURRENCY = 5;
const DEDUPE_TTL = 10 * 365 * 24 * 60 * 60; // 10 years, effectively permanent

function normalizeEmail(email) {
  return email.toLowerCase().trim();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end('Method not allowed');
    return;
  }

  try {
    const expected = process.env.ADMIN_API_SECRET;
    if (!expected || req.headers['x-admin-secret'] !== expected) {
      res.statusCode = 401;
      res.end('Unauthorized');
      return;
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error('[FounderLetter] RESEND_API_KEY not set');
      res.statusCode = 500;
      res.end('Server config error');
      return;
    }

    let body = {};
    try {
      body = req.body || {};
    } catch {
      body = {};
    }

    const redis = getRedis();
    const setJson = (payload) => {
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      res.end(JSON.stringify(payload));
    };

    // Test path: single address, no dedupe.
    if (body.email) {
      const r = await sendFounderLetterEmail(resendApiKey, { toEmail: normalizeEmail(body.email) });
      if (!r.ok) {
        console.error(`[FounderLetter] test send failed ${body.email}:`, r.error);
        res.statusCode = 502;
        res.end('Send failed');
        return;
      }
      setJson({ ok: true, test: true, sent: 1, errors: 0 });
      return;
    }

    const month = new Date().toISOString().slice(0, 7); // YYYY-MM
    const dedupe = KEYS.founderSent(month);
    if (await redis.get(dedupe)) {
      setJson({ ok: false, alreadySent: true, month });
      return;
    }

    const emails = (await redis.smembers(KEYS.emailSubscribersSet)) || [];
    if (!emails.length) {
      setJson({ ok: true, sent: 0, errors: 0, month, note: 'no subscribers' });
      return;
    }

    let sent = 0;
    let errors = 0;

    for (let i = 0; i < emails.length; i += CONCURRENCY) {
      const batch = emails.slice(i, i + CONCURRENCY);
      const results = await Promise.allSettled(
        batch.map(async (rawEmail) => {
          const email = normalizeEmail(rawEmail);
          const r = await sendFounderLetterEmail(resendApiKey, { toEmail: email });
          return r.ok;
        })
      );
      for (const result of results) {
        if (result.status === 'rejected') errors++;
        else if (result.value) sent++;
        else errors++;
      }
    }

    // Dedupe only on a fully clean run.
    if (errors === 0) {
      await redis.set(dedupe, '1', { ex: DEDUPE_TTL });
    }

    setJson({ ok: true, sent, errors, month });
  } catch (e) {
    Sentry.captureException(e);
    console.error('[FounderLetter] run failed:', e);
    res.statusCode = 500;
    res.end('Founder letter run failed');
  }
}