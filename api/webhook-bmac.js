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
        subject: 'You\'re Pro now — here\'s your key 🎉',
        htmlContent: `
          <div style="font-family:Inter,'Noto Sans',system-ui,sans-serif;max-width:480px;margin:0 auto">
            <div style="background:#ffffeb;border-radius:12px 12px 0 0;border-left:1px solid rgba(26,26,26,0.1);border-right:1px solid rgba(26,26,26,0.1);border-top:1px solid rgba(26,26,26,0.1);padding:28px 28px 20px;text-align:center">
              <img src="https://wibestories.vercel.app/assets/ws-logo-blwbg.png" alt="" style="height:28px;width:auto;display:block;margin:0 auto 8px" />
              <h1 style="margin:0;font-size:17px;font-weight:700;color:#1a1a1a;letter-spacing:-0.3px">Wibe Stories</h1>
              <p style="margin:4px 0 0;font-size:13px;color:#77776a">Turn your voice into shareable cards</p>
            </div>
            <div style="background:#ffffeb;padding:24px 28px 28px;border-left:1px solid rgba(26,26,26,0.1);border-right:1px solid rgba(26,26,26,0.1)">
              <p style="margin:0 0 10px;color:#1a1a1a;font-size:0.95rem;font-weight:600">You are Pro now, ${safeName}! &#127881;</p>
              <p style="margin:0 0 24px;color:#555548;font-size:0.85rem;line-height:1.5">
                Thank you for supporting Wibe Stories! You now have unlimited access to higher recording limits, more tones, and everything we build next.
              </p>
              <div style="background:#f0f0df;border-radius:10px;padding:24px;text-align:center;margin-bottom:24px;border:1px solid rgba(26,26,26,0.08)">
                <p style="margin:0 0 12px;font-size:0.8rem;color:#77776a;text-transform:uppercase;letter-spacing:1.5px">Your Pro Key</p>
                <span style="font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:1.3rem;font-weight:800;letter-spacing:5px;color:#1a1a1a;background:#ffffeb;border:2px dashed rgba(26,26,26,0.15);border-radius:8px;padding:12px 20px;display:inline-block">${safeKey}</span>
              </div>
              <p style="margin:0 0 6px;font-size:0.8rem;color:#1a1a1a;font-weight:600">How to activate</p>
              <ol style="margin:0 0 20px;padding-left:16px;font-size:0.8rem;color:#555548;line-height:1.8">
                <li>Open <a href="https://wibestories.vercel.app" style="color:#d97706;font-weight:600">Wibe Stories</a> and create a card</li>
                <li>Tap the <span style="font-weight:600">Upgrade</span> button that appears, or tap <span style="font-weight:600">?</span> in the footer then <span style="font-weight:600">Support</span></li>
                <li>Paste your Pro key and tap <span style="font-weight:600">Activate</span></li>
              </ol>
              <p style="margin:0 0 20px;font-size:0.8rem;color:#77776a;line-height:1.5">
                &#128273; Lost your key? Open the upgrade modal and tap <span style="font-weight:600">"Get my key"</span> - we will resend it to this email.
              </p>
              <hr style="border:none;border-top:1px solid rgba(26,26,26,0.1);margin:0 0 16px" />
              <p style="margin:0;font-size:0.8rem;color:#77776a;line-height:1.5">
                Questions? <a href="mailto:yellowgreenlabs@proton.me" style="color:#d97706">yellowgreenlabs@proton.me</a>
              </p>
            </div>
            <div style="background:#f0f0df;padding:16px 28px;text-align:center;border-radius:0 0 12px 12px;border:1px solid rgba(26,26,26,0.1);border-top:0">
              <p style="margin:0;font-size:0.7rem;color:#77776a;line-height:1.6">
                Made with &#128155; by <a href="https://wibestories.vercel.app" style="color:#d97706;text-decoration:none">Wibe Stories</a>
                <br>You are receiving this because you purchased a Pro membership.
              </p>
            </div>
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

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response('Bad Request', { status: 400 });
  }

  const eventType = (req.headers.get('X-Bmc-Event') || '').trim();
  const data = payload.response || payload.data || {};

  console.log(`[BMAC] Event received: "${eventType}"`);

  // Skip test webhooks — signature is not required for test pings
  if (payload.live_mode === false || payload.test === true || (data.supporter_email || '').includes('test@buymeacoffee')) {
    console.log('[BMAC] Test event detected, skipping');
    return new Response('OK', { status: 200 });
  }

  const incomingSignature = req.headers.get('X-Bmc-Signature') || '';
  const signatureValid = await verifySignature(BMAC_SECRET, rawBody, incomingSignature);
  if (!signatureValid) {
    console.warn('[BMAC] Signature verification failed');
    return new Response('Unauthorized', { status: 401 });
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
  const isSupportCreated = ['support_created', 'Support created', 'recurring_donation.started'].includes(eventType);

  if (isSupportCreated) {
    // Idempotency: SET NX so duplicate webhook deliveries are no-ops
    const eventId = data.support_id || data.payment_id || data.id || `${email}:${data.support_created_on || data.started_at}`;
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
    'recurring_donation.cancelled',
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
  const isUpdated = ['support_updated', 'Support updated', 'recurring_donation.updated'].includes(eventType);

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
