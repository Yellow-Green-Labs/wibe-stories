#!/usr/bin/env node
// Occasion-email preview generator.
//
// Usage:
//   node scripts/gen-occasion-preview.mjs
//       -> regenerate frontlogs/ups_pres/occasion-email-preview.html
//          (self-rendering live preview: occasion select + name input,
//           embeds the real template code from lib/occasion-email.js)
//   node scripts/gen-occasion-preview.mjs sample <id> [name] [--out <file>]
//       -> write a static sample to frontlogs/emails/<filename>
//          (default filename: <Occasion-Name>-Email-NEW.html;
//           e.g. sample diwali Priya -> frontlogs/emails/Diwali-Email-NEW.html,
//           sample lunar-new-year Priya --out Occasion-Email-NEW.html)

import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildHtmlBody, buildQuoteBlock, buildFlagsRow, escapeHtml, OCCASIONS, getOccasionById,
  IMAGEKIT_BASE, ILLUSTRATION_TRANSFORM, FLAG_BASE, CARD_URL, HEADLINE_BASE, HEADLINE_TRANSFORM,
} from '../lib/occasion-email.js';
import { OCCASION_COPY } from '../lib/occasion-copy-data.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PREVIEW_PATH = join(ROOT, 'frontlogs', 'ups_pres', 'occasion-email-preview.html');
const SAMPLES_DIR = join(ROOT, 'frontlogs', 'emails');

const EMBEDDED_FNS = [
  escapeHtml,
  buildQuoteBlock,
  buildFlagsRow,
  buildHtmlBody,
].map((f) => f.toString()).join('\n\n');

const EMBEDDED_DATA = `const IMAGEKIT_BASE = '${IMAGEKIT_BASE}';
const ILLUSTRATION_TRANSFORM = '${ILLUSTRATION_TRANSFORM}';
const FLAG_BASE = '${FLAG_BASE}';
const CARD_URL = '${CARD_URL}';
const HEADLINE_BASE = '${HEADLINE_BASE}';
const HEADLINE_TRANSFORM = '${HEADLINE_TRANSFORM}';
const OCCASION_COPY = ${JSON.stringify(OCCASION_COPY, null, 2)};
const OCCASIONS = ${JSON.stringify(OCCASIONS, null, 2)};`;

const PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Occasion Email Preview — Wibe Stories</title>
<style>
  body { margin: 0; background: #e8e4d8; font-family: Inter, Arial, sans-serif; }
  #controls { position: sticky; top: 0; z-index: 10; background: #1a1a1a; color: #fff;
    display: flex; gap: 16px; align-items: center; padding: 12px 20px; flex-wrap: wrap; }
  #controls label { font-size: 13px; opacity: .8; }
  #controls select, #controls input { padding: 8px 10px; border-radius: 4px; border: 1px solid #444; font-size: 14px; }
  #controls input { width: 240px; }
  #controls button { background: #f5a623; color: #1a1a1a; border: 0; padding: 9px 18px;
    border-radius: 4px; font-weight: 700; font-size: 14px; cursor: pointer; }
  #frameWrap { padding: 32px 12px 64px; }
  iframe { display: block; margin: 0 auto; width: 640px; max-width: 100%; height: 1400px;
    border: 1px solid #ccc; border-radius: 8px; background: #ffffeb; box-shadow: 0 4px 24px rgba(0,0,0,.18); }
</style>
</head>
<body>
<div id="controls">
  <label for="sel">Occasion</label>
  <select id="sel"></select>
  <label for="name">Name (optional)</label>
  <input id="name" type="text" placeholder="Priya" value="Priya" maxlength="60" />
  <button id="btn">Render</button>
</div>
<div id="frameWrap"><iframe id="frame" title="Email preview"></iframe></div>
<script>
${EMBEDDED_DATA}

${EMBEDDED_FNS}

(function () {
  const sel = document.getElementById('sel');
  const nameInput = document.getElementById('name');
  const frame = document.getElementById('frame');

  OCCASIONS.forEach((oc) => {
    const opt = document.createElement('option');
    opt.value = oc.id;
    opt.textContent = oc.name;
    sel.appendChild(opt);
  });

  function render() {
    const oc = OCCASIONS.find((o) => o.id === sel.value) || OCCASIONS[0];
    const html = buildHtmlBody(oc, undefined, { name: nameInput.value.trim() });
    frame.srcdoc = html;
  }

  document.getElementById('btn').addEventListener('click', render);
  sel.addEventListener('change', render);
  nameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') render(); });
  render();
})();
</script>
</body>
</html>`;

function main() {
  const cmd = process.argv[2];
  if (cmd === 'sample') {
    const id = process.argv[3];
    const name = process.argv[4] || '';
    const oc = getOccasionById(id);
    if (!oc) {
      console.error('Unknown occasion id: ' + id + ' (use e.g. diwali, janmashtami, new-year)');
      process.exit(1);
    }
    const sampleName = oc.name.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const outIdx = process.argv.indexOf('--out');
    const outFile = outIdx !== -1 ? process.argv[outIdx + 1] : null;
    const outPath = outFile ? join(SAMPLES_DIR, outFile) : join(SAMPLES_DIR, sampleName + '-Email-NEW.html');
    const html = buildHtmlBody(oc, 'priya@example.com', { name });
    writeFileSync(outPath, html);
    console.log('Wrote ' + outPath + (name ? ` (name: ${name})` : ' (no name)'));
    return;
  }

  writeFileSync(PREVIEW_PATH, PAGE);
  console.log('Wrote ' + PREVIEW_PATH + ' — open in a browser to preview all 39 occasions.');
}

main();