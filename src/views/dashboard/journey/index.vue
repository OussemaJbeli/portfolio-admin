<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'

import { ApiError } from '@/api/client'
import Icon from '@/components/Icon.vue'
import LangField from '@/components/form/LangField.vue'
import NumberField from '@/components/form/NumberField.vue'
import SelectField from '@/components/form/SelectField.vue'
import TextField from '@/components/form/TextField.vue'
import ToggleField from '@/components/form/ToggleField.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppModal from '@/components/ui/AppModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import type {
  EmploymentType,
  JourneyMilestone,
  JourneyMilestoneInput,
  JourneySectionInput,
  JourneyTrack,
  JourneyTrackInput,
  JourneyTrackType,
  MilestoneKind,
} from '@/api/types'
import { useProjects, useTechnologies } from '@/composables/resources/collections'
import {
  syncMilestoneTechnologies,
  useJourneyMilestones,
  useJourneySection,
  useJourneyTracks,
} from '@/composables/resources/journey'
import { provideFormLocale } from '@/composables/useFormLocale'
import { assignKnown, slugify, toPayload } from '@/lib/forms'

provideFormLocale('en')

const { items: tracks, loading: tracksLoading, saving: trackSaving, index: indexTracks, create: createTrack, update: updateTrack, remove: removeTrack } = useJourneyTracks()
const { items: milestones, saving: msSaving, index: indexMilestones, create: createMs, update: updateMs, remove: removeMs } = useJourneyMilestones()
const section = useJourneySection()
const { items: technologies, index: indexTech } = useTechnologies()
const { items: projects, index: indexProjects } = useProjects()

/* ── Options ────────────────────────────────────────────────────────────── */
const TRACK_TYPES: { value: JourneyTrackType; label: string }[] = [
  { value: 'main', label: 'Main' },
  { value: 'education', label: 'Education' },
  { value: 'work', label: 'Work' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'self', label: 'Self-learning' },
]
const EMPLOYMENT_TYPES: { value: EmploymentType; label: string }[] = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'internship', label: 'Internship' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'contract', label: 'Contract' },
]
const KINDS: { value: MilestoneKind; label: string }[] = [
  { value: 'commit', label: 'Commit' },
  { value: 'tag', label: 'Tag' },
  { value: 'merge', label: 'Merge' },
  { value: 'head', label: 'HEAD (now)' },
]
const projectOptions = computed(() => projects.value.map((p) => ({ value: p.id, label: p.title_en || p.slug })))

const milestonesByTrack = computed(() => {
  const map: Record<number, JourneyMilestone[]> = {}
  for (const m of milestones.value) (map[m.track_id] ??= []).push(m)
  return map
})

const open = ref<number[]>([])
function toggleOpen(id: number) {
  open.value = open.value.includes(id) ? open.value.filter((x) => x !== id) : [...open.value, id]
}

const fmtDate = (d: string | null) => (d ? d.slice(0, 10) : '')

/* ── Track create / edit ────────────────────────────────────────────────── */
const trackModalOpen = ref(false)
const editingTrack = ref<JourneyTrack | null>(null)
const trackError = ref<ApiError | null>(null)
const trackSlugTouched = ref(false)

function blankTrack() {
  return {
    slug: '',
    branch_name: '',
    type: 'work' as JourneyTrackType,
    employment_type: null as EmploymentType | null,
    color: '',
    icon_class: '',
    label_en: '',
    label_fr: '',
    label_ar: '',
    org_en: '',
    org_fr: '',
    org_ar: '',
    location_en: '',
    location_fr: '',
    location_ar: '',
    started_at: '',
    ended_at: '',
    lane_index: 0 as number | null,
    merges_into_id: null as number | null,
    merged_at: '',
    sort_order: 0 as number | null,
    is_active: true,
  }
}
const trackForm = reactive(blankTrack())
const trackMergeOptions = computed(() =>
  tracks.value
    .filter((t) => t.id !== editingTrack.value?.id)
    .map((t) => ({ value: t.id, label: t.branch_name })),
)

