export const config = { runtime: 'edge' };

import { getRedis } from '../../lib/redis.js';
import { validateProKey } from '../../lib/pro-key.js';
import { getNeon } from '../../lib/neon.js';

export default async function handler(req) {
  if (req.method !== 'GET') {
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
        image_url TEXT NOT NULL DEFAULT ''
      );
    `;
    await sql`
      ALTER TABLE vault_cards ADD COLUMN IF NOT EXISTS image_url TEXT NOT NULL DEFAULT '';
    `;
    const rows = await sql`
      SELECT * FROM vault_cards
      WHERE pro_key = ${proKey.trim().toUpperCase()}
      ORDER BY created_at DESC
    `;

    const cards = rows.map(function (r) {
      return {
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
    });

    return new Response(JSON.stringify({ cards }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('[Vault List] Error:', e.message);
    return new Response(JSON.stringify({ error: 'server_error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
