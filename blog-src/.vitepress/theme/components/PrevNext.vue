<script setup>
import { computed } from 'vue'
import { useI18n } from '../i18n'
import { data as allPosts } from '../data/posts.data'

const props = defineProps({
  post: { type: Object, required: true },
})

const { t } = useI18n()

const localePosts = computed(() =>
  allPosts.filter((p) => p.locale === props.post.locale)
)

const prev = computed(() => {
  const i = localePosts.value.findIndex((p) => p.url === props.post.url)
  return i > 0 ? localePosts.value[i - 1] : null
})

const next = computed(() => {
  const i = localePosts.value.findIndex((p) => p.url === props.post.url)
  return i >= 0 && i < localePosts.value.length - 1 ? localePosts.value[i + 1] : null
})
</script>

<template>
  <nav v-if="prev || next" class="ws-prevnext" :aria-label="t('pagination')">
    <a v-if="prev" class="ws-prevnext-link ws-prevnext-prev" :href="prev.url">
      <span class="ws-prevnext-label">{{ t('prevArticle') }}</span>
      <span class="ws-prevnext-title">{{ prev.title }}</span>
    </a>
    <a v-if="next" class="ws-prevnext-link ws-prevnext-next" :href="next.url">
      <span class="ws-prevnext-label">{{ t('nextArticle') }}</span>
      <span class="ws-prevnext-title">{{ next.title }}</span>
    </a>
  </nav>
</template>
