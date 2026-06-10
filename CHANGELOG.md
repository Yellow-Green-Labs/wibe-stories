# Changelog

## [v0.11.0.10] — Share Polish: robots.txt + Mobile Share Merge + Wispr Flow CTAs (2026-06-09)

Three share-related fixes to improve WhatsApp/Telegram previews, mobile share UX, and organic promotion of Wispr Flow.

### Fixed
- `robots.txt` — allowlist-based: empty block at top for clean defaults, explicit `Allow: /c/` for `facebookexternalhit`, `WhatsApp`, `Facebot`, `Twitterbot` so WhatsApp/Telegram OG previews work; `Disallow: /c/` for `Googlebot`, `Bingbot` keeps ephemeral cards out of search indices
- "Copy image link" — copies URL + CTA text to clipboard (was incorrectly copying image blob, which WhatsApp prioritized over the URL)
- "Copy image" button restored — copies just the image to clipboard (hidden on mobile, visible on desktop)
- Landing page logo — `ws-logo-wh.png` (404) replaced with `ws-logo-blwbg.png` in favicon and branding logo (`api/c/[id].js`); service worker cache updated
- Card tooltip — removed `.card-logo:hover .custom-tip` so "Just vibes 💛" tooltip only appears on nav header, not on card preview

### Added
- 13 rotating Wispr Flow CTA lines appended to every share caption (`shareNative` handler + `shareCopyLink` handler), each ending with `→ wisprflow.ai`; lines describe what Flow does, not what it is
- 12 rotating punch lines on card landing page (`api/c/[id].js`), randomly picked per page load, single-line format with `→Wispr Flow` link

### Changed
- Brand name cleanup — "Wispr Stories" renamed to "Wibe Stories" in 11 code files (comments, API headers, sitemap)
- Build banner `wisprstories.js:1` v0.11.0.9 → v0.11.0.10

---

## [v0.11.0.9] — Documentation Restructuring (2026-06-09)

Documentation restructured for clarity and maintainability. Public docs moved to `documentation/` folder; `docs/` reserved for internal reference only. `WIBE_STORIES_CANONICAL_BLUEPRINT.md` renamed to `documentation/WIBE_STORIES.md`. README.md trimmed (removed "Built with", "Run it locally", "Browser support", "Acknowledgments"). Two new docs created: `documentation/DEVELOPER.md` (developer guide, ~324 lines) and `documentation/API.md` (API reference, ~456 lines). WIBE_STORIES.md restructured: added Product Vision (§1), User Personas (§4), Success Metrics (§19), Requirements (§20); trimmed implementation details (hex values, file paths, API route tables, LLM chains, env var tables, bash commands, HTTP headers); added Alt+F1 reference to Known Limitations; removed Repository map (moved to DEVELOPER.md); added branding note. Code comments fixed in `api/rewrite.js:186` (Qwen→Gemma/Kimi) and `api/card.js:7-8` (Edge/@vercel/og→Node.js/sharp). All 31 blueprint discrepancies verified and fixed.

### Added
- `DEVELOPER.md` — developer guide (getting started, architecture, code structure, development workflow, deployment, testing, troubleshooting)
- `API.md` — API reference (19 endpoints, error codes, webhooks)
- `WIBE_STORIES.md` §1 — Product Vision (one-line description, why it exists, north star metric)
- `WIBE_STORIES.md` §4 — User Personas (Kamala, Priya, Marcus)
- `WIBE_STORIES.md` §17 — Alt+F1 reference for known limitations
- `WIBE_STORIES.md` §19 — Success Metrics (share rate, first-card time, voice-first usage, etc.)
- `WIBE_STORIES.md` §20 — Requirements (must-have, should-have, nice-to-have)
- `WIBE_STORIES.md` — branding note (top of file)
- `WIBE_STORIES.md` §7 — Design principles (warmth, simplicity, accessibility)
- `api/rewrite.js:186` — comment corrected (Qwen→Gemma/Kimi)
- `api/card.js:7-8` — comment corrected (Edge/@vercel/og→Node.js/sharp)

### Changed
- `README.md` — trimmed from 114→82 lines, removed 4 sections, Documentation links updated to 3 docs
- `WIBE_STORIES_CANONICAL_BLUEPRINT.md` → `documentation/WIBE_STORIES.md` (renamed via `git mv`)
- `documentation/WIBE_STORIES.md` — TOC updated (new sections, removed Repository map)
- `documentation/WIBE_STORIES.md` — §5, §7, §8, §9, §10, §11, §12, §13, §14, §15, §16 trimmed (removed file paths, hex values, code refs, bash commands, env var tables, HTTP headers)
- `AGENTS.md` — 3 references updated from `WIBE_STORIES_CANONICAL_BLUEPRINT.md` to `documentation/WIBE_STORIES.md`; DEVELOPER.md + API.md added to "Documents referenced every session"; Key files section updated with documentation/ entries
- `docs/project-structure.md` — `WISPR_STORIES_CANONICAL_BLUEPRINT.md` replaced with `documentation/WIBE_STORIES.md`, `documentation/DEVELOPER.md`, `documentation/API.md`; 7 stale errors fixed (og.js `@vercel/og`→`sharp`, upload.js OG dimensions 1200×630→1200×1200, script count 19→10→19, locale count 21→11, webhook filename `webhook/bmc.js`→`webhook-bmac.js`, CSP claim corrected, CSS module count 13→14)
- `global/footer-menu.js` — VERSION_HISTORY.md fetch path updated (cache buster bumped)

---

## [v0.11.0.8] — Stats Leak + Voice Mislabeling + BMAC Webhook Fixes (2026-06-08)

Two production bug fixes plus BMAC webhook improvements. (1) `api/track-usage.js` — Redis write guarded by `if (process.env.VERCEL_ENV === 'production')` so `vercel dev` and preview branches never pollute production language stats. (2) `wisprstories.js:615` — `trackCardUsage()` source detection changed to triple check `(inputSource === "voice" && voiceAttached && audioBlob)` prevents stale draft-restored `inputSource` from mislabeling text cards as voice. (3) `api/webhook-bmac.js` — test event check reordered before HMAC verification so BMAC test pings return 200; `live_mode === false` test marker added; `payload.data` fallback for new BMAC format; new event types `recurring_donation.started/cancelled/updated` added; idempotency key fallback for new schema. (4) Pro key email redesigned: branded gradient header, green activation box, orange lost-key section, professional footer.

### Fixed
- `api/track-usage.js` — Redis write guarded by `if (process.env.VERCEL_ENV === 'production')`
- `wisprstories.js:615` — source detection changed to triple check `(inputSource === "voice" && voiceAttached && audioBlob) ? "voice" : "story"`
- `api/webhook-bmac.js` — test event check reordered BEFORE HMAC verification; `live_mode === false` test detection
- Pro key email redesigned: branded gradient header, green activation box, orange lost-key recovery section, professional footer

### Added
- `api/webhook-bmac.js` — `payload.data` fallback for new BMAC webhook format
- `api/webhook-bmac.js` — new event types: `recurring_donation.started`, `recurring_donation.cancelled`, `recurring_donation.updated`
- `api/webhook-bmac.js` — idempotency key fallback: `data.id` and `data.started_at` for new BMAC schema

### Changed
- Build banner `wisprstories.js:1` v0.11.0.7 → v0.11.0.8

## [v0.11.0.7] — Grace Zone: Traffic-Light Colors + Clickable FAQ Link (2026-06-05)

Patch release. Counter color scheme changed to traffic-light progression: gray (0-119), yellow `#eab308` (120-150, warn), red `#dc2626` (151-160, grace). Counter format shifts at >150 from `X / 150` to `X (Grace)` where "Grace" is a clickable link to `/about#faq-grace`. Emoji mapping: ⚠️ for warn, 🛟 for grace (both via CSS `::before`). New `.grace-link` CSS class with dotted underline. `about.js` gets hash-based auto-expand for FAQ accordion. Build banner v0.11.0.6 → v0.11.0.7.

### Changed
- Counter color scheme changed to traffic-light progression: gray (0-119), yellow `#eab308` (120-150, warn), red `#dc2626` (151-160, grace)
- Counter format shifts at >150 from `X / 150` to `X (Grace)` where "Grace" is a clickable link to `/about#faq-grace`
- Emoji mapping: ⚠️ for warn, 🛟 for grace (both via CSS `::before`)
- New `.grace-link` CSS class: dotted underline lighter red, solid on hover, white-on-red active for mobile (`@media (hover: none)`)
- `wisprstories.js:998-1000` refactored: user text escaped for safe innerHTML, `warn` class only at 120-150, `grace` only at >150

### Added
- `about.js` hash-based auto-expand: on page load, if `location.hash` matches a `.faq-item` element, auto-click its `.faq-q` to expand the accordion
- `en.json` toasts section gets `"grace": "Grace"` key (reserved, displayed in English always)
- About page FAQ renamed to "What is the Grace zone?" with `id="faq-grace"` on the answer div

### Changed
- Build banner `wisprstories.js:1` v0.11.0.6 → v0.11.0.7

## [v0.11.0.6] — Delete `audit.md` (2026-06-04)

Patch release: removes the now-redundant `audit.md` design-inconsistency audit. Its content has been fully integrated into `CHANGELOG.md` and `VERSION_HISTORY.md` across v0.10.4.7 → v0.11.0.5, and the still-open items are captured in AGENTS.md's "Known bugs" section. Keeping the file added noise without providing new value.

### Removed
- **`audit.md`** (3.8KB, committed June 3 2026 in commit `37366b8`) — the 73-line design-inconsistency audit with 9 items (3 DONE, 5 NEEDS DECISION, 3 RETRACTED). All DONE items are integrated into `CHANGELOG.md` and `VERSION_HISTORY.md`. All RETRACTED items are by definition no longer relevant. The 3 still-open NEEDS DECISION items (resetBtn async race, spacebar duplication, tone badge fetch-failure gap) are tracked in AGENTS.md "Known bugs".

### Notes
- `remotion-demo/` was identified during the audit as a candidate for deletion but is a **marketing demo video project** created by a separate AI agent. **Do NOT delete** — it's a marketing asset, not part of the live app. AGENTS.md updated with explicit preservation note.
- The historical references to `audit.md` in older `CHANGELOG.md` and `VERSION_HISTORY.md` entries are preserved as historical record (they document what the file was, not that it should still exist).

### Changed
- **AGENTS.md** — Removed `audit.md` from "Key files" list. Updated `remotion-demo/` entries (lines 94, 143) to make explicit: "Marketing demo video project (Remotion/React). Created by a separate AI agent. Do NOT delete — it's a marketing asset, not part of the live app."
- **Build banner** (`wisprstories.js:1`) — v0.11.0.5 → v0.11.0.6 (2026-06-04).

## [v0.11.0.5] — Remove `hero.seo` Visually-Hidden Paragraph (2026-06-04)

Patch release: removes the hidden SEO paragraph below the H1. The paragraph listed brand misspellings ("WisprStories", "Wisper Stories", etc.) for SEO and used the `.visually-hidden` class to be invisible to users. It was added in v0.10.4.8 but turned out to add visual clutter without enough SEO benefit. Brand-misspelling SEO is still covered by the JSON-LD `alternateName` array, `featureList`, and `<meta name="keywords">` — those remain in place.

### Removed
- **`<p class="visually-hidden" data-i18n="hero.seo">...</p>`** (`wisprstories.html:236-244`) — 9-line paragraph below the H1 listing brand misspellings and a 3-sentence product description.
- **`hero.seo` i18n key** (`assets/i18n/en.json`) — the source string for the deleted paragraph. 10 other locale files never had this key.
- **`hero.seo` mention in v0.10.4.8 docs** — kept historical references accurate; this entry supersedes the v0.10.4.8 decision.

### Notes
- The `.visually-hidden` CSS class in `global/styles/base.css` is preserved (still useful as a utility, e.g., for future SEO content).
- The JSON-LD `alternateName` array (`wisprstories.html:156-165`) keeps all 10 brand-misspelling variants.
- The JSON-LD `featureList` (`wisprstories.html:176`) keeps the "Also known as WisprStories, Wisper Stories, or Whisper Stories" suffix.
- The `<meta name="keywords">` keeps the brand variants.

### Changed
- **Build banner** (`wisprstories.js:1`) — v0.11.0.4 → v0.11.0.5 (2026-06-04).

