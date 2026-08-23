<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useI18n } from '../i18n'

const { t } = useI18n()

const headings = ref([])
const active = ref('')
let ticking = false
let observer = null

const show = computed(() => headings.value.length >= 2)

function collect() {
  const body = document.querySelector('.ws-article-body')
  if (!body) {
    headings.value = []
    active.value = ''
    return
  }
  headings.value = Array.from(body.querySelectorAll('h2, h3'))
    .filter((h) => h.id)
    .map((h) => ({ id: h.id, text: h.textContent.trim(), level: h.tagName, el: h }))
  active.value = ''
  onScroll()
}

function onScroll() {
  ticking = false
  const top = window.scrollY + 120
  let cur = ''
  for (const h of headings.value) {
    if (h.el.getBoundingClientRect().top + window.scrollY <= top) cur = h.id
  }
  active.value = cur
}

function onTick() {
  if (ticking) return
  ticking = true
  requestAnimationFrame(onScroll)
}

onMounted(() => {
  collect()
  onScroll()
  window.addEventListener('scroll', onTick, { passive: true })
  window.addEventListener('resize', onTick, { passive: true })

  // Re-collect on SPA navigation
  observer = new MutationObserver(() => {
    nextTick(collect)
  })
  const body = document.querySelector('.ws-article-body')
  if (body) {
    observer.observe(body, { childList: true, subtree: true })
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onTick)
  window.removeEventListener('resize', onTick)
  if (observer) {
    observer.disconnect()
    observer = null
  }
})
</script>

<template>
  <div v-if="show" class="ws-toc">
    <h2 class="ws-toc-title">{{ t('onThisPage') }}</h2>
    <ul class="ws-toc-list">
      <li
        v-for="h in headings"
        :key="h.id"
        class="ws-toc-item"
        :class="{ 'ws-toc-h3': h.level === 'H3', 'ws-toc-on': h.id === active }"
      >
        <a class="ws-toc-link" :href="'#' + h.id">{{ h.text }}</a>
      </li>
    </ul>
  </div>
</template>
