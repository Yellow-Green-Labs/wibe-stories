// Shared marketing email shell + send helper (Resend).
// Marketing emails = the Loops-replacement program: Milestone Celebration,
// Founder Letter, Expiry T-7/T-1/T+7. Every marketing email must carry the
// /unsubscribe link (opt-out must work) plus the approved "Contact us" /
// "Help us improve" Tally links (decision #8).
// Style mirrors the cream transactional emails (pro welcome / key resend /
// vault chain) so all mail looks like one family.

const RESEND_API_URL = 'https://api.resend.com/emails';
const SENDER = 'Wibe Stories <onboarding@resend.dev>';
const EMAIL_TIMEOUT_MS = 8000;

export function htmlEscape(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// One-click unsubscribe link. Base64 is URL-encoded because raw base64 can
// contain + and / which URLSearchParams would mangle.
export function unsubHref(email) {
  return (
    'https://wibestories.vercel.app/unsubscribe?e=' +
    encodeURIComponent(Buffer.from(email).toString('base64'))
  );
}

export function ctaButton(href, label) {
  return `
              <div style="text-align:center;margin:24px 0 0">
                <a href="${href}" style="display:inline-block;background:#f59e0b;color:#1a1a1a;text-decoration:none;font-weight:700;font-size:0.9rem;border-radius:8px;padding:12px 28px;">${label}</a>
              </div>`;
}

function footerLinks() {
  return `
              <hr style="border:none;border-top:1px solid rgba(26,26,26,0.1);margin:16px 0 0" />
              <p style="margin:12px 0 0;font-size:0.8rem;color:#77776a;line-height:1.5">
                We'd love to hear from you: <a href="https://tally.so/r/obaD1M" style="color:#d97706;font-weight:600">Contact us</a> &middot; <a href="https://tally.so/r/jaqlJ6" style="color:#d97706;font-weight:600">Help us improve</a>
              </p>`;
}

export function marketingShell(inner, unsubEmail) {
  return `
          <div style="font-family:Inter,'Noto Sans',system-ui,sans-serif;max-width:480px;margin:0 auto">
            <div style="background:#ffffeb;border-radius:12px 12px 0 0;border-left:1px solid rgba(26,26,26,0.1);border-right:1px solid rgba(26,26,26,0.1);border-top:1px solid rgba(26,26,26,0.1);padding:28px 28px 20px;text-align:center">
              <img src="https://wibestories.vercel.app/assets/brand/ws-logo-blwbg.png" alt="" style="height:28px;width:auto;display:block;margin:0 auto 8px" />
              <h1 style="margin:0;font-size:17px;font-weight:700;color:#1a1a1a;letter-spacing:-0.3px">Wibe Stories</h1>
              <p style="margin:4px 0 0;font-size:13px;color:#77776a">Turn your voice into shareable cards</p>
            </div>
            <div style="background:#ffffeb;padding:24px 28px 28px;border-left:1px solid rgba(26,26,26,0.1);border-right:1px solid rgba(26,26,26,0.1)">
              ${inner}
              ${footerLinks()}
            </div>
            <div style="background:#f0f0df;padding:16px 28px;text-align:center;border-radius:0 0 12px 12px;border:1px solid rgba(26,26,26,0.1);border-top:0">
              <p style="margin:0;font-size:0.7rem;color:#77776a;line-height:1.6">
                You are receiving this because you subscribed to Wibe Stories updates.
                <br><a href="${unsubHref(unsubEmail)}" style="color:#d97706;font-weight:600">Unsubscribe</a>
              </p>
            </div>
          </div>
        `;
}

export async function sendMarketingEmail(resendApiKey, { toEmail, subject, html }) {
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
        subject,
        html,
      }),
    });
    clearTimeout(timer);
    if (!res.ok) {
      const errBody = await res.text();
      console.error(`[MarketingEmail] Resend error ${res.status} for ${toEmail}:`, errBody);
      return { ok: false, error: `Resend ${res.status}: ${errBody}` };
    }
    return { ok: true };
  } catch (e) {
    clearTimeout(timer);
    return { ok: false, error: (e && e.message) || 'unknown' };
  }
}