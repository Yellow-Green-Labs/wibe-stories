<script setup>
import { computed } from 'vue'
import { useI18n } from '../i18n'
import { data as allPosts } from '../data/posts.data'
import PostCard from './PostCard.vue'

const props = defineProps({
  post: { type: Object, required: true },
})

const { t, locale } = useI18n()

const related = computed(() => {
  if (!props.post) return []
  const sameCat = allPosts.filter(
    (p) => p.locale === props.post.locale && p.category === props.post.category && p.url !== props.post.url
  )
  const sameLocale = allPosts.filter(
    (p) => p.locale === props.post.locale && p.url !== props.post.url && p.category !== props.post.category
  )
  return [...sameCat, ...sameLocale].slice(0, 3)
})
</script>

<template>
  <template v-if="related.length">
    <div class="ws-section-label">{{ t('related') }}</div>
    <div class="ws-related">
      <PostCard v-for="r in related" :key="r.url" :post="r" />
    </div>
  </template>
</template>