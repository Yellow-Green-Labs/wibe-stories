<script setup>
import { useI18n } from '../i18n'
import { withBase } from 'vitepress'
import { imgSrc } from '../utils'

defineProps({
  post: { type: Object, required: true },
  variant: { type: String, default: 'full' },
  showAuthor: { type: Boolean, default: false },
})

const { t, catName, fmtDate, locale } = useI18n()

function initial(name) {
  return String(name || '').trim().charAt(0).toUpperCase() || 'W'
}

function catHref(key) {
  const base = locale.value ? `/${locale.value}` : ''
  return withBase(key ? `${base}/categories/${key}` : `${base}/`)
}
</script>

<template>
  <article class="ws-card">
    <template v-if="variant === 'related'">
      <a v-if="post.image" class="ws-card-img" :href="post.url" :aria-label="post.title">
        <img :src="imgSrc(post.image)" alt="" loading="lazy" />
      </a>
      <div class="ws-card-body">
        <div class="ws-meta">
          <span>{{ t('publishedOn') }} <time :datetime="post.date">{{ fmtDate(post.date) }}</time></span>
        </div>
        <h3><a class="ws-card-title" :href="post.url">{{ post.title }}</a></h3>
        <div class="ws-meta ws-card-byline">
          <template v-if="post.author">
            <span class="ws-card-author">
              <span class="ws-avatar" aria-hidden="true">{{ initial(post.author) }}</span>
              <span>{{ post.author }}</span>
            </span>
            <span>·</span>
          </template>
          <span class="ws-reading-time">
            <i class="fa-regular fa-clock" aria-hidden="true"></i>
            <span>{{ post.readMin }} {{ t('readTime') }}</span>
          </span>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="ws-card-body">
        <div class="ws-meta">
          <a v-if="variant !== 'minimal'" class="ws-cat" :href="catHref(post.category)">{{ catName(post.category) }}</a>
          <span>{{ t('publishedOn') }} <time :datetime="post.date">{{ fmtDate(post.date) }}</time></span>
          <template v-if="showAuthor && post.author">
            <span>·</span>
            <span class="ws-card-author">
              <span class="ws-avatar" aria-hidden="true">{{ initial(post.author) }}</span>
              <span>{{ post.author }}</span>
            </span>
          </template>
        </div>
        <h3><a class="ws-card-title" :href="post.url">{{ post.title }}</a></h3>
        <p v-if="variant !== 'minimal'">{{ post.subtitle || post.excerpt }}</p>
        <div class="ws-meta ws-card-foot">
          <span class="ws-reading-time">
            <i class="fa-regular fa-clock" aria-hidden="true"></i>
            <span>{{ post.readMin }} {{ t('readTime') }}</span>
          </span>
          <a v-if="variant !== 'minimal'" class="ws-read-more" :href="post.url">{{ t('readMore') }}</a>
        </div>
      </div>
      <a v-if="post.image" class="ws-card-img" :href="post.url" :aria-label="post.title">
        <img :src="imgSrc(post.image)" alt="" loading="lazy" />
      </a>
    </template>
  </article>
</template>
