export const SENDER_EMAIL = 'yellowgreenlabs@proton.me';
export const SENDER_NAME = 'Wibe Stories';

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const EMAIL_TIMEOUT_MS = 8000;
const IMG_BASE = 'https://wibestories.vercel.app/assets/occasions/';

const MOVABLE_DATES = {
  "lunar-new-year":     { "2026": "2026-02-17", "2027": "2027-02-06", "2028": "2028-01-26", "2029": "2029-02-13", "2030": "2030-02-03" },
  "easter":             { "2026": "2026-04-05", "2027": "2027-03-28", "2028": "2028-04-16", "2029": "2029-04-01", "2030": "2030-04-21" },
  "holi":               { "2026": "2026-03-04", "2027": "2027-03-22", "2028": "2028-03-11", "2029": "2029-03-29", "2030": "2030-03-19" },
  "vesak":              { "2026": "2026-05-01", "2027": "2027-05-21", "2028": "2028-05-08", "2029": "2029-05-28", "2030": "2030-05-17" },
  "dragon-boat-festival": { "2026": "2026-06-19", "2027": "2027-06-09", "2028": "2028-05-28", "2029": "2029-06-16", "2030": "2030-06-05" },
  "carnival":           { "2026": "2026-02-17", "2027": "2027-02-09", "2028": "2028-02-29", "2029": "2029-02-13", "2030": "2030-03-05" },
  "ganesh-chaturthi":   { "2026": "2026-09-10", "2027": "2027-08-29", "2028": "2028-09-16", "2029": "2029-09-05", "2030": "2030-08-26" },
  "navratri":           { "2026": "2026-09-28", "2027": "2027-09-16", "2028": "2028-10-04", "2029": "2029-09-23", "2030": "2030-10-13" },
  "dussehra":           { "2026": "2026-10-07", "2027": "2027-09-25", "2028": "2028-10-13", "2029": "2029-10-02", "2030": "2030-10-22" },
  "diwali":             { "2026": "2026-10-30", "2027": "2027-10-20", "2028": "2028-11-07", "2029": "2029-10-27", "2030": "2030-11-16" },
  "ramadan":            { "2026": "2026-02-18", "2027": "2027-02-08", "2028": "2028-01-28", "2029": "2029-01-16", "2030": "2030-01-06" },
  "eid-al-fitr":        { "2026": "2026-03-20", "2027": "2027-03-10", "2028": "2028-02-28", "2029": "2029-02-17", "2030": "2030-02-07" }
};

