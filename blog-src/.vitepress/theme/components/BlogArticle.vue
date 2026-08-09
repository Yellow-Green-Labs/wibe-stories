<script setup>
import { computed, ref } from 'vue'
import { useData, useRoute, withBase } from 'vitepress'
import { useI18n } from '../i18n'
import { data as allPosts } from '../data/posts.data'
import RelatedPosts from './RelatedPosts.vue'
import BackToTop from './BackToTop.vue'

const { frontmatter, site } = useData()
const route = useRoute()
const { t, locale, catName, fmtDate } = useI18n()

const base = site.value.base || '/'

function norm(u) {
  return u
    .replace(/^\//, '')
    .replace(new RegExp('^' + base.replace(/^\//, '').replace(/\/$/, '')), '')
    .replace(/\/$/, '')
    .replace(/\.html$/, '')
}

const currentPost = computed(() => {
  const cur = norm(route.path)
  return allPosts.find((p) => norm(p.url) === cur) || null
})

const homeHref = computed(() => withBase(locale.value ? `/${locale.value}/` : '/'))

const readTime = computed(() => {
  const words = String(frontmatter.value.title + ' ' + (frontmatter.value.subtitle || '')).split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
})

const readMin = computed(() => (currentPost.value ? currentPost.value.readMin : readTime.value))

function catHref(key) {
  const baseL = locale.value ? `/${locale.value}` : ''
  return withBase(key ? `${baseL}/categories/${key}` : `${baseL}/`)
}

function initial(name) {
  return (name || 'W').trim().charAt(0).toUpperCase()
}

const APP_URL = 'https://wibestories.vercel.app'
const TALLY_URL = 'https://tally.so/r/WO6B8Q'

const shareUrl = computed(() => APP_URL + route.path)
const improveHref = computed(
  () => TALLY_URL + '?article=' + encodeURIComponent(String(frontmatter.value.title || ''))
)
const contributors = computed(() =>
  Array.isArray(frontmatter.value.contributors) ? frontmatter.value.contributors : []
)

const copied = ref(false)
let copyTimer = null

async function share() {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title: String(frontmatter.value.title || ''), url: shareUrl.value })
    } catch (e) {
      /* user dismissed the share sheet */
    }
    return
  }
  try {
    await navigator.clipboard.writeText(shareUrl.value)
  } catch (e) {
    const ta = document.createElement('textarea')
    ta.value = shareUrl.value
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    ta.remove()
  }
  copied.value = true
  clearTimeout(copyTimer)
  copyTimer = setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>

<template>
  <article class="ws-article-top">
    <div class="ws-container ws-article-main">
      <a class="ws-back" :href="homeHref">{{ t('backToBlog') }}</a>

      <header class="ws-article-header">
        <div class="ws-article-head-row">
          <div class="ws-article-head-main">
            <div class="ws-meta">
              <a class="ws-cat" :href="catHref(frontmatter.category)">{{ catName(frontmatter.category) }}</a>
              <span>{{ t('publishedOn') }} {{ fmtDate(frontmatter.date) }}</span>
            </div>
            <h1>{{ frontmatter.title }}</h1>
            <p v-if="frontmatter.subtitle" class="ws-subtitle">{{ frontmatter.subtitle }}</p>
          </div>
          <button class="ws-share-top" :aria-label="t('shareButton')" :title="t('shareButton')" @click="share">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
          </button>
        </div>
        <div class="ws-meta ws-article-meta">
          <span class="ws-avatar" aria-hidden="true">{{ initial(frontmatter.author) }}</span>
          <span>{{ frontmatter.author }}</span>
          <span>·</span>
          <span class="ws-reading-time">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <span>{{ readMin }} {{ t('readTime') }}</span>
          </span>
        </div>
        <img v-if="frontmatter.image" :src="frontmatter.image" alt="" />
      </header>

      <div class="ws-article-body">
        <Content />
      </div>

      <footer class="ws-article-foot">
        <div class="ws-share-row">
          <span class="ws-share-line">{{ t('shareLine') }}</span>
          <button class="ws-share-btn" @click="share">
            {{ copied ? t('copied') : t('shareButton') }}
          </button>
        </div>
        <p class="ws-signature">{{ t('signature') }}</p>
        <p class="ws-disclosure">{{ t('disclosure') }}</p>
        <a class="ws-improve" :href="improveHref" target="_blank" rel="noopener">
          {{ frontmatter.improve === false ? t('improveFinal') : t('improveOpen') }}
        </a>
        <div v-if="contributors.length" class="ws-contributors">
          <span class="ws-contributors-label">{{ t('contributorsLabel') }}</span>
          <span v-for="c in contributors" :key="c" class="ws-avatar" aria-hidden="true">{{ c }}</span>
        </div>
      </footer>
    </div>

    <div class="ws-container">
      <RelatedPosts :post="currentPost" />

      <aside class="ws-cta">
        <h2>{{ t('createCta') }}</h2>
        <p>{{ t('createCtaSub') }}</p>
        <a class="ws-cta-btn" :href="APP_URL">{{ t('createCard') }}</a>
      </aside>
    </div>
  </article>

  <BackToTop />
</template>
