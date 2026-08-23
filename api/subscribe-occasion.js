export const config = { runtime: 'edge' };

import { getRedis, KEYS } from '../lib/redis.js';
import { ALLOWED_DOMAINS } from '../lib/allowed-emails.js';

const RATE_LIMIT = 3;
const RATE_WINDOW_SEC = 86400;

function getClientIp(req) {
  const cf = req.headers.get('cf-connecting-ip');
  if (cf) return cf;
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return 'unknown';
}

export default async function handler(req) {
  const allowedOrigins = ['https://wibestories.vercel.app', 'https://wisprstories.vercel.app'];
  const origin = req.headers.get('origin') || '';
  const corsOrigin = allowedOrigins.includes(origin) ? origin : 'https://wibestories.vercel.app';

  const headers = {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, error: 'Method not allowed' }), {
      status: 405,
      headers,
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), {
      status: 400,
      headers,
    });
  }

  const email = (body.email || '').toLowerCase().trim();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid email address' }), {
      status: 400,
      headers,
    });
  }

  const domain = email.split('@')[1];
  if (!ALLOWED_DOMAINS.has(domain)) {
    return new Response(JSON.stringify({ ok: false, error: 'This email provider is not supported. Use Gmail, Outlook, Yahoo, Proton, iCloud, or Tuta.' }), {
      status: 400,
      headers,
    });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const NAME_RE = /^[\p{L}\p{N} .'\-]+$/u;
  if (name.length > 60) {
    return new Response(JSON.stringify({ ok: false, error: 'Name is too long (max 60 characters).' }), {
      status: 400,
      headers,
    });
  }
  if (name && !NAME_RE.test(name)) {
    return new Response(JSON.stringify({ ok: false, error: 'Name contains invalid characters.' }), {
      status: 400,
      headers,
    });
  }

  const clientIp = getClientIp(req);
  const today = new Date().toISOString().slice(0, 10);
  const rateKey = 'wispr:sub-rate:' + clientIp + ':' + today;

  try {
    const redis = getRedis();

    const current = await redis.get(rateKey);
    const count = current ? parseInt(current, 10) : 0;
    if (count >= RATE_LIMIT) {
      return new Response(JSON.stringify({ ok: false, error: 'Too many requests. Try again tomorrow.' }), {
        status: 429,
        headers,
      });
    }

    if (count === 0) {
      await redis.set(rateKey, '1', { ex: RATE_WINDOW_SEC });
    } else {
      await redis.incr(rateKey);
    }

    await redis.sadd(KEYS.emailSubscribersSet, email);
    if (name) {
      await redis.set(KEYS.subscriberName(email), name, { ex: 31536000 });
    } else {
      await redis.del(KEYS.subscriberName(email));
    }
  } catch (err) {
    console.error('[SubscribeOccasion] Redis error:', err.message);
    return new Response(JSON.stringify({ ok: false, error: 'Server error' }), {
      status: 500,
      headers,
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers,
  });
}
