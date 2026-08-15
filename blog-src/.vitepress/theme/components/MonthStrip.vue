<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useI18n, parseDate } from '../i18n'

const props = defineProps({
  posts: { type: Array, default: () => [] },
  selected: { type: String, default: '' },
})

const emit = defineEmits(['update'])

const { t, locale } = useI18n()

const localeMap = {
  th: 'th-TH', ko: 'ko-KR', ja: 'ja-JP', es: 'es-ES',
  it: 'it-IT', tl: 'fil-PH', tr: 'tr-TR', sv: 'sv-SE',
}

const fmt = computed(() =>
  new Intl.DateTimeFormat(localeMap[locale.value] || 'en-US', { month: 'short' })
)

const months = computed(() => {
  const list = []
  for (let i = 1; i <= 12; i++) {
    list.push({ num: String(i).padStart(2, '0'), short: fmt.value.format(new Date(2024, i - 1, 1)) })
  }
  return list
})

const years = computed(() => {
  const set = new Set()
  for (const p of props.posts) set.add(parseDate(p.date).getFullYear())
  return [...set].sort((a, b) => b - a)
})

const selYear = computed(() => {
  if (props.selected) return Number(props.selected.slice(0, 4))
  const y = new Date().getFullYear()
  return years.value.includes(y) ? y : years.value[0] || y
})

const selMonth = computed(() =>
  props.selected.length === 7 ? props.selected.slice(5) : 'all'
)

const selMonthName = computed(() => {
  if (selMonth.value === 'all') return t('allMonths')
  const m = months.value.find((x) => x.num === selMonth.value)
  return m ? m.short : t('allMonths')
})

const monthHasPosts = computed(() => {
  const map = {}
  for (const p of props.posts) {
    const d = parseDate(p.date)
    const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
    map[k] = true
  }
  return map
})

const yearOpen = ref(false)
const monthOpen = ref(false)

function pickYear(y) {
  yearOpen.value = false
  if (y !== selYear.value) emit('update', String(y))
}

function pickMonth(m) {
  monthOpen.value = false
  emit('update', m === 'all' ? String(selYear.value) : String(selYear.value) + '-' + m)
}

function onDocClick(e) {
  if (!e.target.closest('.ws-mfilter')) {
    yearOpen.value = false
    monthOpen.value = false
  }
}

function onKey(e) {
  if (e.key === 'Escape') {
    yearOpen.value = false
    monthOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
  window.addEventListener('keydown', onKey)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div class="ws-months">
    <span class="ws-filter-label">{{ t('filterBy') }}</span>

    <div class="ws-year-row">
      <button
        v-for="y in years"
        :key="y"
        class="ws-year"
        :class="{ 'ws-year-on': y === selYear }"
        @click="pickYear(y)"
      >
        {{ y }}
      </button>
    </div>

    <div class="ws-month-row">
      <button
        class="ws-month"
        :class="{ 'ws-month-on': selMonth === 'all' }"
        @click="pickMonth('all')"
      >
        {{ t('allMonths') }}
      </button>
      <button
        v-for="m in months"
        :key="m.num"
        class="ws-month"
        :class="{
          'ws-month-on': selMonth === m.num,
          'ws-month-disabled': !monthHasPosts[selYear + '-' + m.num],
        }"
        @click="pickMonth(m.num)"
      >
        {{ m.short }}
      </button>
    </div>

    <div class="ws-select-row">
      <div class="ws-mfilter">
        <button
          type="button"
          class="ws-mfilter-btn"
          :aria-label="t('year')"
          :aria-expanded="yearOpen"
          @click="yearOpen = !yearOpen"
        >
          <span>{{ selYear }}</span>
          <svg class="ws-chev" viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
            <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <div v-show="yearOpen" class="ws-mfilter-menu" role="listbox" :aria-label="t('year')">
          <button
            v-for="y in years"
            :key="y"
            type="button"
            class="ws-mfilter-opt"
            :class="{ 'ws-mfilter-opt-on': y === selYear }"
            role="option"
            :aria-selected="y === selYear"
            @click="pickYear(y)"
          >
            {{ y }}
          </button>
        </div>
      </div>
      <div class="ws-mfilter">
        <button
          type="button"
          class="ws-mfilter-btn"
          :aria-label="t('month')"
          :aria-expanded="monthOpen"
          @click="monthOpen = !monthOpen"
        >
          <span>{{ selMonthName }}</span>
          <svg class="ws-chev" viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
            <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <div v-show="monthOpen" class="ws-mfilter-menu" role="listbox" :aria-label="t('month')">
          <button
            type="button"
            class="ws-mfilter-opt"
            :class="{ 'ws-mfilter-opt-on': selMonth === 'all' }"
            role="option"
            :aria-selected="selMonth === 'all'"
            @click="pickMonth('all')"
          >
            {{ t('allMonths') }}
          </button>
          <button
            v-for="m in months"
            :key="m.num"
            type="button"
            class="ws-mfilter-opt"
            :class="{ 'ws-mfilter-opt-on': selMonth === m.num }"
            role="option"
            :aria-selected="selMonth === m.num"
            :disabled="!monthHasPosts[selYear + '-' + m.num]"
            @click="pickMonth(m.num)"
          >
            {{ m.short }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
