THIS FILE IS THE RULE OF LAW FOR THIS PROJECT

This file is automatically loaded into every agent session. These are MANDATORY CONSTRAINTS — ignoring or skipping them is a violation. Your work is not complete until every applicable rule here has been followed.

YOU ARE BOUND BY THE CONTENTS OF THIS FILE. FULL STOP.

YOU ARE NOT DONE UNTIL THIS FILE IS UPDATED. Before ending your session, verify this file reflects all changes you made. If it doesn't, update it or your work is incomplete.

# Foundational principle — read first, overrides everything

> **"Fall in love with the problem, not the solution."** — Tanay Kothari, CEO at Wispr Flow

> **"We hire for a rare intersection of people who are aggressive about outcomes but kind and direct in how they communicate."** — Sahaj Garg, Co-Founder/CTO @ Wispr Flow

- **Name the problem before building.** If you can't state the real user problem, don't build it.
- **"I love this, so I built it" is not a reason.** Purpose is. Build for an unmet need, not attachment.
- **The solution is disposable.** A better path beats the current one — drop it without ego.
- **Positioning leads with the problem**, never fondness for the product or brand.

# Mandatory rules

- **Audience lens**: Target users span 20s–70s (friends, family, relatives, parents, grandparents). Every decision must serve ALL of them.
- **Tanay lens**: Before proposing any change, read `docs/Tanay-linkedin-posts.md`. Align with or explicitly justify deviations from Wispr Flow CEO's thinking.
- **Codebase lens**: Read/understand the full project implementation before proposing features or improvements. No blind suggestions.
- Every recommendation, explanation, or answer must include a **confidence level: High, Medium, or Low**. If **Low**, stop and ask for clarification before proceeding.
- If anything is unclear, ask explicitly — never assume or guess.
- Delegate smaller/parallel tasks to subagents aggressively.
- Start with **Explore** (read-only) when uncertain; switch to **General** only when a bounded task is clear.
- Keep all changes reversible when possible.
- **Documentation truth rule (public docs):** `docs-src/` must state *what and why*, never *how* — omit service names (Redis, Neon, Postgres, Vercel Blob), storage keys, session mechanics, rate limits, internal endpoints, cron schedules, exact thresholds, and file paths. If a public doc needs to reference an internal detail, link to the internal file instead.
- **Documentation truth rule (internal docs):** `docs-internal/` must be 100% truthful with no gaps. Every constraint, mechanism, and threshold that exists in the code must be documented somewhere in `docs-internal/`.
- **Leak detection**: Before writing or editing any public doc, cross-check every number, name, and mechanism against the leak list above. If uncertain, move the detail to `docs-internal/` and link.

## MANDATORY: Self-update rule

1. **When you modify project files, you MUST also update this file** to reflect the new state. This is not optional. There is no exception.
2. **When in doubt, update anyway.** Stale documentation is worse than no documentation.
3. **Run `@agsync` at end of each session** to record changes. This automatically updates CHANGELOG.md and this file. The agsync comment block keeps only the primary last-run note plus the ~3 most recent session notes — older notes are archived verbatim to `docs-internal/agsync-archive.md` (do not let the block regrow).
4. **YOU ARE NOT DONE UNTIL THIS FILE IS UPDATED.** Before ending your session, verify this file reflects all changes you made. If it doesn't, update it or your work is incomplete.

# Session-end verification checklist

At the end of every session that touched project files, you MUST mentally verify each:

- [x] Did I run `@agsync` to record this session's changes?
- [x] Did I update "Key files" if I added/removed/renamed files?
- [x] Did I update "Known bugs" if I fixed or introduced bugs?
- [x] Did I update any other section that my changes affect?

If any box is unchecked, you are not done. Fix it.

# Known bugs

- **Firefox** — Web Speech API unsupported; no voice recording, no in-app fallback. Users can still type their message. (The `ffNotice` i18n key and `showNotice("firefox")` caller were removed in v0.11.0.0 as dead code; no Firefox-specific toast is shown anymore.)
- **resetBtn async** — `stopDeepgramRecording()` is async; `finishRec()` runs after state updates, causing brief flicker.
- **Voice-attached cards** — WebM via `canvas.captureStream()` + `MediaRecorder`; Safari unsupported; iOS no native .webm playback.
- **Counter stuck at 5/5 on Vercel** — `reportRecordingDuration()` had an early return on 0-duration (fixed in v0.10.4.4), but counter still showed 5/5 after multiple recordings. v0.10.4.5 added `_refreshLimitsFromServer()` for cap-recoveries; v0.10.4.7 adds re-fetch after **every** `reportRecordingDuration` so client always mirrors server state. Monotonic guard in `updateRecCounter(used, max, cumulativeUsed, cumulativeMax, sessionId)` ignores stale `used < _lastKnownRecordingsUsed` values and resets on session-change or day-rollover, so out-of-order safety-net responses from prior recordings can't make the counter go backwards. The 4× `console.debug` instrumentation remains for future root-cause diagnosis if the symptom recurs.

