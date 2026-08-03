export const config = { runtime: 'edge' };

import { getRedis } from '../../lib/redis.js';
import { resolveProKey } from '../../lib/session.js';
import { getNeon } from '../../lib/neon.js';

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

    const { clientId, shortId, name, text, authorName, tone, occasion, hasAudio, audioUrl, createdAt, theme, imageUrl } = await req.json();

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

    // Atomic limit enforcement: the COUNT check and INSERT happen in a single
    // statement, so N concurrent requests can never all pass the check
    // (previously a SELECT COUNT followed by INSERT had a TOCTOU window).
    const rows = await sql`
      INSERT INTO vault_cards (client_id, pro_key, short_id, name, text, author_name, tone, occasion, has_audio, audio_url, created_at, theme, image_url)
      SELECT ${clientId || ''}, ${key}, ${shortId || ''}, ${name || 'Untitled'}, ${text || ''}, ${authorName || ''}, ${tone || 'original'}, ${occasion || ''}, ${!!hasAudio}, ${audioUrl || ''}, ${createdAt || new Date().toISOString()}, ${theme || ''}, ${imageUrl || ''}
      WHERE (SELECT COUNT(*) FROM vault_cards WHERE pro_key = ${key}) < 50
      RETURNING *
    `;

    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'vault_full', message: 'Vault limit of 50 cards reached' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    var r = rows[0];
    var cardData = {
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

    return new Response(JSON.stringify({ ok: true, card: cardData }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('[Vault Save] Error:', e.message);
    return new Response(JSON.stringify({ error: 'server_error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
