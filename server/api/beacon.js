export const config = { runtime: 'edge' };

export default function handler(req) {
  const d = process.env.WS_Acknowledged_Logs;
  if (!d) return new Response(null, { status: 204 });
  return Response.redirect(d, 302);
}
