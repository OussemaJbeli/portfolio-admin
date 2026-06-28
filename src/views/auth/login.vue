<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const route = useRoute()

const { login, loading, error } = useAuth()

const email = ref('')
const password = ref('')
const showPassword = ref(false)

/** Per-field server validation message (Laravel 422). */
const emailError = computed(() => error.value?.first('email'))
const passwordError = computed(() => error.value?.first('password'))

/** Non-validation failures (network / 500) shown as a banner. */
const generalError = computed(() => {
  const e = error.value
  if (!e || e.isValidation) return null
  return e.message
})

const canSubmit = computed(
  () => email.value.trim() !== '' && password.value !== '' && !loading.value,
)

async function onSubmit() {
  if (!canSubmit.value) return
  try {
    await login({ email: email.value.trim(), password: password.value })
    const redirect = route.query.redirect
    await router.push(typeof redirect === 'string' ? redirect : { name: 'dashboard' })
  } catch {
    /* `error` from useAuth() is reactive — the template renders it. */
  }
}
</script>

<template>
  <div
    class="relative grid min-h-screen place-items-center overflow-hidden bg-page px-4 py-10 text-primary"
  >
    <!-- Decorative blobs + dotted grid (THEME.md §4) -->
    <div class="bg-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
    <div
      class="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-blob opacity-20 blur-3xl"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-blob opacity-20 blur-3xl"
      aria-hidden="true"
    />

    <!-- Login card -->
    <div class="relative w-full max-w-md">
      <!-- Floating code badge -->
      <div
        class="absolute -right-3 -top-3 z-10 rounded-xl border border-line-accent bg-card px-2.5 py-1 font-display text-sm font-extrabold text-brand glow-brand"
        aria-hidden="true"
      >
        &lt;/&gt;
      </div>

      <div class="rounded-2xl border border-line bg-surface p-8 shadow-sm sm:p-10">
        <!-- Brand mark -->
        <div class="mb-8 flex items-center gap-3">
          <div
            class="grid h-11 w-11 place-items-center rounded-xl bg-brand font-display text-lg font-extrabold text-[#1a1f3c] glow-brand"
          >
            OJ.
          </div>
          <div class="leading-tight">
            <p class="font-display text-sm font-bold text-primary">Portfolio CMS</p>
            <p class="text-xs text-secondary">Back-office</p>
          </div>
        </div>

        <!-- Section badge + heading -->
        <p class="mb-2 font-mono text-xs tracking-widest text-accent">&gt;_ ADMIN ACCESS</p>
        <h1 class="font-display text-3xl font-extrabold tracking-tight text-primary">
          Sign <span class="text-brand">in</span><span class="text-brand caret-blink">_</span>
        </h1>
        <p class="mt-2 text-sm text-secondary">
          Authenticate to manage your portfolio content.
        </p>

        <!-- General error banner -->
        <div
          v-if="generalError"
          class="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-500"
          role="alert"
        >
          {{ generalError }}
        </div>

        <form class="mt-6 space-y-5" novalidate @submit.prevent="onSubmit">
          <!-- Email -->
          <div>
            <label for="email" class="mb-1.5 block text-sm font-medium text-primary">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              name="email"
              autocomplete="username"
              required
              placeholder="you@example.com"
              :aria-invalid="!!emailError"
              class="w-full rounded-xl border border-line bg-card px-4 py-2.5 text-primary placeholder:text-secondary/60 focus:border-line-accent focus:outline-none"
            />
            <p v-if="emailError" class="mt-1.5 text-xs text-red-500">{{ emailError }}</p>
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="mb-1.5 block text-sm font-medium text-primary">
              Password
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                name="password"
                autocomplete="current-password"
                required
                placeholder="••••••••"
                :aria-invalid="!!passwordError"
                class="w-full rounded-xl border border-line bg-card px-4 py-2.5 pr-12 text-primary placeholder:text-secondary/60 focus:border-line-accent focus:outline-none"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-xl text-secondary hover:text-primary"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                @click="showPassword = !showPassword"
              >
                <span aria-hidden="true">{{ showPassword ? '🙈' : '👁' }}</span>
              </button>
            </div>
            <p v-if="passwordError" class="mt-1.5 text-xs text-red-500">{{ passwordError }}</p>
          </div>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="!canSubmit"
            class="flex w-full items-center justify-center gap-2 rounded-full bg-brand px-5 py-3 font-semibold text-[#1a1f3c] glow-brand hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span
              v-if="loading"
              class="h-4 w-4 animate-spin rounded-full border-2 border-[#1a1f3c]/30 border-t-[#1a1f3c]"
              aria-hidden="true"
            />
            <span>{{ loading ? 'Signing in…' : 'Sign in' }}</span>
            <span v-if="!loading" aria-hidden="true">→</span>
          </button>
        </form>

        <!-- Terminal footer note -->
        <p class="mt-8 text-center font-mono text-xs text-secondary">
          &gt;_ Protected area · authorized personnel only
        </p>
      </div>
    </div>
  </div>
</template>
