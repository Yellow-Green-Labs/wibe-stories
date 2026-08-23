import { defineConfig } from 'vitepress'
import { fileURLToPath } from 'url'
import { existsSync, readFileSync } from 'node:fs'
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
const publicDir = fileURLToPath(new URL('./public', import.meta.url))

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
  const clean = rel.replace(/(^|\/)index$/, '')
  return APP_URL + BASE + (clean ? clean + '/' : '')
}

function localeOf(rel, frontmatterLang) {
  if (frontmatterLang && LOCALES.some((l) => l.lang === frontmatterLang)) {
    return LOCALES.find((l) => l.lang === frontmatterLang).code
  }
  const seg = rel.split('/')[0]
  return LOCALES.some((l) => l.code === seg) ? seg : ''
}

// Strip the locale prefix from a rel path and collapse the locale homepage
// to ''. E.g. 'th/index' -> '', 'th/posts/x' -> 'posts/x', 'index' -> '',
// 'posts/x' -> 'posts/x'. Used for canonical/alternate URL construction.
function coreOf(rel, locale) {
  let core = rel
  if (locale && core.startsWith(locale + '/')) core = core.slice(locale.length + 1)
  return core === 'index' ? '' : core
}

// Rough word count of the markdown body (frontmatter stripped, links/images
// reduced to their visible text). Used for the JSON-LD wordCount field.
function wordCountOf(filePath) {
  try {
    const body = readFileSync(filePath, 'utf8')
      .replace(/^---[\s\S]*?---\s*/, '')
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/[#*_`>~]/g, ' ')
    return body.trim().split(/\s+/).filter(Boolean).length
  } catch {
    return 0
  }
}

export default defineConfig({
  title: 'Wibe & Wonder',
  description: 'The Wibe Stories publication — stories, tips and culture from the Wibe team.',
  base: BASE,
  lang: 'en-US',
  cleanUrls: true,
  appearance: false,
  srcExclude: ['content-guide/**'],
  markdown: {
    anchor: { permalink: false, level: [2, 3] },
  },
  vite: {
    publicDir: fileURLToPath(new URL('./public', import.meta.url)),
    plugins: [
      {
        name: 'root-favicon-redirect',
        configureServer(server) {
          server.middlewares.use('/favicon.ico', (req, res, next) => {
            res.statusCode = 302
            res.setHeader('Location', '/blog/favicon.ico')
            res.end()
          })
        },
      },
    ],
  },
  head: [
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { href: 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Noto+Sans+KR:wght@400;500;700&family=Noto+Sans+JP:wght@400;500;700&family=Noto+Sans+Thai:wght@400;500;700&display=swap', rel: 'stylesheet' }],
    ['link', { href: 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&display=swap', rel: 'stylesheet' }],
    ['link', { rel: 'stylesheet', href: '/blog/assets/fontawesome/css/fontawesome.min.css' }],
    ['link', { rel: 'stylesheet', href: '/blog/assets/fontawesome/css/solid.min.css' }],
    ['link', { rel: 'stylesheet', href: '/blog/assets/fontawesome/css/regular.min.css' }],
    ['link', { rel: 'stylesheet', href: '/blog/assets/fontawesome/css/brands.min.css' }],
    ['link', { rel: 'icon', href: '/blog/ws-l-b.ico' }],
    ['script', { type: 'speculationrules' }, JSON.stringify({
      prefetch: [{ source: 'document', where: { and: [{ href_matches: '/blog/**' }] }, eagerness: 'moderate' }],
    })],
  ],
  async transformHtml(code, id, ctx) {
    const data = ctx && ctx.pageData
    if (!data) return code
    const rel = data.relativePath ? relOf(data.relativePath) : relFromId(id)
    if (!rel || rel === '404') return code
    const locale = localeOf(rel, data.frontmatter && data.frontmatter.lang)
    const langEntry = LOCALES.find((l) => l.code === locale) || LOCALES[0]
    const core = coreOf(rel, locale)
    const url = pathToUrl((locale ? locale + '/' : '') + (core || 'index'))

    let title = (data.frontmatter && data.frontmatter.title) || ''
    let description = (data.frontmatter && data.frontmatter.description) || ''
    const layout = (data.frontmatter && data.frontmatter.layout) || ''
    const date = (data.frontmatter && data.frontmatter.date) || ''
    const image = (data.frontmatter && data.frontmatter.image) || ''

    const ogRel = 'assets/og/' + rel + '.png'
    const ogImage = existsSync(join(publicDir, ogRel))
      ? APP_URL + BASE + ogRel
      : APP_URL + BASE.replace(/\/$/, '') + '/assets/blog-fallback.webp'

    let alternates = ''
    for (const l of LOCALES) {
      if (l.code && l.code === locale) continue
      const cand = (l.code ? l.code + '/' : '') + (core || 'index')
      const file = join(srcDir, cand + '.md')
      if (existsSync(file)) {
        const href = pathToUrl(cand)
        alternates += `\n    <link rel="alternate" hreflang="${l.code || 'x-default'}" href="${esc(href)}">`
      }
    }

    let jsonLd = ''
    if (layout === 'post' && title) {
      const author = (data.frontmatter && data.frontmatter.author) || ''
      const postFile = join(srcDir, rel + '.md')
      const wordCount = existsSync(postFile) ? wordCountOf(postFile) : 0
      const payload = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: title,
        description,
        image: image
          ? [image.startsWith('/') ? APP_URL + BASE.replace(/\/$/, '') + image : image]
          : [ogImage],
        datePublished: date,
        dateModified: date,
        inLanguage: langEntry.lang,
        wordCount: wordCount || undefined,
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
