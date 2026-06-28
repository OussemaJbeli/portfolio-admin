/**
 * Blog child resources: the table-of-contents (shallow nested), the editorial
 * "related articles" pivot, and the blog ↔ category pivot. The pivot
 * composables take the blog slug.
 */

import { ref, type Ref } from 'vue'

import { api, ApiError } from '@/api/client'
import { defineNestedResource } from '@/composables/useNestedResource'
import type { ResourceId } from '@/composables/useCrudResource'
import type {
  AttachBlogCategoryInput,
  AttachRelatedInput,
  Blog,
  BlogCategory,
  BlogToc,
  BlogTocInput,
  SyncBlogCategoriesInput,
} from '@/api/types'

export const useBlogToc = defineNestedResource<BlogToc, BlogTocInput>({
  parent: 'blogs',
  child: 'toc',
})

/**
 * Blog ↔ "related articles" pivot (`/admin/blogs/{blog}/related`).
 * `attach` returns the refreshed related list; `detach` returns 204.
 */
export function useBlogRelated(blogKey: ResourceId) {
  const base = `/admin/blogs/${blogKey}/related`

  const items = ref([]) as Ref<Blog[]>
  const saving = ref(false)
  const error = ref<ApiError | null>(null)

  /** POST — link a related article (rejects linking an article to itself). */
  async function attach(payload: AttachRelatedInput): Promise<Blog[]> {
    saving.value = true
    error.value = null
    try {
      const rows = await api.post<Blog[]>(base, payload)
      items.value = rows
      return rows
    } catch (err) {
      error.value = ApiError.from(err)
      throw error.value
    } finally {
      saving.value = false
    }
  }

  /** DELETE — unlink a related article. */
  async function detach(relatedId: number): Promise<void> {
    saving.value = true
    error.value = null
    try {
      await api.delete(`${base}/${relatedId}`)
      items.value = items.value.filter((blog) => blog.id !== relatedId)
    } catch (err) {
      error.value = ApiError.from(err)
      throw error.value
    } finally {
      saving.value = false
    }
  }

  return { items, saving, error, attach, detach }
}

/**
 * Blog ↔ category pivot (`/admin/blogs/{blog}/categories`).
 * Every mutation returns the full category list, except `detach` (204).
 */
export function useBlogCategoriesMap(blogKey: ResourceId) {
  const base = `/admin/blogs/${blogKey}/categories`

  const items = ref([]) as Ref<BlogCategory[]>
  const saving = ref(false)
  const error = ref<ApiError | null>(null)

  async function run(promise: Promise<BlogCategory[]>): Promise<BlogCategory[]> {
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

  /** POST — attach one category, keeping the existing set. */
  function attach(payload: AttachBlogCategoryInput): Promise<BlogCategory[]> {
    return run(api.post<BlogCategory[]>(base, payload))
  }

  /** PUT — replace the whole set in one call. */
  function sync(payload: SyncBlogCategoriesInput): Promise<BlogCategory[]> {
    return run(api.put<BlogCategory[]>(base, payload))
  }

  /** DELETE — detach a single category. */
  async function detach(categoryId: number): Promise<void> {
    saving.value = true
    error.value = null
    try {
      await api.delete(`${base}/${categoryId}`)
      items.value = items.value.filter((category) => category.id !== categoryId)
    } catch (err) {
      error.value = ApiError.from(err)
      throw error.value
    } finally {
      saving.value = false
    }
  }

  return { items, saving, error, attach, sync, detach }
}
