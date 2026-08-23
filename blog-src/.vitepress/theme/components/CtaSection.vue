<script setup>
import { useI18n } from '../i18n'

const APP_URL = 'https://wibestories.vercel.app'

const { t } = useI18n()
</script>

<template>
  <div class="cta-section">
    <div class="cta-title">{{ t('createCta') }}</div>
    <div class="cta-sub">{{ t('createCtaSub') }}</div>
    <a :href="APP_URL" class="cta-btn">
      {{ t('ctaButton') }}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"></path><path d="M13 6l6 6l-6 6"></path></svg>
    </a>
    <p class="wispr-cta-tagline">
      {{ t('ctaTaglinePre') }}
      <a href="https://wisprflow.ai/r?BEST76" target="_blank" rel="noopener" class="wispr-wave">Wispr Flow</a>
      {{ t('ctaTaglineFlow') }}
    </p>
    <div class="support-link">{{ t('supportQuestion') }} <a href="https://tally.so/r/obaD1M" target="_blank" rel="noopener">{{ t('supportContact') }}</a></div>
  </div>
</template>
