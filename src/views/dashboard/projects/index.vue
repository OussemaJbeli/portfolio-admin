<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'

import { ApiError } from '@/api/client'
import Icon from '@/components/Icon.vue'
import ImageUpload from '@/components/form/ImageUpload.vue'
import LangField from '@/components/form/LangField.vue'
import NumberField from '@/components/form/NumberField.vue'
import SelectField from '@/components/form/SelectField.vue'
import TextField from '@/components/form/TextField.vue'
import ToggleField from '@/components/form/ToggleField.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppModal from '@/components/ui/AppModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import type { Project, ProjectInput, ProjectType } from '@/api/types'
import { useProjectCategories, useProjects } from '@/composables/resources/collections'
import { provideFormLocale } from '@/composables/useFormLocale'
import { assignKnown, slugify, toPayload } from '@/lib/forms'

provideFormLocale('en')

const { items, pagination, loading, saving, index, create, update, remove } = useProjects()
const { items: categories, index: indexCategories } = useProjectCategories()

const categoryOptions = computed(() =>
  categories.value.map((c) => ({ value: c.id, label: c.name_en })),
)

const PROJECT_TYPES: { value: ProjectType; label: string }[] = [
  { value: 'freelance', label: 'Freelance' },
  { value: 'professional', label: 'Professional' },
  { value: 'academic', label: 'Academic' },
  { value: 'personal', label: 'Personal' },
]
const filterOptions = computed(() => categories.value.map((c) => ({ value: c.slug, label: c.name_en })))

/* ── Filters + pagination ───────────────────────────────────────────── */
const page = ref(1)
const filterCategory = ref<string | null>(null)
const filterFeatured = ref(false)

async function load() {
  await index({
    page: page.value,
    per_page: 12,
    category: filterCategory.value || undefined,
    featured: filterFeatured.value || undefined,
  })
}

function applyFilters() {
  page.value = 1
  load()
}

function toggleFeatured() {
  filterFeatured.value = !filterFeatured.value
  applyFilters()
}

function goTo(p: number) {
  page.value = p
  load()
}

/* ── Create / edit ──────────────────────────────────────────────────── */
const modalOpen = ref(false)
const editing = ref<Project | null>(null)
const formError = ref<ApiError | null>(null)
const slugTouched = ref(false)

function blank() {
  return {
    slug: '',
    category_id: null as number | null,
    project_type: null as ProjectType | null,
    thumbnail_url: null as string | null,
    hero_image_url: null as string | null,
    is_featured: false,
    is_active: true,
    sort_order: 0 as number | null,
    title_en: '',
    title_fr: '',
    title_ar: '',
    subtitle_en: '',
    subtitle_fr: '',
    subtitle_ar: '',
    description_en: '',
    description_fr: '',
    description_ar: '',
    about_en: '',
    about_fr: '',
    about_ar: '',
    client_en: '',
    client_fr: '',
    client_ar: '',
    duration_en: '',
    duration_fr: '',
    duration_ar: '',
    completed_date: '',
    live_demo_url: '',
    github_url: '',
  }
}
const form = reactive(blank())

watch(
  () => form.title_en,
  (title) => {
    if (!slugTouched.value && !editing.value) form.slug = slugify(title)
  },
)

function onSlugInput(v: string) {
  form.slug = v
  slugTouched.value = true
}

function openCreate() {
  editing.value = null
  Object.assign(form, blank())
  slugTouched.value = false
  formError.value = null
  modalOpen.value = true
}

function openEdit(item: Project) {
  editing.value = item
  Object.assign(form, blank())
  assignKnown(form, item)
  form.completed_date = (item.completed_date ?? '').slice(0, 10)
  slugTouched.value = true
  formError.value = null
  modalOpen.value = true
}

async function submit() {
  formError.value = null
  try {
    const payload = toPayload(form) as ProjectInput
    if (editing.value) await update(editing.value.slug, payload)
    else await create(payload)
    modalOpen.value = false
    await load()
  } catch (e) {
    formError.value = ApiError.from(e)
  }
}

