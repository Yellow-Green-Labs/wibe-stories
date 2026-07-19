---
title: Changelog
outline: [2, 2]
---

# Changelog

*Last updated: Jul 19, 2026*

> **Project planned:** May 8, 2026 · **First commit:** June 8, 2026 · **Total days active:** 73

## v0.11.25.0 — 2026-07-19

Contact form via Tally.so popup, CSP update, docs cleanup.

### Added
- **Contact popup** — New "Contact" link in the grid menu (top navbar) opens a Tally.so modal with fields: Name, Email, Request Type (7 options), Message, Screenshot. Form submissions go directly to email + Tally dashboard. No backend needed.
- **CSP update** — `https://tally.so` added to `script-src`, `connect-src`, and `frame-src` in vercel.json to support the Tally widget.

### Changed
- **USEFUL_SERVICES.md restructured** — Split into 5 sections: Pending, Discussion Needed, Already Implemented, Discussed & Discarded, Never Using. Removed Free Tier column from Pending table. Removed External Libraries subsection. Consolidated unused npm deps into one row.

## v0.11.24.4 — 2026-07-19

Pricing modal fixes: gift banner colors, slider alignment, input validation.

### Fixed
- **Gift banner colors** — Removed stale amber dark-mode overrides that were overriding the correct teal/pink scheme.
- **Pro pricing slider offset** — Replaced `offsetWidth` math with `getBoundingClientRect()` for pixel-perfect alignment across all plans.
- **Light mode toggle track** — Changed background from `#1a1a1a` to `#e8e8e0` with `#777` button text for proper light mode appearance.
- **Removed `.pricing-price-footnote`** — Deleted CSS block and HTML element per redesign requirements.
- **Removed `.pricing-unlimited` orange color** — Inherits from `.pricing-fval` instead.

### Added
- **Supporter key input filtering** — Strips all characters except `A-Z`, `a-z`, `0-9`, `-`, `_`; max 64 chars.
- **Email input validation** — 14 rules (unicode rejection, dot checks, length limits, disposable domain blocklist). Browser hover tooltip suppressed via `setCustomValidity`.

## v0.11.24.3 — 2026-07-17

Docs Fixes: cleanUrls, Logo, CSS Rewrite.

### Fixed
- **VitePress subpage 404s** — Set `cleanUrls: true` in VitePress config so internal links avoid `.html` extension. Added 301 redirect from `.html` URLs to clean URLs in `vercel.json` for backward compatibility.
- **Feature summary table not rendering** — Fixed malformed table separator (`---|---|---|---|` → `---|---|---|`) in `wibe-stories.md`.
- **Trust center icons invisible** — Added `cdn.simpleicons.org` to CSP `img-src` in `vercel.json`.

### Changed
- **VitePress custom.css** — Rewrote with comprehensive light/dark mode styling, table styles (striped rows, brand border), blockquotes, nav, sidebar, code, and link polish.
- **Logo** — Added light/dark logo images at `.vitepress/public/assets/logo-{light,dark}.png`, configured in VitePress `themeConfig.logo`.

### Added
- `vite.publicDir` in VitePress config so public directory files copy to build output.

## v0.11.24.2 — 2026-07-17

Mintlify Footer Link Fix.

### Fixed
- **Footer Documentation link 404** — Changed `/kb` internal link to direct `https://wibestories.mintlify.site` external link (`target="_blank"`). Updated Vercel rewrites to proxy `/kb` → Mintlify root (not `/kb` subpath), so `/kb/docs/WIBE_STORIES` correctly maps to `wibestories.mintlify.site/docs/WIBE_STORIES`.

## v0.11.24.1 — 2026-07-17

Docs Restructure + Legal Hub.

