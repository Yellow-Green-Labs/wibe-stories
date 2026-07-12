# Wibe Stories — Acknowledged Logs

> **Source of truth for the public "Acknowledged Logs" Notion page.**
> Update this file first; the Notion page mirrors the section marked `MIRROR TO NOTION`.
> The section marked `INTERNAL ONLY` is for the Wibe Stories team and the Wispr Flow team and is never published.
>
> **Last updated:** 2026-06-24 (v0.11.2, content revision: added Limitation 9 — uploaded audio transcription accuracy)
>
> **Build version note:** the app build banner is at v0.11.0.4. v0.11.0.4 is a deployment path fix (script tags now use absolute `/internal-logs/secret-shortcut.js` so the chord works on `/about` and `/language-stats`). v0.11.0.3 was the Windows menu-activation fix (scoped `e.preventDefault()` for W/S keys). The Acknowledged Logs content above was last touched at v0.11.0.1 and has not changed for v0.11.0.3/v0.11.0.4 — both are code fixes only, no public content impact.
> **Audience for public content:** the Wispr Flow team and anyone Wibe Stories points at this page.
> **Authoritative version:** this file. The Notion page is a snapshot.
>
> **Post-publish status:** Notion page created at `https://wisprstories.notion.site/wisprstories-ackologs`; URL constant in `internal-logs/secret-shortcut.js` updated. Public Issue list pending re-mirror (delete Issue 2 from the live page, then Issues 3-5 become 2-4). Ready to redeploy (`vercel --prod`).

---

> **A note on Apple platforms**
> Wibe Stories is developed and tested primarily on Windows and Android. We do not currently own any Apple device in our test environment. Information about Apple-platform behavior in this document is, to our knowledge, based on published browser-support documentation and user reports, not on first-hand testing on a Mac or iPhone.

---

<!-- MIRROR TO NOTION: START -->

**What this page is**

This is a running log of what we know is broken and what we chose on purpose. We keep it here rather than hiding it because hiding a known issue from a partner or user is worse than naming it. We update this page as things change; the version number at the bottom tells you when it was last touched.

# Known issues

These are bugs and behavior gaps we know about, in roughly decreasing order of impact. We list them here rather than hiding them because hiding a known issue from a partner team is worse than naming it.

## Issue 1 — Voice-attached downloads may not play on Mac and iPhone

**Topic:** WebM downloads on Apple platforms

**Q:** I downloaded a card with my voice attached, but the voice won't play on my Mac or iPhone. What happened?

**A:** Voice-attached cards are saved as a specific file format (WebM, a modern video format). Apple's QuickTime player and the iPhone Photos app do not play this format natively, and iOS does not ship a built-in player for it. On Android phones and Windows PCs the file opens and plays in the default media player. We chose this format because it is what the browser produces when it records the screen, and converting it to a more universal format inside the browser would noticeably slow down the card-creation flow. The shared web preview (the link you can send to friends) plays the voice in any modern browser, including on Apple devices. The download-and-share path is the affected one.

**What you can do:** Open the card via the shared link, not the downloaded file, on Apple devices. Or download the file on a non-Apple device first.

## Issue 2 — Voice is lost on PNG download; on share links, the voice upload can silently fail

**Topic:** Voice attachment on PNG downloads and share links

**Q:** I downloaded my card as a PNG, and the voice is gone. And on a share link, sometimes the voice also does not play, even though the link looks fine. What's going on?

**A:** Two related issues.

*When you download as a PNG.* A PNG image file cannot contain audio. If you want the voice, download the WebM file (or just use the share link). We considered putting a QR code on the PNG that points at the share link, but that creates its own set of issues (the QR can be cropped by social-media image resizers, and it makes the card look busy), so for now the PNG is voice-less on purpose.

*When you share a link.* When you create a share link, the image is uploaded first, then the voice is uploaded in the background and attached to the link. The share button reports success as soon as the image upload completes, even if the voice upload is still in progress or silently fails. A network drop, an oversized file, or a server hiccup can leave the link live with no voice. We do not currently retry failed voice uploads, and we do not warn you at share-time that the voice is missing.