# SEO & Security configuration

A full Content-Security-Policy **is** set in `vercel.json` (allows `unpkg.com`, Google Fonts, Vercel Blob, Sentry CDN, and Sentry ingest). It does **not** break the Web Speech API, which is browser-native and needs no `connect-src` entry. All other security headers are in `vercel.json` too.

# Deployment

- **Platform**: Vercel (production URL `wibestories.vercel.app`; legacy deploy slug `wisprstories.vercel.app`, code/filenames stay `wisprstories`)
- **Deploy**: `vercel --prod` from project root
- **Local dev**: `vercel dev` or open `wisprstories.html` directly in browser. **Requires Node 24.x** — the project pins `nodeVersion: 24.x` and `vercel dev`'s edge-runtime sandbox crashes on Node 25 (`Buffer is not defined` during edge function instantiation, which also kills the whole dev server via a CLI `taskkill` bug on Windows). Portable Node 24 used in past sessions: `C:\Users\srini\AppData\Local\Temp\opencode ode24 ode.exe` running `...\AppData\Roaming pm ode_modules\vercel\dist\vc.js dev`. **After adding NEW static files (e.g. demo videos), restart `vercel dev`** — it indexes static files at server start and returns 404 for files added later (2026-07-31: `animo-wheel-spin-bottom-720p.webm` 404'd until restart). Recommended permanent fix: install Node 24 LTS.
- **Docs local dev**: `npx vitepress dev docs-src` (starts VitePress dev server on port 5173)
- **Docs build**: `npx vitepress build docs-src` (outputs to `docs-src/.vitepress/dist/`)

# Testing

Main app testing is manual. See `docs/product-guide/wibe-stories.md` for test scenarios.

Runnable verification scripts (Node.js 18+, Windows-friendly):
- `node scripts/stress-test-99-cap.mjs` (add `--base=https://...` to test prod)
- `node scripts/verify-cron-cleanup.mjs` (requires `CRON_SECRET` env var)
- `node scripts/verify-rewrite-status.mjs`
- `node scripts/migrate-pro-emails.mjs` (requires `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` env vars)

Remotion demo testing: see `remotion-demo/` for test and render commands.

# Documents referenced every session

- [ ] `docs-src/` — VitePress documentation source (7 pages, Markdown frontmatter, custom theme)
- [ ] `docs-src/.vitepress/config.js` — VitePress configuration (cleanUrls, logo, nav, sidebar, base path, fonts)
- [ ] `docs-src/.vitepress/theme/custom.css` — VitePress custom theme (fonts, colors, links)
- [ ] `docs-internal/DEVELOPER.md` — developer guide (architecture, code structure, deployment)
- [ ] `docs-internal/API.md` — API reference (29 endpoints, error codes, webhooks)
- [ ] `docs-internal/limitations.md` — internal truth counterpart to public limitations
- [ ] `docs-internal/admin-setup.md` — admin activation setup
- [ ] `docs-internal/wispr_flow_company_intelligence.md` — Flow company background
- [ ] `docs-internal/wispr_flow_research.md` — Flow research notes
- [ ] `docs-internal/wispr_flow_improvement_areas.md` — Flow improvement areas
- [ ] `docs-internal/interview-quick-reference.md` — interview prep source of truth
- [ ] `docs-internal/daily-capacity-system.md` — daily capacity system
- [ ] `docs-internal/monitoring-reliability-architecture.md` — 4-layer monitoring architecture (Sentry, health, Better Stack, QStash)
- [ ] `docs-internal/Tanay-linkedin-posts.md` — Wispr Flow CEO thinking (mandatory per Tanay lens rule)
- [ ] Notion "WIBE_STORIES frontlogs" — pending items, decisions, services, user updates (source of truth; migrated from local PENDING.md, DECISIONS.md, USEFUL_SERVICES.md, C_WS-updates.md)
- [ ] `frontlogs/EMAILS.md` — email types catalog (10 types, 3 implemented, Resend/Loops split)
- [ ] `frontlogs/CURRENT.md` — current phase, task, next task

## Project overview

- Tagline: "Turn your voice into shareable cards, in your language, in seconds."
- Hero subtitle: "Record with the mic or dictate with Wispr Flow. Style and share with love."
- Multi-file vanilla HTML/CSS/JS voice-to-card app. No build step for the app itself. Open `wisprstories.html` to run.
- VitePress documentation in `docs-src/` has a build step (`npx vitepress build docs-src`) that runs on Vercel deploy. Docs served at `/docs/`.
- Serverless API routes via Vercel. `package.json` must exist for dependency install.
- `remotion-demo/` — **Marketing demo video project** (Remotion/React). Created by a separate AI agent. **Do NOT delete** — it's a marketing asset, not part of the live app. Gitignored + .vercelignored.

## Key files

