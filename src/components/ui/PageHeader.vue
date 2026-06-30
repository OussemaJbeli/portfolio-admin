<script setup lang="ts">
defineProps<{ title: string; badge?: string; description?: string }>()
</script>

<template>
  <header class="mb-6 flex flex-wrap items-end justify-between gap-4">
    <div>
      <p v-if="badge" class="font-mono text-xs tracking-widest text-accent">&gt;_ {{ badge }}</p>
      <h1 class="mt-1 font-display text-2xl font-extrabold tracking-tight text-primary">
        {{ title }}
      </h1>
      <p v-if="description" class="mt-1 text-sm text-secondary">{{ description }}</p>
    </div>
    <div class="flex items-center gap-2">
      <slot name="actions" />
    </div>
  </header>
</template>
