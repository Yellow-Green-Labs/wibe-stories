const EMAIL_TIMEOUT_MS = 8000;
const IMG_BASE = 'https://wibestories.vercel.app/assets/occasions/';

// ImageKit (user media) — hosts the occasion illustration used as the hero
// background image in the email. Uploaded by scripts/upload-occasions-to-imagekit.mjs.
// (Exported so scripts/gen-occasion-preview.mjs embeds the live values.)
export const IMAGEKIT_BASE = 'https://ik.imagekit.io/wnwamgfimk';
export const ILLUSTRATION_TRANSFORM = 'tr=w-1024';

// Flag PNGs (96x72 source, displayed at 16x12) rendered from
// assets/flag-icons/flags/4x3/*.svg by scripts/gen-flag-pngs.mjs and
// uploaded to ImageKit /occasions/flags/.
export const FLAG_BASE = `${IMAGEKIT_BASE}/occasions/flags/`;

// The arched cream card PNG (480x330) with a transparent hollow arch cut into
// the top-center, so the hero illustration shows through the cutout. The card
// image is user-designed; the live reference is
// frontlogs/emails/Occasion-Email-NEW.html.
export const CARD_URL = `${IMAGEKIT_BASE}/occasions/email-card.png`;

// Pre-rendered Dela Gothic One headline images (960x240, shown at 480x120).
// Generated + uploaded by scripts/generate-occasion-headlines.mjs.
// Transform + cache-bust in one constant so the template, the upload verifier,
// and the smoke test can never drift apart. Bump `v=` whenever headline PNGs
// are re-uploaded (ImageKit's CDN caches the old rendering under the old URL).
export const HEADLINE_BASE = `${IMAGEKIT_BASE}/headlines/`;
export const HEADLINE_TRANSFORM = 'tr=w-960&v=3';

// Copy (3 lines + optional quote + flag countries) per occasion id.
// Generated from frontlogs/emails/occasion-copy.md — regenerate with
// node scripts/gen-occasion-copy.mjs, do not edit by hand.
import { OCCASION_COPY } from './occasion-copy-data.js';

const MOVABLE_DATES = {
  "lunar-new-year":     { "2026": "2026-02-17", "2027": "2027-02-06", "2028": "2028-01-26", "2029": "2029-02-13", "2030": "2030-02-03" },
  "easter":             { "2026": "2026-04-05", "2027": "2027-03-28", "2028": "2028-04-16", "2029": "2029-04-01", "2030": "2030-04-21" },
  "holi":               { "2026": "2026-03-04", "2027": "2027-03-22", "2028": "2028-03-11", "2029": "2029-03-29", "2030": "2030-03-19" },
  "vesak":              { "2026": "2026-05-01", "2027": "2027-05-21", "2028": "2028-05-08", "2029": "2029-05-28", "2030": "2030-05-17" },
  "dragon-boat-festival": { "2026": "2026-06-19", "2027": "2027-06-09", "2028": "2028-05-28", "2029": "2029-06-16", "2030": "2030-06-05" },
  "carnival":           { "2026": "2026-02-17", "2027": "2027-02-09", "2028": "2028-02-29", "2029": "2029-02-13", "2030": "2030-03-05" },
  "onam":               { "2026": "2026-08-26" },
  "raksha-bandhan":     { "2026": "2026-08-28" },
  "janmashtami":        { "2026": "2026-09-04" },
  "ganesh-chaturthi":   { "2026": "2026-09-14", "2027": "2027-08-29", "2028": "2028-09-16", "2029": "2029-09-05", "2030": "2030-08-26" },
  "navratri":           { "2026": "2026-10-11", "2027": "2027-09-16", "2028": "2028-10-04", "2029": "2029-09-23", "2030": "2030-10-13" },
  "dussehra":           { "2026": "2026-10-20", "2027": "2027-09-25", "2028": "2028-10-13", "2029": "2029-10-02", "2030": "2030-10-22" },
  "dhanteras":          { "2026": "2026-11-06" },
  "diwali":             { "2026": "2026-11-08", "2027": "2027-10-20", "2028": "2028-11-07", "2029": "2029-10-27", "2030": "2030-11-16" },
  "hanukkah":           { "2026": "2026-12-04" },
  "ramadan":            { "2026": "2026-02-18", "2027": "2027-02-08", "2028": "2028-01-28", "2029": "2029-01-16", "2030": "2030-01-06" },
  "eid-al-fitr":        { "2026": "2026-03-20", "2027": "2027-03-10", "2028": "2028-02-28", "2029": "2029-02-17", "2030": "2030-02-07" }
};

