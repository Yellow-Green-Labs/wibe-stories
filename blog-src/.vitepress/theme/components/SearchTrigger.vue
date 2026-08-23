<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from '../i18n'

const { t } = useI18n()
defineProps({
  panel: { type: Boolean, default: false }
})
const emit = defineEmits(['open'])

const kbdHint = ref('Ctrl K')
onMounted(() => {
  if (typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)) kbdHint.value = '⌘K'
})
</script>

<template>
  <button
    type="button"
    class="ws-search-trigger"
    :class="{ 'ws-search-trigger-btn': panel }"
    :aria-label="t('searchLabel')"
    @click="emit('open')"
  >
    <svg class="ws-search-icon" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="4.5" fill="none" stroke="currentColor" stroke-width="1.5" />
      <line x1="10.2" y1="10.2" x2="13.8" y2="13.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    </svg>
    <span class="ws-search-trigger-text">{{ t('search') }}</span>
    <kbd class="ws-search-kbd">{{ kbdHint }}</kbd>
  </button>
</template>