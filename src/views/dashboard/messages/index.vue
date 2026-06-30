<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import Icon from '@/components/Icon.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppModal from '@/components/ui/AppModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import type { ContactMessage } from '@/api/types'
import { useContactMessages } from '@/composables/resources/contactMessages'

const { items, pagination, loading, index, markRead, remove } = useContactMessages()

const page = ref(1)
const onlyUnread = ref(false)

const detailOpen = ref(false)
const selected = ref<ContactMessage | null>(null)

const toDelete = ref<ContactMessage | null>(null)
const deleting = ref(false)

async function load() {
  await index({ page: page.value, per_page: 15, unread: onlyUnread.value || undefined })
}

function setFilter(unread: boolean) {
  if (onlyUnread.value === unread) return
  onlyUnread.value = unread
  page.value = 1
  load()
}

function goTo(p: number) {
  page.value = p
  load()
}

async function open(msg: ContactMessage) {
  selected.value = msg
  detailOpen.value = true
  if (!msg.is_read) {
    try {
      selected.value = await markRead(msg.id)
    } catch {
      /* keep showing the message even if marking read fails */
    }
  }
}

async function confirmDelete() {
  if (!toDelete.value) return
  deleting.value = true
  try {
    const id = toDelete.value.id
    await remove(id)
    if (selected.value?.id === id) {
      detailOpen.value = false
      selected.value = null
    }
    toDelete.value = null
    await load()
  } finally {
    deleting.value = false
  }
}

function initials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('') || '?'
  )
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString()
}

const mailtoHref = computed(() => {
  const msg = selected.value
  if (!msg) return '#'
  const subject = msg.subject ? `Re: ${msg.subject}` : 'Re: your message'
  return `mailto:${msg.sender_email}?subject=${encodeURIComponent(subject)}`
})

onMounted(load)
</script>

<template>
  <section>
    <PageHeader title="Messages" badge="INBOX" description="Contact-form submissions from visitors." />

    <!-- Filter tabs -->
    <div class="mb-5 inline-flex rounded-full border border-line bg-card p-1">
      <button
        type="button"
        class="rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
        :class="!onlyUnread ? 'bg-brand text-[#1a1f3c]' : 'text-secondary hover:text-primary'"
        @click="setFilter(false)"
      >
        All
      </button>
      <button
        type="button"
        class="rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
        :class="onlyUnread ? 'bg-brand text-[#1a1f3c]' : 'text-secondary hover:text-primary'"
        @click="setFilter(true)"
      >
        Unread
      </button>
    </div>

    <div v-if="loading && !items.length" class="grid h-48 place-items-center text-secondary">
      <span class="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-brand" />
    </div>

    <div
      v-else-if="!items.length"
      class="grid place-items-center rounded-2xl border border-dashed border-line bg-card p-12 text-center"
    >
      <Icon name="messages" class="h-8 w-8 text-secondary/40" />
      <p class="mt-3 font-mono text-sm text-secondary">
        &gt;_ {{ onlyUnread ? 'No unread messages.' : 'No messages yet.' }}
      </p>
    </div>

    <ul v-else class="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
      <li
        v-for="msg in items"
        :key="msg.id"
        class="flex cursor-pointer items-center gap-4 px-5 py-4 transition-colors hover:bg-card-hover"
        :class="{ 'bg-brand/5': !msg.is_read }"
        @click="open(msg)"
      >
        <span class="relative shrink-0">
          <span
            class="grid h-10 w-10 place-items-center rounded-full border font-display text-sm font-bold"
            :class="msg.is_read ? 'border-line bg-page text-secondary' : 'border-line-accent bg-brand/15 text-brand'"
          >
            {{ initials(msg.sender_name) }}
          </span>
          <span v-if="!msg.is_read" class="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-card bg-brand" />
        </span>

        <div class="min-w-0 flex-1">
          <div class="flex items-center justify-between gap-3">
            <p class="truncate" :class="msg.is_read ? 'font-medium text-primary' : 'font-bold text-primary'">
              {{ msg.sender_name }}
            </p>
            <span class="shrink-0 font-mono text-[11px] text-secondary">{{ formatDate(msg.created_at) }}</span>
          </div>
          <p class="truncate text-sm" :class="msg.is_read ? 'text-secondary' : 'text-primary'">
            {{ msg.subject || '(no subject)' }}
          </p>
          <p class="truncate text-xs text-secondary">{{ msg.message }}</p>
        </div>

        <button
          type="button"
          class="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-secondary hover:bg-red-500/10 hover:text-red-500"
          aria-label="Delete"
          @click.stop="toDelete = msg"
        >
          <Icon name="trash" class="h-4 w-4" />
        </button>
      </li>
    </ul>

    <!-- Pagination -->
    <div v-if="pagination && pagination.last_page > 1" class="mt-6 flex items-center justify-center gap-3">
      <AppButton variant="ghost" :disabled="pagination.current_page <= 1" @click="goTo(pagination.current_page - 1)">Prev</AppButton>
      <span class="font-mono text-sm text-secondary">
        Page {{ pagination.current_page }} / {{ pagination.last_page }} · {{ pagination.total }} total
      </span>
      <AppButton variant="ghost" :disabled="pagination.current_page >= pagination.last_page" @click="goTo(pagination.current_page + 1)">Next</AppButton>
    </div>

    <!-- Detail modal -->
    <AppModal
      :open="detailOpen"
      :title="selected?.subject || '(no subject)'"
      :subtitle="selected ? `${selected.sender_name} · ${formatDate(selected.created_at)}` : undefined"
      @close="detailOpen = false"
    >
      <div v-if="selected" class="space-y-4">
        <div class="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-card px-4 py-3">
          <span class="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line-accent bg-brand/15 font-display text-sm font-bold text-brand">
            {{ initials(selected.sender_name) }}
          </span>
          <div class="min-w-0">
            <p class="truncate font-medium text-primary">{{ selected.sender_name }}</p>
            <a :href="`mailto:${selected.sender_email}`" class="truncate font-mono text-xs text-accent hover:underline">
              {{ selected.sender_email }}
            </a>
          </div>
        </div>

        <div class="whitespace-pre-wrap rounded-xl border border-line bg-page px-4 py-4 text-sm leading-relaxed text-primary">
          {{ selected.message }}
        </div>
      </div>

      <template #footer>
        <AppButton variant="danger" @click="toDelete = selected">
          <Icon name="trash" class="h-4 w-4" /> Delete
        </AppButton>
        <a
          :href="mailtoHref"
          class="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-[#1a1f3c] glow-brand hover:bg-brand-hover"
        >
          <Icon name="contact" class="h-4 w-4" /> Reply
        </a>
      </template>
    </AppModal>

    <ConfirmDialog
      :open="!!toDelete"
      title="Delete message?"
      :message="`The message from “${toDelete?.sender_name ?? ''}” will be permanently removed.`"
      :loading="deleting"
      @confirm="confirmDelete"
      @cancel="toDelete = null"
    />
  </section>
</template>
