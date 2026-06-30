<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: number | string | null | undefined
  label?: string
  options: { value: number | string; label: string }[]
  /** Label for the empty/none option. Omit to require a selection. */
  placeholder?: string
  required?: boolean
  error?: string
  hint?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [number | string | null] }>()

const selected = computed<string>({
  get: () => (props.modelValue === null || props.modelValue === undefined ? '' : String(props.modelValue)),
  set: (v) => {
    if (v === '') return emit('update:modelValue', null)
    const match = props.options.find((o) => String(o.value) === v)
    emit('update:modelValue', match ? match.value : v)
  },
})
</script>

<template>
  <div>
    <label v-if="label" class="mb-1.5 block text-sm font-medium text-primary">
      {{ label }}
      <span v-if="required" class="text-brand">*</span>
    </label>
    <select
      v-model="selected"
      class="w-full rounded-xl border border-line bg-card px-4 py-2.5 text-primary focus:border-line-accent focus:outline-none"
    >
      <option v-if="placeholder !== undefined" value="">{{ placeholder }}</option>
      <option v-for="opt in options" :key="String(opt.value)" :value="String(opt.value)">
        {{ opt.label }}
      </option>
    </select>
    <p v-if="error" class="mt-1.5 text-xs text-red-500">{{ error }}</p>
    <p v-else-if="hint" class="mt-1.5 text-xs text-secondary">{{ hint }}</p>
  </div>
</template>
