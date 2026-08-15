#!/usr/bin/env node
// Generates lib/occasion-copy-data.js from frontlogs/emails/occasion-copy.md
// (the single source of truth for the occasion-email copy overhaul).
//
// Usage:
//   node scripts/gen-occasion-copy.mjs            -> validate + write lib/occasion-copy-data.js
//   node scripts/gen-occasion-copy.mjs --check    -> validate only (exit 1 on any problem)
//
// Validation: exactly 37 blocks in OCCASIONS order, exactly 3 copy lines per
// block, a quote is present with its author (or neither), countries/flags are
// consistent, and every flag code has a local SVG file under
// assets/flag-icons/flags/4x3/.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { OCCASIONS } from '../lib/occasion-email.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MD_PATH = join(ROOT, 'frontlogs', 'emails', 'occasion-copy.md');
const OUT_PATH = join(ROOT, 'lib', 'occasion-copy-data.js');
const FLAGS_DIR = join(ROOT, 'assets', 'flag-icons', 'flags', '4x3');

const md = readFileSync(MD_PATH, 'utf8');
const lines = md.split(/\r?\n/);

const blocks = [];
let cur = null;
let inQuote = false;
let quoteLines = [];

function assignQuote() {
  if (!cur || !inQuote) return;
  let q = quoteLines.join('\n').trim();
  q = q.replace(/^\s*\*?"/, '').replace(/"\*?\s*$/, '');
  cur.quote = q;
  quoteLines = [];
  inQuote = false;
}

for (const raw of lines) {
  const line = raw.trimEnd();

  // Terminal section (flags checklist, etc.) — stop parsing once blocks began.
  if (/^##\s/.test(line) && blocks.length > 0) {
    assignQuote();
    if (cur) blocks.push(cur);
    cur = null;
    break;
  }

  const header = line.match(/^###\s+(\d+)\.\s+(.+)$/);
  if (header) {
    assignQuote();
    if (cur) blocks.push(cur);
    const title = header[2];
    const m = title.match(/^(.+?)\s+·\s+Countries:\s*(.+?)\s+·\s+Flags:\s*(.*?)$/);
    let name = m ? m[1] : title;
    name = name.replace(/\s+—\s+.+$/, '').trim();
    const flagsRaw = m ? m[3] : null;
    let flags = null;
    if (flagsRaw !== null) {
      flags = /^none(\s*\(.*\))?$/.test(flagsRaw.trim())
        ? null
        : flagsRaw.split(/[\s,]+/).filter((c) => c);
    }
    cur = {
      num: Number(header[1]),
      name,
      countries: m ? m[2] : null,
      flags: flags && flags.length ? flags : null,
      lines: [],
      quote: '',
      quoteAuthor: '',
    };
    continue;
  }
  if (!cur) continue;
  if (/^---+\s*$/.test(line)) { assignQuote(); continue; }
  if (inQuote) {
    const author = line.match(/^Author:\s*(.+)$/);
    if (author) {
      cur.quoteAuthor = author[1].trim();
      assignQuote();
    } else if (/^#{1,6}\s/.test(line)) {
      assignQuote();
    } else if (line.trim() !== '') {
      quoteLines.push(line.replace(/^-\s+/, ''));
    }
    continue;
  }
  if (line.startsWith('- Quote')) {
    inQuote = true;
    quoteLines = [];
    const rest = line.replace(/^-\s*Quote:\s*/, '');
    if (rest) quoteLines.push(rest);
    continue;
  }
  const item = line.match(/^-\s+(.+)$/);
  if (item) cur.lines.push(item[1].trim());
}
assignQuote();
if (cur) blocks.push(cur);

// ── Assemble ──
const byNum = new Map(blocks.map((b) => [b.num, b]));
const data = {};
const problems = [];
for (let n = 1; n <= OCCASIONS.length; n++) {
  const b = byNum.get(n);
  const oc = OCCASIONS[n - 1];
  if (!b) { problems.push(`missing block ${n} (${oc.id})`); continue; }
  if (b.lines.length !== 3) problems.push(`#${n} ${b.name}: expected 3 copy lines, got ${b.lines.length}`);
  if (b.quote && !b.quoteAuthor) problems.push(`#${n} ${b.name}: quote present without Author line`);
  if (!b.quote && b.quoteAuthor) problems.push(`#${n} ${b.name}: Author line without a quote`);
  for (const code of (b.flags || [])) {
    if (!existsSync(join(FLAGS_DIR, code + '.svg'))) {
      problems.push(`#${n} ${b.name}: flag "${code}" has no SVG at assets/flag-icons/flags/4x3/${code}.svg`);
    }
  }
  data[oc.id] = {
    lines: b.lines,
    quote: b.quote || '',
    quoteAuthor: b.quoteAuthor || '',
  };
  if (b.countries) data[oc.id].countries = b.countries;
  if (b.flags && b.flags.length) data[oc.id].flags = b.flags;
}

// ── Report ──
if (blocks.length !== OCCASIONS.length) {
  problems.push(`expected ${OCCASIONS.length} blocks, got ${blocks.length}`);
}
if (problems.length) {
  console.error('occasion-copy validation FAILED:');
  for (const p of problems) console.error('  - ' + p);
  process.exit(1);
}

const output = `// GENERATED FILE — do not edit by hand.
// Source of truth: frontlogs/emails/occasion-copy.md
// Re-generate with: node scripts/gen-occasion-copy.mjs
export const OCCASION_COPY = ${JSON.stringify(data, null, 2)};
`;

if (process.argv.includes('--check')) {
  console.log('occasion-copy OK: ' + Object.keys(data).length + ' occasions validated.');
  process.exit(0);
}
writeFileSync(OUT_PATH, output);
console.log('Wrote ' + OUT_PATH + ' (' + Object.keys(data).length + ' occasions).');