// Generates the 1200x630 OG share images for every blog page into
// blog-src/.vitepress/public/assets/og/<rel>.png, where <rel> matches the
// `relOf(relativePath)` used by config.js transformHtml (e.g. index.png,
// th/index.png, posts/foo.png, categories/wibes-news.png).
//
// Layout: dark #111111 canvas; amber "WIBE & WONDER" brand row at top; the
// page title wrapped and centered in the central 1200x475 WhatsApp-safe band;
// small site URL at the bottom.
//
// Fonts: per-locale stacks so Thai (Leelawadee UI/Tahoma), Korean (Malgun
// Gothic), Japanese (Yu Gothic UI/Meiryo) and Latin render with real glyphs
// when run locally on Windows. On Vercel (Linux) the prebuilt PNGs are
// committed, so the build only copies them; regenerating on Linux could
// produce tofu for CJK/Thai unless Noto fonts are installed.
import { readdirSync, readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { join, resolve, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const srcRoot = join(root, 'blog-src')
const outRoot = join(srcRoot, '.vitepress', 'public', 'assets', 'og')

const W = 1200
const H = 630
const CONTENT_MAX = 1100

const FONTS = {
  th: '"Leelawadee UI", Tahoma, "Segoe UI", sans-serif',
  ko: '"Malgun Gothic", "Segoe UI", sans-serif',
  ja: '"Yu Gothic UI", Meiryo, "Segoe UI", sans-serif',
  default: '"Segoe UI", "Microsoft YaHei", "Malgun Gothic", "Yu Gothic UI", Arial, sans-serif',
}

function scriptOf(lang) {
  if (/^th\b/i.test(lang || '')) return 'th'
  if (/^ko\b/i.test(lang || '')) return 'ko'
  if (/^ja\b/i.test(lang || '')) return 'ja'
  return 'default'
}

function escXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function parseFrontmatter(file) {
  const text = readFileSync(file, 'utf8')
  const m = text.match(/^---\n([\s\S]*?)\n---/)
  if (!m) return {}
  const fm = {}
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|(.*))$/)
    if (!kv) continue
    fm[kv[1]] = (kv[2] ?? kv[3] ?? kv[4] ?? '').trim()
  }
  return fm
}

// char width in px relative to font size
function charW(ch, cjk) {
  if (cjk) return 1
  if (/\s/.test(ch)) return 0.32
  return 0.55
}

function wrap(title, size, cjk) {
  const limit = CONTENT_MAX / size
  const lines = []
  const tokens = title.split(/(\s+)/)
  let cur = ''
  let curW = 0
  const push = (w) => {
    if (curW + charW(w[0], cjk) * w.length > limit && cur) {
      lines.push(cur)
      cur = ''
      curW = 0
    }
    // hard-break any single token that alone exceeds the limit (long CJK runs)
    let remaining = w
    while (remaining && charW(remaining[0], cjk) * remaining.length > limit) {
      let take = Math.floor(limit / charW(remaining[0], cjk))
      if (take < 1) take = 1
      if (cur) {
        lines.push(cur)
        cur = ''
        curW = 0
      }
      cur = remaining.slice(0, take)
      lines.push(cur)
      remaining = remaining.slice(take)
      cur = ''
      curW = 0
    }
    if (remaining) {
      cur += remaining
      curW += charW(remaining[0], cjk) * remaining.length
    }
  }
  for (const t of tokens) push(t)
  if (cur) lines.push(cur)
  return lines.filter((l) => l.trim().length > 0)
}

function buildSvg({ title, brand, url, fontFamily, cjk }) {
  let size = 64
  let lines = wrap(title, size, cjk)
  if (lines.length > 2) {
    size = 52
    lines = wrap(title, size, cjk)
  }
  if (lines.length > 3) {
    size = 42
    lines = wrap(title, size, cjk)
  }
  const lineH = Math.round(size * 1.32)
  const blockH = lines.length * lineH
  let top = Math.round((H - blockH) / 2) + 30 // bias down slightly to sit under brand
  const tspans = lines
    .map((l, i) => {
      const y = top + (i + 0.5) * lineH
      return `      <tspan x="600" y="${y}">${escXml(l.trim())}</tspan>`
    })
    .join('\n')
  const ruleY = top + lines.length * lineH + 34
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#111111"/>
  <text x="600" y="96" text-anchor="middle" font-family="${escXml(fontFamily)}" font-size="22" font-weight="700" letter-spacing="6" fill="#F59E0B">${escXml(brand)}</text>
  <text x="600" y="420" text-anchor="middle" font-family="${escXml(fontFamily)}" font-size="${size}" font-weight="700" fill="#FFFFEB">
${tspans}
  </text>
  <rect x="550" y="${ruleY}" width="100" height="4" fill="#F59E0B"/>
  <text x="600" y="585" text-anchor="middle" font-family="${escXml(fontFamily)}" font-size="20" fill="rgba(255,255,235,0.45)">${escXml(url)}</text>
</svg>`
}

function collectPages() {
  const pages = []
  const walk = (dir, relPrefix) => {
    let entries
    try {
      entries = readdirSync(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const e of entries) {
      if (e.name.startsWith('.')) continue
      if (e.name === 'content-guide') continue
      const p = join(dir, e.name)
      const rel = relPrefix ? relPrefix + '/' + e.name : e.name
      if (e.isDirectory()) walk(p, rel)
      else if (e.name.endsWith('.md')) pages.push({ file: p, rel: rel.slice(0, -3) })
    }
  }
  walk(srcRoot, '')
  return pages
}

async function main() {
  const pages = collectPages()
  const results = { ok: 0, skip: 0, fail: 0 }
  for (const { file, rel } of pages) {
    const fm = parseFrontmatter(file)
    const title = fm.title
    if (!title) {
      results.skip++
      continue
    }
    const lang = fm.lang || (/^([a-z]{2})\//.test(rel) ? rel.match(/^([a-z]{2})\//)[1] : '')
    const fontFamily = FONTS[scriptOf(lang)]
    const cjk = scriptOf(lang) !== 'default'
    const outFile = join(outRoot, rel + '.png')
    try {
      const svg = buildSvg({
        title,
        brand: 'WIBE & WONDER',
        url: 'wibestories.vercel.app/blog',
        fontFamily,
        cjk,
      })
      mkdirSync(dirname(outFile), { recursive: true })
      writeFileSync(outFile, await sharp(Buffer.from(svg)).png().toBuffer())
      results.ok++
      console.log('og ok', rel)
    } catch (e) {
      results.fail++
      console.error('og FAIL', rel, e.message)
    }
  }
  console.log(`gen-og-images done: ${results.ok} generated, ${results.skip} skipped, ${results.fail} failed`)
  if (results.fail > 0) process.exit(1)
}

await main()
