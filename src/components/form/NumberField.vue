<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: number | null | undefined
  label?: string
  placeholder?: string
  min?: number
  max?: number
  required?: boolean
  error?: string
  hint?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [number | null] }>()

const value = computed<number | ''>({
  get: () => (props.modelValue ?? '') as number | '',
  set: (v) => emit('update:modelValue', v === '' || v === null ? null : Number(v)),
})
</script>

<template>
  <div>
    <label v-if="label" class="mb-1.5 block text-sm font-medium text-primary">
      {{ label }}
      <span v-if="required" class="text-brand">*</span>
    </label>
    <input
      v-model="value"
      type="number"
      :min="min"
      :max="max"
      :placeholder="placeholder"
      class="w-full rounded-xl border border-line bg-card px-4 py-2.5 text-primary placeholder:text-secondary/50 focus:border-line-accent focus:outline-none"
    />
    <p v-if="error" class="mt-1.5 text-xs text-red-500">{{ error }}</p>
    <p v-else-if="hint" class="mt-1.5 text-xs text-secondary">{{ hint }}</p>
  </div>
</template>
