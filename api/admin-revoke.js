export const config = { runtime: 'edge' };

import { getRedis, KEYS } from '../lib/redis.js';

// Admin endpoint to manually revoke a Pro key.
// Used for chargebacks, fraud, or manual interventions.
// Protected by ADMIN_API_SECRET — never expose this secret publicly.
//
// POST /api/admin-revoke
// Header: x-admin-secret: <ADMIN_API_SECRET>
// Body: { email: "user@example.com" }  OR  { key: "WS-XXXX-XXXX-XXXX" }

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const adminSecret = req.headers.get('x-admin-secret');
  if (!adminSecret || !process.env.ADMIN_API_SECRET || adminSecret !== process.env.ADMIN_API_SECRET) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { email, key: rawKey } = await req.json();

    if (!email && !rawKey) {
      return new Response(JSON.stringify({ error: 'Provide email or key' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const redis = getRedis();
    let proKey = rawKey ? rawKey.trim().toUpperCase() : null;

    // If email provided, look up the key
    if (!proKey && email) {
      proKey = await redis.get(KEYS.emailLookup(email.toLowerCase().trim()));
      if (!proKey) {
        return new Response(JSON.stringify({ error: 'No key found for that email' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    const raw = await redis.get(KEYS.upgradeKey(proKey));
    if (!raw) {
      return new Response(JSON.stringify({ error: 'Key not found in Redis' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;

    if (parsed.revoked) {
      return new Response(JSON.stringify({ ok: true, message: 'Key was already revoked', key: proKey }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await redis.set(
      KEYS.upgradeKey(proKey),
      JSON.stringify({ ...parsed, revoked: true, revokedAt: new Date().toISOString(), revokedBy: 'admin' })
    );

    console.log(`[AdminRevoke] Key revoked: ${proKey} (email: ${parsed.email || 'unknown'})`);

    // Never return email in response body — keep it in server logs only
    return new Response(JSON.stringify({ ok: true, key: proKey }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('[AdminRevoke] Error:', e.message);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
