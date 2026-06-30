<script setup lang="ts">
import AppButton from '@/components/ui/AppButton.vue'
import Icon from '@/components/Icon.vue'

defineProps<{
  open: boolean
  title?: string
  message?: string
  confirmLabel?: string
  loading?: boolean
}>()

const emit = defineEmits<{ confirm: []; cancel: [] }>()
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
        class="fixed inset-0 z-[60] grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
        @click.self="emit('cancel')"
      >
        <div class="w-full max-w-sm rounded-2xl border border-line bg-surface p-6 text-center shadow-xl">
          <div
            class="mx-auto grid h-12 w-12 place-items-center rounded-full border border-red-500/40 bg-red-500/10 text-red-500"
          >
            <Icon name="alert" class="h-6 w-6" />
          </div>
          <h3 class="mt-4 font-display text-lg font-bold text-primary">
            {{ title ?? 'Are you sure?' }}
          </h3>
          <p class="mt-1 text-sm text-secondary">
            {{ message ?? 'This action cannot be undone.' }}
          </p>
          <div class="mt-6 flex justify-center gap-3">
            <AppButton variant="ghost" :disabled="loading" @click="emit('cancel')">Cancel</AppButton>
            <AppButton variant="danger" :loading="loading" @click="emit('confirm')">
              {{ confirmLabel ?? 'Delete' }}
            </AppButton>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>
