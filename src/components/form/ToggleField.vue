<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean | undefined
  label?: string
  hint?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [boolean] }>()
</script>

<template>
  <div class="flex items-center justify-between gap-4">
    <div v-if="label || hint">
      <p v-if="label" class="text-sm font-medium text-primary">{{ label }}</p>
      <p v-if="hint" class="text-xs text-secondary">{{ hint }}</p>
    </div>
    <button
      type="button"
      role="switch"
      :aria-checked="!!modelValue"
      class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors"
      :class="modelValue ? 'bg-brand' : 'bg-line'"
      @click="emit('update:modelValue', !modelValue)"
    >
      <span
        class="inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform"
        :class="modelValue ? 'translate-x-5' : 'translate-x-0.5'"
      />
    </button>
  </div>
</template>
