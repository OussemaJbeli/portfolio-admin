import { computed, readonly, ref } from 'vue'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'theme'

/** Read the current theme from the DOM (set pre-paint in index.html). */
function currentDomTheme(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'dark'
    ? 'dark'
    : 'light'
}

// Module-level singleton state — shared across every component that imports it.
const theme = ref<Theme>(currentDomTheme())

function apply(next: Theme): void {
  theme.value = next
  document.documentElement.setAttribute('data-theme', next)
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch {
    /* ignore persistence errors */
  }
}

const isDark = computed(() => theme.value === 'dark')

export function useTheme() {
  function setTheme(next: Theme): void {
    apply(next)
  }

  function toggleTheme(): void {
    apply(theme.value === 'dark' ? 'light' : 'dark')
  }

  return {
    theme: readonly(theme),
    isDark,
    setTheme,
    toggleTheme,
  }
}