### Added
- **Mintlify docs restructure** — API.md/DEVELOPER.md moved to `docs-internal/`; TRUST_CENTER.md, ACKNOWLEDGEMENTS.md, LIMITATIONS.md created in `docs/`; `docs.json` at repo root with 5 nav groups + Legal anchor.
- **Legal hub** — Single `legal.html` replaced with `legal/` folder: hub page (`legal-index.html`) + 3 sub-pages (license.html, terms.html, privacy.html) with `legal.css` and `legal.js`. Vercel routes for `/legal`, `/legal/license`, `/legal/terms`, `/legal/privacy`.
- **Legal wiring** — Footer and hamburger menu links updated from `/legal#license` to `/legal/license`, `/legal#terms` to `/legal/terms`.
- `docs/ROADMAP.md` — Placeholder roadmap linked from footer menu.
- Footer Documentation link (`fa-book`) pointing to `/kb`.
- `footer.docs` i18n key in all 11 locale files.
- Vercel rewrites proxying `/kb` to Mintlify.
- CSP `style-src` added `cdn.jsdelivr.net`.
- `docs/PRICING.md` — Full pricing documentation, 4-tier Wibe Pass, stackable credit system.
- Gift card banner (amber) in pricing modal with BMAC link.
- 3-tier pricing rows in Pro card (1mo $6, 3mo $16, 12mo $60).

### Changed
- `CHANGELOG.md` — Condensed from ~850 verbose lines to concise one-liners per version.
- `global/pricing-modal.js` — Replaced single $6 card with 4-tier layout + gift banner.
- `global/styles/overlays.css` — Added gift banner and tier-list CSS.
- `global/styles/responsive.css` — Nav dropdown dark/light mode CSS variables.
- `global/vault.js` — Grid menu vault label support.
- `legal.html` → `legal/` folder with hub + 3 sub-pages.
- `vercel.json` — Legal routes updated, Mintlify proxy added.
- `wisprstories.html` — Hamburger menu legal links updated.
- `AGENTS.md`, `README.md` — Updated doc paths.

### Removed
- Subscription model — Replaced with Wibe Pass stackable credit.
- Old `legal.html` — Replaced by `legal/` folder.
- `docs/internal/` — Content moved to `docs-internal/`.

## v0.11.24.0 — 2026-07-15

Vault Select UX Redesign.

### Changed
- Vault selection controls — Select All moved to header, unified with Select/Cancel toggle. Action bar shows count + actions only.

## v0.11.23.0 — 2026-07-09

Occasion Email Campaign Expansion.

### Added
- 30 occasion email campaigns (was 8) covering fixed, floating weekday, date range, and movable/lunar dates.
- Image-based email headers (55px occasion PNGs replace emoji).
- `api/subscribe-occasion.js` — Edge endpoint for free user email signup.
- Footer subscription popup with email input + Join button.
- `emailSubscribersSet` Redis key (`wispr:email-subscribers`).
- Nowruz movable date support (2026-2030).

### Changed
- `api/lib/occasion-email.js` — Rewritten for 30 occasions with 4 date types (fixed/movable/range/floating).
- `api/cron/send-occasion-emails.js` — Reads from both Pro + subscriber Redis sets, deduplicates.
- `global/footer-menu.js` — Added subscription popup HTML/CSS/handlers.
- Version v0.11.22.0 → v0.11.23.0.

### Removed
- Old OCCASIONS list — Replaced 13 emoji entries with 30 image-based entries.

## v0.11.22.0 — 2026-07-08

Custom Color Picker.

### Added
- Custom color picker (iro.js) for Pro users — color wheel + sliders, rainbow gradient trigger.
- `spiral-overlay.webp` — Grayscale texture for `background-blend-mode: overlay` on custom colors.
- `customColor` state variable with `isCustomColor()`, `getCardColor()`, `applyCustomColor(hex)` helpers.

### Changed
- All render/export paths (`_applyBackground`, `_applyCloneBg`, `_getTextureBgDataUrl`, `generateBlob`, `_makeSocialBlob`, `wave()`, WebM, style chip) use `getCardColor()` instead of `PALS[curP]`.

## v0.11.17.0 — 2026-07-07

OG Compositing + UX Polish.

