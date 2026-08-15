<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { LOCALES, useLocale, useI18n } from '../i18n'
import { withBase, useRoute } from 'vitepress'
import { data as allPosts } from '../data/posts.data'

const locale = useLocale()
const route = useRoute()
const { t } = useI18n()

const BASE = '/blog/'
const open = ref(false)
const btnEl = ref(null)
const menuEl = ref(null)

watch(open, async (v) => {
  if (!v) return
  await nextTick()
  const btn = btnEl.value
  const menu = menuEl.value
  if (!btn || !menu) return
  const r = btn.getBoundingClientRect()
  menu.style.top = `${r.bottom + 4}px`
  menu.style.maxHeight = `calc(100dvh - ${r.bottom + 4 + 12}px)`
})

const postSet = computed(() => {
  const s = new Set()
  for (const p of allPosts) {
    s.add(p.url.replace(/^\/?blog\/?/, '').replace(/\/$/, ''))
  }
  return s
})

function currentRel() {
  let p = route.path
  if (p.startsWith(BASE)) p = p.slice(BASE.length)
  p = p.replace(/^\//, '').replace(/\/$/, '')
  if (LOCALES.some((l) => l.code === p.split('/')[0])) p = p.split('/').slice(1).join('/')
  return p
}

function href(code) {
  const rel = currentRel()
  if (rel) {
    const seg = rel.split('/')[0]
    if (seg === 'categories') {
      return withBase((code ? `/${code}` : '') + '/' + rel)
    }
    if (seg === 'posts') {
      const cand = (code ? code + '/' : '') + rel
      if (postSet.value.has(cand)) return withBase('/' + cand)
      return withBase(code ? `/${code}/` : '/')
    }
  }
  return withBase(code ? `/${code}/` : '/')
}

function currentLabel() {
  const l = LOCALES.find((x) => x.code === locale.value)
  return l ? l.label : 'English'
}

function toggle() {
  open.value = !open.value
}

function close() {
  open.value = false
}

function onDocClick(e) {
  if (!e.target.closest('.ws-lang')) open.value = false
}

function onKey(e) {
  if (e.key === 'Escape') open.value = false
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
  window.addEventListener('keydown', onKey)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div class="ws-lang">
    <button
      ref="btnEl"
      type="button"
      class="ws-lang-btn"
      :aria-expanded="open"
      aria-haspopup="listbox"
      :aria-label="t('language')"
      @click="toggle"
    >
      <span>{{ currentLabel() }}</span>
      <svg class="ws-chev" viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
        <path
          d="M4 6l4 4 4-4"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
    <div v-show="open" ref="menuEl" class="ws-lang-menu" role="listbox" :aria-label="t('languages')">
      <a
        v-for="l in LOCALES"
        :key="l.code || 'en'"
        class="ws-lang-opt"
        :class="{ 'ws-lang-opt-on': locale === l.code }"
        :href="href(l.code)"
        role="option"
        :aria-selected="locale === l.code"
        @click="close"
      >
        {{ l.label }}
      </a>
    </div>
  </div>
</template>