**What you can do:** For a PNG you can use the share link in a QR code you generate yourself. For a share link, you can verify the voice plays in the preview before you actually send it; if it does not, try sharing again. The image is always present, so even a failed voice upload leaves you with a working card.

## Issue 3 — Firefox cannot record voice

**Topic:** Firefox voice recording

**Q:** I opened Wibe Stories in Firefox, and the microphone button does nothing. Is this broken?

**A:** Firefox does not support the browser's built-in speech-to-text feature that we use for real-time transcription during recording. In Chrome, Edge, Safari, and most mobile browsers, we can show your words as you say them. Firefox does not expose this feature at all. We have not built a workaround for Firefox yet, so the only way to create a card in Firefox today is to type your message into the text box directly. We recommend Chrome or Safari for the voice experience, and we would like to add a "record in a different browser, then come back" hint at some point, but it is not built today.

**What you can do:** Switch to Chrome, Edge, or Safari for voice recording. Or type your message in Firefox.

## Issue 4 — Parts of the interface are still in English in ten of eleven languages, and some translated text shows broken characters

**Topic:** Language coverage

**Q:** I picked my language, but some buttons and messages are still in English. And a couple of buttons show weird characters like boxes or question marks. What is happening?

**A:** We support eleven languages for the user-facing text in the card, but only one of them (English) has been fully translated and reviewed. The other ten languages have parts of the interface that fall back to English, and a small number of those parts contain characters that display incorrectly on some devices (a problem called "mojibake", which is a fancy way of saying the bytes were decoded with the wrong character set). We chose to ship the other ten languages early with English fallbacks so that speakers of those languages could at least use the app, rather than waiting for full translation. The card text itself is shown correctly in every language; it is the buttons, menus, and system messages around the card that are still partly English.

**What you can do:** Use the app in English for the most complete experience today. We plan to complete the translations and fix the broken characters in a future update. If you spot a specific broken string, that is helpful feedback for us.

---

# Limitations

These are constraints we chose on purpose. They are not bugs — they are product decisions, listed here so you understand what we have prioritized.

## Limitation 1 — Free-tier daily caps exist to keep the service sustainable and prevent abuse

**Topic:** Daily limits (recordings, rewrites, recordings length)

**Q:** Why does Wibe Stories have a daily cap? And why those specific numbers?

**A:** The free tier is capped at 5 recordings per day, 1 tone rewrite per day per tone, and a 15-second recording length. A small Pro upgrade removes the caps, extends recordings to 30 seconds, and adds unlimited rewrites.

The caps exist for two reasons.

*Sustainability.* The most expensive parts of the service are the speech-to-text transcription (charged per audio second) and the tone rewrites (charged per call to the language model). Without caps, even a moderate number of users could push our infrastructure bill past what we can sustain.

*Abuse prevention.* A small number of bad-faith users can do outsized damage. We have seen scripts that create hundreds of cards per minute for SEO-spam card farms, scripts that scrape tone-rewritten phrases to build training datasets for other language models, and bulk-paste attacks that try to inject instructions into the rewriting system. The caps make these attacks much harder to run at scale, and Pro accounts give us a verified payment method to revoke if abuse is detected.

The Pro upgrade is what lets us keep the free tier generous for genuine users while limiting the damage that automated abuse can do.

## Limitation 2 — Recordings are 15 seconds (free) or 30 seconds (Pro)

**Topic:** Voice recording length

**Q:** Why is my recording cut off at 15 seconds? Why not 60 seconds, or unlimited?

**A:** On the free plan, recordings are limited to 15 seconds. Pro extends this to 30 seconds. The cap is set by the cost of the speech-to-text service, which charges per audio second. In our testing, 15 seconds is enough to capture one complete thought in a single voice message; longer recordings tend to be either multiple thoughts (better as separate cards) or background noise (better not recorded). Pro exists for users who want to record a longer message in one take.

## Limitation 3 — Card text is capped at 150 characters

