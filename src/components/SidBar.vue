<script setup lang="ts">
import { useRoute } from 'vue-router'

import Icon from '@/components/Icon.vue'
import { navGroups } from '@/config/navigation'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const route = useRoute()

/** Exact match for the dashboard root, prefix match for everything else. */
function isActive(to: string): boolean {
  if (to === '/') return route.path === '/'
  return route.path === to || route.path.startsWith(`${to}/`)
}
</script>

<template>
  <aside
    class="fixed inset-y-0 left-0 z-40 flex w-64 transform flex-col border-r border-line bg-nav transition-transform duration-200 ease-out lg:translate-x-0"
    :class="open ? 'translate-x-0' : '-translate-x-full'"
  >
    <!-- Brand -->
    <div class="flex h-16 shrink-0 items-center gap-3 border-b border-line px-5">
      <div
        class="grid h-9 w-9 place-items-center rounded-xl bg-brand font-display text-sm font-extrabold text-[#1a1f3c] glow-brand"
      >
        OJ.
      </div>
      <div class="leading-tight">
        <p class="font-display text-sm font-bold text-primary">Portfolio CMS</p>
        <p class="font-mono text-[11px] text-accent">&gt;_ admin</p>
      </div>
      <button
        type="button"
        class="ml-auto grid h-8 w-8 place-items-center rounded-lg text-secondary hover:bg-card-hover hover:text-primary lg:hidden"
        aria-label="Close menu"
        @click="emit('close')"
      >
        <Icon name="close" class="h-5 w-5" />
      </button>
    </div>

    <!-- Nav -->
    <nav class="flex-1 space-y-6 overflow-y-auto px-3 py-5">
      <div v-for="group in navGroups" :key="group.label">
        <p class="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-secondary/60">
          {{ group.label }}
        </p>
        <ul class="space-y-1">
          <li v-for="link in group.links" :key="link.to">
            <RouterLink
              :to="link.to"
              class="group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors"
              :class="
                isActive(link.to)
                  ? 'border-line-accent bg-brand/15 text-brand'
                  : 'border-transparent text-secondary hover:bg-card-hover hover:text-primary'
              "
              @click="emit('close')"
            >
              <Icon
                :name="link.icon"
                class="h-5 w-5 shrink-0"
                :class="isActive(link.to) ? 'text-brand' : 'text-secondary group-hover:text-primary'"
              />
              <span>{{ link.label }}</span>
            </RouterLink>
          </li>
        </ul>
      </div>
    </nav>

    <!-- Footer note -->
    <div class="shrink-0 border-t border-line px-5 py-4">
      <p class="font-mono text-[11px] text-secondary">&gt;_ v0.1.0</p>
      <p class="font-script text-lg leading-tight text-accent">Building the future</p>
    </div>
  </aside>
</template>