- `docs-src/` — VitePress documentation source (7 pages, Markdown + YAML frontmatter, VitePress theme)
- `docs-src/.vitepress/config.js` — VitePress config (nav, sidebar, base: /docs/, cleanUrls, logo, fonts)
- `docs-src/.vitepress/theme/custom.css` — custom theme (DM Sans, heading/body/link colors, light/dark + table styles)
- `docs-src/.vitepress/public/assets/` — logo images (logo-light.png, logo-dark.png) for VitePress nav
- `docs-src/index.md` — VitePress home page
- `docs-src/product-guide/wibe-stories.md` — full product documentation (vision, architecture, features, roadmap)
- `docs-src/product-guide/trust-center.md` — services used (Deepgram, OpenRouter, Vercel, etc.)
- `docs-src/reference/acknowledgements.md` — known issues (WebM audio, Firefox, translations)
- `docs-src/reference/limitations.md` — product limitations (caps, expiry, moderation)
- `docs-src/reference/roadmap.md` — Product roadmap placeholder
- `docs-src/updates/changelog.md` — version history
- `docs-src/legal/` — 4 legal pages (License, Terms, Privacy, Refund Policy) in VitePress Markdown, path-keyed sidebar under `/legal/`
- `docs-internal/DEVELOPER.md` — developer guide (getting started, code structure, deployment)
- `docs-internal/API.md` — API reference (29 endpoints, error codes, webhooks)
- `docs-internal/limitations.md` — internal truth counterpart to public limitations
- `docs-internal/agsync-archive.md` — archived agsync session notes (verbatim; the AGENTS.md agsync block keeps only the last ~4)
- `api/voice.js` — audio upload endpoint (called after PNG upload with `X-Short-Id`)
- `api/rewrite-confirm.js` — tone rewrite commit endpoint (Redis INCR on per-tone counter)
- `api/rewrite-status.js` — read-only GET endpoint for per-tone counts from Redis
- `api/stt.js` — STT via Deepgram Nova-3 + Whisper/OpenRouter, Edge runtime
- `api/resend-key.js` — automated Pro key recovery via email (resends key by email lookup)
- `wisprstories.html` — main HTML (includes the Welcome landing page overlay markup, `lp-*` classes, `#onboardingOverlay` / `#onboardingGotIt`)
- `wisprstories.js` — app logic (STT, recording, card creation, share, tones, i18n; `showOnboarding`/`hideOnboarding` first-visit landing page)
- `global/fonts.js` — script font mapping
- `global/demo.js` — demo animation (disabled, preserved for restoration)
- `global/capacity-check.js` — daily capacity check (99-user cap), admin/pro key headers
- `global/styles/` — CSS modules (16 files)
- `global/pricing-modal.js` — pricing comparison modal (triggered from footer menu)
- `global/vault.js` — Wibe Vault overlay (browse, select, delete, audio playback, localStorage persistence)
- `global/styles/vault.css` — Wibe Vault styles (CSS Grid layout, tile animations, audio badge, dark mode)
- `global/styles/layout.css` — layout styles (footer menu divider)
- `assets/i18n/` — 11 UI locales + `en.json`. **Do not regenerate deleted locales.**
- `assets/i18n/i18n.js` — i18n loader with `data-i18n`, `getI18nSync()`
- `assets/brand/` — brand assets (logos in 4 variants, favicons, OG template, YGL footer logo, ghost images, demo GIF)
- `assets/occasions/` — 60 occasion images (.png)
- `api/health.js` — health endpoint (Redis ping, Neon SELECT 1, API key presence checks)
- `api/` — Vercel API routes
- `api/lib/og-render.js` — OG image generator (composites card onto brand/WS-OG-Image.png template)
- `api/lib/occasion-email.js` — occasion email template builder (30 global occasions, Resend transactional API)
- `api/lib/occasion-dates.json` — year-by-year date lookup for movable festival dates (2026-2030)
- `api/cron/send-occasion-emails.js` — daily cron (8 AM UTC) that matches date to occasion and emails Pro + subscriber users
- `api/subscribe-occasion.js` — email subscription endpoint (validates + stores in Redis)
- `frontlogs/` — internal planning files (git-ignored): `EMAILS.md`, `CURRENT.md`, `ups_pres/` (email preview HTMLs). PENDING.md, DECISIONS.md, USEFUL_SERVICES.md, and C_WS-updates.md migrated to Notion (see Frontlogs section below)
- `lib/redis.js` — Upstash Redis client
- `lib/allowed-emails.js` — email domain allowlist (Gmail, Outlook, Yahoo, Proton, iCloud, Tuta + regional variants)
- `lib/lang-stats-redis.js` — separate Redis client for lang usage stats
- `lib/chart.umd.min.js` — Chart.js bundle
- `api/track-usage.js` — card creation usage tracking
- `api/lang-stats.js` — language counters GET
- `language-stats.html` — Language Stats page with Chart.js + data table
- `docs-internal/existing-redis.md` — Upstash Redis architecture
- `docs-internal/daily-capacity-system.md` — 99-user capacity system
- `docs-internal/language-stats-page.md` — stats page architecture
- `global/styles/language-stats.css` — stats page CSS
- `global/language-stats.js` — stats page JS
- `about.html` — About page
- `features.html` — Features page with 5 capability sections (Speak, Write, Rewrite, Design, Share)
- `global/styles/about.css` — About page CSS
- `global/styles/features.css` — Features page CSS
- `global/about.js` — About page JS
- `global/features.js` — Features page JS
- `vercel.json` — deployment config, CSP security headers, .html redirect
- `.vercelignore` — excludes remotion-demo/ from deployments
- `sw.js` — service worker for offline font caching
- `global/footer-menu.js` — footer menu rendering, i18n, reorder, occasion email subscription popup
- `global/occasions/` — occasion triggers, date-occasions, country mapping
- `remotion-demo/` — **Marketing demo video project** (Remotion/React). Do NOT delete.
- `scripts/stress-test-99-cap.mjs` — load test for 99-user cap
- `scripts/verify-cron-cleanup.mjs` — cleanup auth test
- `scripts/verify-rewrite-status.mjs` — rewrite-status test
- `scripts/migrate-pro-emails.mjs` — one-time Pro email backfill into Redis set for occasion campaigns
- `docs-internal/every-design-decision-explained.md` — architecture Q&A
- `docs-internal/model-comparison.md` — model latency/pricing comparison for rewrite chains
- `docs-internal/PRICING.md` — pricing documentation (cost breakdown, profitability math, tiers, key naming, purchase flow, expiry timeline)
- `assets/card-bgs/spiral-overlay.webp` — grayscale spiral overlay for custom color background (used with `background-blend-mode: overlay`)
- `internal-logs/ilogs-ws.md` — acknowledged logs source-of-truth (git-ignored)
- `internal-logs/observer.js` — keyboard shortcut handler for beacon redirect
- `api/beacon.js` — redirect handler (reads `WS_EP` env var)
- `api/download/[id].js` — download proxy (serves Blob files with `Content-Disposition: attachment`)
- `lib/neon.js` — Neon Postgres connection singleton (edge-compatible HTTP query via `@neondatabase/serverless`)
- `lib/sentry.js` — Sentry init for Edge runtime API routes (`@sentry/vercel-edge`). **Lazy-loads the SDK via fire-and-forget dynamic import with a no-op fallback** — the SDK's ESM build imports `node:async_hooks`/`node:events` which the local `vercel dev` sandbox can't polyfill (would crash edge routes with `Buffer is not defined`); production loads the SDK normally and behaves as before (only a short async-init window drops early errors)
- `lib/sentry-node.js` — Sentry init for Node.js runtime API routes (`@sentry/node`)
- `api/vault/list.js` — GET vault cards for a Pro key (Neon query, camelCase response)
- `api/vault/save.js` — POST save a vault card (validates Pro key, enforces 50-card limit, Neon insert)
- `api/vault/delete.js` — POST delete vault cards by client_id array (scoped to Pro key)
- `api/vault/migrate.js` — POST batch-migrate localStorage cards to server (for new Pro users upgrading)
- `scripts/setup-neon-table.mjs` — one-time Neon table + index creation (vault_cards)

