/**
 * Shared "which language am I editing" state for a form. One switcher controls
 * every multilingual field in the form at once, so you pick a language and fill
 * all fields, then switch.
 *
 * A page calls `provideFormLocale()` once; each `LangField` calls
 * `useFormLocale()` to read/write the active language.
 */
import { inject, provide, ref, type InjectionKey, type Ref } from 'vue'

export type FormLang = 'en' | 'fr' | 'ar'

export const FORM_LANGS: { code: FormLang; label: string; rtl: boolean }[] = [
  { code: 'en', label: 'EN', rtl: false },
  { code: 'fr', label: 'FR', rtl: false },
  { code: 'ar', label: 'AR', rtl: true },
]

const FORM_LOCALE_KEY: InjectionKey<Ref<FormLang>> = Symbol('form-locale')

/** Provide the editing language to all descendant fields. */
export function provideFormLocale(initial: FormLang = 'en'): Ref<FormLang> {
  const lang = ref<FormLang>(initial)
  provide(FORM_LOCALE_KEY, lang)
  return lang
}

/** Read the shared editing language (falls back to a local 'en' if unprovided). */
export function useFormLocale(): Ref<FormLang> {
  return inject(FORM_LOCALE_KEY, ref<FormLang>('en'))
}
