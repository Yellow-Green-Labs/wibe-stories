export const config = { runtime: 'edge' };

export default async function handler(req) {
  try {
    const url = new URL(req.url);

    // Path comes from the rewrite as a query param: /__clerk/:path* -> /api/clerk-proxy?clerkPath=:path*
    let clerkPath = url.searchParams.get('clerkPath') || '';

    // Fallback: called directly as /api/clerk-proxy/foo/bar
    if (!clerkPath) {
      const prefix = '/api/clerk-proxy/';
      if (url.pathname.startsWith(prefix)) {
        clerkPath = decodeURIComponent(url.pathname.slice(prefix.length));
      }
    }
    if (clerkPath.startsWith('/')) clerkPath = clerkPath.slice(1);

    // Forward the query string minus our own clerkPath param
    const params = new URLSearchParams(url.search);
    params.delete('clerkPath');
    const qs = params.toString();

    const target = `https://frontend-api.clerk.dev/${clerkPath}${qs ? '?' + qs : ''}`;

    const upstreamHeaders = new Headers();
    for (const [k, v] of req.headers) {
      if (['host', 'content-length', 'connection', 'transfer-encoding', 'accept-encoding', 'clerk-api-version'].includes(k.toLowerCase())) continue;
      upstreamHeaders.set(k, v);
    }
    upstreamHeaders.set('Clerk-Proxy-Url', 'https://wibestories.vercel.app/__clerk');
    upstreamHeaders.set('Clerk-Secret-Key', process.env.CLERK_SECRET_KEY || '');
    upstreamHeaders.set('X-Forwarded-For', (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown');

    // redirect: 'manual' — pass 307/302 through so the browser re-enters the
    // proxy with the version-resolved path (Clerk rewrites Location to /__clerk).
    const upstreamReq = new Request(target, {
      method: req.method,
      headers: upstreamHeaders,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : req.body,
      redirect: 'manual',
    });

    const resp = await fetch(upstreamReq);

    const responseHeaders = new Headers();
    for (const [k, v] of resp.headers.entries()) {
      if (['content-encoding', 'transfer-encoding'].includes(k.toLowerCase())) continue;
      responseHeaders.append(k, v);
    }
    // Rewrite the redirect Location so it stays inside our proxy domain
    if (resp.status >= 300 && resp.status < 400) {
      const loc = resp.headers.get('location');
      if (loc) {
        try {
          const locUrl = new URL(loc);
          if (locUrl.hostname.endsWith('clerk.dev') || locUrl.hostname.endsWith('clerk.com')) {
            responseHeaders.set('Location', '/__clerk' + locUrl.pathname + locUrl.search);
          }
        } catch (_) {}
      }
    }
    responseHeaders.set('Access-Control-Allow-Origin', '*');

    return new Response(resp.body, {
      status: resp.status,
      statusText: resp.statusText,
      headers: responseHeaders,
    });
  } catch (e) {
    console.error('[Clerk Proxy] Error:', e.message);
    return new Response('Proxy error', { status: 502 });
  }
}