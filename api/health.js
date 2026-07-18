export const config = { runtime: 'edge' };

import { getRedis } from '../lib/redis.js';
import { neon } from '@neondatabase/serverless';

const INDIVIDUAL_TIMEOUT_MS = 2000;

function timeout(ms) {
  return new Promise(function(_, reject) {
    setTimeout(function() { reject(new Error('timeout')); }, ms);
  });
}

async function checkRedis() {
  var start = Date.now();
  var redis = getRedis();
  await Promise.race([redis.ping(), timeout(INDIVIDUAL_TIMEOUT_MS)]);
  return { status: 'up', latency_ms: Date.now() - start };
}

async function checkNeon() {
  var start = Date.now();
  if (!process.env.NEON_DATABASE_URL) return { status: 'unknown', error: 'NEON_DATABASE_URL not set' };
  var sql = neon(process.env.NEON_DATABASE_URL);
  await Promise.race([sql`SELECT 1`, timeout(INDIVIDUAL_TIMEOUT_MS)]);
  return { status: 'up', latency_ms: Date.now() - start };
}

function checkEnv(name, envVar) {
  if (process.env[envVar]) return { status: 'up' };
  return { status: 'unknown', error: envVar + ' not set' };
}

export default async function handler(req) {
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  var results = await Promise.allSettled([
    checkRedis().then(function(r) { return { name: 'redis', result: r }; }),
    checkNeon().then(function(r) { return { name: 'neon', result: r }; }),
    Promise.resolve({ name: 'deepgram', result: checkEnv('DEEPGRAM_API_KEY', 'DEEPGRAM_API_KEY') }),
    Promise.resolve({ name: 'openrouter', result: checkEnv('OPENROUTER_API_KEY', 'OPENROUTER_API_KEY') }),
    Promise.resolve({ name: 'resend', result: checkEnv('RESEND_API_KEY', 'RESEND_API_KEY') }),
    Promise.resolve({ name: 'blob', result: checkEnv('BLOB_READ_WRITE_TOKEN', 'BLOB_READ_WRITE_TOKEN') }),
  ]);

  var services = {};
  var allUp = true;

  for (var i = 0; i < results.length; i++) {
    var item = results[i];
    if (item.status === 'fulfilled') {
      services[item.value.name] = item.value.result;
      if (item.value.result.status !== 'up') allUp = false;
    } else {
      services['check_' + i] = { status: 'error', error: item.reason ? item.reason.message : 'unknown' };
      allUp = false;
    }
  }

  var body = {
    status: allUp ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    services: services,
  };

  return new Response(JSON.stringify(body, null, 2), {
    status: allUp ? 200 : 503,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}
