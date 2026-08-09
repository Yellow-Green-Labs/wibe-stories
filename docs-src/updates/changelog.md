---
title: Changelog
outline: [2, 2]
---

# Changelog

*Last updated: Aug 9, 2026*

> **Project planned:** May 8, 2026 · **First commit:** June 8, 2026 · **Total days active:** 92

## v0.11.30.1 — 2026-08-09

Hardening release — security fixes, no user-facing changes.

### Fixed
- **Speech-to-text errors no longer leak internal details** — Error responses are now generic; technical details stay server-side.
- **Card name from a shared link is now safe** — Names carried in the URL of a shared card are cleaned before display, so a crafted link can't inject markup.
- **Upload endpoints hardened** — Voice uploads now accept only valid card IDs, and unexpected errors return generic messages instead of internal details.

## v0.11.30.0 — 2026-08-09

Voice recordings get faster to create, and the service stays responsive and protected behind the scenes.

### Changed
- **Faster voice uploads** - The Apple-friendly version of a voice recording is now prepared only when someone actually opens that card on an Apple device — not at upload time. Uploading is quicker, and recordings nobody plays on Apple devices never spend extra processing.
- **Voice playback fix on shared pages** - Audio on shared story pages could be blocked by browser security rules; the rules now allow it so the player works for everyone.
- **Upload safeguards** - Daily upload limits guard against a single source overwhelming the service. Normal use is unaffected.
- **Retired legacy share route** - The old `/card` shortcut now points to the main app (replaced by short-link cards under `/c/...`).

### Fixed
- **More reliable status monitoring** - The health check now reports a problem only when core services are actually down together. Brief hiccups in one service no longer look like an outage.
- **Smarter speech-to-text** - The text-recognition step no longer prepares data it doesn't need for the most common path, making each call leaner.

## v0.11.29.0 - 2026-08-01

The welcome landing demo videos now stream from a public CDN, so first-time visitors get instant playback without loading extra files from the app host.

### Added
- **CDN video delivery** - The landing demo videos (desktop and mobile shots) are served from a public content-delivery network instead of local app assets.
- **Reduced-motion support** - The landing respects the visitor's reduced-motion setting: the demo video doesn't autoplay until they tap it.

### Changed
- **Playback position preserved on resize** - Switching between desktop and mobile views keeps the video playing from the same moment instead of restarting.
- **Security header** - Content-Security-Policy media rules updated so the demo videos can stream from the CDN.
- **Desktop video quality** - Desktop demo re-encoded to 1080p (was 2560x1440) for faster first loads on slower connections.

## [Unreleased]

Multi-sync session: PENDING view columns fixed, legacy PENDING removed, C_WS-updates brain dump section + items added, DECISIONS expanded with context, Target Dates set by priority.

