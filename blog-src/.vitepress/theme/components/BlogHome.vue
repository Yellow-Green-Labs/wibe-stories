<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from '../i18n'
import { withBase } from 'vitepress'
import { data as allPosts } from '../data/posts.data'
import FeaturedPost from './FeaturedPost.vue'
// import MonthStrip from './MonthStrip.vue'
import PostCard from './PostCard.vue'
import Pagination from './Pagination.vue'
import BackToTop from './BackToTop.vue'
import CategoryPills from './CategoryPills.vue'
import CategoryDropdown from './CategoryDropdown.vue'
import CtaSection from './CtaSection.vue'

const { t, locale } = useI18n()

const page = ref(1)
const PER_PAGE = 10

const logo = withBase('/BLOG-LABEL.png')

const posts = computed(() => allPosts.filter((p) => p.locale === locale.value))
const featured = computed(() => posts.value[0] || null)

// Month-strip filter state (sel / monthKey / defaultSelection / filtered) removed
// 2026-08-16 (item 1): "Latest" shows all posts regardless of month. The locale
// watcher stays so pagination resets to page 1 on language switch, as before.
// Item 2 (2026-08-16): the list skips the featured post (index 1 onwards) so it
// never appears twice; pagination counts only the listed posts.
const listPosts = computed(() => posts.value.slice(1))
const pagePosts = computed(() => listPosts.value.slice((page.value - 1) * PER_PAGE, page.value * PER_PAGE))

watch(locale, () => {
  page.value = 1
})
</script>

<template>
  <header class="ws-masthead">
    <div class="ws-masthead-tag">BLOG</div>
    <h1 class="ws-masthead-logo">
      <img :src="logo" alt="Wibe &amp; Wonder" />
    </h1>
    <p class="ws-masthead-sub">{{ t('mission') }}</p>
  </header>

  <CategoryPills />

  <div class="ws-container">
    <CategoryDropdown />
    <!-- Month strip hidden 2026-08-16; filter state removed same day (item 1) so "Latest" shows all posts. Restore = re-add sel/monthKey/defaultSelection/filtered + watches, then uncomment this line and the import. -->

    <template v-if="featured">
      <div class="ws-section-label">{{ t('featured') }}</div>
      <FeaturedPost :post="featured" />
    </template>

    <template v-if="listPosts.length">
      <div class="ws-section-label">{{ t('latest') }}</div>
      <div class="ws-list">
        <PostCard v-for="p in pagePosts" :key="p.url" :post="p" />
      </div>
      <Pagination :total="listPosts.length" :per-page="PER_PAGE" :current="page" @update="page = $event" />
    </template>

    <CtaSection />
  </div>

  <BackToTop />
</template>
