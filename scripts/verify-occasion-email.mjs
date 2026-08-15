#!/usr/bin/env node
// Smoke test for the occasion-email template (lib/occasion-email.js).
//
// Usage:
//   node scripts/verify-occasion-email.mjs
//
// Exits 0 only if every assertion passes. Mirrors the design truth in
// frontlogs/emails/Occasion-Email-NEW.html and the copy data contract.

import { buildHtmlBody, buildSubject, escapeHtml, getOccasionById, HEADLINE_BASE, HEADLINE_TRANSFORM } from '../lib/occasion-email.js';
import { OCCASION_COPY } from '../lib/occasion-copy-data.js';

let failures = 0;
function check(cond, label) {
  if (cond) {
    console.log(`  [OK]   ${label}`);
  } else {
    failures++;
    console.error(`  [FAIL] ${label}`);
  }
}

const diwali = getOccasionById('diwali');
const peace = getOccasionById('peace-day');
const lunar = getOccasionById('lunar-new-year');
const testEmail = 'test@example.com';

// ── Plain render (no name) ──
const plain = buildHtmlBody(diwali, testEmail);
check(plain.includes('Good day,'), 'plain: greeting without name');
check(!plain.includes('<strong'), 'plain: no name strong');
check(plain.includes('background-color:#ffffeb'), 'plain: cream background #ffffeb');
check(plain.includes('background-size:300px auto'), 'plain: hero illustration 300px auto');
check(plain.includes('height:200px;line-height:170px'), 'plain: 200px knob spacer');
check(!plain.includes('background-size:600px auto'), 'plain: no legacy 600px illustration size');
check(plain.includes('tr=w-1024'), 'plain: illustration served at tr=w-1024');
check(!plain.includes('tr=w-600'), 'plain: no legacy tr=w-600');
check(HEADLINE_TRANSFORM === 'tr=w-960&v=3', 'plain: headline transform v=3 (cache-bust)');
check(plain.includes(`src="${HEADLINE_BASE}diwali.png?${HEADLINE_TRANSFORM}" alt="Diwali"`), 'plain: headline img with alt (shared fresh-cache URL)');
check(plain.includes('width="480" height="120"'), 'plain: headline img 480x120');
check((plain.match(/email-card\.png/g) || []).length === 2, 'plain: arched card PNG twice (background attr + bg-image)');
check(plain.includes('background-size:480px 330px'), 'plain: arched card sized 480x330');
check(!plain.includes('background-color:#ffffeb;border:2px solid #111111'), 'plain: no cream card border');
check(!plain.includes('border-radius:12px'), 'plain: no card radius (arched PNG)');
check(plain.includes('height:88px;line-height:88px'), 'plain: 88px arch-clear spacer');
check(plain.includes('height:8px;line-height:8px'), 'plain: 8px pill gap');
check(plain.includes('height:16px;line-height:16px'), 'plain: 16px bottom spacer');
check(/>\s*OCCASION\s*</.test(plain), 'plain: OCCASION pill');
check(!plain.includes('NEW OCCASION'), 'plain: no NEW OCCASION pill');
check(plain.includes('These countries celebrate this occasion'), 'plain: flags caption present');
check(plain.includes('padding:10px 30px 0'), 'plain: caption padding 10px 30px 0');
check(plain.includes('padding:4px 30px'), 'plain: flags row padding 4px 30px');
check(!plain.includes('headline-font'), 'plain: no .headline-font class');
check(!plain.includes('#3b5bdb'), 'plain: no dashed blue box');
check(!plain.includes('dashed'), 'plain: no dashed border anywhere');
check(plain.includes('family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&family=Dela+Gothic+One&family=Instrument+Serif:ital@0;1'), 'plain: fonts link DM Sans + Dela Gothic One + Instrument Serif');
check(!plain.includes('Fredoka'), 'plain: no Fredoka anywhere');
check(!plain.includes('Mona Sans'), 'plain: no Mona Sans anywhere');
check(plain.includes("font-family:'DM Sans',Arial,Helvetica,sans-serif;"), 'plain: DM Sans in body td');
check(plain.includes("&ldquo;"), 'plain: quote opens with ldquo');
check(plain.includes('&mdash; Inspired by traditional Diwa'), 'plain: quote author dash line');
check(plain.includes('width="440" height="330"'), 'plain: GIF 440x330');
check(plain.includes('margin:0 auto 26px'), 'plain: GIF centered');
check(plain.includes('Thank you for letting us share these moments.'), 'plain: fixed closing 2');
check(plain.includes('We&rsquo;re honored to be part of your stories and messages, and the moments you choose to share with Wibe Stories'), 'plain: fixed closing 1');
check(plain.includes('font-size:16px;line-height:1.5'), 'plain: body copy 16px/1.5');
check(!plain.includes('font-size:18px'), 'plain: no 18px body text anywhere');
check(plain.includes('The Wibe Stories Team'), 'plain: sign-off team');
check(!plain.includes('Talk soon'), 'plain: no legacy Talk soon');
check(!plain.includes('Thank you for trusting'), 'plain: no legacy trust line');
check(!plain.includes("It&rsquo;s <strong style=\"font-weight:700;\">Diwali</strong> &mdash; a good time"), 'plain: no legacy occasion intro');
check(plain.includes('/occasions/flags/in.png'), 'plain: flag row has in.png');
check(!plain.includes('white-space:nowrap'), 'plain: no flag+name pairs (flags-only row)');
check(!plain.includes('style="color:#77776a;">&middot;'), 'plain: no middot separators in flags row');
check(!plain.includes('(also '), 'plain: no parenthetical dim-extras');
check(!plain.includes('Singapore'), 'plain: no country names anywhere');
check(!plain.includes('India'), 'plain: no India country text');
check(!plain.includes('/occasions/flags/us.png'), 'plain: no extra flags beyond list');

