// Upload card to Vercel Blob storage.
// Accepts raw PNG bytes (no multipart parsing) for fast uploads.
// Creates two versions:
//   1. Original card PNG (for landing page display)
//   2. Branded OG JPEG — composites the card onto WS-OG-Image.png template
//      for polished link previews (1200×630, 1.91:1 aspect ratio).
//
// POST /api/upload
// Body: raw PNG bytes
// Content-Type: image/png
// Response: { shortId: "aB3xK9mP", url: "https://..." }

import { put } from '@vercel/blob';
import { generateOgImage } from './lib/og-render.js';
import Sentry from '../lib/sentry-node.js';

const VALID_TONES = new Set([
  'original', 'warm', 'bold', 'poetic', 'playful', 'reflective', 'honest',
]);
const PAL_COUNT = 10;
const VALID_CORNERS = new Set(['rounded', 'sharp']);

function safeTone(value) {
  return VALID_TONES.has(value) ? value : 'original';
}

function safePalette(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed >= 0 && parsed < PAL_COUNT
    ? String(parsed)
    : '0';
}

function safeCorners(value) {
  return VALID_CORNERS.has(value) ? value : 'rounded';
}

// Generate random 8-char alphanumeric ID
function randomId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, b => chars[b % chars.length]).join('');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Method not allowed');
    return;
  }

  try {
    // Read raw PNG bytes directly from request body.
    // Hard-cap at 2 MB — a 1080×1080 card PNG is typically 200–600 KB,
    // so 2 MB gives ample headroom while preventing runaway uploads.
    const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
    let totalBytes = 0;
    const chunks = [];
    for await (const chunk of req) {
      totalBytes += chunk.length;
      if (totalBytes > MAX_UPLOAD_BYTES) {
        res.statusCode = 413;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'File too large — maximum 2 MB' }));
        return;
      }
      chunks.push(chunk);
    }
    const pngBuffer = Buffer.concat(chunks);

    if (pngBuffer.length === 0) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Empty file');
      return;
    }

    // Generate short random ID
    const shortId = randomId();

    // Parse card metadata from custom headers (moved up so it's available early)
    const cardText = req.headers['x-card-text'] ? decodeURIComponent(req.headers['x-card-text']) : '';
    const cardName = req.headers['x-card-name'] ? decodeURIComponent(req.headers['x-card-name']) : '';
    const cardTone = safeTone(req.headers['x-card-tone']) || 'original';
    const cardP = safePalette(req.headers['x-card-p']) || '0';
    const cardR = safeCorners(req.headers['x-card-r']) || 'rounded';
    const cardTheme = req.headers['x-card-theme'] || '';
    const cardPro = req.headers['x-card-pro'] === '1';

    // Upload original card PNG (used by the landing page hero image)
    const { url } = await put(`cards/${shortId}.png`, pngBuffer, {
      access: 'public',
      addRandomSuffix: false,
      cacheControlMaxAge: 60 * 60 * 24 * 5, // 5 days
    });

    // Generate branded OG image — composites the user's card onto the
    // WS-OG-Image.png template for polished link previews.
    const host = req.headers.host || 'wibestories.vercel.app';
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const origin = `${proto}://${host}`;
    const ogBuffer = await generateOgImage({ pngBuffer, origin });

    await put(`og/${shortId}.jpg`, ogBuffer, {
      access: 'public',
      addRandomSuffix: false,
      cacheControlMaxAge: 60 * 60 * 24 * 5, // 5 days
      contentType: 'image/jpeg',
    });

    if (cardText || cardName) {
      const meta = { text: cardText, name: cardName, tone: cardTone, p: cardP, r: cardR, theme: cardTheme, pro: cardPro };
      await put(`meta/${shortId}.json`, JSON.stringify(meta), {
        access: 'public',
        addRandomSuffix: false,
        cacheControlMaxAge: 60 * 60 * 24 * 5,
        contentType: 'application/json',
      });
    }

    res.setHeader('Content-Type', 'application/json');
    // Restrict CORS to own origin — upload should only be callable from the app itself.
    res.setHeader('Access-Control-Allow-Origin', 'https://wibestories.vercel.app');
    res.end(JSON.stringify({ shortId, url }));
  } catch (e) {
    Sentry.captureException(e);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Upload error: ' + (e && e.message ? e.message : 'unknown'));
  }
}
