// Voice clip upload + Apple-compatible transcode.
//
// Stores the original clip (usually WebM from MediaRecorder) at
// `voice/<shortId>` and a transcoded AAC/M4A at `voice/<shortId>.m4a`.
// Apple browsers (Safari/iOS/macOS) cannot decode the WebM container, so
// the vault player and the shared `/c/<id>` page use the M4A variant on
// Apple devices and the original WebM everywhere else.
//
// Transcoding failures are non-fatal: the WebM is kept and the .m4a is
// simply absent (players fall back to the WebM, then to a graceful toast).

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import os from 'node:os';
import path from 'node:path';

const execFileAsync = promisify(execFile);

export const config = { runtime: 'nodejs' };

const MAX_AUDIO_BYTES = 6 * 1024 * 1024;

async function transcodeToM4a(shortId, webmBuffer, contentType) {
  let ffmpegPath = null;
  try {
    ffmpegPath = (await import('ffmpeg-static')).default;
  } catch (e) {
    console.error('[Voice] ffmpeg-static import failed:', e.message);
  }
  if (!ffmpegPath) return null;

  const tmpBase = path.join(os.tmpdir(), 'ws-voice-' + shortId);
  const inFile = tmpBase + '.webm';
  const outFile = tmpBase + '.m4a';
  const fs = await import('node:fs/promises');
  try {
    await fs.writeFile(inFile, webmBuffer);
    // -vn drops any video track (MediaRecorder captures of the animated card
    // carry one); -c:a aac produces a container every Apple browser plays.
    await execFileAsync(ffmpegPath, ['-y', '-i', inFile, '-vn', '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', outFile], { timeout: 25000, maxBuffer: 1024 * 1024 * 16 });
    const m4aBuffer = await fs.readFile(outFile);
    return { buffer: m4aBuffer, contentType: contentType.startsWith('audio/mp4') || contentType.includes('mp4') ? contentType : 'audio/mp4' };
  } catch (e) {
    console.error('[Voice] Transcode failed:', e && e.message ? e.message : e);
    return null;
  } finally {
    try { await fs.unlink(inFile); } catch (e) {}
    try { await fs.unlink(outFile); } catch (e) {}
  }
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', 'https://wibestories.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Short-Id');
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Method not allowed');
    return;
  }

  try {
    const shortId = req.headers['x-short-id'];
    if (!shortId || shortId.length < 4) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Invalid shortId' }));
      return;
    }

    let totalBytes = 0;
    const chunks = [];
    for await (const chunk of req) {
      totalBytes += chunk.length;
      if (totalBytes > MAX_AUDIO_BYTES) {
        res.statusCode = 413;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Audio too large' }));
        return;
      }
      chunks.push(chunk);
    }

    const audioBuffer = Buffer.concat(chunks);
    console.log('[Voice][DEBUG] received bytes:', audioBuffer.length, 'chunks:', chunks.length);
    if (audioBuffer.length < 100) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Audio too small' }));
      return;
    }

    const contentType = req.headers['content-type'] || 'audio/webm';
    const { put } = await import('@vercel/blob');

    await put('voice/' + shortId, audioBuffer, {
      access: 'public',
      addRandomSuffix: false,
      contentType: contentType,
      cacheControlMaxAge: 60 * 60 * 24 * 5,
    });

    const m4a = await transcodeToM4a(shortId, audioBuffer, contentType);
    if (m4a) {
      try {
        await put('voice/' + shortId + '.m4a', m4a.buffer, {
          access: 'public',
          addRandomSuffix: false,
          contentType: m4a.contentType,
          cacheControlMaxAge: 60 * 60 * 24 * 5,
        });
      } catch (e) {
        console.error('[Voice] M4A upload failed:', e.message);
      }
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', 'https://wibestories.vercel.app');
    res.end(JSON.stringify({ ok: true, m4a: !!m4a }));
  } catch (e) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Voice upload error: ' + (e && e.message ? e.message : 'unknown'));
  }
}
