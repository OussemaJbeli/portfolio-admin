<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'

import { ApiError } from '@/api/client'
import Icon from '@/components/Icon.vue'
import SelectField from '@/components/form/SelectField.vue'
import TextField from '@/components/form/TextField.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppModal from '@/components/ui/AppModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import type { AdminUser, AdminUserCreateInput, AdminUserUpdateInput } from '@/api/types'
import { useAdminUsers } from '@/composables/resources/collections'
import { useAuth } from '@/composables/useAuth'

const { user, isSuperadmin, fetchMe } = useAuth()
const { items, loading, saving, index, create, update, remove } = useAdminUsers()

const ROLE_OPTIONS = [
  { value: 'editor', label: 'Editor' },
  { value: 'superadmin', label: 'Superadmin' },
]

const modalOpen = ref(false)
const editing = ref<AdminUser | null>(null)
const formError = ref<ApiError | null>(null)

function blank() {
  return { name: '', email: '', password: '', role: 'editor' }
}
const form = reactive(blank())

function openCreate() {
  editing.value = null
  Object.assign(form, blank())
  formError.value = null
  modalOpen.value = true
}

function openEdit(item: AdminUser) {
  editing.value = item
  Object.assign(form, blank())
  form.name = item.name
  form.email = item.email
  form.role = item.role
  formError.value = null
  modalOpen.value = true
}

async function submit() {
  formError.value = null
  try {
    const payload: Record<string, unknown> = {
      name: form.name,
      email: form.email,
      role: form.role,
    }
    // Password is required on create; on edit, only send it when changed.
    if (form.password) payload.password = form.password

    if (editing.value) await update(editing.value.id, payload as unknown as AdminUserUpdateInput)
    else await create(payload as unknown as AdminUserCreateInput)
    modalOpen.value = false
    await index()
  } catch (e) {
    formError.value = ApiError.from(e)
  }
}

const toDelete = ref<AdminUser | null>(null)
const deleting = ref(false)
async function confirmDelete() {
  if (!toDelete.value) return
  deleting.value = true
  try {
    await remove(toDelete.value.id)
    toDelete.value = null
  } catch (e) {
    // Surface backend guards (e.g. can't delete your own account).
    formError.value = ApiError.from(e)
    toDelete.value = null
  } finally {
    deleting.value = false
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return 'never'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? 'never' : d.toLocaleString()
}

onMounted(async () => {
  if (!user.value) {
    try {
      await fetchMe()
    } catch {
      /* guard below handles it */
    }
  }
  if (isSuperadmin.value) await index()
})
</script>

<template>
  <section>
    <PageHeader title="Admin Users" badge="CONFIGURATION" description="Back-office accounts.">
      <template v-if="isSuperadmin" #actions>
        <AppButton @click="openCreate"><Icon name="plus" class="h-4 w-4" /> Add user</AppButton>
      </template>
    </PageHeader>

    <!-- Superadmin gate -->
    <div
      v-if="!isSuperadmin"
      class="grid place-items-center rounded-2xl border border-dashed border-line bg-card p-12 text-center"
    >
      <div class="grid h-12 w-12 place-items-center rounded-full border border-line-accent bg-brand/15 text-brand">
        <Icon name="users" class="h-6 w-6" />
      </div>
      <p class="mt-4 font-display font-bold text-primary">Superadmin only</p>
      <p class="mt-1 font-mono text-sm text-secondary">&gt;_ Managing accounts requires a superadmin role.</p>
    </div>

    <template v-else>
      <!-- Non-validation error banner (e.g. delete guard) -->
      <div
        v-if="formError && !formError.isValidation && !modalOpen"
        class="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-500"
      >
        {{ formError.message }}
      </div>

      <div v-if="loading && !items.length" class="grid h-48 place-items-center text-secondary">
        <span class="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-brand" />
      </div>

      <ul v-else class="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
        <li v-for="item in items" :key="item.id" class="flex items-center gap-4 px-5 py-4">
          <span class="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line-accent bg-brand/15 font-display text-sm font-bold text-brand">
            {{ item.name.charAt(0).toUpperCase() }}
          </span>
          <div class="min-w-0 flex-1">
            <p class="truncate font-medium text-primary">
              {{ item.name }}
              <span v-if="item.id === user?.id" class="ml-1 font-mono text-[11px] text-secondary">(you)</span>
            </p>
            <p class="mt-0.5 truncate font-mono text-[11px] text-secondary">
              {{ item.email }} · last login {{ formatDate(item.last_login_at) }}
            </p>
          </div>
          <span
            class="shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize"
            :class="item.role === 'superadmin' ? 'border-brand/40 bg-brand/10 text-brand' : 'border-line text-secondary'"
          >
            {{ item.role }}
          </span>
          <div class="flex shrink-0 gap-1">
            <button type="button" class="grid h-9 w-9 place-items-center rounded-lg text-secondary hover:bg-card-hover hover:text-primary" aria-label="Edit" @click="openEdit(item)">
              <Icon name="edit" class="h-4 w-4" />
            </button>
            <button
              type="button"
              class="grid h-9 w-9 place-items-center rounded-lg text-secondary hover:bg-red-500/10 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Delete"
              :disabled="item.id === user?.id"
              :title="item.id === user?.id ? 'You cannot delete your own account' : 'Delete'"
              @click="toDelete = item"
            >
              <Icon name="trash" class="h-4 w-4" />
            </button>
          </div>
        </li>
      </ul>
    </template>

    <AppModal :open="modalOpen" :title="editing ? 'Edit user' : 'New user'" @close="modalOpen = false">
      <form id="admin-form" class="space-y-5" @submit.prevent="submit">
        <div v-if="formError && !formError.isValidation" class="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {{ formError.message }}
        </div>
        <div class="grid gap-5 sm:grid-cols-2">
          <TextField v-model="form.name" label="Name" required :error="formError?.first('name')" />
          <TextField v-model="form.email" type="email" label="Email" required :error="formError?.first('email')" />
        </div>
        <div class="grid gap-5 sm:grid-cols-2">
          <TextField
            v-model="form.password"
            type="password"
            label="Password"
            :required="!editing"
            :placeholder="editing ? '••••••••' : ''"
            :hint="editing ? 'Leave blank to keep current.' : 'Min 8 characters.'"
            :error="formError?.first('password')"
          />
          <SelectField v-model="form.role" label="Role" :options="ROLE_OPTIONS" :error="formError?.first('role')" />
        </div>
      </form>
      <template #footer>
        <AppButton variant="ghost" @click="modalOpen = false">Cancel</AppButton>
        <AppButton type="submit" form="admin-form" :loading="saving">{{ editing ? 'Save' : 'Create' }}</AppButton>
      </template>
    </AppModal>

    <ConfirmDialog
      :open="!!toDelete"
      title="Delete user?"
      :message="`“${toDelete?.name ?? ''}” will lose access permanently.`"
      :loading="deleting"
      @confirm="confirmDelete"
      @cancel="toDelete = null"
    />
  </section>
</template>
