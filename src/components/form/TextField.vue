<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: string | null | undefined
  label?: string
  type?: 'text' | 'email' | 'url' | 'date' | 'datetime-local' | 'password'
  placeholder?: string
  required?: boolean
  error?: string
  hint?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [string] }>()

const value = computed<string>({
  get: () => props.modelValue ?? '',
  set: (v) => emit('update:modelValue', v),
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
      :type="type ?? 'text'"
      :placeholder="placeholder"
      class="w-full rounded-xl border border-line bg-card px-4 py-2.5 text-primary placeholder:text-secondary/50 focus:border-line-accent focus:outline-none"
    />
    <p v-if="error" class="mt-1.5 text-xs text-red-500">{{ error }}</p>
    <p v-else-if="hint" class="mt-1.5 text-xs text-secondary">{{ hint }}</p>
  </div>
</template>
