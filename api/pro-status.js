export const config = { runtime: 'edge' };

import { getRedis } from '../lib/redis.js';
import { validateProKey } from '../lib/pro-key.js';

const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_SEC = 60;

function getClientIP(req) {
  return (req.headers.get('x-forwarded-for') || '').split(',')[0].trim()
    || req.headers.get('x-real-ip')
    || 'unknown';
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { key } = await req.json();

    if (!key) {
      return new Response(JSON.stringify({ isPro: false, reason: 'missing_key' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const redis = getRedis();

    // Rate limit: 10 activation attempts per IP per minute
    const ip = getClientIP(req);
    try {
      const rlKey = `wispr:ratelimit:keycheck:${ip}`;
      const count = await redis.incr(rlKey);
      if (count === 1) await redis.expire(rlKey, RATE_LIMIT_WINDOW_SEC);
      if (count > RATE_LIMIT_MAX) {
        return new Response(JSON.stringify({ isPro: false, reason: 'rate_limited' }), {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } catch {
      // Fail open on rate limit — never block a legitimate user due to Redis hiccup
    }

    const result = await validateProKey(redis, key);

    if (!result.valid) {
      return new Response(JSON.stringify({ isPro: false, reason: result.reason }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Never return PII — email and purchase date stay server-side only
    return new Response(JSON.stringify({
      isPro: true,
      tier: result.keyData.tier || 'pro',
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('[ProStatus] Error:', e.message);
    return new Response(JSON.stringify({ isPro: false, reason: 'server_error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
