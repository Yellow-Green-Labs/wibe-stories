<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useData, withBase } from 'vitepress'
import { useI18n } from '../i18n'
import { searchArticles, highlight } from '../search'
import { lockScroll, unlockScroll } from '../scroll-lock'

const emit = defineEmits(['close'])
const { site } = useData()
const { t, locale, catName, fmtDate } = useI18n()
const base = site.value.base || '/'

const PREVIEW_LIMIT = 6

const query = ref('')
const results = ref([])
const total = ref(0)
const searching = ref(false)
const sel = ref(-1)
const inputRef = ref(null)

const hasQuery = computed(() => query.value.trim().length > 0)

let searchTimer = null
let searchSeq = 0
let lastFocused = null

function resultsHref() {
  const isEn = !locale.value || locale.value === 'en' || locale.value.startsWith('en')
  const p = isEn ? '/search' : '/' + locale.value + '/search'
  return withBase(p + '?q=' + encodeURIComponent(query.value.trim()))
}

async function runSearch() {
  const q = query.value.trim()
  if (!q) {
    results.value = []
    total.value = 0
    searching.value = false
    return
  }
  const seq = ++searchSeq
  searching.value = true
  const r = await searchArticles(q, locale.value, base, PREVIEW_LIMIT)
  if (seq !== searchSeq) return
  results.value = r.results
  total.value = r.total
  searching.value = false
}

function moveSel(step) {
  if (searching.value || !results.value.length) return
  const len = results.value.length
  sel.value = (sel.value + step + len) % len
  document.getElementById('ws-modal-hit-' + sel.value)?.scrollIntoView({ block: 'nearest' })
}

function resolveUrl(url) {
  if (!url) return '#'
  return url.startsWith('/') ? url : withBase(url)
}

function openSel() {
  if (searching.value) return
  const r = sel.value >= 0 ? results.value[sel.value] : results.value[0]
  if (r) window.location.href = resolveUrl(r.url)
}

function onKey(e) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    inputRef.value?.focus()
    return
  }
  if (e.key === 'Escape') {
    emit('close')
    return
  }
  if (e.isComposing) return
  if (!hasQuery.value) return
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    moveSel(1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    moveSel(-1)
  } else if (e.key === 'Enter') {
    e.preventDefault()
    openSel()
  }
}

watch(query, () => {
  sel.value = -1
  clearTimeout(searchTimer)
  searchTimer = setTimeout(runSearch, 200)
})

onMounted(() => {
  lastFocused = document.activeElement
  lockScroll()
  window.addEventListener('keydown', onKey)
  inputRef.value?.focus()
})

onBeforeUnmount(() => {
  clearTimeout(searchTimer)
  window.removeEventListener('keydown', onKey)
  unlockScroll()
  try {
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus()
  } catch {
    /* focus restore is best-effort */
  }
})
</script>

<template>
  <div class="ws-search-modal" role="dialog" aria-modal="true" :aria-label="t('searchLabel')">
    <div class="ws-search-modal-backdrop" @click="emit('close')"></div>
    <div class="ws-search-modal-panel">
      <div class="ws-search-modal-head">
        <svg class="ws-search-icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
          <circle cx="6.5" cy="6.5" r="4.5" fill="none" stroke="currentColor" stroke-width="1.5" />
          <line x1="10.2" y1="10.2" x2="13.8" y2="13.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
        <input
          ref="inputRef"
          v-model="query"
          class="ws-search-modal-input"
          type="text"
          :placeholder="t('search')"
          :aria-label="t('searchLabel')"
          autocomplete="off"
          spellcheck="false"
        />
        <button
          v-if="query"
          type="button"
          class="ws-search-modal-clear"
          :aria-label="t('close')"
          @mousedown.prevent
          @click="query = ''; inputRef?.focus()"
        >
          <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          </svg>
        </button>
      </div>

      <div v-if="hasQuery" class="ws-search-modal-list">
        <a
          v-for="(r, i) in results"
          :key="r.url"
          :id="'ws-modal-hit-' + i"
          class="ws-search-modal-hit"
          :class="{ 'ws-search-modal-hit-on': i === sel }"
          :href="resolveUrl(r.url)"
          @mouseenter="sel = i"
          @click="emit('close')"
        >
          <span class="ws-search-modal-hit-title" v-html="highlight(r.title, query)"></span>
          <span class="ws-search-modal-hit-excerpt" v-html="r.excerpt"></span>
          <span v-if="r.category || r.author || r.date" class="ws-search-modal-hit-meta">
            <span v-if="r.category">{{ catName(r.category) }}</span>
            <template v-if="r.author || r.date"><span class="ws-meta-dot">·</span></template>
            <span v-if="r.author">{{ r.author }}</span>
            <template v-if="r.date"><span class="ws-meta-dot">·</span></template>
            <span v-if="r.date">{{ fmtDate(r.date) }}</span>
          </span>
        </a>
        <div v-if="!results.length" class="ws-search-modal-empty">
          {{ searching ? t('searching') : t('noResults') }}
        </div>
      </div>

      <div class="ws-search-modal-foot">
        <span class="ws-search-modal-hints">{{ t('searchHints') }}</span>
        <a v-if="hasQuery && !searching" class="ws-search-modal-seeall" :href="resultsHref()" @click="emit('close')">
          {{ t('seeAll') }}<template v-if="total"> · {{ total }}</template>
        </a>
      </div>
    </div>
  </div>
</template>