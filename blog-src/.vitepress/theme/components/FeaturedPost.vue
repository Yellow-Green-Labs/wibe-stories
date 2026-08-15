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

function initial(name) {
  return (name || 'W').trim().charAt(0).toUpperCase()
}
</script>

<template>
  <article class="ws-featured-card" :class="{ 'ws-featured-nothumb': !post.image }">
    <a v-if="post.image" class="ws-featured-img" :href="post.url" :aria-label="post.title">
      <img :src="post.image" alt="" loading="eager" width="1200" height="675" />
    </a>
    <div class="ws-featured-body">
      <div class="ws-meta">
        <a class="ws-cat" :href="catHref(post.category)">{{ catName(post.category) }}</a>
        <span>{{ t('publishedOn') }} {{ fmtDate(post.date) }}</span>
      </div>
      <h2><a class="ws-featured-title" :href="post.url">{{ post.title }}</a></h2>
      <p>{{ post.subtitle || post.excerpt }}</p>
      <div class="ws-meta ws-featured-author">
        <span class="ws-avatar" aria-hidden="true">{{ initial(post.author) }}</span>
        <span>{{ post.author }}</span>
        <span>·</span>
        <span class="ws-reading-time">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <span>{{ post.readMin }} {{ t('readTime') }}</span>
        </span>
      </div>
      <a class="ws-read-more" :href="post.url">{{ t('readMore') }}</a>
    </div>
  </article>
</template>
