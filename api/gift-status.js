export const config = { runtime: 'edge' };

import { getRedis } from '../lib/redis.js';
import { getGiftCodesByEmail } from '../lib/gift.js';
import { sendGiftCodesEmail } from '../lib/gift-email.js';

const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_SEC = 3600; // 1 hour

function maskCode(code) {
  const parts = code.split('-');
  if (parts.length !== 4) return code;
  return parts[0] + '-' + parts[1].slice(0, 2) + '**-****-****';
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { email, action } = await req.json();

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ codes: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const redis = getRedis();

    // Rate limit: 3 attempts per email per hour
    try {
      const rlKey = `wispr:ratelimit:gift-status:${normalizedEmail}`;
      const count = await redis.incr(rlKey);
      if (count === 1) await redis.expire(rlKey, RATE_LIMIT_WINDOW_SEC);
      if (count > RATE_LIMIT_MAX) {
        return new Response(JSON.stringify({ codes: [], rateLimited: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } catch {
      // Fail open
    }

    // Get gift codes for this email
    const codes = await getGiftCodesByEmail(redis, normalizedEmail);

    // Mask codes for security (never return full codes in API response)
    const maskedCodes = codes.map(c => ({
      code: maskCode(c.code),
      state: c.state,
      codeExpiresAt: c.codeExpiresAt,
      createdAt: c.createdAt,
      redeemedAt: c.redeemedAt,
    }));

    // Handle resend action
    if (action === 'resend' && codes.length > 0) {
      const unusedCodes = codes.filter(c => c.state === 'unused');
      if (unusedCodes.length > 0) {
        const RESEND_KEY = process.env.RESEND_API_KEY;
        if (RESEND_KEY) {
          await sendGiftCodesEmail(RESEND_KEY, {
            toEmail: normalizedEmail,
            toName: 'Gift buyer',
            codes: unusedCodes.map(c => c.code),
            isResend: true,
          });
        }
      }
      return new Response(JSON.stringify({ codes: maskedCodes, resent: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ codes: maskedCodes }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('[GiftStatus] Error:', e.message);
    return new Response(JSON.stringify({ codes: [], error: 'server_error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
