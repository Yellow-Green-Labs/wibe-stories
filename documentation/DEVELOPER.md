# Wibe Stories — Developer Guide

> **Status:** Live prototype. This document is for developers working on the codebase.

---

## Table of contents

1. [Getting started](#1-getting-started)
2. [Architecture overview](#2-architecture-overview)
3. [Code structure](#3-code-structure)
4. [Front end](#4-front-end)
5. [API routes](#5-api-routes)
6. [Data stores](#6-data-stores)
7. [Occasion email campaigns](#7-occasion-email-campaigns)
8. [Development workflow](#8-development-workflow)
9. [Deployment](#9-deployment)
10. [Testing](#10-testing)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Getting started

### Prerequisites

- Node.js 18+
- Vercel CLI (`npm i -g vercel`)
- A Vercel account with access to the project

### Local development

```bash
# Full app with serverless routes
vercel dev

# Or open wisprstories.html directly in a browser (no API routes)
```

The front end has no build step. `package.json` exists for serverless dependencies only.

### Environment variables

13 env vars configured in Vercel. Set them in your local `.env` or use `vercel env pull`.

| Variable | Purpose |
|---|---|
| `DEEPGRAM_API_KEY` | Primary Deepgram STT |
| `DEEPGRAM_API_KEY_ADMIN` | Admin STT key path |
| `ADMIN_API_SECRET` | Gate for admin STT path |
| `OPENROUTER_API_KEY` | LLM rewriting + Whisper STT |
| `UPSTASH_REDIS_REST_URL` | Main Redis (limits, caches, keys) |
| `UPSTASH_REDIS_REST_TOKEN` | Main Redis auth |
| `UPSTASH_REDIS_LANG_STATS_URL` | Language-stats Redis |
| `UPSTASH_REDIS_LANG_STATS_TOKEN` | Language-stats Redis auth |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob access |
| `CRON_SECRET` | Authorises cleanup cron |
| `BMAC_WEBHOOK_SECRET` | Buy Me a Coffee webhook HMAC |
| `RESEND_API_KEY` | Pro-key and occasion-email sending via Resend |
| `WS_Acknowledged_Logs` | Internal redirect target (optional) |

Routes degrade gracefully when a key is missing — the related feature is disabled.

> **Resend sender domain:** All emails (Pro keys, key recovery, occasion reminders) currently use Resend's default test domain `onboarding@resend.dev`. This is a placeholder — it works for now but should be replaced with a custom sender once a domain is purchased and verified in the Resend dashboard. The sender is hardcoded in 3 files:
> - `api/webhook-bmac.js:7` — `SENDER`
> - `api/resend-key.js:6` — `SENDER`
> - `api/lib/occasion-email.js:217` — `from`
> Update all three when the custom domain is ready.

---

## 2. Architecture overview

```
wisprstories.html        Entry point (loads wisprstories.js)
wisprstories.js          All app logic: STT, recording, card creation, share, tones, i18n
global/                  Shared modules (fonts, footer, occasions, CSS)
assets/                  Static assets (i18n, languages, card backgrounds, fonts)
api/                     Vercel serverless routes
lib/                     Shared server modules (Redis clients, Pro key validator)
scripts/                 Verification scripts (Node.js)
sw.js                    Service worker
vercel.json              Deployment config (rewrites, redirects, headers, cron)
```

### Request flow

```
Record → Web Speech API → (unsupported/failed) → POST /api/stt → Deepgram / Whisper
   ↓
Transcript in text box → (optional) tap tone → POST /api/rewrite → OpenRouter LLM
   ↓
Create card (client render) → Share → POST /api/upload → Vercel Blob + OG image
   ↓
Recipient opens wibestories.vercel.app/c/<shortId>
   ├─ social bot  → /api/c/[id] serves OG meta (large preview)
   └─ human       → landing page with the card + "Create your own" CTA
```

---

## 3. Code structure

### Root files

| File | Purpose |
|---|---|
| `wisprstories.html` | Main HTML entry point |
| `wisprstories.js` | All app logic (STT, recording, card creation, share, tones, i18n) |
| `about.html` | About page |
| `features.html` | Features page (5 capability sections: Speak, Write, Rewrite, Design, Share) |
| `language-stats.html` | Language stats page |
| `sw.js` | Service worker (three-tier caching) |
| `site.webmanifest` | PWA manifest |
| `vercel.json` | Deployment config |
| `package.json` | Serverless dependencies |

### `global/` — shared modules

| File | Purpose |
|---|---|
| `fonts.js` | Per-script × per-tone font mapping |
| `footer-menu.js` | Footer menu rendering, i18n, reorder |
| `about.js` | About page behaviour |
| `features.js` | Features page behaviour |
| `language-stats.js` | Language stats page behaviour |
| `capacity-check.js` | Daily capacity check (99-user cap), admin/pro key headers |
| `demo.js` | Demo animation (disabled, preserved for restoration) |
| `occasions/` | 60-occasion detection (triggers, dates, countries) |
| `styles/` | 14 CSS modules (`main.css` aggregates) |

### `assets/` — static assets

| Directory | Purpose |
|---|---|
| `i18n/` | 11 UI locales + `i18n.js` loader |
| `languages/` | 44 speech languages + loader |
| `card-bgs/` | 20 baked WebP card backgrounds |
| `og-1080/`, `og-1200x630/` | OG image templates |
| `occasions/` | 60 occasion images |
| `fontawesome/`, `html2canvas/`, `flag-icons/` | Vendored libraries |

### `api/` — serverless routes

See [Section 5](#5-api-routes) for the full list.

### `lib/` — shared server modules

| File | Purpose |
|---|---|
| `redis.js` | Main Upstash client + key registry |
| `lang-stats-redis.js` | Language-stats Upstash client |
| `pro-key.js` | Central Pro key validator (used by 6+ API routes) |
| `chart.umd.min.js` | Chart.js (language-stats page) |

---

## 4. Front end

### Recording flow

1. **Pre-flight mic check** — `navigator.mediaDevices.getUserMedia()` is called immediately to catch permission blocks before the user taps Record.
2. **Speech recognition** — Web Speech API is the primary path. If unsupported or failed, falls back to `api/stt.js` (Deepgram Nova-3 or OpenRouter Whisper).
3. **Ready timer** — After recording stops, a 2-second ready timer runs before the transcript is placed in the text box.
4. **Recording counter** — Server-side enforced: 5 recordings/user/day (free), 50 (pro). Counter is re-fetched after every `reportRecordingDuration` to prevent client-server drift.

### Card creation

- The card is rendered client-side using HTML/CSS.
- Background: pre-baked WebP images (`assets/card-bgs/`).
- Export: html2canvas (vendored, not CDN).
- The card image carries only the user's words and the Wibe Stories mark. Wispr Flow attribution lives on the page (footer and "Try Wispr Flow" CTA), not baked into the card.

### Tone system

7 tones: Original (default) + 6 rewrite tones (Warm, Bold, Poetic, Playful, Reflective, Honest). Each tone changes the **per-script font family** and a small **letter-spacing** adjustment. Font style and weight are held constant.

### i18n

- 11 UI locales (English + 10 non-English).
- 44 speech languages (shown in a 2-column modal).
- 20 script types mapped to font families per tone.
- `data-i18n` attribute system + `getI18nSync()`.

### PWA

- Service worker with three-tier caching: network-only (API), stale-while-revalidate (fonts), cache-first (static assets).
- Cache name: `wispr-stories-shell-v12`.
- Version polling: checks `version.json` every 60 seconds and on tab focus.

---

## 5. API routes

25 serverless routes in `api/`.

| Route | Purpose | Runtime |
|---|---|---|
| `stt.js` | Speech-to-text fallback (Deepgram / Whisper) | Edge |
| `rewrite.js` | LLM tone rewrite (preview, no quota tick) | Edge |
| `rewrite-confirm.js` | Commits a rewrite use (Redis INCR) | Node.js |
| `rewrite-status.js` | Read-only per-tone counts | Node.js |
| `upload.js` | Upload card PNG, generate OG image via sharp | Node.js |
| `c/[id].js` | Shared-card landing page + OG metadata | Node.js |
| `card.js` | Card data endpoint | Node.js |
| `og.js` | Dynamic OG image renderer (sharp + SVG) | Node.js |
| `og/[id].js` | Serve card OG image JPEG from Blob | Node.js |
| `voice.js` | Optional audio upload (voice-attached cards) | Node.js |
| `usage.js` | Daily user-cap counter | Node.js |
| `limits.js` | Per-user recording / rewrite limits | Node.js |
| `track-usage.js` | Card-creation usage tracking | Node.js |
| `lang-stats.js` | Per-language usage counters | Node.js |
| `validate-key.js` | Pro key validation (Redis-backed, rate-limited) | Node.js |
| `pro-status.js` | Pro status check (accepts `WS-TEST-DEMO-KEY` in non-production) | Node.js |
| `webhook-bmac.js` | Buy Me a Coffee webhook → key generation | Node.js |
| `resend-key.js` | Automated Pro key recovery via email | Node.js |
| `cleanup.js` | Daily blob cleanup (Vercel Cron, 03:00 UTC) | Node.js |
| `admin-revoke.js` | Admin Pro-key revocation | Node.js |
| `beacon.js` | Internal redirect helper (env-gated) | Node.js |
| `subscribe-occasion.js` | Occasion email subscription (Edge) | Edge |
| `unsubscribe-occasion.js` | Occasion email unsubscription | Node.js |
| `test-send-occasion.js` | Debug endpoint for occasion email testing | Node.js |
| `download/[id].js` | Download proxy (serves blob with Content-Disposition) | Node.js |

Plus cron and lib files (non-route):
| File | Purpose |
|---|---|
| `cron/send-occasion-emails.js` | Daily cron (08:00 UTC) for occasion reminder emails |
| `lib/og-render.js` | OG image compositing (sharp) |
| `lib/occasion-email.js` | Occasion email template builder (30 global occasions) |
| `lib/occasion-dates.json` | Movable festival date lookup (2026–2030) |

### Buy Me a Coffee webhook setup

Before accepting Pro payments, configure the BMAC webhook:

1. Go to [Buy Me a Coffee dashboard](https://buymeacoffee.com/dashboard) → Settings → Webhooks
2. Add webhook URL: `https://wibestories.vercel.app/api/webhook-bmac`
3. Subscribe to these events:
   - `support_created` (new membership)
   - `subscription_cancelled`
   - `support_updated` (level changes, e.g. monthly → annual)
   - `support_refunded`
4. Copy the webhook secret → set as `BMAC_WEBHOOK_SECRET` in Vercel env vars
5. Ensure `RESEND_API_KEY` is set in Vercel env vars (for sending Pro key emails)

**If `BMAC_WEBHOOK_SECRET` or `RESEND_API_KEY` are missing**, the webhook returns 500 and logs an error. BMAC will retry delivery.

**Key recovery:** If the initial email fails (Resend down), BMAC retries the webhook. On retry, the code re-sends the email using the stored key. If all retries fail, the user can use "Lost your key?" in the upgrade modal → enters their email → the `/api/resend-key` endpoint looks up and resends the key.

**Test webhooks:** BMAC test pings (`payload.live_mode === false`) are skipped — they don't generate keys.

### LLM model chains (`api/rewrite.js`)

- **Free:** `google/gemma-4-31b-it:free` → `moonshotai/kimi-k2.6:free` → `google/gemma-4-26b-a4b-it:free`
- **Pro:** `inclusionai/ling-2.6-flash` → `sao10k/l3-lunaris-8b`

Prompts target ≤150 characters, force same-language/same-script output, and are truncated to a sentence boundary. Results are cached in Redis for 24 hours (tone + text hash).

### Speech-to-text routing (`api/stt.js`)

- Deepgram `nova-3`: 32 languages.
- OpenRouter Whisper `large-v3-turbo`: 11 languages (Thai, Japanese, Korean, Chinese, Malayalam, Punjabi, Nepali, Burmese, Sinhala, Javanese, Uzbek).
- Admin key path (`x-admin-secret`): routes to a separate Deepgram key. Per-session daily STT cap: 20 calls.

---

## 6. Data stores

### Upstash Redis (main)

- Rate limits, daily user cap, rewrite caches and counters, Pro key registry.
- Keys prefixed `wispr:`.

### Upstash Redis (language stats)

- Separate instance (`lib/lang-stats-redis.js`).
- Public language-usage counters.

### Vercel Blob

- Card PNGs (`cards/`), OG images (`og/`), voice audio (`voice/`), metadata (`meta/`).
- 7-day auto-expiry for free cards, 14 days for Pro, via `api/cleanup.js` (Vercel Cron, 03:00 UTC).

### Card metadata sidecar

`api/upload.js` writes `meta/<shortId>.json` alongside each card. `api/c/[id].js` reads it to personalise the landing page. Old cards without a sidecar fall back gracefully.

### Usage limits

| Limit | Free | Pro |
|---|---|---|
| Daily user cap (shared pool) | 99 users/day | Bypassed |
| Recordings / user / day | 5 | 50 |
| Max recording length | 15s | 30s |
| Cumulative audio / user / day | 75s | 900s (15 min) |
| Tone rewrites / tone / day | 1 | Unlimited |

All limits are enforced server-side via Redis; the client UI mirrors them but is never trusted as the source of truth.

---

## 7. Occasion email campaigns

The app sends occasion reminder emails to subscribed users. The system has three parts:

### Subscription (`api/subscribe-occasion.js`, `api/unsubscribe-occasion.js`)

- Users subscribe from the footer menu. Email is validated against a domain allowlist (`lib/allowed-emails.js`: Gmail, Outlook, Yahoo, Proton, iCloud, Tuta + regional variants).
- Rate-limited to 3 requests/IP/day (Redis key `wispr:sub-rate:{ip}:{date}`).
- Stored in Redis set `wispr:email-subscribers`.
- Unsubscribe uses a base64-encoded email token in the query string.
- Pro users are auto-enrolled at key generation (`api/webhook-bmac.js` adds to `wispr:pro-emails` Redis set).

### Cron schedule (`api/cron/send-occasion-emails.js`)

- Runs daily at 08:00 UTC (defined in `vercel.json` crons block).
- Matches today's date against `api/lib/occasion-dates.json` (movable festival dates computed for 2026–2030).
- For each matching occasion, queries both subscriber sets (`wispr:email-subscribers` + `wispr:pro-emails`), deduplicates against `wispr:occasion-sent:{email}:{occasionId}`, and sends via Resend.

### Email template (`api/lib/occasion-email.js`)

- Builds HTML emails for 30 global occasions with images, occasion name, and a CTA link.
- Sent via Resend REST API (`api.resend.com/emails`) with `RESEND_API_KEY`.
- Each email includes a one-click unsubscribe link (`/api/unsubscribe-occasion?e=<base64>`).

---

## 8. Development workflow



### Making changes

1. Create a branch.
2. Make changes.
3. Test locally with `vercel dev`.
4. Verify with relevant scripts (see [Section 9](#9-testing)).
5. Deploy with `vercel --prod`.

### Version bumping

When deploying:

1. Update `version.json`, `CURRENT_VERSION` in `wisprstories.js`, and the build banner (`wisprstories.js:1`) to the same value.
2. If CSS or static assets changed, bump `CACHE_NAME` in `sw.js`.

### i18n workflow

- Edit `assets/i18n/en.json` for English strings.
- Run `node scripts/verify-locales.mjs` to check consistency.
- Other locale files are in `assets/i18n/` — do not regenerate deleted locales.

---

## 9. Deployment

- **Platform:** Vercel
- **Production URL:** `wibestories.vercel.app`
- **Deploy command:** `vercel --prod`
- **Static deploy:** Dashboard drag-and-drop (does not apply `vercel.json` headers)

### Cron jobs

- **Cleanup:** `api/cleanup.js` runs daily at 03:00 UTC, deletes blobs older than 168 hours (7 days), or 336 hours (14 days) for Pro cards. Authorised with `CRON_SECRET`.
- **Occasion emails:** `api/cron/send-occasion-emails.js` runs daily at 08:00 UTC, matches the current date against 30 global occasions and sends reminder emails to subscribers (Pro users auto-enrolled). Authorised with `CRON_SECRET`.

---

## 10. Testing

### Manual testing

The main app is tested manually against the user flow. Special attention to the grandparent test.

### Automated scripts

| Script | Purpose |
|---|---|
| `scripts/stress-test-99-cap.mjs` | Load test for the 99-user daily cap |
| `scripts/verify-cron-cleanup.mjs` | Cleanup auth check (needs `CRON_SECRET`) |
| `scripts/verify-rewrite-status.mjs` | Per-tone rewrite-status check |
| `scripts/verify-locales.mjs` | Locale-file consistency |
| `scripts/verify-counter-update.mjs` | Recording-counter behaviour |

---

## 11. Troubleshooting

### "New version" toast never fires

Check that `version.json` and `CURRENT_VERSION` in `wisprstories.js` are the same value.

### CSS not updating for returning users

Bump `CACHE_NAME` in `sw.js`. CSS and images are served cache-first.

### API route returns 401

Check that the required env var is set in Vercel. Routes degrade gracefully when a key is missing.

### Recording counter shows stale count

The counter is re-fetched after every `reportRecordingDuration`. If it still shows stale, check Redis connectivity.

---

*For the full product documentation, see [WIBE_STORIES.md](WIBE_STORIES.md). For API details, see [API.md](API.md).*
