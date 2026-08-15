// Generates blog sitemap.xml from the SOURCE tree (blog-src/*.md), not the
// built dist. Lists home pages + category pages only — post (article) pages
// are excluded while content is placeholder (set INCLUDE_POSTS to true when
// real articles ship). Every home and category exists in all 9 locales, so
// each URL carries hreflang alternates (x-default -> English).
// Priorities: root 1.0, locale homes 0.9, categories 0.7.
import { readdirSync, writeFileSync, statSync, readFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const src = resolve(root, 'blog-src')
const dist = resolve(src, '.vitepress/dist')
const base = '/blog/'
const now = new Date().toISOString().slice(0, 10)
const APP = 'https://wibestories.vercel.app'

const INCLUDE_POSTS = false
const LOCALES = ['th', 'ko', 'ja', 'es', 'it', 'tl', 'tr', 'sv']
const ALL_LOCALES = ['en', ...LOCALES]

function collect(dir, relPrefix, out) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry)
    if (statSync(p).isDirectory()) {
      collect(p, relPrefix ? `${relPrefix}/${entry}` : entry, out)
    } else if (entry.endsWith('.md')) {
      out.push(relPrefix ? `${relPrefix}/${entry}` : entry)
    }
  }
  return out
}

function pageDate(file) {
  const m = readFileSync(file, 'utf8').match(/^date:\s*(\d{4}-\d{2}-\d{2})/m)
  return m ? m[1] : now
}

// pageRel: 'index' | 'categories/wibes-news' | 'posts/<slug>' (locale-free)
const pageRels = new Set()
for (const rel of collect(src, '', [])) {
  const relNoExt = rel.replace(/\.md$/, '')
  if (/^index$/.test(relNoExt) || /\/index$/.test(relNoExt)) { pageRels.add('index'); continue }
  if (/^categories\/.+$/.test(relNoExt) || /\/categories\/.+$/.test(relNoExt)) {
    pageRels.add(relNoExt.replace(/^.*\/categories\//, 'categories/'))
    continue
  }
  if (INCLUDE_POSTS && (/^posts\/.+$/.test(relNoExt) || /\/posts\/.+$/.test(relNoExt))) {
    pageRels.add(relNoExt.replace(/^.*\/posts\//, 'posts/'))
  }
}

function srcFile(locale, pageRel) {
  const f = pageRel === 'index' ? 'index.md' : `${pageRel}.md`
  return locale === 'en' ? join(src, f) : join(src, locale, f)
}

function locFor(locale, pageRel) {
  const core = pageRel === 'index' ? '' : `${pageRel}/`
  return base + (locale === 'en' ? '' : `${locale}/`) + core
}

const urls = []
for (const pageRel of pageRels) {
  for (const locale of ALL_LOCALES) {
    if (!existsSync(srcFile(locale, pageRel))) continue
    const loc = locFor(locale, pageRel)
    const alternates = ALL_LOCALES
      .filter(l => existsSync(srcFile(l, pageRel)))
      .map(l => `<xhtml:link rel="alternate" hreflang="${l}" href="${APP}${locFor(l, pageRel)}"/>`)
      .join('\n    ')
    const priority = pageRel === 'index' ? (locale === 'en' ? 1.0 : 0.9) : 0.7
    urls.push(`  <url>
    <loc>${APP}${loc}</loc>
    <lastmod>${pageDate(srcFile(locale, pageRel))}</lastmod>
    <priority>${priority}</priority>
    ${alternates}
    <xhtml:link rel="alternate" hreflang="x-default" href="${APP}${locFor('en', pageRel)}"/>
  </url>`)
  }
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`
mkdirSync(dist, { recursive: true })
writeFileSync(join(dist, 'sitemap.xml'), xml)
console.log(`[gen-sitemap] Wrote ${urls.length} URLs to blog sitemap.xml.`)
