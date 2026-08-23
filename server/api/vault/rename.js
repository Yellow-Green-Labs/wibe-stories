export const config = { runtime: 'edge' };

import { getRedis } from '../../../lib/redis.js';
import { resolveProKey } from '../../../lib/session.js';
import { getNeon } from '../../../lib/neon.js';

const MAX_NAME = 60;

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

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: 'invalid_json' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const clientId = typeof body.clientId === 'string' ? body.clientId.trim() : '';
    if (!clientId) {
      return new Response(JSON.stringify({ error: 'missing_client_id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name) {
      return new Response(JSON.stringify({ error: 'invalid_name' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (name.length > MAX_NAME) {
      return new Response(JSON.stringify({ error: 'name_too_long' }), {
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
      UPDATE vault_cards
      SET name = ${name}, updated_at = NOW(), last_accessed_at = NOW()
      WHERE pro_key = ${key} AND client_id = ${clientId}
      RETURNING *
    `;

    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'card_not_found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const r = rows[0];
    const card = {
      id: r.client_id,
      shortId: r.short_id,
      name: r.name,
      text: r.text,
      authorName: r.author_name,
      tone: r.tone,
      occasion: r.occasion,
      hasAudio: r.has_audio,
      audioUrl: r.audio_url,
      createdAt: r.created_at,
      theme: r.theme,
      imageUrl: r.image_url
    };

    return new Response(JSON.stringify({ ok: true, card }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('[Vault Rename] Error:', e.message);
    return new Response(JSON.stringify({ error: 'server_error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
