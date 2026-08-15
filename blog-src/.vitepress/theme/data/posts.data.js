import { createContentLoader } from 'vitepress'

const BASE_URL = '/blog/'
const LOCALE_CODES = ['th', 'ko', 'ja', 'es', 'it', 'tl', 'tr', 'sv']

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function localeOf(url) {
  const parts = url.replace(BASE_URL, '').split('/').filter(Boolean)
  return LOCALE_CODES.includes(parts[0]) ? parts[0] : ''
}

function countWords(text, locale) {
  if (!text) return 0
  if (locale === 'th' && typeof Intl !== 'undefined' && Intl.Segmenter) {
    try {
      const seg = new Intl.Segmenter('th', { granularity: 'word' })
      let n = 0
      for (const part of seg.segment(text)) {
        if (part.isWordLike) n++
      }
      return n
    } catch (e) {
      /* fall through */
    }
  }
  if (locale === 'th' || locale === 'ja' || locale === 'ko') {
    return text.replace(/\s+/g, '').length / 8
  }
  return text.split(/\s+/).filter(Boolean).length
}

export default createContentLoader('**/posts/**/*.md', {
  render: true,
  transform(raw) {
    return raw
      .map(({ url, frontmatter, html }) => {
        const fullUrl = BASE_URL + url.replace(/^\//, '')
        const bodyText = stripHtml(html)
        const excerpt = bodyText.length > 200 ? bodyText.slice(0, 200).trimEnd() + '…' : bodyText
        const locale = localeOf(url)
        const readMin = Math.max(1, Math.round(countWords(bodyText, locale) / 200))
        let date = ''
        if (frontmatter.date && /^\d{4}-\d{2}-\d{2}$/.test(String(frontmatter.date))) {
          date = String(frontmatter.date)
        } else {
          const d = new Date(frontmatter.date)
          if (!Number.isNaN(d.getTime())) {
            const y = d.getFullYear()
            const m = String(d.getMonth() + 1).padStart(2, '0')
            const day = String(d.getDate()).padStart(2, '0')
            date = y + '-' + m + '-' + day
          }
        }
        return {
          url: fullUrl.replace(/\/index$/, '/'),
          locale,
          title: frontmatter.title || '',
          subtitle: frontmatter.subtitle || '',
          category: frontmatter.category || '',
          author: frontmatter.author || '',
          date,
          image: frontmatter.image || '',
          excerpt,
          readMin,
        }
      })
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
  },
})
