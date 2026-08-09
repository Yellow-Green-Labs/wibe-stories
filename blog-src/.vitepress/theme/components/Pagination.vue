<script setup>
import { computed } from 'vue'

const props = defineProps({
  total: { type: Number, required: true },
  perPage: { type: Number, default: 10 },
  current: { type: Number, required: true },
})

const emit = defineEmits(['update'])

const pages = computed(() => Math.max(1, Math.ceil(props.total / props.perPage)))
const list = computed(() => {
  const out = []
  for (let i = 1; i <= pages.value; i++) out.push(i)
  return out
})

function go(n) {
  if (n >= 1 && n <= pages.value && n !== props.current) emit('update', n)
}
</script>

<template>
  <nav v-if="pages > 1" class="ws-pagination" aria-label="Pagination">
    <button class="ws-page-btn" :disabled="current <= 1" @click="go(current - 1)">←</button>
    <button
      v-for="n in list"
      :key="n"
      class="ws-page-btn"
      :class="{ 'ws-page-on': n === current }"
      @click="go(n)"
    >
      {{ n }}
    </button>
    <button class="ws-page-btn" :disabled="current >= pages" @click="go(current + 1)">→</button>
  </nav>
</template>