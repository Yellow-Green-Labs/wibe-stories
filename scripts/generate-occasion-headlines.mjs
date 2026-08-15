#!/usr/bin/env node
// One-time + repeatable: renders a static headline PNG for every occasion in
// lib/occasion-email.js using the headline font (Dela Gothic One, 2x for
// retina), uploads them to ImageKit /headlines, then verifies each URL 200.
//
// Usage: node scripts/generate-occasion-headlines.mjs
//
// Requires: .env with IMAGEKIT_* keys, Python 3 with Pillow, and the font at
// assets/brand/fonts/DelaGothicOne-Regular.ttf.
//
// NOTE: this exists because ImageKit's live l-text overlays were unreliable on
// the account (intermittent 404 on cold renders, even without custom fonts).
// Pre-rendered statics are deterministic; if l-text stabilizes later, the
// headline URL pattern in lib/occasion-email.js is a one-line swap.

import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { OCCASIONS, HEADLINE_TRANSFORM } from '../lib/occasion-email.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const UPLOAD_URL = 'https://upload.imagekit.io/api/v1/files/upload';

function loadEnv(path) {
  const txt = readFileSync(path, 'utf8');
  const out = {};
  for (const line of txt.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    out[m[1]] = m[2].trim().replace(/^"(.*)"$/, '$1');
  }
  return out;
}

const env = loadEnv(join(ROOT, '.env'));
const PRIVATE_KEY = env.IMAGEKIT_PRIVATE_KEY;
const ENDPOINT = (env.IMAGEKIT_URL_ENDPOINT || '').replace(/\/+$/, '');
if (!PRIVATE_KEY || !ENDPOINT) {
  console.error('Missing IMAGEKIT_PRIVATE_KEY / IMAGEKIT_URL_ENDPOINT in .env');
  process.exit(1);
}
const AUTH = 'Basic ' + Buffer.from(PRIVATE_KEY + ':').toString('base64');

async function uploadFile(filePath, folder) {
  const fileName = basename(filePath);
  const form = new FormData();
  form.append('file', new Blob([readFileSync(filePath)]), fileName);
  form.append('fileName', fileName);
  form.append('folder', folder);
  form.append('useUniqueFileName', 'false');
  form.append('overwriteFile', 'true');
  const res = await fetch(UPLOAD_URL, { method: 'POST', headers: { Authorization: AUTH }, body: form, signal: AbortSignal.timeout(30000) });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Upload ${folder}/${fileName} failed (${res.status}): ${JSON.stringify(body)}`);
  }
  return body;
}

// ImageKit auto-formats transform URLs to JPEG; PNG dims kept for safety.
function pngDims(buf) {
  if (buf.length < 24 || buf.toString('ascii', 1, 4) !== 'PNG') return null;
  return [buf.readUInt32BE(16), buf.readUInt32BE(20)];
}

// JPEG SOF scan: FF D8 (SOI) ... FF Cx <len> <precision> <height> <width>.
function jpegDims(buf) {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) { i++; continue; }
    const marker = buf[i + 1];
    if (marker >= 0xd0 && marker <= 0xd7) { i += 2; continue; }
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return [buf.readUInt16BE(i + 7), buf.readUInt16BE(i + 5)];
    }
    const len = buf.readUInt16BE(i + 2);
    if (len < 2) return null;
    i += 2 + len;
  }
  return null;
}

// Explicit two-line headline splits for 3-worded occasion names
// (first line / second line). Rendered verbatim by
// render-occasion-headlines.py (skips the auto-wrap).
const HEADLINE_LINES = {
  'new-year': ["New Year's", 'Day'],
  'lunar-new-year': ['Lunar', 'New Year'],
  'st-patricks-day': ["St. Patrick's", 'Day'],
  'april-fools-day': ['April', "Fools' Day"],
  'dragon-boat-festival': ['Dragon Boat', 'Festival'],
  'new-years-eve': ["New Year's", 'Eve'],
};

async function main() {
  const outdir = join(tmpdir(), 'wibe-headlines-' + Date.now());
  mkdirSync(outdir, { recursive: true });

  const manifest = OCCASIONS.map(o => ({ id: o.id, name: o.name, ...(HEADLINE_LINES[o.id] ? { lines: HEADLINE_LINES[o.id] } : {}) }));
  const manifestPath = join(outdir, 'manifest.json');
  writeFileSync(manifestPath, JSON.stringify(manifest));

  console.log(`Rendering ${manifest.length} headlines...`);
  const py = spawnSync('python', [join(ROOT, 'scripts', 'render-occasion-headlines.py'), manifestPath, outdir], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  if (py.status !== 0) {
    console.error(py.stderr || py.stdout || 'python render failed');
    process.exit(1);
  }
  process.stdout.write(py.stdout);

  const pngs = readdirSync(outdir).filter(f => f.endsWith('.png'));
  console.log(`Uploading ${pngs.length} headlines to ${ENDPOINT}/headlines/ ...`);
  let okCount = 0;
  for (const f of pngs.sort()) {
    let lastErr = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const r = await uploadFile(join(outdir, f), '/headlines');
        okCount++;
        console.log(`  + ${r.filePath || f}`);
        lastErr = null;
        break;
      } catch (e) {
        lastErr = e;
        console.error(`  ! ${f} attempt ${attempt}/3: ${e.message}`);
        await new Promise(r => setTimeout(r, 1500 * attempt));
      }
    }
    if (lastErr) console.error(`  FAILED ${f} after 3 attempts`);
  }
  console.log(`Uploaded ${okCount}/${pngs.length}.`);

  console.log(`Verifying live URLs (${HEADLINE_TRANSFORM})...`);
  let verified = 0;
  let failed = 0;
  for (const f of pngs.sort()) {
    const url = `${encodeURI(ENDPOINT)}/headlines/${f}?${HEADLINE_TRANSFORM}`;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
      const buf = Buffer.from(await res.arrayBuffer());
      const dims = pngDims(buf) || jpegDims(buf);
      if (res.ok && dims && dims[0] === 960 && dims[1] === 240) {
        verified++;
      } else {
        failed++;
        console.error(`  FAIL ${url} ${res.status} dims=${dims}`);
      }
    } catch {
      failed++;
      console.error(`  FAIL ${url} (network)`);
    }
  }
  console.log(`Verified ${verified}/${pngs.length} headline URLs.`);
  if (failed > 0 || okCount !== pngs.length) process.exitCode = 1;
}

main().catch(e => {
  console.error(e.message);
  process.exit(1);
});