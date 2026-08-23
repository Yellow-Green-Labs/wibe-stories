// Founder Letter email (marketing, Resend).
// Monthly letter from the Wibe Stories team. Copy is the APPROVED text from
// frontlogs/emails/founder-letter.md (2026-08-16) — no em dashes, verbatim.
// Sent manually via api/send-founder-letter.js (once per calendar month).
// Replaces the retired Loops founder-letter workflow (2026-08-17).

import { ctaButton, marketingShell, sendMarketingEmail } from './marketing-email.js';

export const FOUNDER_SUBJECT = 'Why send a borrowed wish?';

function build(unsubEmail) {
  return marketingShell(`
              <p style="margin:0 0 16px;color:#555548;font-size:0.85rem;line-height:1.6">Hello, Wiber!</p>
              <p style="margin:0 0 16px;color:#555548;font-size:0.85rem;line-height:1.6">
                For ages, we've wished each other on voice calls and video calls, with greeting cards and holiday notes. It's how we stay close across cities, countries, and time zones.
              </p>
              <p style="margin:0 0 16px;color:#555548;font-size:0.85rem;line-height:1.6">
                But the wishes themselves? They're usually borrowed. A generic internet wish. A stock quote. A picture someone else took. Words written by someone else, for someone else.
              </p>
              <p style="margin:0 0 16px;color:#1a1a1a;font-size:0.9rem;font-weight:700;line-height:1.6">
                Your voice and your words are the one thing no one else can borrow.
              </p>
              <p style="margin:0 0 16px;color:#555548;font-size:0.85rem;line-height:1.6">
                That's what Wibe Stories is for: turn your voice into a shareable card, in your language, in seconds. Speak, and your own words become a beautiful card with a voice attached. Or type it, if you're shy with the mic. Add a photo, a theme, a tone. Send it anywhere.
              </p>
              <p style="margin:0 0 16px;color:#555548;font-size:0.85rem;line-height:1.6">
                Wispr Flow is the perfect tool to pair with it. You dictate, and Wispr does the messy work for you: punctuation, corrections, clean text. Your words, without the typos.
              </p>
              <p style="margin:0 0 16px;color:#555548;font-size:0.85rem;line-height:1.6">
                So the next time you want to wish someone, try it: not a borrowed wish, but yours. Record it, share it, and watch what a few seconds of your voice does to someone's day.
              </p>
              <p style="margin:0 0 4px;color:#555548;font-size:0.85rem;line-height:1.6">Warmly,<br>YGLabs</p>
              <p style="margin:0 0 16px;color:#77776a;font-size:0.8rem;line-height:1.6">P.S. Spoken, not typed. Thanks Wispr!</p>
              ${ctaButton('https://wibestories.vercel.app', 'Create a card')}
            `, unsubEmail);
}

export async function sendFounderLetterEmail(resendApiKey, { toEmail }) {
  return sendMarketingEmail(resendApiKey, {
    toEmail,
    subject: FOUNDER_SUBJECT,
    html: build(toEmail),
  });
}