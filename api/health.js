export const config = { runtime: 'edge' };

import { getRedis } from '../lib/redis.js';

const INDIVIDUAL_TIMEOUT_MS = 3000;

function timeout(ms) {
  return new Promise(function(_, reject) {
    setTimeout(function() { reject(new Error('timeout')); }, ms);
  });
}

async function checkRedis() {
  var start = Date.now();
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return { status: 'unknown', error: 'UPSTASH_REDIS env not set' };
  }
  var redis = getRedis();
  await Promise.race([redis.ping(), timeout(INDIVIDUAL_TIMEOUT_MS)]);
  return { status: 'up', latency_ms: Date.now() - start };
}

async function checkNeon() {
  var start = Date.now();
  if (!process.env.NEON_DATABASE_URL) return { status: 'unknown', error: 'NEON_DATABASE_URL not set' };
  // Lazy import: keeps the module graph light on cold start and matches the
  // pattern used elsewhere for the Neon SDK.
  var { neon } = await import('@neondatabase/serverless');
  var sql = neon(process.env.NEON_DATABASE_URL);
  await Promise.race([sql`SELECT 1`, timeout(INDIVIDUAL_TIMEOUT_MS)]);
  return { status: 'up', latency_ms: Date.now() - start };
}

function checkEnv(name, envVar) {
  if (process.env[envVar]) return { status: 'up' };
  // Missing keys are a configuration gap, not an outage: they must not flip
  // the whole health check to 503 (which would fire the uptime monitor and
  // spam the status page with retries). They surface as 'unknown' instead.
  return { status: 'unknown', error: envVar + ' not set' };
}

async function taggedCheck(name, fn) {
  try {
    return { name: name, result: await fn() };
  } catch (e) {
    return { name: name, result: { status: 'error', error: e && e.message ? e.message : 'unknown' } };
  }
}

export default async function handler(req) {
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  var results = await Promise.all([
    taggedCheck('redis', checkRedis),
    taggedCheck('neon', checkNeon),
    Promise.resolve({ name: 'deepgram', result: checkEnv('DEEPGRAM_API_KEY', 'DEEPGRAM_API_KEY') }),
    Promise.resolve({ name: 'openrouter', result: checkEnv('OPENROUTER_API_KEY', 'OPENROUTER_API_KEY') }),
    Promise.resolve({ name: 'resend', result: checkEnv('RESEND_API_KEY', 'RESEND_API_KEY') }),
    Promise.resolve({ name: 'blob', result: checkEnv('BLOB_READ_WRITE_TOKEN', 'BLOB_READ_WRITE_TOKEN') }),
  ]);

  var services = {};
  var redisDown = false;
  var neonDown = false;
  var degraded = false;

  for (var i = 0; i < results.length; i++) {
    var item = results[i];
    services[item.name] = item.result;
    // 'error' means the check itself failed (timeout / connection failure).
    // 'unknown' means a config gap (env key missing) — the service may be
    // fine, so it is never treated as an outage.
    if (item.name === 'redis' && item.result.status === 'error') redisDown = true;
    if (item.name === 'neon' && item.result.status === 'error') neonDown = true;
    if (item.name !== 'redis' && item.name !== 'neon' && item.result.status === 'error') degraded = true;
  }

  // The app is only truly down when BOTH storage backends fail at once
  // (the app serves cards/audio from Blob without Redis, and Redis
  // limits failing are non-fatal). A single-service blip or a missing
  // env key must not flip the check to 503.
  var coreDown = redisDown && neonDown;

  var body = {
    status: coreDown ? 'down' : (degraded ? 'degraded' : 'ok'),
    timestamp: new Date().toISOString(),
    services: services,
  };

  return new Response(JSON.stringify(body, null, 2), {
    status: coreDown ? 503 : 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}
