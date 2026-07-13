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

    const { clientId, shortId, name, text, authorName, tone, occasion, hasAudio, audioUrl, createdAt, theme } = await req.json();

    const sql = getNeon();
    const rows = await sql`
      INSERT INTO vault_cards (client_id, pro_key, short_id, name, text, author_name, tone, occasion, has_audio, audio_url, created_at, theme)
      VALUES (${clientId || ''}, ${proKey.trim().toUpperCase()}, ${shortId || ''}, ${name || 'Untitled'}, ${text || ''}, ${authorName || ''}, ${tone || 'original'}, ${occasion || ''}, ${!!hasAudio}, ${audioUrl || ''}, ${createdAt || new Date().toISOString()}, ${theme || ''})
      RETURNING *
    `;

    return new Response(JSON.stringify({ ok: true, card: rows[0] }), {
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