### Changed
- Branded OG image compositing via sharp (card PNG onto brand/WS-OG-Image template, 1200×630 JPEG, ~43 KB).
- VERSION_HISTORY.md consolidated into CHANGELOG.md (single source of truth). Deleted.
- Footer: "— made for Wispr Flow" suffix removed.
- Update toast: light purple background (`#f0d7ff`) instead of dark.
- Build banner auto-updates from `version.json`.
- Share modal: bottom-sheet on mobile (≤480px), matching upgrade modal layout.
- Speech language trigger: re-enabled when user types/records (was stuck disabled after examples).
- Hinglish voice input: new option in speech language picker (Deepgram `language=multi`).

## v0.11.16.0 — 2026-07-06

Complete Theme System Removal.

### Removed
- Entire theme system: `curTheme`, `applyTheme()`, `_initThemeRow()`, `_detectThemeBrightness()`, `_extractThemeAccent()`, `_getThemeVariantSrc()`, `_uploadHeaders()`, `setCardTextColors()`, `_toggleThemeBody()`, `_setTextContrast()`, theme draft restoration, all theme HTML/CSS.
- `theme` field from `saveDraft()` — sessionStorage no longer stores theme.
- `_uploadHeaders()` function — uploads use inline headers.
- Color section heading: "Color" → "Original Colors".

## v0.11.13.1 — 2026-07-03

Bug Fixes.

### Added
- Download proxy endpoint (`api/download/[id].js`) — serves Blob files with `Content-Disposition: attachment`.
- Landing page: caption with sender name, watermark branding at bottom.

### Changed
- "Create your own" link → clean URL (`/`) instead of hash params.
- Landing page download links → `/download/:id` proxy.

### Removed
- `"sharedCta"` banner from JS and all 11 locales.

### Fixed
- Card Not Found on valid links: zero-width space in URLs stripped via `.replace(/[^\w-]/g, '')`.
- Update toast false positive on hard refresh (added `_versionUpToDate` flag + 3s delay).

## v0.11.13 — 2026-07-01

UX Polish + Occasion Fixes.

### Added
- Landing page: download buttons, expiry countdown badge, voice status label.
- Upload audio button desktop-only (hidden ≤720px).
- Share modal: "Copy image link" primary on desktop, share de-emphasized.
- Share button double-tap fix (debounce + `touch-action: manipulation`).
- 7 new occasion triggers.

### Changed
- Download modal: "Download PNG" → "Download image", "Download WebM" → "Download voice".
- 7-day card retention (36h → 168h).

### Fixed
- Occasion false positives: removed short triggers (`rip`, `luck`, `pride`, etc.) and cross-occasion duplicates.

## v0.11.2 — 2026-06-24

Audio File Upload.

### Added
- WAV/MP3 audio upload via `AudioContext` decode → PCM WAV conversion → STT.
- In-browser validation (≤30s), original file stored for voice attachment.
- Mutual exclusion with mic recording.
- `api/voice.js` max bytes: 2MB → 6MB.

## v0.11.1 — 2026-06-21

Features Page.

### Changed
- Features page: 5 capability sections with WebP images (Speak, Write, Rewrite, Design, Share).
- Tone cards corrected from 6 wrong tones to 7 real ones matching the app.
- Stats updated: "6 Tone styles" → "7".
- Footer menu: removed auto-hide check for "How to Use".

## v0.11.0.14 — 2026-06-13

Features Page + About Page Trim.

### Added
- `features.html`, `global/features.js`, `global/styles/features.css`.
- Footer FAQ (Native, free, Pro, Grace zone) moved from about.html.

### Changed
- `about.html` trimmed to pure story/mission/origin content.

## v0.11.0.13 — 2026-06-13

Patch.

Bug fixes and improvements.

## v0.11.0.12 — 2026-06-13

Mobile Share + Landing Page Fixes.

### Fixed
- WhatsApp share caption: removed ZWS from URL.
- Copy image link: writes both `image/png` + `text/plain` to clipboard.
- Landing page scrollable on small screens.
- Wispr Flow CTA animation on mobile (removed media query guard).

