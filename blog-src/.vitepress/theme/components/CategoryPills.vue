<script setup>
import { useI18n } from '../i18n'
import { withBase } from 'vitepress'

defineProps({
  current: { type: String, default: '' },
})

const { t, cats, locale } = useI18n()

function href(key) {
  const base = locale.value ? `/${locale.value}` : ''
  return withBase(key ? `${base}/categories/${key}` : `${base}/`)
}
</script>

<template>
  <nav class="ws-pills" :aria-label="t('categories')">
    <a class="ws-pill" :class="{ 'ws-pill-on': current === '' }" :href="href('')">
      {{ t('allCategories') }}
    </a>
    <a
      v-for="c in cats"
      :key="c.key"
      class="ws-pill"
      :class="{ 'ws-pill-on': current === c.key }"
      :href="href(c.key)"
    >
      {{ c.name }}
    </a>
  </nav>
</template>