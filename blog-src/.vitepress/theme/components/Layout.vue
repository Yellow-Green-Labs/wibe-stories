<script setup>
import { useData } from 'vitepress'
import { watch } from 'vue'
import SiteNav from './SiteNav.vue'
import SiteFooter from './SiteFooter.vue'
import BlogHome from './BlogHome.vue'
import BlogArticle from './BlogArticle.vue'
import BlogCategory from './BlogCategory.vue'

const { frontmatter, site } = useData()

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
  <SiteNav />
  <main
    :class="{
      'ws-page-home': frontmatter.layout === 'home',
      'ws-page-post': frontmatter.layout === 'post',
      'ws-page-category': frontmatter.layout === 'category',
    }"
  >
    <BlogHome v-if="frontmatter.layout === 'home'" />
    <BlogArticle v-else-if="frontmatter.layout === 'post'" />
    <BlogCategory v-else-if="frontmatter.layout === 'category'" />
    <div v-else class="ws-container" style="padding-top: 40px">
      <Content />
    </div>
  </main>
  <SiteFooter />
</template>