export const OCCASIONS = [
  { id: 'new-year',           month: 1,  day: 1,  name: "New Year's Day",               dateLabel: 'January 1',        greeting: 'A fresh start deserves the right words.',                    img: IMG_BASE + 'new-year.png' },
  { id: 'lunar-new-year',     type: 'movable',      name: 'Lunar New Year',              dateLabel: 'January/February', greeting: 'New beginnings and shared blessings.',                       img: IMG_BASE + 'chinese-new-year.png' },
  { id: 'valentines-day',     month: 2,  day: 14,   name: "Valentine's Day",             dateLabel: 'February 14',      greeting: 'Tell someone what they mean to you.',                        img: IMG_BASE + 'valentines-day.png' },
  { id: 'carnival',           type: 'movable',      name: 'Carnival',                    dateLabel: 'February/March',  greeting: 'Let the music, color, and joy fill your heart.',             img: IMG_BASE + 'rio-carnival.png' },
  { id: 'ramadan',            type: 'movable',      name: 'Ramadan',                     dateLabel: 'February/March',  greeting: 'A time for reflection, gratitude, and community.',           img: IMG_BASE + 'ramzan.png' },
  { id: 'womens-day',         month: 3,  day: 8,    name: "International Women's Day",   dateLabel: 'March 8',          greeting: 'Celebrate the women who shape your world.',                  img: IMG_BASE + 'womens-day.png' },
  { id: 'st-patricks-day',    month: 3,  day: 17,   name: "St. Patrick's Day",           dateLabel: 'March 17',         greeting: 'A little luck and a lot of heart.',                          img: IMG_BASE + 'st-patricks-day.png' },
  { id: 'nowruz',             month: 3,  day: 21,   name: 'Nowruz (Persian New Year)',   dateLabel: 'March 21',         greeting: 'Out with the old, in with a renewed spirit.',                img: IMG_BASE + 'nowruz.png' },
  { id: 'holi',               type: 'movable',      name: 'Holi',                        dateLabel: 'March',            greeting: 'Life is colorful. Celebrate it.',                             img: IMG_BASE + 'holi.png' },
  { id: 'april-fools-day',    month: 4,  day: 1,    name: "April Fools' Day",            dateLabel: 'April 1',          greeting: 'A little laughter goes a long way.',                         img: IMG_BASE + 'april-fools-day.png' },
  { id: 'songkran',           type: 'range', month: 4,  days: [13, 14, 15], name: 'Songkran (Thai New Year)', dateLabel: 'April 13-15',       greeting: 'Wash away the old and welcome a fresh start.',              img: IMG_BASE + 'songkran.png' },
  { id: 'easter',             type: 'movable',      name: 'Easter',                      dateLabel: 'March/April',      greeting: 'Renewal, hope, and new beginnings.',                         img: IMG_BASE + 'easter.png' },
  { id: 'eid-al-fitr',        type: 'movable',      name: 'Eid al-Fitr',                 dateLabel: 'March/April',      greeting: 'Joy, gratitude, and celebration with loved ones.',           img: IMG_BASE + 'eid.png' },
  { id: 'mothers-day',        type: 'floating',     month: 5,  day: null, name: "Mother's Day", dateLabel: 'Second Sunday of May',  greeting: 'A message only you can send.',                             img: IMG_BASE + 'mothers-day.png' },
  { id: 'day-of-families',    month: 5,  day: 15,   name: 'International Day of Families', dateLabel: 'May 15',       greeting: 'The greatest gift is the ones we love.',                     img: IMG_BASE + 'day-of-families.png' },
  { id: 'vesak',              type: 'movable',      name: 'Vesak (Buddha Purnima)',       dateLabel: 'April/May',        greeting: 'Peace, compassion, and the light of wisdom.',                img: IMG_BASE + 'buddhapurnima.png' },
  { id: 'dragon-boat-festival', type: 'movable',   name: 'Dragon Boat Festival',          dateLabel: 'May/June',         greeting: 'Health, harmony, and the spirit of teamwork.',               img: IMG_BASE + 'dragon-boat-festival.png' },
  { id: 'fathers-day',        type: 'floating',     month: 6,  day: null, name: "Father's Day", dateLabel: 'Third Sunday of June',  greeting: 'Say it in your own words.',                                img: IMG_BASE + 'fathers-day.png' },
  { id: 'grandparents-day',   type: 'floating',     month: 7,  day: null, name: "Grandparents Day", dateLabel: 'Fourth Sunday of July', greeting: 'Love and wisdom that spans generations.',                   img: IMG_BASE + 'grandparents-day.png' },
  { id: 'friendship-day',     type: 'floating',     month: 8,  day: null, name: 'Friendship Day', dateLabel: 'First Sunday of August', greeting: 'A quick message can mean the world.',                       img: IMG_BASE + 'friendship-day.png' },
  { id: 'independence-day',   month: 8,  day: 15,   name: 'Independence Day',             dateLabel: 'August 15',        greeting: 'Celebrate the spirit of freedom and unity.',                  img: IMG_BASE + 'independence-day.png' },
  { id: 'onam',               type: 'movable',      name: 'Onam',                        dateLabel: 'August',           greeting: 'Wishing you a harvest of joy and togetherness.',              img: IMG_BASE + 'onam.png' },
  { id: 'raksha-bandhan',     type: 'movable',      name: 'Raksha Bandhan',               dateLabel: 'August',           greeting: 'A bond of love and protection worth celebrating.',             img: IMG_BASE + 'raksha-bandhan.png' },
  { id: 'janmashtami',        type: 'movable',      name: 'Janmashtami',                  dateLabel: 'August/September', greeting: "May the joy of Krishna's birth fill your heart.",               img: IMG_BASE + 'janmashtami.png' },
  { id: 'teachers-day',       month: 9,  day: 5,    name: "Teacher's Day",                dateLabel: 'September 5',      greeting: 'Thank the teachers who shaped who you are today.',             img: IMG_BASE + 'teachers-day.png' },
  { id: 'peace-day',          month: 9,  day: 21,   name: 'International Day of Peace',   dateLabel: 'September 21',     greeting: 'The world is brighter when we choose kindness.',              img: IMG_BASE + 'peace-day.png' },
  { id: 'ganesh-chaturthi',   type: 'movable',      name: 'Ganesh Chaturthi',             dateLabel: 'August/September', greeting: 'May wisdom and prosperity find their way to you.',            img: IMG_BASE + 'ganesh-chaturthi.png' },
  { id: 'navratri',           type: 'movable',      name: 'Navratri',                     dateLabel: 'September/October', greeting: 'Nine nights of strength, devotion, and celebration.',         img: IMG_BASE + 'navratri.png' },
  { id: 'dussehra',           type: 'movable',      name: 'Dussehra',                     dateLabel: 'October',          greeting: 'Good triumphs over evil. Celebrate the light within.',         img: IMG_BASE + 'dussehra.png' },
  { id: 'dhanteras',          type: 'movable',      name: 'Dhanteras',                    dateLabel: 'November',         greeting: 'May prosperity and light find their way to your home.',        img: IMG_BASE + 'dhanteras.png' },
  { id: 'diwali',             type: 'movable',      name: 'Diwali',                       dateLabel: 'October/November', greeting: 'Light a lamp, share a smile, spread the joy.',                img: IMG_BASE + 'diwali.png' },
  { id: 'halloween',          month: 10, day: 31,   name: 'Halloween',                    dateLabel: 'October 31',       greeting: 'Something fun for the season.',                               img: IMG_BASE + 'halloween.png' },
  { id: 'childrens-day',      month: 11, day: 14,   name: "Children's Day",               dateLabel: 'November 14',      greeting: 'Every child deserves to feel special.',                       img: IMG_BASE + 'childrensday.png' },
  { id: 'thanksgiving',       type: 'floating',     month: 11, day: null, name: 'Thanksgiving', dateLabel: 'Fourth Thursday of November', greeting: 'Gratitude turns what we have into enough.',                 img: IMG_BASE + 'thanksgiving.png' },
  { id: 'hanukkah',           type: 'movable',      name: 'Hanukkah',                     dateLabel: 'December',         greeting: "May the menorah's light warm your home for eight nights.",     img: IMG_BASE + 'hanukkah.png' },
  { id: 'christmas',          month: 12, day: 25,   name: 'Christmas',                    dateLabel: 'December 25',      greeting: 'Whether near or far, your voice connects.',                   img: IMG_BASE + 'christmas.png' },
  { id: 'new-years-eve',      month: 12, day: 31,   name: "New Year's Eve",               dateLabel: 'December 31',      greeting: 'End the year with words that matter.',                        img: IMG_BASE + 'new-year.png' }
];

