<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useData, useRoute, withBase } from 'vitepress'
import { useI18n } from '../i18n'
import { data as allPosts } from '../data/posts.data'
import RelatedPosts from './RelatedPosts.vue'
import BackToTop from './BackToTop.vue'
import ShareBar from './ShareBar.vue'

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
const sharedTitle = computed(() => String(frontmatter.value.title || ''))
const improveHref = computed(
  () => TALLY_URL + '?article=' + encodeURIComponent(sharedTitle.value)
)
const contributors = computed(() =>
  Array.isArray(frontmatter.value.contributors) ? frontmatter.value.contributors : []
)

const sigEl = ref(null)
const railEl = ref(null)
const articleEl = ref(null)
let railTicking = false
const RAIL_TOP = 96

function updateRail() {
  railTicking = false
  const rail = railEl.value
  if (!rail) return
  const bodyTop = articleEl.value ? articleEl.value.getBoundingClientRect().top : RAIL_TOP
  rail.style.top = Math.max(RAIL_TOP, bodyTop) + 'px'
  const show = !sigEl.value || sigEl.value.getBoundingClientRect().top > RAIL_TOP
  rail.classList.toggle('ws-rail-hidden', !show)
}

function onRailScroll() {
  if (railTicking) return
  railTicking = true
  requestAnimationFrame(updateRail)
}

onMounted(() => {
  updateRail()
  window.addEventListener('scroll', onRailScroll, { passive: true })
  window.addEventListener('resize', onRailScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onRailScroll)
  window.removeEventListener('resize', onRailScroll)
})
</script>

<template>
  <article class="ws-article-top">
    <div ref="railEl">
      <ShareBar variant="rail" :url="shareUrl" :title="sharedTitle" />
    </div>

    <div ref="articleEl" class="ws-container ws-article-main">
      <a class="ws-back" :href="homeHref"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i>{{ t('backToBlog') }}</a>

      <header class="ws-article-header">
        <div class="ws-meta">
          <a class="ws-cat" :href="catHref(frontmatter.category)">{{ catName(frontmatter.category) }}</a>
          <span>{{ t('publishedOn') }} {{ fmtDate(frontmatter.date) }}</span>
        </div>
        <h1>{{ frontmatter.title }}</h1>
        <p v-if="frontmatter.subtitle" class="ws-subtitle">{{ frontmatter.subtitle }}</p>
        <div class="ws-meta ws-article-meta">
          <span class="ws-avatar" aria-hidden="true">{{ initial(frontmatter.author) }}</span>
          <span>{{ frontmatter.author }}</span>
          <span>·</span>
          <span class="ws-reading-time">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <span>{{ readMin }} {{ t('readTime') }}</span>
          </span>
        </div>
        <img
          v-if="frontmatter.image"
          :src="frontmatter.image"
          alt=""
          width="1200"
          height="675"
        />
      </header>

      <ShareBar variant="top" :url="shareUrl" :title="sharedTitle" />

      <div class="ws-article-body">
        <Content />
        <p ref="sigEl" class="ws-signature">{{ t('signature') }}</p>
      </div>

      <footer class="ws-article-foot">
        <ShareBar variant="foot" :url="shareUrl" :title="sharedTitle" />
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

      <div class="cta-section">
        <div class="cta-title">{{ t('createCta') }}</div>
        <div class="cta-sub">{{ t('createCtaSub') }}</div>
        <a :href="APP_URL" class="cta-btn">
          {{ t('ctaButton') }}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"></path><path d="M13 6l6 6l-6 6"></path></svg>
        </a>
        <p class="wispr-cta-tagline">
          {{ t('ctaTaglinePre') }}
          <a href="https://wisprflow.ai/r?BEST76" target="_blank" rel="noopener" class="wispr-wave">Wispr Flow</a>
          {{ t('ctaTaglineFlow') }}
        </p>
        <div class="support-link">{{ t('supportQuestion') }} <a href="https://tally.so/r/obaD1M" target="_blank" rel="noopener">{{ t('supportContact') }}</a></div>
      </div>
    </div>
  </article>

  <BackToTop />
</template>
