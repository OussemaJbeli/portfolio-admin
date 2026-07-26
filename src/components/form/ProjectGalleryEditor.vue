<script setup lang="ts">
import { ref, watch } from 'vue'

import { api, ApiError, uploadImage } from '@/api/client'
import Icon from '@/components/Icon.vue'
import LangSwitch from '@/components/form/LangSwitch.vue'
import { assetUrl } from '@/composables/useBaseUrl'
import { useFormLocale } from '@/composables/useFormLocale'
import type { ProjectGallery } from '@/api/types'

const props = defineProps<{
  /** Slug of the project being edited, or null while creating a new one. */
  projectSlug: string | null
  /** Bumped by the parent every time the modal opens, to force a reload. */
  revision: number
}>()

type Row = {
  /** Server id once persisted; null for freshly-uploaded (buffered) rows. */
  id: number | null
  image_url: string
  alt_en: string
  alt_fr: string
  alt_ar: string
}

const rows = ref<Row[]>([])
/** Ids of persisted rows the user removed — deleted on flush. */
const removedIds = ref<number[]>([])
const loading = ref(false)
const uploading = ref(false)
const error = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const lang = useFormLocale()
const ALT_KEYS = { en: 'alt_en', fr: 'alt_fr', ar: 'alt_ar' } as const
function altValue(row: Row): string {
  return row[ALT_KEYS[lang.value]]
}
function setAlt(row: Row, event: Event): void {
  row[ALT_KEYS[lang.value]] = (event.target as HTMLInputElement).value
}

function toRow(item: ProjectGallery): Row {
  return {
    id: item.id,
    image_url: item.image_url,
    alt_en: item.alt_en ?? '',
    alt_fr: item.alt_fr ?? '',
    alt_ar: item.alt_ar ?? '',
  }
}

async function load(): Promise<void> {
  rows.value = []
  removedIds.value = []
  error.value = null
  if (!props.projectSlug) return // create mode — start empty, buffer uploads
  loading.value = true
  try {
    const items = await api.get<ProjectGallery[]>(`/admin/projects/${props.projectSlug}/gallery`)
    rows.value = items.map(toRow)
  } catch (err) {
    error.value = ApiError.from(err).message
  } finally {
    loading.value = false
  }
}

// Reload whenever the modal (re)opens or the edited project changes.
watch(() => [props.revision, props.projectSlug], load, { immediate: true })

function pick(): void {
  fileInput.value?.click()
}

async function onFiles(event: Event): Promise<void> {
  const files = (event.target as HTMLInputElement).files
  if (!files?.length) return
  uploading.value = true
  error.value = null
  try {
    for (const file of Array.from(files)) {
      const { url } = await uploadImage('projects', file)
      rows.value.push({ id: null, image_url: url, alt_en: '', alt_fr: '', alt_ar: '' })
    }
  } catch (err) {
    error.value = ApiError.from(err).message
  } finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

function move(index: number, direction: -1 | 1): void {
  const target = index + direction
  if (target < 0 || target >= rows.value.length) return
  const next = rows.value.slice()
  ;[next[index], next[target]] = [next[target], next[index]]
  rows.value = next
}

function removeRow(index: number): void {
  const [removed] = rows.value.splice(index, 1)
  if (removed?.id != null) removedIds.value.push(removed.id)
}

/**
 * Persist the gallery for `slug`: delete removed rows, then create/update the
 * rest in display order. The parent calls this after the project itself saves,
 * so both create-mode buffered uploads and edit-mode changes flush here.
 */
async function flush(slug: string): Promise<void> {
  for (const id of removedIds.value) {
    await api.delete(`/admin/gallery/${id}`)
  }
  removedIds.value = []

  for (let i = 0; i < rows.value.length; i++) {
    const row = rows.value[i]
    const payload = {
      image_url: row.image_url,
      alt_en: row.alt_en || null,
      alt_fr: row.alt_fr || null,
      alt_ar: row.alt_ar || null,
      sort_order: i + 1,
    }
    if (row.id == null) {
      const created = await api.post<ProjectGallery>(`/admin/projects/${slug}/gallery`, payload)
      row.id = created.id
    } else {
      await api.put(`/admin/gallery/${row.id}`, payload)
    }
  }
}

defineExpose({ flush })
</script>

<template>
  <div>
    <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
      <label class="text-sm font-medium text-primary">
        Gallery
        <span class="ml-1 font-mono text-[11px] text-secondary">{{ rows.length }} image(s)</span>
      </label>
      <div class="flex items-center gap-2">
        <LangSwitch />
        <button
          type="button"
          :disabled="uploading"
          class="inline-flex items-center gap-2 rounded-full border border-line-accent px-4 py-2 text-sm font-semibold text-primary hover:bg-card-hover disabled:opacity-60"
          @click="pick"
        >
          <Icon name="upload" class="h-4 w-4" />
          {{ uploading ? 'Uploading…' : 'Add images' }}
        </button>
      </div>
    </div>

    <p v-if="error" class="mb-3 text-xs text-red-500">{{ error }}</p>

    <div v-if="loading" class="grid h-20 place-items-center text-secondary">
      <span class="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-brand" />
    </div>

    <div
      v-else-if="!rows.length"
      class="grid place-items-center rounded-xl border border-dashed border-line bg-card p-6 text-center"
    >
      <p class="font-mono text-[11px] text-secondary">&gt;_ No gallery images yet. Add some above.</p>
    </div>

    <ul v-else class="space-y-2">
      <li
        v-for="(row, index) in rows"
        :key="row.id ?? `new-${index}`"
        class="flex items-center gap-3 rounded-xl border border-line bg-card p-2"
      >
        <div class="h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-line bg-page">
          <img :src="assetUrl(row.image_url)" alt="" class="h-full w-full object-cover" />
        </div>

        <input
          :value="altValue(row)"
          type="text"
          :dir="lang === 'ar' ? 'rtl' : 'ltr'"
          :placeholder="`Alt text (${lang})`"
          class="min-w-0 flex-1 rounded-lg border border-line bg-page px-3 py-2 text-sm text-primary placeholder:text-secondary/50 focus:border-line-accent focus:outline-none"
          @input="setAlt(row, $event)"
        />

        <div class="flex shrink-0 items-center gap-1">
          <button
            type="button"
            :disabled="index === 0"
            aria-label="Move up"
            class="grid h-8 w-8 place-items-center rounded-lg text-secondary hover:bg-card-hover hover:text-primary disabled:opacity-30"
            @click="move(index, -1)"
          >
            <Icon name="chevron" class="h-4 w-4 -rotate-90" />
          </button>
          <button
            type="button"
            :disabled="index === rows.length - 1"
            aria-label="Move down"
            class="grid h-8 w-8 place-items-center rounded-lg text-secondary hover:bg-card-hover hover:text-primary disabled:opacity-30"
            @click="move(index, 1)"
          >
            <Icon name="chevron" class="h-4 w-4 rotate-90" />
          </button>
          <button
            type="button"
            aria-label="Remove"
            class="grid h-8 w-8 place-items-center rounded-lg text-secondary hover:bg-red-500/10 hover:text-red-500"
            @click="removeRow(index)"
          >
            <Icon name="trash" class="h-4 w-4" />
          </button>
        </div>
      </li>
    </ul>

    <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="onFiles" />
  </div>
</template>