## [v0.11.0.4] — Chord Handler: Deployment Path Fix (2026-06-04)

Patch release: fixes the Acknowledged Logs chord script not loading on `/about` and `/language-stats` pages. The script tags used relative paths (`internal-logs/secret-shortcut.js`), which resolved incorrectly on clean URLs (`/about/internal-logs/...`, `/language-stats/internal-logs/...`). Changed all three pages to absolute path `/internal-logs/secret-shortcut.js`.

### Fixed
- **Chord script 404 on non-home pages** (`wisprstories.html:1113`, `about.html:253`, `language-stats.html:236`) — Relative script src failed on rewritten URLs. Absolute path works everywhere.
- **Build banner** (`wisprstories.js:1`) — v0.11.0.3 → v0.11.0.4 (2026-06-04).

## [v0.11.0.3] — Chord Handler: Windows Menu-Activation Fix (2026-06-04)

Patch release: fixes the "Acknowledged Logs" keyboard chord (Alt+Shift+W+S) on Windows. Previously, the W and S keys in the chord triggered the Windows menu bar (Alt+W = Window, Alt+S = Tools) which stole focus from the page, so the chord handler never received the keydown events and the page never opened.

### Fixed
- **Chord never fired on Windows** (`internal-logs/secret-shortcut.js`) — On Windows, `Alt+W` and `Alt+S` activate the menu bar (Window, Tools) before the keydown reaches the page. The chord handler still saw `keydown` for Alt and Shift but never got the W or S keydowns, so `heldLetters` never reached the size needed to fire. Fix: added a scoped `e.preventDefault()` in `onKeyDown` that fires only when `e.altKey && e.shiftKey` AND the key is `w`/`s` (case-insensitive). This suppresses the menu-bar activation for the two keys in the chord and lets the keydown reach the page. The `preventDefault` is intentionally narrow (W and S only, Alt+Shift only) so other browser shortcuts like Alt+Shift+T (Chrome reopen tab) still work.
- **No diagnostics for "chord didn't fire"** (`internal-logs/secret-shortcut.js`) — Two `console.debug` lines added: one on script init (`[secret-shortcut] handler loaded; chord = Alt+Shift+W+S`) and one on chord fire (`[secret-shortcut] chord fired, opening <url>`). If the chord still does not work, open DevTools console and check whether the "handler loaded" line appears (script blocked or missing) and whether the "chord fired" line appears (chord logic works but popup blocked → location.href fallback kicks in).
- **Build banner** (`wisprstories.js:1`) — v0.11.0.2 → v0.11.0.3 (2026-06-04).

### Not changed
- The Acknowledged Logs public content (`internal-logs/ilogs-ws.md` MIRROR block) is unchanged. v0.11.0.3 is a code fix only.
- The `Alt+Shift+W+S` chord shape, the noopener/noreferrer popup, the `location.href` fallback, and the `window.blur` cleanup are all unchanged.

## [v0.11.0.2] — i18n `{max}` Placeholder Fix (2026-06-04)

Patch release: fixes a bug where three toast messages showed the literal string "Max {max}s" / "Max {max}s. Tap Done" to users instead of the actual recording cap (15s for free, 60s for Pro).

### Fixed
- **Toast showed literal `{max}` placeholder** (`wisprstories.js`) — Three toast call sites used `getI18nSync("toasts.maxTime")` and `getI18nSync("toasts.tooLong")` directly, but the i18n strings contain a `{max}` placeholder. `getI18nSync()` returns the raw template; the `||` fallback never fires because the key exists. Result: users saw the placeholder text instead of the actual seconds value. Fixed by extracting the resolved string into a local variable, then calling `.replace("{max}", value)` before passing to `showToast`. Sites fixed:
  - `wisprstories.js:1141` — Deepgram timer expiration (uses `recMaxDuration`)
  - `wisprstories.js:1503` — Web Speech timer expiration (uses `recMaxDuration`)
  - `wisprstories.js:1950` — preflight `too_long` server rejection (uses `data.maxSeconds`)
- **Build banner** (`wisprstories.js:1`) — v0.11.0.1 → v0.11.0.2 (2026-06-04).

## [v0.11.0.1] — Invisible 10-Character Textarea Grace (2026-06-04)

Patch release: gives the textarea a small invisible grace so the system does not aggressively cut a message mid-word. The user-visible cap stays at 150 characters.

### Changed
- **Textarea `maxlength`** (`wisprstories.html:377`) — 150 → 160. The user-visible cap remains 150; the extra 10 chars are an invisible grace so a user typing past 150 can complete their last word.
- **Counter visual state** (`wisprstories.js:909`) — added a third toggle `cc.classList.toggle("grace", raw.length > 150)` alongside the existing `warn` (red + ⚠️ at 120+). The grace state uses a warm orange color (`#d97706`) and lighter weight so the user sees a soft cue without an aggressive warning.
- **Counter format** (`wisprstories.js:908`) — unchanged. Still shows `X / 150`. The numerator reflects the actual char count; the denominator stays at 150. We deliberately do NOT show `160` anywhere in the UI.

### Added
- **`.char-c.grace` CSS rule** (`global/styles/inputs.css`) — orange color (`#d97706`), font-weight 500, no emoji (compared to `.char-c.warn` which is red `#dc2626` with a ⚠️ prefix). Sits next to the existing `.char-c.warn` rule.
- **Limitation 8 in `internal-logs/ilogs-ws.md`** — new entry in the MIRROR TO NOTION block. Explains that the user-visible cap is 150, the actual cap is 160, and the 10-char grace is invisible by design.
- **6th FAQ item in `about.html`** — "Why does the character counter sometimes go past 150?" Plugs the same explanation for curious users. Placed at the end of the FAQ list.

### Not changed (and why)
- **Server-side caps unchanged.** `api/rewrite.js` still caps LLM tone-rewrites at 150 chars; `api/og.js` still caps the card image at 150. The 10 grace chars are stored in the metadata sidecar (`meta/<shortId>.json`) and visible on the card's landing page, but they never reach the card image, the LLM, or the transcription.
- **i18n strings unchanged.** "up to 150 characters" stays accurate because 150 is the user-visible cap. No new translation work.
- **All 10 `.slice(0, 150)` sites in `wisprstories.js` unchanged** (lines 330, 376, 922, 1145, 1322, 1622, 1821, 2547, 2659, 2982, 3797). These are display/output paths; the 10 grace chars flow into metadata only.
- **The ⚠️ warning at 120 chars unchanged.** Still fires as the "approaching limit" hint.

### Tradeoffs
- **Pros:** User can finish their last word (the original concern). Visible cap stays at 150. No aggressive cut. Card design and LLM cost unchanged. No i18n churn.
- **Cons:** The grace is invisible; users may not know about it until they hit 150 and discover they can still type. The FAQ surfaces it for the curious.

### Files touched
`wisprstories.html`, `wisprstories.js`, `global/styles/inputs.css`, `internal-logs/ilogs-ws.md`, `about.html`.

## [v0.11.0.0] — Acknowledged Logs + Internal Source-of-Truth (2026-06-04)

Major release: the "Acknowledged Logs" transparency system. A Notion page lists 5 known issues and 7 product-decision limitations in plain language for the Wispr Flow team. Reachable via direct URL or via a 4-key chord (Alt+Shift+W+S) on every public page.

### Added
- **Internal logs folder** — new `internal-logs/` directory. Git-ignored by default; contains the source-of-truth markdown and the keyboard-chord handler.
- **`internal-logs/ilogs-ws.md`** — source of truth for the public Notion page. 5 known issues + 7 product-decision limitations, in Q&A format. Leads with an Apple-platform disclaimer ("we do not currently own any Apple device in our test environment"). Marked with `<!-- MIRROR TO NOTION -->` / `<!-- INTERNAL ONLY -->` HTML comments so the public block can be copy-pasted cleanly and the internal block stays in the team-only folder.
- **`internal-logs/secret-shortcut.js`** — IIFE keyboard handler. Listens for the 4-key chord Alt+Shift+W+S (Windows: Alt+Shift; Mac: Option+Shift; physical keyboard only; capture phase). Opens the Notion URL in a new tab with `noopener,noreferrer`; falls back to `location.href` if popups are blocked. Clears state on `window.blur` and on the post-fire tick. Ignores key-repeat events. Notion URL is a single editable constant at the top of the file.
- **Script tag in 3 pages** — `<script src="internal-logs/secret-shortcut.js" defer></script>` added to `wisprstories.html`, `about.html`, and `language-stats.html`, after the page's primary scripts. Loads deferred so it never blocks the initial render.

### Removed
- **Dead `ffNotice` i18n key** — Removed from all 11 locale files (`en.json` + 10 others). The only caller, `showNotice("firefox")`, was already a no-op in the codebase. Aligns the locale files with the user-facing Firefox behavior (modern code works; the notice was never shown).

### Changed
- **Build banner** (`wisprstories.js:1`) — v0.10.4.7 → v0.11.0.0 (2026-06-04).
- **`.gitignore`** — added `internal-logs/` (git-ignored) with an un-ignore rule for `internal-logs/secret-shortcut.js` so the chord handler ships with the deployed site while the source-of-truth markdown stays in the team-only folder.
- **Public content policy** — the public Notion page leads with an Apple-disclaimer callout acknowledging that the project is tested on Windows and Android only, and that Apple-platform behavior is based on published browser documentation and user reports rather than first-hand testing.

### Files touched
`wisprstories.js`, `wisprstories.html`, `about.html`, `language-stats.html`, `internal-logs/ilogs-ws.md` (new), `internal-logs/secret-shortcut.js` (new), `assets/i18n/{en,es,hi,it,ja,kn,ko,ta,te,th,zh}.json` (`ffNotice` removed), `.gitignore`.

### Post-publish checklist
1. Create the Notion page from the `MIRROR TO NOTION` block in `internal-logs/ilogs-ws.md`.
2. Replace the `ACKNOWLEDGED_LOGS_URL` placeholder in `internal-logs/secret-shortcut.js` with the real Notion URL.
3. Redeploy.

## [v0.10.4.8] — SEO for Brand Misspellings + Link Hygiene (2026-06-04)

SEO optimization for brand misspellings and link hygiene cleanup.

### Added
- JSON-LD `alternateName` array expanded to 10 brand variants (WisprStories, Wisper Stories, Whisper Stories, etc.) for misspelling SEO
- Hidden `.visually-hidden` SEO paragraph below H1 listing all 6 common search variations explicitly
- Added `inLanguage` (11), `keywords`, `image`, `applicationSubCategory` to JSON-LD
- Added 12 `hreflang` tags + `og:locale:alternate` for 11 languages on home
- `.visually-hidden` CSS utility added to `global/styles/base.css`
- About + language-stats got 2 hreflang tags each

### Changed
- Title tags tightened (88→60 chars on home)
- Meta descriptions trimmed to ≤160 chars
- `<meta name="keywords">` expanded with brand variants on all 3 pages
- JSON-LD `keywords` and `featureList` also include the brand variants
- Sitemap rewritten with clean URLs (`/about`, `/language-stats`) and `lastmod` 2026-06-04
- Vercel `vercel.json` has 301 redirects `/about.html` → `/about` and `/language-stats.html` → `/language-stats`
- Canonical URLs use trailing slashes consistently
- **Link hygiene**: 39 `wisprflow.ai?ref=wispr-stories` URLs replaced with `wisprflow.ai/r?BEST76` across 20 files
- 2 Buy Me a Coffee URLs updated to `/membership` in `wisprstories.html` and `global/footer-menu.js`

### Removed
- JSON-LD fake `aggregateRating` removed (Google penalty risk)

### Changed
- Build banner `wisprstories.js:1` v0.10.4.7 → v0.10.4.8

## [v0.10.4.7] — liveBox Removal + Counter Safety Net + 3 Bug Fixes (2026-06-04)

liveBox UI element completely removed. Counter safety net added. Three verified bug fixes shipped.

