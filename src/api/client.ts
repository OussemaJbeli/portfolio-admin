/**
 * Tiny typed fetch wrapper around the Laravel API.
 *
 * - Reads the base URL from `VITE_API_BASE_URL` (must include `/api`).
 * - Injects the Sanctum bearer token on every request.
 * - Normalises errors into `ApiError` (status + Laravel validation bag).
 * - Persists the token in `localStorage` so a refresh keeps the session.
 *
 * No external HTTP dependency — uses the platform `fetch`.
 */

const RAW_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api'

/** Base URL without a trailing slash, e.g. `http://localhost:8000/api`. */
export const API_BASE_URL = RAW_BASE.replace(/\/+$/, '')

const TOKEN_STORAGE_KEY = 'admin_token'

let authToken: string | null = readStoredToken()

function readStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

/** Set (or clear, with `null`) the bearer token used for every request. */
export function setAuthToken(token: string | null): void {
  authToken = token
  try {
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token)
    else localStorage.removeItem(TOKEN_STORAGE_KEY)
  } catch {
    /* ignore storage errors (private mode, quota, …) */
  }
}

export function getAuthToken(): string | null {
  return authToken
}

/** Called whenever the API answers 401 — wired up by `useAuth`. */
let onUnauthorized: (() => void) | null = null
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler
}

/** A failed API request. `errors` is Laravel's 422 validation bag. */
export class ApiError extends Error {
  readonly status: number
  readonly errors: Record<string, string[]>
  readonly data: unknown

  constructor(
    status: number,
    message: string,
    errors: Record<string, string[]> = {},
    data: unknown = null,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
    this.data = data
  }

  /** Wrap any thrown value as an ApiError (network errors get status 0). */
  static from(error: unknown): ApiError {
    if (error instanceof ApiError) return error
    return new ApiError(0, error instanceof Error ? error.message : 'Unknown error')
  }

  /** First validation message for a field, if any. */
  first(field: string): string | undefined {
    return this.errors[field]?.[0]
  }

  get isValidation(): boolean {
    return this.status === 422
  }

  get isUnauthorized(): boolean {
    return this.status === 401
  }

  get isForbidden(): boolean {
    return this.status === 403
  }

  get isNotFound(): boolean {
    return this.status === 404
  }
}

export interface RequestOptions {
  /** Query-string params. `null`/`undefined` values are dropped. */
  params?: Record<string, unknown>
  signal?: AbortSignal
  headers?: Record<string, string>
}

function buildUrl(path: string, params?: RequestOptions['params']): string {
  const url = new URL(`${API_BASE_URL}${path}`, window.location.origin)

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue
      if (Array.isArray(value)) {
        for (const entry of value) url.searchParams.append(`${key}[]`, String(entry))
      } else if (typeof value === 'boolean') {
        url.searchParams.set(key, value ? '1' : '0')
      } else {
        url.searchParams.set(key, String(value))
      }
    }
  }

  return url.toString()
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...options.headers,
  }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`

  let response: Response
  try {
    response = await fetch(buildUrl(path, options.params), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: options.signal,
    })
  } catch (error) {
    throw new ApiError(0, 'Network error — could not reach the API.', {}, error)
  }

  if (response.status === 204) return undefined as T

  const text = await response.text()
  const payload = text ? safeJsonParse(text) : null

  if (!response.ok) {
    const record = (payload ?? {}) as { message?: string; errors?: Record<string, string[]> }
    const message = record.message || response.statusText || 'Request failed'
    const errors = record.errors ?? {}
    if (response.status === 401) onUnauthorized?.()
    throw new ApiError(response.status, message, errors, payload)
  }

  return payload as T
}

/** Verb helpers. All paths are relative to `API_BASE_URL` and start with `/`. */
export const api = {
  get: <T>(path: string, params?: RequestOptions['params'], options?: RequestOptions) =>
    request<T>('GET', path, undefined, { ...options, params }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('POST', path, body, options),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PUT', path, body, options),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PATCH', path, body, options),
  delete: <T = void>(path: string, options?: RequestOptions) =>
    request<T>('DELETE', path, undefined, options),
}

export interface UploadResult {
  url: string
  path: string
  folder: string
  name: string
}

/**
 * Upload an image to `public/assets/<folder>` via multipart/form-data.
 * Returns the stored file's absolute URL. Don't set Content-Type — the browser
 * adds the multipart boundary itself.
 */
export async function uploadImage(folder: string, file: File): Promise<UploadResult> {
  const body = new FormData()
  body.append('folder', folder)
  body.append('image', file)

  const headers: Record<string, string> = { Accept: 'application/json' }
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`

  let response: Response
  try {
    response = await fetch(buildUrl('/admin/uploads'), { method: 'POST', headers, body })
  } catch (error) {
    throw new ApiError(0, 'Network error — upload failed.', {}, error)
  }

  const text = await response.text()
  const payload = text ? safeJsonParse(text) : null

  if (!response.ok) {
    const record = (payload ?? {}) as { message?: string; errors?: Record<string, string[]> }
    if (response.status === 401) onUnauthorized?.()
    throw new ApiError(response.status, record.message || 'Upload failed', record.errors ?? {}, payload)
  }

  return payload as UploadResult
}

/** Delete a previously uploaded asset by its URL or `/assets/...` path. */
export function deleteImage(pathOrUrl: string): Promise<void> {
  return api.delete('/admin/uploads', { params: { path: pathOrUrl } })
}
