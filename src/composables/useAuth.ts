/**
 * CMS authentication backed by Sanctum bearer tokens.
 *
 * State is module-level (a singleton, like `useTheme`) so every component sees
 * the same session. The token is persisted in `localStorage` by the API client.
 */

import { computed, ref } from 'vue'

import {
  api,
  ApiError,
  getAuthToken,
  setAuthToken,
  setUnauthorizedHandler,
} from '@/api/client'
import type { AdminUser, LoginPayload, LoginResponse } from '@/api/types'

const user = ref<AdminUser | null>(null)
const token = ref<string | null>(getAuthToken())
const loading = ref(false)
const error = ref<ApiError | null>(null)

function clearSession(): void {
  user.value = null
  token.value = null
  setAuthToken(null)
}

// Auto-clear the session if any request comes back 401 (expired/revoked token).
setUnauthorizedHandler(clearSession)

export function useAuth() {
  const isAuthenticated = computed(() => token.value !== null)
  const isSuperadmin = computed(() => user.value?.role === 'superadmin')

  /** POST /auth/login — exchange credentials for a token. */
  async function login(payload: LoginPayload): Promise<AdminUser> {
    loading.value = true
    error.value = null
    try {
      const res = await api.post<LoginResponse>('/auth/login', {
        device_name: 'cms',
        ...payload,
      })
      setAuthToken(res.token)
      token.value = res.token
      user.value = res.user
      return res.user
    } catch (err) {
      error.value = ApiError.from(err)
      throw error.value
    } finally {
      loading.value = false
    }
  }

  /** GET /auth/me — load the currently authenticated admin. */
  async function fetchMe(): Promise<AdminUser> {
    loading.value = true
    error.value = null
    try {
      const me = await api.get<AdminUser>('/auth/me')
      user.value = me
      return me
    } catch (err) {
      error.value = ApiError.from(err)
      throw error.value
    } finally {
      loading.value = false
    }
  }

  /** POST /auth/logout — revoke the current token (clears state regardless). */
  async function logout(): Promise<void> {
    try {
      if (token.value) await api.post('/auth/logout')
    } catch {
      /* token may already be invalid — clear locally anyway */
    } finally {
      clearSession()
    }
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isSuperadmin,
    login,
    logout,
    fetchMe,
  }
}
