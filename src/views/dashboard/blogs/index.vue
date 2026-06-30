<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'

import { ApiError } from '@/api/client'
import Icon from '@/components/Icon.vue'
import ImageUpload from '@/components/form/ImageUpload.vue'
import LangField from '@/components/form/LangField.vue'
import NumberField from '@/components/form/NumberField.vue'
import TextField from '@/components/form/TextField.vue'
import ToggleField from '@/components/form/ToggleField.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppModal from '@/components/ui/AppModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import type { Blog, BlogInput } from '@/api/types'
import { useBlogCategories, useBlogs } from '@/composables/resources/collections'
import { useBlogCategoriesMap } from '@/composables/resources/blogChildren'
import { provideFormLocale } from '@/composables/useFormLocale'
import { assignKnown, slugify, toPayload } from '@/lib/forms'

provideFormLocale('en')

const { items, pagination, loading, saving, index, create, update, remove } = useBlogs()
const { items: blogCategories, index: indexCategories } = useBlogCategories()

const filterOptions = computed(() => blogCategories.value.map((c) => ({ value: c.slug, label: c.name_en })))

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
const editing = ref<Blog | null>(null)
const formError = ref<ApiError | null>(null)
const slugTouched = ref(false)
const selectedCategories = ref<number[]>([])

