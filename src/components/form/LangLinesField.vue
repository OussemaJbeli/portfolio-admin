<script setup lang="ts">
import { computed } from 'vue'

import LangSwitch from '@/components/form/LangSwitch.vue'
import { useFormLocale } from '@/composables/useFormLocale'

/**
 * Multilingual list field — edits a `string[]` per language (one line each).
 * Used for the hero typewriter phrases (typewriter_en / _fr / _ar).
 */
const props = defineProps<{
  form: Record<string, unknown>
  base: string
  label: string
  placeholder?: string
  rows?: number
  hint?: string
}>()

const lang = useFormLocale()
const key = computed(() => `${props.base}_${lang.value}`)

const value = computed<string>({
  get: () => {
    const arr = props.form[key.value]
    return Array.isArray(arr) ? arr.join('\n') : ''
  },
  set: (v) => {
    props.form[key.value] = v
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
  },
})

const isRtl = computed(() => lang.value === 'ar')
</script>

<template>
  <div>
    <div class="mb-1.5 flex items-center justify-between gap-2">
      <label class="text-sm font-medium text-primary">{{ label }}</label>
      <LangSwitch />
    </div>
    <textarea
      v-model="value"
      :rows="rows ?? 4"
      :dir="isRtl ? 'rtl' : 'ltr'"
      :placeholder="placeholder ?? 'One phrase per line'"
      class="w-full rounded-xl border border-line bg-card px-4 py-2.5 font-mono text-sm text-primary placeholder:text-secondary/50 focus:border-line-accent focus:outline-none"
    />
    <p class="mt-1.5 text-xs text-secondary">{{ hint ?? 'One phrase per line.' }}</p>
  </div>
</template>
