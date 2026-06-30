<script setup lang="ts">
import { FORM_LANGS, useFormLocale } from '@/composables/useFormLocale'

const lang = useFormLocale()
</script>

<template>
  <div class="inline-flex rounded-lg border border-line bg-card p-0.5">
    <button
      v-for="l in FORM_LANGS"
      :key="l.code"
      type="button"
      class="rounded-md px-2 py-0.5 text-[11px] font-bold transition-colors"
      :class="
        lang === l.code
          ? 'bg-brand text-[#1a1f3c]'
          : 'text-secondary hover:text-primary'
      "
      @click="lang = l.code"
    >
      {{ l.label }}
    </button>
  </div>
</template>