const OCCASIONS = [
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
  { id: 'peace-day',          month: 9,  day: 21,   name: 'International Day of Peace',   dateLabel: 'September 21',     greeting: 'The world is brighter when we choose kindness.',              img: IMG_BASE + 'peace-day.png' },
  { id: 'ganesh-chaturthi',   type: 'movable',      name: 'Ganesh Chaturthi',             dateLabel: 'August/September', greeting: 'May wisdom and prosperity find their way to you.',            img: IMG_BASE + 'ganesh-chaturthi.png' },
  { id: 'navratri',           type: 'movable',      name: 'Navratri',                     dateLabel: 'September/October', greeting: 'Nine nights of strength, devotion, and celebration.',         img: IMG_BASE + 'navratri.png' },
  { id: 'dussehra',           type: 'movable',      name: 'Dussehra',                     dateLabel: 'October',          greeting: 'Good triumphs over evil. Celebrate the light within.',         img: IMG_BASE + 'dussehra.png' },
  { id: 'diwali',             type: 'movable',      name: 'Diwali',                       dateLabel: 'October/November', greeting: 'Light a lamp, share a smile, spread the joy.',                img: IMG_BASE + 'diwali.png' },
  { id: 'halloween',          month: 10, day: 31,   name: 'Halloween',                    dateLabel: 'October 31',       greeting: 'Something fun for the season.',                               img: IMG_BASE + 'halloween.png' },
  { id: 'childrens-day',      month: 11, day: 20,   name: "Universal Children's Day",      dateLabel: 'November 20',      greeting: 'Every child deserves to feel special.',                       img: IMG_BASE + 'childrensday.png' },
  { id: 'thanksgiving',       type: 'floating',     month: 11, day: null, name: 'Thanksgiving', dateLabel: 'Fourth Thursday of November', greeting: 'Gratitude turns what we have into enough.',                 img: IMG_BASE + 'thanksgiving.png' },
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

export function buildHtmlBody(occasion, email) {
  const enc = email ? btoa(email) : '';
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${occasion.name} from Wibe Stories</title>
</head>
<body style="margin:0;padding:0;background-color:#ffffeb;font-family:Inter,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffeb;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="540" cellpadding="0" cellspacing="0" style="background-color:#ffffeb;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(26,26,26,0.08);border:1px solid #e0dcd0;">
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a1a,#2a2a2a);padding:40px 32px 24px;text-align:center;">
              <img src="${occasion.img}" alt=""
                style="display:block;margin:0 auto 0;width:130px;height:130px;object-fit:cover;pointer-events:none;-webkit-user-drag:none;user-select:none;" draggable="false" />
              <h1 style="color:#ffffeb;font-size:26px;margin:0 0 4px;font-weight:700;font-family:'Instrument Serif',Georgia,'Times New Roman',serif;">${occasion.name}</h1>
              <p style="color:#a0a090;font-size:13px;margin:0;font-family:Inter,sans-serif;">${occasion.dateLabel}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 32px 24px;">
              <p style="font-size:12.5px;line-height:1.7;color:#1a1a1a;margin:0 0 6px;font-family:Inter,sans-serif;">
                Good day.
              </p>
              <p style="font-size:12.5px;line-height:1.7;color:#1a1a1a;margin:0 0 16px;font-family:Inter,sans-serif;">
                It's <strong style="font-weight:700;">${occasion.name}</strong>, a good time to share what's on your mind.
              </p>
              <p style="font-size:18px;line-height:1.6;color:#1a1a1a;margin:0 0 16px;font-family:'Instrument Serif',Georgia,'Times New Roman',serif;font-style:italic;text-align:center;">
                ${occasion.greeting}
              </p>
              <p style="font-size:12.5px;line-height:1.7;color:#1a1a1a;margin:0 0 24px;font-family:Inter,sans-serif;">
                Make this ${occasion.name} truly yours. Open Wibe Stories, speak from the heart, and share a card that sounds like you. It only takes a moment.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 6px;">
                <tr>
                  <td style="background-color:#f59e0b;border-radius:8px;text-align:center;">
                    <a href="https://wibestories.vercel.app" target="_blank"
                       style="display:inline-block;padding:14px 36px;font-size:14px;
                              color:#1a1a1a;text-decoration:none;font-family:Inter,sans-serif;font-weight:700;box-shadow:0 2px 6px rgba(245,158,11,0.25);">
                      Create Your Card →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="font-size:10px;line-height:1.7;color:#77776a;margin:0 0 28px;text-align:center;font-family:Inter,sans-serif;">
                Unlock unlimited rewrites, custom colors, and more.
                <a href="https://wibestories.vercel.app/?showPricing" target="_blank"
                   style="color:#f59e0b;text-decoration:underline;font-weight:700;">See plans</a>
              </p>
              <img src="https://wibestories.vercel.app/assets/occasion-cards-animation.gif" alt="Sample Wibe Stories cards"
                style="display:block;margin:0 auto;max-width:100%;width:600px;" />
              <p style="font-size:12.5px;line-height:1.7;color:#1a1a1a;margin:24px 0 0;font-family:Inter,sans-serif;">
                Thank you for trusting Wibe Stories with your stories and messages. We hope every story you create helps you stay a little closer to the people who matter most. Thank you for letting us be part of those moments.
              </p>
              <p style="font-size:12.5px;line-height:1.7;color:#1a1a1a;margin:24px 0 0;font-family:Inter,sans-serif;">
                With appreciation,
              </p>
              <p style="font-size:12.5px;line-height:1.7;color:#1a1a1a;margin:0;font-family:Inter,sans-serif;">
                The Wibe Stories Team
              </p>
            </td>
          </tr>
          <tr>
            <td style="border-top:1px solid #e8e4db;padding:16px 32px;background-color:#ffffeb;">
              <p style="font-size:12px;color:#77776a;margin:0;text-align:center;font-family:Inter,sans-serif;">
                speak &middot; scribe &middot; share &#x1F49B; <a href="https://wibestories.vercel.app" style="color:#f59e0b;text-decoration:underline;font-weight:700;">Wibe Stories</a>
              </p>
              <p style="font-size:11px;color:#a0a090;margin:8px 0 0;text-align:center;font-family:Inter,sans-serif;">
                You're receiving this because you subscribed to Wibe Stories occasion reminders.
              </p>
              <p style="font-size:11px;margin:10px 0 0;text-align:center;font-family:Inter,sans-serif;">
                <a href="https://wibestories.vercel.app/api/unsubscribe-occasion?e=${enc}" style="color:#a0a090;text-decoration:underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendOccasionEmail(brevoApiKey, email, occasion) {
  const subject = buildSubject(occasion);
  const htmlContent = buildHtmlBody(occasion, email);
  const payload = {
    sender: { email: SENDER_EMAIL, name: SENDER_NAME },
    to: [{ email, name: '' }],
    subject,
    htmlContent,
  };
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), EMAIL_TIMEOUT_MS);
  try {
    const res = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'api-key': brevoApiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return res.ok;
  } catch (err) {
    clearTimeout(timeoutId);
    console.error(`[OccasionEmail] Failed for ${email}:`, err.message);
    return false;
  }
}
