<script setup>
import { computed } from 'vue'
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

// 6 categories, fixed by design (see theme/i18n.js CATEGORIES): row 1 = "All" +
// first 3, row 2 = last 3. Split is intentional (4/3, user request 2026-08-16).
const firstRow = computed(() => cats.value.slice(0, 3))
const secondRow = computed(() => cats.value.slice(3))
</script>

<template>
  <nav class="ws-pills" :aria-label="t('categories')">
    <div class="ws-pills-row">
      <a class="ws-pill" :class="{ 'ws-pill-on': current === '' }" :href="href('')">
        {{ t('allCategories') }}
      </a>
      <a
        v-for="c in firstRow"
        :key="c.key"
        class="ws-pill"
        :class="{ 'ws-pill-on': current === c.key }"
        :href="href(c.key)"
      >
        {{ c.name }}
      </a>
    </div>
    <div class="ws-pills-row">
      <a
        v-for="c in secondRow"
        :key="c.key"
        class="ws-pill"
        :class="{ 'ws-pill-on': current === c.key }"
        :href="href(c.key)"
      >
        {{ c.name }}
      </a>
    </div>
  </nav>
</template>