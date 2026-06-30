<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  type?: 'button' | 'submit'
  disabled?: boolean
  loading?: boolean
}>()

const base =
  'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60'

const variants: Record<string, string> = {
  primary: 'bg-brand text-[#1a1f3c] glow-brand hover:bg-brand-hover',
  secondary: 'border border-line-accent text-primary hover:bg-card-hover',
  ghost: 'border border-line text-secondary hover:bg-card-hover hover:text-primary',
  danger: 'border border-red-500/50 text-red-500 hover:bg-red-500/10',
}

const classes = computed(() => `${base} ${variants[props.variant ?? 'primary']}`)
</script>

<template>
  <button :type="type ?? 'button'" :disabled="disabled || loading" :class="classes">
    <span
      v-if="loading"
      class="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current"
      aria-hidden="true"
    />
    <slot />
  </button>
</template>
