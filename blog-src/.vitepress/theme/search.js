// Shared search used by the search modal (SearchModal) and the results page
// (BlogSearch). Prefers the Pagefind index when it exists (production build);
// falls back to an in-memory scan of posts.data in dev or when the index is
// missing (e.g. a build that skipped the pagefind step).
import { data as allPosts } from './data/posts.data'

let pagefindMod = null
let pagefindAttempted = false

export async function getPagefind(base) {
  if (import.meta.env.DEV) return false
  if (pagefindAttempted) return pagefindMod
  pagefindAttempted = true
  try {
    pagefindMod = await import(/* @vite-ignore */ base + 'pagefind/pagefind.js')
  } catch {
    pagefindMod = false
  }
  return pagefindMod
}

export function postByUrl(url) {
  const slug = String(url || '').replace(/\/+$/, '').split('/').pop()
  if (!slug) return null
  return allPosts.find((p) => p.url.replace(/\/+$/, '').split('/').pop() === slug) || null
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}

export function highlight(text, q) {
  const escaped = escapeHtml(text)
  const needle = (q || '').trim()
  if (!needle) return escaped
  const re = new RegExp(`(${needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return escaped.replace(re, '<mark>$1</mark>')
}

function toResult(x, post) {
  return {
    url: x.url,
    title: x.title,
    excerpt: x.excerpt,
    category: post ? post.category : '',
    author: post ? post.author : '',
    date: post ? post.date : '',
    readMin: post ? post.readMin : 0,
    image: post ? post.image : '',
  }
}

export function fallbackResults(q, locale) {
  const needle = q.trim().toLowerCase()
  if (!needle) return []
  const isEn = !locale || locale === 'en' || locale.startsWith('en')
  return allPosts
    .filter((p) => isEn ? !p.locale : p.locale === locale)
    .filter((p) => (p.title + ' ' + p.subtitle + ' ' + p.excerpt).toLowerCase().includes(needle))
    .map((p) => toResult(p, p))
}

// Returns { results, total }. When `limit` is given (dropdown preview) results
// are capped but total reflects the full match count (results page).
export async function searchArticles(q, locale, base, limit) {
  const needle = (q || '').trim()
  if (!needle) return { results: [], total: 0 }
  const pf = await getPagefind(base)
  if (pf && typeof pf.search === 'function') {
    try {
      const r = await pf.search(needle)
      const list = r.results || []
      const total = Number.isFinite(r.total) ? r.total : list.length
      const results = list.slice(0, limit || 1000).map((x) =>
        toResult(
          {
            url: x.data.url,
            title: (x.data.meta && x.data.meta.title) || '',
            excerpt: x.data.excerpt || '',
          },
          postByUrl(x.data.url)
        )
      )
      return { results, total }
    } catch {
      /* index hiccup — fall through to the in-memory search */
    }
  }
  const all = fallbackResults(needle, locale)
  return { results: limit ? all.slice(0, limit) : all, total: all.length }
}