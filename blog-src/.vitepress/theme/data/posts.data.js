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

export default createContentLoader('**/posts/**/*.md', {
  render: true,
  transform(raw) {
    return raw
      .map(({ url, frontmatter, html }) => {
        const fullUrl = BASE_URL + url.replace(/^\//, '')
        const bodyText = stripHtml(html)
        const excerpt = bodyText.length > 200 ? bodyText.slice(0, 200).trimEnd() + '…' : bodyText
        const readMin = Math.max(1, Math.round(bodyText.split(/\s+/).filter(Boolean).length / 200))
        const date = new Date(frontmatter.date)
        return {
          url: fullUrl.replace(/\/index$/, '/'),
          locale: localeOf(url),
          title: frontmatter.title || '',
          subtitle: frontmatter.subtitle || '',
          category: frontmatter.category || '',
          author: frontmatter.author || '',
          date: Number.isNaN(date.getTime()) ? '' : date.toISOString(),
          image: frontmatter.image || '',
          excerpt,
          readMin,
        }
      })
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
  },
})