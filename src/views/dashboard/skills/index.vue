<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'

import { ApiError } from '@/api/client'
import Icon from '@/components/Icon.vue'
import LangField from '@/components/form/LangField.vue'
import NumberField from '@/components/form/NumberField.vue'
import ToggleField from '@/components/form/ToggleField.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppModal from '@/components/ui/AppModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import type { SkillCategory, SkillCategoryInput, SkillSectionInput } from '@/api/types'
import { useSkillsSection } from '@/composables/resources/singletons'
import { useSkillCategories } from '@/composables/resources/collections'
import { provideFormLocale } from '@/composables/useFormLocale'
import { assignKnown, toPayload } from '@/lib/forms'

provideFormLocale('en')

/* ── Section config (singleton) ─────────────────────────────────────── */
const {
  data: sectionData,
  saving: sectionSaving,
  error: sectionError,
  fetch: fetchSection,
  save: saveSection,
} = useSkillsSection()

const sectionSaved = ref(false)
const sectionForm = reactive({
  section_badge_en: '',
  section_badge_fr: '',
  section_badge_ar: '',
  heading_en: '',
  heading_fr: '',
  heading_ar: '',
})

async function onSaveSection() {
  sectionSaved.value = false
  try {
    await saveSection(toPayload(sectionForm) as SkillSectionInput)
    sectionSaved.value = true
  } catch {
    /* error reactive */
  }
}

/* ── Categories (collection CRUD) ───────────────────────────────────── */
const {
  items: categories,
  loading: catLoading,
  saving: catSaving,
  index: indexCategories,
  create: createCategory,
  update: updateCategory,
  remove: removeCategory,
} = useSkillCategories()

const modalOpen = ref(false)
const editing = ref<SkillCategory | null>(null)
const formError = ref<ApiError | null>(null)

function blankCat() {
  return {
    name_en: '',
    name_fr: '',
    name_ar: '',
    percentage: 0 as number | null,
    sort_order: 0 as number | null,
    is_active: true,
  }
}
const catForm = reactive(blankCat())

function openCreate() {
  editing.value = null
  Object.assign(catForm, blankCat())
  formError.value = null
  modalOpen.value = true
}

function openEdit(item: SkillCategory) {
  editing.value = item
  Object.assign(catForm, blankCat())
  assignKnown(catForm, item)
  formError.value = null
  modalOpen.value = true
}

async function submitCat() {
  formError.value = null
  try {
    const payload = toPayload(catForm) as SkillCategoryInput
    if (editing.value) await updateCategory(editing.value.id, payload)
    else await createCategory(payload)
    modalOpen.value = false
    await indexCategories()
  } catch (e) {
    formError.value = ApiError.from(e)
  }
}

const toDelete = ref<SkillCategory | null>(null)
const deleting = ref(false)
async function confirmDelete() {
  if (!toDelete.value) return
  deleting.value = true
  try {
    await removeCategory(toDelete.value.id)
    toDelete.value = null
  } finally {
    deleting.value = false
  }
}

onMounted(async () => {
  await Promise.all([fetchSection(), indexCategories()])
  if (sectionData.value) assignKnown(sectionForm, sectionData.value)
})
</script>

<template>
  <section>
    <PageHeader title="Skills" badge="HOME PAGE" description="Section heading and the skill-category progress bars." />

    <!-- Section config -->
    <form class="rounded-2xl border border-line bg-card p-6" @submit.prevent="onSaveSection">
      <div class="mb-5 flex items-center justify-between gap-4">
        <h2 class="font-display text-sm font-bold uppercase tracking-wider text-secondary">Section heading</h2>
        <div class="flex items-center gap-3">
          <p v-if="sectionError && !sectionError.isValidation" class="text-sm text-red-500">
            {{ sectionError.message }}
          </p>
          <p v-else-if="sectionSaved" class="inline-flex items-center gap-1.5 text-sm text-brand">
            <Icon name="check" class="h-4 w-4" /> Saved
          </p>
          <AppButton type="submit" :loading="sectionSaving">Save</AppButton>
        </div>
      </div>
      <div class="grid gap-5 sm:grid-cols-2">
        <LangField :form="sectionForm" base="section_badge" label="Section badge" placeholder="> SKILLS" />
        <LangField :form="sectionForm" base="heading" label="Heading" placeholder="My Skills" />
      </div>
    </form>

    <!-- Categories -->
    <div class="mt-8 mb-4 flex items-center justify-between">
      <h2 class="font-display text-lg font-bold text-primary">Skill categories</h2>
      <AppButton @click="openCreate"><Icon name="plus" class="h-4 w-4" /> Add category</AppButton>
    </div>

    <div v-if="catLoading && !categories.length" class="grid h-40 place-items-center text-secondary">
      <span class="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-brand" />
    </div>

    <div
      v-else-if="!categories.length"
      class="grid place-items-center rounded-2xl border border-dashed border-line bg-card p-12 text-center"
    >
      <p class="font-mono text-sm text-secondary">&gt;_ No skill categories yet.</p>
    </div>

    <ul v-else class="space-y-3">
      <li
        v-for="item in categories"
        :key="item.id"
        class="rounded-2xl border border-line bg-card px-5 py-4"
      >
        <div class="flex items-center gap-4">
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-2">
              <p class="truncate font-medium text-primary">{{ item.name_en || '—' }}</p>
              <span class="shrink-0 font-mono text-sm text-brand">{{ item.percentage }}%</span>
            </div>
            <div class="mt-2 h-2 overflow-hidden rounded-full bg-page">
              <div class="h-full rounded-full bg-brand" :style="{ width: `${item.percentage}%` }" />
            </div>
          </div>
          <div class="flex shrink-0 gap-1">
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
      </li>
    </ul>

    <AppModal :open="modalOpen" :title="editing ? 'Edit category' : 'New category'" @close="modalOpen = false">
      <form id="skill-form" class="space-y-5" @submit.prevent="submitCat">
        <div
          v-if="formError && !formError.isValidation"
          class="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-500"
        >
          {{ formError.message }}
        </div>
        <LangField :form="catForm" base="name" label="Name" required :error="formError?.first('name_en')" />
        <div class="grid gap-5 sm:grid-cols-2">
          <NumberField
            v-model="catForm.percentage"
            label="Percentage"
            required
            :min="0"
            :max="100"
            :error="formError?.first('percentage')"
          />
          <NumberField v-model="catForm.sort_order" label="Sort order" :min="0" />
        </div>
        <ToggleField v-model="catForm.is_active" label="Active" />
      </form>
      <template #footer>
        <AppButton variant="ghost" @click="modalOpen = false">Cancel</AppButton>
        <AppButton type="submit" form="skill-form" :loading="catSaving">
          {{ editing ? 'Save' : 'Create' }}
        </AppButton>
      </template>
    </AppModal>

    <ConfirmDialog
      :open="!!toDelete"
      title="Delete category?"
      :message="`“${toDelete?.name_en ?? ''}” will be permanently removed.`"
      :loading="deleting"
      @confirm="confirmDelete"
      @cancel="toDelete = null"
    />
  </section>
</template>
