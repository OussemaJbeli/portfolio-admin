/**
 * Factory for the "section config" singletons (one editable row each):
 * `GET /api/admin/<resource>` to read, `PUT /api/admin/<resource>` to save.
 */

import { ref, type Ref } from 'vue'

import { api, ApiError } from '@/api/client'

export function defineSingletonResource<TData, TUpdate = Partial<TData>>(resource: string) {
  const base = `/admin/${resource}`

  return function useSingletonResource() {
    const data = ref(null) as Ref<TData | null>
    const loading = ref(false)
    const saving = ref(false)
    const error = ref<ApiError | null>(null)

    /** GET /admin/<resource>. */
    async function fetch(): Promise<TData> {
      loading.value = true
      error.value = null
      try {
        const row = await api.get<TData>(base)
        data.value = row
        return row
      } catch (err) {
        error.value = ApiError.from(err)
        throw error.value
      } finally {
        loading.value = false
      }
    }

    /** PUT /admin/<resource>. */
    async function save(payload: TUpdate): Promise<TData> {
      saving.value = true
      error.value = null
      try {
        const row = await api.put<TData>(base, payload)
        data.value = row
        return row
      } catch (err) {
        error.value = ApiError.from(err)
        throw error.value
      } finally {
        saving.value = false
      }
    }

    return { data, loading, saving, error, fetch, save }
  }
}
