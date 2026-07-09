import { KEYS } from './redis.js';

/**
 * Central Pro key validator used by all API endpoints.
 * Checks: key exists, not revoked, not expired (annual keys).
 * Normalises input to uppercase so lowercase entry still works.
 *
 * Returns { valid: true, keyData } or { valid: false, reason }.
 * reason values: 'missing_key' | 'invalid_key' | 'revoked' | 'expired'
 */
export async function validateProKey(redis, rawKey) {
  if (!rawKey || typeof rawKey !== 'string') {
    return { valid: false, reason: 'missing_key' };
  }
  const key = rawKey.trim().toUpperCase();

  // Dev/test bypass — accept test key without Redis lookup
  if (key === 'WS-TEST-DEMO-KEY' && process.env.VERCEL_ENV !== 'production') {
    return { valid: true, keyData: { tier: 'pro', membershipType: 'dev' } };
  }

  // Admin bypass — treat admin API secret as a valid Pro key
  if (process.env.ADMIN_API_SECRET && key === process.env.ADMIN_API_SECRET.toUpperCase()) {
    return { valid: true, keyData: { tier: 'pro', membershipType: 'admin' } };
  }

  const data = await redis.get(KEYS.upgradeKey(key));
  if (!data) return { valid: false, reason: 'invalid_key' };
  const keyData = typeof data === 'string' ? JSON.parse(data) : data;
  if (keyData.revoked) return { valid: false, reason: 'revoked' };
  if (keyData.expiresAt && Date.now() > new Date(keyData.expiresAt).getTime()) {
    return { valid: false, reason: 'expired' };
  }
  return { valid: true, keyData };
}
