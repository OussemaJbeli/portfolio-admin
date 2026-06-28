import { createI18n } from 'vue-i18n'

import en from './locales/en'
import fr from './locales/fr'
import es from './locales/es'

/** The message schema every locale must satisfy (inferred from English). */
export type MessageSchema = typeof en

/** App locale codes. */
export type LocaleCode = 'en' | 'fr' | 'es'

/** Locales offered in the language switcher. */
export const SUPPORTED_LOCALES: { code: LocaleCode; name: string; flag: string }[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
]

export const DEFAULT_LOCALE: LocaleCode = 'en'
const STORAGE_KEY = 'locale'

function isSupported(code: string): code is LocaleCode {
  return SUPPORTED_LOCALES.some((l) => l.code === code)
}

/** Resolve the initial locale: stored choice → browser language → default. */
function detectLocale(): LocaleCode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && isSupported(stored)) return stored
  } catch {
    /* localStorage may be unavailable (e.g. SSR / private mode) */
  }

  const browser = (navigator.language || DEFAULT_LOCALE).split('-')[0]
  return isSupported(browser) ? browser : DEFAULT_LOCALE
}

export const i18n = createI18n<[MessageSchema], LocaleCode, false>({
  legacy: false,
  globalInjection: true,
  locale: detectLocale(),
  fallbackLocale: DEFAULT_LOCALE,
  messages: { en, fr, es },
})

/** Persist and apply a locale change everywhere it matters. */
export function setLocale(code: LocaleCode): void {
  i18n.global.locale.value = code
  try {
    localStorage.setItem(STORAGE_KEY, code)
  } catch {
    /* ignore persistence errors */
  }
  document.documentElement.setAttribute('lang', code)
}

// Keep <html lang> in sync with the initial locale.
document.documentElement.setAttribute('lang', i18n.global.locale.value)
