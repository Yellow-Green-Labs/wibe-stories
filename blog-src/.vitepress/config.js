import { defineConfig } from 'vitepress'
import { fileURLToPath } from 'url'

export default defineConfig({
  title: 'Wibe & Wonder',
  description: 'The Wibe Stories publication — stories, tips and culture from the Wibe team.',
  base: '/blog/',
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
    ['link', { rel: 'icon', href: '/blog/ws-l-b.ico' }],
    ['script', { src: 'https://analytics.ahrefs.com/analytics.js', 'data-key': 'EFnnezz1QG1QnVT5w57f2A', async: '' }],
  ],
})
