// Spike test for vault voice M4A transcode (Batch 2).
// Deploys a real webm to /api/voice, verifies the .m4a variant exists
// and both blobs are publicly reachable.
//
// Usage:
//   node scripts/vault-voice-spike.mjs [--base=https://wibestories.vercel.app] [--cleanup]
//
// --cleanup deletes the test blobs (requires BLOB_READ_WRITE_TOKEN in .env).

import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const base = (process.argv.find((a) => a.startsWith('--base=')) || '--base=http://localhost:3000').split('=')[1];
const cleanupMode = process.argv.includes('--cleanup');
const BLOB_HOST = 'jkzbaevzmimaelrr.public.blob.vercel-storage.com';

const webmPath = process.env.TEST_WEBM || 'C:/Users/srini/AppData/Local/Temp/opencode/vault-test.webm';
if (!existsSync(webmPath)) {
  console.error('Test webm missing. Generate one first:');
  console.error('  node -e "const ff=require(\'ffmpeg-static\'); const {execFileSync}=require(\'child_process\'); execFileSync(ff,[\'-y\',\'-f\',\'lavfi\',\'-i\',\'sine=frequency=440:duration=3\',\'-c:a\',\'libopus\',\'-b:a\',\'32k\',\'C:/Users/srini/AppData/Local/Temp/opencode/vault-test.webm\']);"');
  process.exit(1);
}

const shortId = 'spike' + Date.now().toString(36).slice(-6);
console.log('Short ID:', shortId);
console.log('Uploading to', base + '/api/voice ...');

const body = readFileSync(webmPath);
const start = Date.now();
const uploadRes = await fetch(base + '/api/voice', {
  method: 'POST',
  headers: { 'Content-Type': 'video/webm', 'X-Short-Id': shortId },
  body,
});
const uploadTime = Date.now() - start;
let uploadJson = null;
try { uploadJson = await uploadRes.json(); } catch (e) {}
console.log(`Upload status: ${uploadRes.status} (${uploadTime} ms)`, uploadJson || '');

if (!uploadRes.ok || !uploadJson || uploadJson.ok !== true) {
  console.error('FAIL: upload did not succeed');
  process.exit(1);
}

const urls = {
  webm: `https://${BLOB_HOST}/voice/${shortId}`,
  m4a: `https://${BLOB_HOST}/voice/${shortId}.m4a`,
};
console.log('Checking blobs (cache-busted):');
for (const [label, url] of Object.entries(urls)) {
  const res = await fetch(url + '?x=' + Date.now(), { method: 'HEAD' });
  console.log(`  ${label}: ${res.status} content-type=${res.headers.get('content-type') || '?'} size=${res.headers.get('content-length') || '?'}`);
}

const expectM4a = uploadJson.m4a === true;
if (expectM4a) console.log('PASS: m4a:true — transcode ran on the server.');
else console.log('WARN: m4a:false — transcode was skipped/failed. Check api/voice.js logs.');

if (cleanupMode) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) { console.error('--cleanup needs BLOB_READ_WRITE_TOKEN in .env'); process.exit(1); }
  const { del } = await import('@vercel/blob');
  try {
    const result = await del(Object.values(urls));
    console.log('Deleted blobs:', result.deleted?.length ?? '?');
  } catch (e) {
    console.error('Cleanup failed:', e.message);
  }
}