### Removed
- **liveBox UI element** — `<div class="live-box" id="liveBox">` deleted from `wisprstories.html`. ~110 lines of `.live-box` CSS deleted from `global/styles/inputs.css` (`.live-box`, `.live-box.show`, `.live-box.processing`, `.live-box.processing::before`, `.live-box-cancel` + hover + focus, `.live-box.retry` + hover + `::before`, `.live-box.paused` + `.paused-hint`, `@keyframes live-box-spin`, `@keyframes live-box-breathe`, `.input-hero .live-box`). 64 JS references to `liveBox` removed across `wisprstories.js`.
- **Cancel button** — The "Cancel" button in the liveBox is gone. The 2s readyTimer handles cleanup if mic setup is slow.
- **Live transcription text** — The intermediate Web Speech results are no longer shown in a pill. The text appears in the textarea only after the recording finishes.
- **`--live-glow` CSS variables** — Removed from `global/styles/base.css` (both light and dark themes). Only used by the deleted liveBox glow animation.
- **Dead `_micStartCancelled` code** — Variable declaration, 5 checks, and the reset line deleted. The only setter was the cancel button click handler.

### Added
- **Counter safety net** (`wisprstories.js:reportRecordingDuration`) — After every `reportRecordingDuration` call, the client now also calls `_refreshLimitsFromServer()` to re-fetch the authoritative count from `/api/limits`. This auto-corrects any client-server drift that caused the "Counter stuck at 5/5" symptom. Monotonic guard in `updateRecCounter(used, max, cumulativeUsed, cumulativeMax, sessionId)` ignores stale `used < _lastKnownRecordingsUsed` values and resets on session-change or day-rollover, so out-of-order safety-net responses from prior recordings can't make the counter go backwards. The 4× `console.debug` instrumentation from v0.10.4.5 remains for future root-cause diagnosis if the symptom recurs.
- **`.rec-st.retry` CSS** — Cursor pointer + dotted underline for the retry click target that now lives on the `recSt` label.
- **`record.ended` i18n key** — Added to all 11 locale files. English fallback for non-English locales (will be re-translated in a later pass).

### Fixed
- **Deepgram `recSt` text stuck on "Starting..."** (`wisprstories.js:startDeepgramRecording`) — The Deepgram success path now updates `recSt` to the "Listening and processing your words" message and adds the `.live` class to `recSub`. Previously only the Web Speech path did this, leaving Deepgram users staring at "Starting..." for the entire recording.
- **Pre-flight mic stream leak** (`wisprstories.js:mic click handler`) — After `refreshMicList()` is called with the pre-flight stream, the stream's tracks are now stopped. Previously the stream leaked and `startRec()` opened a second concurrent stream, causing resource conflicts on mobile.
- **Timer font too small for older users** (`global/styles/inputs.css`) — `.rec-st` (status text) increased from `clamp(14px, 0.3vw + 13px, 15px)` to `clamp(15px, 0.4vw + 14px, 17px)`. `.rec-sub` (the actual timer countdown like "15s", "14s") increased from `clamp(12px, 0.3vw + 11px, 13px)` to `clamp(15px, 0.4vw + 14px, 17px)`. `.rec-counter` increased from `clamp(13px, 0.5vw + 11px, 15px)` to `clamp(14px, 0.5vw + 12px, 17px)`. Mobile media query (480px) increased `.rec-counter` from 15px to 18px with larger padding (12px 16px), and added `.rec-sub: 18px` so the timer countdown stays readable on phones.

### Changed
- **Retry click target moved to `recSt` label** — Instead of clicking the liveBox, users now tap the `recSt` label (e.g. "Couldn't transcribe. Tap to retry") to retry STT. The label gets a dotted underline and pointer cursor.
- **Pause state UI** — Removed the "Tap Done to transcribe" hint from the deleted liveBox. The recSt "Paused" text alone is enough.
- **Resume state UI** — Same simplification. The recSt "Listening" text alone is enough.
- **Cache buster** (`global/styles/main.css`) — Bumped `base.css` and `inputs.css` from `?v=20260521-*` to `?v=20260604-no-livebox` to force browsers to re-fetch the simplified CSS.
- **Build banner** (`wisprstories.js:1`) — v0.10.4.6 → v0.10.4.7 (2026-06-04).

## [v0.10.4.6] — Toast Shortening + Recording Fixes (2026-06-03)

Toast shortening, recording flow bug fixes, and i18n cleanup. Biggest change is the toast pass: 23 toasts kept and shortened, 17 removed.

### Changed
- **Toast shortening** — 23 unique toasts kept and shortened to ≤4-6 words with warm emoji where appropriate. 17 toasts removed: 5 with visual replacements (highlight picker, highlight textarea, button text, rewrite preview, Beautiful! flash), 5 dev-only, 3 already shown as fallback, 4 others.
- **Footer menu reorder** — About + Lang Stats links moved first; divider added between navigation and support sections. All footer links i18n'd with `data-i18n` attributes.
- **13 console.log → console.debug** — Only the build banner uses `console.log`; all other logging uses `console.debug`.
- **2 hardcoded English toasts → i18n** — Replaced inline strings with i18n key lookups.

### Fixed
- **Pre-flight mic setup** — `_getMicStream()` called before the 2s readiness timer and server check, so mic permission is resolved before recording starts.
- **readyTimer race fix** — Old timer cleared after server check passes; new 2s timer restarted before `startRec()`.
- **`trySpeechFallback()` defined** — Was called but never defined, causing ReferenceError on that code path.
- **`clearInterval` → `clearTimeout` bugs** — `finishRec()` and `mediaRec.onerror` both changed from `clearInterval(recDurationTimer)` to `clearTimeout(recDurationTimer)`.
- **Style section i18n** — `i18nApplied` event listener added to call `updateStyleChipSummary()` on language change, so the style chip summary re-localizes.
- **Duplicate JSON keys fixed** — Tone/color/shape/footer sections had duplicate keys in all 11 locale files.

### Files touched
`wisprstories.js`, `assets/i18n/en.json`, `assets/i18n/{es,hi,it,ja,kn,ko,ta,te,th,zh}.json`, `global/footer-menu.js`, `global/styles/layout.css`.

## [Unreleased] — 2026-06-03

### Changed
- **Locale toast/voice sync** — Updated `toasts` and `voice` sections in all 10 non-English locale files (es, hi, it, ja, kn, ko, ta, te, th, zh) to match the English version. Ensures consistent toast messages and voice-related strings across all languages.

## [v0.10.4.5] — Friction Reduction Pass (2026-06-03)

Friction-reduction pass: hides technical jargon (counter), warms the card-creation moment, moves toasts to top-center (eye line with the mic), and adds self-healing for the recording counter. Zero new UI for grandparents — every change fades in only when needed.

### Changed
- **Counter hidden by default** — only appears at 3+ recordings or at the limit. New soft warm copy ("A few more today 💛" / "More tomorrow 💛") in 11 locales.
- **Toasts moved from bottom to top-center** — slides down from top with iOS safe-area clearance. User reported eyes stay on the mic; bottom toasts were out of eye line.
- **Start Over button — Smart Show** — hidden on blank load and after reset; shown when there's content (textarea, name, or audio). Re-evaluates after URL-hash restore.
- **Card creation moment** — button flashes green + "💛 Beautiful!" for 1.5s. Replaces old yellow ✨ on gold (low contrast) and redundant "Card ready" toast.
- **Limit toasts warmed** — freeLimit / proLimit / cumulativeLimit / tooLong rewritten as short warm copy with 💛. No more "Free limit reached (5/day). Upgrade for more."
- **Footer version display** — regex now matches 4-part versions (`v0.10.4.5` not `vv0.10.4.5`). Cache buster `?v=20260603` added to the `VERSION_HISTORY.md` fetch.
- **Recording counter auto-heals** — new `_refreshLimitsFromServer()` does a silent `checkOnly: true` against the server on page load and after cap-returning reports. UI always matches the server's true state.

### Added
- **Permanent build banner in DevTools Console** — `[Build] Wibe Stories v0.10.4.5` in pink. Updates per release. Answers "which version is deployed?" permanently.
- **Pro-unlock counter refresh** — `updateSupporterBadge()` now re-fetches limits so the counter shows Pro tier immediately (50/day vs 5/day).
- **Diagnostic `console.debug("[Limits] ...")` lines (4 places, temporary)** — for diagnosing the "counter stuck at 5/5" bug. Use Chrome DevTools → Console → Verbose level.

### Files touched
`wisprstories.js`, `wisprstories.html`, `global/footer-menu.js`, `global/styles/inputs.css`, `global/styles/overlays.css`, `global/styles/responsive.css`, `global/styles/actions.css`, `assets/i18n/*.json` (11 locales).

## [v0.10.4.2] — Stage 1 Recording Flow Bug Fixes (2026-06-02)

Stage 1 implements the 7 bug fixes + 4 deep sub-fixes (2.1 Promise.all + Cancel button, 2.2 one-tick 00:00, 2.3 retry state). Stages 2–4 (VAD, streaming STT, Wispr Flow learnings) are data-gated and not in this milestone. Design doc was deleted after Stage 1 reached 100% completion.

### Added
- **Onboarding Quick Reference** — collapsible `<details>` block in the onboarding modal footer with 7 tips (voice, text, tone, color, shape, font size, share). Replaces the 5 inline info-tooltip buttons that cluttered the form for first-time users. Markup in `wisprstories.html`; CSS in `global/styles/overlays.css`; i18n keys under `onboarding.ref*` in all 11 locales.
- **`record.processing` i18n key** — "Processing your audio…" string used by the liveBox while the server is transcribing after a stop tap. Merged into the existing top-level `record` object in all 11 locales.
- **`record.cancel` i18n key** — "Cancel" string for the liveBox cancel button shown during the mic-starting state. Added in all 11 locales.
- **`record.couldntRetry` i18n key** — "Couldn't transcribe. Tap to retry" string for the liveBox retry state shown when Deepgram STT returns empty text. Added in all 11 locales.
- **Shorter textarea placeholder** — `textarea.placeholder` updated to "Speak or type your message…" in all 11 locales (was a longer, modal-tier string).
- **Module-level STT health-check cache** in `wisprstories.js` — `_sttHealthCache` + `STT_HEALTH_TTL_MS = 10 * 60 * 1000` (10-minute TTL). Avoids pinging `/api/stt?check=1` on every record tap. On network error, one retry after 2 s before falling back to WSA.
- **`_startRecTimer(maxSec, onExpire)` helper** in `wisprstories.js` — `setTimeout` chain (not `setInterval`) with `performance.now()` drift correction. Renders `00:15` → `00:00` in MM:SS format. Used by both Deepgram and Web Speech API recording paths.
- **STT health check + getUserMedia in parallel (2.1 deep fix)** — `_getMicStream()` helper extracted; `startRec()` now runs `Promise.all([_runSttHealth(), _getMicStream()])` so the user is not blocked on a slow mic permission prompt while the server health check completes. Mic-permission errors (`NotAllowedError`, `NotFoundError`, generic) are surfaced as specific toasts instead of falling silently to the Web Speech API fallback. The stream obtained before cancel is properly stopped via `getTracks().forEach(t => t.stop())`.
- **Cancel button during mic-startup (2.1 deep fix)** — Module-level `_micStartCancelled` flag set by either (a) the new "Cancel" button rendered inside the liveBox during the Starting state, or (b) the 2 s readiness watchdog. The flag is checked in three places: the Promise.all continuation in `startRec()`, the `startDeepgramRecording().then()` continuation, and the 2 s watchdog. When set, the mic stream tracks are stopped and the UI is reset to the idle state. Cancel button uses a calm `<button class="live-box-cancel">` styled in `global/styles/inputs.css`; i18n key `record.cancel` in all 11 locales.
- **STT retry state after transcription failure (2.3 deep fix)** — When Deepgram returns empty text, the liveBox transitions to a clickable retry state (`.live-box.retry`, with ↻ icon and hover background) showing "Couldn't transcribe. Tap to retry". The WAV blob is saved to module-level `_lastSttWav` (with `_lastSttLang` + `_lastSttSessionId`) in `stopDeepgramRecording()`. A new `_retryLastStt()` async function re-sends the same WAV to `/api/stt` (15 s AbortController timeout, same headers as the original request). On retry success, the textarea is populated and `finishRec()` runs. On retry failure, a toast suggests re-recording and the retry state is dismissed. `_sttRetrying` flag prevents double-tap. Cleared on new recording start, on `finishRec()`, and on the limit-check failure path.

