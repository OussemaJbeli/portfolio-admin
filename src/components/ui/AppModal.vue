<script setup lang="ts">
import { computed } from 'vue'

import Icon from '@/components/Icon.vue'

const props = defineProps<{
  open: boolean
  title?: string
  subtitle?: string
  size?: 'md' | 'lg' | 'xl'
}>()
const emit = defineEmits<{ close: [] }>()

const maxWidth = computed(
  () => ({ md: 'max-w-2xl', lg: 'max-w-3xl', xl: 'max-w-4xl' })[props.size ?? 'md'],
)
</script>

<template>
  <Teleport to="body">
    <transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-150"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:p-8"
        @click.self="emit('close')"
      >
        <div
          class="relative mx-auto w-full rounded-2xl border border-line bg-surface shadow-xl"
          :class="maxWidth"
        >
          <header class="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
            <div>
              <h3 v-if="title" class="font-display text-lg font-bold text-primary">{{ title }}</h3>
              <p v-if="subtitle" class="mt-0.5 text-sm text-secondary">{{ subtitle }}</p>
            </div>
            <button
              type="button"
              class="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-secondary hover:bg-card-hover hover:text-primary"
              aria-label="Close"
              @click="emit('close')"
            >
              <Icon name="close" class="h-5 w-5" />
            </button>
          </header>

          <div class="px-6 py-5">
            <slot />
          </div>

          <footer v-if="$slots.footer" class="flex justify-end gap-3 border-t border-line px-6 py-4">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </transition>
  </Teleport>
</template>
