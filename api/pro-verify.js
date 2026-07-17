// Session token verification endpoint.
// Called on every page load to check Pro status.
// Accepts the session token from:
//   1. httpOnly cookie (ws_session) — primary, auto-sent by browser
//   2. X-Session-Token header — fallback for privacy extensions

export const config = { runtime: 'edge' };

import { getRedis, KEYS } from '../lib/redis.js';

const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_SEC = 60;

function getClientIP(req) {
  return (req.headers.get('x-forwarded-for') || '').split(',')[0].trim()
    || req.headers.get('x-real-ip')
    || 'unknown';
}

export default async function handler(req) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Read session token from cookie first
    const cookieHeader = req.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split(';').filter(Boolean).map(c => {
        const [k, ...v] = c.trim().split('=');
        return [k.trim(), v.join('=')];
      })
    );
    let sessionToken = cookies['ws_session'] || null;

    // Fallback: X-Session-Token header (for privacy extensions that block cookies)
    if (!sessionToken) {
      sessionToken = req.headers.get('x-session-token') || null;
    }

    // Fallback: JSON body (for programmatic calls like revalidateProKey)
    if (!sessionToken && req.method === 'POST') {
      try {
        const body = await req.json();
        sessionToken = body.sessionToken || null;
      } catch (_) {}
    }

    if (!sessionToken) {
      return new Response(JSON.stringify({ isPro: false, reason: 'no_session' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Rate limit: 30 verifications per IP per minute
    const ip = getClientIP(req);
    try {
      const redis = getRedis();
      const rlKey = `wispr:ratelimit:verify:${ip}`;
      const count = await redis.incr(rlKey);
      if (count === 1) await redis.expire(rlKey, RATE_LIMIT_WINDOW_SEC);
      if (count > RATE_LIMIT_MAX) {
        return new Response(JSON.stringify({ isPro: false, reason: 'rate_limited' }), {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } catch {
      // Fail open — never block on Redis hiccup
    }

    const redis = getRedis();
    const sessionData = await redis.get(KEYS.sessionToken(sessionToken));

    if (!sessionData) {
      return new Response(JSON.stringify({ isPro: false, reason: 'invalid_session' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = typeof sessionData === 'string' ? JSON.parse(sessionData) : sessionData;

    if (data.expiresAt && Date.now() > new Date(data.expiresAt).getTime()) {
      return new Response(JSON.stringify({ isPro: false, reason: 'expired' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const daysRemaining = data.expiresAt
      ? Math.max(0, Math.floor((new Date(data.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : null;

    return new Response(JSON.stringify({
      isPro: true,
      tier: data.tier || 'pro',
      expiresAt: data.expiresAt,
      daysRemaining,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('[ProVerify] Error:', e.message);
    return new Response(JSON.stringify({ isPro: false, reason: 'server_error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