function openCreateTrack() {
  editingTrack.value = null
  Object.assign(trackForm, blankTrack())
  trackSlugTouched.value = false
  trackError.value = null
  trackModalOpen.value = true
}
function openEditTrack(t: JourneyTrack) {
  editingTrack.value = t
  Object.assign(trackForm, blankTrack())
  assignKnown(trackForm, t)
  trackForm.started_at = fmtDate(t.started_at)
  trackForm.ended_at = fmtDate(t.ended_at)
  trackForm.merged_at = fmtDate(t.merged_at)
  trackSlugTouched.value = true
  trackError.value = null
  trackModalOpen.value = true
}
async function submitTrack() {
  trackError.value = null
  if (!trackForm.slug.trim()) trackForm.slug = slugify(trackForm.branch_name || trackForm.label_en)
  try {
    const payload = toPayload(trackForm) as JourneyTrackInput
    if (editingTrack.value) await updateTrack(editingTrack.value.slug, payload)
    else await createTrack(payload)
    trackModalOpen.value = false
    await indexTracks()
  } catch (e) {
    trackError.value = ApiError.from(e)
  }
}

const trackToDelete = ref<JourneyTrack | null>(null)
const deletingTrack = ref(false)
async function confirmDeleteTrack() {
  if (!trackToDelete.value) return
  deletingTrack.value = true
  try {
    await removeTrack(trackToDelete.value.slug)
    trackToDelete.value = null
    await Promise.all([indexTracks(), indexMilestones()])
  } finally {
    deletingTrack.value = false
  }
}

/* ── Milestone create / edit ────────────────────────────────────────────── */
const msModalOpen = ref(false)
const editingMs = ref<JourneyMilestone | null>(null)
const msError = ref<ApiError | null>(null)
const selectedTechIds = ref<number[]>([])

function blankMs(trackId: number) {
  return {
    track_id: trackId,
    kind: 'commit' as MilestoneKind,
    title_en: '',
    title_fr: '',
    title_ar: '',
    body_en: '',
    body_fr: '',
    body_ar: '',
    tag_label: '',
    happened_at: '',
    project_id: null as number | null,
    link_url: '',
    is_highlight: false,
    sort_order: 0 as number | null,
    is_active: true,
  }
}
const msForm = reactive(blankMs(0))

function openCreateMs(trackId: number) {
  editingMs.value = null
  Object.assign(msForm, blankMs(trackId))
  selectedTechIds.value = []
  msError.value = null
  msModalOpen.value = true
}
function openEditMs(m: JourneyMilestone) {
  editingMs.value = m
  Object.assign(msForm, blankMs(m.track_id))
  assignKnown(msForm, m)
  msForm.happened_at = fmtDate(m.happened_at)
  selectedTechIds.value = (m.technologies ?? []).map((t) => t.id)
  msError.value = null
  msModalOpen.value = true
}
function toggleTech(id: number) {
  selectedTechIds.value = selectedTechIds.value.includes(id)
    ? selectedTechIds.value.filter((x) => x !== id)
    : [...selectedTechIds.value, id]
}
async function submitMs() {
  msError.value = null
  try {
    const payload = toPayload(msForm) as JourneyMilestoneInput
    const saved = editingMs.value
      ? await updateMs(editingMs.value.id, payload)
      : await createMs(payload)
    await syncMilestoneTechnologies(saved.id, selectedTechIds.value)
    msModalOpen.value = false
    await indexMilestones()
  } catch (e) {
    msError.value = ApiError.from(e)
  }
}

const msToDelete = ref<JourneyMilestone | null>(null)
const deletingMs = ref(false)
async function confirmDeleteMs() {
  if (!msToDelete.value) return
  deletingMs.value = true
  try {
    await removeMs(msToDelete.value.id)
    msToDelete.value = null
    await indexMilestones()
  } finally {
    deletingMs.value = false
  }
}

/* ── Section config ─────────────────────────────────────────────────────── */
const showSection = ref(false)
const sectionSaved = ref(false)
function blankSection() {
  return {
    section_badge_en: '',
    section_badge_fr: '',
    section_badge_ar: '',
    heading_en: '',
    heading_fr: '',
    heading_ar: '',
    subheading_en: '',
    subheading_fr: '',
    subheading_ar: '',
    next_label_en: '',
    next_label_fr: '',
    next_label_ar: '',
  }
}
const sectionForm = reactive(blankSection())
async function saveSection() {
  sectionSaved.value = false
  try {
    await section.save(toPayload(sectionForm) as JourneySectionInput)
    sectionSaved.value = true
  } catch {
    /* reactive error */
  }
}

