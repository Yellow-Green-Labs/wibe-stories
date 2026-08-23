<script setup>
import { ref, computed, watch } from 'vue'
import { useData, withBase } from 'vitepress'
import { useI18n } from '../i18n'
import { searchArticles, highlight } from '../search'
import { imgSrc } from '../utils'
import Pagination from './Pagination.vue'

const { site } = useData()
const { t, catName, fmtDate, locale } = useI18n()
const base = site.value.base || '/'

const q = ref('')
const rows = ref([])
const total = ref(0)
const loading = ref(false)
const page = ref(1)
const PER_PAGE = 10
let seq = 0

const filtered = computed(() => rows.value)
const paged = computed(() => {
  const start = (page.value - 1) * PER_PAGE
  return filtered.value.slice(start, start + PER_PAGE)
})
const count = computed(() => total.value)

function catHref(key) {
  const p = locale.value === 'en' ? `/categories/${key}` : `/${locale.value}/categories/${key}`
  return withBase(p)
}

function postHref(url) {
  if (!url) return '#'
  return url.startsWith('/') ? url : withBase(url)
}

async function run(needle) {
  if (typeof window === 'undefined') return
  const s = ++seq
  q.value = needle
  if (!needle) {
    rows.value = []
    total.value = 0
    loading.value = false
    return
  }
  loading.value = true
  const r = await searchArticles(needle, locale.value, base)
  if (s !== seq) return
  rows.value = r.results
  total.value = r.total
  loading.value = false
  page.value = 1
}

if (typeof window !== 'undefined') {
  watch(
    () => new URLSearchParams(location.search).get('q') || '',
    (v) => run(String(v || '').trim()),
    { immediate: true }
  )

  watch(locale, () => run(q.value))
}
</script>

<template>
  <div class="ws-search-page">
    <header v-if="q" class="ws-search-hero">
      <h1 class="ws-search-hero-title">
        {{ t('searchPageTitle') }}: <span class="ws-search-hero-term">"{{ q }}"</span>
      </h1>
      <p v-if="!loading" class="ws-search-hero-count">
        {{ count === 1 ? t('resultsForOne') : t('resultsFor') }} {{ q }}
      </p>
    </header>

    <template v-if="q">
      <div v-if="loading" class="ws-search-loading">{{ t('searching') }}</div>

      <div v-else-if="paged.length" class="ws-search-results">
        <article v-for="r in paged" :key="r.url" class="ws-search-hit">
          <div class="ws-search-hit-content">
            <div class="ws-search-hit-meta">
              <time v-if="r.date" :datetime="r.date">{{ fmtDate(r.date) }}</time>
              <span v-if="r.readMin" class="ws-search-hit-readtime">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                {{ r.readMin }} {{ t('readTime') }}
              </span>
            </div>
            <h2 class="ws-search-hit-title">
              <a :href="postHref(r.url)" v-html="highlight(r.title, q)"></a>
            </h2>
          </div>
          <div v-if="r.image" class="ws-search-hit-image">
            <a :href="postHref(r.url)">
              <img :src="imgSrc(r.image)" :alt="r.title" width="320" height="180" loading="lazy" />
            </a>
          </div>
        </article>

        <Pagination
          v-if="filtered.length > PER_PAGE"
          :total="filtered.length"
          :per-page="PER_PAGE"
          :current="page"
          :loading="loading"
          @update="(n) => (page = n)"
        />
      </div>

      <div v-else class="ws-search-empty">
        <p>{{ t('noResults') }}</p>
        <a class="ws-search-browse" :href="withBase(locale ? `/${locale}/` : '/')">{{ t('browseAll') }}</a>
      </div>
    </template>

    <div v-else class="ws-search-empty">
      <p>{{ t('searchPrompt') }}</p>
    </div>
  </div>
</template>
