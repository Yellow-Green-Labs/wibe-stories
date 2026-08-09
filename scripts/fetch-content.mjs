// Phase 1: local-content mode. Phase 2 (robot mode): copies articles from the
// private wibe-blog-content repo into blog-src when CONTENT_TOKEN + CONTENT_REPO
// are set (Vercel env). Without them (local dev) the local placeholder articles
// stay untouched. Always exits 0 so the build proceeds either way.
import { execSync } from 'node:child_process'
import { existsSync, rmSync, cpSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const tmp = resolve(root, 'blog-src/.vitepress/.temp/content-src')
const dest = resolve(root, 'blog-src')

const token = process.env.CONTENT_TOKEN
const repo = process.env.CONTENT_REPO

if (!token || !repo) {
  console.log('[fetch-content] No CONTENT_TOKEN/CONTENT_REPO set — using local blog content.')
  process.exit(0)
}

try {
  rmSync(tmp, { recursive: true, force: true })
  execSync(`git clone --depth 1 https://x-access-token:${token}@github.com/${repo}.git "${tmp}"`, {
    stdio: 'inherit',
    timeout: 120000,
  })
  for (const dir of [
    'posts', 'th/posts', 'ko/posts', 'ja/posts', 'es/posts',
    'it/posts', 'tl/posts', 'tr/posts', 'sv/posts',
  ]) {
    const src = resolve(tmp, dir)
    if (existsSync(src)) cpSync(src, resolve(dest, dir), { recursive: true })
  }
  rmSync(tmp, { recursive: true, force: true })
  console.log(`[fetch-content] Content synced from ${repo}.`)
} catch (e) {
  rmSync(tmp, { recursive: true, force: true })
  console.warn('[fetch-content] Sync failed — using local blog content.', e.message)
}
process.exit(0)
