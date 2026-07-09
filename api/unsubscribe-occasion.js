export const config = { runtime: 'edge' };

import { getRedis, KEYS } from '../lib/redis.js';

export default async function handler(req) {
  const url = new URL(req.url);
  const enc = url.searchParams.get('e') || '';

  if (!enc) {
    return new Response(html('Missing unsubscribe token.'), {
      status: 400,
      headers: { 'Content-Type': 'text/html;charset=utf-8' },
    });
  }

  let email;
  try {
    email = atob(enc);
  } catch {
    return new Response(html('Invalid unsubscribe token.'), {
      status: 400,
      headers: { 'Content-Type': 'text/html;charset=utf-8' },
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return new Response(html('Invalid email address.'), {
      status: 400,
      headers: { 'Content-Type': 'text/html;charset=utf-8' },
    });
  }

  try {
    const redis = getRedis();
    await redis.srem(KEYS.emailSubscribersSet, email);
  } catch (err) {
    console.error('[UnsubscribeOccasion] Redis error:', err.message);
    return new Response(html('Something went wrong. Please try again.'), {
      status: 500,
      headers: { 'Content-Type': 'text/html;charset=utf-8' },
    });
  }

  return new Response(html(null, true), {
    status: 200,
    headers: { 'Content-Type': 'text/html;charset=utf-8' },
  });
}

function html(error, success) {
  const title = success ? 'Unsubscribed' : 'Error';
  const msg = success
    ? '<p style="font-size:20px;margin:0 0 8px;">You have been unsubscribed.</p><p style="font-size:14px;color:#77776a;margin:0;">You will no longer receive occasion reminder emails from Wibe Stories.</p>'
    : '<p style="font-size:20px;margin:0 0 8px;">Something went wrong.</p><p style="font-size:14px;color:#77776a;margin:0;">' + error + '</p>';
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${title} - Wibe Stories</title></head>
<body style="margin:0;padding:0;background-color:#ffffeb;font-family:Inter,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;">
  <div style="background:#ffffeb;border-radius:12px;padding:40px;text-align:center;border:1px solid #e0dcd0;box-shadow:0 2px 12px rgba(26,26,26,0.08);max-width:400px;">
    <p style="font-size:40px;margin:0 0 12px;">&#x1F49B;</p>
    ${msg}
    <p style="margin:24px 0 0;"><a href="https://wibestories.vercel.app" style="color:#7c3aed;text-decoration:underline;font-size:14px;">Wibe Stories</a></p>
  </div>
</body>
</html>`;
}
