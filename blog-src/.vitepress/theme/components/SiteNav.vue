<script setup>
import { useI18n } from '../i18n'
import { withBase } from 'vitepress'
import SearchBox from './SearchBox.vue'
import LanguagePills from './LanguagePills.vue'

const { t } = useI18n()
const APP_URL = 'https://wibestories.vercel.app'
const logoLight = withBase('/WS-HORI-DARK.png')
</script>

<template>
  <header class="ws-nav">
    <div class="ws-container ws-nav-inner">
      <a class="ws-nav-logo" :href="APP_URL" aria-label="Wibe Stories">
        <img :src="logoLight" alt="Wibe Stories" />
      </a>
      <SearchBox />
      <LanguagePills variant="select" />
      <a class="ws-nav-cta" :href="APP_URL">{{ t('createCard') }}</a>
    </div>
  </header>
</template>
