// Resend tracking webhook (email analytics).
// Receives Resend email lifecycle events (Svix-signed, see below) and stores
// them in Neon `email_events` so opens/clicks/complaints/bounces are
// queryable (stats page + deliverability checks are future consumers).
//
// Signature scheme (Resend uses Svix/Standard Webhooks):
//   headers: svix-id, svix-timestamp, svix-signature
//   signature = "v1," + base64(hmac_sha256(secret, "{id}.{timestamp}.{rawBody}"))
//   secret = RESEND_WEBHOOK_SECRET (whsec_... — strip prefix, base64-decode)
//   5-minute replay window; signature header may hold multiple space-separated
//   signatures (secret rotation) — accept any match, compare in constant time.
//   Raw body is required — never re-serialize parsed JSON.
//
// Events stored: email.sent, email.delivered, email.delivery_delayed,
// email.complained, email.bounced, email.opened, email.clicked (url column).
// Unknown event types are acknowledged but ignored. Any 5xx makes Resend retry.

export const config = { runtime: 'nodejs' };

import crypto from 'node:crypto';
import { getNeon } from '../../lib/neon.js';
import Sentry from '../../lib/sentry-node.js';

const SIGNATURE_TOLERANCE_S = 300;
const EVENT_WHITELIST = new Set([
  'email.sent',
  'email.delivered',
  'email.delivery_delayed',
  'email.complained',
  'email.bounced',
  'email.opened',
  'email.clicked',
]);

function verifySignature(rawBody, headers, secret) {
  const msgId = headers['svix-id'];
  const msgTimestamp = headers['svix-timestamp'];
  const msgSignature = headers['svix-signature'];
  if (!msgId || !msgTimestamp || !msgSignature) return false;

  const ts = parseInt(msgTimestamp, 10);
  if (!Number.isFinite(ts) || Math.abs(Math.floor(Date.now() / 1000) - ts) > SIGNATURE_TOLERANCE_S) {
    return false;
  }

  let secretBytes;
  try {
    const key = secret.startsWith('whsec_') ? secret.slice('whsec_'.length) : secret;
    secretBytes = Buffer.from(key, 'base64');
  } catch {
    return false;
  }

  const signedContent = `${msgId}.${msgTimestamp}.${rawBody}`;
  const expected = crypto.createHmac('sha256', secretBytes).update(signedContent).digest('base64');

  for (const part of String(msgSignature).split(' ')) {
    if (!part.startsWith('v1,')) continue;
    const provided = Buffer.from(part.slice(3), 'base64');
    if (provided.length === Buffer.byteLength(expected)) {
      try {
        if (crypto.timingSafeEqual(provided, Buffer.from(expected, 'base64'))) return true;
      } catch {
        // keep checking
      }
    }
  }
  return false;
}

function toAddress(to) {
  if (Array.isArray(to)) return to.join(',');
  return String(to == null ? '' : to);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end('Method not allowed');
    return;
  }

  try {
    const secret = process.env.RESEND_WEBHOOK_SECRET;
    if (!secret) {
      console.error('[ResendWebhook] RESEND_WEBHOOK_SECRET not set');
      res.statusCode = 503;
      res.end('Webhook not configured');
      return;
    }

    const rawBody = req.rawBody || (typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {}));
    if (!verifySignature(rawBody, req.headers, secret)) {
      console.error('[ResendWebhook] signature verification failed');
      res.statusCode = 400;
      res.end('Invalid signature');
      return;
    }

    let event;
    try {
      event = typeof req.body === 'object' ? req.body : JSON.parse(rawBody);
    } catch {
      res.statusCode = 400;
      res.end('Invalid payload');
      return;
    }

    const type = event.type;
    if (!EVENT_WHITELIST.has(type)) {
      res.statusCode = 200;
      res.end('ignored');
      return;
    }

    const data = event.data || {};
    const url =
      (data.url && String(data.url)) ||
      ((data.payload && data.payload.link) && String(data.payload.link)) ||
      '';

    const sql = getNeon();
    await sql`
      CREATE TABLE IF NOT EXISTS email_events (
        id BIGSERIAL PRIMARY KEY,
        message_id TEXT NOT NULL,
        email TEXT NOT NULL,
        event TEXT NOT NULL,
        url TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )`;
    await sql`CREATE INDEX IF NOT EXISTS idx_email_events_message ON email_events (message_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_email_events_event ON email_events (event)`;
    await sql`
      INSERT INTO email_events (message_id, email, event, url)
      VALUES (${String(data.email_id || '')}, ${toAddress(data.to)}, ${type}, ${url})`;

    res.statusCode = 200;
    res.end('ok');
  } catch (e) {
    Sentry.captureException(e);
    console.error('[ResendWebhook] processing failed:', e);
    res.statusCode = 500;
    res.end('Webhook processing failed');
  }
}