onMounted(async () => {
  await Promise.all([
    indexTracks(),
    indexMilestones(),
    indexTech(),
    indexProjects({ per_page: 100 }),
    section.fetch(),
  ])
  if (section.data.value) assignKnown(sectionForm, section.data.value)
})
</script>

<template>
  <section>
    <PageHeader title="Journey" badge="PARCOURS" description="Career branches (education / work / freelance) and their commits.">
      <template #actions>
        <AppButton variant="ghost" @click="showSection = !showSection">
          <Icon name="settings" class="h-4 w-4" /> Section
        </AppButton>
        <AppButton @click="openCreateTrack"><Icon name="plus" class="h-4 w-4" /> Add branch</AppButton>
      </template>
    </PageHeader>

    <!-- Section config -->
    <div v-if="showSection" class="mb-6 rounded-2xl border border-line bg-card p-6">
      <h2 class="mb-5 font-display text-sm font-bold uppercase tracking-wider text-secondary">Journey section</h2>
      <div class="space-y-5">
        <div class="grid gap-5 sm:grid-cols-2">
          <LangField :form="sectionForm" base="section_badge" label="Badge" placeholder="> GIT LOG --ALL" />
          <LangField :form="sectionForm" base="heading" label="Heading" placeholder="My Journey" />
        </div>
        <LangField :form="sectionForm" base="subheading" label="Subheading" type="textarea" :rows="2" />
        <LangField :form="sectionForm" base="next_label" label="Next-commit label" placeholder="next: AI Platform Engineer" />
        <div class="flex items-center justify-end gap-3">
          <span v-if="sectionSaved" class="inline-flex items-center gap-1.5 text-sm text-brand"><Icon name="check" class="h-4 w-4" /> Saved</span>
          <AppButton :loading="section.saving.value" @click="saveSection">Save section</AppButton>
        </div>
      </div>
    </div>

    <div v-if="tracksLoading && !tracks.length" class="grid h-48 place-items-center text-secondary">
      <span class="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-brand" />
    </div>

    <div v-else-if="!tracks.length" class="grid place-items-center rounded-2xl border border-dashed border-line bg-card p-12 text-center">
      <p class="font-mono text-sm text-secondary">&gt;_ No branches yet.</p>
      <AppButton class="mt-4" @click="openCreateTrack"><Icon name="plus" class="h-4 w-4" /> Add the first one</AppButton>
    </div>

    <!-- Tracks -->
    <div v-else class="space-y-3">
      <div v-for="t in tracks" :key="t.id" class="overflow-hidden rounded-2xl border border-line bg-card" :class="{ 'opacity-60': !t.is_active }">
        <!-- Track header -->
        <div class="flex items-center gap-3 p-4">
          <button type="button" class="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-secondary hover:bg-card-hover hover:text-primary" :aria-label="open.includes(t.id) ? 'Collapse' : 'Expand'" @click="toggleOpen(t.id)">
            <Icon name="chevron" class="h-4 w-4 transition-transform" :class="{ 'rotate-90': open.includes(t.id) }" />
          </button>
          <span class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand"><Icon name="journey" class="h-4 w-4" /></span>
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <p class="truncate font-medium text-primary">{{ t.label_en }}</p>
              <span class="rounded-full border border-line px-2 py-0.5 font-mono text-[10px] uppercase text-secondary">{{ t.type }}</span>
              <span v-if="t.employment_type" class="rounded-full border border-line-accent bg-brand/10 px-2 py-0.5 font-mono text-[10px] text-brand">{{ t.employment_type }}</span>
            </div>
            <p class="truncate font-mono text-[11px] text-secondary">
              {{ t.branch_name }}<span v-if="t.org_en"> · {{ t.org_en }}</span><span v-if="t.location_en"> · {{ t.location_en }}</span>
              · {{ fmtDate(t.started_at) }}–{{ t.ended_at ? fmtDate(t.ended_at) : 'now' }}
              · {{ (milestonesByTrack[t.id]?.length ?? 0) }} commits
            </p>
          </div>
          <div class="flex shrink-0 gap-1">
            <button type="button" class="grid h-9 w-9 place-items-center rounded-lg text-secondary hover:bg-card-hover hover:text-primary" aria-label="Edit branch" @click="openEditTrack(t)"><Icon name="edit" class="h-4 w-4" /></button>
            <button type="button" class="grid h-9 w-9 place-items-center rounded-lg text-secondary hover:bg-red-500/10 hover:text-red-500" aria-label="Delete branch" @click="trackToDelete = t"><Icon name="trash" class="h-4 w-4" /></button>
          </div>
        </div>

        <!-- Milestones -->
        <div v-if="open.includes(t.id)" class="border-t border-line bg-page/40 p-4">
          <div class="mb-3 flex items-center justify-between">
            <h3 class="font-mono text-[11px] uppercase tracking-widest text-accent">&gt;_ commits</h3>
            <AppButton variant="ghost" @click="openCreateMs(t.id)"><Icon name="plus" class="h-4 w-4" /> Add commit</AppButton>
          </div>
          <p v-if="!(milestonesByTrack[t.id]?.length)" class="font-mono text-xs text-secondary">No commits on this branch yet.</p>
          <div v-else class="space-y-2">
            <div v-for="m in milestonesByTrack[t.id]" :key="m.id" class="flex items-start gap-3 rounded-xl border border-line bg-surface p-3">
              <span class="mt-0.5 rounded border border-line px-1.5 py-0.5 font-mono text-[10px] uppercase text-secondary">{{ m.kind }}</span>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-primary">
                  <Icon v-if="m.is_highlight" name="star" class="mb-0.5 inline h-3 w-3 fill-current text-brand" /> {{ m.title_en }}
                </p>
                <p class="font-mono text-[11px] text-secondary">
                  {{ fmtDate(m.happened_at) }}<span v-if="m.tag_label"> · {{ m.tag_label }}</span>
                  <span v-if="m.technologies?.length"> · {{ m.technologies.map((x) => x.name).join(', ') }}</span>
                </p>
              </div>
              <div class="flex shrink-0 gap-1">
                <button type="button" class="grid h-8 w-8 place-items-center rounded-lg text-secondary hover:bg-card-hover hover:text-primary" aria-label="Edit commit" @click="openEditMs(m)"><Icon name="edit" class="h-3.5 w-3.5" /></button>
                <button type="button" class="grid h-8 w-8 place-items-center rounded-lg text-secondary hover:bg-red-500/10 hover:text-red-500" aria-label="Delete commit" @click="msToDelete = m"><Icon name="trash" class="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Track modal -->
    <AppModal :open="trackModalOpen" size="xl" :title="editingTrack ? 'Edit branch' : 'New branch'" @close="trackModalOpen = false">
      <form id="track-form" class="space-y-5" @submit.prevent="submitTrack">
        <div v-if="trackError && !trackError.isValidation" class="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-500">{{ trackError.message }}</div>
        <div class="grid gap-5 sm:grid-cols-2">
          <TextField v-model="trackForm.branch_name" label="Branch name" required placeholder="work/devops-engineer" :error="trackError?.first('branch_name')" />
          <TextField v-model="trackForm.slug" label="Slug" placeholder="auto from branch" hint="Auto-filled if blank." :error="trackError?.first('slug')" />
        </div>
        <div class="grid gap-5 sm:grid-cols-2">
          <SelectField v-model="trackForm.type" label="Type" :options="TRACK_TYPES" :error="trackError?.first('type')" />
          <SelectField v-model="trackForm.employment_type" label="Employment type" placeholder="— None —" :options="EMPLOYMENT_TYPES" />
        </div>
        <LangField :form="trackForm" base="label" label="Label" required placeholder="DevOps Engineer" :error="trackError?.first('label_en')" />
        <div class="grid gap-5 sm:grid-cols-2">
          <LangField :form="trackForm" base="org" label="Organization" placeholder="Emertek-AL" />
          <LangField :form="trackForm" base="location" label="Location" placeholder="Tunisia" />
        </div>
        <div class="grid gap-5 sm:grid-cols-3">
          <TextField v-model="trackForm.started_at" type="date" label="Started" required :error="trackError?.first('started_at')" />
          <TextField v-model="trackForm.ended_at" type="date" label="Ended" hint="Blank = ongoing" />
          <TextField v-model="trackForm.merged_at" type="date" label="Merged at" />
        </div>
        <div class="grid gap-5 sm:grid-cols-2">
          <SelectField v-model="trackForm.merges_into_id" label="Merges into" placeholder="— None —" :options="trackMergeOptions" />
          <TextField v-model="trackForm.icon_class" label="Icon class" placeholder="fas fa-server" />
        </div>
        <div class="grid gap-5 sm:grid-cols-3">
          <NumberField v-model="trackForm.lane_index" label="Lane index" :min="0" hint="Graph column." />
          <NumberField v-model="trackForm.sort_order" label="Sort order" :min="0" />
          <div class="flex items-end pb-1"><ToggleField v-model="trackForm.is_active" label="Active" /></div>
        </div>
      </form>
      <template #footer>
        <AppButton variant="ghost" @click="trackModalOpen = false">Cancel</AppButton>
        <AppButton type="submit" form="track-form" :loading="trackSaving">{{ editingTrack ? 'Save' : 'Create' }}</AppButton>
      </template>
    </AppModal>

    <!-- Milestone modal -->
    <AppModal :open="msModalOpen" size="xl" :title="editingMs ? 'Edit commit' : 'New commit'" @close="msModalOpen = false">
      <form id="ms-form" class="space-y-5" @submit.prevent="submitMs">
        <div v-if="msError && !msError.isValidation" class="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-500">{{ msError.message }}</div>
        <div class="grid gap-5 sm:grid-cols-3">
          <SelectField v-model="msForm.kind" label="Kind" :options="KINDS" />
          <TextField v-model="msForm.happened_at" type="date" label="Date" required :error="msError?.first('happened_at')" />
          <TextField v-model="msForm.tag_label" label="Tag label" placeholder="v1.0-bachelor" />
        </div>
        <LangField :form="msForm" base="title" label="Title" required placeholder="feat: shipped the platform" :error="msError?.first('title_en')" />
        <LangField :form="msForm" base="body" label="Body" type="textarea" :rows="3" />
        <div class="grid gap-5 sm:grid-cols-2">
          <SelectField v-model="msForm.project_id" label="Linked project" placeholder="— None —" :options="projectOptions" />
          <TextField v-model="msForm.link_url" type="url" label="Link URL" :error="msError?.first('link_url')" />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-primary">Technologies</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="tech in technologies"
              :key="tech.id"
              type="button"
              class="rounded-full border px-3 py-1 font-mono text-xs transition-colors"
              :class="selectedTechIds.includes(tech.id) ? 'border-line-accent bg-brand/15 text-brand' : 'border-line text-secondary hover:text-primary'"
              @click="toggleTech(tech.id)"
            >
              {{ tech.name }}
            </button>
          </div>
        </div>
        <div class="grid gap-5 sm:grid-cols-3">
          <NumberField v-model="msForm.sort_order" label="Sort order" :min="0" />
          <div class="flex items-end pb-1"><ToggleField v-model="msForm.is_highlight" label="Highlight" /></div>
          <div class="flex items-end pb-1"><ToggleField v-model="msForm.is_active" label="Active" /></div>
        </div>
      </form>
      <template #footer>
        <AppButton variant="ghost" @click="msModalOpen = false">Cancel</AppButton>
        <AppButton type="submit" form="ms-form" :loading="msSaving">{{ editingMs ? 'Save' : 'Create' }}</AppButton>
      </template>
    </AppModal>

    <ConfirmDialog
      :open="!!trackToDelete"
      title="Delete branch?"
      :message="`“${trackToDelete?.label_en ?? ''}” and all its commits will be permanently removed.`"
      :loading="deletingTrack"
      @confirm="confirmDeleteTrack"
      @cancel="trackToDelete = null"
    />
    <ConfirmDialog
      :open="!!msToDelete"
      title="Delete commit?"
      :message="`“${msToDelete?.title_en ?? ''}” will be permanently removed.`"
      :loading="deletingMs"
      @confirm="confirmDeleteMs"
      @cancel="msToDelete = null"
    />
  </section>
</template>
