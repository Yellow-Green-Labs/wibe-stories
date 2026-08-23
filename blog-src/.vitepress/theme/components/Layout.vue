<script setup>
import { useData } from 'vitepress'
import { watch } from 'vue'
import SiteNav from './SiteNav.vue'
import SiteFooter from './SiteFooter.vue'
import BlogHome from './BlogHome.vue'
import BlogArticle from './BlogArticle.vue'
import BlogCategory from './BlogCategory.vue'
import BlogSearch from './BlogSearch.vue'
import ConsentBanner from './ConsentBanner.vue'
import { useI18n } from '../i18n'

const { frontmatter, site } = useData()
const { t } = useI18n()

watch(
  () => [site.value.lang, frontmatter.value.lang],
  ([siteLang, pageLang]) => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = pageLang || siteLang
    }
  },
  { immediate: true }
)
</script>

<template>
  <a href="#main" class="ws-skip-link">{{ t('skipToContent') }}</a>
  <SiteNav />
  <main
    id="main"
    :data-pagefind-ignore="frontmatter.layout !== 'post' ? true : undefined"
    :class="{
      'ws-page-home': frontmatter.layout === 'home',
      'ws-page-post': frontmatter.layout === 'post',
      'ws-page-category': frontmatter.layout === 'category',
      'ws-page-search': frontmatter.layout === 'search',
    }"
  >
    <BlogHome v-if="frontmatter.layout === 'home'" />
    <BlogArticle v-else-if="frontmatter.layout === 'post'" />
    <BlogCategory v-else-if="frontmatter.layout === 'category'" />
    <BlogSearch v-else-if="frontmatter.layout === 'search'" />
    <div v-else class="ws-container" style="padding-top: var(--space-40)">
      <Content />
    </div>
  </main>
  <SiteFooter />
  <ConsentBanner />
</template>