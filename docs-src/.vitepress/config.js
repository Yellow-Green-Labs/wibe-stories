import { defineConfig } from 'vitepress'
import { fileURLToPath } from 'url'

export default defineConfig({
  title: 'Wibe Stories',
  description: 'Turn your voice into shareable cards, in your language, in seconds.',
  base: '/docs/',
  lang: 'en-US',
  cleanUrls: true,
  vite: {
    publicDir: fileURLToPath(new URL('./public', import.meta.url)),
  },
  head: [
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { href: 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap', rel: 'stylesheet' }],
  ],
  themeConfig: {
    siteTitle: 'Wibe Stories',
    logo: {
      light: '/assets/logo-light.png',
      dark: '/assets/logo-dark.png',
    },
    nav: [
      { text: 'Overview', link: '/' },
      { text: 'App', link: 'https://wibestories.vercel.app' },
    ],
    sidebar: {
      '/legal/': [
        {
          text: 'Legal',
          items: [
            { text: 'License', link: '/legal/license' },
            { text: 'Terms of Service', link: '/legal/terms' },
            { text: 'Privacy Policy', link: '/legal/privacy' },
            { text: 'Refund Policy', link: '/legal/refund' },
          ],
        },
      ],
      '/': [
        {
          text: 'Welcome',
          items: [
            { text: 'Overview', link: '/' },
          ],
        },
        {
          text: 'Product Guide',
          items: [
            { text: 'Wibe Stories', link: '/product-guide/wibe-stories' },
            { text: 'Trust Center', link: '/product-guide/trust-center' },
          ],
        },
        {
          text: 'Reference',
          items: [
            { text: 'Known Issues', link: '/reference/acknowledgements' },
            { text: 'Limitations', link: '/reference/limitations' },
            { text: 'Roadmap', link: '/reference/roadmap' },
          ],
        },
        {
          text: 'Updates',
          items: [
            { text: 'Changelog', link: '/updates/changelog' },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Yellow-Green-Labs/wibe-stories' },
    ],
    footer: {
      copyright: '© 2026 Yellow Green Labs. All rights reserved.',
    },
  },
})