### Added
- **Project Tasks Notion database** — Created under WIBE_STORIES frontlogs page with 110 items (109 Pending, 1 Discarded) across 15 categories. Schema: Item, Category, Status, Priority, Effort, Source, Start Date, Target Date, Notes.
- **C_WS-updates brain dump section** — Added to Notion frontlogs page with IDEAS, QUESTIONS, AI TO CHANGE, HUMAN TO CHANGE subsections. AI MUST read this section every session.
- **4 new database items** — Mobile WhatsApp preview bug, serif font replacement, year-end vault review idea, email open tracking investigation (Source: C_WS-updates).
- **C_WS-updates Source option** — Added to Project Tasks database Schema.
- **Gap items catalogued** — 54 codebase audit items (security vulns, bugs, memory leaks, race conditions, architecture issues, CSS/UI problems, i18n gaps, monitoring gaps) added to database as Source=GAP.
- **Email campaigns tracked** — 7 planned email campaigns (#4-10 from EMAILS.md) added to database as Source=EMAILS.
- **Roadmap features tracked** — 8 roadmap items added as Source=ROADMAP.
- **Service integrations tracked** — 5 pending services (Loops.so, Unkey, ImageKit, Ahrefs, Posthog) added as Source=SERVICES.
- **3 database views created** — 📋 PENDING (filtered/grouped), 📅 TIMELINE (calendar by Target Date), 📊 ALL ITEMS (full list).
- **Target Dates assigned** — All 100+ pending items received Target Dates by priority tier (Critical→Aug 4, High→Aug 11, Medium→Aug 18, Low→Aug 28) to populate the TIMELINE calendar view.

### Changed
- **AGENTS.md** — Updated Frontlogs section to reference Project Tasks database as source of truth for work tracking. Added C_WS-updates brain dump check rule to Session start.
- **Notion frontlogs page** — Old PENDING toggle list marked as legacy; new database replaces it as single source of truth. Legacy PENDING section removed entirely.
- **DECISIONS expanded** — All 6 decision subsections (Pricing, Vault, Email, Calendar, Clerk Auth, Legal/Infra) expanded with context — alternatives considered, why chosen, specific constraints.
- **PENDING view fixed** — Status column now visible in 📋 PENDING view columns.
- **AGENTS.md bloat trim** — The `<!-- agsync: ... -->` comment block had grown to 18.2 KB (~38% of the file). Historical session notes (the v0.11.27.0 note + all 2026-07-31 post-session notes, 11.2 KB) were archived verbatim to `docs-internal/agsync-archive.md`; the block now keeps only the primary last-run note plus the ~3 most recent session notes, and the Self-update rule documents the archive convention so the block can't regrow. AGENTS.md: 47.6 KB → 36.4 KB.

## v0.11.28.1 — 2026-07-31

The welcome landing page becomes a real page: it is the first thing painted for new visitors, with the app locked behind it as a blurred, dimmed backdrop — reachable only via "Got it, let's go!".

### Added
- **`#appRoot` backdrop layer** — The entire app is now wrapped in `#appRoot`. While the landing is up, the app renders behind it as a locked backdrop: `position: fixed`, `blur(8px) brightness(0.55) saturate(0.8)`, `scale(1.04)`, `pointer-events: none`. First-timers additionally get `inert` + `aria-hidden` (added by JS at init, removed on entry) so Tab/click/scroll can never reach the app.
- **Pre-paint returner class** — A head script adds `html.ws-app-return` when `wsOnboardingSeen` is set, before first paint: returners see the app directly (landing `display: none`, appRoot back to normal flow), first-timers see the landing as the very first frame. Zero flash for both.
- **Enter-the-app transition** — CTA fades the landing out (~0.35s) while the app unblurs/zooms into focus (~0.55s), then swaps to static flow. `prefers-reduced-motion` skips all animation.

### Changed
- **Landing is the page, not an overlay** — `.onboarding-overlay` is visible by default (no `.show` toggle): a centered 95vw × 95vh card (radius 14px, soft shadow, solid cream/dark card background) floating over a translucent cream/dark backdrop. The real app shows through blurred and dimmed *around the card's edges* — the sides of the background stay visible, exactly like the earlier onboarding overlay. Load-in animations removed (the landing is the first paint).
- **Landing markup moved** — The landing block now sits after the app content (before the end-of-body scripts) so `#appRoot` can wrap the whole app in one element.
- **JS rework** — `showOnboarding()` → `focusLanding()` (locks the app + focuses the CTA; no class toggling), `hideOnboarding()` → `enterApp()` (transition, flag, unlock, version re-check). Update-toast guard now keys off `ws-app-return` instead of the overlay `.show` class. Demo video got `id="lpVideo"` and is paused on entry.
- **`modal-open` no longer used by the landing** — the locked backdrop (fixed + overflow hidden) makes it unnecessary.

### Fixed
- **Returners would have been locked out by `inert`** — inert/aria-hidden are no longer baked into the HTML; they're added by JS for first-timers only and removed on entry, so returners are never affected.

### Removed
- Overlay `.show` class mechanics, `onboarding-fade-in`/`onboarding-slide-up` keyframes, and the stale mobile `border-radius` rule (the card keeps its 14px radius at all widths).

### Follow-up
- **Patch bump v0.11.28.1** — v0.11.28.0 was never deployed; the card-sizing correction (95vw × 95vh centered card, see Changed above) ships in this entry instead.
- **Landing visual refinements** — Backdrop blur removed from the landing overlay (the app behind stays blurred/dimmed via the `#appRoot` lock); dark-mode backdrop becomes a 15%-alpha cream wash (`#fff8eb26`) so the app shows through nearly fully; `lp-nav` bottom border removed; CTA button switched to amber (`#F59E0B`) with dark ink text for contrast; demo video border-radius + shadow removed; demo video swapped to `animo-wheel-spin-bottom-720p.webm` (still TEMP local, R2 swap pending).
- **Always-dark landing + softer backdrop** — The landing is now always dark by design with no light variant: every landing color was converted from theme variables to hardcoded dark-mode literals (the `#ffffeb` family), the entire `:root.dark` landing override block was deleted, and the CTA text is a literal `#1a1a1a` on amber (it previously used `var(--ink)`, which inverts to cream under the dark theme). The landing logo was swapped to the white-on-transparent variant (`ws-logo-TR-whfr.png`) for the dark card. The app-backdrop blur was softened from 12px to 8px at the user's request.
- **Demo video 404 fixed** — The new webm served 404 in local dev because `vercel dev` indexes static files at server start, and the file was downloaded after the server booted; restarting the dev server resolved it (no code change needed).
- **Demo video reverted to viewport-filling layout** — The edge-to-edge experiment is reverted per user request: the landing page must not scroll. The video returns to a `flex: 1` wrap that fills exactly the remaining card height (video at the bottom, `height: 100%`, `object-fit: contain`, base padding 10px 32px 22px and mobile 8px 14px 14px). The landing stays limited to the viewport; the `max-width: 1920px` natural-size CSS was dropped.
- **CTA focus ring removed** — `focusLanding()` no longer auto-focuses the button (the browser's default focus ring appeared on load: script-focus paints the UA outline, and the always-dark landing makes Chromium/Safari's dark-mode ring render white). The CTA is now `outline: none`, so no ring ever appears — matching the mouse-click behavior of every other button; the keyboard focus indicator tradeoff is accepted on this single-CTA first-paint page.
- **Desktop video spec + dark mobile backdrop + mobile cascade-deck video** — Desktop (≥721px): the demo video wrap is now flush-bottom (`padding: 0 32px 0`) and the video is 90% width with `object-fit: cover` (fills the remaining card height, cropped) — this sizing is superseded, see the edge-to-edge follow-up bullet below. Mobile (≤720px): the backdrop turns opaque `#2A2A2A` — the app behind (buttons, UI) is now fully hidden on small screens, where the 15% cream wash let it show through; the video also gets a dedicated portrait file: `#lpVideo` now uses two `<source media>` entries — `animo-cascade-deck-900p.webm` (720×900, 6.19 MiB) on ≤720px, `animo-wheel-spin-bottom-720p.webm` (1280×720, 22.56 MiB, regenerated 8:31 PM) on ≥721px — with the mobile video rendered largest-fit (auto dimensions + max constraints, fully visible: no crop, no letterbox). Scroll hardening: `overscroll-behavior: none` on the overlay + `contain` on the banner, so nothing can ever scroll-chain from the landing into the app behind (which was already unscrollable via the fixed `#appRoot` lock). Dev server restarted to index the new static file (both webms verified 200 `video/webm`). Both files remain TEMP local; R2 swap pending.
- **Mobile hierarchy + flush video** — Mobile (≤720px) landing refinements for proper visual hierarchy: the hero title grows from the base 26px minimum to `clamp(34px, 8vw, 44px)` (~34px on phones) so it clearly leads, the subtitle drops from ~15px to 13px (2.6× title-to-subtitle ratio), and the benefit badges shrink from 12px/`6px 14px` to 10.5px/`4px 10px` so they no longer compete with the CTA's weight. The video wrap's bottom padding is removed (`8px 14px 0`) — the video sits flush against the card's bottom edge; the taller hero naturally shrinks the `flex: 1` video area a bit. Desktop (≥721px) rules untouched.
- **Showcase video toggle + landing footer + click hint** — `#lpVideo` now plays the showcase pair with a click-to-toggle per viewport: desktop (≥721px) `wheel-showcase-1.webm` ↔ `wheel-showcase-2.webm` (2560×1440, 30s, 67.6/43.3 MiB), mobile (≤720px) `mob-sc-1.webm` ↔ `mob-sc-2.webm` (1080×1350, 20s, 13.0/6.7 MiB). All four carry VP9 embedded alpha (`alpha_mode: 1`) and are TEMP local files pending the R2 upload (the previous `animo-*` pair is retired). Clicking the video flips the shot (`_lpVideoShot`); the video's `src` is fully JS-managed (see the follow-up bullet below — `<source media>` is selection-time-only for `<video>`). A hint pill ("Tap to switch view", `.lp-hint-pill`) sits bottom-center above the footer and stays visible for the whole landing session (it never fades on click - see the follow-up bullet below). The landing card gains a footer — "Wibe Stories © 2026 YGLabs" — absolutely anchored at the page bottom, floating over the video's transparent bottom strip with `pointer-events: none` so it never blocks video clicks. Dev server restarted (new listener PID 29708) to index the 4 new static files; all verified 200 `video/webm` byte-exact (served == disk).
- **Instant pair swap on breakpoint crossing + footer/hint restyle** — Fix: resizing across the 720px breakpoint previously kept the old viewport's video playing until a refresh. `<source media>` on `<video>` is evaluated only when resource selection runs (initial load / `load()` / source add/remove) — a viewport resize never triggers it, so the earlier "native media-query behavior on resize" claim was wrong (it was documented without ever testing a cross-breakpoint resize; click-toggling masked the flaw because `load()` re-runs selection). The pair now swaps instantly: a `matchMedia("(max-width: 720px)")` `change` listener resets `video.src` + `load()` + muted `play()` (`lpSetVideoFile`), preserving the shot index. The `<source media>` elements and the `autoplay` attribute were removed — the src is set in JS and only for first-timers (a `ws-app-return` guard inside `lpSetVideoFile`), so returners never fetch the demo video at all. Footer restyled per user spec: 11px, `font-weight: 100`, `#ffffeb55`. Hint pill moved from the top-right corner to bottom-center above the footer (`bottom: 34px`, centered, `#ffffeb33`, no background/border; the commented-out style lines are kept verbatim from the user's snippet). Per the user's follow-up, the hint pill no longer fades on click: it stays in place (bottom-center) and stays visible for the entire landing session; the `.lp-hint-hidden` fade machinery (the CSS rule, the `transition`, and the click-handler toggle in JS) was removed. It can never reappear - the landing shows once per visitor and never reopens.
- **Landing video edge-to-edge** — Per user spec: `.lp-video-wrap` padding removed (commented out — desktop `0 32px 0`, mobile `8px 14px 0`) and `.lp-video` base width `90%` → `100%`. Desktop is now edge-to-edge at full wrap width with `object-fit: cover` + `height: 100%` (cropped, page still never scrolls). Mobile rule untouched (`width: auto` + `object-fit: contain` largest-fit — the portrait video still never crops or letterboxes).

