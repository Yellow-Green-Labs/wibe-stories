import { defineConfig } from 'vitepress'
import { fileURLToPath } from 'url'
import { existsSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'

const APP_URL = 'https://wibestories.vercel.app'
const BASE = '/blog/'

const LOCALES = [
  { code: '', lang: 'en-US', ogLocale: 'en_US' },
  { code: 'th', lang: 'th-TH', ogLocale: 'th_TH' },
  { code: 'ko', lang: 'ko-KR', ogLocale: 'ko_KR' },
  { code: 'ja', lang: 'ja-JP', ogLocale: 'ja_JP' },
  { code: 'es', lang: 'es-ES', ogLocale: 'es_ES' },
  { code: 'it', lang: 'it-IT', ogLocale: 'it_IT' },
  { code: 'tl', lang: 'fil-PH', ogLocale: 'fil_PH' },
  { code: 'tr', lang: 'tr-TR', ogLocale: 'tr_TR' },
  { code: 'sv', lang: 'sv-SE', ogLocale: 'sv_SE' },
]

const srcDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function relOf(relativePath) {
  return relativePath.replace(/\.md$/, '')
}

// Category pages (layout: category) and the 404 page reach transformHtml
// without ctx.page.relativePath; derive the rel from the rendered output id
// (.vitepress/dist/<rel>.html) instead.
function relFromId(id) {
  const m = /\.vitepress[\\/]dist[\\/](.+?)\.html$/.exec(id)
  return m ? m[1].replace(/\\/g, '/') : ''
}

function pathToUrl(rel) {
  const clean = rel.replace(/\/index$/, '')
  return APP_URL + BASE + (clean ? clean + '/' : '')
}

function localeOf(rel, frontmatterLang) {
  if (frontmatterLang && LOCALES.some((l) => l.lang === frontmatterLang)) {
    return LOCALES.find((l) => l.lang === frontmatterLang).code
  }
  const seg = rel.split('/')[0]
  return LOCALES.some((l) => l.code === seg) ? seg : ''
}

export default defineConfig({
  title: 'Wibe & Wonder',
  description: 'The Wibe Stories publication — stories, tips and culture from the Wibe team.',
  base: BASE,
  lang: 'en-US',
  cleanUrls: true,
  appearance: false,
  srcExclude: ['content-guide/**'],
  vite: {
    publicDir: fileURLToPath(new URL('./public', import.meta.url)),
  },
  head: [
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { href: 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Noto+Sans+KR:wght@400;500;700&family=Noto+Sans+JP:wght@400;500;700&family=Noto+Sans+Thai:wght@400;500;700&display=swap', rel: 'stylesheet' }],
    ['link', { rel: 'stylesheet', href: '/blog/assets/fontawesome/css/fontawesome.min.css' }],
    ['link', { rel: 'stylesheet', href: '/blog/assets/fontawesome/css/solid.min.css' }],
    ['link', { rel: 'icon', href: '/blog/ws-l-b.ico' }],
  ],
  async transformHtml(code, id, ctx) {
    const page = ctx && ctx.page
    if (!page) return code
    const rel = page.relativePath ? relOf(page.relativePath) : relFromId(id)
    if (!rel || rel === '404') return code
    const locale = localeOf(rel, page.frontmatter && page.frontmatter.lang)
    const langEntry = LOCALES.find((l) => l.code === locale) || LOCALES[0]
    const url = pathToUrl(rel)

    let title = (page.frontmatter && page.frontmatter.title) || ''
    let description = (page.frontmatter && page.frontmatter.description) || ''
    const layout = (page.frontmatter && page.frontmatter.layout) || ''
    const date = (page.frontmatter && page.frontmatter.date) || ''
    const image = (page.frontmatter && page.frontmatter.image) || ''

    const ogImage = APP_URL + BASE + 'assets/og/' + rel + '.png'

    let alternates = ''
    for (const l of LOCALES) {
      const cand = (l.code ? l.code + '/' : '') + rel
      const file = join(srcDir, cand + '.md')
      if (existsSync(file)) {
        const href = pathToUrl(cand)
        alternates += `\n    <link rel="alternate" hreflang="${l.code || 'x-default'}" href="${esc(href)}">`
      }
    }

    let jsonLd = ''
    if (layout === 'post' && title) {
      const author = (page.frontmatter && page.frontmatter.author) || ''
      const payload = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: title,
        description,
        image: image ? [image] : [ogImage],
        datePublished: date,
        dateModified: date,
        author: { '@type': 'Organization', name: author || 'Wibe & Wonder' },
        publisher: { '@type': 'Organization', name: 'Wibe & Wonder' },
        mainEntityOfPage: url,
      }
      jsonLd = '\n  <script type="application/ld+json">' + JSON.stringify(payload).replace(/</g, '\\u003c') + '</script>'
    }

    const tags =
      '\n    <link rel="canonical" href="' + esc(url) + '">' +
      '\n    <meta property="og:type" content="' + (layout === 'post' ? 'article' : 'website') + '">' +
      '\n    <meta property="og:site_name" content="Wibe & Wonder">' +
      '\n    <meta property="og:title" content="' + esc(title) + '">' +
      '\n    <meta property="og:description" content="' + esc(description) + '">' +
      '\n    <meta property="og:url" content="' + esc(url) + '">' +
      '\n    <meta property="og:image" content="' + esc(ogImage) + '">' +
      '\n    <meta property="og:image:width" content="1200">' +
      '\n    <meta property="og:image:height" content="630">' +
      '\n    <meta property="og:image:alt" content="' + esc(title) + '">' +
      '\n    <meta property="og:locale" content="' + langEntry.ogLocale + '">' +
      '\n    <meta name="twitter:card" content="summary_large_image">' +
      '\n    <meta name="twitter:title" content="' + esc(title) + '">' +
      '\n    <meta name="twitter:description" content="' + esc(description) + '">' +
      '\n    <meta name="twitter:image" content="' + esc(ogImage) + '">' +
      (layout === 'post' && date
        ? '\n    <meta property="article:published_time" content="' + esc(date) + '">'
        : '') +
      alternates +
      jsonLd

    return code
      .replace(/<html[^>]*>/, '<html lang="' + langEntry.lang + '" dir="ltr">')
      .replace('</head>', tags + '\n  </head>')
  },
})
