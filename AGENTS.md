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
3. **Run `@agsync` at end of each session** to record changes. This automatically updates CHANGELOG.md and this file.
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
- **Local dev**: `vercel dev` or open `wisprstories.html` directly in browser
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
- [ ] `frontlogs/EMAILS.md` — email types catalog (10 types, 3 implemented, Resend/Loops split)
- [ ] `frontlogs/USEFUL_SERVICES.md` — planned services (Sentry, Tally, Better Stack, Unkey, Loops, ImageKit, Ahrefs)
- [ ] `frontlogs/PENDING.md` — pending changes (15 tracked changes)
- [ ] `frontlogs/CURRENT.md` — current phase, task, next task
- [ ] `frontlogs/DECISIONS.md` — decisions & reasoning

If any of the `frontlogs/` files above are missing, tell the user to type `/checkpoint` to create them.
- [ ] `frontlogs/DECISIONS.md` — decisions & reasoning

If any of the `frontlogs/` files above are missing, tell the user to type `/checkpoint` to create them.

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
- `api/voice.js` — audio upload endpoint (called after PNG upload with `X-Short-Id`)
- `api/rewrite-confirm.js` — tone rewrite commit endpoint (Redis INCR on per-tone counter)
- `api/rewrite-status.js` — read-only GET endpoint for per-tone counts from Redis
- `api/stt.js` — STT via Deepgram Nova-3 + Whisper/OpenRouter, Edge runtime
- `api/resend-key.js` — automated Pro key recovery via email (resends key by email lookup)
- `wisprstories.html` — main HTML
- `wisprstories.js` — app logic (STT, recording, card creation, share, tones, i18n)
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
- `assets/i18n/NATIVE-REVIEW.md` — per-locale review checklist
- `assets/occasions/` — 60 occasion images (.png)
- `api/health.js` — health endpoint (Redis ping, Neon SELECT 1, API key presence checks)
- `api/` — Vercel API routes
- `api/lib/og-render.js` — OG image generator (composites card onto WS-OG-Image.png template)
- `api/lib/occasion-email.js` — occasion email template builder (30 global occasions, Resend transactional API)
- `api/lib/occasion-dates.json` — year-by-year date lookup for movable festival dates (2026-2030)
- `api/cron/send-occasion-emails.js` — daily cron (8 AM UTC) that matches date to occasion and emails Pro + subscriber users
- `api/subscribe-occasion.js` — email subscription endpoint (validates + stores in Redis)
- `frontlogs/` — internal planning files (git-ignored): `EMAILS.md` (10-type email catalog), `PENDING.md` (pending changes), `NEEDS_DISCUSSION.md` (re-engagement email design), `ups_pres/` (email preview HTML files)
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
- `lib/sentry.js` — Sentry init for Edge runtime API routes (`@sentry/vercel-edge`)
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
- **Pro auto-save**: On Create Card click (btnC), Pro users' cards are automatically uploaded in the background and saved to vault with a 6s Undo toast. Share button (btnS) never saves to vault — it reuses btnC's `_shareBlob` and `_shortId` via the `_vaultAutoSaved` shortcut path, or uploads fresh for the share flow without vault save
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

<!-- agsync: last-run 2026-07-18; Renamed "Occasion alerts" → "Get Reminders" in en.json/wisprstories.html(2)/footer-menu.js; added YGLabs + footer logo to copyright in 5 pages (wisprstories, about, features, language-stats, key-status); added .footer-logo CSS with logoFlip animation in layout.css. -->


