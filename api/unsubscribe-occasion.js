export const config = { runtime: 'edge' };

import { getRedis, KEYS } from '../lib/redis.js';

const FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='0.9em' font-size='90'%3E%F0%9F%92%94%3C/text%3E%3C/svg%3E";

const UNSUB_GATE_TTL_SEC = 3600;

export default async function handler(req) {
  const url = new URL(req.url);
  const enc = url.searchParams.get('e') || '';

  if (!enc) {
    return respond(400, html('Missing unsubscribe token.'));
  }

  let email;
  try {
    email = base64ToUtf8(enc).toLowerCase().trim();
  } catch {
    return respond(400, html('Invalid unsubscribe token.'));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return respond(400, html('Invalid email address.'));
  }

  const redis = getRedis();
  try {
    if (req.method === 'POST') {
      const gate = await redis.getdel(KEYS.unsubGate(email));
      if (gate !== '1') {
        return respond(400, html('This unsubscribe link has already been processed.'));
      }
      await Promise.all([
        redis.sadd(KEYS.proEmailsSet, email),
        redis.sadd(KEYS.emailSubscribersSet, email),
      ]);
      await syncLoopsContact(email, true);
      return respond(200, html('undo'));
    }

    const [proRemoved, subRemoved] = await Promise.all([
      redis.srem(KEYS.proEmailsSet, email),
      redis.srem(KEYS.emailSubscribersSet, email),
    ]);
    if (proRemoved > 0 || subRemoved > 0) {
      await redis.set(KEYS.unsubGate(email), '1', { ex: UNSUB_GATE_TTL_SEC });
    }
    await syncLoopsContact(email, false);
    return respond(200, html('unsubscribed', enc));
  } catch (err) {
    console.error('[UnsubscribeOccasion] Redis error:', err.message);
    return respond(500, html('Something went wrong. Please try again.'));
  }
}

// Best-effort mirror of the un/subscription into Loops (marketing email platform).
// Never fails the request — Redis is the source of truth for our own sends.
// Unsubscribing sets subscribed:false (Loops then suppresses marketing sends);
// Undo re-subscribes and removes any suppression so the contact receives mail again.
async function syncLoopsContact(email, subscribed) {
  if (!process.env.LOOPS_API_KEY) return;
  try {
    await fetch('https://app.loops.so/api/v1/contacts/update', {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + process.env.LOOPS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, subscribed }),
    });
    if (subscribed) {
      await fetch(
        'https://app.loops.so/api/v1/contacts/suppression?email=' + encodeURIComponent(email),
        { method: 'DELETE', headers: { Authorization: 'Bearer ' + process.env.LOOPS_API_KEY } }
      );
    }
  } catch (err) {
    console.error('[UnsubscribeOccasion] Loops sync error:', err.message);
  }
}

function respond(status, body) {
  return new Response(body, {
    status,
    headers: { 'Content-Type': 'text/html;charset=utf-8' },
  });
}

function base64ToUtf8(str) {
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function html(state, enc) {
  const title =
    state === 'undo' ? 'Resubscribed' : state === 'unsubscribed' ? 'Unsubscribed' : 'Error';
  let msg;
  if (state === 'unsubscribed') {
    msg = `<p style="font-size:20px;margin:0 0 8px;">You have been unsubscribed.</p>
    <p style="font-size:14px;color:#77776a;margin:0;">You will no longer receive occasion reminder emails from Wibe Stories.</p>
    <form method="post" action="/unsubscribe?e=${encodeURIComponent(enc)}" style="margin:24px 0 0;">
      <button type="submit" style="background:#F59E0B;border:none;border-radius:8px;color:#1a1a1a;cursor:pointer;font-family:Inter,sans-serif;font-size:14px;font-weight:700;padding:12px 24px;">Undo - I changed my mind</button>
    </form>`;
  } else if (state === 'undo') {
    msg = `<p style="font-size:20px;margin:0 0 8px;">You're back on the list.</p>
    <p style="font-size:14px;color:#77776a;margin:0;">You will receive occasion reminder emails from Wibe Stories again.</p>`;
  } else {
    msg = `<p style="font-size:20px;margin:0 0 8px;">Something went wrong.</p>
    <p style="font-size:14px;color:#77776a;margin:0;">${state}</p>`;
  }
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${title} - Wibe Stories</title><link rel="icon" href="${FAVICON}"></head>
<body style="margin:0;padding:0;background-color:#ffffeb;font-family:Inter,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;">
  <div style="background:#ffffeb;border-radius:12px;padding:40px;text-align:center;border:1px solid #e0dcd0;box-shadow:0 2px 12px rgba(26,26,26,0.08);max-width:400px;">
    <p style="font-size:40px;margin:0 0 12px;">&#x1F494;</p>
    ${msg}
    <p style="margin:24px 0 0;"><a href="https://wibestories.vercel.app" style="color:#7c3aed;text-decoration:underline;font-size:14px;">Wibe Stories</a></p>
  </div>
</body>
</html>`;
}
