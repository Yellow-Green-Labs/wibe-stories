<script setup>
import { computed, ref } from 'vue'
import { useData, useRoute, withBase } from 'vitepress'
import { useI18n } from '../i18n'
import { imgSrc } from '../utils'
import { data as allPosts } from '../data/posts.data'
import RelatedPosts from './RelatedPosts.vue'
import BackToTop from './BackToTop.vue'
import ShareBar from './ShareBar.vue'
import CtaSection from './CtaSection.vue'
import PrevNext from './PrevNext.vue'
import OnThisPage from './OnThisPage.vue'

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
</script>

<template>
  <article class="ws-article-top">
    <div class="ws-container ws-article-content">
      <nav class="ws-side-rail" :aria-label="t('onThisPage')">
        <OnThisPage />
        <div class="ws-toc-share">
          <ShareBar variant="rail" :url="shareUrl" :title="sharedTitle" />
        </div>
      </nav>

      <div class="ws-article-main">
        <a class="ws-back" :href="homeHref"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i>{{ t('backToBlog') }}</a>

        <header class="ws-article-header">
          <div class="ws-meta">
            <a class="ws-cat" :href="catHref(frontmatter.category)">{{ catName(frontmatter.category) }}</a>
            <span>{{ t('publishedOn') }} <time :datetime="frontmatter.date">{{ fmtDate(frontmatter.date) }}</time></span>
          </div>
          <h1>{{ frontmatter.title }}</h1>
          <p v-if="frontmatter.subtitle" class="ws-subtitle">{{ frontmatter.subtitle }}</p>
          <div class="ws-meta ws-article-meta">
            <span class="ws-avatar" aria-hidden="true">{{ initial(frontmatter.author) }}</span>
            <span>{{ frontmatter.author }}</span>
            <span>·</span>
            <span class="ws-reading-time">
              <i class="fa-regular fa-clock" aria-hidden="true"></i>
              <span>{{ readMin }} {{ t('readTime') }}</span>
            </span>
          </div>
          <img
            v-if="frontmatter.image"
            :src="imgSrc(frontmatter.image)"
            :alt="frontmatter.title"
            width="1200"
            height="675"
          />
        </header>

        <ShareBar variant="top" :url="shareUrl" :title="sharedTitle" />

        <div class="ws-article-body" data-pagefind-body :data-pagefind-meta="'title: ' + frontmatter.title">
          <Content />
          <p class="ws-signature" v-html="t('signature')"></p>
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
    </div>

    <div class="ws-container">
      <PrevNext v-if="currentPost" :post="currentPost" />

      <RelatedPosts v-if="currentPost" :post="currentPost" />

      <CtaSection />
    </div>
  </article>

  <BackToTop />
</template>
