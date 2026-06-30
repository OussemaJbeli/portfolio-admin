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
import type { NavItem, NavItemInput } from '@/api/types'
import { useNavItems } from '@/composables/resources/collections'
import { provideFormLocale } from '@/composables/useFormLocale'
import { assignKnown, toPayload } from '@/lib/forms'

provideFormLocale('en')

const { items, loading, saving, index, create, update, remove } = useNavItems()

const modalOpen = ref(false)
const editing = ref<NavItem | null>(null)
const formError = ref<ApiError | null>(null)

function blank() {
  return {
    route_key: '',
    href: '',
    icon_class: '',
    label_en: '',
    label_fr: '',
    label_ar: '',
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

function openEdit(item: NavItem) {
  editing.value = item
  Object.assign(form, blank())
  assignKnown(form, item)
  formError.value = null
  modalOpen.value = true
}

async function submit() {
  formError.value = null
  try {
    const payload = toPayload(form) as NavItemInput
    if (editing.value) await update(editing.value.id, payload)
    else await create(payload)
    modalOpen.value = false
    await index()
  } catch (e) {
    formError.value = ApiError.from(e)
  }
}

const toDelete = ref<NavItem | null>(null)
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
    <PageHeader title="Navigation" badge="CONFIGURATION" description="The public site's navbar items.">
      <template #actions>
        <AppButton @click="openCreate"><Icon name="plus" class="h-4 w-4" /> Add item</AppButton>
      </template>
    </PageHeader>

    <div v-if="loading && !items.length" class="grid h-48 place-items-center text-secondary">
      <span class="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-brand" />
    </div>

    <div
      v-else-if="!items.length"
      class="grid place-items-center rounded-2xl border border-dashed border-line bg-card p-12 text-center"
    >
      <p class="font-mono text-sm text-secondary">&gt;_ No nav items yet.</p>
      <AppButton class="mt-4" @click="openCreate"><Icon name="plus" class="h-4 w-4" /> Add the first one</AppButton>
    </div>

    <ul v-else class="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
      <li v-for="item in items" :key="item.id" class="flex items-center gap-4 px-5 py-4">
        <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line-accent bg-brand/15 text-brand">
          <Icon name="navigation" class="h-5 w-5" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="truncate font-medium text-primary">{{ item.label_en || '—' }}</p>
          <p class="mt-0.5 truncate font-mono text-[11px] text-secondary">
            {{ item.route_key }} → {{ item.href }} · order {{ item.sort_order }}
          </p>
        </div>
        <span
          class="shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold"
          :class="item.is_active ? 'border-brand/40 bg-brand/10 text-brand' : 'border-line text-secondary'"
        >
          {{ item.is_active ? 'Active' : 'Hidden' }}
        </span>
        <div class="flex shrink-0 gap-1">
          <button type="button" class="grid h-9 w-9 place-items-center rounded-lg text-secondary hover:bg-card-hover hover:text-primary" aria-label="Edit" @click="openEdit(item)">
            <Icon name="edit" class="h-4 w-4" />
          </button>
          <button type="button" class="grid h-9 w-9 place-items-center rounded-lg text-secondary hover:bg-red-500/10 hover:text-red-500" aria-label="Delete" @click="toDelete = item">
            <Icon name="trash" class="h-4 w-4" />
          </button>
        </div>
      </li>
    </ul>

    <AppModal :open="modalOpen" :title="editing ? 'Edit nav item' : 'New nav item'" @close="modalOpen = false">
      <form id="nav-form" class="space-y-5" @submit.prevent="submit">
        <div v-if="formError && !formError.isValidation" class="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {{ formError.message }}
        </div>
        <LangField :form="form" base="label" label="Label" required :error="formError?.first('label_en')" />
        <div class="grid gap-5 sm:grid-cols-2">
          <TextField v-model="form.route_key" label="Route key" required placeholder="home" hint="Unique key, e.g. home" :error="formError?.first('route_key')" />
          <TextField v-model="form.href" label="Href" required placeholder="#home or /projects" :error="formError?.first('href')" />
        </div>
        <TextField v-model="form.icon_class" label="Icon class" placeholder="fas fa-house" />
        <div class="grid gap-5 sm:grid-cols-2">
          <NumberField v-model="form.sort_order" label="Sort order" :min="0" />
          <div class="flex items-end pb-1">
            <ToggleField v-model="form.is_active" label="Active" />
          </div>
        </div>
      </form>
      <template #footer>
        <AppButton variant="ghost" @click="modalOpen = false">Cancel</AppButton>
        <AppButton type="submit" form="nav-form" :loading="saving">{{ editing ? 'Save' : 'Create' }}</AppButton>
      </template>
    </AppModal>

    <ConfirmDialog
      :open="!!toDelete"
      title="Delete nav item?"
      :message="`“${toDelete?.label_en ?? ''}” will be permanently removed.`"
      :loading="deleting"
      @confirm="confirmDelete"
      @cancel="toDelete = null"
    />
  </section>
</template>