const peaceHtml = buildHtmlBody(peace, testEmail);
check(!peaceHtml.includes('/occasions/flags/'), 'peace: no flags row (text only)');

const lunarHtml = buildHtmlBody(lunar, testEmail);
check(lunarHtml.includes('These countries celebrate this occasion'), 'lunar: flags caption present');
for (const code of ['cn', 'vn', 'kr', 'sg', 'my', 'id', 'ph', 'mm', 'th', 'bn', 'tw', 'hk']) {
  check(lunarHtml.includes(`/occasions/flags/${code}.png`), `lunar: flag row has ${code}.png`);
}
check((lunarHtml.match(/\/occasions\/flags\//g) || []).length === 12, 'lunar: exactly 12 flags (no cap)');
check(!lunarHtml.includes('(also '), 'lunar: no parenthetical dim-extras');
check(lunarHtml.includes('align="center" width="480"'), 'lunar: arched card centered (max 480px)');
check(lunarHtml.includes('email-card.png'), 'lunar: arched card image present');

// ── Named render + XSS ──
const xssName = `Priya O'Brien <script>alert(1)</script>`;
const named = buildHtmlBody(diwali, testEmail, { name: xssName });
check(named.includes(`Good day, <strong style="font-weight:700;">Priya O&#39;Brien &lt;script&gt;alert(1)&lt;/script&gt;</strong>,`), 'named: escaped name in greeting');
check(!named.includes('<script>alert'), 'named: no raw script tag');
check(named.includes(`src="${'https://ik.imagekit.io/wnwamgfimk/occasions/'}diwali.png?tr=w-1024"`), 'named: illustration URL intact');
check(named.includes(`src="${HEADLINE_BASE}diwali.png?${HEADLINE_TRANSFORM}" alt="Diwali"`), 'named: headline img URL intact (shared fresh-cache URL)');

// ── Unknown occasion fallback (no copy data) ──
const fake = buildHtmlBody({ id: 'unknown-occ', name: 'Test Day', img: 'https://wibestories.vercel.app/assets/occasions/x.png' }, testEmail, { name: 'Ana' });
check(fake.includes('Good day, <strong style="font-weight:700;">Ana</strong>,'), 'fallback: name still renders');
check(!fake.includes('&ldquo;'), 'fallback: no quote block');
check(!fake.includes('/occasions/flags/'), 'fallback: no flags row');

// ── Subject ──
check(buildSubject(diwali) === 'Happy Diwali from Wibe Stories!', 'subject: Happy Diwali from Wibe Stories!');

// ── Copy data integrity vs OCCASIONS ──
const { OCCASIONS } = await import('../lib/occasion-email.js');
const missing = OCCASIONS.filter((o) => !OCCASION_COPY[o.id]);
check(missing.length === 0, `copy data covers all ${OCCASIONS.length} occasions` + (missing.length ? ` (missing: ${missing.map((m) => m.id).join(',')})` : ''));
const emptyQuote = OCCASIONS.filter((o) => !OCCASION_COPY[o.id].quote);
check(emptyQuote.length === 0, 'all occasions have quotes');
const emptyAuthor = OCCASIONS.filter((o) => OCCASION_COPY[o.id].quote && !OCCASION_COPY[o.id].quoteAuthor);
check(emptyAuthor.length === 0, 'all quotes have authors');
const badLineCount = OCCASIONS.filter((o) => OCCASION_COPY[o.id].lines.length !== 3);
check(badLineCount.length === 0, 'all occasions have exactly 3 copy lines');

// ── escapeHtml direct ──
check(escapeHtml(`a&b<c>"d'e`) === 'a&amp;b&lt;c&gt;&quot;d&#39;e', 'escapeHtml escapes all five chars');

console.log(failures === 0 ? '\nverify-occasion-email: ALL PASS' : `\nverify-occasion-email: ${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);