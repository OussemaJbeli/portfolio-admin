<script setup lang="ts">
import { ref } from 'vue'

import { ApiError, uploadImage } from '@/api/client'
import Icon from '@/components/Icon.vue'
import { assetUrl } from '@/composables/useBaseUrl'

const props = defineProps<{
  modelValue: string | null | undefined
  /** Target folder under public/assets (e.g. 'hero', 'about'). */
  folder: string
  label?: string
  hint?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [string | null] }>()

const inputRef = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const error = ref<string | null>(null)

function pick() {
  inputRef.value?.click()
}

async function onChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  uploading.value = true
  error.value = null
  try {
    const result = await uploadImage(props.folder, file)
    emit('update:modelValue', result.url)
  } catch (err) {
    error.value = err instanceof ApiError ? (err.first('image') ?? err.message) : 'Upload failed'
  } finally {
    uploading.value = false
    if (inputRef.value) inputRef.value.value = ''
  }
}

function remove() {
  emit('update:modelValue', null)
}
</script>

<template>
  <div>
    <label v-if="label" class="mb-1.5 block text-sm font-medium text-primary">{{ label }}</label>

    <div class="flex items-center gap-4">
      <div
        class="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-card"
      >
        <img v-if="modelValue" :src="assetUrl(modelValue)" alt="" class="h-full w-full object-cover" />
        <Icon v-else name="image" class="h-7 w-7 text-secondary/40" />
      </div>

      <div class="space-y-2">
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            :disabled="uploading"
            class="inline-flex items-center gap-2 rounded-full border border-line-accent px-4 py-2 text-sm font-semibold text-primary hover:bg-card-hover disabled:opacity-60"
            @click="pick"
          >
            <Icon name="upload" class="h-4 w-4" />
            {{ uploading ? 'Uploading…' : modelValue ? 'Replace' : 'Upload' }}
          </button>
          <button
            v-if="modelValue"
            type="button"
            class="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-secondary hover:border-red-500/50 hover:text-red-500"
            @click="remove"
          >
            <Icon name="trash" class="h-4 w-4" />
            Remove
          </button>
        </div>
        <p class="font-mono text-[11px] text-secondary">{{ hint ?? 'PNG · JPG · WEBP · SVG · max 5MB' }}</p>
        <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
      </div>

      <input ref="inputRef" type="file" accept="image/*" class="hidden" @change="onChange" />
    </div>
  </div>
</template>
