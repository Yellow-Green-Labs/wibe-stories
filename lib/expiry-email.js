// Expiry marketing emails (marketing, Resend).
// Three reminders around Pro membership expiry, driven by api/cron/expiry-emails.js:
//   T-7  Expiry Warning      — "ends in 7 days"
//   T-1  Expiry Final Warning — "ends tomorrow"
//   T+7  Post-Expiry Nudge   — "ended; renew to keep your vault and unlimited access"
// Annual keys only (monthly keys have no expiresAt). Replaces the retired
// Loops expiry workflows (2026-08-17).

import { htmlEscape, ctaButton, marketingShell, sendMarketingEmail } from './marketing-email.js';

const SUBJECTS = {
  't-7': 'Your Pro membership ends in 7 days',
  't-1': 'Your Pro membership ends tomorrow',
  't+7': 'Your Pro membership has ended',
};

function build({ stage, name, endDate, unsubEmail }) {
  const body =
    stage === 't-7'
      ? `Your Pro membership ends on <span style="font-weight:700;color:#1a1a1a">${htmlEscape(endDate)}</span>. Renew to keep unlimited access and your vault.`
      : stage === 't-1'
      ? `Your Pro membership ends <span style="font-weight:700;color:#1a1a1a">tomorrow</span>. Renew now to keep unlimited access and your vault.`
      : `Your Pro membership ended on <span style="font-weight:700;color:#1a1a1a">${htmlEscape(endDate)}</span>. Renew to keep unlimited access, and your vault stays exactly as you left it.`;

  return marketingShell(`
              <p style="margin:0 0 10px;color:#1a1a1a;font-size:0.95rem;font-weight:600">Hi ${htmlEscape(name)},</p>
              <p style="margin:0 0 16px;color:#555548;font-size:0.85rem;line-height:1.5">${body}</p>
              <p style="margin:0 0 16px;color:#555548;font-size:0.85rem;line-height:1.5">
                Pro keeps your cards in the vault, unlimited creations, and every theme and tone.
              </p>
              ${ctaButton('https://wibestories.vercel.app/pricing', 'Renew Pro')}
            `, unsubEmail);
}

export async function sendExpiryEmail(resendApiKey, { stage, toEmail, name, endDate }) {
  if (!SUBJECTS[stage]) return { ok: false, error: `Unknown expiry stage: ${stage}` };
  const safeName = name || 'there';
  return sendMarketingEmail(resendApiKey, {
    toEmail,
    subject: SUBJECTS[stage],
    html: build({ stage, name: safeName, endDate, unsubEmail: toEmail }),
  });
}