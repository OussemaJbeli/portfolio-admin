/**
 * Backend base URL for rendering stored images.
 *
 * Uploaded images are stored as a relative "/assets/<folder>/<file>" path, so
 * an <img> must prefix them with the backend origin:
 *
 *   const baseUrl = useBaseUrl()
 *   <img :src="baseUrl + item.photo_url" />
 *
 * `assetUrl()` is the null-safe variant (returns '' for empty values and leaves
 * already-absolute URLs untouched).
 */
import { BACKEND_URL } from '@/api/client'

export function useBaseUrl(): string {
  return BACKEND_URL
}

export function assetUrl(path: string | null | undefined): string {
  if (!path) return ''
  if (/^(https?:|data:|blob:)/i.test(path)) return path
  return BACKEND_URL + (path.startsWith('/') ? path : `/${path}`)
}
