export const config = { runtime: 'edge' };

import { getRedis, KEYS } from '../lib/redis.js';

// ── Constants ──
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const SENDER_EMAIL = 'yellowgreenlabs@proton.me';
const SENDER_NAME = 'Wibe Stories';
const EMAIL_TIMEOUT_MS = 8000;

// Key charset: 32 chars (no O, I, 0, 1 — avoids visual confusion)
// 256 / 32 = 8 exactly → no modulo bias
const KEY_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

// ── Helpers ──

function htmlEscape(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Timing-safe HMAC-SHA256 signature verification using Web Crypto (Edge-compatible)
async function verifySignature(secret, rawBody, incomingSignature) {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(rawBody));
  const computed = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  const a = computed.toLowerCase();
  const b = incomingSignature.toLowerCase();
  if (a.length !== b.length) return false;

  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

// Crypto-random pro key: WS-XXXX-XXXX-XXXX
function generateProKey() {
  const bytes = new Uint8Array(12); // 3 groups × 4 chars
  crypto.getRandomValues(bytes);
  let key = 'WS';
  for (let g = 0; g < 3; g++) {
    key += '-';
    for (let i = 0; i < 4; i++) {
      key += KEY_CHARS[bytes[g * 4 + i] % 32];
    }
  }
  return key;
}

// Generate key with collision check (up to 3 attempts)
async function generateUniqueKey(redis) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const key = generateProKey();
    const existing = await redis.get(KEYS.upgradeKey(key));
    if (!existing) return key;
  }
  throw new Error('Pro key generation failed after 3 collision checks');
}

// Detect annual membership from BMAC level name (checks for "annual" or "year")
function isAnnualMembership(levelName) {
  const name = (levelName || '').toLowerCase();
  return name.includes('annual') || name.includes('year');
}

// Compute expiresAt for annual keys — 366 days to handle leap years safely
function annualExpiresAt(fromDateISO) {
  const d = new Date(fromDateISO);
  d.setDate(d.getDate() + 366);
  return d.toISOString();
}

