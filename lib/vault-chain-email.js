// Vault chain email templates (transactional, Resend).
// Three emails sent after a Pro membership's expiresAt passes, only when the
// user still has cards in their vault (see api/cron/vault-chain.js):
//   T+30  Vault Warning   — "your cards will be permanently deleted in 30 days"
//   T+60  Last Call       — "last call, cards disappear in 30 days"
//   T+90  Deleted Farewell — "your vault has been deleted"
// Style mirrors the cream transactional emails (pro welcome / key resend).
// No unsubscribe link: transactional emails must reach users regardless of
// marketing opt-out (data-safety). Footer carries the approved "Contact us" /
// "Help us improve" Tally links.

const RESEND_API_URL = 'https://api.resend.com/emails';
const SENDER = 'Wibe Stories <onboarding@resend.dev>';
const EMAIL_TIMEOUT_MS = 8000;

function htmlEscape(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function plural(count) {
  return count === 1 ? 'card' : 'cards';
}

function shell(inner, bottomLine) {
  return `
          <div style="font-family:Inter,'Noto Sans',system-ui,sans-serif;max-width:480px;margin:0 auto">
            <div style="background:#ffffeb;border-radius:12px 12px 0 0;border-left:1px solid rgba(26,26,26,0.1);border-right:1px solid rgba(26,26,26,0.1);border-top:1px solid rgba(26,26,26,0.1);padding:28px 28px 20px;text-align:center">
              <img src="https://wibestories.vercel.app/assets/brand/ws-logo-blwbg.png" alt="" style="height:28px;width:auto;display:block;margin:0 auto 8px" />
              <h1 style="margin:0;font-size:17px;font-weight:700;color:#1a1a1a;letter-spacing:-0.3px">Wibe Stories</h1>
              <p style="margin:4px 0 0;font-size:13px;color:#77776a">Turn your voice into shareable cards</p>
            </div>
            <div style="background:#ffffeb;padding:24px 28px 28px;border-left:1px solid rgba(26,26,26,0.1);border-right:1px solid rgba(26,26,26,0.1)">
              ${inner}
            </div>
            <div style="background:#f0f0df;padding:16px 28px;text-align:center;border-radius:0 0 12px 12px;border:1px solid rgba(26,26,26,0.1);border-top:0">
              <p style="margin:0;font-size:0.7rem;color:#77776a;line-height:1.6">
                ${bottomLine}
                <br>You are receiving this because you had an active Wibe Stories Pro membership.
              </p>
            </div>
          </div>
        `;
}

function footerLinks() {
  return `
              <hr style="border:none;border-top:1px solid rgba(26,26,26,0.1);margin:16px 0 0" />
              <p style="margin:12px 0 0;font-size:0.8rem;color:#77776a;line-height:1.5">
                We'd love to hear from you: <a href="https://tally.so/r/obaD1M" style="color:#d97706;font-weight:600">Contact us</a> &middot; <a href="https://tally.so/r/jaqlJ6" style="color:#d97706;font-weight:600">Help us improve</a>
              </p>`;
}

function ctaButton(href, label) {
  return `
              <div style="text-align:center;margin:24px 0 0">
                <a href="${href}" style="display:inline-block;background:#f59e0b;color:#1a1a1a;text-decoration:none;font-weight:700;font-size:0.9rem;border-radius:8px;padding:12px 28px;">${label}</a>
              </div>`;
}

// ── T+30: Vault Warning ──────────────────────────────────────────────────────
function buildVaultWarning({ name, count, endDate }) {
  return shell(`
              <p style="margin:0 0 10px;color:#1a1a1a;font-size:0.95rem;font-weight:600">Hi ${htmlEscape(name)},</p>
              <p style="margin:0 0 16px;color:#555548;font-size:0.85rem;line-height:1.5">
                Your Pro membership ended on ${htmlEscape(endDate)}. Your vault still holds ${count} ${plural(count)}, and they are safe for now.
              </p>
              <p style="margin:0 0 16px;color:#555548;font-size:0.85rem;line-height:1.5">
                If you don&rsquo;t renew, they will be <span style="font-weight:700;color:#1a1a1a">permanently deleted in 30 days</span>. Renew to keep them and your unlimited access.
              </p>
              ${ctaButton('https://wibestories.vercel.app/pricing', 'Renew Pro')}
              ${footerLinks()}
            `, 'Made with &#128155; by <a href="https://wibestories.vercel.app" style="color:#d97706;text-decoration:none">Wibe Stories</a>');
}

// ── T+60: Last Call ──────────────────────────────────────────────────────────
function buildLastCall({ name, count, endDate }) {
  return shell(`
              <p style="margin:0 0 10px;color:#1a1a1a;font-size:0.95rem;font-weight:600">Hi ${htmlEscape(name)},</p>
              <p style="margin:0 0 16px;color:#555548;font-size:0.85rem;line-height:1.5">
                Your Pro membership ended on ${htmlEscape(endDate)}, and this is your last call. Your vault&rsquo;s ${count} ${plural(count)} will be <span style="font-weight:700;color:#1a1a1a">permanently deleted in 30 days</span>.
              </p>
              <p style="margin:0 0 16px;color:#555548;font-size:0.85rem;line-height:1.5">
                Renew to save them. We&rsquo;d hate to see your words go.
              </p>
              ${ctaButton('https://wibestories.vercel.app/pricing', 'Renew Pro')}
              ${footerLinks()}
            `, 'Made with &#128155; by <a href="https://wibestories.vercel.app" style="color:#d97706;text-decoration:none">Wibe Stories</a>');
}

// ── T+90: Deleted Farewell ───────────────────────────────────────────────────
function buildFarewell({ name }) {
  return shell(`
              <p style="margin:0 0 10px;color:#1a1a1a;font-size:0.95rem;font-weight:600">Hi ${htmlEscape(name)},</p>
              <p style="margin:0 0 16px;color:#555548;font-size:0.85rem;line-height:1.5">
                As promised, your vault has now been permanently deleted.
              </p>
              <p style="margin:0 0 16px;color:#555548;font-size:0.85rem;line-height:1.5">
                Thank you for being part of Wibe Stories. Your words mattered, and you&rsquo;re always welcome back.
              </p>
              ${ctaButton('https://wibestories.vercel.app', 'Create a new card')}
              ${footerLinks()}
            `, 'Made with &#128155; by <a href="https://wibestories.vercel.app" style="color:#d97706;text-decoration:none">Wibe Stories</a>');
}

const SUBJECTS = {
  warning: 'Your vault cards will be deleted in 30 days',
  lastCall: 'Last call: your vault cards disappear in 30 days',
  farewell: 'Your vault has been deleted',
};

export async function sendVaultChainEmail(resendApiKey, { stage, toEmail, name, count, endDate }) {
  const safeName = name || 'there';
  const html =
    stage === 'warning' ? buildVaultWarning({ name: safeName, count, endDate })
    : stage === 'lastCall' ? buildLastCall({ name: safeName, count, endDate })
    : buildFarewell({ name: safeName });
  const subject = SUBJECTS[stage] || 'Wibe Stories';

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
      console.error(`[VaultChain] Resend error ${res.status} for ${toEmail}:`, errBody);
      return { ok: false, error: `Resend ${res.status}: ${errBody}` };
    }
    return { ok: true };
  } catch (e) {
    clearTimeout(timer);
    return { ok: false, error: (e && e.message) || 'unknown' };
  }
}