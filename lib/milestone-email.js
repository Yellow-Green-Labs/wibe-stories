// Milestone Celebration email (marketing, Resend).
// Sent once per Pro key when the vault card count crosses a threshold
// (10/25/50/100/250/500) — see api/cron/milestones.js. Max one per 90 days.
// Replaces the retired Loops milestone workflow (2026-08-17).

import { htmlEscape, ctaButton, marketingShell, sendMarketingEmail } from './marketing-email.js';

export function milestoneSubject(count) {
  return `Milestone: ${count} cards on Wibe Stories`;
}

function build({ name, count, threshold, unsubEmail }) {
  return marketingShell(`
              <p style="margin:0 0 10px;color:#1a1a1a;font-size:0.95rem;font-weight:600">Hi ${htmlEscape(name)},</p>
              <p style="margin:0 0 16px;color:#555548;font-size:0.85rem;line-height:1.5">
                Congratulations, you just crossed a milestone: <span style="font-weight:700;color:#1a1a1a">${count} cards</span> created on Wibe Stories (the ${threshold}-card mark).
              </p>
              <p style="margin:0 0 16px;color:#555548;font-size:0.85rem;line-height:1.5">
                Each one started with your voice or your words. Keep them coming, and keep sharing your stories.
              </p>
              ${ctaButton('https://wibestories.vercel.app', 'Make your next card')}
            `, unsubEmail);
}

export async function sendMilestoneEmail(resendApiKey, { toEmail, name, count, threshold }) {
  const safeName = name || 'there';
  return sendMarketingEmail(resendApiKey, {
    toEmail,
    subject: milestoneSubject(count),
    html: build({ name: safeName, count, threshold, unsubEmail: toEmail }),
  });
}