# Categories — Wibe & Wonder

## Display order (shown in this order in the category filter and dropdowns)

1. **Voice Dictation** — `voice-recording-tips`
2. **User Stories** — `stories-traditions`
3. **Tech Behind** — `tech-ai`
4. **Seasonal Moments** — `occasions-celebrations`
5. **Personal Voice** — `product-news`
6. **Language Culture** — `languages-culture`

## Keys → display names (all 9 locales)

The `key` is what goes in article front matter and in URLs
(`/blog/<locale>/categories/<key>/`). The displayed name is chosen by the
theme from the locale, so **never write the display name into article front
matter** — only the key.

| Key | en | th | ko | ja | es | it | tl | tr | sv |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `voice-recording-tips` | Voice Dictation | การสั่งด้วยเสียง | 음성 받아쓰기 | 音声入力 | Dictado por voz | Dettatura vocale | Pagdidikta gamit ang boses | Sesle Yazma | Röstdiktat |
| `stories-traditions` | User Stories | เรื่องราวจากผู้ใช้ | 사용자 이야기 | ユーザーの声 | Historias de usuarios | Storie degli utenti | Mga Kwento ng User | Kullanıcı Hikayeleri | Användarberättelser |
| `tech-ai` | Tech Behind | เบื้องหลังเทคโนโลยี | 기술의 뒷이야기 | 技術の舞台裏 | Detrás de la tecnología | Dietro la tecnologia | Sa Likod ng Tech | Teknolojinin Perde Arkası | Bakom tekniken |
| `occasions-celebrations` | Seasonal Moments | ช่วงเวลาแห่งเทศกาล | 계절의 순간 | 季節のひととき | Momentos de temporada | Momenti stagionali | Mga Pana-panahong Sandali | Mevsimsel Anlar | Säsongsstunder |
| `product-news` | Personal Voice | เสียงส่วนตัว | 나만의 목소리 | パーソナルボイス | Voz personal | Voce personale | Personal na Boses | Kişisel Ses | Personlig röst |
| `languages-culture` | Language Culture | ภาษาและวัฒนธรรม | 언어와 문화 | 言語と文化 | Idiomas y cultura | Lingue e cultura | Mga Wika at Kultura | Diller ve Kültür | Språk och kultur |

## Where the names live

The single source of truth is `blog-src/.vitepress/theme/i18n.js` (the
`CATEGORIES` export — order in that array is the display order). The category
page files under `blog-src/<locale>/categories/*.md` exist only so each
category has a URL; their front matter `title` is what shows in the browser
tab. When display names change: update `i18n.js` and the matching `title` in
the 54 category files, then rebuild.
