<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'

import { ApiError } from '@/api/client'
import Icon from '@/components/Icon.vue'
import LangField from '@/components/form/LangField.vue'
import NumberField from '@/components/form/NumberField.vue'
import TextField from '@/components/form/TextField.vue'
import ToggleField from '@/components/form/ToggleField.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppModal from '@/components/ui/AppModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import type { TechnologyGroup, TechnologyGroupInput } from '@/api/types'
import { useTechnologyGroups } from '@/composables/resources/collections'
import { provideFormLocale } from '@/composables/useFormLocale'
import { assignKnown, slugify, toPayload } from '@/lib/forms'

provideFormLocale('en')

const { items, loading, saving, index, create, update, remove } = useTechnologyGroups()

const modalOpen = ref(false)
const editing = ref<TechnologyGroup | null>(null)
const formError = ref<ApiError | null>(null)

function blank() {
  return {
    slug: '',
    name_en: '',
    name_fr: '',
    name_ar: '',
    icon_class: '',
    sort_order: 0 as number | null,
    is_active: true,
  }
}
const form = reactive(blank())

function openCreate() {
  editing.value = null
  Object.assign(form, blank())
  formError.value = null
  modalOpen.value = true
}

function openEdit(item: TechnologyGroup) {
  editing.value = item
  Object.assign(form, blank())
  assignKnown(form, item)
  formError.value = null
  modalOpen.value = true
}

async function submit() {
  formError.value = null
  // Auto-derive a slug from the English name when left blank.
  if (!form.slug.trim() && form.name_en.trim()) form.slug = slugify(form.name_en)
  try {
    const payload = toPayload(form) as TechnologyGroupInput
    if (editing.value) await update(editing.value.id, payload)
    else await create(payload)
    modalOpen.value = false
    await index()
  } catch (e) {
    formError.value = ApiError.from(e)
  }
}

const toDelete = ref<TechnologyGroup | null>(null)
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
    <PageHeader title="Skill Groups" badge="SKILLS & PROFILE" description="Buckets that group technologies (Programming Languages, Databases, DevOps…).">
      <template #actions>
        <AppButton @click="openCreate"><Icon name="plus" class="h-4 w-4" /> Add group</AppButton>
      </template>
    </PageHeader>

    <p class="-mt-2 mb-5 font-mono text-xs text-secondary">
      Assign a technology to a group from the <RouterLink to="/technologies" class="text-brand hover:underline">Technologies</RouterLink> page.
    </p>

    <div v-if="loading && !items.length" class="grid h-48 place-items-center text-secondary">
      <span class="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-brand" />
    </div>

    <div
      v-else-if="!items.length"
      class="grid place-items-center rounded-2xl border border-dashed border-line bg-card p-12 text-center"
    >
      <p class="font-mono text-sm text-secondary">&gt;_ No skill groups yet.</p>
      <AppButton class="mt-4" @click="openCreate"><Icon name="plus" class="h-4 w-4" /> Add the first one</AppButton>
    </div>

    <div v-else class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div
        v-for="item in items"
        :key="item.id"
        class="flex items-center gap-4 rounded-2xl border bg-card p-4"
        :class="item.is_active ? 'border-line' : 'border-line opacity-60'"
      >
        <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
          <i v-if="item.icon_class" :class="item.icon_class" />
          <Icon v-else name="layers" class="h-5 w-5" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="truncate font-medium text-primary">{{ item.name_en }}</p>
          <p class="truncate font-mono text-[11px] text-secondary">
            {{ item.slug }} · {{ item.technologies?.length ?? 0 }} techs
          </p>
        </div>
        <div class="flex shrink-0 gap-1">
          <button type="button" class="grid h-9 w-9 place-items-center rounded-lg text-secondary hover:bg-card-hover hover:text-primary" aria-label="Edit" @click="openEdit(item)">
            <Icon name="edit" class="h-4 w-4" />
          </button>
          <button type="button" class="grid h-9 w-9 place-items-center rounded-lg text-secondary hover:bg-red-500/10 hover:text-red-500" aria-label="Delete" @click="toDelete = item">
            <Icon name="trash" class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>

    <AppModal :open="modalOpen" :title="editing ? 'Edit group' : 'New group'" @close="modalOpen = false">
      <form id="group-form" class="space-y-5" @submit.prevent="submit">
        <div v-if="formError && !formError.isValidation" class="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {{ formError.message }}
        </div>
        <LangField :form="form" base="name" label="Name" required placeholder="Databases" :error="formError?.first('name_en')" />
        <TextField v-model="form.slug" label="Slug" placeholder="databases" hint="Auto-filled from the name if left blank." :error="formError?.first('slug')" />
        <TextField v-model="form.icon_class" label="Icon class" placeholder="fas fa-database" hint="Optional." />
        <div class="grid gap-5 sm:grid-cols-2">
          <NumberField v-model="form.sort_order" label="Sort order" :min="0" />
          <ToggleField v-model="form.is_active" label="Active" />
        </div>
      </form>
      <template #footer>
        <AppButton variant="ghost" @click="modalOpen = false">Cancel</AppButton>
        <AppButton type="submit" form="group-form" :loading="saving">{{ editing ? 'Save' : 'Create' }}</AppButton>
      </template>
    </AppModal>

    <ConfirmDialog
      :open="!!toDelete"
      title="Delete skill group?"
      :message="`“${toDelete?.name_en ?? ''}” will be removed. Its technologies stay, but become ungrouped.`"
      :loading="deleting"
      @confirm="confirmDelete"
      @cancel="toDelete = null"
    />
  </section>
</template>
