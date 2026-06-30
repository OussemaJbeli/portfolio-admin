/**
 * Small form helpers shared by the dashboard section pages.
 */

/**
 * Copy values from an API record into a reactive form, but only for keys the
 * form already declares (ignores id / timestamps / relations). Null/undefined
 * source values keep the form's default.
 */
export function assignKnown<T extends object>(target: T, source: object): void {
  const src = source as Record<string, unknown>
  for (const key of Object.keys(target)) {
    const value = src[key]
    if (value !== undefined && value !== null) {
      ;(target as Record<string, unknown>)[key] = value
    }
  }
}

/**
 * Build an API payload from a form: empty strings become `null` so the backend
 * treats them as "no value" (passes `nullable`, fails `required`, satisfies
 * `url` rules). Arrays and other values pass through untouched.
 */
export function toPayload<T extends Record<string, unknown>>(form: T): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(form)) {
    out[key] = value === '' ? null : value
  }
  return out
}

/** Slugify a string for `alpha_dash` slug columns (lowercase, dashed). */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
