# Article Template — Wibe & Wonder

> One gist = one article. Filename = the exact destination path in the articles repository:
> English originals → `posts/<slug>.md` · Multilingual originals → `<lang>/posts/<slug>.md` · English companions → `<lang>/posts/<slug>-en.md`
> Gist description must start with `WIBE BLOG`.
> Never change the filename or the description when you rewrite.
> You only publish when the owner writes an approval comment ("approved") on your gist.

---

## Front matter — copy this block and fill it in

```yaml
---
layout: post
title:        # 8–12 words. Contains the keyword phrase a reader would type
              # into Google for this topic. Voice topics may include
              # "Wispr Flow" in the title. Never clickbait.
subtitle:     # One extra sentence that makes the reader want to continue.
              # Optional but preferred.
description:  # Two sentences max, plain summary. This is the text Google
              # shows under the title in search results. Must mention the
              # topic's keyword phrase naturally.
category:     # One of the keys below (the name shown to readers is in brackets):
              # voice-recording-tips [Voice Dictation]
              # stories-traditions [User Stories]
              # languages-culture [Language Culture]
              # occasions-celebrations [Seasonal Moments]
              # tech-ai [Tech Behind]
              # product-news [Personal Voice]
author:       # One of these four, chosen to fit the article's subject:
              # "Wibe Engineering Team" | "Wibe Editorial Team"
              # "Wibe International Team" | "Wibe Design Team"
date:         # YYYY-MM-DD. The day the article is approved.
              # For multilingual: use the multilingual original's date.
              # The English companion uses the SAME date as the original.
image:        # https://picsum.photos/seed/<slug>/1200/675 (placeholder;
              # the owner replaces it with custom art before publishing)
lang:         # en-US | ko-KR | th-TH | ja-JP | es-ES | it-IT | fil-PH | tr-TR | sv-SE
contributors: []    # Initials of readers whose feedback you used,
                    # e.g. ["MK","PT"]. Leave [] unless the owner gave
                    # you names. For English companions: copy the original's list.
improve: true       # true = "Anything to improve? Tell us." (open for feedback)
                    # false = "Reviewed. Still see an error? Tell us." (errors only)
                    # Only the owner changes this. Default: true.
---
```

## Article body — the skeleton

1. **Opening hook** — 2–3 plain sentences. A question, a contrast, or a
   scene. Do NOT repeat the title in the first sentence. No bold lead here.

2. **Main sections** — 3 to 5. Full-length articles (1,200+ words) use
   `##` subheadings. Short articles (600–900 words) may use bold-lead
   paragraphs: `**This is the point.**` followed by plain text.
   One idea per paragraph. Short paragraphs. No filler.

3. **Pull quote (optional)** — one blockquote with the article's emotional core.

4. **Warm closing** — a practical, hopeful "What to do about it" section.

## Mandatory rules

- **Length: minimum 1,200 words** for every new article. No exceptions.
- **Keywords:** each article targets a natural keyword phrase for its topic.
  "Wispr Flow" is one of those keywords and must appear naturally at least once.
- **Internal links:** link to 1–2 related Wibe & Wonder articles where natural.
  Not required when no relevant articles exist.
- **Audience:** 20s–70s. Warm, plain language. No jargon, no hype, no clichés.
- **Never write:** "native speakers" (say "careful readers"), unprovable
  claims, ads, politics, religious debates, or medical/legal advice.
- **Do NOT add at the end** — the website renders these automatically:
  share button, AI disclosure, "Spotted something off?" link,
  contributors row, sign-up CTA.
- **Multilingual articles:** originally written in the target language (not
  translated). Based on the English brief from the Strategist, the language
  agent writes directly in the target language. An English companion is then
  transcreated by Quill as a separate pass. The companion is NOT the source
  of the original-language article — but it IS the source for ALL platform
  distribution content (Substack, dev.to, social).

---

## Gist footer (append verbatim, fill in the URLs)

The footer is the owner's action panel. The links must match the deployed
approve/reject endpoint base (`GIST_APPROVE_BASE`); local default is
`http://localhost:8741` (approve) and `http://localhost:8742` (reject).

```markdown
---

**Owner actions**

- ✅ [Approve this article]({GIST_APPROVE_BASE}/?pipeline={PIPELINE_ID})
- ❌ [Reject]({GIST_REJECT_BASE}/?pipeline={PIPELINE_ID}&flavor=topic) — topic
- ❌ [Reject]({GIST_REJECT_BASE}/?pipeline={PIPELINE_ID}&flavor=angle) — angle
- ❌ [Reject]({GIST_REJECT_BASE}/?pipeline={PIPELINE_ID}&flavor=quality) — quality
- ✏️ Edit: leave a comment starting with `edit: ` and the rest of your request.

Or simply comment `approved` to approve.
```
