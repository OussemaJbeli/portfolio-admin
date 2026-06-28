<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import Icon from '@/components/Icon.vue'
import { titleForPath } from '@/config/navigation'
import { useAuth } from '@/composables/useAuth'

defineEmits<{ toggleSidebar: [] }>()

const route = useRoute()
const router = useRouter()
const { user, fetchMe, logout } = useAuth()

const pageTitle = computed(() => titleForPath(route.path))

const initials = computed(() => {
  const name = user.value?.name?.trim()
  if (!name) return 'AD'
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
})

onMounted(() => {
  if (!user.value) fetchMe().catch(() => {})
})

async function onLogout() {
  await logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <header
    class="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-nav/80 px-4 backdrop-blur sm:px-6"
  >
    <!-- Mobile sidebar toggle -->
    <button
      type="button"
      class="grid h-10 w-10 place-items-center rounded-xl border border-line text-secondary hover:bg-card-hover hover:text-primary lg:hidden"
      aria-label="Open menu"
      @click="$emit('toggleSidebar')"
    >
      <Icon name="menu" class="h-5 w-5" />
    </button>

    <!-- Page title -->
    <div class="min-w-0">
      <p class="font-mono text-[11px] tracking-widest text-accent">&gt;_ CMS</p>
      <h2 class="truncate font-display text-base font-bold leading-tight text-primary">
        {{ pageTitle }}
      </h2>
    </div>

    <!-- Search (decorative for now) -->
    <div class="ml-auto hidden items-center md:flex">
      <div class="relative">
        <Icon
          name="search"
          class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary"
        />
        <input
          type="search"
          placeholder="Search…"
          class="w-56 rounded-full border border-line bg-card py-2 pl-9 pr-4 text-sm text-primary placeholder:text-secondary/60 focus:border-line-accent focus:outline-none"
        />
      </div>
    </div>

    <!-- Notifications -->
    <button
      type="button"
      class="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line text-secondary hover:bg-card-hover hover:text-primary md:ml-0 ml-auto"
      aria-label="Notifications"
    >
      <Icon name="bell" class="h-5 w-5" />
      <span class="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-brand glow-brand" />
    </button>

    <!-- Divider -->
    <span class="hidden h-8 w-px bg-line sm:block" aria-hidden="true" />

    <!-- User chip -->
    <div class="flex shrink-0 items-center gap-3">
      <div
        class="grid h-10 w-10 place-items-center rounded-full border border-line-accent bg-brand/15 font-display text-sm font-bold text-brand"
      >
        {{ initials }}
      </div>
      <div class="hidden leading-tight sm:block">
        <p class="text-sm font-semibold text-primary">{{ user?.name ?? 'Admin' }}</p>
        <p class="font-mono text-[11px] capitalize text-secondary">{{ user?.role ?? 'editor' }}</p>
      </div>
      <button
        type="button"
        class="grid h-10 w-10 place-items-center rounded-xl border border-line text-secondary hover:border-line-accent hover:text-brand"
        aria-label="Log out"
        title="Log out"
        @click="onLogout"
      >
        <Icon name="logout" class="h-5 w-5" />
      </button>
    </div>
  </header>
</template>