// Send pro key email via Brevo with 8s timeout
async function sendProKeyEmail(brevoApiKey, { toEmail, toName, proKey }) {
  const safeName = htmlEscape(toName);
  const safeKey = htmlEscape(proKey);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), EMAIL_TIMEOUT_MS);

  try {
    const res = await fetch(BREVO_API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'api-key': brevoApiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        sender: { email: SENDER_EMAIL, name: SENDER_NAME },
        to: [{ email: toEmail, name: safeName }],
        subject: 'Your Wibe Stories Pro Key 🎉',
        htmlContent: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff">
            <h2 style="margin:0 0 8px;color:#1a1a1a;font-size:1.4rem">Thank you, ${safeName}! 🙏</h2>
            <p style="color:#444;margin:0 0 24px">Your support keeps Wibe Stories growing. Here's your Pro key:</p>
            <div style="background:#f4f4f4;border-radius:10px;padding:20px;text-align:center;margin-bottom:24px">
              <span style="font-family:monospace;font-size:1.5rem;font-weight:700;letter-spacing:3px;color:#222">${safeKey}</span>
            </div>
            <p style="color:#444;margin:0 0 12px"><strong>How to activate:</strong></p>
            <ol style="color:#444;padding-left:20px;margin:0 0 24px">
              <li style="margin-bottom:6px">Open <a href="https://wibestories.vercel.app" style="color:#6b6bff">Wibe Stories</a></li>
              <li style="margin-bottom:6px">Tap the ✨ or key icon in the app</li>
              <li>Enter your Pro key and tap <strong>Activate</strong></li>
            </ol>
            <p style="color:#888;font-size:0.8rem;margin:0">Save this email. If you lose your key, reply here and we'll resend it.</p>
          </div>
        `,
      }),
    });
    clearTimeout(timer);
    return res.ok;
  } catch {
    clearTimeout(timer);
    return false;
  }
}

// ── Handler ──

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const BMAC_SECRET = process.env.BMAC_WEBHOOK_SECRET;
  const BREVO_KEY = process.env.BREVO_API_KEY;
  if (!BMAC_SECRET || !BREVO_KEY) {
    console.error('[BMAC] Missing required env vars: BMAC_WEBHOOK_SECRET or BREVO_API_KEY');
    return new Response('Server configuration error', { status: 500 });
  }

  const rawBody = await req.text();

  const incomingSignature = req.headers.get('X-Bmc-Signature') || '';
  const signatureValid = await verifySignature(BMAC_SECRET, rawBody, incomingSignature);
  if (!signatureValid) {
    console.warn('[BMAC] Signature verification failed');
    return new Response('Unauthorized', { status: 401 });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response('Bad Request', { status: 400 });
  }

  const eventType = (req.headers.get('X-Bmc-Event') || '').trim();
  const data = payload.response || {};

  console.log(`[BMAC] Event received: "${eventType}"`);

  // Skip test webhooks
  if (payload.test === true || (data.supporter_email || '').includes('test@buymeacoffee')) {
    console.log('[BMAC] Test event detected, skipping');
    return new Response('OK', { status: 200 });
  }

  const email = (data.supporter_email || '').toLowerCase().trim();
  const supporterName = (data.supporter_name || data.payer_name || 'Supporter').trim();

  if (!email) {
    console.error('[BMAC] Missing supporter_email in payload');
    return new Response('Bad Request', { status: 400 });
  }

  const redis = getRedis();

  // ── One-time coffee purchase — no Pro key ────────────────────────────────────
  if (eventType === 'coffee_purchase') {
    console.log('[BMAC] One-time coffee purchase — no Pro key issued (membership required)');
    return new Response('OK', { status: 200 });
  }

  // ── Support Created (new membership) ────────────────────────────────────────
  const isSupportCreated = ['support_created', 'Support created'].includes(eventType);

  if (isSupportCreated) {
    // Idempotency: SET NX so duplicate webhook deliveries are no-ops
    const eventId = data.support_id || data.payment_id || `${email}:${data.support_created_on}`;
    const idempKey = `wispr:bmac-events:${eventId}`;
    const isNew = await redis.set(idempKey, '1', { nx: true, ex: 86400 });

    if (!isNew) {
      // Duplicate event delivery. However, if a previous attempt stored the key
      // but failed to send the email (returned 500), BMAC will retry with the same
      // event_id. Re-attempt the email so the supporter actually receives their key.
      const retryKey = await redis.get(KEYS.emailLookup(email));
      if (retryKey) {
        const retryRaw = await redis.get(KEYS.upgradeKey(retryKey));
        const retryParsed = retryRaw ? (typeof retryRaw === 'string' ? JSON.parse(retryRaw) : retryRaw) : null;
        if (retryParsed && !retryParsed.revoked) {
          const sent = await sendProKeyEmail(BREVO_KEY, { toEmail: email, toName: supporterName, proKey: retryKey });
          if (!sent) return new Response('Email delivery failed', { status: 500 });
          console.log('[BMAC] Duplicate event — resent key email on retry');
        }
      }
      return new Response('OK', { status: 200 });
    }

    const existingKey = await redis.get(KEYS.emailLookup(email));

    if (existingKey) {
      // Check if existing key is revoked — if so, generate a fresh key instead
      const existingData = await redis.get(KEYS.upgradeKey(existingKey));
      const parsed = existingData
        ? (typeof existingData === 'string' ? JSON.parse(existingData) : existingData)
        : null;

      if (!parsed || !parsed.revoked) {
        // Active key — just resend it
        const sent = await sendProKeyEmail(BREVO_KEY, { toEmail: email, toName: supporterName, proKey: existingKey });
        if (!sent) {
          console.error('[BMAC] Email resend failed for existing key');
          return new Response('Email delivery failed', { status: 500 }); // BMAC will retry
        }
        console.log('[BMAC] Existing supporter — resent key');
        return new Response('OK', { status: 200 });
      }
      // Revoked key — fall through to generate a fresh one
      console.log('[BMAC] Re-subscription after revocation — generating new key');
    }

    // Generate new key
    const proKey = await generateUniqueKey(redis);
    const purchasedAt = new Date().toISOString();
    const levelName = data.membership_level_name || '';
    const membershipType = isAnnualMembership(levelName) ? 'annual' : 'monthly';

    const keyData = {
      tier: 'pro',
      email,
      membershipType,
      purchasedAt,
      ...(membershipType === 'annual' ? { expiresAt: annualExpiresAt(purchasedAt) } : {}),
    };

    await redis.set(KEYS.upgradeKey(proKey), JSON.stringify(keyData));
    await redis.set(KEYS.emailLookup(email), proKey);

    const sent = await sendProKeyEmail(BREVO_KEY, { toEmail: email, toName: supporterName, proKey });
    if (!sent) {
      // Key is stored — but return 500 so BMAC retries and the email gets another chance
      console.error('[BMAC] Email delivery failed — key stored in Redis, triggering BMAC retry');
      return new Response('Email delivery failed', { status: 500 });
    }

    console.log(`[BMAC] Pro key granted (${membershipType}) and emailed successfully`);
    return new Response('OK', { status: 200 });
  }

  // ── Subscription Cancelled ───────────────────────────────────────────────────
  // Monthly → revoke immediately.
  // Annual → mark cancelled but keep expiresAt intact; access continues until year ends.
  const isCancelled = [
    'subscription_cancelled', 'Subscription cancelled',
    'support_cancelled', 'Support cancelled',
  ].includes(eventType);

  if (isCancelled) {
    const existingKey = await redis.get(KEYS.emailLookup(email));
    if (!existingKey) {
      console.log('[BMAC] Cancellation for unknown email, no-op');
      return new Response('OK', { status: 200 });
    }

    const raw = await redis.get(KEYS.upgradeKey(existingKey));
    if (!raw) {
      console.log('[BMAC] Cancellation — key not found in Redis, no-op');
      return new Response('OK', { status: 200 });
    }

    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;

    if (parsed.membershipType === 'annual') {
      // Honor the paid year — mark cancelled so no renewal key fires, but leave expiresAt intact
      await redis.set(
        KEYS.upgradeKey(existingKey),
        JSON.stringify({ ...parsed, cancelled: true, cancelledAt: new Date().toISOString() })
      );
      console.log('[BMAC] Annual membership cancelled — access continues until expiresAt');
    } else {
      // Monthly — revoke immediately
      await redis.set(
        KEYS.upgradeKey(existingKey),
        JSON.stringify({ ...parsed, revoked: true, revokedAt: new Date().toISOString() })
      );
      console.log('[BMAC] Monthly membership cancelled — access revoked immediately');
    }

    return new Response('OK', { status: 200 });
  }

  // ── Support Updated (membership level change) ────────────────────────────────
  // e.g. monthly → annual: set expiresAt. Annual → monthly: remove expiresAt.
  const isUpdated = ['support_updated', 'Support updated'].includes(eventType);

  if (isUpdated) {
    const existingKey = await redis.get(KEYS.emailLookup(email));
    if (!existingKey) {
      console.log('[BMAC] Update for unknown email, no-op');
      return new Response('OK', { status: 200 });
    }

    const raw = await redis.get(KEYS.upgradeKey(existingKey));
    if (!raw) return new Response('OK', { status: 200 });

    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const levelName = data.membership_level_name || '';
    const newMembershipType = isAnnualMembership(levelName) ? 'annual' : 'monthly';

    const updated = { ...parsed, membershipType: newMembershipType };

    if (newMembershipType === 'annual') {
      // Upgraded to annual — expiresAt runs from today
      updated.expiresAt = annualExpiresAt(new Date().toISOString());
    } else {
      // Downgraded to monthly — remove expiresAt; cancellation will revoke immediately
      delete updated.expiresAt;
    }

    await redis.set(KEYS.upgradeKey(existingKey), JSON.stringify(updated));
    console.log(`[BMAC] Membership updated to ${newMembershipType}`);
    return new Response('OK', { status: 200 });
  }

  // ── Support Refunded ─────────────────────────────────────────────────────────
  const isRefund = ['support_refunded', 'Support refunded', 'coffee_purchase_refunded'].includes(eventType);

  if (isRefund) {
    const existingKey = await redis.get(KEYS.emailLookup(email));
    if (!existingKey) {
      console.log('[BMAC] Refund for unknown email, no-op');
      return new Response('OK', { status: 200 });
    }

    const raw = await redis.get(KEYS.upgradeKey(existingKey));
    if (raw) {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      await redis.set(
        KEYS.upgradeKey(existingKey),
        JSON.stringify({ ...parsed, revoked: true, revokedAt: new Date().toISOString() })
      );
    }

    console.log('[BMAC] Pro key revoked due to refund');
    return new Response('OK', { status: 200 });
  }

  // ── Unhandled events ─────────────────────────────────────────────────────────
  console.log(`[BMAC] Unhandled event "${eventType}" — no-op`);
  return new Response('OK', { status: 200 });
}
