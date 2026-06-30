<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'

import { ApiError } from '@/api/client'
import Icon from '@/components/Icon.vue'
import ImageUpload from '@/components/form/ImageUpload.vue'
import TextField from '@/components/form/TextField.vue'
import ToggleField from '@/components/form/ToggleField.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppModal from '@/components/ui/AppModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import type { Technology, TechnologyInput } from '@/api/types'
import { useTechnologies } from '@/composables/resources/collections'
import { assignKnown, toPayload } from '@/lib/forms'

const { items, loading, saving, index, create, update, remove } = useTechnologies()

const modalOpen = ref(false)
const editing = ref<Technology | null>(null)
const formError = ref<ApiError | null>(null)

function blank() {
  return {
    name: '',
    icon_url: null as string | null,
    icon_class: '',
    color: '',
    is_featured: false,
  }
}
const form = reactive(blank())

const colorValue = computed<string>({
  get: () => (/^#[0-9a-fA-F]{6}$/.test(form.color) ? form.color : '#000000'),
  set: (v) => {
    form.color = v
  },
})

function openCreate() {
  editing.value = null
  Object.assign(form, blank())
  formError.value = null
  modalOpen.value = true
}

function openEdit(item: Technology) {
  editing.value = item
  Object.assign(form, blank())
  assignKnown(form, item)
  formError.value = null
  modalOpen.value = true
}

async function submit() {
  formError.value = null
  try {
    const payload = toPayload(form) as TechnologyInput
    if (editing.value) await update(editing.value.id, payload)
    else await create(payload)
    modalOpen.value = false
    await index()
  } catch (e) {
    formError.value = ApiError.from(e)
  }
}

// Number of technologies marked as featured (shown on the home tech strip).
const featuredCount = computed(() => items.value.filter((t) => t.is_featured).length)

// Quick inline toggle so the home strip can be curated without opening the modal.
// `name` is resent to satisfy the backend's required + unique-ignore-self rule.
const featuringId = ref<number | null>(null)
async function toggleFeatured(item: Technology) {
  featuringId.value = item.id
  try {
    await update(item.id, { name: item.name, is_featured: !item.is_featured })
    await index()
  } finally {
    featuringId.value = null
  }
}

const toDelete = ref<Technology | null>(null)
const deleting = ref(false)
async function confirmDelete() {
  if (!toDelete.value) return
  deleting.value = true
  try {
    await remove(toDelete.value.id)
    toDelete.value = null
  } finally {
    deleting.value = false
  }
}

onMounted(() => index())
</script>

<template>
  <section>
    <PageHeader title="Technologies" badge="HOME PAGE" description="Tech-stack icons reused across skills and projects.">
      <template #actions>
        <AppButton @click="openCreate"><Icon name="plus" class="h-4 w-4" /> Add technology</AppButton>
      </template>
    </PageHeader>

    <p v-if="items.length" class="-mt-2 mb-5 flex items-center gap-1.5 font-mono text-xs text-secondary">
      <Icon name="star" class="h-3.5 w-3.5 fill-current text-brand" />
      {{ featuredCount }} featured — shown on the home page tech strip.
    </p>

    <div v-if="loading && !items.length" class="grid h-48 place-items-center text-secondary">
      <span class="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-brand" />
    </div>

    <div
      v-else-if="!items.length"
      class="grid place-items-center rounded-2xl border border-dashed border-line bg-card p-12 text-center"
    >
      <p class="font-mono text-sm text-secondary">&gt;_ No technologies yet.</p>
      <AppButton class="mt-4" @click="openCreate"><Icon name="plus" class="h-4 w-4" /> Add the first one</AppButton>
    </div>

    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="item in items"
        :key="item.id"
        class="flex items-center gap-3 rounded-2xl border bg-card p-4"
        :class="item.is_featured ? 'border-line-accent' : 'border-line'"
      >
        <span
          class="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl font-display font-bold"
          :style="{
            backgroundColor: (item.color || '#8888aa') + '22',
            color: item.color || 'var(--text-secondary)',
          }"
        >
          <img v-if="item.icon_url" :src="item.icon_url" :alt="item.name" class="h-7 w-7 object-contain" />
          <span v-else>{{ item.name.charAt(0).toUpperCase() }}</span>
        </span>
        <div class="min-w-0 flex-1">
          <p class="truncate font-medium text-primary">{{ item.name }}</p>
          <p class="truncate font-mono text-[11px] text-secondary">{{ item.color || item.icon_class || '—' }}</p>
        </div>
        <div class="flex shrink-0 gap-1">
          <button
            type="button"
            class="grid h-9 w-9 place-items-center rounded-lg transition-colors hover:bg-card-hover disabled:opacity-50"
            :class="item.is_featured ? 'text-brand' : 'text-secondary hover:text-primary'"
            :aria-label="item.is_featured ? 'Remove from home page' : 'Feature on home page'"
            :title="item.is_featured ? 'Featured on home page' : 'Show on home page'"
            :disabled="featuringId === item.id"
            @click="toggleFeatured(item)"
          >
            <Icon name="star" class="h-4 w-4" :class="item.is_featured ? 'fill-current' : ''" />
          </button>
          <button
            type="button"
            class="grid h-9 w-9 place-items-center rounded-lg text-secondary hover:bg-card-hover hover:text-primary"
            aria-label="Edit"
            @click="openEdit(item)"
          >
            <Icon name="edit" class="h-4 w-4" />
          </button>
          <button
            type="button"
            class="grid h-9 w-9 place-items-center rounded-lg text-secondary hover:bg-red-500/10 hover:text-red-500"
            aria-label="Delete"
            @click="toDelete = item"
          >
            <Icon name="trash" class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>

    <AppModal :open="modalOpen" :title="editing ? 'Edit technology' : 'New technology'" @close="modalOpen = false">
      <form id="tech-form" class="space-y-5" @submit.prevent="submit">
        <div
          v-if="formError && !formError.isValidation"
          class="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-500"
        >
          {{ formError.message }}
        </div>
        <TextField v-model="form.name" label="Name" required placeholder="Vue.js" :error="formError?.first('name')" />
        <ImageUpload v-model="form.icon_url" folder="technologies" label="Icon image" hint="SVG / PNG · optional" />
        <TextField
          v-model="form.icon_class"
          label="Icon class"
          placeholder="devicon-vuejs-plain"
          hint="Used when no icon image is set."
        />
        <div>
          <label class="mb-1.5 block text-sm font-medium text-primary">Brand color</label>
          <div class="flex items-center gap-2">
            <input
              v-model="colorValue"
              type="color"
              class="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-line bg-card"
            />
            <TextField v-model="form.color" class="flex-1" placeholder="#42B883" :error="formError?.first('color')" />
          </div>
        </div>
        <ToggleField
          v-model="form.is_featured"
          label="Featured on home page"
          hint="Featured technologies appear in the home page tech strip (pick ~5)."
        />
      </form>
      <template #footer>
        <AppButton variant="ghost" @click="modalOpen = false">Cancel</AppButton>
        <AppButton type="submit" form="tech-form" :loading="saving">
          {{ editing ? 'Save' : 'Create' }}
        </AppButton>
      </template>
    </AppModal>

    <ConfirmDialog
      :open="!!toDelete"
      title="Delete technology?"
      :message="`“${toDelete?.name ?? ''}” will be permanently removed.`"
      :loading="deleting"
      @confirm="confirmDelete"
      @cancel="toDelete = null"
    />
  </section>
</template>
