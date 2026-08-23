// lib/entitlement.js — purchase-based Pro entitlement checks

import { KEYS } from './redis.js';
import { validateProKey } from './pro-key.js';

/**
 * Returns the active Pro entitlement for an email, or null.
 *
 * Source of truth: the Pro key linked via emailLookup (written by the BMAC
 * webhook on purchase). A key is active when it exists, is not revoked, and
 * has not expired (annual keys carry expiresAt; monthly keys have none).
 *
 * Gift redemptions are anonymous (no email) and are excluded here by design —
 * they grant Pro through their own server session, which takes priority in
 * the frontend flow (pro-verify runs before the Clerk path).
 *
 * Returns { source: 'key', key, keyData } or null.
 */
export async function hasActiveProEntitlement(redis, email) {
  const normalized = (email || '').trim().toLowerCase();
  if (!normalized) return null;

  try {
    const key = await redis.get(KEYS.emailLookup(normalized));
    if (!key) return null;

    const result = await validateProKey(redis, key);
    if (!result.valid) return null;

    return { source: 'key', key, keyData: result.keyData };
  } catch (e) {
    console.warn('[Entitlement] Lookup failed:', e.message);
    return null;
  }
}