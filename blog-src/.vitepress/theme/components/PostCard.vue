<script setup>
import { useI18n } from '../i18n'
import { withBase } from 'vitepress'

defineProps({
  post: { type: Object, required: true },
})

const { t, catName, fmtDate, locale } = useI18n()

function catHref(key) {
  const base = locale.value ? `/${locale.value}` : ''
  return withBase(key ? `${base}/categories/${key}` : `${base}/`)
}
</script>

<template>
  <article class="ws-card">
    <div class="ws-card-body">
      <div class="ws-meta">
        <a class="ws-cat" :href="catHref(post.category)">{{ catName(post.category) }}</a>
        <span>{{ t('publishedOn') }} {{ fmtDate(post.date) }}</span>
      </div>
      <h3><a class="ws-card-title" :href="post.url">{{ post.title }}</a></h3>
      <p>{{ post.subtitle || post.excerpt }}</p>
      <div class="ws-meta ws-card-foot">
        <span class="ws-reading-time">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <span>{{ post.readMin }} {{ t('readTime') }}</span>
        </span>
        <a class="ws-read-more" :href="post.url">{{ t('readMore') }}</a>
      </div>
    </div>
    <a v-if="post.image" class="ws-card-img" :href="post.url" :aria-label="post.title">
      <img :src="post.image" alt="" loading="lazy" />
    </a>
  </article>
</template>