### Fixed
- **Record button — double-fire on slow mic permission** (2.1): `recBtn` is now `disabled = true` synchronously inside the click handler, and a 2 s watchdog re-enables the UI if `isRec` never becomes true. `finishRec()` re-enables the button. Prevents the "press once, get two recordings" race when the user taps the mic while a slow mic-permission prompt is open.
- **Recording timer — drift over time** (2.2): Replaced the old `setInterval` timer (which drifted by 1–2 seconds over a 15–30 s session) with a `setTimeout` chain and `performance.now()` drift correction. Display format is now `MM:SS` (`00:15` → `00:00`) instead of raw seconds. Both Deepgram and WSA paths use the same helper.
- **Timer — "00:00" lands for one tick before Processing (2.2 deep fix)**: After the countdown hits 00:00, the helper renders "00:00" and then defers the `onExpire` callback by 1000 ms (one full tick) so the browser repaints "00:00" before transitioning to the Processing state. Previously the transition could happen mid-frame.
- **Stop tap — silent wait during transcription** (2.3): The liveBox now shows a "Processing your audio…" message with a spinner (dashed border, no breathing animation) for the duration of the server-side transcription. Replaces the previous silent gap where the user had no idea if the app was still working.
- **WebM export — silent zero-byte upload** (2.7): Both callers of `generateWebm()` (`_downloadWebmWithAudio` and `shareDownload`) now check `webmBlob.size > 0` after generation. On zero-byte output, the user sees a "Voice didn't capture. Try again" toast instead of an empty `.webm` being downloaded/uploaded. The internal `generateWebm` checks were retained as a second line of defense.
- **Orphaned `record.tip` i18n key in 10 non-English locales**: en.json had `record.tip` removed in the initial Stage 1 work, but the 10 non-English locales were missed. All 10 still carried the original long tooltip string. Removed in lockstep with en.json.

