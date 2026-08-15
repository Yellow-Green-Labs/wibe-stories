<script setup>
import { ref, onUnmounted } from 'vue'
import { useI18n } from '../i18n'

const props = defineProps({
  url: { type: String, required: true },
  title: { type: String, default: '' },
  variant: { type: String, default: 'rail' }, // rail | top | foot
})

const { t } = useI18n()

const copied = ref(false)
let copyTimer = null

const u = encodeURIComponent(props.url)
const te = encodeURIComponent(props.title)
const hrefs = {
  x: 'https://twitter.com/intent/tweet?text=' + te + '&url=' + u,
  linkedin: 'https://www.linkedin.com/sharing/share-offsite/?url=' + u,
  facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + u,
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(props.url)
  } catch (e) {
    try {
      const ta = document.createElement('textarea')
      ta.value = props.url
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    } catch (e2) {
      /* clipboard unavailable */
    }
  }
  copied.value = true
  clearTimeout(copyTimer)
  copyTimer = setTimeout(() => {
    copied.value = false
  }, 2000)
}

onUnmounted(() => clearTimeout(copyTimer))
</script>

<template>
  <div
    class="ws-sharebar"
    :class="'ws-sharebar-' + variant"
    :aria-label="t('shareArticle')"
  >
    <div class="ws-sharebar-grid">
      <a
        class="ws-sharebar-btn"
        data-brand="x"
        :href="hrefs.x"
        target="_blank"
        rel="noopener"
        :aria-label="t('shareX')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"></path>
        </svg>
      </a>
      <a
        class="ws-sharebar-btn"
        data-brand="linkedin"
        :href="hrefs.linkedin"
        target="_blank"
        rel="noopener"
        :aria-label="t('shareLinkedIn')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"></path>
        </svg>
      </a>
      <a
        class="ws-sharebar-btn"
        data-brand="facebook"
        :href="hrefs.facebook"
        target="_blank"
        rel="noopener"
        :aria-label="t('shareFacebook')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
        </svg>
      </a>
      <button
        class="ws-sharebar-btn"
        data-brand="copy"
        type="button"
        :aria-label="copied ? t('copied') : t('shareCopy')"
        @click="copyLink"
      >
        <svg v-if="!copied" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </button>
    </div>
  </div>
</template>
