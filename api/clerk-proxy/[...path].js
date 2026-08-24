export const config = { runtime: 'edge' };

export default async function handler(req) {
  try {
    const url = new URL(req.url);
    const path = url.pathname.replace('/api/clerk-proxy', '') + url.search;
    const target = `https://frontend-api.clerk.dev${path}`;

    const upstreamReq = new Request(target, {
      method: req.method,
      headers: {
        'Clerk-Proxy-Url': 'https://wibestories.vercel.app/__clerk',
        'Clerk-Secret-Key': process.env.CLERK_SECRET_KEY,
        'X-Forwarded-For': req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown',
      },
      body: req.body,
      duplex: 'half',
    });

    const resp = await fetch(upstreamReq);

    const headers = new Headers(resp.headers);
    headers.delete('content-encoding');
    headers.delete('transfer-encoding');

    return new Response(resp.body, {
      status: resp.status,
      statusText: resp.statusText,
      headers,
    });
  } catch (e) {
    console.error('[Clerk Proxy] Error:', e.message);
    return new Response('Proxy error', { status: 502 });
  }
}