### Changed
- **Info tooltips removed from form** (2.5): The 5 inline `?` icon tooltip buttons (next to Textarea, Tone, Color, Shape, Font Size) have been removed from `wisprstories.html`. All tooltip-related JS (~55 lines, including `adjustTooltipPosition` and the scroll/resize listeners) was removed from `wisprstories.js`. Mobile `.iw`/`.ii`/`.tip` overrides removed from `global/styles/responsive.css`. The orphaned `global/styles/tooltips.css` was deleted and its import removed from `global/styles/main.css`. The information they conveyed now lives in the Quick Reference at the bottom of the onboarding modal.
- **Duplicate `record` i18n key in non-English locales**: PowerShell `ConvertFrom-Json` was silently keeping the last duplicate value. en.json had a single `record` object that was correct; all 10 non-English locales were carrying two `record` keys (the second with the new `processing` field). Fixed by merging `processing` into the existing top-level `record` object in all 10 locales.
- **Onboarding modal visual polish (post-Stage 1 review)**: 3-step list now renders each step with a colored emoji tile (🎙️ Speak, 🎨 Customize, 🚀 Create) for visual anchoring. `.onboarding-step-num` replaced by `.onboarding-step-icon` (38×38 rounded tile, `var(--cream2)` background in light, `rgba(255,255,235,0.06)` in dark, 1px border). Quick Reference labels (e.g. "Switch modes", "Voice languages") now use full `var(--ink)` + `font-weight: 700` for clear color precedence; body text in the Quick Reference uses `var(--ink3)` + `opacity: 0.72` (light) / `rgba(255,255,235,0.55)` (dark) for the dimmer-secondary feel. `.onboarding-quick-ref` margin-bottom bumped from 16px → 28px and `.onboarding-btn` margin-top: 8px so the "Got it, let's go!" CTA is no longer visually attached to the bottom of the Quick Reference. Hint text rewritten in all 11 locales from "Tap the ❓ in the footer" (which referenced the removed top-bar ? icon) to "Open <em>How to Use</em> in the footer menu" (the real, working link at `#fmenu-help`).
- **Voice attach bar now hides when tone is not "original"** (`wisprstories.js:updateVoiceBar` + `applyTone`): The "attach voice" toggle/banner only renders when `curTone === "original"`. Changing to any other tone auto-detaches voice (`voiceAttached = false`) and hides the bar. `applyTone()` now calls `updateVoiceBar()` so the bar appears/disappears in lockstep with tone switches. The `audioBlob` is preserved across tone changes so changing back to "original" restores the bar with the previous recording still in memory.
- **Tone counter UI mirror now syncs from server on page load** (`api/rewrite-status.js` + `wisprstories.js:syncToneCountsFromServer`): New read-only GET endpoint returns the authoritative per-tone counts for a given `sessionId` from Upstash Redis. The client fetches it on every page load and calls `setToneUsed(tone, serverCount)` for each tone, so the localStorage mirror matches the server reality. After clearing localStorage and refreshing, the UI immediately reflects the actual remaining rewrites instead of showing "5 left" for every tone. Server still enforces the 5/tone/day cap; this fix only addresses the UI display. `Cache-Control: private, max-age=30` for multi-tab efficiency. Test script at `scripts/verify-rewrite-status.mjs` + plan at `docs/test-plans/verify-rewrite-status.md`.
- **v0.10.4.4 — Recording flow UX fixes + Pause/Resume**:
  - **Counter decrement bug**: `reportRecordingDuration` used to early-return when `actualDuration === 0`, which silently skipped the `/api/limits` call and left the recordings counter at 0 even after the user finished a recording. Removed the guard so even sub-1-second recordings now increment the counter (cumulative audio is unaffected because the server's `INCRBY` with 0 is a no-op).
  - **Timer format**: `_startRecTimer` now renders plain seconds ("15s", "14s", "13s", "0s") instead of the MM:SS format ("00:15", "00:14", "00:13"). MM:SS is meaningless for a 15-second max. New helper trio `_formatRecTimer` / `_pauseRecTimer` / `_resumeRecTimer` / `_stopRecTimer` keeps the timer state machine isolated from the rest of the recording flow.
  - **LiveBox message**: The liveBox now shows "Listening and processing your words" (new `record.listening` i18n key, 11 locales) during recording instead of the bare "Recording…". Applied to both the Deepgram start-success branch and the WSA `onstart` handler. The WSA interim transcript still takes over once interim results come in.
  - **Pause/Resume (Deepgram path)**: Clicking the mic while recording now pauses — the timer freezes, `MediaRecorder.pause()` is called (audio stays buffered), and the liveBox switches to "Paused — tap the mic to resume" + "Tap Done to transcribe" hint (new `record.paused` and `record.pausedHint` i18n keys). Clicking the mic again resumes via `MediaRecorder.resume()` and re-anchors the timer's `performance.now()` start point so the countdown picks up exactly where it left off. WSA still uses the mic click to stop (SpeechRecognition has no native pause).
  - **Done button**: New `rec-done-btn` (gold, hidden by default) sits next to the mic while recording. Clicking it triggers the full stop-and-transcribe flow. While the Done button is visible, the "Start over" button is hidden to prevent accidental reset mid-recording. Button label is `record.done` i18n key.
  - **Double-call guard**: `_stopAndTranscribe` now returns early if `!isRec`, preventing the counter from incrementing twice when the user clicks Done immediately after the WSA timer expires (timer-expire path sets `isRec = false` and calls `recog.stop()`, then onend fires `finishRec`; the new guard skips the second pass through `_stopAndTranscribe`).

### Removed
- **`global/styles/tooltips.css`**: Orphaned after the 2.5 tooltip removal. Was only imported from `global/styles/main.css`; that import is now also gone. No other file referenced it.

## [Unreleased] — 2026-06-03 Design Inconsistency Audit

### Added
- **`audit.md`** — design inconsistency audit document capturing 9 UI/UX issues across the app
- **`docs/every-design-decision-explained.md`** — architecture Q&A reference explaining key design decisions

### Fixed
- **Locale onboarding: "29 languages" → "44 languages"** — All 11 locale files had the old `refVoice` string claiming 29 STT languages; updated to 44 language count in lockstep (`onboarding.refVoice` key)
- **btnS dead code removed** — In `wisprstories.js`, the `if (!cardReady) { document.getElementById("btnC").click(); return; }` guard at the top of the btnS click handler was removed. `cardReady` is always `true` by the time btnS is enabled, so this was unreachable dead code.

### Changed
- **Creation Celebration animation** — Card creation now shows a "✨ Created!" flash on the Create button (1.2s) plus an enhanced card pop animation: longer transition (0.28s), bigger scale (1.025), amber glow box-shadow (`rgba(245,158,11,0.35)`), with 720ms duration before reset.

## [v0.10.4.1] — Tone Counter & WhatsApp Share Fixes (2026-06-02)

### Added
- **`api/rewrite-confirm.js`** — new tone rewrite commit endpoint. The per-tone Redis counter is incremented here, not in `api/rewrite.js`. Called by the client when the user Accepts a rewrite preview, or auto-called when the user clicks Create without Accepting.
- **`scripts/stress-test-99-cap.mjs`** — Node.js verification script (built-in `fetch`, no deps). Fires 120 unique sessions at `/api/usage` and asserts 5 conditions: zero errors, cap == 99, allowed + blocked == count, allowed ≤ 99, grandfather re-hit allowed.
- **`scripts/verify-cron-cleanup.mjs`** — Node.js verification script. Asserts `/api/cleanup` returns 401 for no/wrong auth and 200 + valid body for correct `CRON_SECRET`. Reads secret from `--secret=` flag or env var.
- **`docs/test-plans/stress-test-99-cap.md`** + **`docs/test-plans/verify-cron-cleanup.md`** — markdown explainers for the test scripts.
- (Removed) **`docs/superpowers/specs/2026-06-01-recording-ui-redesign-design.md`** — 9-section recording flow redesign spec (Stage 1–4). Stage 1 = 7 bug fixes + 4 deep sub-fixes, Stage 2 = VAD + pre-warm + caps, Stage 3 = streaming STT, Stage 4 = Wispr Flow learnings. Deleted after Stage 1 reached 100% completion (all 11 fixes verified in `wisprstories.js`, all 11 locales updated, all 3 docs synced).

### Fixed
- **Tone rewrite counter — preview-then-commit refactor**: Counter no longer ticks on tone pick. `api/rewrite.js` is now preview-only (checks per-tone limit but doesn't increment; response no longer carries `used`/`max`/`remaining`). New `api/rewrite-confirm.js` performs the atomic INCR on Accept or auto-Create. Client uses `_rewriteConfirmed` flag to prevent double-increment. Server is now the source of truth; localStorage mirrors via `setToneUsed(tone, serverReturnedUsed)`.
- **Tone counter — live UI refresh on Create (Bug A)**: `btnC` handler now calls `applyTone(curTone)` after the counter change so the tone pill + per-tone badges re-render immediately, not on page reload.
- **WhatsApp share preview — wrong aspect ratio**: Share-link OG image is now a 1200×1200 native 1:1 JPEG (was 1200×630 padded, which contradicted the card's square aspect). `api/upload.js` produces 1:1 with `fit: 'cover'`; `api/c/[id].js` meta tags updated to `og:image:width=1200 og:image:height=1200`.
- **WhatsApp Web Share API — 9:16 image in 1:1 app**: `shareNative` handler now uses `_shareBlob` (1:1) instead of `_shareSocialBlob` (9:16). The 9:16 social variant is still generated for future Instagram Story integration but no longer used in the default share path.

### Removed
- **`countCard()` function in `wisprstories.js`**: Server is now the source of truth for the per-tone counter; the local `countCard()` increment was duplicating the server-side INCR and over-counting by 1–2 per session. Replaced by `setToneUsed(tone, serverReturnedUsed)`.

## [v0.10.4] — 2026-05-29

### Added
- **About page UI/UX polish** — multiple enhancements across HTML, CSS, and JS
  - Scroll-reveal animations: fixed broken `.reveal` CSS (rules were only in language-stats.css, now duplicated in about.css)
  - Mosaic card stagger entrance: 7 cards fade in sequentially on page load (40ms staggered delay each)
  - Count-up animation: stat numbers (44, 2, 7, 36 hrs) animate from 0 to target when scrolled into view
  - FAQ auto-scroll: opening a FAQ item near the bottom of the viewport auto-scrolls to keep it visible
  - Wispr Flow auto-wave: "Wispr Flow" in the CTA tagline continuously waves with a letter-bounce animation (~2s pause between cycles)
  - CTA tagline: new line "Stop typing. Wispr Flow works in every text field — emails, messages, docs. All with your voice." after the email link

### Changed
- Hero heading: font-weight 400 → 700, letter-spacing -0.02em → -0.01em for more impact
- Feature stat numbers: enlarged from `clamp(16px, 1.4vw, 20px)` to `clamp(22px, 2.2vw, 28px)`
- "STT engines (Speech recognition)" → "Speech engines" for cleaner scannability
- CTA button hover: scale(0.98) → scale(1.03) (grows instead of shrinking)
- FAQ max-height: 500px → 800px to prevent truncation of longer answers

### Fixed
- Reveal animations now actually work (missing CSS rules were only in language-stats.css)
- CardIn animation no longer overrides card rotation transforms (animation now only touches opacity)

### Dark mode
- `.how-step-num` circles now use lavender accent color instead of near-black for better visibility on dark card backgrounds

## [v0.10.3] — 2026-05-29

### Added
- **Language Stats page redesign** — Major UI/UX overhaul to match Wispr Flow design aesthetic
  - Hero section: larger typography (h1 28-36px), generous spacing (40px top padding), subtle gradient background
  - Insights section: "Top languages" label now visible, 3-column card layout with borders, clickable to filter table
  - Region chips: visible filter buttons with language counts, grouped with "Usage by Language" heading
  - Chart: region colors updated to Wispr Flow palette (orange, blue, green, purple, red-orange)
  - Chart animation: bars animate from 0 to final height with easeOutQuart easing
  - Chart hover: cursor changes to pointer on bar hover
  - Table: search input with row count indicator ("12 of 44"), "no results" message, zero rows toggle
  - Table: zebra striping, top-3 row highlighting with medal badges
  - Table: sort indicators visible at 50% opacity, aria-sort attributes
  - Share button: copies stats to clipboard
  - Back to top button: appears on scroll, smooth scroll to top
  - Skeleton loading: shimmer animation on hero numbers during data fetch
  - Count-up animation: numbers animate from 0 to final value on load
  - Disclaimer: collapsed to single line, always visible
  - Badge note: explains medal system at bottom of page
  - Dark mode: all colors use CSS variables, auto-adapts
  - Mobile: insights stack to 1 column, tighter spacing, responsive table controls
  - Print: optimized print styles

### Changed
- **Footer moved inside .main** — Now scrolls with content instead of staying fixed at viewport bottom
- **Chart region colors** — Updated to Wispr Flow palette: South Asia `#ffa946`, Europe `#3898ec`, Southeast Asia `#22a85a`, Middle East `#886dc2`, East Asia `#ff6c4c`
- **Hero typography** — h1 scaled from 22-28px to 28-36px, section headings from 16-20px to 20-24px
- **Subtitle text** — Changed from "Live card-creation usage across 44 supported languages" to "44 languages tracked across voice and story inputs"
- **Chart hint** — Changed from "Click a bar to filter by region" to "Click any bar or use the filters above"
- **Card borders** — Increased from 1px to 1.5px on hero and insight cards
- **Insight card border-radius** — Changed from 8px to 12px for consistency
- **Main padding** — Increased top padding from 32px to 40px, bottom from 48px to 60px
- **Section headings** — Added italic emphasis on "Language" in "Usage by *Language*"

### Fixed
- **Region filter sync** — Chart bar clicks now update region chips and vice versa
- **Insights clickable** — Clicking a top-3 language fills search box and scrolls to table
- **Search no results** — Shows "No languages match your search" when filter returns 0 results
- **Zero rows toggle** — "Show all languages" toggle hides/shows languages with 0 cards
- **Chart hover cursor** — Cursor changes to pointer on bar hover, default elsewhere
- **Table row count** — Shows "12 of 44" in search box indicating filtered count
- **Footer alignment** — Removed grid properties, added full-width span for correct layout
- **Mobile insights** — Changed from stacked 1-column to compact 3-column layout

## [v0.10.2] — 2026-05-28

### Added
- **Determinate progress bar** — ffmpeg.wasm progress callback drives `.export-progress-bar` width (0–100%). Indeterminate CSS animation used for non-encode stages.
- **Download choice shows file size + time estimates** — PNG and WebM buttons show estimated size (KB/MB) and duration (~2s / ~3-6s) in `<small>` text. Updated dynamically from cached blob or audio size.
- **Success flash on download** — `dlBtn` turns green with checkmark for 1.5s after download completes.
- **Toast queue** — Multiple toasts don't overlap; up to 3 queued, shown sequentially with 250ms gap.
- **ESC closes all modals** — Global keydown listener closes share, upgrade, speech, and download-choice modals.
- **Focus trapping + modal stack** — Tab cycling for all modals (first→last focusable element). Prevents overlapping modals — opening one closes any other.
- **Keyboard shortcuts popover** — `?` nav button toggles a popover listing Space=record, Esc=close. Click-outside dismissal.
- **Haptic feedback** — `_vibrate(12)` on mic, create, and share buttons via `navigator.vibrate()`.
- **Collapsible name row** — Hidden by default, appears when textarea has content or name field is focused.
- **Cycling placeholder in textarea** — Ghost hints cycle through all `normal_example` prompts from languages.json when textarea is empty.
- **OR divider → keyboard icon** — Text replaced with `fa-keyboard` icon between horizontal rules.
- **Full-width share preview on mobile** — At <=480px, `.share-modal-preview` spans full modal width (max-height 50vh).
- **Upgrade modal close buttons** — `#upgradeClose` and `#upgradeBackdrop` now wired to `closeUpgradeModal()`.
- **About page separated** — Inline CSS moved to `global/styles/about.css`, inline JS moved to `global/about.js`. HTML reduced from ~1000 lines to ~265 lines.
- **About page hero mosaic** — Replaced single static card with scattered mosaic of 7 cards in different colors (Violet, Teal, Rose, Amber, Emerald, Ocean, Fuchsia) and languages (Hindi, English, Spanish, Japanese, Russian, Portuguese, Thai).

### Changed
- **About page clarity rewrite** — Rewrote 8 jargon strings for general audience clarity while keeping technical model names (Deepgram Nova-3, OpenAI Whisper) intact. Examples: "STT engines" → "STT engines (Speech recognition)", "36h" → "36 hrs", "transliterates" → "changes your script".

### Fixed
- **ffmpeg.wasm URL** — `@ffmpeg/core-st@0.12.6` doesn't exist on npm; changed to `@ffmpeg/core@0.12.6` (single-threaded build was merged into the main package in v0.12.x).
- **Share-button i18n** — `shareModal.generating` key lookup → `record.generating` (was falling back to English in every locale).
- **Progress bar state reset** — `showExportProgress()` now resets bar to 0% + indeterminate on each show, preventing stale width from previous run.

## [v0.10.1] — 2026-05-27

### Fixed
- **WebM generation: caching + 30 FPS + frame readiness** — `generateWebm()` now caches the generated WebM blob with a 24-hour expiry using a memory cache keyed by audio size, text, palette, and tone. Subsequent downloads return instantly. Frame rate increased from 1 FPS to 30 FPS for proper video player compatibility. Frame capture uses `requestAnimationFrame` before starting the recorder to guarantee the first frame is present. Cache automatically invalidates on re-record, text change, palette change, or tone change.
- **Download WebM no longer triggers PNG download** — `_downloadWebmWithAudio()` now generates and downloads only the `.webm` file, eliminating the browser's multi-download warning. Clicking "Download WebM with Voice" no longer also saves a PNG.
- **WebM dark overlay eliminated** — `generateWebm()` now uses a two-layer compositing approach: the card background is drawn via `createExportBackground()` at 2x resolution, then foreground content (text, labels) is composited on top via html2canvas. This fixes the transparency→black issue in video codec YUV conversion.
- **Download choice modal hover contrast** — PNG and WebM buttons now have distinct, visible hover states in both light and dark modes (border color changes, background shifts instead of subtle opacity changes).
- **Syntax error crash** — Two `addEventListener` calls for `dlChoicePng` and `dlChoiceWebm` were missing their closing `});`, causing `Unexpected end of input` at page load. Fixed.

## [v0.10.0] — 2026-05-26

### Added
- **15 new speech languages** — Arabic (`ar`), Bengali (`bn`), Danish (`da`), Persian (`fa`), Finnish (`fi`), Hebrew (`he`), Hungarian (`hu`), Marathi (`mr`), Malay (`ms`), Dutch (`nl`), Polish (`pl`), Tagalog (`tl`), Ukrainian (`uk`), Urdu (`ur`), Vietnamese (`vi`) added to speech modal grid, STT routing (all via Deepgram Nova-3 Multilingual), Web Speech locale mappings, and Latin-script wave animation flag where applicable. Speech modal now covers all 44 languages from the stats page — no gap.
- **About page** — New `about.html` at root with descriptive About section and collapsible FAQ (7 questions covering language count, Native option, AI rewriting, card retention, privacy, Wispr Flow, support).
- **"How to Use" in footer menu** — Help button removed from nav bar and added to the footer support dropdown as "How to Use" with `fa-circle-question` icon, triggers the onboarding flow.
- **"About" link in footer menu** — New link with `fa-book-open` icon pointing to `about.html`.

### Changed
- **Speech modal sorting** — Languages now sorted: English first, Native second, then alphabetically by country flag code, then by label within each country. All Indian languages (`flag: in`) naturally group together.
- **Nav bar** — "Language" label shortened to "Lang". Help button removed from nav.
- **`assets/languages/languages.json`** — Expanded from 29 to 44 entries (added 15 languages).
- **`api/stt.js`** — `dgSupported` extended with 15 new languages (all routed to Deepgram Nova-3).
- **`wisprstories.js`** — `_wsLocales` extended with 15 locale mappings for Web Speech fallback.
- **`assets/languages/languages-loader.js`** — `LATIN_LANGS` extended with 8 Latin-script languages.
- **`global/footer-menu.js`** — Added "How to Use" and "About" menu items.
- **`sw.js`** — Service worker cache updated to use `ws-logo-blwbg.png`.

### Fixed
- **Main page nav logo** — Changed from `ws-logo-bl.png` (black on transparent, invisible in dark mode) to `ws-logo-blwbg.png` (black logo with white background, visible in both modes).

### Technical
- `about.html` — standalone page matching app design (cream/ink theme, same nav + footer). Collapsible FAQ with `fa-chevron-right` toggle. Theme toggle handler and dark-mode persistence included inline.
- All 44 languages now have STT routing — no gap between the language-stats page (44) and the speech language modal (was 29, now 44). The "Native" option makes 45 total entries in the modal.
- **Vercel Dev on Windows: Edge runtime required** — `api/stt.js` must remain on Edge runtime. The Node.js serverless runtime (`@vercel/node`) hangs indefinitely (>30s) on Windows. This affects other API routes too — all must use `runtime: 'edge'` for local development.

### Added
- **Language Stats page** — New `language-stats.html` standalone page with dynamic Chart.js bar chart and data table tracking card creation across 44 languages + Native, split by Voice vs Story input method. Header with stats banner and region-grouped listing. Zero-data state handled gracefully. Navbar with logo + dark/light toggle. Footer with support menu.
- **Global usage tracking** — Card creation now POSTs to `/api/track-usage` with detected language and input method (`inputSource`). Data stored in a separate Upstash Redis instance (new `UPSTASH_REDIS_LANG_STATS_URL` / `_TOKEN` env vars). New `GET /api/lang-stats` endpoint feeds the stats page.
- **8 new speech languages** — Greek (`el`), Catalan (`ca`), Czech (`cs`), Nepali (`ne`), Burmese (`my`), Sinhala (`si`), Javanese (`jw`), Uzbek (`uz`) added to speech modal grid, STT routing, Web Speech locale mappings, and Latin-script wave animation flag.
- **Documentation** — `docs/existing-redis.md` (existing Upstash Redis architecture) and `docs/language-stats-page.md` (stats page architecture + tracking data flow) created.

### Changed
- **`api/stt.js`** — Extended `whisperLanguages` with `ne, my, si, jw, uz`; extended `dgSupported` with `el, ca, cs`.
- **`assets/languages/languages.json`** — Added 8 new language entries (29 total).
- **`global/footer-menu.js`** — Added "Lang Stats" link in the support dropdown panel.
- **`assets/languages/languages-loader.js`** — Updated `LATIN_LANGS` with `el, ca, cs`.

### Technical
- New `lib/lang-stats-redis.js` — separate Redis client reading `UPSTASH_REDIS_LANG_STATS_URL` / `UPSTASH_REDIS_LANG_STATS_TOKEN`.
- `api/track-usage.js` — POST endpoint, increments `HINCRBY wispr:langstats "{source}:{lang}"`.
- `api/lang-stats.js` — GET endpoint, returns parsed `{ voice: {}, story: {} }` objects; gracefully returns empty data when Redis is not configured.
- `wisprstories.js` — `trackCardUsage()` fires on card creation (btnC click), sending `{ lang, source }` to `/api/track-usage`. Fails silently.
- `language-stats-mockup.html` deleted (replaced by `language-stats.html`).
- **Language Stats page refactored** — Inline `<style>` extracted to `global/styles/language-stats.css`; inline `<script>` extracted to `global/language-stats.js`. Page now a thin HTML shell. CSP-safe (no CDN JS at runtime). Favicon added.
- **Region-colored chart bars** — Chart bars color-coded by 5 regions (South Asia=amber, Europe=blue, SEA=green, MidEast+Central Asia=purple, East Asia=red). Uzbek (`uz`) merged into Middle East & Central Asia.
- **Cross-filter by region** — Click chart bar → table filters to that region; click same bar clears filter. Non-matching bars dimmed. Region badge with ✕ button shown above chart when filter active. Native row hidden during filter.
- **Three-state table sorting** — Language column: A→Z / Z→A / default. Numeric columns (Voice/Story/Total): desc / asc / default. Sort indicator arrows (▲/▼) on sorted column header.
- **6 missing flag SVGs downloaded** — `np.svg`, `mm.svg`, `lk.svg`, `gr.svg`, `cz.svg`, `uz.svg` to `assets/flag-icons/flags/4x3/`.
- **Theme toggle handler added** — `wisprstories.html` had a theme toggle button with no click handler. Added toggle logic: switches `.dark` class, persists `localStorage.theme`, swaps moon/sun icon. Initial icon state set via DOMContentLoaded listener. Stats page theme toggle shares the same `localStorage.theme` key.

## [v0.9.8] — 2026-05-26

### Added
- **Landing page sender name** — Shared card landing page (`/c/:id`) now displays the sender's name in the image alt text ("You have received a Wispr Story from {name}"), as a caption below the card ("{name} shared a Wispr Story with you."), and in OG meta tags. CTA link pre-populates the editor with the card's text, name, tone, palette, and corners via hash params.
- **Card metadata sidecar** — `api/upload.js` now stores `meta/<id>.json` alongside card images in Vercel Blob, containing `{ text, name, tone, p, r }`. Client sends metadata as custom HTTP headers during share upload.
- **Share URL metadata** — Both "Copy link" and native share now send the card's text, author name, tone, palette, and corners as headers to the upload API.

### Changed
- **emailSend i18n** — Unified to `"Send"` in all 21 locale files (was `"Send recovery email"` in 20 non-English locales).
- **api/c/[id].js** — Handler changed from sync to `async` for metadata fetch. Landing page now personalizes OG title, description, image alt, and CTA link based on card metadata.
- **api/upload.js** — Added `safeTone()`, `safePalette()`, `safeCorners()` validation helpers. Now accepts `X-Card-*` headers for metadata sidecar storage.

### Fixed
- **Example sentence nudge** — Removed `updateSlNudge()` from example click handler (`wisprstories.js`). The nudge animation was redundant when examples populated the card; it now only fires on user input (typing, recording, draft restore).

## [v0.9.7] — 2026-05-25

### Added
- **"Native" speech language option** — White neutral flag (`fi-xx`) at the bottom of the speech language grid. For languages not in our supported list (Persian, Malaysian, Sri Lankan, Argentine Spanish, etc.). Card shows "Native" label instead of a wrong language name.
- **Auto-detect card label** — Card language label now uses auto-detected language from text content first, then falls back to speechLang, then curLang. Auto-detect handles 15+ non-Latin scripts (Hindi, Thai, Korean, Japanese, Chinese, Tamil, Telugu, etc.).
- **Auto-set Native** — When text is typed in a detectable script (Arabic, Bengali, etc.) and no speech language is selected, speechLang is automatically set to "Native".
- **Mic recording guard** — Mic button is blocked when no speech language is selected (toast: "Select a language first") or when "Native" is selected (toast: "This language isn't supported for speech yet. Type your words below."). Prevents wasted API calls.
- **Record tooltip** — Updated to mention selecting a speaking language first.

### Changed
- **`autoDetectLangFromText()`** — Now returns the detected language code (or null) instead of being void. Callers can use the return value directly.
- **`updateSlTrigger()`** — Added `__native__` sentinel branch showing the white neutral flag.
- **`populateSlGrid()`** — Appends "Native" item after the 21 supported languages.
- **Deepgram API call** — Filters out `__native__` sentinel (passes empty string, letting Deepgram auto-detect).
- **Web Speech restart** — Uses fallback chain (`_wsLocales[speechLang] || _wsLocales[curLang]`) instead of raw speechLang.

### Technical
- `__native__` sentinel value stored in `localStorage('wsSpeechLang')` for the "Native" meta-option.
- `SCRIPT_TO_LANG` entries for `beng` and `arab` remain `null` (these scripts auto-set speechLang to `__native__` instead of mapping to a non-existent language).

## [v0.9.6] — 2026-05-24

### Added
- **Hero subtitle i18n** — Updated all 21 locale files + HTML fallback to new copy: "Record with the mic or dictate with Wispr Flow. Style and share with love." Native-script translations for all 20 non-English locales.
- **Republic Day** — Added to `date-occasions.json` (India only, Jan 26, country-flag display matching Independence Day pattern).
- **Speech-lang modal i18n** — Added `data-i18n` attributes to modal title and subtitle, plus `speechLang.title`/`speechLang.sub` keys in `en.json`.
- **2026 & 2027 dates** — Added date tables to `C_occasions-list.md` for all date-specific occasions.
- **Missing env vars** — Documented `OPENROUTER_API_KEY`, `CRON_SECRET`, `BLOB_READ_WRITE_TOKEN` in `docs/admin-setup.md`.
- **Language filter** — Added `languages` field support to `occasions.js` for per-occasion language restrictions (India-only/country-specific festivals).

### Changed
- **Hero subtitle** — New text across all 21 locales: "Record with the mic or dictate with Wispr Flow. Style and share with love."
- **All occasion images removed** — 12 WebP files converted to PNG; 53 image files renamed to lowercase-with-hyphens convention; `occasions.json` paths updated to `.png`.
- **`country-mapping.json` normalization** — `getUserCountry()` now maps short language codes (e.g., "hi") to full locale keys (e.g., "hi-IN") for correct Independence Day country detection.

### Fixed
- **3 stale `[Deepgram]` console labels** → `[STT]` at `wisprstories.js:815,818,823` (engine-agnostic diagnostics).
- **Web Speech restart `curLang`** → `speechLang` so restart honors speech language (not page display language).
- **`serve.cjs` Deepgram key check** — No longer blocks the Whisper path when `OPENROUTER_API_KEY` is set but `DEEPGRAM_API_KEY` is a placeholder.
- **`api/stt.js` health check** — Now validates placeholder keys (`YOUR_ACTUAL_KEY`) so dev environment correctly reports `available: false`.
- **Reset button resource leak** — Web Speech/Deepgram stop + timer + stream cleanup on reset; `reportRecordingDuration()` added to all stop paths (spacebar, reset button).
- **Duplicate font stack in `base.css`** — Removed; `fonts.css` is the single source. Hebrew dead fonts removed from font stacks.
- **`PENDING.md` typo** — `sankranthi` → `sankranti`.

### Known issues
- **`shareModal.generating` vs `record.generating` key mismatch** — Still unfixed. Tracks with existing entry.

## [v0.9.5] — 2026-05-24

### Added
- **Hybrid STT routing: Deepgram + OpenRouter Whisper** — Western + Indian languages (14) use Deepgram Nova-3 (free $200 credits). CJK/Thai + Malayalam/Punjabi (6 languages: `th, ja, ko, zh, ml, pa`) use OpenRouter `openai/whisper-large-v3-turbo` via `/api/v1/audio/transcriptions`. Health check returns `available: true` if either API key is configured. Format sanitizer strips MIME parameters (`audio/webm;codecs=opus` → `webm`) for OpenRouter compatibility.
- **Malayalam/Punjabi now server-transcribed** — Removed the Web Speech API bypass in `startRec()`. ml/pa audio is sent to the server and routed to OpenRouter Whisper like other languages. The ml/pa disclaimer toast is removed since there's nothing special about them anymore.
- **Initial recording timer display** — `recSub` now shows "15s remaining" (or "30s" for Pro) immediately when recording starts, instead of waiting 1 second for the first timer tick.

### Changed
- **Speech-language trigger border-radius** — Changed `20px` (full pill) → `6px` to match the nav language button styling for visual consistency.
- **Client STT error label** — Changed `[Deepgram] API error` → `[STT] API error` to avoid misleading logs when OpenRouter Whisper produces the error.

### Fixed
- **Recording timer started at 14s instead of 15s** — `setInterval(fn, 1000)` fires first after ~1s, so `elapsed = 1` on the first tick. Displayed "14s remaining" instead of "15s". Fixed by showing `recMaxDuration + "s remaining"` before the interval starts. Both Deepgram and Web Speech paths fixed.
- **OpenRouter Whisper 400 error** — `format` was sent as the full MIME type (`audio/webm;codecs=opus`) instead of the simple extension (`webm`). Added `(format || '').split(';')[0].split('/')[1] || 'webm'` sanitization in both `serve.cjs` and `api/stt.js`.

### Known issues
- **`shareModal.generating` vs `record.generating` key mismatch** — `wisprstories.js:1845` looks up `shareModal.generating` but every locale defines `record.generating`. Falls back to English "Generating…" in all locales. Two-line fix deferred.

---

## [v0.9.4] — 2026-05-23

### Added
- **i18n loader: synchronous lookup helper** — Added `window.getI18nSync(key)` in `assets/i18n/i18n.js`. Returns the current-language string for a dot-path key, falls back to English when a key is missing from the active locale, returns `undefined` when neither cache has loaded yet. Used by call sites that need to insert a localized value into freshly-created elements outside the `data-i18n` flow (Style chip summary, record-button status text, rewrite/generate spinner labels, `actions.createTone` interpolation, `record.status` / `record.sub` reset).
- **Unified notice system** — New `showNotice(type)` / `dismissNotice()` in `wisprstories.js`. One DOM slot (`#notice` / `#noticeText` / `#noticeDismiss`), one message at a time, priority order: `firefox` (functional/blocking) beats `shared` (informational CTA). Dismissal persists per-type in `localStorage` under `noticeDismissed:<type>` so users don't see the same banner twice across sessions. Re-localizes on `languagesReady` event. Replaces the prior unconditional `.ffNotice` element and the inline shared-link banner.
- **Style chip summary** — New `updateStyleChipSummary()` in `wisprstories.js` populates `#czChipTone` / `#czChipSwatch` / `#czChipColorName` / `#czChipShape` so the collapsed Style accordion header reflects the user's current tone / color / shape selections. Wired into `applyTone()`, `applyPal()`, the roundness click handler, and the language-change handler so it re-localizes when the page language changes.
- **Theme toggle screen-reader state** — `setTheme()` now sets `aria-pressed="true"` on `#themeToggle` when dark mode is on, `"false"` when light.
- **`assets/i18n/NATIVE-REVIEW.md`** — Per-locale review doc for Thai / Korean / Japanese with confidence levels and per-string questions for native speakers.
- **Remotion demo project** — Isolated `remotion-demo/` React/Remotion project with `WisprStoriesPromo` (24s, 1080×1080) and two audio-led variants: social (19.5s, `electronic-bass.mp3`) and warm (26s, `warm-vinyl.mp3`).

### Changed
- **i18n: page is no longer hidden during translation load** — Removed the 3-second `_showTimeout` reveal. English defaults render on first paint; translations swap in when ready. Eliminates white-flash + delayed-reveal.
- **Name input: accepts spaces, hyphens, underscores; cap raised 10 → 18** — Regex changed from `/[^\p{L}]/gu` to `/[^\p{L} _-]/gu`. Names like "Lola Maria", "Mary-Anne" are now valid.
- **Record-button status text is now translatable** — `finishRec()` and reset handler read `record.status` / `record.sub` from i18n via `getI18nSync()` instead of hardcoded English.
- **Style/inputs/card CSS refresh** — ~700 lines added across 11 style modules supporting notice slot, Style chip header, expanded name input.
- **Remotion promo:** Compact card-forward visual direction, real logo, logo-first intro, blurred glow backgrounds, clean final CTA screen, social audio timing trim.
- **Doc audit and factual corrections** — All stale docs updated: `42`→`21` language count, tone icon mapping fixed, rewrite limit `10`→`5`, serverless functions status `Planned`→`Built`, "no backend" claims corrected, AssemblyAI references replaced with Deepgram, palette count `6`→`10`, section numbering deduplicated, `WISPR_STORIES_CANONICAL_BLUEPRINT.md` updated with current file structure and missing features (occasions, PWA, script fonts). Deleted 3 duplicate HTML doc files.

### Fixed
- **Rewrite API: all non-English languages returned English** — Switched primary model to `qwen/qwen3-14b:free` (multilingual); added `isLanguageMismatch()` output validator; enabled `inclusionai/ling-2.6-flash` as paid fallback on rate-limit OR language mismatch; bumped `PROMPT_VERSION` to `v3` to bypass cached wrong-language responses.
- **i18n: removed English leaks in 20 non-English locales** — `tone.tip`, `tone.rewriting`, `actions.createTone`, `record.generating` all translated. `tone.tip` synced with new English wording.
- **`actions.createTone` placeholder grammar** — Grammatically-safe phrasing per locale (DE: `{tone}e Karte erstellen`, RU: `Создать карточку в тоне «{tone}»`, etc.)
- **Remotion demo: WebP alpha-channel card backgrounds caused frame flicker** — Converted from WebP (`yuva420p`) to PNG (`rgba`); PSNR improved from 12.99 to 47.08.
- **FinalFrame transition: instant cut replaces 18-frame fade** — Eliminated cream-wash effect during CTA reveal.
- **Rewrite cache no longer replays bad outputs** — Added `PROMPT_VERSION` constant to Redis cache key; old entries expire on their own 24h TTL.
- **Rewrite no longer aborts on slow free-model responses** — Client timeout raised from 15s → 25s (server timeout is 20s).
- **Page UI no longer flips to example sentence's language** — Removed two leaks: `autoDetectLangFromText()` no longer writes `localStorage.wsLang`; `loadDraft()` no longer calls `setLanguageByCode()`.

### Decisions
- **No Arabic (`ar.json`) or Urdu (`ur.json`) UI locale files** — RTL infrastructure remains in place; 20 UI locales confirmed.
- **Total UI locales: 20** (`de, es, fr, gu, hi, id, it, ja, kn, ko, ml, pa, pt, ru, sv, ta, te, th, tr, zh`).

### Known issues
- **`shareModal.generating` vs `record.generating` key mismatch** — `wisprstories.js:1845` looks up `shareModal.generating` but every locale defines `record.generating`. Falls back to English "Generating…" in all locales. Two-line fix deferred.

---

## [v0.9.3] — 2026-05-22

### Fixed
- **Rewrite preserves the input's language and script** — `api/rewrite.js` previously emitted a one-sided guard that only fired for Latin input ("don't convert Hinglish to Devanagari") and gave the LLM no positive instruction when input was already in a native script. Telugu/Tamil/Kannada/etc. inputs frequently came back Romanized, and plain English inputs occasionally came back as Hinglish because the guard mentioned Hindi tokens even when no Indic content was present. Replaced `hasNonLatinScript()` with a `detectScript()` classifier that returns a named script (`Tamil`, `Telugu`, `Devanagari (Hindi/Marathi)`, `Japanese`, `Korean`, `Chinese`, `Bengali`, `Gurmukhi (Punjabi)`, `Gujarati`, `Oriya`, `Malayalam`, `Thai`, `Arabic`, `Cyrillic`, `Greek`, or `Latin`). Japanese is checked before Chinese so pure-Kanji Japanese isn't misclassified. The prompt now carries a positive, declarative `LANGUAGE RULE` ("Respond in the exact same language and script as the input. Do not translate.") plus a script-specific clause ("Respond in `${script}` script. Do NOT transliterate to Latin/Romanized form."), and the system message states "ALWAYS respond in the exact same language and script as the input. You never translate or transliterate."
- **Rewrite cache no longer replays bad outputs after a prompt fix** — Redis cache key in `api/rewrite.js` was keyed on `tone + text` with a 24-hour TTL, so any wrong-language output produced under the old prompt was served back for up to 24 hours after the fix shipped. Added a `PROMPT_VERSION = 'v2'` constant baked into the cache key (`wispr:rewrites:cache:v2:${tone}:${hash}`); old `v1:` entries are orphaned and expire on their own TTL with no manual Redis flush required. Bump `PROMPT_VERSION` on any future prompt change.
- **Rewrite no longer aborts on slow free-model responses** — `wisprstories.js:1199` client abort fired at 15s while `api/rewrite.js:156` server OpenRouter timeout was 20s, so slow rewrites surfaced `AbortError: signal is aborted without reason` in the console for requests the server would have answered. Client timeout raised to 25,000ms so the server's own success or error response always reaches the client before the abort.
- **Page UI no longer flips to the example sentence's language** — Two leaks were collapsing `curLang` (card-display language) into `wsLang` (page-UI language). First leak: `autoDetectLangFromText()` at `wisprstories.js:61` was calling `localStorage.setItem("wsLang", detectedCode)` every time text in a different script appeared, so picking a Telugu example sentence persisted `wsLang=te`, which then drove the language dropdown's initial read on the next page load. Removed that `setItem`. Second leak: `loadDraft()` at `wisprstories.js:190` was calling `window.setLanguageByCode(draft.lang)`, which runs `applyI18n()` and re-paints every `[data-i18n]` element on the page — so any reload after a non-default example pick flipped the entire UI to that example's language. Removed that `setLanguageByCode` call. `curLang` is still restored from the draft so the card's display language survives a reload, but the page UI now stays on whatever the language dropdown shows. The `tryAutoDetectLang` draft early-return at `wisprstories.js:1454` was intentionally left in place — removing it would resurrect a pre-existing dormant bug where `navigator.language` overrides the user's manual dropdown choice.

### Changed
- **Bumped script cache-buster** — `wisprstories.html` `?v=20260521-v0.9.2` → `?v=20260522-v0.9.3` so users pick up the new client timeout and language-decoupling logic without a hard refresh.

### Notes
- First rewrite per tone+text after deploy will be a fresh OpenRouter call (intended — `v1:` cache entries are orphaned). Expect a small one-day bump in OpenRouter usage; entries auto-expire within 24h.
- Paid fallback model (`inclusionai/ling-2.6-flash`) is still commented out at `api/rewrite.js:175`, matching the existing "uncomment before Vercel deploy" convention. The positive-prompt rewrite should largely eliminate small-model drift without it.

---

## [v0.8.0] — 2026-05-20

### Completed
- **Phase 5: Silence Detection** — Web Audio API RMS energy check on Deepgram fallback recordings. RMS < 0.01 over 2s = silence, prevents silent audio from hitting API (~20% savings). Toast: "We didn't catch that — try speaking louder". Proper analyser cleanup on recording stop.
- **Phase 6: Tone Rewriting Preview** — Accept/Cancel preview bar after tone rewrite. Rewritten text shown on card preview only, original preserved in textarea. Accept applies rewrite, Cancel restores original and resets to Original tone. Responsive CSS (stacks on mobile).
- **Phase 7: i18n (23 Languages)** — Created `assets/i18n/` with 23 translation JSON files (en, zh, hi, es, ar, fr, pt, ru, ur, id, de, ja, pa, ko, te, ta, tr, it, th, gu, kn, ml, sv). Built `i18n.js` loader with `data-i18n`, `data-i18n-placeholder`, `data-i18n-title` support. Added `data-i18n` attributes to all translatable HTML elements. RTL support for Arabic/Urdu (auto-sets `dir="rtl"` on `<html>`). Wired language selector to call `applyI18n()` on language change. Card content excluded from translation (stays English).

### Documentation
- Updated `PENDING.md` — Marked Phase 0, Phase 5, Phase 6, Phase 7 as complete.
- Updated `AGENTS.md` — Updated "Deferred features," "Known bugs," "Key files" sections.
- Updated `WISPR_STORIES_CANONICAL_BLUEPRINT.md` — Rewrote Section 8 (Technical Architecture) with full serverless route table, usage limits, cost safeguards; rewrote Section 15 (Open Questions) to reflect current state.
- Updated `docs/INTERVIEW_GUIDE.md` — Added "Cost Awareness & Sustainable Scaling" section with 8 Q&A entries covering limits, Deepgram choice, abuse prevention, Pro tier, and scaling.

---

## [v0.8.0] — In Progress (pre-implementation)

### Planned
- **STT provider migration** — Switch from OpenRouter Whisper-1 to Deepgram Nova-3 Multilingual (Batch). Deepgram outperforms Whisper on accuracy (5.26% vs 6.2% WER), has no hallucination problem, 90% faster latency (200-400ms vs 2-4s), and $200 free credit (~555 hrs) vs no free tier. Cost: $0.26/hr vs $0.36/hr.
- **Daily user cap (99 users)** — Upstash Redis counter keyed by date (`wispr:daily:YYYY-MM-DD`). Graceful capacity page with playful tone ("We're overwhelmed with love!"). Existing sessions grandfathered. Pro users bypass cap.
- **Recording limits** — Free: 5 rec/day, 15s max, 75s cumulative. Pro: 50 rec/day, 30s max, 15 min cumulative. Server-side enforcement.
- **Silence detection** — Web Audio API RMS energy check before sending to Deepgram. Threshold: RMS < 0.01 over 2s = silence. Saves ~20% wasted API calls.
- **Tone rewriting** — `api/rewrite.js` with DeepSeek V4 Flash Free (OpenRouter). 150-char limit with sentence-boundary truncation. 10/day free, unlimited Pro.
- **i18n (23 languages)** — JSON translation files, `data-i18n` attribute system, RTL support for Arabic/Urdu, language selector in nav. Card content stays English.
- **Onboarding banner** — First-launch detection, localStorage persistence, help icon trigger, dismiss animation.
- **Upgrade system** — Upstash Redis key store, BuyMeACoffee webhook auto-generation, key format `WS-{OCCASION}-{YEAR}-{XXXX}`, server-side validation replaces localStorage stub.
- **UI fix** — "Wispr Flow" in heading → bold/italic + clickable link to `https://wisprflow.ai?ref=wispr-stories`.

### Documentation
- Created `docs/cost-architecture.md` — Complete cost math, Deepgram pricing, scaling scenarios, 7 cost safeguards, interview talking points.
- Created `docs/upgrade-system-design.md` — Upstash Redis architecture, key generation, BuyMeACoffee webhook, Pro tier limits, security considerations.
- Created `docs/stt-provider-migration.md` — Migration plan, API comparison, fallback chain, benchmark data, rollback plan.
- Updated `docs/interview-quick-reference.md` — Added cost & sustainability Q&A section (6 new questions), updated Pro system table, updated serverless function list.
- Created `PENDING.md` — Master implementation checklist (to be deleted when complete).

---

## [v0.7.0]

### Added
- **Real blob cleanup, wired up via Vercel Cron.** New `api/cleanup.js` endpoint runs daily at 03:00 UTC (scheduled by the `crons` block in `vercel.json`); it lists every blob in `cards/` and `og/`, deletes anything older than 36 hours, and returns a JSON summary. Effective lifetime for shared cards: ~1–2 days. The endpoint rejects any request whose `Authorization` header is not `Bearer ${CRON_SECRET}` (env var set in Vercel dashboard), so only the scheduled cron can invoke it. Closes a real bug: prior CHANGELOG / VERSION_HISTORY claimed "5-day Blob TTL" but no such mechanism existed — `cacheControlMaxAge` only set the CDN `Cache-Control` header, never deleted the underlying blob, so every card ever shared was accumulating in storage indefinitely.

### Fixed
- **WhatsApp link preview now renders as a large hero image on both desktop and mobile.** Root cause: the OG image was a ~198 KB padded 1200×630 PNG served through a Node serverless proxy (`/api/og-image/:id`). Mobile WhatsApp silently dropped the preview because the file size sits in the "too large" band for the on-device crawler; desktop WhatsApp downgraded it to the compact thumbnail layout for the same reason and because of the proxy's ~1.3 s cold-start TTFB. Plus the square card sat inside ~325 px of background padding bars inside the 1.91:1 frame, so the visible card was only ~46 % of the preview width even when shown large.
  - `api/upload.js` no longer builds a padded 1200×630 PNG. It re-encodes the original square card as JPEG (`sharp.jpeg({ quality: 82, mozjpeg: true })`) and uploads it as `og/<shortId>.jpg`. Typical output ~30–60 KB — well under every known WhatsApp mobile threshold, and the card fills 100 % of the preview frame.
  - `api/c/[id].js` now points `og:image` at the direct Vercel Blob CDN URL (`https://<blob>/og/<id>.jpg`) instead of the serverless proxy. Removes ~1 s of cold-start latency per crawler region. Added `og:image:secure_url` and `og:image:alt`; removed stale `og:image:width`/`height` (card aspect ratio varies — crawlers read actual dimensions from JPEG headers); set `og:image:type` to `image/jpeg`.
  - Deleted `api/og-image/[id].js` proxy endpoint and its `vercel.json` rewrite (no longer used). The "cross-domain issue" it was meant to work around does not actually affect WhatsApp / facebookexternalhit, which fetch `*.public.blob.vercel-storage.com` without complaint (same pattern Spotify / YouTube / Instagram use).
  - Cache busting: WhatsApp caches link previews per URL for days. Each Copy Link generates a fresh `shortId`, so new shares pick up the fix immediately. To re-test an existing URL, run it through https://developers.facebook.com/tools/debug/ and click "Scrape Again".

### Changed
- **Mobile bar theme-aware backgrounds** — Enhanced `.mobile-bar` with stronger shadow (`0 -8px 24px`), `backdrop-filter: blur(8px)`, and thicker border (`2px`). Uses CSS variables (`--cream`, `--rule`) which auto-swap in dark mode.
- **Rewrite text vertical stacking** — Changed `.mobile-bar-rewrite-text` from single-line text to flex column with `.rewrite-count` (18px/900 weight/red `#dc2626`) and `.rewrite-label` (9px/uppercase). Updated JS in `updateMobileBar()` to inject the new HTML structure instead of flat textContent.
- **Hidden inline actions on mobile** — `.actions { display: none; }` at `@media (max-width: 720px)` since the sticky bar now handles all actions (was previously stacking columns).
- **Share modal mobile fix** — Added `margin-bottom: 80px` and `max-height` constraints to `.share-modal-content` so it clears the mobile bar. Toast lifted to `bottom: max(80px, env(safe-area-inset-bottom) + 70px)` to appear above sticky bar.
- **Wave animation resize re-bind** — Added resize listener to re-bind wave animations when transitioning from mobile to desktop width. Previously, if page loaded at ≤720px, `bindHoverWave` exited early and never ran again.
- **Light/dark mode validation** — All changes use CSS variables (`--cream`, `--ink`, `--rule`) that auto-swap between themes. Red `#dc2626` is visible on both light and dark backgrounds.

### Added
- "Your voice, beautifully shared" wave animation — added `.wave-on-hover` class to `.left-closing-text`.
- Wispr Flow research docs: `docs/wispr_flow_improvement_areas.md` with strategic recommendations, HTML versions for visual reference (`research.html`, `intelligence.html`, `improvement_areas.html`).
- Web Speech API audit completed — full inventory of SpeechRecognition usage, Whisper fallback path, and migration plan to Whisper-only recording.

---

## [v0.6.0]

### Changed
- **Layout hierarchy redesign** to improve first-use clarity for elderly and non-technical users:
  - Removed language dropdown; language is now auto-detected from `navigator.language` on first load (saved drafts still restore their language)
  - Headline rewritten from poetic "Speak anything / Get something beautiful" to instructional "Tap the mic and say something lovely" with a guiding sub-line
  - Record button + textarea + "or type" divider wrapped in a single `.input-hero` visual zone to create one unmistakable starting point
  - Examples section moved up to immediately follow the input zone, serving as a safety net for users who feel stuck
  - Name field compacted from a full "Step 4 · Your name" block into a single inline "From" row
  - "Customize" section renamed to "Make it yours", `<details>` toggle removed (always open), and steps renumbered 3-5
  - "Corner style" renamed to "Shape" for brevity
  - "Create card" button is now full-width and more prominent; "Share card" sits directly below it
  - Mobile: replaced competing sticky bars (`.actions-sticky` + `.rewrite-bar`) with **single unified mobile bar** (`.mobile-bar`) — Create+Share buttons on left, rewrite count+Upgrade on right; no more z-index conflicts
  - Mobile: unified bar uses icon-first buttons (✨ Create, 📤 Share, ☕ Upgrade) with 44×44px minimum tap targets for accessibility
  - Mobile: tone buttons increased from `11px/8px 12px` to `13px/10px 14px`
  - Mobile: shape buttons increased from `11px/10px 14px` to `13px/12px 18px`
  - Mobile: example-click scroll target changed from `#card` to `.card-wrap` with `block: "center"`
  - Mobile: create-card scroll target changed from `#dlBtn` to `.card-wrap` with `block: "center"`
  - Backup snapshot saved to `backup/wisprstories_v15_pre_hierarchy.html`
  - Design spec saved to `docs/superpowers/specs/2026-05-18-layout-hierarchy-redesign-design.md`
- Disabled auto-demo animation on page load to allow ghost decoration to appear on fresh empty state. Original animation backed up to `backup/demo-auto-animation.js` for restoration.

---

## [v0.5.0]

### Added
- Vercel Blob upload for exact card PNG as WhatsApp OG preview. Cards auto-expire after 5 days via Blob TTL.
- Short share URLs (`/c/xyz123`) with fast raw PNG upload (~1.5s). Random 8-char alphanumeric IDs. Landing page shows card image + "Create Your Own" button.
- Padded OG images (1200×630) with card centered on background-matched padding for WhatsApp large preview.
- Proxy endpoint `/api/og-image/:id` serves OG images from our domain (avoids cross-domain issues with WhatsApp crawler).
- Added minimal og:title and og:description tags (required for WhatsApp large preview).
- "Copy image" button to share modal (copies PNG to clipboard).
- Mixed-script font engine: `splitByScript()` and `applyScriptFonts()` in `fonts.js` render multi-script text (e.g., "Happy जन्मदिन!") with per-character script detection and per-script font spans.
- Click debounce: Create card button disabled for 400ms after click to prevent accidental daily-limit overshoot.
- Mixed-script example ("Mixed Script" in examples grid) demonstrates per-script font rendering with Hindi + English text.
- Input-source-aware card labels: "Voice Original", "Voice Styled", "Story Original", and "Story Styled" now reflect whether content came from recording or text entry and whether a tone is applied.
- Source icons on card labels: mic for voice, fountain pen for story.

### Changed
- WhatsApp share now sends card URL instead of PNG file, triggering OG meta preview (Spotify-style rich card with image + text).
- OG images changed from 1080×1080 square (1:1) to 1200×630 landscape (1.91:1) — universal aspect ratio for WhatsApp large image preview.
- Dynamic `/api/og` endpoint rebuilt using `sharp` + SVG overlay (Node.js runtime) — renders user name, story text, and branding on palette backgrounds. (Kept as fallback for legacy shares.)
- Synced `/api/card` and `/api/og` palette handling with the 10-color UI palette so shared links using Orange, Teal, Fuchsia, or Indigo generate matching metadata/OG previews.
- Simplified footer trust copy to "No account · Open source" by removing the inaccurate "No uploads" claim.

### Security
- Hardened `/api/card` shared-card HTML rendering: tone/palette inputs validated, shared text/name lengths capped, HTML/meta values escaped, redirect script uses JSON-encoded URL.

### Fixed
- Mixed-script font coverage for Bengali, Gujarati, and Punjabi/Gurmukhi, and replaced the unloaded Sarabun Thai mapping with the already-loaded Noto Sans Thai Looped font.

---

## [v0.4.0]

### Added
- Mobile testing setup: zero-dependency Node.js server (`serve.js`), PowerShell launcher scripts, ADB + scrcpy integration, WiFi-direct phone testing at PC's local IP.
- Keyboard avoidance: `visualViewport.resize` listener on mobile scrolls the active input into view when keyboard opens.
- Loading skeleton state for examples grid (`ec-skeleton` shimmer animation).
- Auto-scroll to card preview on tone/palette/size/corner selection on mobile.

### Changed
- Replaced CSS-rendered spiral overlay (`mix-blend-mode: screen` compositing) with pre-baked WebP card background images (`assets/card-bgs/` — 80 files: 4 ratios × 2 corner styles × 10 palette colors). Export simplified: removed canvas pixel-inversion compositing, replaced with direct `drawImage` of the WebP.
- Precomposited the card spiral background before `html2canvas` export so Share modal previews and downloaded PNGs match the live screen-blend preview.
- Refreshing a saved draft no longer marks the card as created or shows the download/Wispr Flow CTA; users must click Create card again after reload, and restored preview waveforms are no longer cleared on startup.
- Create button hover/focus animation now restores the actual current button label instead of hard-coding "Create my card".
- Removed the automatic filled-card entrance animation that made the spiral/card appear to glitch during page refresh.
- Reworked PNG export so spiral blending is composed entirely offscreen; clicking Download no longer stretches or mutates the live spiral layer.
- Occasion images converted to WebP: birthday 1.6MB→174KB, mothers-day 1.4MB→124KB (90% smaller each).
- Right column scrollbar hidden (`scrollbar-width: none`, `::-webkit-scrollbar { display: none }`). Column remains scrollable via mouse wheel/touch/keyboard.
- Right column centering restored: `justify-content: center` on tall viewports, switches to `flex-start` at `max-height: 750px` for small laptop screens.
- Added intermediate breakpoint at 1024px with reduced column padding for smoother width responsiveness.

### Fixed
- Right column now auto-detects overflow on small laptops with independent scrollbar, matching left column pattern. Shell no longer clips footer (`overflow: hidden` removed). Ghost decoration shifted from 20px→40px right to clear scrollbar. Grid cells use `min-height: 0` for proper internal scrolling.

---

## [v0.3.0]

### Changed
- Mobile CSS improvements: `viewport-fit=cover`, safe-area-inset padding, `100dvh` fallback, `color-scheme` dynamic update on dark mode toggle, 44px palette touch targets, 480px breakpoint, `@media (hover: none)` hover animation disable for touch devices.
- Dark mode transition: extended to 0.4s, added `backdrop-filter` and `opacity` to transitioned properties for smooth toggle. Uses `transition: all 0.35s ease !important` with 500ms class timeout for full cross-element sync.
- Wave animation: JS skips binding on touch devices (`hover: none && pointer: coarse`). JS skips entirely on mobile (`window.innerWidth <= 720`), CSS kills via `@media (max-width:720px)`. All hover/transform/transition effects killed on mobile via width-based media query.
- Typography iterations: heading (`hl-h1`) enlarged to `clamp(36px, 5vw, 56px)` → `clamp(30px, 4vw, 48px)`, label (`hl-eye`) reduced from 9px to 10px, intro text sizing and spacing refined.
- Examples: limited to 8 on mobile for clean 2-column grid. Hidden `.left-closing` quote on mobile.
- Nav: "Speak · Create · Share" tagline hidden on mobile; brand text reduced to 14px, logo to 18px.
- Left panel: `padding-top` increased to 32px on mobile for nav-body distinction.
- Footer: centered layout (column direction, text-align center) on mobile. Copyright notice added (`© 2026 Wispr Flow`).

---

## [v0.2.0]

### Added
- Full SEO meta tags: description, robots, canonical URL
- Open Graph tags (og:*) for rich link previews on WhatsApp, Facebook, iMessage
- Twitter Card tags (twitter:*) for rich previews on X/Twitter
- JSON-LD structured data (WebApplication schema) for Google rich results
- PWA hints: theme-color, apple-mobile-web-app-capable, mobile-web-app-capable, apple-touch-icon
- Security: X-Content-Type-Options, X-Frame-Options, HSTS, Referrer-Policy, Permissions-Policy via vercel.json
- SRI integrity check for html2canvas CDN script
- og-image.png (1200×630) for social previews
- Referrer-Policy meta tag (strict-origin-when-cross-origin)
- format-detection meta tag, color-scheme, application-name meta tags

### Changed
- Updated `<title>` to be SEO-optimized
- Upgraded AGENTS.md documentation to reflect new files and features

---

## [v0.1.0]

### Added
- Initial prototype: voice-to-card single-page app
- 37 language support via Web Speech API
- 6 card palettes, 6 tones (visual only), 4 aspect ratios
- PNG export via html2canvas
- Mobile sharing via Web Share API
- RTL support for Arabic, Hebrew, Farsi, Urdu
