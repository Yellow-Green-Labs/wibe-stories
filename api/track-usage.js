export const config = { runtime: 'edge' };

import { getLangStatsRedis } from '../lib/lang-stats-redis.js';

export default async function handler(req) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { lang, source } = body || {};
    console.log('[TrackUsage] Received lang=' + lang + ' source=' + source);

    if (!lang || !source) {
      return new Response(JSON.stringify({ error: 'lang and source are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (source !== 'voice' && source !== 'story') {
      return new Response(JSON.stringify({ error: 'source must be "voice" or "story"' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (process.env.VERCEL_ENV === 'production') {
      try {
        const redis = getLangStatsRedis();
        const field = source + ':' + lang;
        console.log('[TrackUsage] Incrementing field=' + field);
        await redis.hincrby('wispr:langstats', field, 1);
        console.log('[TrackUsage] Redis increment succeeded');
      } catch (redisErr) {
        console.warn('[TrackUsage] Redis unavailable:', redisErr.message);
      }
    } else {
      console.log('[TrackUsage] Skipped — VERCEL_ENV=' + process.env.VERCEL_ENV);
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('[TrackUsage] Error:', e);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
