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
- **Deploy**: `vercel --prod` from project root. **Deploy-blocker (2026-08-09)**: if a local `vercel build` ever fails with `spawn cmd.exe ENOENT`, it leaves a stale `.vercel/output/` (Build Output API v3 config) that later `vercel --prod` deploys instead of the real source — symptoms: tiny upload size (~27KB), old routes served, `deploy_failed: fetch failed`. Fix: `Remove-Item -Recurse -Force .vercel\output` (and `.vercel\cache`) before deploying. Never run `vercel build` locally (it cannot work on Windows via cmd.exe spawn) — just deploy directly.
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
- `api/voice.js` — audio upload endpoint (called after PNG upload with `X-Short-Id`; stores WebM only — the Apple-compatible M4A is produced lazily by `api/voice/m4a/[id].js`, never at upload time; rate limit 500/day per IP, key `wispr:voice-ip:<ip>:<date>`, admin bypass via `x-admin-secret`)
- `api/voice/m4a/[id].js` — lazy Apple-compatible transcode endpoint (v0.11.30.0): HEAD returns 200 iff m4a OR webm exists (never redirects/transcodes — `/c/:id` uses this for `hasVoice`); GET 302-redirects to the Blob m4a if cached, else fetches the WebM, transcodes with ffmpeg (`-vn -c:a aac -b:a 96k -movflags +faststart`, 25 s timeout), stores `voice/<id>.m4a` (contentType `audio/mp4`, 5-day cache), then 302s. 302s carry `Cache-Control: no-store`. Transcode failure → 404 (players fall back to WebM; next request retries)
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
- `api/health.js` — health endpoint (Redis ping, Neon SELECT 1, API key presence checks). v0.11.30.0 semantics: 503 ONLY when both Redis AND Neon are in `error` state (missing env vars → `unknown`, never contributes to 503); single-service blips return 200 with `degraded`; 3 s per-check timeout
- `api/` — Vercel API routes
- `lib/og-render.js` — OG image generator (composites card onto brand/WS-OG-Image.png template; moved from api/lib in v0.11.30.0 so it isn't deployed as a stray serverless function)
- `lib/occasion-email.js` — occasion email template builder (30 global occasions, Resend transactional API; movable-festival date table inline, `api/lib/occasion-dates.json` was legacy and is gone — moved from api/lib in v0.11.30.0)
- `api/cron/send-occasion-emails.js` — daily cron (8 AM UTC) that matches date to occasion and emails Pro + subscriber users
- `api/subscribe-occasion.js` — email subscription endpoint (validates + stores in Redis)
- `api/test-send-occasion.js` — dev-only occasion email test endpoint; v0.11.30.0: returns 401 unless `x-admin-secret` matches `ADMIN_API_SECRET`
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
- `vercel.json` — deployment config, CSP security headers, .html redirect. `/card` rewrites to `/wisprstories.html` directly (v0.11.30.0: `api/card.js` deleted; a rewrite to `/` alone 404s — Vercel doesn't chain rewrite-to-root, so point at the real file)
- `sitemap.xml` — 27 URLs: 4 app pages + 12 blog (home + 11 English posts) + 11 docs pages. No blog locale variants, no category pages, no `/c/` share routes (ephemeral). Update when new posts/pages ship.
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

- `api/upload.js` stores `meta/<shortId>.json` alongside card images (`{ text, name, tone, p, r, theme, pro }`). v0.11.30.0: also rate-limited 200/day per IP, key `wispr:upload-ip:<ip>:<date>`, admin bypass via `x-admin-secret`.
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

## Wibe & Wonder blog (blog-src/)

- **What**: VitePress blog publication "Wibe & Wonder" (9 locales: en/th/ko/ja/es/it/tl/tr/sv), served at `/blog/` via rewrites in `vercel.json`. Custom theme components (no stock VitePress layout). Sticky nav, masthead (in `BlogHome.vue`: "BLOG" tag pill + wordmark logo + mission sentence), category filter, month strip, featured + latest cards, pagination, related posts, article pages with AI footer CTA + article-footer stack (share, signature, disclosure, improve link, contributors), search, back-to-top. Posts currently live: 3 (see Phase 1 pipeline bullet).
- **Deploy**: `vercel --prod` from root (same as main app). Local preview: `npx vitepress dev blog-src` (port 5174) or serve `blog-src/.vitepress/dist`; a preview server on port 4177 was used for post-build verification (`http://localhost:4177/blog/`). **Vercel buildCommand (phase 1)**: `node scripts/fetch-content.mjs && npx vitepress build blog-src && node scripts/gen-sitemap.mjs && npx vitepress build docs-src` — fetch-content is a no-op without CONTENT_TOKEN/CONTENT_REPO (always exits 0, never fails the build); gen-sitemap must run after the blog build (it reads dist). Run the same chain locally before `vercel --prod` to catch failures in the deploy preview.
- **Masthead + logos (verified 2026-08-09)**: the masthead is NOT a separate component — it lives in `BlogHome.vue` as `<header class="ws-masthead">` (`.ws-masthead-tag` "BLOG" pill + `.ws-masthead-logo` img + `.ws-masthead-sub` = `t('mission')`), identical static markup for every locale, no video variants. `BLOG-LOGO.png` (4500×843, "BLOG" wordmark, 5 bar-chart dots) sits in `blog-src/.vitepress/public/` and is also copied to repo `assets/brand/` (untracked). The nav logo (`SiteNav.vue`, `logoLight = withBase('/WS-HORI-DARK.png')`) uses `WS-HORI-DARK.png` from the blog's own `public/` for ALL locales — the old repo-root sibling reference (file never existed at root, broken in built output) is gone. Phase 2 plans per-locale masthead videos replacing the static logo.
- **Design system (2026-08-05 restyle, user-specified, keep)**: body background `--cream: #fffff6`; **zero pill shapes anywhere** (no `border-radius: 999px` remains — all converted to 4px or flat); category filters and language links are **muted text links** (`.ws-pill`: `--ink3`, 14.5px/500, hover → `--ink`, active = `--ink`/700) with no background/border; month strip buttons flat (`ws-month-on` = dark/bold, no bg/border/radius); pagination/CTA/search/back-top buttons 4px radius flat.
- **Intercom alignment (2026-08-05, user-specified, keep)**: mirrors the Intercom blog layout (`intercom-blog-frontend.css` at repo root is the reference). Spacing tokens in `:root` (`--space-2…--space-160` = `.125rem`…`10rem`); `.ws-container` 880→**1050px**, sides 12px mobile → 24px ≥768px. Page paddings on `<main>` via Layout.vue classes: `.ws-page-home` 80px/12px → ≥768px 120px/24px/96px → ≥1280px 160px top/96px bottom; `.ws-page-category` 80px/12px/48px → ≥768px 160px/24px/96px; `.ws-page-post` 80px/12px/40px → ≥768px 160px/24px/96px (masthead/category-head/article-top own top paddings zeroed so totals match Intercom); containers on those pages get `padding-left/right: 0` (page padding covers the sides). Category pills (`.ws-pills`) and month strip (`.ws-months`) are full-width outside the container with side padding matching the page (12px mobile → 24px ≥768px). Post pages split: `.ws-article-main` narrow 45rem (720px) + wide `.ws-container` foot for RelatedPosts/CTA (Intercom `__footer` pattern). Footer `margin-top: 64px` → 0.
- **Cards (Intercom list style)**: `PostCard.vue` is now `<article class="ws-card">` — whole-card anchor removed (nested-anchor defect: a clickable `.ws-cat` `<a>` inside a card-`<a>` is invalid HTML); separate links: `.ws-card-title`, `.ws-card-img` (`330px`, `aspect-ratio: 5/3`, `object-fit: cover`), `.ws-cat` (locale-aware category href, same pattern as CategoryPills), `.ws-read-more`. **No author row in list cards** (Intercom has none). `.ws-list` gap 0; `.ws-list .ws-card` `padding: 24px 0` + `border-bottom` + `:first-child` `border-top`; hover `background: var(--cream2)`. Meta rows: `.ws-cat` (animated underline via `::after` `scaleX(0→1)`, 2px) + "Published on {date}" (`publishedOn`), then clock SVG + `readMin` (computed in `posts.data.js` from `bodyText`, words/200) + "Read more" (`readMore` i18n key added to all 9 locales). Mobile (≤768px) stacks column, **image stays visible** (user decision).
- **Featured card** = Intercom `.c-posts-card-latest`: `<article class="ws-featured-card">`, column with centered meta on mobile → ≥1024px `row-reverse`, image 65% / body 35%, gap 32px, `margin-bottom` 96px; author row with 28px initials circle `.ws-avatar` (`border-radius: 50%`, `background: var(--ink)`, letter initial); title/excerpt/clock read-time/"Read more"; `.ws-featured-nothumb` when no image. `.ws-avatar` also used in the article header meta row.
- **Pagination**: `.ws-pagination` `margin-top` 48px → 96px ≥768px; buttons `min-width/height: 40px`, hover `background: var(--cream2)`.
- **Language select**: `.ws-lang-select` in `LanguagePills.vue` binds `:value` to the current locale's **href** (`/blog/`, `/blog/th/`, …) so the select displays the current language name instead of blank — do NOT bind to the locale code while option values are hrefs. Select is flat (transparent, 1px border, 4px radius), not pills.
- **Month strip (verified 2026-08-09)**: `MonthStrip.vue` renders two control sets — `.ws-year-row` year buttons (`.ws-year-on` when selected) + `.ws-month-row` month buttons (`.ws-month-on` for the All button and the selected month), hidden ≤768px, and `.ws-select-row` with two selects on mobile (Month options disabled when that month has no posts; default option = All). Selection flows through the `selected` prop (`"YYYY"` or `"YYYY-MM"`; `BlogHome` computes the default = current month if it has posts, else the latest month with posts) and `update` emits. Month labels via `Intl.DateTimeFormat` with a locale map (th-TH/ko-KR/ja-JP/es-ES/it-IT/fil-PH/tr-TR/sv-SE). There is NO `auto` prop and no `?m=` query param support — category pages do not use MonthStrip at all. Dates arrive from the data loader as ISO `YYYY-MM-DD` strings, not Date objects — `new Date(x)` works on them.
- **Article footer stack (verified 2026-08-09)**: `BlogArticle.vue` footer above the AI footer CTA: `.ws-share-row` ("Share" label + single `.ws-share-btn` — Web Share API `navigator.share` with clipboard fallback, button flips to "Copied" for 2s; a second `.ws-share-top` icon button sits in the article header). **There are no WhatsApp/X buttons anywhere.** Then `.ws-signature` (plain translated string), `.ws-disclosure` (translated string), `.ws-improve` link to the Tally form `https://tally.so/r/WO6B8Q?article=<title>` (title from frontmatter; `improve: false` in frontmatter switches the label to `improveFinal`, else `improveOpen`) — this Tally form is the Way B intake path. Conditional `.ws-contributors` row (from frontmatter `contributors`, initials circles) below the improve link. All footer-stack i18n keys (`signature`/`disclosure`/`shareLine`/`shareButton`/`improveOpen`/`improveFinal`/`copied`) exist in all 9 locales.
- **Share button (single)**: one share control in `BlogArticle.vue` (`.ws-share-btn` in the footer share row + `.ws-share-top` in the header) — Web Share API with clipboard fallback and a 2s "Copied" flip. No per-network buttons exist.
- **Categories (verified 2026-08-09)**: the `CATEGORIES` dict in `theme/i18n.js` has 6 keys ×9 locales — `voice-recording-tips` ("Voice Dictation"), `stories-traditions` ("User Stories"), `tech-ai` ("Tech Behind"), `occasions-celebrations` ("Seasonal Moments"), `product-news` ("Personal Voice"), `languages-culture` ("Language Culture"). 6 category pages per locale in `categories/*.md` match those keys. (Earlier "General/Creative/Business/Tech" naming is gone; the current names are the canonical set — do not re-add the old ones.)
- **Phase 1 pipeline (verified 2026-08-09)**: `scripts/fetch-content.mjs` is a **no-op** (exit 0) unless `CONTENT_TOKEN` + `CONTENT_REPO` env vars are set (Vercel) — then it git-clones the private content repo and copies `posts/` + the 8 locale `*/posts/` dirs into `blog-src/`. It does NOT read `content-guide/` or `_backup-blog-articles/` and never regenerates categories. `scripts/gen-sitemap.mjs` runs AFTER `npx vitepress build blog-src` and writes `blog-src/.vitepress/dist/sitemap.xml` from the built HTML (excludes 404 + `*-en` companion pages; priorities home 1.0 / locale homes 0.9 / categories 0.7 / articles 0.6) — the repo-root `sitemap.xml` (27 URLs) is a separate hand-maintained file. **Content on disk**: 3 posts live — `posts/welcome-to-wibe-and-wonder.md` (en launch post, product-news, 2026-08-09) + `th/posts/mother-tongue-thai-placeholder.md` + `ko/posts/clearer-voice-korean-placeholder.md`; 27 full-length AI-generated articles sit git-ignored in `_backup-blog-articles/` (9 locale dirs, 11 en) awaiting review/robot publishing. `blog-src/content-guide/` holds the pipeline docs (TEMPLATE, CATEGORIES, LANGUAGES + 5 topic briefs). **Way B robot (phase 2)**: planned autonomous agent that publishes the backed-up content and processes emails/updates via the Tally `?article=` prefill. Before deploying run the exact Vercel buildCommand chain locally (fetch-content no-ops, but the build + sitemap + docs must pass).
- **Key files**: `blog-src/.vitepress/config.js` (base `/blog/`, cleanUrls), `theme/custom.css` (all design rules + `--cream: #fffff6`), `theme/i18n.js` (LOCALES/CATEGORIES/UI dictionaries in 9 locales, `useI18n`/`useLocale`/`fmtDate`, `mission` dict), `theme/data/posts.data.js` (article data), `theme/components/` (BlogHome, BlogArticle, BlogCategory, PostCard, FeaturedPost, CategoryPills, LanguagePills, MonthStrip, Pagination, RelatedPosts, SearchBox, BackToTop, SiteFooter, SiteNav, Layout), `index.md` + per-locale `index.md`, `posts/*.md` (3 posts), `categories/*.md`, `content-guide/` (pipeline docs). Blog is **untracked in git** as of 2026-08-05 (`git status` shows `?? blog-src/` and ` M vercel.json`). `.gitignore` covers `blog-src/.vitepress/.temp/`, `cache/`, `dist/` (same pattern as docs-src). **`_backup-blog-articles/` at repo root is git-ignored** (phase 1 article drafts — do not commit).
- CSP (vercel.json) already allows `img-src https://picsum.photos` (article images are picsum placeholders) and `https://cdn.jsdelivr.net` (search uses a local index — no external libs).



<!-- agsync: nc: last-run 2026-08-09; Blog Phase 1 state verified against disk + pipeline docs corrected - Wibe & Wonder (blog-src/, served at /blog/, untracked in git): the masthead is NOT a Masthead.vue component - it is the .ws-masthead header inside BlogHome.vue (BLOG tag pill + BLOG-LOGO.png wordmark 4500x843 from blog-src/.vitepress/public/ (also copied to repo assets/brand/) + mission sentence via the mission i18n dict, all 9 locales, identical static markup, no video variants); nav logo in SiteNav.vue is always WS-HORI-DARK.png from the blog own public/ for ALL locales - the repo-root sibling reference that broke built output is gone (the file never existed at root); article footer stack in BlogArticle.vue above the AI CTA: share row with ONE .ws-share-btn (Web Share API, clipboard fallback, 2s Copied flip; plus a .ws-share-top header button; NO WhatsApp/X buttons anywhere), .ws-signature, .ws-disclosure, .ws-improve link to the Tally form https://tally.so/r/WO6B8Q?article=<title> (improveOpen/improveFinal label by the frontmatter improve flag; the Tally form is the Way B intake path), conditional .ws-contributors initials row; all footer-stack i18n keys (signature/disclosure/shareLine/shareButton/improveOpen/improveFinal/copied) verified present in all 9 locales; CATEGORIES dict = 6 keys x9 locales (voice-recording-tips Voice Dictation, stories-traditions User Stories, tech-ai Tech Behind, occasions-celebrations Seasonal Moments, product-news Personal Voice, languages-culture Language Culture) with 6 matching category pages per locale; MonthStrip: .ws-year-row year buttons (.ws-year-on) + .ws-month-row month buttons (.ws-month-on for All/selected) hidden at <=768px, .ws-select-row 2 selects on mobile (months without posts disabled; default All), selection via selected prop YYYY|YYYY-MM with BlogHome defaultSelection = current month if it has posts else latest month with posts, Intl.DateTimeFormat month labels via a locale map (th-TH/ko-KR/ja-JP/es-ES/it-IT/fil-PH/tr-TR/sv-SE), NO auto prop, NO ?m= param support, category pages do not use MonthStrip; posts on disk: 3 (en launch post posts/welcome-to-wibe-and-wonder.md 2026-08-09 product-news + th/posts/mother-tongue-thai-placeholder.md + ko/posts/clearer-voice-korean-placeholder.md); 27 full AI articles git-ignored in _backup-blog-articles/ (9 locale dirs, 11 en) awaiting review; pipeline: scripts/fetch-content.mjs is a no-op (exit 0) without CONTENT_TOKEN/CONTENT_REPO, git-clones the private content repo and copies posts/ + the 8 locale posts dirs into blog-src/ when set, never touches categories; scripts/gen-sitemap.mjs runs AFTER vitepress build blog-src and writes blog-src/.vitepress/dist/sitemap.xml from the built HTML (excludes 404 + *-en companion pages; priorities home 1.0 / locale homes 0.9 / categories 0.7 / articles 0.6) - the repo-root sitemap.xml (27 URLs) is separate and hand-maintained; Vercel buildCommand = node scripts/fetch-content.mjs && npx vitepress build blog-src && node scripts/gen-sitemap.mjs && npx vitepress build docs-src (verified in vercel.json; run the same chain locally before vercel --prod); verification: file lists, i18n key counts 9/9, PNG IHDR 4500x843, vercel.json buildCommand match, git status shows ?? blog-src/ + M vercel.json; NOT DEPLOYED - user review of the welcome post + placeholders first. Next: user review, vercel --prod, then Phase 2 (robot publishing of the 27 backed-up articles + per-locale masthead videos).
Post-session note (2026-08-09, v0.11.30.0 DEPLOYED - the deploy-blocker was a stale .vercel/output): v0.11.30.0 is live on wibestories.vercel.app (all 4 version homes sync, health 200, new CSP media-src blob+r2.dev active, /blog/ /blog/th/ /docs/ /features 200, /api/voice/m4a/<id> endpoint live - 404 for missing ids, /card 200). Root cause of the days of deploy failures (deploy_failed: fetch failed + 27KB uploads + old routes like /card -> /api/card): a stale .vercel/output/ directory from a local vercel build attempt (spawn cmd.exe ENOENT, Build Output API v3 config.json) - when present, vercel --prod deploys THAT output instead of the real source. Fix: Remove-Item -Recurse -Force .vercel\output + .vercel\cache, then deploy. Post-deploy catch: the new /card rewrite pointed at / but Vercel does NOT chain rewrite-to-root (404) - destination changed to /wisprstories.html directly (200). Docs updated for card retirement + lib moves: docs-internal/API.md (card section 14 deleted, 14-18 renumbered to 13-17, count 25, service table card row removed), cost-architecture.md (/api/card line removed), DEVELOPER.md (lib/ occasion-email paths + inline MOVABLE_DATES), interview-quick-reference.md (card row removed), scripts/test-send-occasion.mjs import fixed to ../lib/occasion-email.js, AGENTS.md key-file paths moved to lib/. Docs count sanity-checked: 25 top-level api/*.js routes match disk. Changelog v0.11.30.0 gained a retired-legacy-share-route bullet. Deployment section of AGENTS.md documents the stale-output blocker.
Post-session note (2026-08-05, blog restyle per user specs): Wibe & Wonder blog (blog-src/, served at /blog/, currently untracked in git) reworked to the user's exact design - body background now --cream #fffff6 (was --cream4-blue-ish); ZERO pill shapes remain anywhere (grep confirms no 999px/50% radii) - .ws-pill category/language filters became muted text links (--ink3 14.5px/500, hover to --ink, active --ink/700, no bg/border), month buttons flat (ws-month-on dark/bold no bg/border/radius), CTA/search/backtop/pagination buttons flattened to 4px radius, related-card overflow hidden removed; .ws-card uses the user's exact snippet (flex; justify-content:space-between; align-content:center; gap:30px; padding:16px; border/radius/background commented out), markup reordered to .ws-card-body-first then <img> (250x160, object-fit cover, radius 5px, flex-shrink:0), meta = .ws-cat + 'Published on {date}' (new publishedOn i18n key in all 9 locales; th/ko/ja/es/it/tl/tr/sv strings added), then h3 (30px), subtitle/excerpt, then author . min read; .ws-featured-card flattened (img 320px radius 5px, body 16px 0 0, h2 30px, .ws-cat #111/600/11px); fixed the blank language-select - LanguagePills.vue now binds :value to the current locale's HREF (/blog/, /blog/th/, ...) instead of the locale code so the select shows the current language name (kept the select in nav, pills variant still on home); PostCard.vue/FeaturedPost.vue/BlogArticle.vue meta now render 'Published on {date}'. Verified: npx vitepress build blog-src clean in 7.1s, served http://localhost:4177/blog/ 200 for home/category/article/Thai pages; select value=/blog/th/ + 'oodsffpe when 15 uhts 2569' on /blog/th/ (msg unicode garbled by console only).
Post-session note (2026-08-09, v0.11.30.1 SECURITY HARDENING - DEPLOYED): 5 security fixes live on wibestories.vercel.app. (1) STT stack leak (Critical, Notion GAP): api/stt.js 500 response is now generic { error: "Speech recognition failed" } - e.message/stack/type/ct/lang removed from the client response, details stay in server logs + Sentry. (2) XSS via #name hash (Critical): stripControls() only strips control chars; the hash name flowed unescaped into lbl.innerHTML (previously lines 1123/1125). Added escapeHtml() helper right below stripControls() in wisprstories.js and applied it to name+langName in all three card-label innerHTML branches (svg/onload-style payloads included - verified by node test). (3) i18n innerHTML injection (Critical): translations intentionally contain safe HTML (links to wisprflow.ai, br/, icon i tags) so assets/i18n/i18n.js gained sanitizeHtml() - strips script/style blocks, ALL on* handlers (including the <svg/onload=> self-closing variant, via [\s/]on\w+), javascript:/vbscript:/data: href/src (quoted+unquoted), and iframe/object/embed/base/link/meta/form/input/button tags. Tested: 7 attack payloads all neutralized, 3 real translation strings unchanged. (4) voice.js shortId path traversal (High): X-Short-Id now validated ^[a-zA-Z0-9]{4,12}$ (matches download + m4a endpoints; randomId() emits 8-char alnum so the app is unaffected) - 400 on ../evil verified live. (5) e.message leak in upload.js/voice.js catch blocks (High): now generic "Upload failed"/"Voice upload failed", details stay server-side. Version bumped v0.11.30.0 -> v0.11.30.1 (version.json + changelog entry, "Hardening release" heading matching house style). Notion Project Tasks: 9 rows marked Done (test-send-occasion x2 was actually fixed in v0.11.30.0 - the x-admin-secret gate; STT x2; #name XSS x2; i18n x2; voice.js x1) with completion notes; the composite "API security hardening" row stays Pending (cookie parser + pro-key bypass still open). Deploy: vercel --prod with portable node24 (no .vercel/output stale dir this time - blocker gone), health 200, version.json served v0.11.30.1, live checks: voice ../evil -> 400, valid shortId -> 200, STT 200 handler unchanged. m4a test blobs from earlier (wsvrfy*) self-clean via the 7-day cron. Next moves: the API security hardening cookie-parser + pro-key-bypass halves, then the High-priority batch (Clerk auth, /pricing page, calendar drawer, vault audio/download/share).
 -->

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
