// OG image server route for shared cards.
// Reads the pre-rendered JPEG from Blob storage and serves it
// directly to crawlers (same-origin, no proxy hop).
//
// GET /api/og/:id → returns image/jpeg

const BLOB_HOST = 'jkzbaevzmimaelrr.public.blob.vercel-storage.com';

export default async function handler(req, res) {
  const url = new URL(req.url, 'https://wibestories.vercel.app');
  const id = url.pathname.replace(/^\/api\/og\//, '');

  if (!id || id.length < 4 || id.length > 12 || !/^[a-zA-Z0-9]+$/.test(id)) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Not found');
    return;
  }

  try {
    const blobUrl = `https://${BLOB_HOST}/og/${id}.jpg`;
    const blobRes = await fetch(blobUrl);

    if (!blobRes.ok) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Image not found');
      return;
    }

    const imageBuffer = await blobRes.arrayBuffer();

    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    res.setHeader('Content-Length', imageBuffer.byteLength);
    res.end(Buffer.from(imageBuffer));
  } catch (e) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Error loading image');
  }
}