function nthWeekdayOfMonth(year, month, weekday, nth) {
  const first = new Date(year, month - 1, 1);
  const dayOfWeek = first.getDay();
  let diff = weekday - dayOfWeek;
  if (diff < 0) diff += 7;
  return 1 + diff + (nth - 1) * 7;
}

export function getOccasionForDate(date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();

  for (const oc of OCCASIONS) {
    if (oc.type === 'movable') {
      const md = MOVABLE_DATES[oc.id];
      const yStr = String(year);
      if (md && md[yStr]) {
        const dt = new Date(md[yStr] + 'T00:00:00Z');
        if (dt.getUTCMonth() + 1 === month && dt.getUTCDate() === day) return oc;
      }
    } else if (oc.type === 'range') {
      if (oc.month === month && oc.days.includes(day)) return oc;
    } else if (oc.type === 'floating') {
      let resolvedDay;
      switch (oc.id) {
        case 'mothers-day':      resolvedDay = nthWeekdayOfMonth(year, 5,  0, 2); break;
        case 'fathers-day':      resolvedDay = nthWeekdayOfMonth(year, 6,  0, 3); break;
        case 'grandparents-day': resolvedDay = nthWeekdayOfMonth(year, 7,  0, 4); break;
        case 'friendship-day':   resolvedDay = nthWeekdayOfMonth(year, 8,  0, 1); break;
        case 'thanksgiving':     resolvedDay = nthWeekdayOfMonth(year, 11, 4, 4); break;
      }
      if (oc.month === month && resolvedDay === day) return oc;
    } else {
      if (oc.month === month && oc.day === day) return oc;
    }
  }
  return null;
}

