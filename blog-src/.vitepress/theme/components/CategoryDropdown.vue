<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from '../i18n'
import { withBase } from 'vitepress'

const props = defineProps({
  current: { type: String, default: '' },
})

const { t, cats, locale } = useI18n()
const open = ref(false)

function href(key) {
  const base = locale.value ? `/${locale.value}` : ''
  return withBase(key ? `${base}/categories/${key}` : `${base}/`)
}

const label = computed(() => {
  if (props.current) {
    const c = cats.value.find((x) => x.key === props.current)
    return c ? c.name : t('allCategories')
  }
  return t('allCategories')
})

function toggle() {
  open.value = !open.value
}

function close() {
  open.value = false
}

function onDocClick(e) {
  if (!e.target.closest('.ws-cat-select')) open.value = false
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
  <div class="ws-cat-select">
    <span v-if="current" class="ws-cat-select-label">{{ t('categories') }}</span>
    <button
      type="button"
      class="ws-cat-select-btn"
      :aria-expanded="open"
      aria-haspopup="listbox"
      :aria-label="t('categories')"
      @click="toggle"
    >
      <span>{{ label }}</span>
      <svg class="ws-chev" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
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
    <div v-show="open" class="ws-cat-select-menu" role="listbox" :aria-label="t('categories')">
      <a
        class="ws-cat-select-opt"
        :class="{ 'ws-cat-select-opt-on': current === '' }"
        :href="href('')"
        role="option"
        :aria-selected="current === ''"
        @click="close"
      >
        {{ t('allCategories') }}
      </a>
      <a
        v-for="c in cats"
        :key="c.key"
        class="ws-cat-select-opt"
        :class="{ 'ws-cat-select-opt-on': current === c.key }"
        :href="href(c.key)"
        role="option"
        :aria-selected="current === c.key"
        @click="close"
      >
        {{ c.name }}
      </a>
    </div>
  </div>
</template>