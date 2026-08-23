// lib/clerk.js — Clerk JWT verification (JWKS) and user lookup

import { createRemoteJWKSet, jwtVerify } from 'jose';
import { KEYS } from './redis.js';

// Caches
const EMAIL_CACHE_TTL = 60 * 60; // 1h — email lookup cache (failover resilience)
const USER_MAP_TTL = 7 * 24 * 60 * 60; // 7d — email -> userId link (read by BMAC webhook at purchase time)

// Module-level JWKS cache — Clerk keys rotate rarely, one fetch per warm instance
let jwks = null;
let jwksIssuer = null;

// Derive the Clerk instance frontend API base URL from the publishable key.
// Format: pk_{test|live}_<base64url("<instance>.clerk.accounts.dev$")>
// e.g. pk_test_aW1tdW5l...  ->  https://immune-sailfish-86.clerk.accounts.dev
export function getClerkInstanceUrl() {
  const pk = process.env.CLERK_PUBLISHABLE_KEY;
  if (!pk || !pk.startsWith('pk_')) return null;
  const raw = pk.replace(/^pk_[^_]+_/, '');
  try {
    // atob is a Web API — available in Edge runtime and Node 18+ (no Buffer dependency)
    const decoded = atob(raw.replace(/-/g, '+').replace(/_/g, '/'));
    const instance = decoded.replace(/\$$/, '');
    if (!instance.includes('.')) return null;
    return `https://${instance}`;
  } catch {
    return null;
  }
}

function getJwks(issuer) {
  if (jwks && jwksIssuer === issuer) return jwks;
  jwks = createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`));
  jwksIssuer = issuer;
  return jwks;
}

// Server-authoritative email lookup via the Clerk Backend API.
// The session JWT does NOT carry the user's email by default, so we resolve it here.
async function fetchClerkUserEmail(secretKey, userId) {
  const res = await fetch(`https://api.clerk.com/v1/users/${encodeURIComponent(userId)}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  if (!res.ok) return null;
  const user = await res.json();
  const emails = user.email_addresses || [];
  if (!emails.length) return null;
  const primary = emails.find((e) => e.id === user.primary_email_address_id);
  return (primary || emails[0]).email_address || null;
}

/**
 * Full Clerk session-token verification.
 *  1. Signature verified against the Clerk instance JWKS (RS256) — forged tokens rejected.
 *  2. `iss` must exactly match the instance derived from CLERK_PUBLISHABLE_KEY.
 *  3. `exp` enforced by jose.
 *  4. Email resolved server-side via the Clerk Backend API, cached in Redis (1h),
 *     and the email -> userId mapping written back for the BMAC webhook (7d).
 *
 * Fail-closed: any missing config, network error, or verification failure returns null.
 *
 * Returns { userId, email } or null.
 */
export async function verifyClerkToken(token, redis) {
  if (!token || typeof token !== 'string' || token.split('.').length !== 3) return null;

  const instanceUrl = getClerkInstanceUrl();
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!instanceUrl || !secretKey) {
    console.warn('[Clerk] CLERK_PUBLISHABLE_KEY or CLERK_SECRET_KEY missing — verification disabled');
    return null;
  }

  try {
    // Unverified peek to read the issuer before signature verification
    let peeked;
    try {
      const payloadPart = token.split('.')[1];
      peeked = JSON.parse(atob(payloadPart.replace(/-/g, '+').replace(/_/g, '/')));
    } catch {
      return null;
    }

    // Issuer must exactly match our Clerk instance — rejects cross-instance tokens
    if (!peeked.iss || peeked.iss !== instanceUrl) return null;

    // Full verification: signature (JWKS), exp, iss
    const { payload } = await jwtVerify(token, getJwks(instanceUrl), {
      issuer: instanceUrl,
      algorithms: ['RS256'],
    });

    const userId = payload.sub;
    if (!userId) return null;

    // Resolve email — cache first, then Clerk API
    let email = null;
    if (redis) {
      try {
        const cached = await redis.get(KEYS.clerkEmail(userId));
        if (cached) email = typeof cached === 'string' ? cached : cached.email;
      } catch (_) {}
    }

    if (!email) {
      email = await fetchClerkUserEmail(secretKey, userId);
      if (email && redis) {
        email = email.toLowerCase().trim();
        try {
          await redis.set(KEYS.clerkEmail(userId), email, { ex: EMAIL_CACHE_TTL });
          // Link email -> userId so the BMAC webhook can attach purchases at checkout
          await redis.set(KEYS.clerkUser(email), userId, { ex: USER_MAP_TTL });
        } catch (_) {}
      }
    }

    if (!email) return null; // fail closed — identity incomplete

    return { userId, email: email.toLowerCase().trim() };
  } catch (e) {
    console.warn('[Clerk] Token verification failed:', e.message);
    return null;
  }
}

// Get Clerk publishable key (for frontend)
export function getClerkPublishableKey() {
  return process.env.CLERK_PUBLISHABLE_KEY || null;
}

// Get Clerk secret key (for backend)
export function getClerkSecretKey() {
  return process.env.CLERK_SECRET_KEY || null;
}