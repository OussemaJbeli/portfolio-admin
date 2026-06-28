<script setup lang="ts">
// Reusable blueprint scaffold for not-yet-built dashboard pages.
defineProps<{
  title: string
  badge?: string
  description?: string
}>()
</script>

<template>
  <section>
    <header class="mb-6">
      <p v-if="badge" class="font-mono text-xs tracking-widest text-accent">&gt;_ {{ badge }}</p>
      <h1 class="mt-1 font-display text-2xl font-extrabold tracking-tight text-primary">
        {{ title }}
      </h1>
      <p v-if="description" class="mt-1 text-sm text-secondary">{{ description }}</p>
    </header>

    <div
      class="grid min-h-[16rem] place-items-center rounded-2xl border border-dashed border-line bg-card p-10 text-center"
    >
      <div>
        <p class="font-display text-lg font-bold text-primary">Blueprint</p>
        <p class="mt-1 font-mono text-sm text-secondary">
          &gt;_ This page is scaffolded — build it next.
        </p>
        <slot />
      </div>
    </div>
  </section>
</template>
