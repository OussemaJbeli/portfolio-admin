<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'

import { ApiError } from '@/api/client'
import Icon from '@/components/Icon.vue'
import LangField from '@/components/form/LangField.vue'
import NumberField from '@/components/form/NumberField.vue'
import SelectField from '@/components/form/SelectField.vue'
import ToggleField from '@/components/form/ToggleField.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppModal from '@/components/ui/AppModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import type { Language, LanguageInput, LanguageLevel } from '@/api/types'
import { useLanguages } from '@/composables/resources/collections'
import { provideFormLocale } from '@/composables/useFormLocale'
import { assignKnown, toPayload } from '@/lib/forms'

provideFormLocale('en')

const { items, loading, saving, index, create, update, remove } = useLanguages()

const LEVELS: { value: LanguageLevel; label: string }[] = [
  { value: 'native', label: 'Native' },
  { value: 'c2', label: 'C2 — Mastery' },
  { value: 'c1', label: 'C1 — Advanced' },
  { value: 'b2', label: 'B2 — Upper intermediate' },
  { value: 'b1', label: 'B1 — Intermediate' },
  { value: 'a2', label: 'A2 — Elementary' },
  { value: 'a1', label: 'A1 — Beginner' },
]
const levelLabel = (v: string) => LEVELS.find((l) => l.value === v)?.label ?? v

const modalOpen = ref(false)
const editing = ref<Language | null>(null)
const formError = ref<ApiError | null>(null)

function blank() {
  return {
    name_en: '',
    name_fr: '',
    name_ar: '',
    level: 'b1' as LanguageLevel,
    note_en: '',
    note_fr: '',
    note_ar: '',
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

function openEdit(item: Language) {
  editing.value = item
  Object.assign(form, blank())
  assignKnown(form, item)
  formError.value = null
  modalOpen.value = true
}

async function submit() {
  formError.value = null
  try {
    const payload = toPayload(form) as LanguageInput
    if (editing.value) await update(editing.value.id, payload)
    else await create(payload)
    modalOpen.value = false
    await index()
  } catch (e) {
    formError.value = ApiError.from(e)
  }
}

const toDelete = ref<Language | null>(null)
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
    <PageHeader title="Languages" badge="SKILLS & PROFILE" description="Spoken languages and proficiency levels.">
      <template #actions>
        <AppButton @click="openCreate"><Icon name="plus" class="h-4 w-4" /> Add language</AppButton>
      </template>
    </PageHeader>

    <div v-if="loading && !items.length" class="grid h-48 place-items-center text-secondary">
      <span class="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-brand" />
    </div>

    <div
      v-else-if="!items.length"
      class="grid place-items-center rounded-2xl border border-dashed border-line bg-card p-12 text-center"
    >
      <p class="font-mono text-sm text-secondary">&gt;_ No languages yet.</p>
      <AppButton class="mt-4" @click="openCreate"><Icon name="plus" class="h-4 w-4" /> Add the first one</AppButton>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="item in items"
        :key="item.id"
        class="flex items-center gap-4 rounded-2xl border bg-card p-4"
        :class="item.is_active ? 'border-line' : 'border-line opacity-60'"
      >
        <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
          <Icon name="language" class="h-5 w-5" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="truncate font-medium text-primary">{{ item.name_en }}</p>
          <p class="truncate font-mono text-[11px] text-secondary">{{ item.note_en || '—' }}</p>
        </div>
        <span class="shrink-0 rounded-full border border-line-accent bg-brand/10 px-3 py-1 font-mono text-[11px] font-bold uppercase text-brand">
          {{ levelLabel(item.level).split(' ')[0] }}
        </span>
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

    <AppModal :open="modalOpen" :title="editing ? 'Edit language' : 'New language'" @close="modalOpen = false">
      <form id="language-form" class="space-y-5" @submit.prevent="submit">
        <div v-if="formError && !formError.isValidation" class="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {{ formError.message }}
        </div>
        <LangField :form="form" base="name" label="Language" required placeholder="English" :error="formError?.first('name_en')" />
        <SelectField v-model="form.level" label="Level" :options="LEVELS" :error="formError?.first('level')" />
        <LangField :form="form" base="note" label="Note" placeholder="Working proficiency" hint="Optional short note." />
        <div class="grid gap-5 sm:grid-cols-2">
          <NumberField v-model="form.sort_order" label="Sort order" :min="0" />
          <ToggleField v-model="form.is_active" label="Active" />
        </div>
      </form>
      <template #footer>
        <AppButton variant="ghost" @click="modalOpen = false">Cancel</AppButton>
        <AppButton type="submit" form="language-form" :loading="saving">{{ editing ? 'Save' : 'Create' }}</AppButton>
      </template>
    </AppModal>

    <ConfirmDialog
      :open="!!toDelete"
      title="Delete language?"
      :message="`“${toDelete?.name_en ?? ''}” will be permanently removed.`"
      :loading="deleting"
      @confirm="confirmDelete"
      @cancel="toDelete = null"
    />
  </section>
</template>
