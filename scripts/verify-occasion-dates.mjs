#!/usr/bin/env node
// Verifies occasion date resolution (lib/occasion-email.js) against the
// documented calendar anchors, plus full-year scans.
//
// Usage:
//   node scripts/verify-occasion-dates.mjs
//
// Anchor mismatches exit 1. Scan results are reported; known pre-existing
// gaps (2027 rows missing for onam/raksha-bandhan/janmashtami/dhanteras/
// hanukkah; Carnival 2026-02-17 colliding with Lunar New Year) print loud
// WARNINGs but do not fail — they are documented in
// docs-internal/C_occasions-list.md.

import { getOccasionForDate, getOccasionById, OCCASIONS } from '../lib/occasion-email.js';

let failures = 0;
let warnings = 0;
function check(cond, label) {
  if (cond) {
    console.log(`  [OK]   ${label}`);
  } else {
    failures++;
    console.error(`  [FAIL] ${label}`);
  }
}
function warn(label) {
  warnings++;
  console.warn(`  [WARN] ${label}`);
}

// ── Anchors (2026) ──
const ANCHORS = [
  ['2026-01-01', 'new-year'],
  ['2026-02-14', 'valentines-day'],
  ['2026-02-17', 'lunar-new-year'],
  ['2026-02-18', 'ramadan'],
  ['2026-03-04', 'holi'],
  ['2026-03-08', 'womens-day'],
  ['2026-03-17', 'st-patricks-day'],
  ['2026-03-20', 'eid-al-fitr'],
  ['2026-03-21', 'nowruz'],
  ['2026-04-01', 'april-fools-day'],
  ['2026-04-05', 'easter'],
  ['2026-04-13', 'songkran'],
  ['2026-05-01', 'vesak'],
  ['2026-05-10', 'mothers-day'],
  ['2026-05-15', 'day-of-families'],
  ['2026-06-19', 'dragon-boat-festival'],
  ['2026-06-21', 'fathers-day'],
  ['2026-07-26', 'grandparents-day'],
  ['2026-08-02', 'friendship-day'],
  ['2026-08-15', 'independence-day'],
  ['2026-08-26', 'onam'],
  ['2026-08-28', 'raksha-bandhan'],
  ['2026-09-04', 'janmashtami'],
  ['2026-09-05', 'teachers-day'],
  ['2026-09-14', 'ganesh-chaturthi'],
  ['2026-09-21', 'peace-day'],
  ['2026-10-11', 'navratri'],
  ['2026-10-20', 'dussehra'],
  ['2026-10-31', 'halloween'],
  ['2026-11-06', 'dhanteras'],
  ['2026-11-08', 'diwali'],
  ['2026-11-14', 'childrens-day'],
  ['2026-11-26', 'thanksgiving'],
  ['2026-12-04', 'hanukkah'],
  ['2026-12-25', 'christmas'],
  ['2026-12-31', 'new-years-eve'],
];
console.log('Anchors:');
for (const [iso, id] of ANCHORS) {
  const got = getOccasionForDate(new Date(iso + 'T00:00:00Z'));
  check(got && got.id === id, `${iso} -> ${id} (got ${got ? got.id : 'none'})`);
}

// ── Full-year scans ──
for (const year of [2026, 2027]) {
  const counts = new Map();
  const dayOcc = new Map();
  for (let m = 0; m < 12; m++) {
    const daysInMonth = new Date(year, m + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${year}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const oc = getOccasionForDate(new Date(iso + 'T00:00:00Z'));
      if (oc) {
        counts.set(oc.id, (counts.get(oc.id) || 0) + 1);
        if (!dayOcc.has(iso)) dayOcc.set(iso, []);
        dayOcc.get(iso).push(oc.id);
      }
    }
  }
  console.log(`\n${year} full-year scan: ${counts.size} distinct ids, ${dayOcc.size} days with an occasion`);
  for (const oc of OCCASIONS) {
    const n = counts.get(oc.id) || 0;
    const expected = oc.type === 'range' ? oc.days.length : 1;
    if (n !== expected) warn(`${oc.id}: resolves ${n} times in ${year} (expected ${expected})`);
  }
  check(counts.size > 30, `${year}: sane number of distinct occasions (${counts.size})`);
}

console.log(failures === 0
  ? `\nverify-occasion-dates: ALL ANCHOR CHECKS PASS (${warnings} warnings, see above)`
  : `\nverify-occasion-dates: ${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);