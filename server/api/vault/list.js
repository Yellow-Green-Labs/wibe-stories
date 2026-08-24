export const config = { runtime: 'edge' };

import { getRedis, KEYS } from '../../../lib/redis.js';
import { resolveProKey } from '../../../lib/session.js';
import { getNeon } from '../../../lib/neon.js';

export default async function handler(req) {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const authValue = req.headers.get('x-session-token') || req.headers.get('x-pro-key') || '';
    /* Admin bypass — skip Redis entirely for the admin secret */
    const adminKey = process.env.ADMIN_API_SECRET;
    let key;
    if (adminKey && authValue && authValue.toUpperCase() === adminKey.toUpperCase()) {
      key = adminKey.toUpperCase();
    } else {
      const redis = getRedis();
      const result = await resolveProKey(redis, authValue);
      if (!result.valid || !result.proKey) {
        return new Response(JSON.stringify({ error: 'invalid_key' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      key = result.proKey;
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
    /* Auto-restore: returning Pro user — adopt prior vault cards into the new key */
    if (redis) {
      try {
        const kk = KEYS.upgradeKey(key);
        const kr = await redis.get(kk);
      if (kr) {
        const kd = typeof kr === 'string' ? JSON.parse(kr) : kr;
        if (kd.email) {
          const pr = await redis.get(KEYS.userPrevPass(kd.email));
          if (pr) {
            const prev = typeof pr === 'string' ? JSON.parse(pr) : pr;
            const prevKey = prev.key;
            if (prevKey && typeof prevKey === 'string' && prevKey !== key) {
              /* Drop rows whose client_id already exists under the new key (new key wins) */
              await sql`
                DELETE FROM vault_cards
                WHERE pro_key = ${prevKey}
                  AND client_id IN (SELECT client_id FROM vault_cards WHERE pro_key = ${key})
              `;
              /* Adopt the rest, newest first, capped so the new key never exceeds 50 */
              await sql`
                UPDATE vault_cards SET pro_key = ${key}, last_accessed_at = NOW()
                WHERE pro_key = ${prevKey}
                  AND id IN (
                    SELECT id FROM vault_cards WHERE pro_key = ${prevKey}
                    ORDER BY created_at DESC
                    LIMIT GREATEST(0, 50 - (SELECT COUNT(*) FROM vault_cards WHERE pro_key = ${key}))
                  )
              `;
            }
          }
        }
      }
    } catch (e) {
      console.error('[Vault List] Auto-restore skipped:', e.message);
      }
    }
    /* opening the vault is the access signal — touch every card for this key */
    await sql`
      UPDATE vault_cards SET last_accessed_at = NOW() WHERE pro_key = ${key};
    `;
    const rows = await sql`
      SELECT * FROM vault_cards
      WHERE pro_key = ${key}
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
