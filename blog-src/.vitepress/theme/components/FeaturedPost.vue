<script setup>
import { useI18n } from '../i18n'
import { withBase } from 'vitepress'
import { imgSrc } from '../utils'

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
      <img :src="imgSrc(post.image)" :alt="post.title" loading="eager" width="1200" height="675" />
    </a>
    <div class="ws-featured-body">
      <div class="ws-meta">
        <a class="ws-cat" :href="catHref(post.category)">{{ catName(post.category) }}</a>
        <span>{{ t('publishedOn') }} <time :datetime="post.date">{{ fmtDate(post.date) }}</time></span>
      </div>
      <h2><a class="ws-featured-title" :href="post.url">{{ post.title }}</a></h2>
      <p>{{ post.subtitle || post.excerpt }}</p>
      <div class="ws-meta ws-featured-author">
        <span class="ws-avatar" aria-hidden="true">{{ initial(post.author) }}</span>
        <span>{{ post.author }}</span>
        <span>·</span>
        <span class="ws-reading-time">
          <i class="fa-regular fa-clock" aria-hidden="true"></i>
          <span>{{ post.readMin }} {{ t('readTime') }}</span>
        </span>
      </div>
      <a class="ws-read-more" :href="post.url">{{ t('readMore') }}</a>
    </div>
  </article>
</template>
