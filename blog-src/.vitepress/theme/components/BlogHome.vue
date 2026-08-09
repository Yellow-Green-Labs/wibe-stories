<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from '../i18n'
import { withBase } from 'vitepress'
import { data as allPosts } from '../data/posts.data'
import CategoryPills from './CategoryPills.vue'
import LanguagePills from './LanguagePills.vue'
import FeaturedPost from './FeaturedPost.vue'
import MonthStrip from './MonthStrip.vue'
import PostCard from './PostCard.vue'
import Pagination from './Pagination.vue'
import BackToTop from './BackToTop.vue'

const { t, locale } = useI18n()

const sel = ref('')
const page = ref(1)
const PER_PAGE = 10

const logo = withBase('/BLOG-LOGO.png')

const posts = computed(() => allPosts.filter((p) => p.locale === locale.value))
const featured = computed(() => posts.value[0] || null)

const monthKey = (d) => {
  const x = new Date(d)
  return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0')
}

function defaultSelection(list) {
  const cur = monthKey(new Date())
  const yms = new Set(list.map((p) => monthKey(p.date)))
  if (yms.has(cur)) return cur
  const sorted = [...yms].sort()
  return sorted[sorted.length - 1] || cur
}

const filtered = computed(() => {
  if (!sel.value) return posts.value
  if (sel.value.length === 4) return posts.value.filter((p) => monthKey(p.date).startsWith(sel.value))
  return posts.value.filter((p) => monthKey(p.date) === sel.value)
})

const empty = computed(() => sel.value.length === 7 && filtered.value.length === 0)

const pagePosts = computed(() => filtered.value.slice((page.value - 1) * PER_PAGE, page.value * PER_PAGE))

watch(sel, () => {
  page.value = 1
})

watch(
  locale,
  () => {
    sel.value = defaultSelection(posts.value)
    page.value = 1
  },
  { immediate: true }
)
</script>

<template>
  <header class="ws-masthead">
    <div class="ws-masthead-tag">BLOG</div>
    <h1 class="ws-masthead-logo">
      <img :src="logo" alt="Wibe &amp; Wonder" />
    </h1>
    <p class="ws-masthead-sub">{{ t('mission') }}</p>
  </header>

  <CategoryPills current="" />
  <LanguagePills variant="pills" />

  <div class="ws-container">
    <template v-if="featured">
      <div class="ws-section-label">{{ t('featured') }}</div>
      <FeaturedPost :post="featured" />
    </template>

    <MonthStrip :posts="posts" :selected="sel" :empty="empty" @update="sel = $event" />

    <div class="ws-section-label">{{ t('latest') }}</div>
    <div v-if="pagePosts.length" class="ws-list">
      <PostCard v-for="p in pagePosts" :key="p.url" :post="p" />
    </div>
    <div v-else-if="!empty" class="ws-empty">{{ t('noResults') }}</div>
    <div v-else class="ws-empty">{{ t('emptyMonth') }}</div>

    <Pagination :total="filtered.length" :per-page="PER_PAGE" :current="page" @update="page = $event" />
  </div>

  <BackToTop />
</template>
