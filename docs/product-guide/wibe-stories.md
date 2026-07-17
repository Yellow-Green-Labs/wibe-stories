---
title: Wibe Stories — Product Documentation
category:
  uri: product-guide
content:
  excerpt: >-
    Full product documentation covering vision, architecture, features, and
    roadmap.
---

# Wibe Stories — Product Documentation

> For the developer guide (architecture, code structure, deployment), see [DEVELOPER.md](https://github.com/YellowGreenLabs/wispr-stories/blob/main/docs-internal/DEVELOPER.md).

> **Branding note**
>
> Wibe Stories began as an early prototype under the name "Wispr Stories." As the project grew into a product with a direction of its own, it was renamed to give it a clearer, independent identity: Wibe Stories.
>
> Wibe is pronounced "vibe." It blends three words: vibe (the feeling), voice (the "i," for speaking), and scribe (the "ibe," for writing). That is exactly what the app does: speak it or type it, and keep the vibe of what you said.
>
> Wibe Stories is an independent project, not affiliated with Wispr Flow.

> **Status:** Live prototype. This document is the single source of truth for the product.

---

## Table of contents

1. [Product Vision](#1-product-vision)
2. [The problem](#2-the-problem)
3. [Origin](#3-origin)
4. [Target users and personas](#4-target-users-and-personas)
5. [How it works](#5-how-it-works)
6. [Feature summary](#6-feature-summary)
7. [Design system](#7-design-system)
8. [Internationalization](#8-internationalization)
9. [Occasion system](#9-occasion-system)
10. [Sharing pipeline](#10-sharing-pipeline)
11. [PWA and offline behaviour](#11-pwa-and-offline-behaviour)
12. [Security and privacy](#12-security-and-privacy)
13. [Known limitations](#13-known-limitations)
14. [Roadmap](#14-roadmap)
15. [Success metrics](#15-success-metrics)
16. [Requirements](#16-requirements)
17. [Tech Stack](#17-tech-stack)

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

## 3. Origin

Wibe Stories began as an independent project exploring a simple observation: voice dictation is fast and natural, but its output is invisible — it disappears into a note or email. Nothing dictated is naturally shareable.

The project was inspired by Wispr Flow's excellent dictation technology. Wibe Stories fills the gap that private dictation leaves open: it turns a voice-created moment into a public artifact that someone else can receive, save, and ask about. When someone asks "how did you make this?", that is how voice discovery spreads.

Wibe Stories is an independent project, not affiliated with or sponsored by Wispr Flow. Wispr Flow is credited in the page footer and shared-link previews; the cards themselves carry only the user's words and the Wibe Stories mark.

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
5. Choose a tone, a card colour (from 20 presets or a custom hex picker), and a corner style (rounded or sharp).
6. Optionally click an **example card** to auto-fill text, tone, and colour.
7. Tap **Create my card** — the card renders with a short confirmation animation.
8. Optionally tap a tone to **rewrite** the words with an LLM (1 per tone per day on the free tier, unlimited for Pro).
9. Tap **Share** — download the PNG, copy it, copy a link, or use the native share sheet to send the image straight to any app.

### What the card contains

- A tone glyph (a Font Awesome icon that changes per tone) over the card background.
- A pre-rendered decorative background (one of 20 baked WebP images).
- An inner white panel holding the user's text and name.
- An audio waveform motif, signalling voice-created content.
- A source label with emoji: 🎙️ **Voice Original** / 🎙️ **Voice Styled** (when recorded), or ✏️ **Story Original** / ✏️ **Story Styled** (when typed). *Styled* appears when an LLM tone rewrite has been applied.
- A small **Wibe Stories** wordmark, logo, and the tagline **"speak · scribe · share"**.

The card image itself carries only the user's words and the Wibe Stories mark. Wispr Flow attribution lives on the page (footer and the "Try Wispr Flow" CTA), not baked into the card.

---

## 6. Feature summary

| Feature | Detail |
|---|---|---|
| Voice input | Web Speech API in the browser, with a server STT fallback |
| Typing / paste | Full fallback for any language or unsupported browser |
| Voice attachment | Optional toggle to attach the original voice recording to a shared card |
| AI tone rewriting | 7 tones: Original + 6 rewrites (Warm, Bold, Poetic, Playful, Reflective, Honest) via OpenRouter. Free: 1 rewrite/tone/day |
| Colour palettes | 10 colours × 2 corner styles = 20 backgrounds, plus a custom hex color picker |
| Aspect ratio | 1:1 square (the only built ratio; others are designed, not shipped) |
| Speech languages | 44 selectable languages |
| UI languages | 11 locales (English + 10) |
| Occasions | 60 auto-detected occasions, plus email reminder subscriptions |
| Grace zone | Textarea maxlength 160 but UI shows 150; counter turns yellow at 120, red at 150+ |
| Export | PNG download, clipboard copy, and shareable link |
| Sharing | Web Share API (image + caption) on supported devices; 13 rotating Wispr Flow CTAs in share captions |
| Pro subscription | Buy Me a Coffee payment → Pro key via email → unlimited rewrites, 50 recordings/day, 30s recording, 14-day retention |
| Occasion email reminders | Subscribe from footer → daily cron → Resend email on matching occasions |
| Color picker | Custom hex color input alongside the 20 preset card backgrounds |
| Draft auto-save | Text and settings persist in localStorage across sessions |
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

## 8. Internationalization

- **Speech languages (44):** Shown in a 2-column modal. Relevant only when recording.
- **UI locales (11):** English plus Hindi, Spanish, Italian, Japanese, Kannada, Korean, Telugu, Tamil, Thai, and Chinese. Arabic and Urdu were removed intentionally; RTL infrastructure remains for future re-enablement.
- **Script-aware fonts:** 20 script types are mapped to a font family per tone. Mixed-script text is split into segments, each wrapped in a span with the right font. Japanese is detected before Chinese (via Hiragana/Katakana), and Korean via Hangul, to disambiguate CJK.
- **RTL:** Arabic, Hebrew, Farsi, and Urdu trigger right-to-left on the card panel automatically.

---

## 9. Occasion system

The app ships **60 occasions** that auto-detect from the user's text — birthdays, Diwali, Christmas, Eid, Lunar New Year, regional Indian festivals, and many more. Detection supports plain-string triggers and regex across many languages, plus date-aware occasions keyed to the user's country. When a match is found, an occasion image appears on the card and the example prompts adapt to the occasion.

### Occasion email reminders

Users can subscribe to occasion reminder emails from the footer menu. The system validates the email against a domain allowlist (Gmail, Outlook, Yahoo, Proton, iCloud, Tuta + regional) and rate-limits to 3 requests per IP per day. Subscribers receive an email on the morning of a matching occasion, featuring the occasion image and a link to create a card.

Pro users are automatically enrolled at key generation. All emails include a one-click unsubscribe link. Emails are sent via the Resend transactional API, triggered by a daily cron job at 08:00 UTC.

---

## 10. Sharing pipeline

### Direct PNG share

The card exports as a PNG via html2canvas. On devices with the Web Share API, the share sheet sends the image plus a caption; otherwise the user downloads the PNG or copies it to the clipboard.

### Shareable link

1. On share, html2canvas captures the card as a PNG.
2. The server stores the PNG in Vercel Blob and generates an OG image.
3. The server returns an 8-character `shortId`.
4. The share modal offers four actions: native share, download PNG, copy link, copy image.
5. A social bot scraping the link gets OG metadata and renders a large preview; a human gets a landing page with the full card and a "Create your own" CTA.

### Retention & metadata

All shared content (card images, OG images, voice audio, metadata) auto-expires after 7 days. Pro-subscriber cards are kept for 14 days. Cleanup runs daily at 03:00 UTC via a Vercel Cron job.

Each card has a **metadata sidecar** (`meta/<shortId>.json`) stored alongside the image, containing the card text, author name, tone, palette, corner style, and Pro status. This metadata personalises the shared-card landing page. Cards can also be downloaded directly via the `/download/[id]` proxy endpoint.

---

## 11. PWA and offline behaviour

The app is an installable Progressive Web App with three-tier caching: network-only for API calls, stale-while-revalidate for fonts, and cache-first for static assets. Offline: typing still works. Recording, font loading, and image export need connectivity.

### Update behavior

The app never reloads itself out from under the user. It polls for new versions and shows a gentle toast when an update is available. The user keeps working uninterrupted until they tap to refresh.

---

## 12. Security and privacy

### Data handling

- No user accounts and no audio storage. Audio is sent to Deepgram or OpenRouter for transcription only and is not retained by Wibe Stories.
- The transcript lives in the browser session and clears on refresh.
- Card images and OG variants are stored in Vercel Blob and auto-deleted after 7 days (14 days for Pro).
- Redis holds only rate-limit counters, caches, and Pro-key records — no personal content.

### Browser speech nuance

With the in-browser Web Speech API, the browser itself may process audio through its own cloud service. Wibe Stories does not run its own audio backend, but it cannot guarantee the browser processes speech only on-device.

### Security headers

A full Content-Security-Policy is configured. Additional headers include X-Frame-Options DENY, HSTS, and Permissions-Policy (microphone allowed for self only).

---

## 13. Known limitations

Known limitations are accessible in-app by pressing **Alt+F1**, which opens the "Acknowledged Logs" — an honest list of what the app does not yet handle well.

| Area | Limitation |
|---|---|
| Firefox | No Web Speech API — voice recording is unavailable. Typing and paste work. |
| Safari / iOS | No native `.webm` playback; voice-attached-card playback is unsupported there. |
| Aspect ratios | Only 1:1 square is built; 4:5, 16:9, 3:4, 9:16 are designed only. |
| Browser STT accuracy | Web Speech API is less accurate than a dedicated dictation engine; the server fallback mitigates this. |
| Privacy guarantee | Cannot guarantee on-device-only speech processing in the browser path (see [Section 12](#12-security-and-privacy)). |
| Recording counter | The recording counter may briefly show a stale count after stopping (race between async state update and render). Cosmetic only — server is the source of truth. |

---

## 14. Roadmap

| Priority | Item | Notes |
|---|---|---|
| Medium | Additional aspect ratios | 4:5, 16:9, 3:4, 9:16 layouts |
| Medium | Mobile preview UX | A floating "Preview" button so the card is not hidden below the inputs |
| Medium | Onboarding banner | First-launch hint, designed but not built |
| Low | Animated shareable links | Open a card as a live web page, not just a static image |

---

## 15. Success metrics

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

## 16. Requirements

### Implemented

- Voice recording in 44 languages (Web Speech API + Deepgram/Whisper fallback)
- AI tone rewriting (7 tones: Original + 6 rewrites) via OpenRouter
- 10 colour palettes × 2 corner styles = 20 card backgrounds, plus custom hex color picker
- Shareable link with OG metadata (social bot preview + human landing page)
- Share via native share sheet, PNG download, clipboard copy, or download proxy
- Daily user cap (99 users/day) with server-side enforcement, bypass for Pro
- 7-day auto-expiry for free cards, 14 days for Pro (daily cleanup cron)
- PWA installable with offline typing support
- Pro subscription system (Buy Me a Coffee → webhook → key generation → email delivery → Redis validation)
- Occasion email campaigns (footer subscription → daily cron → Resend transactional email → one-click unsubscribe)
- 60 auto-detected occasions with themed card images
- Features page, About page, and Language Stats page with Chart.js
- i18n in 11 UI locales with script-aware font mapping

### Not yet implemented

- Additional aspect ratios (4:5, 16:9, 3:4, 9:16)
- Mobile preview UX (floating "Preview" button)
- Onboarding banner (first-launch hint)
- Animated shareable links (live web page, not just static image)
- Custom color picker for free tier (currently Pro-only)

---

## 17. Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Vanilla HTML, CSS, JavaScript (no framework) | Zero build step, edge-served |
| Hosting | Vercel (serverless + static) | Global edge deployment, rewrites, CSP, cron |
| Speech-to-text | Web Speech API (browser) + Deepgram Nova-3 + OpenRouter Whisper | Primary → fallback → secondary fallback |
| AI rewriting | OpenRouter (Gemma, Kimi, Ling, Lunaris models) | 7 tones, same-language enforcement |
| Storage | Vercel Blob | Card PNGs, OG images, voice audio, metadata |
| Data / cache | Upstash Redis (2 instances) | Rate limits, keys, counters, rewrite cache, email subscriptions |
| Payments | Buy Me a Coffee webhooks (HMAC-signed) | Pro key generation on donation |
| Email | Resend transactional API | Pro key delivery, key recovery, occasion reminders |