const toDelete = ref<Project | null>(null)
const deleting = ref(false)
async function confirmDelete() {
  if (!toDelete.value) return
  deleting.value = true
  try {
    await remove(toDelete.value.slug)
    toDelete.value = null
    await load()
  } finally {
    deleting.value = false
  }
}

onMounted(async () => {
  await Promise.all([indexCategories(), load()])
})
</script>

<template>
  <section>
    <PageHeader title="Projects" badge="PROJECTS" description="Create and manage your portfolio projects.">
      <template #actions>
        <AppButton @click="openCreate"><Icon name="plus" class="h-4 w-4" /> Add project</AppButton>
      </template>
    </PageHeader>

    <!-- Filters -->
    <div class="mb-5 flex flex-wrap items-center gap-3">
      <select
        v-model="filterCategory"
        class="rounded-full border border-line bg-card px-4 py-2 text-sm text-primary focus:border-line-accent focus:outline-none"
        @change="applyFilters"
      >
        <option :value="null">All categories</option>
        <option v-for="opt in filterOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
      <button
        type="button"
        class="rounded-full border px-4 py-2 text-sm font-medium transition-colors"
        :class="filterFeatured ? 'border-line-accent bg-brand/15 text-brand' : 'border-line text-secondary hover:text-primary'"
        @click="toggleFeatured"
      >
        Featured only
      </button>
    </div>

    <div v-if="loading && !items.length" class="grid h-48 place-items-center text-secondary">
      <span class="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-brand" />
    </div>

    <div
      v-else-if="!items.length"
      class="grid place-items-center rounded-2xl border border-dashed border-line bg-card p-12 text-center"
    >
      <p class="font-mono text-sm text-secondary">&gt;_ No projects found.</p>
      <AppButton class="mt-4" @click="openCreate"><Icon name="plus" class="h-4 w-4" /> Add the first one</AppButton>
    </div>

    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <div v-for="item in items" :key="item.id" class="overflow-hidden rounded-2xl border border-line bg-card">
        <div class="relative aspect-video bg-page">
          <img v-if="item.thumbnail_url" :src="item.thumbnail_url" :alt="item.title_en" class="h-full w-full object-cover" />
          <div v-else class="grid h-full place-items-center text-secondary/40"><Icon name="image" class="h-8 w-8" /></div>
          <span
            v-if="item.is_featured"
            class="absolute left-2 top-2 rounded-full border border-brand/40 bg-brand/20 px-2 py-0.5 text-[11px] font-semibold text-brand backdrop-blur"
          >
            Featured
          </span>
          <span
            v-if="!item.is_active"
            class="absolute right-2 top-2 rounded-full border border-line bg-surface/80 px-2 py-0.5 text-[11px] font-semibold text-secondary backdrop-blur"
          >
            Hidden
          </span>
        </div>
        <div class="p-4">
          <p class="truncate font-medium text-primary">{{ item.title_en || '—' }}</p>
          <p class="mt-0.5 truncate font-mono text-[11px] text-secondary">
            /{{ item.slug }}<span v-if="item.category"> · {{ item.category.name_en }}</span>
          </p>
          <div class="mt-3 flex justify-end gap-1">
            <button type="button" class="grid h-9 w-9 place-items-center rounded-lg text-secondary hover:bg-card-hover hover:text-primary" aria-label="Edit" @click="openEdit(item)">
              <Icon name="edit" class="h-4 w-4" />
            </button>
            <button type="button" class="grid h-9 w-9 place-items-center rounded-lg text-secondary hover:bg-red-500/10 hover:text-red-500" aria-label="Delete" @click="toDelete = item">
              <Icon name="trash" class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination && pagination.last_page > 1" class="mt-6 flex items-center justify-center gap-3">
      <AppButton variant="ghost" :disabled="pagination.current_page <= 1" @click="goTo(pagination.current_page - 1)">
        Prev
      </AppButton>
      <span class="font-mono text-sm text-secondary">
        Page {{ pagination.current_page }} / {{ pagination.last_page }} · {{ pagination.total }} total
      </span>
      <AppButton variant="ghost" :disabled="pagination.current_page >= pagination.last_page" @click="goTo(pagination.current_page + 1)">
        Next
      </AppButton>
    </div>

    <!-- Create / edit modal -->
    <AppModal
      :open="modalOpen"
      size="xl"
      :title="editing ? 'Edit project' : 'New project'"
      :subtitle="editing ? `/${editing.slug}` : undefined"
      @close="modalOpen = false"
    >
      <form id="project-form" class="space-y-6" @submit.prevent="submit">
        <div v-if="formError && !formError.isValidation" class="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {{ formError.message }}
        </div>

        <!-- Basics -->
        <div class="space-y-5">
          <h4 class="font-mono text-[11px] tracking-widest text-accent">&gt;_ BASICS</h4>
          <div class="grid gap-5 sm:grid-cols-3">
            <TextField :model-value="form.slug" label="Slug" required placeholder="my-project" hint="lowercase, dashes" :error="formError?.first('slug')" @update:model-value="onSlugInput" />
            <SelectField v-model="form.category_id" label="Category" placeholder="No category" :options="categoryOptions" :error="formError?.first('category_id')" />
            <SelectField v-model="form.project_type" label="Type" placeholder="— None —" :options="PROJECT_TYPES" :error="formError?.first('project_type')" />
          </div>
          <div class="grid gap-5 sm:grid-cols-3">
            <NumberField v-model="form.sort_order" label="Sort order" :min="0" />
            <div class="flex items-end pb-1"><ToggleField v-model="form.is_featured" label="Featured" /></div>
            <div class="flex items-end pb-1"><ToggleField v-model="form.is_active" label="Active" /></div>
          </div>
        </div>

        <!-- Titles -->
        <div class="space-y-5 border-t border-line pt-5">
          <h4 class="font-mono text-[11px] tracking-widest text-accent">&gt;_ TITLES</h4>
          <LangField :form="form" base="title" label="Title" required :error="formError?.first('title_en')" />
          <LangField :form="form" base="subtitle" label="Subtitle" />
        </div>

        <!-- Content -->
        <div class="space-y-5 border-t border-line pt-5">
          <h4 class="font-mono text-[11px] tracking-widest text-accent">&gt;_ CONTENT</h4>
          <LangField :form="form" base="description" label="Short description" type="textarea" :rows="3" />
          <LangField :form="form" base="about" label="About the project" type="textarea" :rows="6" />
        </div>

        <!-- Media -->
        <div class="space-y-5 border-t border-line pt-5">
          <h4 class="font-mono text-[11px] tracking-widest text-accent">&gt;_ MEDIA</h4>
          <ImageUpload v-model="form.thumbnail_url" folder="projects" label="Thumbnail" />
          <ImageUpload v-model="form.hero_image_url" folder="projects" label="Hero image" />
        </div>

        <!-- Meta -->
        <div class="space-y-5 border-t border-line pt-5">
          <h4 class="font-mono text-[11px] tracking-widest text-accent">&gt;_ PROJECT INFO</h4>
          <div class="grid gap-5 sm:grid-cols-2">
            <LangField :form="form" base="client" label="Client" />
            <LangField :form="form" base="duration" label="Duration" />
          </div>
          <div class="grid gap-5 sm:grid-cols-3">
            <TextField v-model="form.completed_date" type="date" label="Completed date" />
            <TextField v-model="form.live_demo_url" type="url" label="Live demo URL" :error="formError?.first('live_demo_url')" />
            <TextField v-model="form.github_url" type="url" label="GitHub URL" :error="formError?.first('github_url')" />
          </div>
        </div>
      </form>

      <template #footer>
        <AppButton variant="ghost" @click="modalOpen = false">Cancel</AppButton>
        <AppButton type="submit" form="project-form" :loading="saving">{{ editing ? 'Save' : 'Create' }}</AppButton>
      </template>
    </AppModal>

    <ConfirmDialog
      :open="!!toDelete"
      title="Delete project?"
      :message="`“${toDelete?.title_en ?? ''}” and its gallery, features and roles will be removed.`"
      :loading="deleting"
      @confirm="confirmDelete"
      @cancel="toDelete = null"
    />
  </section>
</template>
