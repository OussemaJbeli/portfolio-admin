/**
 * Contact-message inbox (admin) — list / show / mark-read / delete against
 * `/api/admin/contact-messages`. The public submission endpoint lives in
 * `usePublicApi` (`resources/public.ts`).
 */

import { ref, type Ref } from 'vue'

import { api, ApiError } from '@/api/client'
import type { ContactMessage, Paginated, PaginationMeta } from '@/api/types'

export function useContactMessages() {
  const items = ref([]) as Ref<ContactMessage[]>
  const current = ref(null) as Ref<ContactMessage | null>
  const pagination = ref<PaginationMeta | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<ApiError | null>(null)

  /** GET /admin/contact-messages — paginated. Pass `{ unread, per_page, page }`. */
  async function index(params?: {
    unread?: boolean
    per_page?: number
    page?: number
  }): Promise<ContactMessage[]> {
    loading.value = true
    error.value = null
    try {
      const page = await api.get<Paginated<ContactMessage>>('/admin/contact-messages', params)
      items.value = page.data
      pagination.value = {
        current_page: page.current_page,
        last_page: page.last_page,
        per_page: page.per_page,
        total: page.total,
        from: page.from,
        to: page.to,
      }
      return page.data
    } catch (err) {
      error.value = ApiError.from(err)
      throw error.value
    } finally {
      loading.value = false
    }
  }

  /** GET /admin/contact-messages/{id}. */
  async function show(id: number): Promise<ContactMessage> {
    loading.value = true
    error.value = null
    try {
      const message = await api.get<ContactMessage>(`/admin/contact-messages/${id}`)
      current.value = message
      return message
    } catch (err) {
      error.value = ApiError.from(err)
      throw error.value
    } finally {
      loading.value = false
    }
  }

  /** PATCH /admin/contact-messages/{id}/read. */
  async function markRead(id: number): Promise<ContactMessage> {
    saving.value = true
    error.value = null
    try {
      const message = await api.patch<ContactMessage>(`/admin/contact-messages/${id}/read`)
      items.value = items.value.map((item) => (item.id === id ? message : item))
      if (current.value?.id === id) current.value = message
      return message
    } catch (err) {
      error.value = ApiError.from(err)
      throw error.value
    } finally {
      saving.value = false
    }
  }

  /** DELETE /admin/contact-messages/{id}. */
  async function remove(id: number): Promise<void> {
    saving.value = true
    error.value = null
    try {
      await api.delete(`/admin/contact-messages/${id}`)
      items.value = items.value.filter((item) => item.id !== id)
      if (current.value?.id === id) current.value = null
    } catch (err) {
      error.value = ApiError.from(err)
      throw error.value
    } finally {
      saving.value = false
    }
  }

  return { items, current, pagination, loading, saving, error, index, show, markRead, remove }
}