**Topic:** Text limit on the card

**Q:** Why can't I write more than 150 characters on my card?

**A:** We have found that shorter messages make for better-looking, more shareable cards. 150 characters is the sweet spot — long enough for a thoughtful sentence, short enough to never overflow the card design. Most of the example phrases we provide fit comfortably within this limit, and the limit is enforced gently: the counter turns red and the Done button disables when you go over, rather than blocking input, so you can see exactly what you would lose by shortening the text.

## Limitation 4 — Shared links automatically expire after 7 days (14 for Pro)

**Topic:** Share retention

**Q:** I sent a Wibe Stories link to a friend, and a week later it stopped working. What happened?

**A:** Shared card links automatically delete themselves 7 days after creation (14 days for Pro subscribers). We do this for two reasons. First, every stored card costs us a small amount of money in storage and bandwidth, and 7 days is long enough for the link to be seen by everyone the sender intended to share with, while short enough that we are not paying to host stale links indefinitely. Second, the link contains a personal voice recording in some cases, and we want that recording's lifetime to be finite by default. If you want a card to last, download the image — downloaded cards are yours to keep forever.

## Limitation 5 — We do not run automated content moderation

**Topic:** Content moderation

**Q:** Could someone create a card with offensive or harmful content? What stops that?

**A:** Nothing automated. We do not run any content filter on the text you type or the voice you record. The free-tier daily caps make bulk automated abuse impractical (a script that creates 1,000 cards per minute would hit the cap in seconds), but a determined human user can create any content they like.

If we receive a report, we review it manually. This is a known gap. We have not yet built a content filter, and building a good one is genuinely hard: a filter that is too aggressive will reject heartfelt but unusual messages, and a filter that is too lenient will miss genuine abuse. We would rather be honest about the gap than ship a filter that gives a false sense of safety. We do plan to address this in the future.

## Limitation 6 — Older Safari versions show slightly different layouts

**Topic:** Older Safari compatibility

**Q:** The app looks a little different in an older version of Safari. Why?

**A:** We support the current version of Safari and the two previous major versions. Safari versions older than that may show slightly tighter spacing (because of a missing browser feature) and slightly different card aspect ratios (because of a different image-shape feature). These are not bugs — they are graceful degradations for users who cannot update their browser. If you can update Safari, the modern design will appear.

## Limitation 7 — Cards are available in one size only (1:1 square)

**Topic:** Single card size

**Q:** Why can't I make my card a different shape — vertical for stories, or wide for Twitter?

**A:** We used to offer four card sizes — 1:1, 9:16, 4:5, and 16:9. They looked great on a desktop, but on a phone the wider sizes got cropped, the background illustration got cut off (especially when downloaded), and the wider sizes especially did not fit on a small screen. We tested all four across multiple phone sizes, and the inconsistency was clear: the same card looked perfect in the editor, broken on the phone, and broken again on different social media. After multiple rounds of testing we decided to ship only the 1:1 square — the one size that looks right on every screen, fits every social media share preview, and shows the entire card image to every viewer. It is a deliberate product decision, not a missing feature.

## Limitation 8 — Textarea has an invisible 10-character grace for last-word completion

**Topic:** Invisible character grace

**Q:** I noticed the character counter went past 150. Why?

**A:** The textarea's user-visible cap is 150 characters, but the system quietly allows up to 160 characters. We do not display the number 160 anywhere in the interface, because we do not want to invite longer messages; 150 is still the recommended length for the best-looking cards. The 10 extra characters exist only so the system does not aggressively cut your message mid-word. If you are at 145 characters and want to add "friend" (6 letters plus 1 space, 7 characters), the system lets you finish. This grace applies only to the text you type in the textarea; the card image, transcription, and tone rewriting are all based on the first 150 characters of your message. Beyond 160 characters the system stops accepting input.

## Limitation 9 — Uploaded audio transcription may not exactly match the card text

**Topic:** Audio file upload transcription accuracy

**Q:** I uploaded an audio file, but the text on the card is different from what I said in the recording. Why?

