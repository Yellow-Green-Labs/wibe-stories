<script setup>
import { ref, computed, watch } from 'vue'
import { useData, withBase } from 'vitepress'
import { useI18n } from '../i18n'
import { data as allPosts } from '../data/posts.data'
import CategoryPills from './CategoryPills.vue'
import PostCard from './PostCard.vue'
import Pagination from './Pagination.vue'
import BackToTop from './BackToTop.vue'

const { frontmatter, site } = useData()
const { t, locale, catName } = useI18n()

const base = site.value.base || '/'
const cat = computed(() => frontmatter.value.category || '')
const homeHref = computed(() => withBase(locale.value ? `/${locale.value}/` : '/'))

const page = ref(1)
const PER_PAGE = 10

const posts = computed(() =>
  allPosts.filter((p) => p.locale === locale.value && p.category === cat.value)
)

const pagePosts = computed(() => posts.value.slice((page.value - 1) * PER_PAGE, page.value * PER_PAGE))

watch([cat, locale], () => {
  page.value = 1
})
</script>

<template>
  <header class="ws-category-head">
    <h1>{{ catName(cat) }}</h1>
    <p>{{ posts.length }} {{ t('stories') }}</p>
  </header>

  <CategoryPills :current="cat" />

  <div class="ws-container" style="padding-top: 8px">
    <div v-if="pagePosts.length" class="ws-list">
      <PostCard v-for="p in pagePosts" :key="p.url" :post="p" />
    </div>
    <div v-else class="ws-empty">{{ t('noResults') }}</div>

    <Pagination :total="posts.length" :per-page="PER_PAGE" :current="page" @update="page = $event" />
  </div>

  <BackToTop />
</template>