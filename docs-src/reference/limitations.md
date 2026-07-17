---
title: Limitations
---

# Limitations

*Last updated: Jul 17, 2026*

These are constraints we chose on purpose. They are not bugs — they are product decisions listed here so you understand what we have prioritized.

### Daily caps keep the service sustainable

Free tier: 5 recordings per day, 1 tone rewrite per tone per day, 15-second max recording length, 75 seconds cumulative audio per day. Pro raises recordings to 50 per day and cumulative audio to 900 seconds (15 minutes), and makes rewrites unlimited.

- **Sustainability:** STT costs per audio second and LLM rewrite costs per call both scale with usage. Caps keep infrastructure bills predictable.
- **Abuse prevention:** Scripts that create hundreds of cards per minute for SEO spam farms or scrape rewritten phrases for training datasets are blocked by daily limits.
- **Pro accounts** provide a verified payment method that can be revoked if abuse is detected.
- The counter color degrades visually: gray (0–119 used) → yellow (120–150) → red (151–160). At the cap a "5/5" toast appears and recordings are blocked.

### The free tier has a shared 99-user daily capacity pool

Free users share a 99-user-per-day pool. When the pool is reached, new users see a full-screen capacity overlay; users already active are grandfathered in.

- This caps the maximum daily infrastructure cost, not individual usage — the 99-user pool keeps the service free for everyone.
- Pro users bypass this cap entirely.
- The cap resets at midnight UTC daily.

### Recordings are 15 seconds (free) or 30 seconds (Pro)

The limit is driven by STT cost structure, which charges per audio second.

- 15 seconds captures one complete thought. Longer recordings tend to contain multiple thoughts (better as separate cards) or silence.
- The recording toolbar shows a live countdown timer with the last 3 seconds highlighted in red.
- Uploaded WAV or MP3 files (up to 6 MB) run through the same STT engine with the same length limits. Accuracy depends on file quality, background noise, and accent. Edit the text box or tap reset to try again.

### Card text is capped at 150 characters

Shorter messages make better-looking, more shareable cards.

- 150 characters fits a thoughtful sentence without overflowing the card canvas. Most stock example phrases fit comfortably.
- The counter turns red and the Done button disables past 150, but the textarea does not block input — you can see what you would lose by shortening.
- An invisible 10-character grace zone (up to 160) prevents cutting a final word like "friend" mid-letter. The card image, transcription, and tone rewriting all use the first 150 characters.

### Shared links expire after 7 days (14 for Pro)

A daily cleanup cron at midnight UTC removes expired card data.

- **Deleted:** card image (Vercel Blob), voice recording (Blob), and metadata sidecar (`meta/<id>.json`).
- **Preserved:** Downloaded images are yours forever. Cards saved to the vault are exempt from cleanup (cross-referenced against the `vault_cards` Neon table on every cleanup pass).

### We do not run automated content moderation

No automated filter exists for card text or voice recordings.

- Daily caps make bulk automated abuse impractical — a script creating 1,000 cards per minute hits the cap in seconds.
- A determined user can create any content. A reporting mechanism is planned but not yet implemented.

### Cards are available in one size only (square)

We previously offered four sizes (1:1, 9:16, 4:5, 16:9). On mobile, the wider sizes got cropped, the background illustration was cut off, and social media previews were inconsistent. After testing across multiple devices, only the square works reliably on every screen.

- This is a deliberate product decision, not a missing feature.

### Vault storage is capped at 50 cards for Pro users

Pro vault cards are stored server-side in Neon Postgres and persist across sessions. The 50-card limit protects the shared database from bulk abuse.

- Free users' vault data lives in browser localStorage — no cap, but data is lost on browser storage clear.
- The vault shows a count badge ("5/50") to make the limit visible. Select and delete to stay under the cap.

### Audio uploads are limited to 6 MB, WAV or MP3 only

Uploaded audio files are validated both client-side and server-side.

- Client validates: MIME type (`audio/wav`, `audio/mpeg`, etc.) and file extension (`.wav`, `.mp3`).
- Server validates: total size ≤ 6 MB, duration via AudioContext decode.
- Larger files or unsupported formats are rejected with a clear toast message.

### No user accounts — everything is session-based

There is no login, no sign-up, and no persistent user identity. A session ID in sessionStorage identifies you for the current browsing session.

- Your recordings, cards, and draft text reset on browser data clear.
- The Pro key (stored in localStorage) is the only persistent identifier — it unlocks vault sync across devices. Without it, everything is ephemeral.
- This is an intentional trade-off: no account friction means instant use, at the cost of cross-device state.

### Older Safari versions may show slightly different layouts

Older Safari versions may show tighter spacing and slightly different card aspect ratios — graceful degradations, not bugs.

---

