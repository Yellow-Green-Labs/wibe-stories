---
title: Limitations
description: Wibe Stories usage limits — daily recording caps, Pro tier limits, card storage expiry, content moderation rules, and platform constraints.
---

# Limitations

*Last updated: Jul 17, 2026*

These are constraints we chose on purpose. They are not bugs — they are product decisions listed here so you understand what we have prioritized.

### No user accounts

Wibe Stories does not require a login or sign-up. You open the page and start creating cards immediately — no email, no password, no account to create.

- Your cards, settings, and preferences are tied to the browser you are using. They do not follow you across devices.
- Clearing browser data removes everything associated with that session.
- A Pro key is the way to access your stored cards from any browser. As long as you have the key, your cards are available on any device.

**Why no accounts?**

User accounts would require a server-side identity layer — authentication, password management, email verification, session tokens — that does not align with the current scope of the app. The Pro key system solves the one case where cross-device access matters without a full account system.

We may revisit this decision in the future, but have no concrete plans to build a full account system.

### Daily caps keep the service sustainable

Free tier: 5 recordings per day, 1 tone rewrite per tone per day, 15-second max recording length. Pro raises recordings to 50 per day and makes rewrites unlimited.

- **Sustainability:** Speech-to-text and tone rewrite costs both scale with usage. Caps keep infrastructure bills predictable.
- **Abuse prevention:** Scripts that create large numbers of cards per minute or scrape rewritten phrases are blocked by daily limits.
- **Pro accounts** provide a verified payment method that can be revoked if abuse is detected.
- The recording counter changes color as you approach the limit, and recordings are blocked once you reach it.

### The free tier has a shared daily capacity pool

Free users share a daily capacity pool. When the pool is reached, new users see a full-screen overlay; users already active are not affected.

- This caps the maximum daily infrastructure cost, not individual usage.
- Pro users bypass this cap entirely.
- The cap resets daily.

### Recordings are 15 seconds (free) or 30 seconds (Pro)

The limit is driven by speech-to-text costs.

- 15 seconds captures one complete thought. Longer recordings tend to contain multiple thoughts or silence.
- The recording toolbar shows a live countdown timer with the last seconds highlighted in red.
- Uploaded WAV or MP3 files run through the same transcription engine with the same length limits. Accuracy depends on file quality, background noise, and accent. Edit the text box or tap reset to try again.

### Card text is capped at 150 characters

Shorter messages make better-looking, more shareable cards.

- 150 characters fits a thoughtful sentence without overflowing the card canvas. Most example phrases fit comfortably.
- The counter turns red and the Done button disables past 150, but the text area does not block input — you can see what you would lose by shortening.
- An invisible grace zone of a few extra characters prevents cutting a final word mid-letter. The card image, transcription, and tone rewriting all use the first 150 characters.

### Shared links expire after 7 days (14 for Pro)

A cleanup process runs daily to remove expired card data.

- **Deleted:** card image, voice recording, and associated metadata.
- **Preserved:** Downloaded images are yours forever. Cards saved to the vault are exempt from cleanup.

### We do not run automated content moderation

No automated filter exists for card text or voice recordings.

- Daily caps make bulk automated abuse impractical.
- A determined user can create any content. A reporting mechanism is planned but not yet implemented.

### Cards are available in one size only

We previously offered four sizes (1:1, 9:16, 4:5, 16:9). On mobile, the wider sizes got cropped, the background illustration was cut off, and social media previews were inconsistent. After testing across multiple devices, only the square works reliably on every screen.

- This is a deliberate product decision, not a missing feature.

### Vault storage is capped at 50 cards for Pro users

Pro vault cards are stored on the server and persist across sessions. The 50-card limit protects against bulk abuse.

- Free users' vault data stays in the browser — no cap, but data is lost on browser data clear.
- The vault shows a count badge to make the limit visible. Select and delete to stay under the cap.

### Audio uploads are limited in size and format

Uploaded audio files are validated before processing.

- Accepted formats: WAV and MP3.
- Files that exceed the size limit are rejected with a clear message.

### Older Safari versions may show slightly different layouts

Older Safari versions may show tighter spacing and slightly different card aspect ratios — graceful degradations, not bugs.

---
