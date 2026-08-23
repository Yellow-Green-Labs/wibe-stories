<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from '../i18n'
import { withBase } from 'vitepress'
import SearchTrigger from './SearchTrigger.vue'
import SearchModal from './SearchModal.vue'
import LanguagePills from './LanguagePills.vue'
import { lockScroll, unlockScroll } from '../scroll-lock'

const { t, cats, locale } = useI18n()
const APP_URL = 'https://wibestories.vercel.app'
const logoLight = withBase('/BLOG-LOGO.png')

const open = ref(false)
const searchOpen = ref(false)
const homeHref = computed(() => withBase(locale.value ? `/${locale.value}/` : '/'))

watch(open, (v) => {
  if (v) lockScroll()
  else unlockScroll()
})

function catHref(key) {
  const base = locale.value ? `/${locale.value}` : ''
  return withBase(key ? `${base}/categories/${key}` : `${base}/`)
}

function toggle() {
  open.value = !open.value
}

function close() {
  open.value = false
}

function openSearch() {
  open.value = false
  searchOpen.value = true
}

function onDocClick(e) {
  if (!e.target.closest('.ws-nav, .ws-nav-panel')) open.value = false
}

function onKey(e) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    openSearch()
    return
  }
  if (e.key === 'Escape') open.value = false
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
  window.addEventListener('keydown', onKey)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
  window.removeEventListener('keydown', onKey)
  unlockScroll()
})
</script>

<template>
  <header class="ws-nav">
    <div class="ws-container ws-nav-inner">
      <a class="ws-nav-logo" :href="homeHref" aria-label="Wibe &amp; Wonder">
        <img :src="logoLight" alt="Wibe &amp; Wonder" />
      </a>

      <div class="ws-nav-desktop">
        <SearchTrigger @open="openSearch" />
        <LanguagePills />
        <a class="ws-nav-cta" :href="APP_URL">{{ t('createCard') }}</a>
      </div>

      <button
        type="button"
        class="ws-nav-toggle"
        :class="{ 'ws-open': open }"
        :aria-expanded="open"
        :aria-label="t('menu')"
        @click="toggle"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
  </header>

  <div v-show="open" class="ws-nav-overlay" @click="close" aria-hidden="true"></div>

  <div v-show="open" class="ws-nav-panel">
    <button type="button" class="ws-nav-panel-close" @click="close" :aria-label="t('close')">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6L6 18"></path><path d="M6 6l12 12"></path></svg>
    </button>
    <div class="ws-container ws-nav-panel-inner">
      <SearchTrigger :panel="true" @open="openSearch" />
      <div class="ws-nav-panel-field">
        <span class="ws-nav-panel-label">{{ t('categories') }}</span>
        <nav class="ws-nav-panel-cats" :aria-label="t('categories')">
          <a
            v-for="c in cats"
            :key="c.key"
            class="ws-nav-panel-cat"
            :href="catHref(c.key)"
            @click="close"
          >{{ c.name }}</a>
        </nav>
      </div>
      <div class="ws-nav-panel-field">
        <span class="ws-nav-panel-label">{{ t('language') }}</span>
        <LanguagePills />
      </div>
      <div class="ws-nav-panel-field">
        <a class="ws-nav-panel-cta" :href="APP_URL" @click="close">{{ t('createCard') }}</a>
        <p class="ws-nav-panel-hint">{{ t('createCardHint') }}</p>
      </div>
    </div>
  </div>

  <SearchModal v-if="searchOpen" @close="searchOpen = false" />
</template>
