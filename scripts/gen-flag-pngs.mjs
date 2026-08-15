#!/usr/bin/env node
// Renders the occasion-email flag SVGs (assets/flag-icons/flags/4x3/*.svg)
// to 96x72 PNGs and uploads them to ImageKit /occasions/flags/.
//
// Usage:
//   node scripts/gen-flag-pngs.mjs            -> render + upload the union of flags referenced by OCCASION_COPY
//   node scripts/gen-flag-pngs.mjs <code...>  -> only render/upload the given codes (e.g. sg ae ie bd mu)
//
// Reads IMAGEKIT_PRIVATE_KEY + IMAGEKIT_URL_ENDPOINT from .env.
// PNGs land in node_modules/.cache/occasion-flags/ (git-ignored build artifact).

import { readFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const UPLOAD_URL = 'https://upload.imagekit.io/api/v1/files/upload';
const FLAGS_DIR = join(ROOT, 'assets', 'flag-icons', 'flags', '4x3');
const OUT_DIR = join(ROOT, 'node_modules', '.cache', 'occasion-flags');
const FLAG_BASE = 'https://ik.imagekit.io/wnwamgfimk/occasions/flags/';
const SIZE = 96;

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

async function main() {
  const env = loadEnv(join(ROOT, '.env'));
  const PRIVATE_KEY = env.IMAGEKIT_PRIVATE_KEY;
  const ENDPOINT = (env.IMAGEKIT_URL_ENDPOINT || '').replace(/\/+$/, '');
  if (!PRIVATE_KEY || !ENDPOINT) {
    console.error('Missing IMAGEKIT_PRIVATE_KEY / IMAGEKIT_URL_ENDPOINT in .env');
    process.exit(1);
  }
  const AUTH = 'Basic ' + Buffer.from(PRIVATE_KEY + ':').toString('base64');

  let codes = process.argv.slice(2);
  if (codes.length === 0) {
    const { OCCASION_COPY } = await import('../lib/occasion-copy-data.js');
    codes = [...new Set(Object.values(OCCASION_COPY).flatMap((d) => d.flags || []))].sort();
  }

  let ok = 0;
  for (const code of codes) {
    const svgPath = join(FLAGS_DIR, code + '.svg');
    if (!existsSync(svgPath)) {
      console.error(`  ! ${code}: no SVG at ${svgPath} — fetch it from https://github.com/lipis/flag-icons`);
      continue;
    }
    try {
      mkdirSync(OUT_DIR, { recursive: true });
      const png = await sharp(svgPath).resize(SIZE, Math.round(SIZE * 0.75)).png().toBuffer();
      const outPath = join(OUT_DIR, code + '.png');
      const { writeFileSync } = await import('node:fs');
      writeFileSync(outPath, png);

      const form = new FormData();
      form.append('file', new Blob([png]), code + '.png');
      form.append('fileName', code + '.png');
      form.append('folder', '/occasions/flags');
      form.append('useUniqueFileName', 'false');
      form.append('overwriteFile', 'true');
      const res = await fetch(UPLOAD_URL, { method: 'POST', headers: { Authorization: AUTH }, body: form });
      if (!res.ok) {
        console.error(`  ! ${code}: upload failed (${res.status}): ${await res.text()}`);
        continue;
      }

      const url = FLAG_BASE + code + '.png';
      const verify = await fetch(url);
      const vOk = verify.ok && (verify.headers.get('content-type') || '').startsWith('image/');
      if (vOk) ok++;
      console.log(`  [${vOk ? 'OK' : 'FAIL'}] ${code}.png (${png.length} bytes) ${url} (${verify.status})`);
    } catch (e) {
      console.error(`  ! ${code}: ${e.message}`);
    }
  }
  console.log(`Done: ${ok}/${codes.length} flags live.`);
  if (ok !== codes.length) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});