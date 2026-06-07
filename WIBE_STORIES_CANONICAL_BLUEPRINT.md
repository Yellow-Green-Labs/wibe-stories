# Wibe Stories — Project Documentation

> **Status:** Live prototype. This document is the single source of truth for the product, its architecture, and how to run it.
>
> **Naming:** *Wibe Stories* is the user-facing product name. The codebase, repository, deployment slug, and Redis key prefix (`ws:` / `wispr:`) remain `wisprstories` — renaming the infrastructure is high-risk and out of scope. The production URL is moving to **`wibestories.vercel.app`**.
>
> **Affiliation:** Wibe Stories is an independent, unofficial project. It is **not affiliated with, sponsored by, or endorsed by Wispr Flow.** Wispr Flow is credited in the page footer and shared-link previews, and is referenced as the product this project was built to complement.

---

## Table of contents

1. [Overview](#1-overview)
2. [The problem](#2-the-problem)
3. [Why this matters to Wispr Flow](#3-why-this-matters-to-wispr-flow)
4. [Target users](#4-target-users)
5. [How it works](#5-how-it-works)
6. [Feature summary](#6-feature-summary)
7. [Design system](#7-design-system)
8. [Architecture](#8-architecture)
9. [Usage limits and cost controls](#9-usage-limits-and-cost-controls)
10. [Internationalization](#10-internationalization)
11. [Occasion system](#11-occasion-system)
12. [Sharing and the share-link pipeline](#12-sharing-and-the-share-link-pipeline)
13. [PWA and offline behaviour](#13-pwa-and-offline-behaviour)
14. [Security and privacy](#14-security-and-privacy)
15. [Deployment and local development](#15-deployment-and-local-development)
16. [Testing](#16-testing)
17. [Known limitations](#17-known-limitations)
18. [Roadmap](#18-roadmap)
19. [Repository map](#19-repository-map)

---

## 1. Overview

Wibe Stories is a browser-based tool that turns a short voice message — or typed text — into a designed, shareable card. A user opens the app, speaks or types something meaningful, picks a tone and colour, and gets a card they can download as a PNG or send straight to WhatsApp, Instagram, iMessage, or X through the native share sheet.

There is no account, no install, and no build step. The front end is vanilla HTML, CSS, and JavaScript. A small set of Vercel serverless functions handle speech-to-text fallback, AI tone rewriting, rate limiting, image upload, and shareable links.

**One-line description:** *Turn your voice into shareable cards, in your language, in seconds.*

---

## 2. The problem

Typing is slow and tiring, especially on a phone, and especially for people who are not power users:

- A grandparent hunting for keys on a touch keyboard.
- A parent writing a birthday message one letter at a time.
- A student who switches between, say, Hindi and English mid-sentence.

Voice is faster than typing for all of them. But the output of voice tools is invisible — dictation disappears into an email, a note, or a document. Nobody sees the result, so nobody discovers that speaking was an option.

Wibe Stories closes that gap. It gives anyone, in their own language, on any device, one easy moment of proof: speak naturally, get something beautiful, share it instantly.

---

## 3. Why this matters to Wispr Flow

This section exists because the project was built as an interview artifact for Wispr Flow. It is framed honestly: Wibe Stories is an independent project, not an official campaign.

Wispr Flow is excellent at the hard part — fast, accurate dictation across apps. But its output is private by design. Nothing a user dictates is naturally shareable, so the product has no built-in word-of-mouth surface.

Wibe Stories is a small experiment in that gap: it turns one voice-created moment into a public artifact that another person can receive, save, and ask about. When someone asks "how did you make this?", that is a discovery moment Wispr Flow does not get from a private dictation tool.

The point of the project is not the card generator. The point is the funnel: making private voice creation visible enough to spread. The in-app call-to-action links to `https://wisprflow.ai/r?BEST76`, a referral URL that would let that discovery be measured.

---

## 4. Target users

The app prioritises non-technical users first.

| Audience | Primary use case | Device |
|---|---|---|
| Grandparents, older adults | Birthday wishes, recipes, memories | Mobile |
| Parents | Letters to children, anniversary messages | Mobile |
| Students | Study reflections, language practice | Mobile + laptop |
| Non-English speakers | Cards in Hindi, Spanish, Tamil, and more | Mobile |
| Professionals (secondary) | Quick voice notes | Laptop |

**The grandparent test (the product's acceptance bar):** if a 70-year-old who only uses WhatsApp can open the app, speak a birthday message, and share the card in under 60 seconds, the app passes. If they cannot, it fails.

---

## 5. How it works

### User flow

1. Open the app — no login, install, or account.
2. (For voice) pick a recording language from the language modal. Typing and pasting work in any language without this step.
3. Tap **Record** and speak. On stop, the transcript is placed into the text box automatically.
4. Or type directly / paste text you already dictated elsewhere.
5. Choose a tone, a card colour, and a corner style (rounded or sharp).
6. Optionally click an **example card** to auto-fill text, tone, and colour.
7. Tap **Create my card** — the card renders with a short confirmation animation.
8. Optionally tap a tone to **rewrite** the words with an LLM (5 per tone per day on the free tier).
9. Tap **Share** — download the PNG, copy it, copy a link, or use the native share sheet to send the image straight to any app.

### What the card contains

- A tone glyph (a Font Awesome icon that changes per tone) over the card background.
- A pre-rendered decorative background (one of 20 baked WebP images).
- An inner white panel holding the user's text and name.
- An audio waveform motif, signalling voice-created content.
- A **"Voice Original" / "Voice Styled"** label. It reads *Voice Styled* when an LLM tone rewrite has been applied and *Voice Original* otherwise (`wisprstories.js:843`).
- A small **Wibe Stories** wordmark and logo.

The card image itself carries only the user's words and the Wibe Stories mark. Wispr Flow attribution lives on the page (footer and the "Try Wispr Flow" CTA), not baked into the card.

---

## 6. Feature summary

| Feature | Detail |
|---|---|
| Voice input | Web Speech API in the browser, with a server STT fallback |
| Typing / paste | Full fallback for any language or unsupported browser |
| AI tone rewriting | 6 tones (Warm, Bold, Poetic, Playful, Reflective, Honest) via OpenRouter |
| Colour palettes | 10 colours × 2 corner styles = 20 backgrounds |
| Aspect ratio | 1:1 square (the only built ratio; others are designed, not shipped) |
| Speech languages | 44 selectable languages |
| UI languages | 11 locales (English + 10) |
| Occasions | 53 auto-detected occasions |
| Export | PNG download, clipboard copy, and shareable link |
| Sharing | Web Share API (image + caption) on supported devices |
| Installable | Progressive Web App with offline typing |
| Dark mode | Follows system preference |

---

## 7. Design system

### Colours (app shell)

- Background: `#ffffeb` (warm cream)
- Ink: `#1a1a1a`
- Secondary text: `#555548`, `#99998a`
- Rules / borders: `rgba(26,26,26,0.1)`

### Card palettes (10) × corner styles (2) = 20 backgrounds

Violet `#7c3aed`, Amber `#f59e0b`, Crimson `#dc2626`, Emerald `#059669`, Ocean `#0284c7`, Rose `#db2777`, Orange `#ea580c`, Teal `#0d9488`, Fuchsia `#c026d3`, Indigo `#4f46e5`.

Each palette ships in rounded and sharp corner variants. All 20 are pre-baked WebP images (`assets/card-bgs/`, named `2x2_<corner>_<colour>.webp`), with the decorative spiral already composited in. This avoids any CSS `mix-blend-mode` compositing during PNG export.

### Typography

- Display / brand: Instrument Serif
- Body / UI: Inter
- Card text: per-script font families, mapped by tone (see below)

### Tone system

Tone is defined in `global/fonts.js`. There are seven tone entries: the six rewrite tones plus `original` (the default, no rewrite applied). Each tone maps to:

- A **per-script font family** — this is the main visual change. Example: Warm uses Inter / Noto Sans; Bold uses Stack Sans Headline / Anek; Poetic uses EB Garamond / Noto Serif; Playful uses Fredoka / Baloo.
- A **glyph** (Font Awesome icon).
- A small **letter-spacing** adjustment.

`font-style` and `font-weight` are held constant (`normal`, `400`) across every tone, so the card never makes a jarring size or weight jump when the user switches tones.

| Tone | Glyph | Letter-spacing | Example Latin font |
|---|---|---|---|
| Original | `fa-pen` | -0.02em | Inter |
| Warm | `fa-heart` | -0.02em | Inter |
| Bold | `fa-bolt` | -0.01em | Stack Sans Headline |
| Poetic | `fa-feather` | -0.02em | EB Garamond |
| Playful | `fa-face-smile` | -0.03em | Fredoka |
| Reflective | `fa-moon` | -0.01em | (per-script map) |
| Honest | `fa-handshake` | 0 | (per-script map) |

### Aspect ratio

Only the **1:1 square** ratio is built (asset prefix `2x2_`), optimised for the large WhatsApp link preview. The 4:5, 16:9, 3:4, and 9:16 layouts are designed but not implemented.

---

## 8. Architecture

The app is a static front end plus stateless Vercel serverless functions. Persistent state lives only in Upstash Redis and Vercel Blob.

### Stack

| Layer | Technology | Notes |
|---|---|---|
| Voice transcription (primary) | Web Speech API | Browser-native, free |
| Voice transcription (fallback) | `api/stt.js` → Deepgram `nova-3` or OpenRouter Whisper `large-v3-turbo` | Server-side, key-gated |
| Tone rewriting | `api/rewrite.js` → OpenRouter LLMs | Free + Pro model chains |
| Card rendering | HTML/CSS + pre-baked WebP backgrounds | Client-side |
| PNG export | html2canvas (vendored, not CDN) | `assets/html2canvas/` |
| Sharing | Web Share API | Native share sheet |
| Hosting | Vercel | Serverless + static |
| State / rate limiting | Upstash Redis (two instances) | Main + language stats |
| Blob storage | Vercel Blob | Card PNGs + OG images |
| Fonts | Google Fonts + vendored Font Awesome | — |

### Request flow

```
Record ──► Web Speech API ──(unsupported/failed)──► POST /api/stt ──► Deepgram / Whisper
   │
   ▼
Transcript in text box ──► (optional) tap tone ──► POST /api/rewrite ──► OpenRouter LLM
   │                                                       │
   │                                              POST /api/rewrite-confirm (counts the use)
   ▼
Create card (client render) ──► Share ──► POST /api/upload (PNG → Vercel Blob, OG via sharp)
   │                                                       │
   │                                              returns 8-char shortId
   ▼
Recipient opens wibestories.vercel.app/c/<shortId>
   ├─ social bot  ──► /api/c/[id] serves OG meta (large preview)
   └─ human       ──► landing page with the card + "Create your own" CTA
```

### Serverless API routes

| Route | Purpose |
|---|---|
| `api/stt.js` | Speech-to-text fallback (Deepgram / Whisper), Edge runtime |
| `api/rewrite.js` | LLM tone rewrite (preview, no quota tick), Edge runtime |
| `api/rewrite-confirm.js` | Commits a rewrite use (Redis INCR, per tone) |
| `api/rewrite-status.js` | Read-only per-tone counts |
| `api/upload.js` | Upload card PNG, generate 1200×630 OG image via `sharp` |
| `api/c/[id].js` | Shared-card landing page + OG metadata |
| `api/card.js` | Card data endpoint |
| `api/og.js` | Dynamic OG image renderer (`@vercel/og`) |
| `api/voice.js` | Optional audio upload (voice-attached cards) |
| `api/usage.js` | Daily user-cap counter |
| `api/limits.js` | Per-user recording / rewrite limits |
| `api/track-usage.js` | Card-creation usage tracking |
| `api/lang-stats.js` | Per-language usage counters (public stats page) |
| `api/validate-key.js` | Pro key validation |
| `api/pro-status.js` | Pro status check |
| `api/webhook-bmac.js` | Buy Me a Coffee webhook → key generation |
| `api/cleanup.js` | Daily blob cleanup (Vercel Cron) |
| `api/beacon.js` | Internal redirect helper (env-gated) |

### LLM model chains (`api/rewrite.js`)

- **Free:** `google/gemma-4-31b-it:free` → `moonshotai/kimi-k2.6:free` → `google/gemma-4-26b-a4b-it:free` (3-model fallback chain; falls through on rate-limit, model-unavailable, or a detected language mismatch).
- **Pro:** `inclusionai/ling-2.6-flash` → `sao10k/l3-lunaris-8b`.
- Prompts target ≤150 characters, force same-language/same-script output, and are truncated to a sentence boundary. Results are cached in Redis for 24 hours, keyed by tone + text hash, so repeat requests skip both the API call and the quota. The per-tone counter ticks on confirm (`api/rewrite-confirm.js`), not on preview, so cancelling a preview does not burn quota. A 500-character hard cap protects against direct API abuse.

### Speech-to-text routing (`api/stt.js`)

- Deepgram `nova-3` handles 32 languages.
- OpenRouter Whisper `large-v3-turbo` handles 11 languages that Deepgram does not (Thai, Japanese, Korean, Chinese, Malayalam, Punjabi, Nepali, Burmese, Sinhala, Javanese, Uzbek).
- An admin key path (`x-admin-secret`) routes to a separate Deepgram key. A per-session daily STT cap (20 calls) acts as a server-side safety net.

### Data stores

- **Upstash Redis (main):** rate limits, daily user cap, rewrite caches and counters, Pro key registry. Keys are prefixed `wispr:`.
- **Upstash Redis (language stats):** a separate instance for the public language-usage counters (`lib/lang-stats-redis.js`).
- **Vercel Blob:** card PNGs (`cards/`) and OG images (`og/`), cleaned up after 36 hours.

---

## 9. Usage limits and cost controls

### Limits

| Limit | Free | Pro |
|---|---|---|
| Daily user cap (shared pool) | 99 users/day | Bypassed |
| Recordings / user / day | 5 | 50 |
| Max recording length | 15s | 30s |
| Cumulative audio / user / day | 75s | 900s (15 min) |
| Tone rewrites / tone / day | 5 | Unlimited |

All limits are enforced server-side via Redis; the client UI mirrors them but is never trusted as the source of truth.

### Cost safeguards

1. 15-second max recording caps per-recording cost.
2. 5 recordings/user/day prevents single-user abuse.
3. 75-second cumulative cap catches the "5 × ~15s" edge case.
4. Silence detection (Web Audio RMS check) skips silent audio before it reaches the STT API.
5. A duplicate cache avoids re-transcribing identical audio in a session.
6. Request timeouts (10s STT, 20s rewrite) stop hung requests from draining quota.
7. The 99-user daily cap (Redis) bounds total daily load.

---

## 10. Internationalization

- **Speech languages (44):** listed in `assets/languages/languages.json`, shown in a 2-column modal. Relevant only when recording.
- **UI locales (11):** English plus Hindi, Spanish, Italian, Japanese, Kannada, Korean, Telugu, Tamil, Thai, and Chinese (`assets/i18n/`). Loaded by `assets/i18n/i18n.js` via a `data-i18n` attribute system and `getI18nSync()`. Arabic and Urdu locale files were removed intentionally; the RTL infrastructure remains for future re-enablement.
- **Script-aware fonts (`global/fonts.js`):** 19 script types are mapped to a font family per tone. Mixed-script text (for example "Happy जन्मदिन!") is split into segments, each wrapped in a span with the right font. Japanese is detected before Chinese (via Hiragana/Katakana), and Korean via Hangul, to disambiguate CJK.
- **RTL:** Arabic, Hebrew, Farsi, and Urdu trigger `dir="rtl"` on the card panel automatically.

---

## 11. Occasion system

The app ships **53 occasions** (`global/occasions/occasions.json`) that auto-detect from the user's text — birthdays, Diwali, Christmas, Eid, Lunar New Year, regional Indian festivals, and many more. Detection (`global/occasions/occasions.js`) supports plain-string triggers and regex across many languages, plus date-aware occasions keyed to the user's country (`country-mapping.json`, `date-occasions.json`). When a match is found, an occasion image appears on the card and the example prompts adapt to the occasion.

---

## 12. Sharing and the share-link pipeline

### Direct PNG share

The card exports as a PNG via html2canvas. On devices with the Web Share API, the share sheet sends the image plus a caption (`navigator.share({ files, text })`, `wisprstories.js:3441`); otherwise the user downloads the PNG or copies it to the clipboard.

### Shareable link

1. On share, html2canvas captures the card as a PNG.
2. `POST /api/upload` stores the PNG in Vercel Blob and generates a padded 1200×630 OG variant with `sharp`.
3. The server returns an 8-character `shortId`.
4. The share modal offers four actions: native share, download PNG, copy link (`wibestories.vercel.app/c/<shortId>`), copy image.
5. A social bot scraping the link gets OG metadata and renders a large preview; a human gets a landing page with the full card and a "Create your own" CTA.

### Retention

Blobs in `cards/` and `og/` older than 36 hours are deleted daily by `api/cleanup.js` (Vercel Cron, 03:00 UTC, authorised with `CRON_SECRET`).

### Card metadata sidecar

`api/upload.js` writes `meta/<shortId>.json` (`{ text, name, tone, ... }`) alongside each card. `api/c/[id].js` reads it to personalise the landing page; older cards without a sidecar fall back gracefully. The `meta/` directory is cleaned up on the same 36-hour schedule.

---

## 13. PWA and offline behaviour

The app is an installable Progressive Web App.

- `site.webmanifest` — install prompt, shortcuts, share target, theme colour.
- `sw.js` — a service worker with three-tier caching:
  - Same-origin dynamic (`/api/*`, `/c/*`): network-only.
  - Cross-origin (fonts, CDNs): stale-while-revalidate.
  - Same-origin static: cache-first, with an offline navigation fallback.
- Cache name: `wispr-stories-shell`.
- Offline: typing still works. Recording, font loading, and image export need connectivity.

---

## 14. Security and privacy

### HTTP security headers (`vercel.json`)

A full **Content-Security-Policy is set** (this corrects earlier notes that claimed no CSP was used). It allows same-origin scripts plus inline, `unpkg.com` for scripts/connect, Google Fonts, and Vercel Blob for images. Alongside it:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: microphone=(self)`, with camera, geolocation, payment, and others disabled
- `Cross-Origin-Opener-Policy: same-origin-allow-popups`

### Data handling

- No user accounts and no audio storage. Audio is sent to Deepgram or OpenRouter for transcription only and is not retained by Wibe Stories.
- The transcript lives in the browser session and clears on refresh.
- Card images and OG variants are stored in Vercel Blob and auto-deleted after 36 hours.
- Redis holds only rate-limit counters, caches, and Pro-key records — no personal content.

Honest nuance worth stating in any privacy copy: with the in-browser Web Speech API, the browser itself may process audio through its own cloud service. Wibe Stories does not run its own audio backend, but it cannot guarantee the browser processes speech only on-device.

### Secrets

API keys and tokens are server-side environment variables only (see [Section 15](#15-deployment-and-local-development)). Pro status is validated server-side against Redis; the client-sent flag is never trusted.

---

## 15. Deployment and local development

### Deploy

- **Platform:** Vercel.
- **URL:** `wibestories.vercel.app` (production).
- **Command:** `vercel --prod` from the project root. This applies `vercel.json` (rewrites, redirects, security headers, cron). A dashboard drag-and-drop deploy serves static files but does **not** apply `vercel.json` headers.

### Run locally

```bash
# Requires Node.js 18+ and the Vercel CLI (npm i -g vercel)
vercel dev          # full app, including serverless routes
# or, for a static-only preview without the API routes:
#   open wisprstories.html directly in a browser
```

The front end has no build step. `package.json` exists for the serverless dependencies: `@upstash/redis`, `@vercel/blob`, `@vercel/og`, `sharp`.

### Environment variables

Set these in the Vercel project (or a local `.env`). Serverless routes degrade gracefully when a key is missing, but the related feature is disabled.

| Variable | Used by | Purpose |
|---|---|---|
| `DEEPGRAM_API_KEY` | `api/stt.js` | Primary Deepgram STT |
| `DEEPGRAM_API_KEY_ADMIN` | `api/stt.js` | Admin STT key path |
| `ADMIN_API_SECRET` | `api/stt.js` | Gate for the admin STT path |
| `OPENROUTER_API_KEY` | `api/rewrite.js`, `api/stt.js` | LLM rewriting + Whisper STT |
| `UPSTASH_REDIS_REST_URL` | `lib/redis.js` | Main Redis (limits, caches, keys) |
| `UPSTASH_REDIS_REST_TOKEN` | `lib/redis.js` | Main Redis auth |
| `UPSTASH_REDIS_LANG_STATS_URL` | `lib/lang-stats-redis.js` | Language-stats Redis |
| `UPSTASH_REDIS_LANG_STATS_TOKEN` | `lib/lang-stats-redis.js` | Language-stats Redis auth |
| `BLOB_READ_WRITE_TOKEN` | `api/upload.js`, `api/cleanup.js` | Vercel Blob access |
| `CRON_SECRET` | `api/cleanup.js` | Authorises the cleanup cron |
| `BMAC_WEBHOOK_SECRET` | `api/webhook-bmac.js` | Verifies Buy Me a Coffee webhook (HMAC) |
| `BREVO_API_KEY` | `api/webhook-bmac.js` | Sends Pro-key emails |
| `WS_Acknowledged_Logs` | `api/beacon.js` | Internal redirect target (optional) |

---

## 16. Testing

The main app is tested manually against the user flow in [Section 5](#5-how-it-works), with special attention to the grandparent test.

Repeatable verification scripts (Node.js 18+, Windows-friendly) live in `scripts/`:

```bash
node scripts/stress-test-99-cap.mjs        # load test for the 99-user daily cap (--base=https://... for prod)
node scripts/verify-cron-cleanup.mjs       # cleanup auth check (needs CRON_SECRET)
node scripts/verify-rewrite-status.mjs     # per-tone rewrite-status check
node scripts/verify-locales.mjs            # locale-file consistency
node scripts/verify-counter-update.mjs     # recording-counter behaviour
```

---

## 17. Known limitations

| Area | Limitation |
|---|---|
| Firefox | No Web Speech API — voice recording is unavailable. Typing and paste work. |
| Safari / iOS | No native `.webm` playback; voice-attached-card playback is unsupported there. |
| Aspect ratios | Only 1:1 square is built; 4:5, 16:9, 3:4, 9:16 are designed only. |
| Pro key validation | `api/validate-key.js` is a stub pending the full Redis-backed flow. |
| Browser STT accuracy | Web Speech API is less accurate than a dedicated dictation engine; the server fallback mitigates this. |
| Privacy guarantee | Cannot guarantee on-device-only speech processing in the browser path (see [Section 14](#14-security-and-privacy)). |

---

## 18. Roadmap

| Priority | Item | Notes |
|---|---|---|
| Medium | Additional aspect ratios | 4:5, 16:9, 3:4, 9:16 layouts |
| Medium | Mobile preview UX | A floating "Preview" button so the card is not hidden below the inputs |
| Medium | Pro key validation (server-side) | Replace the stub with the Redis-backed flow |
| Medium | Onboarding banner | First-launch hint, designed but not built |
| Low | Voice-attached cards | Play the original voice from a shared link (audio via Vercel Blob; PNG download stays silent) |
| Low | Animated shareable links | Open a card as a live web page, not just a static image |

---

## 19. Repository map

```
wisprstories.html / .js          Main app: UI, recording, render, share, i18n
about.html / language-stats.html Secondary pages
global/
  fonts.js                       Per-script × per-tone font mapping
  footer-menu.js, about.js,      Page behaviour
  language-stats.js, capacity-check.js, demo.js
  occasions/                     53-occasion detection (triggers, dates, countries)
  styles/                        14 CSS modules (main.css aggregates)
assets/
  i18n/                          11 UI locales + i18n.js loader
  languages/                     44 speech languages + loader
  card-bgs/                      20 baked WebP card backgrounds
  og-1080/, og-1200x630/         OG image templates
  occasions/                     53 occasion images
  fontawesome/, html2canvas/,    Vendored libraries
  flag-icons/
api/                             18 serverless routes (see Section 8)
lib/
  redis.js                       Main Upstash client + key registry
  lang-stats-redis.js            Language-stats Upstash client
  chart.umd.min.js               Chart.js (language-stats page)
scripts/                         Verification scripts
sw.js                            Service worker
site.webmanifest                 PWA manifest
vercel.json                      Rewrites, redirects, headers, cron
package.json                     Serverless dependencies
```

---

*All facts in this document were verified against the codebase. Where the implementation and an older note disagreed, the implementation is treated as the source of truth.*
