export const config = { runtime: 'edge' };

import { getRedis } from '../../../lib/redis.js';
import { resolveProKey } from '../../../lib/session.js';
import { getNeon } from '../../../lib/neon.js';

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const authValue = req.headers.get('x-session-token') || req.headers.get('x-pro-key') || '';
    const redis = getRedis();
    const result = await resolveProKey(redis, authValue);
    if (!result.valid || !result.proKey) {
      return new Response(JSON.stringify({ error: 'invalid_key' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const key = result.proKey;

    const { ids } = await req.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return new Response(JSON.stringify({ error: 'ids required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const sql = getNeon();
    await sql`
      CREATE TABLE IF NOT EXISTS vault_cards (
        id SERIAL PRIMARY KEY,
        client_id TEXT NOT NULL DEFAULT '',
        pro_key TEXT NOT NULL,
        short_id TEXT NOT NULL DEFAULT '',
        name TEXT NOT NULL DEFAULT '',
        text TEXT NOT NULL DEFAULT '',
        author_name TEXT NOT NULL DEFAULT '',
        tone TEXT NOT NULL DEFAULT 'original',
        occasion TEXT NOT NULL DEFAULT '',
        has_audio BOOLEAN NOT NULL DEFAULT FALSE,
        audio_url TEXT NOT NULL DEFAULT '',
        theme TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        image_url TEXT NOT NULL DEFAULT '',
        last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;
    await sql`
      ALTER TABLE vault_cards ADD COLUMN IF NOT EXISTS image_url TEXT NOT NULL DEFAULT '';
    `;
    await sql`
      ALTER TABLE vault_cards ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
    `;
    const rows = await sql`
      DELETE FROM vault_cards
      WHERE pro_key = ${key}
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
