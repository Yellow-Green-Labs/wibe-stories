// Generates blog sitemap.xml from the built dist. Originals only — English
// companions (*-en.html) are excluded, as are the 404 page. Priorities:
// home 1.0, locale homes 0.9, categories 0.7, articles 0.6.
import { readdirSync, writeFileSync, statSync } from 'node:fs'
import { resolve, dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(root, 'blog-src/.vitepress/dist')
const base = '/blog/'
const now = new Date().toISOString().slice(0, 10)

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (entry.endsWith('.html')) out.push(p)
  }
  return out
}

function priority(rel) {
  if (rel === 'index') return 1.0
  if (rel.includes('/categories/')) return 0.7
  if (rel.includes('/posts/')) return 0.6
  return 0.9
}

const urls = new Map()
for (const f of walk(dist)) {
  const rel = relative(dist, f).replace(/\\/g, '/').replace(/\.html$/, '')
  if (rel === '404') continue
  const name = rel.split('/').pop() || ''
  if (name.endsWith('-en')) continue
  const loc = base + (rel === 'index' ? '' : rel) + '/'
  urls.set(loc, priority(rel))
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...urls.entries()]
  .map(([loc, pr]) => `  <url><loc>https://wibestories.vercel.app${loc}</loc><lastmod>${now}</lastmod><priority>${pr}</priority></url>`)
  .join('\n')}
</urlset>
`
writeFileSync(join(dist, 'sitemap.xml'), xml)
console.log(`[gen-sitemap] Wrote ${urls.size} URLs to blog sitemap.xml.`)