## v0.11.27.0 — 2026-07-31

Welcome landing page replaces first-visit onboarding banner; Cloudflare R2 hosting setup.

### Added
- **Welcome landing page (v1)** — First-visit full-screen 95vw×95vh overlay with own navbar (logo, Features/About/Pricing links, Sign in + Sign up placeholder buttons), hero ("Voice messages should be seen, not just heard"), 4 benefit badges (No account, 44 languages, Share anywhere, Free), CTA ("Got it, let's go!") with microcopy, and an autoplay demo WebM. No close button and no backdrop-click dismissal — the CTA is the only dismiss path. English-only by design: the markup carries static English text with no i18n hooks, so it can never be swapped by the language layer.
- **`landing.*` i18n keys** — Added 13 keys (nav, hero, benefits, CTA) to en.json (kept as the English source); the `landing` blocks in the 10 non-English locale files were removed later in this same version when the landing was locked to English — do not restore them.
- **Cloudflare R2 video hosting** — Bucket `wibe-stories-media` created (Location: Automatic, Standard storage) for hosting demo/hero videos; not yet in use — landing page video still points to a local dev file pending CDN URL swap.
- **Sign in / Sign up placeholders** — Landing nav now has a text-only "Sign in" button and a filled "Sign up" pill, both no-op placeholders pending Pro auth in a future session. "Pricing" nav link is a `/pricing` placeholder pending the standalone pricing page.

