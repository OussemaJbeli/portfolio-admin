<script setup lang="ts">
import { computed } from 'vue'

import LangSwitch from '@/components/form/LangSwitch.vue'
import { useFormLocale } from '@/composables/useFormLocale'

const props = defineProps<{
  /** The reactive form object holding `<base>_en`, `<base>_fr`, `<base>_ar`. */
  form: Record<string, unknown>
  /** Field base name, e.g. `text` → text_en / text_fr / text_ar. */
  base: string
  label: string
  type?: 'text' | 'textarea'
  placeholder?: string
  rows?: number
  /** Marks the English value as required (visual only). */
  required?: boolean
  /** Server error for this field (active language). */
  error?: string
  hint?: string
}>()

const lang = useFormLocale()
const key = computed(() => `${props.base}_${lang.value}`)

const value = computed<string>({
  get: () => (props.form[key.value] as string | null) ?? '',
  set: (v) => {
    props.form[key.value] = v
  },
})

const isRtl = computed(() => lang.value === 'ar')
const inputClass =
  'w-full rounded-xl border border-line bg-card px-4 py-2.5 text-primary placeholder:text-secondary/50 focus:border-line-accent focus:outline-none'
</script>

<template>
  <div>
    <div class="mb-1.5 flex items-center justify-between gap-2">
      <label class="text-sm font-medium text-primary">
        {{ label }}
        <span v-if="required" class="text-brand">*</span>
      </label>
      <LangSwitch />
    </div>

    <textarea
      v-if="type === 'textarea'"
      v-model="value"
      :rows="rows ?? 4"
      :dir="isRtl ? 'rtl' : 'ltr'"
      :placeholder="placeholder"
      :class="inputClass"
    />
    <input
      v-else
      v-model="value"
      type="text"
      :dir="isRtl ? 'rtl' : 'ltr'"
      :placeholder="placeholder"
      :class="inputClass"
    />

    <p v-if="error" class="mt-1.5 text-xs text-red-500">{{ error }}</p>
    <p v-else-if="hint" class="mt-1.5 text-xs text-secondary">{{ hint }}</p>
  </div>
</template>
