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

    const { cards } = await req.json();
    if (!Array.isArray(cards) || cards.length === 0) {
      return new Response(JSON.stringify({ ok: true, migrated: 0 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const sql = getNeon();
    const key = proKey.trim().toUpperCase();
    let migrated = 0;

    for (const card of cards) {
      await sql`
        INSERT INTO vault_cards (client_id, pro_key, short_id, name, text, author_name, tone, occasion, has_audio, audio_url, created_at, theme)
        VALUES (${card.id || ''}, ${key}, ${card.shortId || ''}, ${card.name || 'Untitled'}, ${card.text || ''}, ${card.authorName || ''}, ${card.tone || 'original'}, ${card.occasion || ''}, ${!!card.hasAudio}, ${card.audioUrl || ''}, ${card.createdAt || new Date().toISOString()}, ${card.theme || ''})
        ON CONFLICT (client_id, pro_key) DO NOTHING
      `;
      migrated++;
    }

    return new Response(JSON.stringify({ ok: true, migrated }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('[Vault Migrate] Error:', e.message);
    return new Response(JSON.stringify({ error: 'server_error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
