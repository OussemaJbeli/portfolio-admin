<script setup lang="ts">
import { computed, onMounted } from 'vue'

import Icon from '@/components/Icon.vue'
import type { IconName } from '@/components/icons'
import { useAuth } from '@/composables/useAuth'

const { user, fetchMe } = useAuth()

const firstName = computed(() => user.value?.name?.split(/\s+/)[0] ?? 'there')

onMounted(() => {
  if (!user.value) fetchMe().catch(() => {})
})

// Placeholder summary tiles — wire to the API later.
const stats: { label: string; value: string; icon: IconName; to: string }[] = [
  { label: 'Projects', value: '—', icon: 'projects', to: '/projects' },
  { label: 'Blog posts', value: '—', icon: 'blogs', to: '/blogs' },
  { label: 'Technologies', value: '—', icon: 'technologies', to: '/technologies' },
  { label: 'Unread messages', value: '—', icon: 'messages', to: '/messages' },
]

const quickLinks: { label: string; icon: IconName; to: string }[] = [
  { label: 'Edit Hero', icon: 'hero', to: '/hero' },
  { label: 'Edit About', icon: 'about', to: '/about' },
  { label: 'New Project', icon: 'projects', to: '/projects' },
  { label: 'New Post', icon: 'blogs', to: '/blogs' },
  { label: 'Site Settings', icon: 'settings', to: '/settings' },
]
</script>

<template>
  <section>
    <!-- Greeting -->
    <header class="mb-8">
      <p class="font-mono text-xs tracking-widest text-accent">&gt;_ OVERVIEW</p>
      <h1 class="mt-1 font-display text-3xl font-extrabold tracking-tight text-primary">
        Welcome back, <span class="text-brand">{{ firstName }}</span
        ><span class="text-brand caret-blink">_</span>
      </h1>
      <p class="mt-1 text-sm text-secondary">Here's a snapshot of your portfolio content.</p>
    </header>

    <!-- Summary tiles -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <RouterLink
        v-for="stat in stats"
        :key="stat.label"
        :to="stat.to"
        class="group rounded-2xl border border-line bg-card p-5 transition-colors hover:border-line-accent hover:bg-card-hover"
      >
        <div class="flex items-center justify-between">
          <span
            class="grid h-11 w-11 place-items-center rounded-xl border border-line-accent bg-brand/15 text-brand"
          >
            <Icon :name="stat.icon" class="h-5 w-5" />
          </span>
          <Icon
            name="chevron"
            class="h-4 w-4 text-secondary transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
          />
        </div>
        <p class="mt-4 font-display text-3xl font-extrabold text-primary">{{ stat.value }}</p>
        <p class="mt-1 text-sm text-secondary">{{ stat.label }}</p>
      </RouterLink>
    </div>

    <!-- Quick actions -->
    <div class="mt-8 rounded-2xl border border-line bg-card p-6">
      <p class="font-mono text-xs tracking-widest text-accent">&gt;_ QUICK ACTIONS</p>
      <h2 class="mt-1 font-display text-lg font-bold text-primary">Jump back in</h2>
      <div class="mt-4 flex flex-wrap gap-3">
        <RouterLink
          v-for="link in quickLinks"
          :key="link.label"
          :to="link.to"
          class="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-primary transition-colors hover:border-line-accent hover:text-brand"
        >
          <Icon :name="link.icon" class="h-4 w-4" />
          {{ link.label }}
        </RouterLink>
      </div>
    </div>
  </section>
</template>
