<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from '../i18n'
import { data as allPosts } from '../data/posts.data'

const { t, locale } = useI18n()
const props = defineProps({
  showButton: { type: Boolean, default: false }
})

const query = ref('')
const open = ref(false)
const inputRef = ref(null)

const results = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return []
  return allPosts
    .filter((p) => p.locale === locale.value)
    .filter((p) => (p.title + ' ' + p.subtitle + ' ' + p.excerpt).toLowerCase().includes(q))
    .slice(0, 6)
})

function onKey(e) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    inputRef.value?.focus()
    open.value = true
  }
  if (e.key === 'Escape') {
    open.value = false
    inputRef.value?.blur()
  }
}

function onDocClick(e) {
  if (!e.target.closest('.ws-search-wrap')) open.value = false
}

function go() {
  if (query.value.trim()) open.value = true
  inputRef.value?.focus()
}

watch(locale, () => {
  query.value = ''
  open.value = false
})

onMounted(() => {
  window.addEventListener('keydown', onKey)
  document.addEventListener('click', onDocClick)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  document.removeEventListener('click', onDocClick)
})
</script>

<template>
  <div class="ws-search-wrap" :class="{ 'ws-search-wrap-btn': showButton }">
    <svg class="ws-search-icon" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="4.5" fill="none" stroke="currentColor" stroke-width="1.5" />
      <line x1="10.2" y1="10.2" x2="13.8" y2="13.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    </svg>
    <input
      ref="inputRef"
      v-model="query"
      class="ws-search-input"
      type="search"
      :placeholder="t('search')"
      :aria-label="t('searchLabel')"
      @focus="open = true"
      @input="open = true"
    />
    <button v-if="showButton" type="button" class="ws-search-go" @click="go">{{ t('searchLabel') }}</button>
    <div v-if="open" class="ws-search-results">
      <template v-if="results.length">
        <a v-for="r in results" :key="r.url" class="ws-search-result" :href="r.url">
          <strong>{{ r.title }}</strong>
          <span>{{ r.author }} · {{ r.readMin }} {{ t('readTime') }}</span>
        </a>
      </template>
      <div v-else class="ws-search-empty">{{ t('noResults') }}</div>
    </div>
  </div>
</template>