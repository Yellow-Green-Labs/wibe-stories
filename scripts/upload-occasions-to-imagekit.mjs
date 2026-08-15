#!/usr/bin/env node
// Uploads occasion email media to ImageKit.
//
// Usage:
//   node scripts/upload-occasions-to-imagekit.mjs                      -> upload all PNGs in assets/occasions/ to /occasions
//   node scripts/upload-occasions-to-imagekit.mjs font <file>          -> upload a font file to /fonts
//   node scripts/upload-occasions-to-imagekit.mjs asset <file> <folder> -> upload a single file to /<folder>
//
// Reads IMAGEKIT_PRIVATE_KEY + IMAGEKIT_URL_ENDPOINT from .env.
// Re-runs are safe (overwriteFile=true, useUniqueFileName=false).

import { readFileSync, readdirSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const UPLOAD_URL = 'https://upload.imagekit.io/api/v1/files/upload';
const OCCASIONS_DIR = join(ROOT, 'assets', 'occasions');

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
  const res = await fetch(UPLOAD_URL, { method: 'POST', headers: { Authorization: AUTH }, body: form });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Upload ${folder}/${fileName} failed (${res.status}): ${JSON.stringify(body)}`);
  }
  return body;
}

async function verifyUrl(url, what) {
  const res = await fetch(url);
  const ok = res.ok;
  const ct = res.headers.get('content-type') || '';
  console.log(`  [${ok ? 'OK' : 'FAIL'}] ${what}: ${url} (${res.status}, ${ct})`);
  return ok;
}

async function main() {
  const cmd = process.argv[2] || 'occasions';

  if (cmd === 'occasions') {
    const files = readdirSync(OCCASIONS_DIR).filter(f => f.endsWith('.png')).sort();
    if (files.length === 0) {
      console.error('No PNGs found in assets/occasions/');
      process.exit(1);
    }
    console.log(`Uploading ${files.length} occasion images to ${ENDPOINT}/occasions/ ...`);
    let okCount = 0;
    for (const f of files) {
      try {
        const r = await uploadFile(join(OCCASIONS_DIR, f), '/occasions');
        okCount++;
        console.log(`  + ${r.filePath || f}`);
      } catch (e) {
        console.error(`  ! ${f}: ${e.message}`);
      }
    }
    console.log(`Done: ${okCount}/${files.length} uploaded.`);
    if (okCount !== files.length) process.exitCode = 1;
  } else if (cmd === 'font' || cmd === 'asset') {
    const file = process.argv[3];
    const folder = cmd === 'font' ? '/fonts' : '/' + (process.argv[4] || '');
    if (!file) {
      console.error(`Usage: node scripts/upload-occasions-to-imagekit.mjs ${cmd} <file>${cmd === 'asset' ? ' <folder>' : ''}`);
      process.exit(1);
    }
    const r = await uploadFile(file, folder);
    console.log(`Uploaded ${r.filePath || basename(file)} (${r.size} bytes)`);
  } else {
    console.error('Unknown command: ' + cmd);
    process.exit(1);
  }
}

main().catch(e => {
  console.error(e.message);
  process.exit(1);
});
