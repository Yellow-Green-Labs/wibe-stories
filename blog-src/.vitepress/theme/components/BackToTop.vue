<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from '../i18n'

const show = ref(false)
const { t } = useI18n()

function onScroll() {
  show.value = window.scrollY > 640
}

function toTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <button
    class="ws-backtop"
    :class="{ 'ws-show': show }"
    :aria-label="t('backToTop')"    @click="toTop"
  >
    ↑
  </button>
</template>