## v0.11.0.11 — 2026-06-09

Patch.

Bug fixes and improvements.

## v0.11.0.10 — 2026-06-09

Share Polish.

### Fixed
- `robots.txt` — allowlist-based for WhatsApp/Telegram OG previews.
- "Copy image link" copies URL + CTA text.
- Landing page logo: `ws-logo-wh.png` → `ws-logo-blwbg.png`.

### Added
- 13 rotating Wispr Flow CTA lines in share captions.
- 12 rotating punch lines on card landing page.

### Changed
- Brand rename: "Wispr Stories" → "Wibe Stories" in 11 files.

## v0.11.0.9 — 2026-06-09

Documentation Restructuring.

### Added
- `DEVELOPER.md` and `API.md` docs.
- `WIBE_STORIES.md` — Product Vision, User Personas, Success Metrics, Requirements.

### Changed
- README.md trimmed.
- `WIBE_STORIES_CANONICAL_BLUEPRINT.md` → `docs/WIBE_STORIES.md`.

## v0.11.0.8 — 2026-06-08

Stats Leak + Voice Mislabeling Fixes.

### Fixed
- `api/track-usage.js` — Redis write guarded by `VERCEL_ENV === 'production'`.
- Voice mislabeling — triple check `(voice && voiceAttached && audioBlob)`.
- BMAC webhook — test event check before HMAC, new event types, idempotency key fallback.
- Pro key email redesigned.

## v0.11.0.7 — 2026-06-05

Grace Zone.

### Changed
- Counter color scheme: traffic-light (gray 0-119, yellow 120-150, red 151-160).
- Counter format: `X (Grace)` with clickable link to `/about#faq-grace`.

## v0.11.0.6 — 2026-06-04

Delete audit.md.

### Removed
- `audit.md` — content integrated into CHANGELOG.md across prior versions.

## v0.11.0.5 — 2026-06-04

Remove SEO Paragraph.

### Removed
- Hidden SEO paragraph below H1 (brand misspellings).

## v0.11.0.4 — 2026-06-04

Chord Handler Path Fix.

### Fixed
- Chord script 404 on non-home pages — relative → absolute path.

## v0.11.0.3 — 2026-06-04

Windows Menu Fix.

### Fixed
- Chord never fired on Windows — added `e.preventDefault()` for W/S keys with Alt+Shift.

## v0.11.0.2 — 2026-06-04

i18n Placeholder Fix.

### Fixed
- Toasts showed literal `{max}` instead of actual seconds — added `.replace("{max}", value)`.

## v0.11.0.1 — 2026-06-04

Textarea Grace Zone.

### Changed
- `maxlength` 150 → 160 (invisible 10-char grace).
- Counter visual: orange `.grace` state at >150.
- Added Limitation 8 to ilogs-ws.md, FAQ item to about.html.

## v0.11.0.0 — 2026-06-04

Acknowledged Logs.

### Added
- `internal-logs/` — source-of-truth markdown + keyboard chord handler (Alt+Shift+W+S).
- Notion page with 5 known issues + 7 product limitations.

### Removed
- Dead `ffNotice` i18n key from all 11 locales.

## v0.10.4.8 — 2026-06-04

SEO + Link Hygiene.

### Added
- JSON-LD `alternateName` (10 brand variants), `hreflang` tags, `.visually-hidden` CSS.

### Changed
- Link hygiene: 39 `wisprflow.ai?ref=wispr-stories` → `wisprflow.ai/r?BEST76`.
- Sitemap rewritten with clean URLs.

## v0.10.4.7 — 2026-06-04

liveBox Removal + Counter Safety Net.

### Removed
- liveBox UI element (~110 lines CSS, 64 JS references).

### Added
- Counter safety net: `_refreshLimitsFromServer()` after every `reportRecordingDuration`.

### Fixed
- Deepgram `recSt` stuck on "Starting...", mic stream leak, timer font size.

## v0.10.4.6 — 2026-06-03

