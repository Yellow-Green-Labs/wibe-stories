<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from '../i18n'

const { t } = useI18n()
const show = ref(false)
const KEY = 'ws-consent'

function loadAnalytics() {
  const s = document.createElement('script')
  s.src = 'https://analytics.ahrefs.com/analytics.js'
  s.setAttribute('data-key', 'EFnnezz1QG1QnVT5w57f2A')
  s.async = true
  document.head.appendChild(s)
}

function accept() {
  localStorage.setItem(KEY, 'accepted')
  loadAnalytics()
  show.value = false
}

function decline() {
  localStorage.setItem(KEY, 'declined')
  show.value = false
}

onMounted(() => {
  if (!localStorage.getItem(KEY)) show.value = true
})
</script>

<template>
  <div v-if="show" class="ws-consent" role="region" aria-live="polite">
    <p class="ws-consent-text">{{ t('consentText') }}</p>
    <div class="ws-consent-actions">
      <button type="button" class="ws-consent-decline" @click="decline">{{ t('consentDecline') }}</button>
      <button type="button" class="ws-consent-accept" @click="accept">{{ t('consentAccept') }}</button>
    </div>
  </div>
</template>
