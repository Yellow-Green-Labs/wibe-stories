<script setup>
import { computed } from 'vue'
import { useI18n } from '../i18n'
import { withBase } from 'vitepress'

const { locale, t } = useI18n()
const blogHome = withBase(locale.value ? `/${locale.value}/` : '/')
const wordmark = withBase('/assets/BLOG-LOGO-W.png')
const yglLogo = withBase('/assets/YGL-L-W.png')
const APP_URL = 'https://wibestories.vercel.app'
const SOCIAL = computed(() => [
  { href: 'https://x.com/wibestories', label: t('followX'), icon: 'fa-brands fa-x-twitter' },
  { href: 'https://www.linkedin.com/company/wibestories', label: t('followLinkedIn'), icon: 'fa-brands fa-linkedin-in' },
])
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
<p class="footer-independence">{{ t('independence') }}</p>
        <div class="footer-social">
          <a
            v-for="s in SOCIAL"
            :key="s.href"
            :href="s.href"
            target="_blank"
            rel="noopener"
            class="footer-social-link"
            :aria-label="s.label"
            :title="s.label"
          >
            <i :class="s.icon" aria-hidden="true"></i>
          </a>
        </div>
      </div>

      <nav class="footer-col" :aria-label="t('explore')">
        <h3>{{ t('explore') }}</h3>
        <a :href="blogHome">{{ t('home') }}</a>
        <a :href="APP_URL" target="_blank" rel="noopener">{{ t('createCard') }}</a>
        <a href="https://tally.so/r/obaD1M" target="_blank" rel="noopener">{{ t('contactUs') }}</a>
      </nav>

      <nav class="footer-col" :aria-label="t('legal')">
        <h3>{{ t('legal') }}</h3>
        <a :href="APP_URL + '/docs/legal/privacy'" target="_blank" rel="noopener">{{ t('legalPrivacy') }}</a>
        <a :href="APP_URL + '/docs/legal/terms'" target="_blank" rel="noopener">{{ t('legalTerms') }}</a>
        <a :href="APP_URL + '/docs/legal/refund'" target="_blank" rel="noopener">{{ t('legalRefund') }}</a>
      </nav>
    </div>

    <p class="footer-independence footer-independence-bottom">{{ t('independence') }}</p>
  </footer>
</template>