## Wibe Vault system

- `global/vault.js` — full-screen overlay invoked from footer menu or creation flow
- `global/styles/vault.css` — CSS Grid layout (`auto-fill, minmax(250px, 1fr)`), `tile-in` staggered animation, audio badge with play toggle, Select All/Delete flow, toast Undo button
- **Storage**: Neon Postgres (`vault_cards` table) for Pro users, localStorage (`wsVaultCards`) for free users. `saveCardToVault()` in `wisprstories.js` saves automatically after upload for Pro users
- **Lifecycle**: Open → load from Neon API (Pro) or localStorage (free) → render grid → select/delete/download (API for Pro, localStorage for free) → persist on mutation
- **Pro auto-save**: On Create Card click (btnC), Pro users' cards are automatically uploaded in the background and saved to vault with a 6s Undo toast. Share button (btnS) never saves to vault — it reuses btnC's `_shareBlob` and `_shortId` via the `_vaultAutoSaved` shortcut path, or uploads fresh for the share flow without vault save. The auto-save IIFE is stored as `window._vaultAutoSavePromise`; btnS awaits it (with catch) before the fast-path check so a pending auto-save can't race the share upload
- **Vault bug-fix batch (2026-07-31, implemented)**: (1) Undo toast no longer bypasses the toast queue — `showVaultUndoToast` now guards `t.dataset.updateToast === "1"`, sets `_toastShowing = true`, clears the pending timeout, and drains `_toastQueue` on both timeout and Undo click; (2) btnC/btnS race fixed via `window._vaultAutoSavePromise` (see above); (3) share-preview blob URL leak fixed — `_sharePreviewUrl` is revoked before each new preview and on `shareClose`/`shareBackdrop`; (4) `saveCardToVault` now persists `audioUrl: ""` (session-only blob URLs would dangle); (5) rapid voice-play leak fixed — `_voicePlayUrl` revoked on pause, new play, `onended`, and `onerror`; (6) TOCTOU fixed in `api/vault/save.js` — atomic `INSERT ... SELECT ... WHERE (SELECT COUNT(*)...) < 50 RETURNING *` replaces SELECT+INSERT; empty rows → `{error:'vault_full'}` 400; (7) vault API failures now toast ("Couldn't load cards from server", "Couldn't remove card from server", "Couldn't sync your cards") and the "Card removed from vault" success toast is gated on server delete success (still optimistic locally — card resurrects on reload if server delete failed)
- **Card images**: Card thumbnails show actual card image (`<img src="imageUrl">`) when `image_url` is stored in DB; falls back to occasion emoji
- **Share from vault**: Copies `/c/:shortId` link (via clipboard or Web Share)
- **Download from vault**: Download handler shows placeholder message (image download deferred)
- **Pricing**: "Up to 50 cards" highlighted in Pro row of pricing modal (`pricing-feature-highlight`)
- **Non-Pro**: Select button hidden, locked indicator shown (`fa-lock`), button disabled
- **Audio**: Cards with audio show an audio badge; toggle icon changes but no Audio element is created — playback is broken (no `.play()` call; `audioUrl` is session-only blob)
- **API**: `api/vault/list.js` (GET), `api/vault/save.js` (POST), `api/vault/delete.js` (POST), `api/vault/migrate.js` (POST) — all guarded by Pro key validation
- **DB**: `lib/neon.js` connection singleton, `vault_cards` table with indexes on `pro_key` and unique index on `(client_id, pro_key)`. `image_url TEXT` column now in DB (auto-added via `ALTER TABLE ADD COLUMN IF NOT EXISTS` in all 4 vault API endpoints). Card images now display in vault tiles and card view.
- **Auto-create table**: All 4 vault API endpoints (`save.js`, `list.js`, `delete.js`, `migrate.js`) include `CREATE TABLE IF NOT EXISTS vault_cards (...)` on every request — self-healing if the table is missing in Neon. Schema matches `scripts/setup-neon-table.mjs` plus `image_url TEXT NOT NULL DEFAULT ''`. Each endpoint also runs `ALTER TABLE vault_cards ADD COLUMN IF NOT EXISTS image_url` for existing tables. Indices not auto-created.

