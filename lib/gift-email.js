// lib/gift-email.js — Gift code email templates (buyer receipt, resend)

const RESEND_API_URL = 'https://api.resend.com/emails';
const SENDER = 'Wibe Stories <onboarding@resend.dev>';
const EMAIL_TIMEOUT_MS = 8000;

function htmlEscape(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function maskCode(code) {
  // GIFT-ABCD-EFGH-2345 → GIFT-AB**-****-****
  const parts = code.split('-');
  if (parts.length !== 4) return code;
  return parts[0] + '-' + parts[1].slice(0, 2) + '**-****-****';
}

function buildGiftEmailHtml({ toName, codes, isResend }) {
  const safeName = htmlEscape(toName);
  const codeRows = codes.map(code => `
    <div style="background:#f0f0df;border-radius:8px;padding:16px;text-align:center;margin-bottom:8px;border:1px dashed rgba(26,26,26,0.15)">
      <span style="font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:1.1rem;font-weight:800;letter-spacing:3px;color:#1a1a1a">${htmlEscape(code)}</span>
    </div>
  `).join('');

  const subject = isResend
    ? 'Your Wibe Pass gift codes (resent) 🎁'
    : 'Your Wibe Pass gift codes 🎁';

  return `
    <div style="font-family:Inter,'Noto Sans',system-ui,sans-serif;max-width:480px;margin:0 auto">
      <div style="background:#ffffeb;border-radius:12px 12px 0 0;border-left:1px solid rgba(26,26,26,0.1);border-right:1px solid rgba(26,26,26,0.1);border-top:1px solid rgba(26,26,26,0.1);padding:28px 28px 20px;text-align:center">
        <img src="https://wibestories.vercel.app/assets/brand/ws-logo-blwbg.png" alt="" style="height:28px;width:auto;display:block;margin:0 auto 8px" />
        <h1 style="margin:0;font-size:17px;font-weight:700;color:#1a1a1a;letter-spacing:-0.3px">Wibe Stories</h1>
        <p style="margin:4px 0 0;font-size:13px;color:#77776a">Turn your voice into shareable cards</p>
      </div>
      <div style="background:#ffffeb;padding:24px 28px 28px;border-left:1px solid rgba(26,26,26,0.1);border-right:1px solid rgba(26,26,26,0.1)">
        <p style="margin:0 0 10px;color:#1a1a1a;font-size:0.95rem;font-weight:600">Here are your gift codes, ${safeName}! &#127873;</p>
        <p style="margin:0 0 24px;color:#555548;font-size:0.85rem;line-height:1.5">
          Share these codes with your friends. Each code gives 2 months of Pro access.
        </p>
        ${codeRows}
        <p style="margin:16px 0 0;color:#77776a;font-size:0.75rem;line-height:1.5">
          Each code is valid for 12 months from purchase. One-time use only.
        </p>
        <hr style="border:none;border-top:1px solid rgba(26,26,26,0.1);margin:20px 0 16px" />
        <p style="margin:0 0 6px;font-size:0.8rem;color:#1a1a1a;font-weight:600">How to share</p>
        <ol style="margin:0 0 20px;padding-left:16px;font-size:0.8rem;color:#555548;line-height:1.8">
          <li>Copy a code from this email</li>
          <li>Send it to your friend via WhatsApp, text, etc.</li>
          <li>They open <a href="https://wibestories.vercel.app" style="color:#d97706;font-weight:600">Wibe Stories</a> and click "Redeem gift code"</li>
          <li>They paste the code and click Redeem</li>
        </ol>
        <hr style="border:none;border-top:1px solid rgba(26,26,26,0.1);margin:0 0 16px" />
        <p style="margin:0;font-size:0.8rem;color:#77776a;line-height:1.5">
          Need help? Reach out anytime at <a href="mailto:yellowgreenlabs@proton.me" style="color:#d97706;font-weight:600">yellowgreenlabs@proton.me</a>.
        </p>
      </div>
      <div style="background:#f0f0df;padding:16px 28px;text-align:center;border-radius:0 0 12px 12px;border:1px solid rgba(26,26,26,0.1);border-top:0">
        <p style="margin:0;font-size:0.7rem;color:#77776a;line-height:1.6">
          Made with &#128155; by <a href="https://wibestories.vercel.app" style="color:#d97706;text-decoration:none">Wibe Stories</a>
          <br>You are receiving this because you purchased a gift card.
        </p>
      </div>
    </div>
  `;
}

// Send gift codes to buyer
export async function sendGiftCodesEmail(resendApiKey, { toEmail, toName, codes, isResend = false }) {
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
        subject: isResend
          ? 'Your Wibe Pass gift codes (resent) 🎁'
          : 'Your Wibe Pass gift codes 🎁',
        html: buildGiftEmailHtml({ toName, codes, isResend }),
      }),
    });
    clearTimeout(timer);
    return res.ok;
  } catch {
    clearTimeout(timer);
    return false;
  }
}
