export default async function handler(req, res) {
  const BLOB_HOST = 'jkzbaevzmimaelrr.public.blob.vercel-storage.com';

  const url = new URL(req.url, 'https://wibestories.vercel.app');
  const id = url.pathname.replace(/^\/download\//, '').replace(/[^\w-]/g, '');

  if (!id || id.length < 4 || id.length > 12 || !/^[a-zA-Z0-9]+$/.test(id)) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Invalid ID');
    return;
  }

  // Determine file type from query param or default to PNG
  const type = url.searchParams.get('type') || 'png';
  let blobPath, contentType, fileName;

  if (type === 'voice') {
    blobPath = `voice/${id}`;
    contentType = 'audio/webm';
    fileName = 'wibe-voice.webm';
  } else {
    blobPath = `cards/${id}.png`;
    contentType = 'image/png';
    fileName = 'wibe-story.png';
  }

  try {
    const blobRes = await fetch(`https://${BLOB_HOST}/${blobPath}`);
    if (!blobRes.ok) {
      res.statusCode = blobRes.status;
      res.setHeader('Content-Type', 'text/plain');
      res.end('File not found');
      return;
    }

    const buffer = await blobRes.arrayBuffer();
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.statusCode = 200;
    res.end(Buffer.from(buffer));
  } catch (e) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Download failed');
  }
}
