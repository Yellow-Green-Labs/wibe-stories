import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// API handlers
import stt from './api/stt.js';
import upload from './api/upload.js';
import voice from './api/voice.js';
import health from './api/health.js';
import rewrite from './api/rewrite.js';
import rewriteConfirm from './api/rewrite-confirm.js';
import rewriteStatus from './api/rewrite-status.js';
import limits from './api/limits.js';
import usage from './api/usage.js';
import trackUsage from './api/track-usage.js';
import langStats from './api/lang-stats.js';
import proVerify from './api/pro-verify.js';
import proStatus from './api/pro-status.js';
import adminRevoke from './api/admin-revoke.js';
import resendKey from './api/resend-key.js';
import redeemGift from './api/redeem-gift.js';
import giftStatus from './api/gift-status.js';
import validateKey from './api/validate-key.js';
import subscribe from './api/subscribe-occasion.js';
import unsubscribe from './api/unsubscribe-occasion.js';
import beacon from './api/beacon.js';
import webhookBmac from './api/webhook-bmac.js';
import webhookResend from './api/webhooks/resend.js';
import testSend from './api/test-send-occasion.js';
import founderLetter from './api/send-founder-letter.js';
import vaultList from './api/vault/list.js';
import vaultSave from './api/vault/save.js';
import vaultDelete from './api/vault/delete.js';
import vaultMigrate from './api/vault/migrate.js';
import vaultRename from './api/vault/rename.js';
import cronOccasionEmails from './api/cron/send-occasion-emails.js';
import cronVaultChain from './api/cron/vault-chain.js';
import cronMilestones from './api/cron/milestones.js';
import cronExpiryEmails from './api/cron/expiry-emails.js';
import cleanup from './api/cleanup.js';
import voiceM4a from './api/voice/m4a/m4a.js';

const app = express();
const PORT = process.env.PORT || 3000;

// ── CORS ──────────────────────────────────────────────────────────────────
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Session-Token', 'X-Pro-Key', 'X-Admin-Secret',
    'X-Short-Id', 'X-Card-Text', 'X-Card-Name', 'X-Card-Tone', 'X-Card-P',
    'X-Card-R', 'X-Card-Pro', 'X-Language', 'X-Session-Id', 'Authorization'],
}));
app.options('*', cors());

// ── Body parsing ──────────────────────────────────────────────────────────
// Parse JSON bodies for Edge handlers that call req.json()
app.use(express.json({ limit: '10mb' }));

// For GET requests, populate req.body from query params
// so cron handlers can read req.body.job
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.body) {
    req.body = { ...req.query };
  }
  next();
});

// ── Adapter: Express req/res → Web API Request/Response ───────────────────
// Edge handlers use Web API patterns (req.json(), req.headers.get(), return new Response()).
// This adapter wraps Express objects so Edge handlers work without code changes.
function adaptEdge(handler) {
  return async (expressReq, expressRes) => {
    try {
      const url = `http://localhost${expressReq.url}`;
      const headers = new Headers();
      for (const [key, value] of Object.entries(expressReq.headers)) {
        if (value !== undefined) {
          headers.set(key, Array.isArray(value) ? value.join(', ') : value);
        }
      }

      let body = undefined;
      if (expressReq.method !== 'GET' && expressReq.method !== 'HEAD' && expressReq.body !== undefined) {
        if (typeof expressReq.body === 'object' && expressReq.body !== null) {
          body = JSON.stringify(expressReq.body);
        } else {
          body = expressReq.body;
        }
      }

      const webReq = new Request(url, {
        method: expressReq.method,
        headers,
        body,
      });

      const webRes = await handler(webReq);

      expressRes.statusCode = webRes.status;
      webRes.headers.forEach((value, key) => {
        expressRes.setHeader(key, value);
      });

      if (webRes.body) {
        const reader = webRes.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          expressRes.write(value);
        }
      }
      expressRes.end();
    } catch (e) {
      console.error('[Adapter] Error:', e.message);
      if (!expressRes.headersSent) {
        expressRes.statusCode = 500;
        expressRes.end('Internal server error');
      }
    }
  };
}

// ── Node.js handlers (req, res) ──────────────────────────────────────────
// These already use Express-compatible (req, res) pattern. Wrap with error handling.
function wrapNode(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (e) {
      console.error('[Handler] Error:', e.message);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.end('Internal server error');
      }
    }
  };
}

// ── Routes ────────────────────────────────────────────────────────────────

// Health (Edge handler)
app.all('/api/health', adaptEdge(health));

// Core app (Edge handlers)
app.all('/api/stt', adaptEdge(stt));
app.all('/api/rewrite', adaptEdge(rewrite));
app.all('/api/rewrite-confirm', adaptEdge(rewriteConfirm));
app.all('/api/rewrite-status', adaptEdge(rewriteStatus));
app.all('/api/limits', adaptEdge(limits));
app.all('/api/usage', adaptEdge(usage));
app.all('/api/track-usage', adaptEdge(trackUsage));
app.all('/api/lang-stats', adaptEdge(langStats));
app.all('/api/pro-verify', adaptEdge(proVerify));
app.all('/api/pro-status', adaptEdge(proStatus));
app.all('/api/admin-revoke', adaptEdge(adminRevoke));
app.all('/api/resend-key', adaptEdge(resendKey));
app.all('/api/redeem-gift', adaptEdge(redeemGift));
app.all('/api/gift-status', adaptEdge(giftStatus));
app.all('/api/validate-key', adaptEdge(validateKey));
app.all('/api/subscribe-occasion', adaptEdge(subscribe));
app.all('/api/unsubscribe-occasion', adaptEdge(unsubscribe));
app.all('/api/send-founder-letter', adaptEdge(founderLetter));
app.all('/api/beacon', adaptEdge(beacon));
app.all('/api/webhook-bmac', adaptEdge(webhookBmac));
app.all('/api/vault/list', adaptEdge(vaultList));
app.all('/api/vault/save', adaptEdge(vaultSave));
app.all('/api/vault/delete', adaptEdge(vaultDelete));
app.all('/api/vault/migrate', adaptEdge(vaultMigrate));
app.all('/api/vault/rename', adaptEdge(vaultRename));

// Core app (Node.js handlers)
app.all('/api/upload', wrapNode(upload));
app.all('/api/voice', wrapNode(voice));
app.all('/api/voice/m4a/:id', wrapNode(voiceM4a));
app.all('/api/test-send-occasion', wrapNode(testSend));
app.all('/api/webhooks/resend', wrapNode(webhookResend));

// Cron (Node.js handlers) — GET /api/cron?job=X
app.all('/api/cron', wrapNode(async (req, res) => {
  const job = req.query.job || req.body?.job;
  if (!job) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Missing ?job= parameter' }));
    return;
  }
  switch (job) {
    case 'occasion-emails': await cronOccasionEmails(req, res); break;
    case 'cleanup': await cleanup(req, res); break;
    case 'vault-chain': await cronVaultChain(req, res); break;
    case 'milestones': await cronMilestones(req, res); break;
    case 'expiry-emails': await cronExpiryEmails(req, res); break;
    default:
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Unknown job: ' + job }));
  }
}));

// ── Static files ──────────────────────────────────────────────────────────
// Serve the frontend (HTML/JS/CSS) from the project root
app.use(express.static(path.join(__dirname, '..')));

// ── Catch-all 404 ─────────────────────────────────────────────────────────
app.all('*', (req, res) => {
  res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ error: 'Not found' }));
});

// ── Start ─────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Wibe API] Server running on port ${PORT}`);
});