function blank() {
  return {
    slug: '',
    title_en: '',
    title_fr: '',
    title_ar: '',
    excerpt_en: '',
    excerpt_fr: '',
    excerpt_ar: '',
    body_en: '',
    body_fr: '',
    body_ar: '',
    cover_image_url: null as string | null,
    read_time_minutes: null as number | null,
    is_featured: false,
    is_active: true,
    published_at: '',
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

function isSelected(id: number) {
  return selectedCategories.value.includes(id)
}

function toggleCategory(id: number) {
  selectedCategories.value = isSelected(id)
    ? selectedCategories.value.filter((c) => c !== id)
    : [...selectedCategories.value, id]
}

function openCreate() {
  editing.value = null
  Object.assign(form, blank())
  selectedCategories.value = []
  slugTouched.value = false
  formError.value = null
  modalOpen.value = true
}

function openEdit(item: Blog) {
  editing.value = item
  Object.assign(form, blank())
  assignKnown(form, item)
  form.published_at = (item.published_at ?? '').slice(0, 16)
  selectedCategories.value = (item.categories ?? []).map((c) => c.id)
  slugTouched.value = true
  formError.value = null
  modalOpen.value = true
}

async function submit() {
  formError.value = null
  try {
    const payload = toPayload(form) as BlogInput
    const blog = editing.value ? await update(editing.value.slug, payload) : await create(payload)
    // Categories are a pivot — sync them after the post is saved.
    await useBlogCategoriesMap(blog.slug).sync({ category_ids: selectedCategories.value })
    modalOpen.value = false
    await load()
  } catch (e) {
    formError.value = ApiError.from(e)
  }
}

const toDelete = ref<Blog | null>(null)
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

function formatDate(iso: string | null): string {
  if (!iso) return 'Draft'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? 'Draft' : d.toLocaleDateString()
}

onMounted(async () => {
  await Promise.all([indexCategories(), load()])
})
</script>

<template>
  <section>
    <PageHeader title="Posts" badge="BLOG" description="Write and manage blog posts.">
      <template #actions>
        <AppButton @click="openCreate"><Icon name="plus" class="h-4 w-4" /> Add post</AppButton>
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
      <p class="font-mono text-sm text-secondary">&gt;_ No posts found.</p>
      <AppButton class="mt-4" @click="openCreate"><Icon name="plus" class="h-4 w-4" /> Write the first one</AppButton>
    </div>

    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <div v-for="item in items" :key="item.id" class="overflow-hidden rounded-2xl border border-line bg-card">
        <div class="relative aspect-video bg-page">
          <img v-if="item.cover_image_url" :src="item.cover_image_url" :alt="item.title_en" class="h-full w-full object-cover" />
          <div v-else class="grid h-full place-items-center text-secondary/40"><Icon name="image" class="h-8 w-8" /></div>
          <span v-if="item.is_featured" class="absolute left-2 top-2 rounded-full border border-brand/40 bg-brand/20 px-2 py-0.5 text-[11px] font-semibold text-brand backdrop-blur">
            Featured
          </span>
          <span v-if="!item.is_active" class="absolute right-2 top-2 rounded-full border border-line bg-surface/80 px-2 py-0.5 text-[11px] font-semibold text-secondary backdrop-blur">
            Draft
          </span>
        </div>
        <div class="p-4">
          <p class="truncate font-medium text-primary">{{ item.title_en || '—' }}</p>
          <p class="mt-0.5 truncate font-mono text-[11px] text-secondary">
            {{ formatDate(item.published_at) }} · {{ item.views }} views
          </p>
          <div v-if="item.categories?.length" class="mt-2 flex flex-wrap gap-1">
            <span
              v-for="c in item.categories"
              :key="c.id"
              class="rounded-full border border-line px-2 py-0.5 text-[11px] text-secondary"
            >
              {{ c.name_en }}
            </span>
          </div>
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
      <AppButton variant="ghost" :disabled="pagination.current_page <= 1" @click="goTo(pagination.current_page - 1)">Prev</AppButton>
      <span class="font-mono text-sm text-secondary">
        Page {{ pagination.current_page }} / {{ pagination.last_page }} · {{ pagination.total }} total
      </span>
      <AppButton variant="ghost" :disabled="pagination.current_page >= pagination.last_page" @click="goTo(pagination.current_page + 1)">Next</AppButton>
    </div>

    <!-- Create / edit modal -->
    <AppModal
      :open="modalOpen"
      size="xl"
      :title="editing ? 'Edit post' : 'New post'"
      :subtitle="editing ? `/${editing.slug}` : undefined"
      @close="modalOpen = false"
    >
      <form id="blog-form" class="space-y-6" @submit.prevent="submit">
        <div v-if="formError && !formError.isValidation" class="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {{ formError.message }}
        </div>

        <!-- Basics -->
        <div class="space-y-5">
          <h4 class="font-mono text-[11px] tracking-widest text-accent">&gt;_ BASICS</h4>
          <LangField :form="form" base="title" label="Title" required :error="formError?.first('title_en')" />
          <TextField :model-value="form.slug" label="Slug" required placeholder="my-post" hint="lowercase, dashes" :error="formError?.first('slug')" @update:model-value="onSlugInput" />
          <div>
            <label class="mb-1.5 block text-sm font-medium text-primary">Categories</label>
            <div v-if="blogCategories.length" class="flex flex-wrap gap-2">
              <button
                v-for="c in blogCategories"
                :key="c.id"
                type="button"
                class="rounded-full border px-3 py-1.5 text-sm transition-colors"
                :class="isSelected(c.id) ? 'border-line-accent bg-brand/15 text-brand' : 'border-line text-secondary hover:text-primary'"
                @click="toggleCategory(c.id)"
              >
                {{ c.name_en }}
              </button>
            </div>
            <p v-else class="text-xs text-secondary">No categories yet — create some on the Categories page first.</p>
          </div>
        </div>

        <!-- Content -->
        <div class="space-y-5 border-t border-line pt-5">
          <h4 class="font-mono text-[11px] tracking-widest text-accent">&gt;_ CONTENT</h4>
          <LangField :form="form" base="excerpt" label="Excerpt" type="textarea" :rows="3" />
          <LangField :form="form" base="body" label="Body" type="textarea" :rows="12" hint="HTML or Markdown." />
        </div>

        <!-- Media + meta -->
        <div class="space-y-5 border-t border-line pt-5">
          <h4 class="font-mono text-[11px] tracking-widest text-accent">&gt;_ MEDIA &amp; PUBLISHING</h4>
          <ImageUpload v-model="form.cover_image_url" folder="blogs" label="Cover image" />
          <div class="grid gap-5 sm:grid-cols-2">
            <NumberField v-model="form.read_time_minutes" label="Read time (minutes)" :min="0" :max="255" />
            <TextField v-model="form.published_at" type="datetime-local" label="Published at" hint="Leave empty to keep as draft." />
          </div>
          <div class="grid gap-5 sm:grid-cols-2">
            <ToggleField v-model="form.is_featured" label="Featured" />
            <ToggleField v-model="form.is_active" label="Active (published)" />
          </div>
        </div>
      </form>

      <template #footer>
        <AppButton variant="ghost" @click="modalOpen = false">Cancel</AppButton>
        <AppButton type="submit" form="blog-form" :loading="saving">{{ editing ? 'Save' : 'Create' }}</AppButton>
      </template>
    </AppModal>

    <ConfirmDialog
      :open="!!toDelete"
      title="Delete post?"
      :message="`“${toDelete?.title_en ?? ''}” and its table of contents will be removed.`"
      :loading="deleting"
      @confirm="confirmDelete"
      @cancel="toDelete = null"
    />
  </section>
</template>
