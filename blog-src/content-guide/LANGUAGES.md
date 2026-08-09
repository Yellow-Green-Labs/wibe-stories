# Languages — Wibe & Wonder

## Locale table

| Code | Path prefix | `lang` front matter | Font |
| --- | --- | --- | --- |
| (none) | `/blog/posts/…` | `en-US` | DM Sans |
| `th` | `/blog/th/posts/…` | `th-TH` | Noto Sans Thai |
| `ko` | `/blog/ko/posts/…` | `ko-KR` | Noto Sans KR |
| `ja` | `/blog/ja/posts/…` | `ja-JP` | Noto Sans JP |
| `es` | `/blog/es/posts/…` | `es-ES` | DM Sans |
| `it` | `/blog/it/posts/…` | `it-IT` | DM Sans |
| `tl` | `/blog/tl/posts/…` | `fil-PH` | DM Sans |
| `tr` | `/blog/tr/posts/…` | `tr-TR` | DM Sans |
| `sv` | `/blog/sv/posts/…` | `sv-SE` | DM Sans |

## Writing rules

- **Multilingual articles are written directly in the target language** —
  never translated from English. The Strategist's English brief is the input;
  the language agent writes the article in the target language from scratch.
- **English companions** — each multilingual article gets one at
  `<lang>/posts/<slug>-en.md`, transcreated by "Quill" as a separate pass.
  The companion is NOT the source of the original-language article, but it IS
  the source for all platform distribution content (Substack, dev.to, social).
- **Dates** — the multilingual original and its English companion share the
  SAME `date` (the day the article is approved).
- **Filename = destination path** in the articles repository:
  `posts/<slug>.md` (English), `<lang>/posts/<slug>.md` (originals),
  `<lang>/posts/<slug>-en.md` (companions).
- **SEO** — sitemap and search indexing cover originals only; `-en`
  companions are excluded by `scripts/gen-sitemap.mjs`. They exist for
  distribution, not for search.
- **Never write** "native speakers" — say "careful readers".
