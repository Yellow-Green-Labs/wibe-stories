# Article Template — Wibe & Wonder

> **Where to save your file:**
> English article → `posts/<slug>.md`
> Article in another language → `<lang>/posts/<slug>.md` (e.g. `th/posts/my-article.md`)
> English companion for another language → `<lang>/posts/<slug>-en.md`

---

## Front matter — copy this block and fill in every field

```yaml
---
layout: post          # always "post"
title:                # 8–12 words. The exact phrase someone would type into Google.
                      # Example: "How to Record Clear Voice Messages in Thai"
subtitle:             # Optional. One sentence that makes people keep reading.
description:          # REQUIRED. 2 sentences. This shows under the title in Google.
                      # Example: "Tips for recording clear voice messages with your
                      # phone. Works in any language, any room."
category:             # REQUIRED. One of these keys:
                      # wibes-news | voice-dictation | tech-behind | confluence |
                      # user-stories | cultural-mosaic
author:               # REQUIRED. One of these four:
                      # Wibe Engineering Team | Wibe Editorial Team |
                      # Wibe International Team | Wibe Design Team
date:                 # REQUIRED. The day the article is approved. YYYY-MM-DD
image:                # Placeholder. Owner replaces before publishing:
                      # https://picsum.photos/seed/your-article-name/1200/675
lang:                 # REQUIRED. The language of the article:
                      # en-US | ko-KR | th-TH | ja-JP | es-ES | it-IT | fil-PH | tr-TR | sv-SE
ps:                   # REQUIRED. A short P.S. after the article. 1–2 sentences.
                      # Warm, practical, in the article's own language.
                      # The site shows this automatically — don't write P.S. in the body.
contributors: []      # Leave empty unless owner gives you initials.
improve: true         # OWNER ONLY. true = open for feedback. false = errors only.
---
```

## Article body — copy this structure and fill in

```markdown
[Open with a question, a contrast, or a short scene. NOT the title repeated.
2–3 sentences.]

## [First point — what the reader learns]

Explain the idea in 2–3 short paragraphs. One thought per paragraph.
Use real examples from the reader's language or culture.

## [Second point — new heading]

Same pattern. Another idea, its own paragraphs. If this is a Thai article,
write about Thai-specific details. If Korean, Korean-specific details.

## [Third point — new heading]

Another idea. Short paragraphs. Plain language. No jargon.
The reader is 20s–70s.

## What to do next

One practical, specific thing the reader can do after reading this.
Not "start using voice" — more like "open the app and record one
message to someone you care about."
```

## Rules

- **Minimum 1,200 words.** Every article.
- **Use "Wispr Flow" naturally** at least once.
- **Link to 1–2 related articles** when they exist.
- **Plain language.** No jargon, no hype, no clichés.
- **Never write:** "native speakers" (say "careful readers"), ads, politics, religious debates, medical or legal advice.
- **Don't add these at the end** — the site renders them automatically:
  signature, share buttons, "Spotted something off?" link, contributors row.
