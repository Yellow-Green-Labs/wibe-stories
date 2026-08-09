<script setup>
import { LOCALES, useLocale } from '../i18n'
import { withBase } from 'vitepress'
import { computed } from 'vue'

const props = defineProps({
  variant: { type: String, default: 'pills' },
})

const locale = useLocale()
const currentHref = computed(() => href(locale.value))

function href(code) {
  return withBase(code ? `/${code}/` : '/')
}

function onSelect(e) {
  window.location.href = e.target.value
}
</script>

<template>
  <nav v-if="variant === 'pills'" class="ws-pills ws-pills-row" aria-label="Languages">
    <a
      v-for="l in LOCALES"
      :key="l.code || 'en'"
      class="ws-pill"
      :class="{ 'ws-pill-on': locale === l.code }"
      :href="href(l.code)"
    >
      {{ l.label }}
    </a>
  </nav>
  <select v-else class="ws-lang-select" :value="currentHref" aria-label="Language" @change="onSelect">
    <option v-for="l in LOCALES" :key="l.code || 'en'" :value="href(l.code)">
      {{ l.label }}
    </option>
  </select>
</template>

<style scoped>
.ws-lang-select {
  padding: 6px 10px;
  border: 1px solid var(--rule);
  border-radius: 4px;
  background: var(--cream);
  color: var(--ink);
  font-size: 13.5px;
  font-family: inherit;
  cursor: pointer;
  outline: none;
}
</style>