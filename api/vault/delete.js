export const config = { runtime: 'edge' };

import { getRedis } from '../../lib/redis.js';
import { validateProKey } from '../../lib/pro-key.js';
import { getNeon } from '../../lib/neon.js';

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const proKey = req.headers.get('x-pro-key') || '';
    const redis = getRedis();
    const result = await validateProKey(redis, proKey);
    if (!result.valid) {
      return new Response(JSON.stringify({ error: 'invalid_key' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { ids } = await req.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return new Response(JSON.stringify({ error: 'ids required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const sql = getNeon();
    const rows = await sql`
      DELETE FROM vault_cards
      WHERE pro_key = ${proKey.trim().toUpperCase()}
      AND client_id = ANY(${ids})
    `;

    return new Response(JSON.stringify({ ok: true, deleted: rows.length }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('[Vault Delete] Error:', e.message);
    return new Response(JSON.stringify({ error: 'server_error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
