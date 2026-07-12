# Wibe Stories — API Reference

> **Status:** Live prototype. 25 serverless API routes on Vercel (+ 4 shared library files).

---

## Table of contents

1. [Overview](#1-overview)
2. [Speech-to-text](#2-speech-to-text)
3. [Tone rewriting](#3-tone-rewriting)
4. [Card upload](#4-card-upload)
5. [Card retrieval](#5-card-retrieval)
6. [OG image](#6-og-image)
7. [Voice audio](#7-voice-audio)
8. [Rate limits and usage](#8-rate-limits-and-usage)
9. [Pro key validation](#9-pro-key-validation)
10. [Webhooks](#10-webhooks)
11. [Admin](#11-admin)
12. [Cleanup](#12-cleanup)
13. [Card data endpoint](#14-card-data-endpoint)
14. [Download proxy](#15-download-proxy)
15. [Occasion email subscriptions](#16-occasion-email-subscriptions)
16. [Debug / Test endpoints](#17-debug--test-endpoints)
17. [Error codes](#18-error-codes)

---

## 1. Overview

All routes are in `api/`. Most are Node.js runtime; `stt.js` and `rewrite.js` are Edge runtime.

**Base URL:** `wibestories.vercel.app/api/`

**Authentication:** Most routes require `x-admin-secret` or `x-pro-key` headers for privileged access. Public routes (card retrieval, OG image) require no auth.

---

## 2. Speech-to-text

### `POST /api/stt`

Speech-to-text fallback when Web Speech API is unavailable or unsupported.

**Runtime:** Edge

**Headers:**
- `Content-Type: application/json`
- `x-admin-secret` (optional) — routes to admin Deepgram key
- `x-pro-key` (optional) — enables extended recording limits

**Request body:**
```json
{
  "audioBase64": "<base64-encoded audio>",
  "language": "en-US",
  "mimeType": "audio/webm"
}
```

**Response:**
```json
{
  "transcript": "Hello, this is a test.",
  "provider": "deepgram",
  "duration": 5.2
}
```

**Providers:**
- Deepgram `nova-3`: 32 languages
- OpenRouter Whisper `large-v3-turbo`: 11 languages (Thai, Japanese, Korean, Chinese, Malayalam, Punjabi, Nepali, Burmese, Sinhala, Javanese, Uzbek)

**Limits:**
- Max audio size: 10MB
- Request timeout: 10 seconds
- Per-session daily STT cap (admin path): 20 calls

---

## 3. Tone rewriting

### `POST /api/rewrite`

Preview a tone rewrite. Does **not** tick the quota counter.

**Runtime:** Edge

**Headers:**
- `Content-Type: application/json`
- `x-pro-key` (optional) — enables Pro model chain

**Request body:**
```json
{
  "text": "Happy birthday to you!",
  "tone": "warm",
  "langHint": "en"
}
```

**Response:**
```json
{
  "rewritten": "Wishing you the warmest birthday filled with joy!",
  "tone": "warm",
  "cached": false
}
```

**Model chains:**
- Free: `google/gemma-4-31b-it:free` → `moonshotai/kimi-k2.6:free` → `google/gemma-4-26b-a4b-it:free`
- Pro: `inclusionai/ling-2.6-flash` → `sao10k/l3-lunaris-8b`

**Constraints:**
- Output ≤150 characters
- Same-language, same-script output enforced
- Results cached in Redis for 24 hours (keyed by tone + text hash)

### `POST /api/rewrite-confirm`

Commits a rewrite use (ticks the Redis counter for the tone).

**Runtime:** Node.js

**Headers:**
- `Content-Type: application/json`

**Request body:**
```json
{
  "tone": "warm"
}
```

**Response:**
```json
{
  "ok": true
}
```

### `GET /api/rewrite-status`

Read-only endpoint for per-tone rewrite counts.

**Runtime:** Node.js

**Response:**
```json
{
  "warm": 3,
  "bold": 1,
  "poetic": 0,
  "playful": 0,
  "reflective": 0,
  "honest": 0
}
```

---

## 4. Card upload

### `POST /api/upload`

Upload a card PNG and generate an OG image.

**Runtime:** Node.js

**Headers:**
- `Content-Type: image/png` — raw PNG bytes in request body
- `x-card-text` — card text
- `x-card-name` — card name (optional)
- `x-card-tone` — tone used
- `x-card-p` — palette
- `x-card-r` — corner style

**Request body:** Raw PNG bytes (no multipart parsing)

**Response:**
```json
{
  "shortId": "a1b2c3d4"
}
```

**Process:**
1. Store PNG in Vercel Blob (`cards/`)
2. Generate 1200×1200 OG JPEG via sharp (`og/`) — used as fallback
3. Write metadata sidecar (`meta/<shortId>.json`)
4. Return 8-character `shortId`

---

## 5. Card retrieval

### `GET /api/c/[id]`

Shared-card landing page. Returns HTML with OG metadata for social bots.

**Runtime:** Node.js

**No auth required.**

**Response:** HTML page with:
- OG meta tags (title, description, image)
- Card image
- "Create your own" CTA

**Behavior:**
- Social bot → renders OG preview (large image)
- Human → renders landing page with card + CTA
- Missing card → 404 page

---

## 6. OG image

### `GET /api/og/:id`

Serverless function that serves the card's OG image JPEG through the app's own domain.
Reads the JPEG from Vercel Blob storage and returns it directly to crawlers (same-origin,
no proxy hop).

**No auth required.**

**Response:** JPEG image (1200×1200)

**Cache:** `Cache-Control: public, max-age=86400, s-maxage=86400` (1 day)

---

### `GET /api/og`

Dynamic OG image renderer (fallback).

**Runtime:** Node.js

**Query params:**
- `text` — card text (default: "Your story")
- `name` — card author name (default: "Wibe Stories")
- `p` — palette index 0–9
- `r` — corner style ("rounded" | "sharp")

**Response:** PNG image (1200×630)

**Fallback:** If rendering fails, returns a branded SVG placeholder.

---

## 7. Voice audio

### `POST /api/voice`

Upload voice audio for voice-attached cards.

**Runtime:** Node.js

**Headers:**
- `Content-Type: multipart/form-data`

**Request body:**
- `file` — WebM audio
- `shortId` — associated card ID

**Response:**
```json
{
  "ok": true
}
```

**Note:** Voice-attached cards are not supported on Safari/iOS (no native .webm playback).

---

## 8. Rate limits and usage

### `GET /api/usage`

Returns the daily user-cap counter.

**Response:**
```json
{
  "count": 42,
  "limit": 99
}
```

### `GET /api/limits`

Returns per-user recording and rewrite limits.

**Headers:**
- `x-pro-key` (optional)

**Response:**
```json
{
  "recordingsUsed": 2,
  "recordingsMax": 5,
  "cumulativeUsed": 30,
  "cumulativeMax": 75
}
```

### `POST /api/track-usage`

Tracks a card creation event.

**Headers:**
- `Content-Type: application/json`

**Request body:**
```json
{
  "source": "voice",
  "lang": "en"
}
```

### `GET /api/lang-stats`

Returns per-language usage counters.

**Response:**
```json
{
  "en": 1234,
  "hi": 567,
  "es": 234
}
```

---

## 9. Pro key validation

### `POST /api/validate-key`

Validates a Pro key against Redis.

**Runtime:** Node.js

**Rate-limited:** 10 attempts/IP/minute.

**Headers:**
- `Content-Type: application/json`

**Request body:**
```json
{
  "key": "WS-PRO-XXXX-XXXX"
}
```

**Response:**
```json
{
  "valid": true,
  "expiresAt": "2026-12-31T00:00:00Z"
}
```

### `GET /api/pro-status`

Returns Pro status for the current user.

**Headers:**
- `x-pro-key` (optional)

**Response:**
```json
{
  "isPro": true
}
```

---

## 10. Webhooks

### `POST /api/webhook-bmac`

Buy Me a Coffee webhook handler. Generates Pro keys on successful donations.

**Runtime:** Node.js

**Headers:**
- `Content-Type: application/json`
- `X-BMAC-Signature` — HMAC signature for verification

**Events handled:**
- `donation.created`
- `recurring_donation.started`
- `recurring_donation.cancelled`
- `recurring_donation.updated`

**Process:**
1. Verify HMAC signature
2. Check for test mode (`live_mode === false`)
3. Extract donor data
4. Generate Pro key
5. Send key email via Resend

---

## 11. Admin

### `POST /api/admin-revoke`

Revokes a Pro key (for chargebacks, fraud).

**Headers:**
- `Content-Type: application/json`
- `x-admin-secret` — required

**Request body:**
```json
{
  "key": "WS-PRO-XXXX-XXXX"
}
```

**Response:**
```json
{
  "ok": true
}
```

### `GET /api/beacon`

Internal redirect helper. Reads `WS_Acknowledged_Logs` env var for redirect target.

**Headers:**
- `x-admin-secret` — required

---

## 12. Cleanup

### `GET /api/cleanup`

Daily blob cleanup (Vercel Cron, 03:00 UTC).

**Auth:** `Authorization: Bearer ${CRON_SECRET}` header.

**Process:**
1. List all blobs in `cards/`, `og/`, `voice/`, `meta/`
2. Delete any older than 168 hours (7 days) — free-tier cards
3. Pro-subscriber cards are kept for 336 hours (14 days), checked via the card's metadata file (`meta/<shortId>.json`)
4. Return count of deleted items

---

## 14. Card data endpoint

### `POST /api/card`

Share-landing page that returns proper OG meta tags for social-crawler previews and auto-redirects human visitors into the editor with the card pre-loaded.

**Runtime:** Node.js

**No auth required.**

**Query params:**
- `img` — direct image URL mode (uses uploaded card PNG as OG image)
- `text` — card text (falls back to legacy text-param mode)
- `name` — author name
- `tone` — tone ID
- `p` — palette index 0–9
- `r` — corner style (`rounded` / `sharp`)

**Response:** HTML page with OG tags and inline CSS.

---

## 15. Download proxy

### `GET /api/download/[id]`

Serves a card's PNG from Vercel Blob with a `Content-Disposition: attachment` header, triggering a browser download.

**Runtime:** Node.js

**No auth required.**

**Process:**
1. Reads the `shortId` from the URL path
2. Fetches the card PNG from Vercel Blob (`cards/<id>.png`)
3. Returns it with download headers

---

## 16. Occasion email subscriptions

### `POST /api/subscribe-occasion`

Subscribe to occasion reminder emails. Validates email against a domain allowlist (Gmail, Outlook, Yahoo, Proton, iCloud, Tuta + regional) and rate-limits to 3 requests/IP/day.

**Runtime:** Edge

**Headers:**
- `Content-Type: application/json`

**Request body:**
```json
{
  "email": "user@gmail.com"
}
```

**Response:**
```json
{
  "ok": true
}
```

**Process:**
1. Validates email format and allowed domain
2. Rate-checks IP (3/day)
3. Stores email in Redis set `wispr:email-subscribers`

### `POST /api/unsubscribe-occasion`

Unsubscribe from occasion reminder emails. Accepts a base64-encoded email token in the query string.

**Runtime:** Node.js

**Query params:**
- `e` — base64-encoded email address

**Response:** HTML confirmation page.

**Process:**
1. Decodes the base64 token
2. Validates email format
3. Removes email from Redis set `wispr:email-subscribers`

---

## 17. Debug / Test endpoints

### `GET /api/test-send-occasion`

Manually trigger an occasion email for testing. Requires `RESEND_API_KEY` to be set.

**Runtime:** Node.js

**Query params:**
- `email` — recipient email (required)
- `occasion` — occasion ID (optional; defaults to next upcoming occasion)

**Response:**
```json
{
  "ok": true,
  "occasion": "birthday",
  "name": "Birthday",
  "sentTo": "user@example.com"
}
```

---

## 18. Error codes

| Code | Meaning |
|---|---|
| 200 | Success |
| 400 | Bad request (missing/invalid params) |
| 401 | Unauthorised (missing or invalid admin key) |
| 403 | Forbidden (Pro key required) |
| 404 | Not found (card, resource) |
| 429 | Rate limited (too many requests) |
| 500 | Server error (LLM timeout, Redis failure, etc.) |

---

*For the full product documentation, see [WIBE_STORIES.md](WIBE_STORIES.md). For developer guide, see [DEVELOPER.md](DEVELOPER.md).*
