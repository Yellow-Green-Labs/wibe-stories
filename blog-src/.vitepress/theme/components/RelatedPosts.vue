<script setup>
import { computed } from 'vue'
import { useI18n } from '../i18n'
import { withBase } from 'vitepress'
import { data as allPosts } from '../data/posts.data'
import PostCard from './PostCard.vue'

const props = defineProps({
  post: { type: Object, required: true },
})

const { t, locale } = useI18n()

const related = computed(() => {
  if (!props.post) return []
  const others = allPosts.filter((p) => p.url !== props.post.url)
  const sameCat = others.filter(
    (p) => p.locale === props.post.locale && p.category === props.post.category
  )
  const sameLocale = others.filter(
    (p) => p.locale === props.post.locale && p.category !== props.post.category
  )
  const rest = others.filter((p) => p.locale !== props.post.locale)
  return [...sameCat, ...sameLocale, ...rest].slice(0, 3)
})

const browseHref = computed(() =>
  withBase(locale.value ? `/${locale.value}/` : '/')
)
</script>

<template>
  <div class="ws-related-head">
    <div class="ws-section-label">{{ t('related') }}</div>
    <a class="ws-browse-all" :href="browseHref">
      {{ t('browseAll') }}
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </a>
  </div>
  <div v-if="related.length" class="ws-related">
    <PostCard v-for="r in related" :key="r.url" :post="r" variant="related" />
  </div>
</template>