export function getOccasionById(id) {
  return OCCASIONS.find(o => o.id === id) || null;
}

export function getNextOccasion(fromDate) {
  const today = fromDate || new Date();
  for (let i = 1; i <= 365; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const oc = getOccasionForDate(date);
    if (oc) return oc;
  }
  return null;
}

export function buildSubject(occasion) {
  return `Happy ${occasion.name} from Wibe Stories!`;
}

export function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Centered Instrument Serif quote with a "— Author" attribution line.
// Empty when the occasion has no quote in OCCASION_COPY.
// (Exported so scripts/gen-occasion-preview.mjs can embed it for live previews.)
export function buildQuoteBlock(d) {
  if (!d.quote) return '';
  const quoteLines = escapeHtml(d.quote).split('\n').join('<br />');
  const author = d.quoteAuthor
    ? `<span style="display:block;margin-top:8px;font-size:13px;color:#77776a;">&mdash; ${escapeHtml(d.quoteAuthor)}</span>`
    : '';
  return `<p style="font-size:20px;line-height:1.6;color:#1a1a1a;margin:0 0 26px;text-align:center;font-style:italic;font-family:'Instrument Serif',Georgia,serif;">&ldquo;${quoteLines}&rdquo;${author}</p>`;
}

// Flags-only row inside the arched card: small flag PNGs with a caption line
// above ("These countries celebrate this occasion"). No country names, dots,
// or parentheticals — the full flag list renders (no 6-flag cap).
// No flags = no row. (Exported so scripts/gen-occasion-preview.mjs can embed
// it for live previews.)
export function buildFlagsRow(d) {
  if (!d.flags || !d.flags.length) return '';
  const imgs = d.flags
    .map(
      (code) =>
        `<img src="${FLAG_BASE}${code}.png" width="16" height="12" alt="" style="display:inline-block;width:16px;height:12px;vertical-align:middle;margin-right:4px;" />`
    )
    .join('');
  return `<div style="padding:10px 30px 0;text-align:center;font-family:'DM Sans',Arial,Helvetica,sans-serif;font-size:12px;color:#77776a;">These countries celebrate this occasion</div>
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" width="100%">
                    <tr>
                      <td align="center" style="padding:4px 30px;">${imgs}</td>
                    </tr>
                  </table>`;
}

