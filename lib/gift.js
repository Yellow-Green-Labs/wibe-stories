// lib/gift.js — Gift code generation, validation, redemption logic

import { getRedis, KEYS } from './redis.js';

// Key charset: 32 chars (no O, I, 0, 1 — avoids visual confusion)
// 256 / 32 = 8 exactly → no modulo bias
const KEY_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

// Gift Pro access duration in days (matches $11/2-month pricing)
export const GIFT_PRO_DAYS = 60;

// Generate gift code: GIFT-XXXX-XXXX-XXXX
export function generateGiftCode() {
  const bytes = new Uint8Array(12); // 3 groups × 4 chars
  crypto.getRandomValues(bytes);
  let code = 'GIFT';
  for (let g = 0; g < 3; g++) {
    code += '-';
    for (let i = 0; i < 4; i++) {
      code += KEY_CHARS[bytes[g * 4 + i] % 32];
    }
  }
  return code;
}

// Generate unique gift code with collision check (up to 3 attempts)
export async function generateUniqueGiftCode(redis) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const code = generateGiftCode();
    const existing = await redis.get(KEYS.giftCode(code));
    if (!existing) return code;
  }
  throw new Error('Gift code generation failed after 3 collision checks');
}

// Validate gift code (exists, unused, not expired)
export async function validateGiftCode(redis, code) {
  if (!code || typeof code !== 'string') {
    return { valid: false, reason: 'missing_code' };
  }

  const normalized = code.trim().toUpperCase();
  const data = await redis.get(KEYS.giftCode(normalized));

  if (!data) {
    return { valid: false, reason: 'invalid_code' };
  }

  const giftData = typeof data === 'string' ? JSON.parse(data) : data;

  if (giftData.state === 'used') {
    return { valid: false, reason: 'already_used' };
  }

  if (giftData.state === 'void') {
    return { valid: false, reason: 'voided' };
  }

  // Check expiry (12 months from purchase)
  if (giftData.codeExpiresAt && Date.now() > new Date(giftData.codeExpiresAt).getTime()) {
    return { valid: false, reason: 'expired' };
  }

  return { valid: true, giftData };
}

// Claim gift code (atomic: lock → verify → commit → unlock)
export async function claimGiftCode(redis, code, redeemedByEmail) {
  const normalized = code.trim().toUpperCase();

  // Acquire claim lock (prevents double-claim on race condition)
  const lockKey = KEYS.giftClaimLock(normalized);
  const lockAcquired = await redis.set(lockKey, '1', { nx: true, ex: 60 }); // 60s lock
  if (!lockAcquired) {
    return { success: false, reason: 'concurrent_claim' };
  }

  try {
    // Re-validate (state may have changed since lock acquisition)
    const validation = await validateGiftCode(redis, normalized);
    if (!validation.valid) {
      return { success: false, reason: validation.reason };
    }

    // Mark as used
    const giftData = validation.giftData;
    const updatedData = {
      ...giftData,
      state: 'used',
      redeemedAt: new Date().toISOString(),
      redeemedByEmail: redeemedByEmail || null,
    };

    await redis.set(KEYS.giftCode(normalized), JSON.stringify(updatedData));

    return {
      success: true,
      giftData: updatedData,
    };
  } finally {
    // Release lock
    await redis.del(lockKey);
  }
}

// Create gift codes for a purchase (one per quantity)
export async function createGiftCodes(redis, { buyerEmail, buyerName, paymentId, quantity }) {
  const codes = [];

  for (let i = 0; i < quantity; i++) {
    const code = await generateUniqueGiftCode(redis);
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(); // 12 months

    const giftData = {
      state: 'unused',
      buyerEmail,
      buyerName,
      paymentId,
      createdAt: now,
      codeExpiresAt: expiresAt,
      proAccessDays: GIFT_PRO_DAYS,
      quantityIndex: i + 1,
      totalQuantity: quantity,
    };

    await redis.set(KEYS.giftCode(code), JSON.stringify(giftData), { ex: 14 * 30 * 24 * 60 * 60 });
    await redis.sadd(KEYS.giftEmailSet(buyerEmail), code);
    await redis.sadd(KEYS.giftPaymentSet(paymentId), code);

    codes.push(code);
  }

  return codes;
}

// Void all unredeemed codes for a payment (on refund)
export async function voidGiftCodesByPayment(redis, paymentId) {
  const codes = await redis.smembers(KEYS.giftPaymentSet(paymentId));
  let voided = 0;

  for (const code of codes) {
    const data = await redis.get(KEYS.giftCode(code));
    if (!data) continue;

    const giftData = typeof data === 'string' ? JSON.parse(data) : data;
    if (giftData.state === 'unused') {
      await redis.set(KEYS.giftCode(code), JSON.stringify({
        ...giftData,
        state: 'void',
        voidedAt: new Date().toISOString(),
      }));
      voided++;
    }
  }

  return { voided, total: codes.length };
}

// Get gift codes by buyer email (for buyer view)
export async function getGiftCodesByEmail(redis, email) {
  const codes = await redis.smembers(KEYS.giftEmailSet(email));
  const results = [];

  for (const code of codes) {
    const data = await redis.get(KEYS.giftCode(code));
    if (!data) continue;

    const giftData = typeof data === 'string' ? JSON.parse(data) : data;
    results.push({
      code,
      state: giftData.state,
      codeExpiresAt: giftData.codeExpiresAt,
      createdAt: giftData.createdAt,
      redeemedAt: giftData.redeemedAt || null,
    });
  }

  return results;
}
