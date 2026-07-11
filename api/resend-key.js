export const config = { runtime: 'edge' };

import { getRedis, KEYS } from '../lib/redis.js';

const RESEND_API_URL = 'https://api.resend.com/emails';
const SENDER = 'Wibe Stories <onboarding@resend.dev>';
const EMAIL_TIMEOUT_MS = 8000;
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_SEC = 3600; // 1 hour

function htmlEscape(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function sendProKeyEmail(resendApiKey, { toEmail, toName, proKey }) {
  const safeName = htmlEscape(toName);
  const safeKey = htmlEscape(proKey);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), EMAIL_TIMEOUT_MS);

  try {
    const res = await fetch(RESEND_API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: SENDER,
        to: [toEmail],
        subject: 'Here\'s your Pro key (resent) 🔑',
        html: `
          <div style="font-family:Inter,'Noto Sans',system-ui,sans-serif;max-width:480px;margin:0 auto">
            <div style="background:#ffffeb;border-radius:12px 12px 0 0;border-left:1px solid rgba(26,26,26,0.1);border-right:1px solid rgba(26,26,26,0.1);border-top:1px solid rgba(26,26,26,0.1);padding:28px 28px 20px;text-align:center">
              <img src="https://wibestories.vercel.app/assets/ws-logo-blwbg.png" alt="" style="height:28px;width:auto;display:block;margin:0 auto 8px" />
              <h1 style="margin:0;font-size:17px;font-weight:700;color:#1a1a1a;letter-spacing:-0.3px">Wibe Stories</h1>
              <p style="margin:4px 0 0;font-size:13px;color:#77776a">Turn your voice into shareable cards</p>
            </div>
            <div style="background:#ffffeb;padding:24px 28px 28px;border-left:1px solid rgba(26,26,26,0.1);border-right:1px solid rgba(26,26,26,0.1)">
              <p style="margin:0 0 10px;color:#1a1a1a;font-size:0.95rem;font-weight:600">Here\'s your Pro key, ${safeName}!</p>
              <p style="margin:0 0 24px;color:#555548;font-size:0.85rem;line-height:1.5">
                You requested a resend of your Pro key. Use it below to unlock unlimited access.
              </p>
              <div style="background:#f0f0df;border-radius:10px;padding:24px;text-align:center;margin-bottom:24px;border:1px solid rgba(26,26,26,0.08)">
                <p style="margin:0 0 12px;font-size:0.8rem;color:#77776a;text-transform:uppercase;letter-spacing:1.5px">Your Pro Key</p>
                <span style="font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:1.3rem;font-weight:800;letter-spacing:5px;color:#1a1a1a;background:#ffffeb;border:2px dashed rgba(26,26,26,0.15);border-radius:8px;padding:12px 20px;display:inline-block">${safeKey}</span>
              </div>
              <p style="margin:0 0 6px;font-size:0.8rem;color:#1a1a1a;font-weight:600">How to activate — two ways</p>
              <div style="background:#f0f0df;border-radius:8px;padding:14px 16px;margin-bottom:10px">
                <p style="margin:0 0 6px;font-size:0.75rem;color:#77776a;text-transform:uppercase;letter-spacing:1px;font-weight:600">Via the footer menu</p>
                <ol style="margin:0;padding-left:14px;font-size:0.78rem;color:#555548;line-height:1.7">
                  <li>Open <a href="https://wibestories.vercel.app" style="color:#d97706;font-weight:600">Wibe Stories</a></li>
                  <li>Tap the <span style="font-weight:600">?</span> icon in the footer, then tap <span style="font-weight:600">Pricing</span></li>
                  <li>Go to the <span style="font-weight:600">Activate Key</span> tab</li>
                  <li>Paste your Pro key and tap <span style="font-weight:600">Continue</span></li>
                </ol>
              </div>
              <div style="background:#f0f0df;border-radius:8px;padding:14px 16px;margin-bottom:20px">
                <p style="margin:0 0 6px;font-size:0.75rem;color:#77776a;text-transform:uppercase;letter-spacing:1px;font-weight:600">Or, via the Unlock button</p>
                <ol style="margin:0;padding-left:14px;font-size:0.78rem;color:#555548;line-height:1.7">
                  <li>Create a card or tap any example card</li>
                  <li>The <span style="font-weight:600">Unlock</span> button will appear above the card</li>
                  <li>Tap it, then go to the <span style="font-weight:600">Activate Key</span> tab</li>
                  <li>Paste your Pro key and tap <span style="font-weight:600">Continue</span></li>
                </ol>
              </div>
              <hr style="border:none;border-top:1px solid rgba(26,26,26,0.1);margin:0 0 16px" />
              <p style="margin:0;font-size:0.8rem;color:#77776a;line-height:1.5">
                Need help? We're here for you &mdash; reach out anytime at <a href="mailto:yellowgreenlabs@proton.me" style="color:#d97706;font-weight:600">yellowgreenlabs@proton.me</a>.
              </p>
            </div>
            <div style="background:#f0f0df;padding:16px 28px;text-align:center;border-radius:0 0 12px 12px;border:1px solid rgba(26,26,26,0.1);border-top:0">
              <p style="margin:0;font-size:0.7rem;color:#77776a;line-height:1.6">
                speak &middot; scribe &middot; share &#128155; <a href="https://wibestories.vercel.app" style="color:#d97706;text-decoration:none">Wibe Stories</a>
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

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const RESEND_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_KEY) {
    console.error('[ResendKey] Missing RESEND_API_KEY');
    return new Response(JSON.stringify({ error: 'Server configuration error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const redis = getRedis();

    // Rate limit: 3 resend attempts per email per hour
    try {
      const rlKey = `wispr:ratelimit:resend:${normalizedEmail}`;
      const count = await redis.incr(rlKey);
      if (count === 1) await redis.expire(rlKey, RATE_LIMIT_WINDOW_SEC);
      if (count > RATE_LIMIT_MAX) {
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } catch {
      // Fail open on rate limit
    }

    // Look up key by email
    const existingKey = await redis.get(KEYS.emailLookup(normalizedEmail));
    if (!existingKey) {
      // Don't reveal whether email is registered — return success anyway
      console.log('[ResendKey] No key found for email, returning success (no-op)');
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if key is revoked
    const raw = await redis.get(KEYS.upgradeKey(existingKey));
    if (raw) {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (parsed.revoked) {
        console.log('[ResendKey] Key is revoked, not resending');
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Resend the key
    const sent = await sendProKeyEmail(RESEND_KEY, {
      toEmail: normalizedEmail,
      toName: 'Supporter',
      proKey: existingKey,
    });

    if (!sent) {
      console.error('[ResendKey] Email send failed');
      return new Response(JSON.stringify({ error: 'Email delivery failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(`[ResendKey] Pro key resent to ${normalizedEmail}`);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('[ResendKey] Error:', e.message);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