export function buildHtmlBody(occasion, email, opts = {}) {
  const enc = email ? Buffer.from(email).toString('base64') : '';
  const illustrationUrl = `${IMAGEKIT_BASE}/occasions/${occasion.img.split('/').pop()}?${ILLUSTRATION_TRANSFORM}`;
  const unsubscribeUrl = enc
    ? `https://wibestories.vercel.app/unsubscribe?e=${encodeURIComponent(enc)}`
    : 'https://wibestories.vercel.app';
  const d = OCCASION_COPY[occasion.id] || { lines: [] };
  const name = opts.name ? escapeHtml(opts.name) : '';
  const greetingHtml = name
    ? `Good day, <strong style="font-weight:700;">${name}</strong>,`
    : 'Good day,';
  const copyHtml = d.lines
    .map((l, i) =>
      `<p style="font-size:16px;line-height:1.5;color:#1a1a1a;margin:0 0 ${i === d.lines.length - 1 ? '26px' : '18px'};">${escapeHtml(l)}</p>`
    )
    .join('\n');
  const quoteHtml = buildQuoteBlock(d);
  const flagsHtml = buildFlagsRow(d);
  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="format-detection" content="telephone=no,date=no,address=no,email=no" />
  <title>Happy ${occasion.name} from Wibe Stories</title>
  <!--[if gte mso 9]><xml>
    <o:OfficeDocumentSettings>
      <o:AllowPNG />
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
  </xml><![endif]-->
  <!-- Google Fonts - DM Sans for body copy (static weights, email-safe),
       Dela Gothic One kept for reference, Instrument Serif for the quote.
       Gmail/Outlook will not load these; fallback stacks are inline. -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&family=Dela+Gothic+One&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
  <style>
    body, table, td, p, a, li {
      -ms-text-size-adjust: 100%;
      -webkit-text-size-adjust: 100%;
    }
    body { margin: 0; padding: 0; background-color: #ffffeb; }
    table, td { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; display: block; max-width: 100%; }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#ffffeb;">
  <!--[if mso]><center><table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" width="600"><tr><td><![endif]-->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffeb;width:100%;">
    <tr>
      <td align="center" style="padding:16px 0 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;margin:0 auto;table-layout:fixed;">

          <!-- LOGO STRIP (dark) -->
          <tr>
            <td align="center" style="padding:20px 16px;background-color:#111111;">
              <img src="https://wibestories.vercel.app/assets/brand/ws-logo-blwbg.png" alt="Wibe Stories"
                   width="64" height="64"
                   style="display:block;height:64px;max-height:64px;width:auto;max-width:100%;" />
            </td>
          </tr>

          <!-- OCCASION CARD BLOCK - hero -->
          <tr>
            <td align="center" style="padding:0;background-color:#111111;">
              <!--[if gte mso 9]>
              <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:600px;height:400px;">
                <v:fill type="frame" src="${illustrationUrl}" color="#111111" />
                <v:textbox inset="0,0,0,0">
              <![endif]-->
              <div style="width:600px;max-width:100%;margin:0 auto;background-color:#111111;
                  background-image:url('${illustrationUrl}');
                  background-repeat:no-repeat;
                  background-position:center top;
                  background-size:300px auto;">
                <!-- SPACER KNOB: card vertical position = how much illustration shows through the arch.
                     Smaller height = card rises higher = MORE illustration visible through the arch.
                     Larger height = card drops lower = LESS illustration visible through the arch.
                     Illustration is 280px tall and the arch is ~65px deep; 200 keeps the arch fully
                     inside the illustration (no dark sliver at the arch bottom). Up to 215 is safe. -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="height:200px;line-height:170px;font-size:1px;">&nbsp;</td>
                  </tr>
                </table>

                <!-- ARCHED CARD — user-designed PNG (480x330) with a hollow arch cut into the top-center.
                     The arch is transparent in the image, so the hero illustration shows through the
                     cutout (no bgcolor here — a cream bg would fill the arch). Text below is HTML. -->
                <table role="presentation" align="center" width="480" cellpadding="0" cellspacing="0" border="0" style="max-width:100%;margin:0 auto;">
                  <tr>
                    <td align="center" height="330" background="${CARD_URL}" style="height:330px;background-image:url('${CARD_URL}');background-repeat:no-repeat;background-size:480px 330px;">

                      <!-- top spacer: clears the 65px arch (88 = arch depth + clearance) -->
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="height:88px;line-height:88px;font-size:1px;">&nbsp;</td>
                        </tr>
                      </table>

                      <!-- TAG PILL -->
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="border:1px solid #1a1a1a;padding:6px 20px;font-family:'DM Sans',Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:1px;font-weight:bold;color:#1a1a1a;">
                            OCCASION
                          </td>
                        </tr>
                      </table>

                      <div style="height:8px;line-height:8px;font-size:1px;">&nbsp;</div>

                      <!-- HEADLINE - pre-rendered Dela Gothic One image (960x240 source, shown 480x120) -->
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td align="center">
                            <img src="${HEADLINE_BASE}${occasion.id}.png?${HEADLINE_TRANSFORM}" alt="${escapeHtml(occasion.name)}"
                                 width="480" height="120"
                                 style="display:block;width:480px;max-width:100%;height:auto;margin:0 auto;" />
                          </td>
                        </tr>
                      </table>

                      ${flagsHtml}

                      <!-- bottom spacer -->
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="height:16px;line-height:16px;font-size:1px;">&nbsp;</td>
                        </tr>
                      </table>

                    </td>
                  </tr>
                </table>

              </div>
              <!--[if gte mso 9]>
                </v:textbox>
              </v:rect>
              <![endif]-->

              <!-- CTA BUTTON -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px auto 0;">
                <tr>
                  <td align="center" bgcolor="#f5a623" style="border-radius:4px;">
                    <a href="https://wibestories.vercel.app/" target="_blank" style="display:inline-block;padding:16px 60px;font-family:'DM Sans',Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;letter-spacing:0.5px;color:#1a1a1a;text-decoration:none;">
                      CREATE YOUR CARD
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- SEE PLANS STRIP (dark) -->
          <tr>
            <td align="center" style="background-color:#111111;padding:12px 24px 28px;">
              <span style="font-family:'DM Sans',Arial,Helvetica,sans-serif;font-size:12px;color:#8b8b76;">
                Unlock unlimited rewrites, custom colors, and more.
              </span>
              <a href="https://wibestories.vercel.app/?showPricing" target="_blank"
                 style="font-family:'DM Sans',Arial,Helvetica,sans-serif;font-size:12px;color:#f5a623;text-decoration:underline;font-weight:bold;">
                See plans
              </a>
            </td>
          </tr>

          <!-- BODY (cream) -->
          <tr>
            <td style="background-color:#ffffeb;padding:40px 36px 36px;font-family:'DM Sans',Arial,Helvetica,sans-serif;">
              <p style="font-size:16px;line-height:1.5;color:#1a1a1a;margin:0 0 4px;">${greetingHtml}</p>
${copyHtml}
${quoteHtml}
              <img src="https://wibestories.vercel.app/assets/brand/occasions-mail.gif" alt="Sample Wibe Stories cards"
                   width="440" height="330"
                   style="display:block;width:440px;max-width:440px;height:auto;margin:0 auto 26px;" />
              <p style="font-size:16px;line-height:1.5;color:#1a1a1a;margin:0 0 18px;">
                We&rsquo;re honored to be part of your stories and messages, and the moments you choose to share with Wibe Stories. We hope each story you create brings you closer to the people who matter most.
              </p>
              <p style="font-size:16px;line-height:1.5;color:#1a1a1a;margin:0 0 26px;">
                Thank you for letting us share these moments.
              </p>
              <p style="font-size:16px;line-height:1.5;color:#1a1a1a;margin:26px 0 0;">With appreciation,</p>
              <p style="font-size:16px;line-height:1.5;color:#1a1a1a;margin:0;font-weight:700;">The Wibe Stories Team</p>
            </td>
          </tr>

          <!-- FOOTER (dark) -->
          <tr>
            <td align="center" style="background-color:#111111;padding:28px 24px 24px;">
              <p style="font-family:'DM Sans',Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#8b8b76;margin:0;">Wibe Stories HQ, Worldwide</p>
              <div style="height:16px;line-height:16px;font-size:1px;">&nbsp;</div>
              <p style="font-family:'DM Sans',Arial,Helvetica,sans-serif;font-size:11px;line-height:1.6;color:#8b8b76;margin:0;">
                You&rsquo;re receiving this because you&rsquo;re subscribed to Wibe Stories occasion reminders.
              </p>
              <div style="height:16px;line-height:16px;font-size:1px;">&nbsp;</div>
              <p style="font-family:'DM Sans',Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#8b8b76;margin:0;">
                speak &middot; scribe &middot; share &#x1F49B;&nbsp;
                <a href="https://wibestories.vercel.app/" style="color:#f5a623;text-decoration:underline;font-weight:bold;">Wibe Stories</a>
              </p>
              <div style="height:16px;line-height:16px;font-size:1px;">&nbsp;</div>
              <p style="font-family:'DM Sans',Arial,Helvetica,sans-serif;font-size:11px;line-height:1.6;margin:0;">
                <a href="${unsubscribeUrl}" style="color:#8b8b76;text-decoration:underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
  <!--[if mso]></td></tr></table></center><![endif]-->
</body>
</html>`;
}

export async function sendOccasionEmail(resendApiKey, email, occasion, timeoutMs, opts) {
  const subject = buildSubject(occasion);
  const htmlContent = buildHtmlBody(occasion, email, opts || {});
  timeoutMs = timeoutMs || EMAIL_TIMEOUT_MS;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Wibe Stories <onboarding@resend.dev>',
        to: [email],
        subject,
        html: htmlContent,
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) {
      const errBody = await res.text();
      console.error(`[OccasionEmail] Resend error ${res.status} for ${email}:`, errBody);
      return { ok: false, error: `Resend ${res.status}: ${errBody}` };
    }
    return { ok: true };
  } catch (err) {
    console.error(`[OccasionEmail] Failed for ${email}:`, err.message);
    return { ok: false, error: err.message };
  }
}
