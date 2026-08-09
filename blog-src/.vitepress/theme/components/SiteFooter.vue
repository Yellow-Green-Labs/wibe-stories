<script setup>
import { useI18n } from '../i18n'
import { withBase } from 'vitepress'

const { t, locale } = useI18n()
const APP_URL = 'https://wibestories.vercel.app'
const blogHome = withBase(locale.value ? `/${locale.value}/` : '/')
</script>

<template>
  <footer class="ws-footer">
    <div class="ws-container ws-footer-inner">
      <span>{{ t('footerRights') }}</span>
      <a :href="blogHome">{{ 'Wibe & Wonder' }}</a>
      <a :href="APP_URL">{{ t('appName') }}</a>
    </div>
  </footer>
</template>