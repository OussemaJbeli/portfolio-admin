/**
 * Factory that builds a stateful CRUD composable for an admin collection
 * (`/api/admin/<resource>`). Each call to the returned composable creates its
 * own reactive state, so list and detail views never clobber each other.
 */

import { ref, type Ref } from 'vue'

import { api, ApiError } from '@/api/client'
import type { Paginated, PaginationMeta } from '@/api/types'

export interface CrudResourceConfig {
  /** URL segment after `/admin/`, e.g. `projects` → `/admin/projects`. */
  resource: string
  /** `true` when the index endpoint returns a Laravel paginator. */
  paginated?: boolean
}

/** Identifier used in a row URL — numeric id, or a slug for projects/blogs. */
export type ResourceId = string | number

function toPaginationMeta<T>(page: Paginated<T>): PaginationMeta {
  return {
    current_page: page.current_page,
    last_page: page.last_page,
    per_page: page.per_page,
    total: page.total,
    from: page.from,
    to: page.to,
  }
}

function matchesId(row: unknown, id: ResourceId): boolean {
  const record = row as { id?: ResourceId; slug?: ResourceId }
  return record.id === id || record.slug === id
}

export function defineCrudResource<TItem, TCreate, TUpdate = Partial<TCreate>>(
  config: CrudResourceConfig,
) {
  const base = `/admin/${config.resource}`

  return function useCrudResource() {
    const items = ref([]) as Ref<TItem[]>
    const current = ref(null) as Ref<TItem | null>
    const pagination = ref<PaginationMeta | null>(null)
    const loading = ref(false)
    const saving = ref(false)
    const error = ref<ApiError | null>(null)

    /** GET /admin/<resource> — list (optionally filtered / paginated). */
    async function index(params?: Record<string, unknown>): Promise<TItem[]> {
      loading.value = true
      error.value = null
      try {
        if (config.paginated) {
          const page = await api.get<Paginated<TItem>>(base, params)
          items.value = page.data
          pagination.value = toPaginationMeta(page)
          return page.data
        }
        const rows = await api.get<TItem[]>(base, params)
        items.value = rows
        return rows
      } catch (err) {
        error.value = ApiError.from(err)
        throw error.value
      } finally {
        loading.value = false
      }
    }

    /** GET /admin/<resource>/<id> — single row. */
    async function show(id: ResourceId): Promise<TItem> {
      loading.value = true
      error.value = null
      try {
        const row = await api.get<TItem>(`${base}/${id}`)
        current.value = row
        return row
      } catch (err) {
        error.value = ApiError.from(err)
        throw error.value
      } finally {
        loading.value = false
      }
    }

    /** POST /admin/<resource> — create. */
    async function create(payload: TCreate): Promise<TItem> {
      saving.value = true
      error.value = null
      try {
        const row = await api.post<TItem>(base, payload)
        items.value = [...items.value, row]
        current.value = row
        return row
      } catch (err) {
        error.value = ApiError.from(err)
        throw error.value
      } finally {
        saving.value = false
      }
    }

    /** PUT /admin/<resource>/<id> — update. */
    async function update(id: ResourceId, payload: TUpdate): Promise<TItem> {
      saving.value = true
      error.value = null
      try {
        const row = await api.put<TItem>(`${base}/${id}`, payload)
        items.value = items.value.map((item) => (matchesId(item, id) ? row : item))
        if (current.value && matchesId(current.value, id)) current.value = row
        return row
      } catch (err) {
        error.value = ApiError.from(err)
        throw error.value
      } finally {
        saving.value = false
      }
    }

    /** DELETE /admin/<resource>/<id>. */
    async function remove(id: ResourceId): Promise<void> {
      saving.value = true
      error.value = null
      try {
        await api.delete(`${base}/${id}`)
        items.value = items.value.filter((item) => !matchesId(item, id))
        if (current.value && matchesId(current.value, id)) current.value = null
      } catch (err) {
        error.value = ApiError.from(err)
        throw error.value
      } finally {
        saving.value = false
      }
    }

    return {
      items,
      current,
      pagination,
      loading,
      saving,
      error,
      index,
      show,
      create,
      update,
      remove,
    }
  }
}
