<script setup>
import { computed } from 'vue'
import { useI18n } from '../i18n'

const props = defineProps({
  posts: { type: Array, default: () => [] },
  selected: { type: String, default: '' },
  empty: { type: Boolean, default: false },
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
  for (const p of props.posts) set.add(new Date(p.date).getFullYear())
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

const monthHasPosts = computed(() => {
  const map = {}
  for (const p of props.posts) {
    const d = new Date(p.date)
    const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
    map[k] = true
  }
  return map
})

function pickYear(y) {
  if (y !== selYear.value) emit('update', String(y))
}

function pickMonth(m) {
  emit('update', m === 'all' ? String(selYear.value) : String(selYear.value) + '-' + m)
}
</script>

<template>
  <div class="ws-months">
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
      <select class="ws-select" aria-label="Year" @change="pickYear(Number($event.target.value))">
        <option v-for="y in years" :key="y" :value="y" :selected="y === selYear">{{ y }}</option>
      </select>
      <select class="ws-select" aria-label="Month" @change="pickMonth($event.target.value)">
        <option value="all" :selected="selMonth === 'all'">{{ t('allMonths') }}</option>
        <option
          v-for="m in months"
          :key="m.num"
          :value="m.num"
          :selected="selMonth === m.num"
          :disabled="!monthHasPosts[selYear + '-' + m.num]"
        >
          {{ m.short }}
        </option>
      </select>
    </div>

    <div v-if="empty" class="ws-month-empty-note">{{ t('emptyMonth') }}</div>
  </div>
</template>
