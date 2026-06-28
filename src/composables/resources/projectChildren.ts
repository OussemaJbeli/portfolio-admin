/**
 * Project child resources (gallery / features / roles, shallow nested) and the
 * project ↔ technology pivot. The child composables take the project slug:
 *
 *   const gallery = useProjectGallery(projectSlug)
 *   await gallery.index()
 */

import { ref, type Ref } from 'vue'

import { api, ApiError } from '@/api/client'
import { defineNestedResource } from '@/composables/useNestedResource'
import type { ResourceId } from '@/composables/useCrudResource'
import type {
  AttachTechnologyInput,
  ProjectFeature,
  ProjectFeatureInput,
  ProjectGallery,
  ProjectGalleryInput,
  ProjectRole,
  ProjectRoleInput,
  SyncTechnologiesInput,
  Technology,
} from '@/api/types'

export const useProjectGallery = defineNestedResource<ProjectGallery, ProjectGalleryInput>({
  parent: 'projects',
  child: 'gallery',
})

export const useProjectFeatures = defineNestedResource<ProjectFeature, ProjectFeatureInput>({
  parent: 'projects',
  child: 'features',
})

export const useProjectRoles = defineNestedResource<ProjectRole, ProjectRoleInput>({
  parent: 'projects',
  child: 'roles',
})

/**
 * Project ↔ technology pivot (`/admin/projects/{project}/technologies`).
 * Every mutation returns the full, freshly-ordered technology list.
 */
export function useProjectTechnologies(projectKey: ResourceId) {
  const base = `/admin/projects/${projectKey}/technologies`

  const items = ref([]) as Ref<Technology[]>
  const saving = ref(false)
  const error = ref<ApiError | null>(null)

  async function run(promise: Promise<Technology[]>): Promise<Technology[]> {
    saving.value = true
    error.value = null
    try {
      const rows = await promise
      items.value = rows
      return rows
    } catch (err) {
      error.value = ApiError.from(err)
      throw error.value
    } finally {
      saving.value = false
    }
  }

  /** POST — attach one technology, keeping the existing set. */
  function attach(payload: AttachTechnologyInput): Promise<Technology[]> {
    return run(api.post<Technology[]>(base, payload))
  }

  /** PUT — replace the whole set in one call. */
  function sync(payload: SyncTechnologiesInput): Promise<Technology[]> {
    return run(api.put<Technology[]>(base, payload))
  }

  /** DELETE — detach a single technology (returns 204, so refresh locally). */
  async function detach(technologyId: number): Promise<void> {
    saving.value = true
    error.value = null
    try {
      await api.delete(`${base}/${technologyId}`)
      items.value = items.value.filter((tech) => tech.id !== technologyId)
    } catch (err) {
      error.value = ApiError.from(err)
      throw error.value
    } finally {
      saving.value = false
    }
  }

  return { items, saving, error, attach, sync, detach }
}