## Card metadata sidecar system

- `api/upload.js` stores `meta/<shortId>.json` alongside card images (`{ text, name, tone, p, r, theme, pro }`).
- `api/c/[id].js` fetches metadata to personalize landing page. Old cards fall back gracefully.
- `meta/` cleaned up by `api/cleanup.js` (7 days for free, 14 days for Pro).

## Welcome landing page system

- `wisprstories.html` — the landing is the **first-paint page** for new visitors (not an overlay): `#onboardingOverlay` is visible by default — a centered **95vw × 95vh card** (radius 14px, soft shadow, solid `#1a1a1a` card background — **always dark by design, the landing never renders in light mode**) floating over a `#fff8eb26` 15%-cream-wash backdrop (no backdrop blur) — **on mobile (≤720px) the backdrop is opaque `#2A2A2A` instead, fully hiding the app behind** — so on desktop the real app shows through blurred/dimmed **around the card's edges** — the sides of the background must stay visible (user-specified size, do not make the banner full-bleed). Contains `lp-nav` (brand logo — white-on-transparent variant + Features/About/Pricing links + `.lp-nav-auth` Sign in/Sign up buttons), `lp-hero`, `lp-benefits` (4 badges), `lp-cta` (`#onboardingGotIt`), `lp-video-wrap` (`#lpVideo` WebM demo, **src fully JS-managed** — `mob-sc-1.webm` (1080×1350 portrait) ≤720px, `wheel-showcase-1-1080p.webm` (1920×1080) ≥721px - hosted on Cloudflare R2 (see Video-Base bullet); **clicking toggles shot 1 ↔ 2** (`_lpVideoShot`); a `matchMedia("(max-width: 720px)")` change listener swaps the pair instantly on breakpoint crossing, same shot index (`lpIsMobile`/`lpCurrentFile`/`lpSetVideoFile` — **no `<source media>`**: for `<video>` those are evaluated only at selection time and never react to resize, see the agsync 2026-08-01 note); playback starts only for first-timers — the `ws-app-return` guard inside `lpSetVideoFile` means returners never fetch the video), a `.lp-hint-pill` ("Tap to switch view", always visible while the landing is up - never fades on click; gone for good once the landing exits (it never reopens) -, bottom-center above the footer — `bottom: 34px`, centered, `#ffffeb33`, no background/border), and a `.lp-footer` ("Wibe Stories © 2026 YGLabs", absolute at the card/page bottom — 14px bottom padding, 11px, `font-weight: 100`, `#ffffeb55` — floating over the video's transparent bottom strip). No close button, no backdrop dismissal — CTA is the only entry. Nav links use `/features`, `/about`, `/pricing` (Pricing placeholder — do NOT route to the pricing modal; Sign in/Sign up no-op placeholders). **English-only by design** — static markup, zero i18n hooks. The landing markup lives AFTER the app block (before end-of-body scripts) so `#appRoot` can wrap the whole app in one element.
- **`#appRoot` backdrop + lock**: the entire app is wrapped in `<div id="appRoot">`. While the landing is up: `position: fixed; inset: 0; overflow: hidden; transform: scale(1.04); filter: blur(8px) brightness(0.55) saturate(0.8); pointer-events: none` + `inert`/`aria-hidden` (JS-added by `focusLanding()` for **first-timers only** — never bake them into the HTML or returners would be permanently locked). `html.ws-app-return` restores normal flow.
- **Pre-paint returner flip**: the head script (wisprstories.html ~line 95, next to the theme init) adds `html.ws-app-return` when `localStorage["wsOnboardingSeen"]` is set — before first paint. Returners: landing `display: none`, appRoot normal → app as first frame. First-timers: landing as first frame. No flash either way.
- `wisprstories.js` (~line 3470) — `focusLanding()` locks the app (inert/aria-hidden; the CTA auto-focus was removed — see the v0.11.28.1 ring fix below); `enterApp()` (guarded by `_enteringApp`) adds `ws-entering-app` → landing fades 0.35s while app unblurs/zooms 0.55s → after 600ms (or immediately under `prefers-reduced-motion`): sets flag, adds `ws-app-return`, removes `inert`/`aria-hidden`, pauses `#lpVideo`, then re-checks version state (`if (_updatePending) showUpdateToast(); else checkVersion();`). `showUpdateToast()` no-ops while `ws-app-return` is absent. No reopen path — landing shows once until "Got it" is pressed, then never again.
- `global/styles/overlays.css` — landing + backdrop states: `.onboarding-overlay` (default visible, flex-centered, always `#fff8eb26` 15% cream wash on desktop — **opaque `#2A2A2A` at ≤720px**, no backdrop blur, `overscroll-behavior: none`), `.onboarding-banner` (95vw × 95vh card, radius 14px, shadow, always `#1a1a1a` — landing is always dark, no light variant, `overflow-y: auto` for short screens + `overscroll-behavior: contain` so landing scroll can never chain to the app — **do not make it full-bleed**), `#appRoot` locked backdrop, `html.ws-app-return` (returner flip), `html.ws-entering-app` (enter transition), `prefers-reduced-motion: reduce` (no animation), `.lp-*` content styles (nav/hero/benefits/CTA/video, nav links hidden under 720px, `.lp-nav-auth` flex gap 10px, `.lp-nav-signin` ghost / `.lp-nav-signup` filled pill, `.lp-cta-btn` amber `#F59E0B` + **literal `#1a1a1a` ink text** + `outline: none` (no focus ring — see v0.11.28.1), `.lp-video` fills the remaining card height (`flex: 1` wrap + `min-height: 0`, video `height: 100%`, **desktop ≥721px: `width: 100%` + `object-fit: cover` (cropped, edge-to-edge - wrap padding removed/commented out)** / **mobile ≤720px: `width: auto` + `height: auto` + `max-width/max-height: 100%` + `object-fit: contain` (portrait mob-sc video largest-fit — no crop, no letterbox), wrap padding removed (commented out - video flush edge-to-edge), hero title `clamp(34px, 8vw, 44px)`, subtitle 13px, benefit badges 10.5px/`4px 10px` — mobile hierarchy: title clearly leads, badges stay below CTA weight** — the page never scrolls, video sits at the bottom, `cursor: pointer` on the video). `.lp-footer` (absolute page-bottom footer — 14px bottom padding, 11px, `font-weight: 100`, `#ffffeb55`, `pointer-events: none` — floats over the transparent video strip) and `.lp-hint-pill` (bottom-center above the footer — `bottom: 34px`, centered, 10.5px, `#ffffeb33`, no background/border, `pointer-events: none` - always visible while the landing is up, no fade machinery (removed per user spec)). **All landing colors are hardcoded dark-mode literals (`#ffffeb` family) — the landing never depends on the theme; no `:root.dark` landing overrides exist, do not re-add them.**
- **i18n**: Landing has **zero i18n keys** (English-only, see above). `footer.help` ("How to Use") was removed from all 11 locales in v0.11.27.0 along with its consumers — do not restore. The `landing` block survives only in `en.json` (canonical English copy); the 10 non-English locales no longer have it. Other `landing.*` keys (`navDocs`/`navContact`) were also removed in v0.11.27.0 — do not restore.
- **Video hosting**: Cloudflare R2 bucket `wibe-stories-media`, subfolder `welcome-landing/`, served publicly via r2.dev. Base: `https://pub-5b5b01c9c3a14dad80d7d71e76a269b4.r2.dev/welcome-landing/`. Four files (all verified live 200 `video/webm`, byte-identical to local): `wheel-showcase-1-1080p.webm` (1920×1080, 11.3 MB — desktop ≥721px shot 1), `wheel-showcase-2-1080p.webm` (1920×1080, 7.7 MB — desktop shot 2), `mob-sc-1.webm` (1080×1350, 13.0 MB — mobile ≤720px shot 1), `mob-sc-2.webm` (1080×1350, 6.7 MB — mobile shot 2). The desktop files are v0.11.29.0 1080p re-encodes of the 2560×1440 masters (backup in the now-gitignored `assets/cards/`). **Alpha truth**: the masters carry an `alpha_mode: 1` container tag, but ffmpeg's demuxer reads no alpha plane ("planes not available") — and the video background is pure black, so the opaque re-encodes are visually identical to transparency on the `#1a1a1a` card. src chosen per viewport + shot in JS (`lpIsMobile`/`lpCurrentFile`/`lpSetVideoFile` — click toggles the shot, a `matchMedia` change listener swaps the pair on breakpoint crossing and preserves `currentTime`; `prefers-reduced-motion` skips autoplay until the user clicks). Videos are git-ignored (`assets/cards/*.webm|mp4|gif`) and must never be committed.
- **R2 user-content bucket**: Second R2 bucket `wibe-user-content` (Location Automatic, Standard) created 2026-07-31 for user-generated card content (cards, OG previews, voice clips, metadata sidecars) — candidate replacement for Vercel Blob. Credentials live in `.env` (`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`) and Vercel dashboard env vars. App code migration (replace `@vercel/blob` calls in `api/upload.js`, `api/cleanup.js`, `api/c/[id].js`, `api/download/[id].js`, `api/og/[id].js`, `api/voice.js`) is a separate pending task.



<!-- agsync: last-run 2026-08-01; v0.11.29.0 - Welcome landing demo videos shipped to the CDN and the whole release prepped for one `vercel --prod`: all 4 videos uploaded to Cloudflare R2 (bucket `wibe-stories-media`, subfolder `welcome-landing/`, public r2.dev base `https://pub-5b5b01c9c3a14dad80d7d71e76a269b4.r2.dev/welcome-landing/`), each verified live 200 `video/webm` byte-matching the local copies (desktop shot 1/2 are the v0.11.29.0 1080p re-encodes of the 2560x1440 masters - 1920x1080, 11.3 MB / 7.7 MB; mobile mob-sc-1/2 unchanged 1080x1350). `_LP_VIDEO_BASE` in wisprstories.js swapped from `assets/cards/` to the R2 CDN base (comment notes the alpha truth: the masters' `alpha_mode: 1` is only a container tag, ffmpeg decodes no alpha plane, and the pure-black bg is visually identical to transparency on the `#1a1a1a` card - earlier 'embedded alpha' doc claims corrected). `.gitignore` now ignores `assets/cards/*.webm|mp4|gif` + `assets/featurepage/hero-video/`. CSP in vercel.json: `media-src 'self' blob: https://*.r2.dev;`. Version 0.11.28.1 -> 0.11.29.0 in all five homes (wisprstories.js CURRENT_VERSION, package.json, package-lock.json x2, version.json with buildDate 2026-08-01); changelog v0.11.29.0 topmost entry; trust-center gains a Cloudflare R2 row; product-guide Implemented list + new #18 Test scenarios section (landing first-visit/return, shot toggle, breakpoint swap preserves position, reduced-motion no-autoplay, no scroll). NEVER DEPLOYED yet - deploy + post-deploy verification checklist is the next move (deprecated animo-* video files still on disk pending deletion; docs marked live are safe because they describe the intended state). Post-session note (2026-08-01, instant breakpoint swap + footer/pill restyle): user found the demo video did NOT switch when resizing desktop<->mobile in dev tools until refresh - root cause: <video> <source media> attributes are evaluated only when the resource selection algorithm runs (initial load / load() / source add-remove); a viewport resize never triggers it, so the prior documented claim of 'native media-query behavior on resize' was wrong (assumed, never tested across the breakpoint; click-toggling worked only because load() re-ran selection). Fix: removed the two <source media> elements and the autoplay attribute from #lpVideo; the src is now fully JS-managed - lpIsMobile() (guarded window.matchMedia), lpCurrentFile() (pair = mobile|desktop x _lpVideoShot), lpSetVideoFile() (src swap + load() + muted play() with catch; no-op guard on unchanged src; ws-app-return guard means returners never fetch the 70MB video - bandwidth win vs the old autoplay+source behavior); a matchMedia('(max-width: 720px)') change listener (addEventListener with addListener fallback) swaps the pair instantly on breakpoint crossing, preserving the shot index. Per user spec: .lp-footer restyled (11px, font-weight 100, #ffffeb55, bottom 14px) and .lp-hint-pill moved from top-right to bottom-center (left/right 0, bottom 34px, centered, #ffffeb33, no background/border - commented-out style lines kept verbatim from the user's snippet); CSS comments updated. Verification: node --check, css braces 330/330, served html/css/js == disk (no server restart needed - no new static files), edge-case walkthrough (first-timer/returner, rapid clicks, old-Safari addListener fallback, matchMedia guard); changelog v0.11.28.1 amended (false claim corrected) + new fix bullet, AGENTS.md landing/CSS/Video-hosting bullets corrected - active docs now state the truth; historical agsync notes keep their original text (never deployed). Post-session note (2026-08-01, hint pill stays): per user follow-up - the hint pill no longer fades on click: it stays in its place (bottom-center above the footer, bottom 34px) and stays visible for the whole landing session; the `.lp-hint-hidden` fade machinery was removed (CSS rule + transition: opacity 0.4s ease deleted from overlays.css, click-handler pill toggle deleted from wisprstories.js, comments updated); it can never be seen again - the landing shows once per visitor and never reopens; changelog v0.11.28.1 bullets amended + AGENTS.md landing/CSS bullets updated (never deployed). Post-session note (2026-08-01, edge-to-edge video): per user spec - `.lp-video-wrap` padding removed (commented out: desktop `0 32px 0`, mobile `8px 14px 0`) and `.lp-video` base width `90%` → `100%` (desktop edge-to-edge, cover-cropped, height 100% - page still never scrolls); mobile rule untouched (`width: auto` + `object-fit: contain` largest-fit - portrait video never crops/letterboxes); changelog v0.11.28.1 follow-up bullet added + stale line 62 superseded-marker, AGENTS.md CSS bullet updated (never deployed). -->

## Notion MCP (global OpenCode config)

Notion MCP is configured at the global level (`C:\Users\srini\.config\opencode\opencode.json`) so it's available in **any** project directory (Wispr Stories, content-orchestra, etc.).

- **Config**: Remote MCP server at `https://mcp.notion.com/mcp`
- **Auth**: OAuth (completed once, tokens stored at `~/.local/share/opencode/mcp-auth.json`)
- **Capabilities**: Create, read, update, search Notion pages and databases conversationally
- **Limitations**: Requires user OAuth (not headless). Autonomous agents running via `orchestrator.js` (OpenRouter API) do NOT have MCP access — they need the API-based `notion.js` path.
- **`opencode-ai` CLI**: Installed globally (`npm install -g opencode-ai`) for `opencode mcp auth` commands
- **Desktop app**: Shares global config; restart required after config changes

## Project Tasks database (Notion)

A Notion database called **"Project Tasks"** was created on 2026-07-29 as the single source of truth for all remaining work. It lives under the "WIBE_STORIES frontlogs" page.

- **Database URL**: `collection://6c9a1552-956a-4cc4-a965-1616d039403c`
- **Items**: 110 total (109 Pending, 1 Discarded) across 15 categories
- **Views**: 📋 PENDING (filtered, grouped by Category), 📅 TIMELINE (by Target Date), 📊 ALL ITEMS (full list)
- **Workflow**: All new items go into the database. The old PENDING toggle list on the page is legacy/superseded.
- **Session start**: Fetch the Notion page to check the database for new/updated items. Also check the **C_WS-updates** brain dump section for any new unchecked items.
- **Updates**: Update the database row when completing/pending items. Do NOT update the page's static sections.
- **Schema**: Item (title), Category (15 options), Status (Pending/In Progress/Done/Discarded), Priority (Critical/High/Medium/Low), Effort (Small/Medium/Large/XLarge), Source (PENDING/DECISIONS/GAP/ROADMAP/EMAILS/SERVICES/C_WS-updates), Start Date, Target Date, Notes

## Frontlogs (Notion page)

Frontlogs are maintained on the Notion page "WIBE_STORIES frontlogs" (not in local files).

- **URL**: https://app.notion.com/p/3abf102bd4b1810d8da8c481d4a58fdb
- **Source of truth**: Notion page (local copies deleted). The **Project Tasks** database (on the same page) is the source of truth for work tracking. The static PENDING/DECISIONS/USEFUL_SERVICES sections are preserved for reference but superseded.
- **Session start**: At the start of every session, fetch this Notion page and check the Project Tasks database for new/updated items. Also check the **C_WS-updates brain dump section** — the AI MUST read this section every session even if not explicitly told to. Check for unchecked items and add them to the database.
- **Updates**: When completing a pending item, update its Status in the Project Tasks database to "Done" and add a note about completion. Also check the C_WS-updates brain dump section for any new unchecked items the user may have added.
- **User can update**: Anytime from anywhere — the AI picks up changes at session start
- **Migrated files**: PENDING.md (cleaned, only pending items), DECISIONS.md (grouped by domain), USEFUL_SERVICES.md (same structure, trimmed), C_WS-updates.md (verbatim)