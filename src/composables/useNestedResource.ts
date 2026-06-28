/**
 * Factory for the shallow nested children (project gallery/features/roles,
 * blog toc). The routes are registered with `apiResource(...)->shallow()`:
 *
 *   index : GET    /admin/<parent>/<parentKey>/<child>
 *   store : POST   /admin/<parent>/<parentKey>/<child>
 *   show  : GET    /admin/<child>/<id>
 *   update: PUT    /admin/<child>/<id>
 *   destroy DELETE /admin/<child>/<id>
 *
 * The composable takes the parent key (id, or slug for projects/blogs) at call
 * time: `const gallery = useProjectGallery(projectSlug)`.
 */

import { ref, type Ref } from 'vue'

import { api, ApiError } from '@/api/client'
import type { ResourceId } from '@/composables/useCrudResource'

export interface NestedResourceConfig {
  /** Parent segment, e.g. `projects`. */
  parent: string
  /** Shallow child segment, e.g. `gallery`. */
  child: string
}

function matchesId(row: unknown, id: ResourceId): boolean {
  return (row as { id?: ResourceId }).id === id
}

export function defineNestedResource<TItem, TCreate, TUpdate = Partial<TCreate>>(
  config: NestedResourceConfig,
) {
  return function useNestedResource(parentKey: ResourceId) {
    const nestedBase = `/admin/${config.parent}/${parentKey}/${config.child}`
    const shallowBase = `/admin/${config.child}`

    const items = ref([]) as Ref<TItem[]>
    const current = ref(null) as Ref<TItem | null>
    const loading = ref(false)
    const saving = ref(false)
    const error = ref<ApiError | null>(null)

    /** GET /admin/<parent>/<parentKey>/<child>. */
    async function index(): Promise<TItem[]> {
      loading.value = true
      error.value = null
      try {
        const rows = await api.get<TItem[]>(nestedBase)
        items.value = rows
        return rows
      } catch (err) {
        error.value = ApiError.from(err)
        throw error.value
      } finally {
        loading.value = false
      }
    }

    /** GET /admin/<child>/<id>. */
    async function show(id: ResourceId): Promise<TItem> {
      loading.value = true
      error.value = null
      try {
        const row = await api.get<TItem>(`${shallowBase}/${id}`)
        current.value = row
        return row
      } catch (err) {
        error.value = ApiError.from(err)
        throw error.value
      } finally {
        loading.value = false
      }
    }

    /** POST /admin/<parent>/<parentKey>/<child>. */
    async function create(payload: TCreate): Promise<TItem> {
      saving.value = true
      error.value = null
      try {
        const row = await api.post<TItem>(nestedBase, payload)
        items.value = [...items.value, row]
        return row
      } catch (err) {
        error.value = ApiError.from(err)
        throw error.value
      } finally {
        saving.value = false
      }
    }

    /** PUT /admin/<child>/<id>. */
    async function update(id: ResourceId, payload: TUpdate): Promise<TItem> {
      saving.value = true
      error.value = null
      try {
        const row = await api.put<TItem>(`${shallowBase}/${id}`, payload)
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

    /** DELETE /admin/<child>/<id>. */
    async function remove(id: ResourceId): Promise<void> {
      saving.value = true
      error.value = null
      try {
        await api.delete(`${shallowBase}/${id}`)
        items.value = items.value.filter((item) => !matchesId(item, id))
        if (current.value && matchesId(current.value, id)) current.value = null
      } catch (err) {
        error.value = ApiError.from(err)
        throw error.value
      } finally {
        saving.value = false
      }
    }

    return { items, current, loading, saving, error, index, show, create, update, remove }
  }
}
