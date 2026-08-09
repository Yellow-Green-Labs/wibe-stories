// Voice clip upload.
//
// Stores the original clip (usually WebM from MediaRecorder) at
// `voice/<shortId>`. The Apple-compatible AAC/M4A variant is NOT produced
// here anymore — it is generated lazily on first play by
// `GET /api/voice/m4a/<shortId>` (transcode-on-demand, once per card), so
// recordings that no Apple device ever plays never pay the ffmpeg cost.
//
// Apple browsers (Safari/iOS/macOS) cannot decode the WebM container, so
// the vault player and the shared `/c/<id>` page point Apple devices at
// the lazy endpoint and everyone else at the original WebM.
//
// Transcoding failures are non-fatal: the WebM is kept and the .m4a is
// simply absent (players fall back to the WebM, then to a graceful toast).

import { getRedis, secondsUntilMidnightUTC } from '../lib/redis.js';

export const config = { runtime: 'nodejs' };

const MAX_AUDIO_BYTES = 6 * 1024 * 1024;

// Daily upload cap per IP. Set high to avoid blocking shared IPs (carrier
// NAT) — this is a safety net against callers who bypass /api/limits, not a
// per-user quota. Skipped for admin requests and when the IP is unknown.
const VOICE_MAX_PER_IP_DAY = 500;

async function isOverDailyIpLimit(req) {
  const adminSecret = req.headers['x-admin-secret'];
  if (adminSecret && process.env.ADMIN_API_SECRET && adminSecret === process.env.ADMIN_API_SECRET) {
    return false;
  }
  const clientIp = req.headers['cf-connecting-ip']
    || (req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  if (!clientIp) return false;
  try {
    const redis = getRedis();
    const today = new Date().toISOString().slice(0, 10);
    const ipKey = 'wispr:voice-ip:' + clientIp + ':' + today;
    const calls = parseInt(await redis.get(ipKey) || '0', 10);
    if (calls >= VOICE_MAX_PER_IP_DAY) return true;
    const ttl = secondsUntilMidnightUTC();
    if (calls === 0) {
      await redis.set(ipKey, '1', { ex: ttl });
    } else {
      await redis.incr(ipKey);
    }
    return false;
  } catch (e) {
    console.warn('[Voice] Rate limit check failed, allowing through:', e && e.message ? e.message : e);
    return false;
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

  if (await isOverDailyIpLimit(req)) {
    res.statusCode = 429;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', 'https://wibestories.vercel.app');
    res.end(JSON.stringify({ error: 'Daily upload limit reached' }));
    return;
  }

  try {
    const shortId = req.headers['x-short-id'];
    // Alphanumeric-only, 4-12 chars — matches the download and m4a endpoints.
    // Rejects ../ path traversal and any other non-blob-key-safe characters.
    if (!shortId || !/^[a-zA-Z0-9]{4,12}$/.test(shortId)) {
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

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', 'https://wibestories.vercel.app');
    res.end(JSON.stringify({ ok: true, m4a: false }));
  } catch (e) {
    console.error('[Voice] Upload error:', e && e.message ? e.message : e);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Voice upload failed');
  }
}
