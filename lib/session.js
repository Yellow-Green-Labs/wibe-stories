import { KEYS } from './redis.js';
import { validateProKey } from './pro-key.js';

/**
 * Creates a session token for a validated Pro key.
 * Stores the token in Redis with TTL matching the key's expiry.
 * Returns the generated UUID token.
 */
export async function createSessionToken(redis, proKey, tier, expiresAt) {
  const token = crypto.randomUUID();
  const ttlSeconds = expiresAt
    ? Math.max(60, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
    : 30 * 24 * 60 * 60;
  await redis.set(KEYS.sessionToken(token), JSON.stringify({
    proKey: proKey.trim().toUpperCase(),
    tier: tier || 'pro',
    expiresAt: expiresAt || null,
  }), { ex: ttlSeconds });
  return token;
}

/**
 * Accepts either a raw Pro key or a session token.
 * - If it looks like a UUID, resolves via session token lookup.
 * - Otherwise, validates as a raw Pro key.
 *
 * Returns { valid, reason, keyData?, proKey? } where proKey is the resolved
 * raw key (only present when valid). vault endpoints need proKey for Neon queries.
 */
export async function resolveProKey(redis, value) {
  if (!value || typeof value !== 'string') {
    return { valid: false, reason: 'missing_key' };
  }

  const raw = value.trim();

  // Check if it's a session token (UUID format)
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(raw)) {
    try {
      const sessionData = await redis.get(KEYS.sessionToken(raw));
      if (!sessionData) return { valid: false, reason: 'invalid_session' };
      const data = typeof sessionData === 'string' ? JSON.parse(sessionData) : sessionData;
      if (data.expiresAt && Date.now() > new Date(data.expiresAt).getTime()) {
        return { valid: false, reason: 'expired' };
      }
      return {
        valid: true,
        keyData: { tier: data.tier, expiresAt: data.expiresAt },
        proKey: data.proKey,
      };
    } catch (e) {
      console.warn('[Session] Token lookup failed:', e.message);
      return { valid: false, reason: 'server_error' };
    }
  }

  // Treat as raw Pro key
  const result = await validateProKey(redis, raw);
  if (result.valid) {
    return { ...result, proKey: raw.trim().toUpperCase() };
  }
  return result;
}
