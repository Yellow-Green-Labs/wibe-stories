// Lazy Apple-compatible (AAC/M4A) transcode endpoint.
//
// The M4A variant is no longer produced at upload time (api/voice.js stores
// only the original WebM). Instead it is generated on demand, once per card:
//
//   GET /api/voice/m4a/:id
//     1. If `voice/<id>.m4a` already exists in Blob → 302 to its URL.
//     2. Else if the original WebM `voice/<id>` is missing → 404.
//     3. Else fetch the WebM, transcode to AAC/M4A, store it, 302 to its URL.
//
//   HEAD /api/voice/m4a/:id  → 200 if the original WebM exists (the M4A can
//   be generated on demand), 404 otherwise. Never transcodes.
//
// The 302 redirect lets the Blob CDN handle Range requests and byte-range
// seeking for the audio element; the function itself never streams media.
//
// Failures are non-fatal: the WebM stays the source of truth and players
// fall back to it. If the transcode exceeds the function timeout, no M4A is
// written and the next request retries.

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import os from 'node:os';
import path from 'node:path';

const execFileAsync = promisify(execFile);

export const config = { runtime: 'nodejs' };

const BLOB_HOST = 'jkzbaevzmimaelrr.public.blob.vercel-storage.com';
const TRANSCODE_TIMEOUT_MS = 25000;

async function transcodeToM4a(shortId, webmBuffer) {
  let ffmpegPath = null;
  try {
    ffmpegPath = (await import('ffmpeg-static')).default;
  } catch (e) {
    console.error('[VoiceM4A] ffmpeg-static import failed:', e.message);
    return null;
  }
  if (!ffmpegPath) return null;

  const tmpBase = path.join(os.tmpdir(), 'ws-voice-m4a-' + shortId);
  const inFile = tmpBase + '.webm';
  const outFile = tmpBase + '.m4a';
  const fs = await import('node:fs/promises');
  try {
    await fs.writeFile(inFile, webmBuffer);
    // -vn drops any video track (MediaRecorder captures of the animated card
    // carry one); -c:a aac produces a container every Apple browser plays.
    await execFileAsync(ffmpegPath, ['-y', '-i', inFile, '-vn', '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', outFile], { timeout: TRANSCODE_TIMEOUT_MS, maxBuffer: 1024 * 1024 * 16 });
    return await fs.readFile(outFile);
  } catch (e) {
    console.error('[VoiceM4A] Transcode failed:', e && e.message ? e.message : e);
    return null;
  } finally {
    try { await fs.unlink(inFile); } catch (e) {}
    try { await fs.unlink(outFile); } catch (e) {}
  }
}

function blobExists(url) {
  return fetch(url, { method: 'HEAD' })
    .then(function (r) { return r.ok; })
    .catch(function () { return false; });
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Method not allowed');
    return;
  }

  const url = new URL(req.url, 'https://wibestories.vercel.app');
  const id = url.pathname.replace(/^\/api\/voice\/m4a\//, '');

  if (!id || id.length < 4 || id.length > 12 || !/^[a-zA-Z0-9]+$/.test(id)) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Not found');
    return;
  }

  const m4aUrl = `https://${BLOB_HOST}/voice/${id}.m4a`;
  const webmUrl = `https://${BLOB_HOST}/voice/${id}`;

  try {
    // HEAD answers existence only: 200 if the M4A or the original WebM
    // exists (the M4A can be generated on demand), 404 otherwise. Never
    // redirects and never transcodes — /c/:id depends on this to set
    // hasVoice without invoking ffmpeg.
    if (req.method === 'HEAD') {
      const m4aExists = await blobExists(m4aUrl);
      const exists = m4aExists || await blobExists(webmUrl);
      res.statusCode = exists ? 200 : 404;
      res.end();
      return;
    }

    const m4aExists = await blobExists(m4aUrl);
    if (m4aExists) {
      // M4A already generated — hand the media off to the Blob CDN.
      res.statusCode = 302;
      res.setHeader('Location', m4aUrl);
      res.setHeader('Cache-Control', 'no-store');
      res.end();
      return;
    }

    const webmExists = await blobExists(webmUrl);
    if (!webmExists) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Not found');
      return;
    }

    const webmRes = await fetch(webmUrl);
    if (!webmRes.ok) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Not found');
      return;
    }
    const webmBuffer = Buffer.from(await webmRes.arrayBuffer());

    const m4aBuffer = await transcodeToM4a(id, webmBuffer);
    if (!m4aBuffer) {
      // Source exists but we could not produce the variant — the player
      // falls back to the WebM. Try again on the next request.
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Voice unavailable');
      return;
    }

    const { put } = await import('@vercel/blob');
    await put('voice/' + id + '.m4a', m4aBuffer, {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'audio/mp4',
      cacheControlMaxAge: 60 * 60 * 24 * 5,
    });

    res.statusCode = 302;
    res.setHeader('Location', m4aUrl);
    res.setHeader('Cache-Control', 'no-store');
    res.end();
  } catch (e) {
    console.error('[VoiceM4A] Error:', e && e.message ? e.message : e);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Voice error');
  }
}