Toast Shortening + Recording Fixes.

### Changed
- 23 toasts kept and shortened, 17 removed.
- Footer menu reorder, 13 `console.log` → `console.debug`.

### Fixed
- Pre-flight mic setup, readyTimer race, `trySpeechFallback()` undefined, `clearInterval` → `clearTimeout`.

## v0.10.4.5 — 2026-06-03

Friction Reduction.

### Changed
- Counter hidden by default (appears at 3+ recordings).
- Toasts moved from bottom to top-center.
- Card creation button flashes green "Beautiful!" for 1.5s.
- Recording counter auto-heals via `_refreshLimitsFromServer()`.

## v0.10.4.2 — 2026-06-02

Recording Flow Bug Fixes.

### Added
- Onboarding Quick Reference (collapsible), STT health-check cache (10-min TTL), `_startRecTimer` helper.

## v0.10.4.1 — 2026-06-02

Tone Counter & WhatsApp Fixes.

### Added
- `api/rewrite-confirm.js` — tone rewrite commit endpoint.
- `scripts/stress-test-99-cap.mjs`, `scripts/verify-cron-cleanup.mjs`.

### Fixed
- Tone counter: preview-then-commit refactor (no increment on tone pick).
- WhatsApp share preview: 1200×1200 1:1 OG image.
- Web Share API: uses 1:1 blob instead of 9:16.

## v0.10.4 — 2026-05-29

About Page Polish.

### Added
- Scroll-reveal animations, mosaic stagger, count-up animation, FAQ auto-scroll.

## v0.10.3 — 2026-05-29

Language Stats Redesign.

### Added
- Major UI overhaul: hero section, insights cards, region chips, chart animation, table sorting, medal badges.

## v0.10.2 — 2026-05-28

Download Flow Improvements.

### Added
- Determinate progress bar, file size + time estimates, toast queue, ESC modal close, focus trapping, haptic feedback.

## v0.10.1 — 2026-05-27

WebM Generation Fixes.

### Fixed
- WebM caching, 30 FPS, frame readiness, dark overlay elimination, syntax error crash.

## v0.10.0 — 2026-05-26

Language Expansion + About Page.

### Added
- 15 new speech languages (44 total), About page, "How to Use" in footer menu.

## v0.9.8 — 2026-05-26

Landing Page Metadata.

### Added
- Sender name display, card metadata sidecar (`meta/<id>.json`).

## v0.9.7 — 2026-05-25

"Native" Language Option.

### Added
- "Native" speech language option, auto-detect card label, mic recording guard.

## v0.9.6 — 2026-05-24

Hero Subtitle i18n + Cleanup.

### Added
- Hero subtitle i18n for 21 locales, speech-lang modal i18n, Republic Day occasion.

## v0.9.5 — 2026-05-24

Hybrid STT Routing.

### Added
- Dual STT: Deepgram Nova-3 + OpenRouter Whisper for CJK/Thai/Malayalam/Punjabi.

## v0.9.4 — 2026-05-23

i18n Synchronous Lookup + Polish.

### Added
- `getI18nSync()` helper, unified notice system, style chip summary, Remotion demo project.

## v0.9.3 — 2026-05-22

Rewrite Language Preservation.

### Fixed
- Rewrite preserves input language/script via `detectScript()` classifier and positive `LANGUAGE RULE`.
- Cache key includes `PROMPT_VERSION` to avoid replaying bad outputs.
- Client timeout raised 15s → 25s.
- Page UI no longer flips to example sentence's language.

## v0.8.0 — 2026-05-20

i18n, Tone Preview, Silence Detection.

### Added
- 23 language i18n system, tone rewrite preview (Accept/Cancel), silence detection via RMS energy.

## v0.7.0 — 2026-05-20

Blob Cleanup, WhatsApp OG Fix.

### Added
- Real blob cleanup via Vercel Cron (daily, 36h TTL).

### Fixed
- WhatsApp link preview: direct CDN JPEG (30-60 KB) instead of padded proxy PNG.