### Changed
- **First-launch onboarding** — Old 3-step banner (title, steps, got-it, hint) replaced by the landing page. `showOnboarding()` now moves focus to the CTA after the overlay opens.
- **overlays.css** — Old onboarding banner styles replaced with `lp-*` landing styles (flex column, video fills remaining height, no scroll, dark-mode variants, mobile nav collapse under 720px, `.lp-nav-auth` sign-in/sign-up button styles).
- **Landing nav links** — Documentation (`/docs`) replaced by Pricing (`/pricing` placeholder); Contact link replaced by Sign in/Sign up buttons. `landing.navDocs`/`landing.navContact` i18n keys removed, `landing.navPricing`/`landing.navSignin`/`landing.navSignup` added.
- **Version string synced** — `CURRENT_VERSION` in wisprstories.js, package.json, and package-lock.json all bumped to v0.11.27.0 (version.json already was). This was the root cause of the false "A new version is ready — refresh page" toast: the version poller compared version.json against a stale `CURRENT_VERSION`.
- **Update toast gated off the landing page** — `showUpdateToast()` no-ops while the welcome overlay is visible; `hideOnboarding()` re-checks on dismissal (shows a pending toast or runs `checkVersion()`), so real updates still surface on the main page within seconds.
- **Landing appears instantly** — First-launch `setTimeout(showOnboarding, 800)` replaced with an immediate `showOnboarding()` call. The script loads synchronously at end of body, so the landing paints on the very first frame — no flash of the main page behind it, including on logo-click returns from Features/About/Pricing.
- **Landing locked to English** — All 13 `data-i18n="landing.*"` hooks removed from the landing markup (English text is now static); `landing` blocks deleted from the 10 non-English locale files. en.json keeps the block as the canonical English copy. The rest of the app still translates as before.
- **"How to Use" removed** — Hamburger `#hmHelp` and footer-menu `#fmenu-help` entries and their `window.showOnboarding()` handlers deleted; there is no longer any reopen path for the landing page after dismissal (by design — landing shows once until "Got it" is pressed, then never again).

