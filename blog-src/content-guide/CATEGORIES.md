# Categories — Wibe & Wonder

## Display order (shown in this order in the category filter and dropdowns)

1. **Wibe's News** — `wibes-news`
2. **Voice Dictation** — `voice-dictation`
3. **Tech Behind** — `tech-behind`
4. **Confluence** — `confluence`
5. **User Stories** — `user-stories`
6. **Cultural Mosaic** — `cultural-mosaic`

## Keys → display names (all 9 locales)

The `key` is what goes in article front matter and in URLs
(`/blog/<locale>/categories/<key>/`). The displayed name is chosen by the
theme from the locale, so **never write the display name into article front
matter** — only the key.

**Localization rule for names:** display names ARE localized per locale (the
user's approved table below). English keeps the slug's readable words; each
other locale gets its own natural translation of the same meaning. Names
appear in many places (homepage category row, article metadata, category page
title), and the same localized name is used everywhere. The single source of
truth is the `CATEGORIES` export in `blog-src/.vitepress/theme/i18n.js`; the
48 category files under `blog-src/<locale>/categories/*.md` carry the same
localized name in their frontmatter `title` (browser tab).

| Key | en | th | ko | ja | es | it | tl | tr | sv |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `wibes-news` | Wibe's News | ข่าวของ Wibe | Wibe 소식 | Wibe ニュース | Noticias de Wibe | Novità di Wibe | Balita sa Wibe | Wibe'den Haberler | Wibe-nyheter |
| `voice-dictation` | Voice Dictation | พิมพ์ด้วยเสียง | 음성 받아쓰기 | 音声入力 | Dictado por voz | Dettatura vocale | Pagdidikta ng Boses | Sesli Dikte | Röstdiktering |
| `tech-behind` | Tech Behind | เบื้องหลังเทคโนโลยี | 기술 비하인드 | 技術の裏側 | Detrás de la tecnología | Dietro la tecnologia | Likod ng Teknolohiya | Teknolojinin Ardında | Tekniken Bakom |
| `confluence` | Confluence | การเชื่อมโยง | 연결 | つながり | Conexiones | Connessioni | Koneksyon | Bağlantılar | Kopplingar |
| `user-stories` | User Stories | เรื่องราวผู้ใช้ | 사용자 이야기 | ユーザーストーリー | Historias de usuarios | Storie degli utenti | Mga Kuwento ng Gumagamit | Kullanıcı Hikayeleri | Användarberättelser |
| `cultural-mosaic` | Cultural Mosaic | วัฒนธรรมโลก | 세계 문화 | 世界の文化 | Culturas del mundo | Culture del mondo | Mga Kultura ng Mundo | Dünya Kültürleri | Världskulturer |

**Localization rule for descriptions:** each locale's category page shows its
own translated description (visible only on that page). A translation must
back-translate to the exact same meaning and intention as the English
one-liner — words may change, the meaning must not.

The descriptions below are the user's FINAL copy — they are also what readers
see on each category page (the frontmatter `description` in the 54 category
files, translated per locale). Treat them as canonical: do not rewrite or
"improve" them.

| Key | English name | One-liner (canonical, user-specified) |
| --- | --- | --- |
| `wibes-news` | Wibe's News | What's new in Wibe Stories — guides, features, and product updates. |
| `voice-dictation` | Voice Dictation | Recording, dictation, and voice tips — speak instead of typing. |
| `tech-behind` | Tech Behind | The engineering and AI that power Wibe Stories. |
| `confluence` | Confluence | Bringing together unexpected ideas, words, images, and inspirations to discover meaningful connections. |
| `user-stories` | User Stories | Real people, real memories — how the app fits into life. |
| `cultural-mosaic` | Cultural Mosaic | Exploring the languages, traditions, celebrations, and cultural beauty that make our world wonderfully diverse. |

## Where the names live

The single source of truth is `blog-src/.vitepress/theme/i18n.js` (the
`CATEGORIES` export — order in that array is the display order). The category
page files under `blog-src/<locale>/categories/*.md` exist only so each
category has a URL; their front matter `title` (localized name, browser tab)
and `description` (localized one-liner) show in the browser tab and on the
page. When display names change: update `i18n.js` and the matching `title` in
the 48 non-English category files, then rebuild.