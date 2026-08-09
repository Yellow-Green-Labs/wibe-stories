// OG image generator — composites the user's card PNG onto the branded
// template (WS-OG-Image.png) for a polished link-preview image.
//
// Template: assets/brand/WS-OG-Image.png (1200×630, deployed as static asset)
// Card frame area: right side, x=557 y=30, inner ~570×570
//
// No new dependencies — uses sharp (already installed).

import sharp from 'sharp';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Card placement inside the template frame (from Figma)
const CARD_LEFT = 557;
const CARD_TOP = 30;
const CARD_SIZE = 570;

let _tplCache = null;

async function loadTemplate(origin) {
  if (_tplCache) return _tplCache;

  // Try HTTP fetch first (works on Vercel when template is committed + deployed)
  try {
    const res = await fetch(`${origin}/assets/brand/WS-OG-Image.png`);
    if (res.ok) {
      _tplCache = Buffer.from(await res.arrayBuffer());
      return _tplCache;
    }
  } catch (_) { /* fall through to local */ }

  // Fallback: read from local filesystem (works in dev / after deploy)
  const localPath = join(__dirname, '..', 'assets', 'brand', 'WS-OG-Image.png');
  _tplCache = readFileSync(localPath);
  return _tplCache;
}

export async function generateOgImage({ pngBuffer, origin }) {
  const tplBuf = await loadTemplate(origin);

  // Resize the user's 1:1 card to fit inside the frame.
  // Transparent background so rounded corners show through to the template.
  const cardBuf = await sharp(pngBuffer)
    .resize(CARD_SIZE, CARD_SIZE, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  return sharp(tplBuf)
    .composite([{ input: cardBuf, left: CARD_LEFT, top: CARD_TOP }])
    .jpeg({ quality: 85, mozjpeg: true, chromaSubsampling: '4:2:0' })
    .toBuffer();
}
