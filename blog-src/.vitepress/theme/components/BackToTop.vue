<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const show = ref(false)

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
    aria-label="Back to top"
    @click="toTop"
  >
    ↑
  </button>
</template>