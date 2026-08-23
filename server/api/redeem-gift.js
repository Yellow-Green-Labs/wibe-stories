export const config = { runtime: 'edge' };

import { getRedis } from '../../lib/redis.js';
import { validateGiftCode, claimGiftCode } from '../../lib/gift.js';
import { createSessionToken } from '../../lib/session.js';

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
    const { code } = await req.json();

    if (!code || typeof code !== 'string') {
      return new Response(JSON.stringify({ valid: false, reason: 'missing_code' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const redis = getRedis();

    // Rate limit: 10 attempts per IP per minute
    const ip = getClientIP(req);
    try {
      const rlKey = `wispr:ratelimit:redeem:${ip}`;
      const count = await redis.incr(rlKey);
      if (count === 1) await redis.expire(rlKey, RATE_LIMIT_WINDOW_SEC);
      if (count > RATE_LIMIT_MAX) {
        return new Response(JSON.stringify({ valid: false, reason: 'rate_limited' }), {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } catch {
      // Fail open
    }

    // Validate code
    const validation = await validateGiftCode(redis, code);
    if (!validation.valid) {
      return new Response(JSON.stringify({ valid: false, reason: validation.reason }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Claim code (atomic)
    const result = await claimGiftCode(redis, code);
    if (!result.success) {
      return new Response(JSON.stringify({ valid: false, reason: result.reason }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Mint a Pro session for the redeemer and return session token + expiry
    const giftData = result.giftData;
    const proAccessDays = giftData.proAccessDays || 60;
    const proExpiresAt = new Date(Date.now() + proAccessDays * 24 * 60 * 60 * 1000).toISOString();
    const sessionToken = await createSessionToken(redis, `gift:${code}`, 'pro', proExpiresAt, null, 'gift');
    const ttlSeconds = Math.max(60, Math.floor((new Date(proExpiresAt).getTime() - Date.now()) / 1000));
    const cookie = `ws_session=${sessionToken}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${ttlSeconds}`;

    // Success — return session + gift metadata
    return new Response(JSON.stringify({
      valid: true,
      sessionToken,
      expiresAt: proExpiresAt,
      durationDays: proAccessDays,
      giftData: {
        codeExpiresAt: result.giftData.codeExpiresAt,
        createdAt: result.giftData.createdAt,
      },
    }), {
      status: 200,
      headers: new Headers({
        'Content-Type': 'application/json',
        'Set-Cookie': cookie,
      }),
    });
  } catch (e) {
    console.error('[RedeemGift] Error:', e.message);
    return new Response(JSON.stringify({ valid: false, reason: 'server_error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