**A:** When you upload a WAV or MP3 file, the audio is run through the same speech-to-text engine (Deepgram Nova-3) that processes live microphone recordings. This transcription is rarely 100% accurate — background noise, accent, speaking speed, and audio quality all affect the result. Unlike a live recording where you can see words appearing and re-speak if needed, with an uploaded file the transcription is generated in one pass and the result appears directly in the text box. If the transcription is off, you can edit the text box manually or tap the reset icon to start over.

---

**Something missing?**

If you notice a problem that is not listed here, we probably do not know about it yet. Please let us know — we update this page as we discover and fix things.

**Create a Wispr Story**

Turn your voice into shareable cards, in your language, in seconds.

[wibestories.vercel.app](https://wibestories.vercel.app)

<!-- MIRROR TO NOTION: END -->

---

<!-- INTERNAL ONLY: START -->
<!-- Everything below this line is for the Wibe Stories team and is not published. -->

# Internal reference

## Access mechanism

The public-facing "Acknowledged Logs" Notion page is reachable in two ways.

1. **Direct URL** — the Notion page itself, which is unguessable enough that the URL alone is the secret.
2. **Keyboard shortcut on the public site** — `Alt + F1`, on the home, about, or language-stats pages. Works on Windows, Mac, and Linux. The handler is in `internal-logs/observer.js` (deployed; git-ignored source stays out of the public repo), included on all three pages via a deferred `<script>` tag. The destination URL is stored as the `WS_EP` Vercel environment variable and is never hardcoded in any file on GitHub.

The chord handler clears its state on window blur so a focus-loss cannot cause a stale chord to fire when the user returns. It also clears the held-letter set when the chord actually fires, so the same physical gesture cannot open the page twice.

`internal-logs/` is in `.gitignore`; `internal-logs/secret-shortcut.js` is un-ignored so the shortcut works in production.

## File map

- `internal-logs/ilogs-ws.md` — this file. Source of truth for both the public Notion content (above) and the internal reference (below).
- `internal-logs/secret-shortcut.js` — the chord handler. Has one editable constant at the top: `ACKNOWLEDGED_LOGS_URL`. Replace that string and redeploy to repoint the page.
- `wisprstories.html`, `about.html`, `language-stats.html` — each includes `<script src="internal-logs/secret-shortcut.js" defer></script>` near the existing script tags.
- `.gitignore` — ignores `internal-logs/` and then un-ignores `internal-logs/secret-shortcut.js`.

## Maintenance checklist

When the public content above changes:

1. Update `internal-logs/ilogs-ws.md` first. This file is the source of truth.
2. Update the Notion page to mirror the `MIRROR TO NOTION` block. Do not publish the `INTERNAL ONLY` block.
3. If the Notion page URL changed, edit `ACKNOWLEDGED_LOGS_URL` in `internal-logs/secret-shortcut.js` and redeploy.
4. Bump the version in `wisprstories.js` (line 1), `CHANGELOG.md`, `VERSION_HISTORY.md`, and `AGENTS.md` (top line and `Key files` section). All four should match.
5. Update the "Last updated" line at the top of this file.

## Non-public findings (do not mirror)

These are real findings from the codebase audit that informed the public list above. They are recorded here so the team has a paper trail and so the public list can be regenerated from a verified source.

### A. Confirmed by spot-check (referenced in the public list)

- **A1, A2 — Untranslated strings and mojibake.** Spot-checked all 11 locale files. Ten of them have keys that fall back to English or contain characters that are not rendered correctly on some devices. `en.json` is the only fully reviewed locale. (Source: `assets/i18n/en.json` plus 10 other locale files.)
- **A3 — Voice lost on PNG download.** Spot-checked `wisprstories.js` share and download handlers; the PNG path generates an image only, and the WebM path is the only one that includes the audio track.
- **A4, A5 — WebM downloads on Mac/iPhone.** WebM is the format produced by the browser when the canvas is recorded. Apple's platforms do not include a WebM decoder in QuickTime or the iOS Photos app.
- ~~**A6 — iOS Copy image goes to Files.** Spot-checked the share/download path; the app uses the standard browser "copy image" mechanism, which on iOS hands the file to the Files app.~~ *Removed 2026-06-04: A6 was the basis for public Issue 2 ("On iPhone, Copy image saves to Files app, not to Photos"), which was struck from the public list because the behavior is iOS platform behavior, not a Wibe Stories issue. The technical observation stands for the team but is not an app-level issue.*
- **A8, B3 — Voice can silently fail on share link upload.** Spot-checked the share upload flow; the success callback is fired on image upload, with the voice upload running in parallel as a fire-and-forget with no retry.
- **A9 — Firefox has no Web Speech API support.** Confirmed by the Mozilla developer documentation and by the absence of any speech-recognition code path that does not use it.

### B. Internal-only (not on the public list)

- **Counter stuck at 5/5 on Vercel** — the user is still investigating this in a separate session. Do not mirror until confirmed resolved.
- **`ffNotice` i18n key** — was in 11 locale files but the only caller (`showNotice("firefox")`) is no longer invoked from the codebase. The key has been removed from all 11 locales as part of v0.11.0.0.
- **Apple disclaimer placement** — the public list above leads with a note that Apple-platform behavior is not first-hand tested. This is not a finding; it is a transparency choice. Keep it on the page.
- **Hinglish (Hindi + English code-switching) STT** — Deepgram Nova-3 supports `language=multi` for code-switching, but only for 10 languages: English, Spanish, French, German, Hindi, Italian, Japanese, Dutch, Russian, Portuguese. Languages outside this set (Tamil, Telugu, Kannada, etc.) cannot participate in code-switching. Web Speech API fallback uses single Hindi locale (`hi-IN`) and does not support code-switching. Card font rendering for mixed Devanagari+Latin already works via `splitByScript()` + `applyScriptFonts()` in `global/fonts.js`.

### C. Other findings the audit turned up (not yet triaged for the public list)

These are code-quality and edge-case findings from the audit pass. They are recorded for the team but are not on the public list because either (a) they are too small to mention, (b) they are speculative and we want to verify first, or (c) they are not user-facing.

- The `record.ended` i18n key in 10 non-English locales is an English fallback pending re-translation.
- The build banner version in `wisprstories.js:1` now auto-updates from `version.json` (no longer manual).
- The CHANGELOG and VERSION_HISTORY files are maintained in parallel and have a known history of drifting. The "v0.11.0.1" entry in both files should be reviewed before publish.
- The footer em dash is intentionally preserved per a user request that predates this release.

## Version

- Wibe Stories: v0.11.0.4 (2026-06-04). Build banner: v0.11.0.4. v0.11.0.3 was the Windows menu-activation fix; v0.11.0.2 was a separate "i18n `{max}` placeholder fix" patch; v0.11.0.1 is the version when this file was last updated for public content.
- This file: created 2026-06-04; updated 2026-06-04 with Limitation 8 + Notion URL + introduction/footer additions + content revision (public Issue list 5 → 4)
- Notion page: live at `https://wisprstories.notion.site/wisprstories-ackologs`; URL constant in `internal-logs/secret-shortcut.js` is set. Live page still has 5 issues; needs re-mirror after this revision.
- v0.11.0.4 changes (deployment path fix, this file untouched): `wisprstories.html`, `about.html`, `language-stats.html` — script tags changed from relative `internal-logs/secret-shortcut.js` to absolute `/internal-logs/secret-shortcut.js` so the chord loads on all pages (clean URLs `/`, `/about`, `/language-stats`).
- v0.11.0.3 changes (chord-handler fix, this file untouched): `internal-logs/secret-shortcut.js` — added `e.preventDefault()` on W/S keydown when Alt+Shift held, so Windows does not activate the Window/Tools menu and steal focus from the page before the chord completes. Added two `console.debug` lines: one on script init (proves the handler loaded) and one on chord fire (proves the chord was recognized).

<!-- INTERNAL ONLY: END -->
