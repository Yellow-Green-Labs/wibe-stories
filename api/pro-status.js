export const config = { runtime: 'edge' };

import { getRedis } from '../lib/redis.js';
import { validateProKey } from '../lib/pro-key.js';
import { createSessionToken } from '../lib/session.js';
import { verifyClerkToken } from '../lib/clerk.js';
import { hasActiveProEntitlement } from '../lib/entitlement.js';

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

    // Dev/test bypass — accept test key without Redis lookup
    if (key === 'WS-TEST-DEMO-KEY' && process.env.VERCEL_ENV === 'development') {
      console.warn('[ProStatus] Dev bypass activated — test key used');
      return new Response(JSON.stringify({ isPro: true, tier: 'pro' }), {
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

    // Check for Clerk session token in Authorization header
    const authHeader = req.headers.get('authorization') || '';
    const clerkToken = authHeader.replace('Bearer ', '');

    if (clerkToken && clerkToken.startsWith('ey')) {
      // Looks like a Clerk JWT
      const clerkUser = await verifyClerkToken(clerkToken, redis);
      if (clerkUser) {
        // Pro is granted ONLY to verified sign-ins whose email has an active purchase
        const entitlement = await hasActiveProEntitlement(redis, clerkUser.email);
        if (!entitlement) {
          return new Response(JSON.stringify({
            isPro: false,
            reason: 'no_entitlement',
            clerkUser: {
              userId: clerkUser.userId,
              email: clerkUser.email,
            },
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        // Entitled — create session (annual keys carry expiresAt, monthly keys run 30 days)
        const expiresAt = entitlement.keyData.expiresAt || null;
        const sessionToken = await createSessionToken(
          redis,
          `clerk:${clerkUser.userId}`,
          'pro',
          expiresAt,
          clerkUser.email,
          'clerk'
        );

        const ttlSeconds = expiresAt
          ? Math.max(60, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
          : 30 * 24 * 60 * 60;
        const cookie = `ws_session=${sessionToken}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${ttlSeconds}`;

        return new Response(JSON.stringify({
          isPro: true,
          tier: 'pro',
          sessionToken,
          expiresAt,
          clerkUser: {
            userId: clerkUser.userId,
            email: clerkUser.email,
          },
        }), {
          status: 200,
          headers: new Headers({
            'Content-Type': 'application/json',
            'Set-Cookie': cookie,
          }),
        });
      }
    }

    const result = await validateProKey(redis, key);

    if (!result.valid) {
      return new Response(JSON.stringify({ isPro: false, reason: result.reason }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create session token — raw key never stored in browser
    const tier = result.keyData.tier || 'pro';
    const expiresAt = result.keyData.expiresAt || null;
    const email = result.keyData.email || null;
    const membershipType = result.keyData.membershipType || null;
    const sessionToken = await createSessionToken(redis, key, tier, expiresAt, email, membershipType);

    // Set httpOnly cookie (primary auth — invisible to JS)
    const ttlSeconds = expiresAt
      ? Math.max(60, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
      : 30 * 24 * 60 * 60;
    const cookie = `ws_session=${sessionToken}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${ttlSeconds}`;

    const responseHeaders = new Headers({
      'Content-Type': 'application/json',
    });
    responseHeaders.append('Set-Cookie', cookie);

    return new Response(JSON.stringify({
      isPro: true,
      tier,
      sessionToken,
      expiresAt,
    }), {
      status: 200,
      headers: responseHeaders,
    });
  } catch (e) {
    console.error('[ProStatus] Error:', e.message);
    return new Response(JSON.stringify({ isPro: false, reason: 'server_error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