### Removed
- **Onboarding banner markup/styles** — `.onboarding-close`, `.onboarding-header`, `.onboarding-steps`, `.onboarding-footer`, `.onboarding-hint` classes and `onboardingClose` button + backdrop-click dismissal listeners.
- **`onboarding.*` i18n keys** — Removed from all 11 locale files (title, step1-3, gotIt, hint).
- **`landing.*` keys from non-English locales** — Entire `landing` block removed from the 10 non-English locale files (English-only landing; kept in en.json).
- **`footer.help` i18n key** — Removed from all 11 locale files along with its two consumers (`#hmHelp` hamburger link + `#fmenu-help` footer link).

### Fixed
- **CTA dismissal listener** — `onboardingGotIt` click → `hideOnboarding()` preserved during the banner→landing conversion.
- **False "new version ready" toast** — Caused by `version.json` (v0.11.27.0) ahead of `CURRENT_VERSION` (v0.11.26.0) after the version bump; fixed by syncing every version string. Belt-and-braces: the toast is also suppressed while the landing overlay is open.

## v0.11.26.0 — 2026-07-20

Direct Tally.so contact form links, CSP cleanup, BMC Support rename.

### Added
- **Contact hamburger link** — Added "Contact" link to hamburger-items across about.html, features.html, language-stats.html. Moved hmContact from hamburger-footer-items to hamburger-items in wisprstories.html.
- **Zoho Mail Lite** — Added to USEFUL_SERVICES.md Pending table.

### Changed
- **All contact/support/feedback links** — Replaced every `mailto:yellowgreenlabs@proton.me` across the 4 app pages, footer menu, and docs legal pages with direct Tally.so URL (`https://tally.so/r/obaD1M`). All links open in new tab (`target="_blank"`).
- **BMC "Support" → "Buy us a coffee ☕"** — Renamed in about.html, features.html, language-stats.html hamburger menus for clarity.

### Removed
- **Tally widget script** — Removed `tally.so/widgets/embed.js` from wisprstories.html `<head>`.
- **`openContactForm()` function** — Removed function and all JS event handlers for navContact/hmContact (now plain `<a>` tags).
- **Tally.so from CSP** — Removed `https://tally.so` from `script-src`, `https://*.tally.so` from `connect-src`, and `frame-src https://tally.so` from vercel.json.

## v0.11.25.0 — 2026-07-19

Contact form via Tally.so popup, CSP update, docs cleanup.

### Added
- **Contact modal via Tally.so iframe embed** — New "Contact" link in the grid menu (top navbar) opens a custom overlay modal with an iframe loading the Tally.so form. Fields: Name, Email, Request Type (7 options), Message, Screenshot. Modal closes via × button, backdrop click, or Escape key. `src` is cleared on close to prevent stale form state. Form submissions go directly to email + Tally dashboard. No backend needed.
- **CSP update** — `frame-src https://tally.so` added to vercel.json to allow the iframe embed.

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
