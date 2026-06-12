# Wibe Stories — Product Documentation

> **Branding note**
>
> Wibe Stories began as an early prototype under the name "Wispr Stories." As the project grew into a product with a direction of its own, it was renamed to give it a clearer, independent identity: Wibe Stories.
>
> Wibe is pronounced "vibe." It blends three words: vibe (the feeling), voice (the "i," for speaking), and scribe (the "ibe," for writing). That is exactly what the app does: speak it or type it, and keep the vibe of what you said.
>
> Wibe Stories is an independent project, not affiliated with Wispr Flow.

> **Status:** Live prototype. This document is the single source of truth for the product, its architecture, and how to run it.

---

## Table of contents

1. [Product Vision](#1-product-vision)
2. [The problem](#2-the-problem)
3. [Why this matters to Wispr Flow](#3-why-this-matters-to-wispr-flow)
4. [Target users and personas](#4-target-users-and-personas)
5. [How it works](#5-how-it-works)
6. [Feature summary](#6-feature-summary)
7. [Design system](#7-design-system)
8. [Architecture](#8-architecture)
9. [Usage limits](#9-usage-limits)
10. [Internationalization](#10-internationalization)
11. [Occasion system](#11-occasion-system)
12. [Sharing pipeline](#12-sharing-pipeline)
13. [PWA and offline behaviour](#13-pwa-and-offline-behaviour)
14. [Security and privacy](#14-security-and-privacy)
15. [Deployment](#15-deployment)
16. [Testing](#16-testing)
17. [Known limitations](#17-known-limitations)
18. [Roadmap](#18-roadmap)
19. [Success metrics](#19-success-metrics)
20. [Requirements](#20-requirements)

---

## 1. Product Vision

Wibe Stories turns a short voice message — or typed text — into a designed, shareable card. A user opens the app, speaks or types something meaningful, picks a tone and colour, and gets a card they can download or send straight to WhatsApp, Instagram, iMessage, or X through the native share sheet.

**One-line description:** *Turn your voice into shareable cards, in your language, in seconds.*

**Why it exists:** Voice tools are powerful but their output is invisible — dictation disappears into an email or a note, so nobody sees it and nobody discovers that speaking was an option. Wibe Stories makes one voice-created moment visible and shareable.

**North star metric:** Share rate — the percentage of created cards that result in a share action. This measures whether the output is valuable enough to send to someone else.

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

## 4. Target users and personas

The app prioritises non-technical users first.

| Audience | Primary use case | Device |
|---|---|---|
| Grandparents, older adults | Birthday wishes, recipes, memories | Mobile |
| Parents | Letters to children, anniversary messages | Mobile |
| Students | Study reflections, language practice | Mobile + laptop |
| Non-English speakers | Cards in Hindi, Spanish, Tamil, and more | Mobile |
| Professionals (secondary) | Quick voice notes | Laptop |

### Persona 1: Kamala (grandparent, primary)

> **Age:** 68 · **Location:** Chennai, India · **Language:** Tamil + English · **Device:** Android phone

Kamala uses WhatsApp to talk to her grandchildren. She types slowly and often asks her daughter to help her write birthday messages. She has never heard of Wispr Flow.

**Goal:** Send a beautiful birthday card to her grandson without struggling with the keyboard.

**Pain point:** Typing on a small phone screen is exhausting. She gives up before finishing the message.

**Wibe Stories moment:** She opens the app, speaks a birthday message in Tamil, picks a warm tone, and shares the card on WhatsApp. Her grandson receives it and asks how she made it.

### Persona 2: Priya (non-English speaker, primary)

> **Age:** 34 · **Location:** Mumbai, India · **Language:** Hindi + English (code-switches) · **Device:** iPhone

Priya dictates emails and messages using Wispr Flow daily. She loves the product but nothing she creates is shareable — it all disappears into email or Slack.

**Goal:** Turn a meaningful voice moment into something she can share with friends and family.

**Pain point:** Her best voice-created content stays private. She wants to share it but has no format for it.

**Wibe Stories moment:** She speaks a reflection about her daughter's first day of school, picks a poetic tone, and shares the card in her family WhatsApp group. Three relatives ask how she made it.

### Persona 3: Marcus (professional, secondary)

> **Age:** 29 · **Location:** Berlin, Germany · **Language:** German + English · **Device:** Laptop

Marcus uses voice dictation for quick notes and board updates. He is technically capable but values speed over polish.

**Goal:** Create a quick, visually polished card to share a team update or celebration.

**Pain point:** Making something look good takes too long. He wants the voice-to-visual pipeline to be effortless.

**Wibe Stories moment:** He speaks a short team celebration message, picks a bold tone, and shares the card on LinkedIn. Colleagues notice the polished output.

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
- A **"Voice Original" / "Voice Styled"** label. It reads *Voice Styled* when an LLM tone rewrite has been applied and *Voice Original* otherwise.
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

### Design principles

- **Warmth:** The app feels inviting, not clinical. Warm cream background, soft colours, friendly typography.
- **Simplicity:** One task at a time. No clutter, no unnecessary options.
- **Accessibility:** Large tap targets, high contrast, readable fonts across scripts.

### Colours (app shell)

- Background: warm cream
- Ink: near-black
- Secondary text: muted warm tones
- Rules / borders: subtle warm gray

### Card palettes (10) × corner styles (2) = 20 backgrounds

Ten colours — Violet, Amber, Crimson, Emerald, Ocean, Rose, Orange, Teal, Fuchsia, Indigo — each in rounded and sharp corner variants. All 20 are pre-baked WebP images with a decorative spiral already composited in, so PNG export requires no CSS compositing.

### Typography

- Display / brand: Instrument Serif
- Body / UI: Inter
- Card text: per-script font families, mapped by tone

### Tone system

Seven tone entries: the six rewrite tones (Warm, Bold, Poetic, Playful, Reflective, Honest) plus Original (the default). Each tone changes the **per-script font family** (the main visual change) and a small **letter-spacing** adjustment. Font style and weight are held constant across every tone, so the card never makes a jarring size or weight jump when the user switches tones.

### Aspect ratio

Only the **1:1 square** ratio is built (asset prefix `2x2_`), optimised for the large WhatsApp link preview. The 4:5, 16:9, 3:4, and 9:16 layouts are designed but not implemented.

---

## 8. Architecture

The app is a static front end plus stateless Vercel serverless functions. Persistent state lives only in Upstash Redis and Vercel Blob.

### Stack

| Layer | Technology |
|---|---|
| Voice transcription (primary) | Web Speech API (browser-native, free) |
| Voice transcription (fallback) | Deepgram Nova-3 or OpenRouter Whisper |
| Tone rewriting | OpenRouter LLMs (free + Pro model chains) |
| Card rendering | HTML/CSS + pre-baked WebP backgrounds |
| PNG export | html2canvas (vendored) |
| Hosting | Vercel (serverless + static) |
| State / rate limiting | Upstash Redis (two instances) |
| Blob storage | Vercel Blob (card PNGs + OG images) |

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

### Key design decisions

- **Stateless serverless:** No persistent server. All state in Redis or Blob.
- **Client-side rendering:** Card is rendered in the browser, not on the server.
- **36-hour retention:** All shared content auto-expires. No permanent storage.
- **Pro key validation:** Server-side Redis-backed, not a stub. Rate-limited (10 attempts/IP/minute).

---

## 9. Usage limits

| Limit | Free | Pro |
|---|---|---|
| Daily user cap (shared pool) | 99 users/day | Bypassed |
| Recordings / user / day | 5 | 50 |
| Max recording length | 15s | 30s |
| Cumulative audio / user / day | 75s | 900s (15 min) |
| Tone rewrites / tone / day | 5 | Unlimited |

All limits are enforced server-side via Redis; the client UI mirrors them but is never trusted as the source of truth.

---

## 10. Internationalization

- **Speech languages (44):** Shown in a 2-column modal. Relevant only when recording.
- **UI locales (11):** English plus Hindi, Spanish, Italian, Japanese, Kannada, Korean, Telugu, Tamil, Thai, and Chinese. Arabic and Urdu were removed intentionally; RTL infrastructure remains for future re-enablement.
- **Script-aware fonts:** 20 script types are mapped to a font family per tone. Mixed-script text is split into segments, each wrapped in a span with the right font. Japanese is detected before Chinese (via Hiragana/Katakana), and Korean via Hangul, to disambiguate CJK.
- **RTL:** Arabic, Hebrew, Farsi, and Urdu trigger right-to-left on the card panel automatically.

---

## 11. Occasion system

The app ships **53 occasions** that auto-detect from the user's text — birthdays, Diwali, Christmas, Eid, Lunar New Year, regional Indian festivals, and many more. Detection supports plain-string triggers and regex across many languages, plus date-aware occasions keyed to the user's country. When a match is found, an occasion image appears on the card and the example prompts adapt to the occasion.

---

## 12. Sharing pipeline

### Direct PNG share

The card exports as a PNG via html2canvas. On devices with the Web Share API, the share sheet sends the image plus a caption; otherwise the user downloads the PNG or copies it to the clipboard.

### Shareable link

1. On share, html2canvas captures the card as a PNG.
2. The server stores the PNG in Vercel Blob and generates an OG image.
3. The server returns an 8-character `shortId`.
4. The share modal offers four actions: native share, download PNG, copy link, copy image.
5. A social bot scraping the link gets OG metadata and renders a large preview; a human gets a landing page with the full card and a "Create your own" CTA.

### Retention

All shared content (card images, OG images, voice audio, metadata) auto-expires after 36 hours. No permanent storage.

---

## 13. PWA and offline behaviour

The app is an installable Progressive Web App with three-tier caching: network-only for API calls, stale-while-revalidate for fonts, and cache-first for static assets. Offline: typing still works. Recording, font loading, and image export need connectivity.

### Update behavior

The app never reloads itself out from under the user. It polls for new versions and shows a gentle toast when an update is available. The user keeps working uninterrupted until they tap to refresh.

---

## 14. Security and privacy

### Data handling

- No user accounts and no audio storage. Audio is sent to Deepgram or OpenRouter for transcription only and is not retained by Wibe Stories.
- The transcript lives in the browser session and clears on refresh.
- Card images and OG variants are stored in Vercel Blob and auto-deleted after 36 hours.
- Redis holds only rate-limit counters, caches, and Pro-key records — no personal content.

### Browser speech nuance

With the in-browser Web Speech API, the browser itself may process audio through its own cloud service. Wibe Stories does not run its own audio backend, but it cannot guarantee the browser processes speech only on-device.

### Security headers

A full Content-Security-Policy is configured. Additional headers include X-Frame-Options DENY, HSTS, and Permissions-Policy (microphone allowed for self only).

---

## 15. Deployment

- **Platform:** Vercel (serverless + static).
- **URL:** `wibestories.vercel.app` (production).
- **Deploy:** `vercel --prod` from the project root.
- **Local dev:** `vercel dev` or open `wisprstories.html` directly in a browser.

### Deploy checklist

Two rules keep the update notice and caching honest:

1. **Bump the version in lockstep.** Update `version.json`, the `CURRENT_VERSION` constant in `wisprstories.js`, and the build banner (`wisprstories.js:1`) to the same value.
2. **Bump `CACHE_NAME` in `sw.js`** when CSS or static assets change. HTML and JS are network-first and refresh on their own.

### Key environment variables

13 env vars configured in Vercel. Routes degrade gracefully when a key is missing. The full list is in `docs/existing-redis.md` and `docs/daily-capacity-system.md`.

---

## 16. Testing

The main app is tested manually against the user flow in [Section 5](#5-how-it-works), with special attention to the grandparent test. Repeatable verification scripts (Node.js 18+) live in `scripts/`.

---

## 17. Known limitations

Known limitations are accessible in-app by pressing **Alt+F1**, which opens the "Acknowledged Logs" — an honest list of what the app does not yet handle well.

| Area | Limitation |
|---|---|
| Firefox | No Web Speech API — voice recording is unavailable. Typing and paste work. |
| Safari / iOS | No native `.webm` playback; voice-attached-card playback is unsupported there. |
| Aspect ratios | Only 1:1 square is built; 4:5, 16:9, 3:4, 9:16 are designed only. |
| Browser STT accuracy | Web Speech API is less accurate than a dedicated dictation engine; the server fallback mitigates this. |
| Privacy guarantee | Cannot guarantee on-device-only speech processing in the browser path (see [Section 14](#14-security-and-privacy)). |

---

## 18. Roadmap

| Priority | Item | Notes |
|---|---|---|
| Medium | Additional aspect ratios | 4:5, 16:9, 3:4, 9:16 layouts |
| Medium | Mobile preview UX | A floating "Preview" button so the card is not hidden below the inputs |
| ~~Medium~~ | ~~Pro key validation (server-side)~~ | Already implemented — `api/validate-key.js` + `lib/pro-key.js` with Redis, rate limiting, and admin revocation (`api/admin-revoke.js`). |
| Medium | Onboarding banner | First-launch hint, designed but not built |
| Low | Voice-attached cards | Play the original voice from a shared link (audio via Vercel Blob; PNG download stays silent) |
| Low | Animated shareable links | Open a card as a live web page, not just a static image |

---

## 19. Success metrics

| Metric | Target | Rationale |
|---|---|---|
| **Share rate** (north star) | >60% of created cards shared | Measures if the output is valuable enough to send |
| **First-card time** | <60 seconds from open to share | Measures if the flow is simple enough |
| **Voice-first usage** | >70% of cards start with voice | Validates the voice-first thesis |
| **Grandparent test pass** | Qualitative: 70-year-old completes flow unassisted | The product's acceptance bar |
| **Card-to-share conversion** | >80% of card creations reach the share modal | Measures if the card output feels worth sharing |
| **Repeat usage** | >30% of users create 2+ cards in a session | Measures if the experience is engaging |
| **Pro conversion** | >5% of free users unlock Pro | Monetisation viability |

---

## 20. Requirements

### Must-have (v1.0)

- Voice recording in 44 languages (Web Speech API + Deepgram/Whisper fallback)
- AI tone rewriting (6 tones) via OpenRouter
- 10 colour palettes × 2 corner styles = 20 card backgrounds
- Shareable link with OG metadata (social bot preview + human landing page)
- Share via native share sheet, PNG download, or clipboard copy
- Daily user cap (99 users/day) with server-side enforcement
- 36-hour auto-expiry of all shared content
- PWA installable with offline typing support

### Should-have (v1.x)

- Voice-attached cards (audio playback on shared link)
- Additional aspect ratios (4:5, 16:9, 3:4, 9:16)
- Mobile preview UX (floating "Preview" button)
- Onboarding banner (first-launch hint)

### Nice-to-have (v2.x)

- Animated shareable links (live web page, not just static image)
- Additional occasion images
- Additional UI locales

---

*All facts in this document were verified against the codebase. Where the implementation and an older note disagreed, the implementation is treated as the source of truth.*
