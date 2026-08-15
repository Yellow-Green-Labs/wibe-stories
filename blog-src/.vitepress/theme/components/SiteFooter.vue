<script setup>
import { useI18n } from '../i18n'
import { withBase } from 'vitepress'

const { locale, t } = useI18n()
const blogHome = withBase(locale.value ? `/${locale.value}/` : '/')
const wordmark = withBase('/assets/BLOG-LOGO-W.png')
const yglLogo = withBase('/assets/YGL-L-W.png')
const APP_URL = 'https://wibestories.vercel.app'
</script>

<template>
  <footer class="footer">
    <div class="ws-container footer-grid">
      <div class="footer-brand">
        <a :href="blogHome" class="footer-wave">
          <img :src="wordmark" alt="Wibe &amp; Wonder" />
        </a>
        <a :href="APP_URL" target="_blank" rel="noopener" class="footer-publication">{{ t('publication') }}</a>
        <div class="footer-copyright">
          <span>{{ t('copyright') }}</span>
          <img :src="yglLogo" class="footer-logo" alt="YGLabs" />
        </div>
        <p>{{ t('independence') }}</p>
      </div>

      <nav class="footer-col" :aria-label="t('explore')">
        <h3>{{ t('explore') }}</h3>
        <a :href="blogHome">{{ t('home') }}</a>
        <a :href="APP_URL" target="_blank" rel="noopener">{{ t('createCard') }}</a>
      </nav>

      <nav class="footer-col" :aria-label="t('legal')">
        <h3>{{ t('legal') }}</h3>
        <a :href="APP_URL + '/docs/legal/privacy'" target="_blank" rel="noopener">{{ t('legalPrivacy') }}</a>
        <a :href="APP_URL + '/docs/legal/terms'" target="_blank" rel="noopener">{{ t('legalTerms') }}</a>
        <a :href="APP_URL + '/docs/legal/refund'" target="_blank" rel="noopener">{{ t('legalRefund') }}</a>
      </nav>
    </div>
  </footer>
</template>
