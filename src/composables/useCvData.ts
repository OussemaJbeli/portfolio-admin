/**
 * Builds the normalized {@link CvData} used by every CV template.
 *
 * Sources (all public, read-only):
 *   • GET /landing  — identity, summary, contact, socials, skills, tech,
 *                     featured projects, stats.
 *   • GET /journey  — career "git graph" → work / education / freelance history.
 *
 * Everything is trilingual in the DB; a reactive `locale` picks the language and
 * `cv` recomputes, so the whole preview re-renders in EN / FR / AR instantly.
 */

import { computed, ref, type Ref } from 'vue'

import { api, ApiError } from '@/api/client'
import { publicApi } from '@/composables/resources/public'
import type { LandingPayload } from '@/api/types'
import type { CvData, CvEntry, CvLabels, CvLocale } from '@/views/dashboard/cv/types'

/* ── Localized section headings ──────────────────────────────────────────── */
const LABELS: Record<CvLocale, CvLabels> = {
  en: { profile: 'Profile', summary: 'Summary', experience: 'Experience', education: 'Education', skills: 'Skills', technologies: 'Technologies', projects: 'Projects', contact: 'Contact', present: 'Present', stats: 'Highlights', languages: 'Languages', interests: 'Interests' },
  fr: { profile: 'Profil', summary: 'Résumé', experience: 'Expérience', education: 'Formation', skills: 'Compétences', technologies: 'Technologies', projects: 'Projets', contact: 'Contact', present: 'Présent', stats: 'Points forts', languages: 'Langues', interests: 'Intérêts' },
  ar: { profile: 'نبذة', summary: 'الملخّص', experience: 'الخبرة', education: 'التعليم', skills: 'المهارات', technologies: 'التقنيات', projects: 'المشاريع', contact: 'التواصل', present: 'حتى الآن', stats: 'أبرز الإنجازات', languages: 'اللغات', interests: 'الاهتمامات' },
}

/* ── Localized employment-type labels + "native" word ────────────────────── */
const EMPLOYMENT: Record<CvLocale, Record<string, string>> = {
  en: { full_time: 'Full-time', part_time: 'Part-time', internship: 'Internship', freelance: 'Freelance', contract: 'Contract' },
  fr: { full_time: 'Temps plein', part_time: 'Temps partiel', internship: 'Stage', freelance: 'Freelance', contract: 'Contrat' },
  ar: { full_time: 'دوام كامل', part_time: 'دوام جزئي', internship: 'تدريب', freelance: 'عمل حر', contract: 'عقد' },
}
const NATIVE_WORD: Record<CvLocale, string> = { en: 'Native', fr: 'Natif', ar: 'اللغة الأم' }

/* ── Minimal journey response shape (not in api/types) ───────────────────── */
interface JourneyTech {
  name: string
}
interface JourneyMilestone {
  kind: string
  title_en: string
  title_fr: string | null
  title_ar: string | null
  is_highlight: boolean
  technologies?: JourneyTech[]
}
interface JourneyTrack {
  type: 'main' | 'education' | 'freelance' | 'work' | 'self'
  employment_type: string | null
  label_en: string
  label_fr: string | null
  label_ar: string | null
  org_en: string | null
  org_fr: string | null
  org_ar: string | null
  location_en: string | null
  location_fr: string | null
  location_ar: string | null
  started_at: string | null
  ended_at: string | null
  milestones?: JourneyMilestone[]
}
interface JourneyResponse {
  tracks: JourneyTrack[]
}

/* ── Locale helpers ──────────────────────────────────────────────────────── */

/** Pick `<base>_<locale>` with an English fallback; always a string. Accepts any
 *  trilingual model object (they don't share an index signature, so `unknown`). */
function tr(obj: unknown, base: string, locale: CvLocale): string {
  if (!obj || typeof obj !== 'object') return ''
  const rec = obj as Record<string, unknown>
  const val = rec[`${base}_${locale}`] ?? rec[`${base}_en`]
  return typeof val === 'string' ? val.trim() : ''
}

/** "2020-09-01" → "Sep 2020" (locale-aware); empty string when unset. */
function fmtDate(iso: string | null, locale: CvLocale): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const tag = locale === 'ar' ? 'ar' : locale === 'fr' ? 'fr-FR' : 'en-US'
  return d.toLocaleDateString(tag, { month: 'short', year: 'numeric' })
}

/** Strip conventional-commit prefixes ("feat:", "merge:", …) and HEAD markers,
 *  so journey commit messages read like real CV bullet points. */
function cleanBullet(text: string): string {
  return text
    .replace(/^\s*(feat|fix|init|chore|merge|tag|refactor|docs|test|style|perf|build|ci)\s*:\s*/i, '')
    .replace(/\s*→\s*main\s*$/i, '')
    .replace(/^HEAD\s*→\s*/i, '')
    .trim()
}

/** One journey track → a CV entry, with its commits as cleaned bullets. */
function trackToEntry(t: JourneyTrack, locale: CvLocale): CvEntry {
  const bullets = (t.milestones ?? [])
    .filter((m) => m.kind !== 'head')
    .map((m) => cleanBullet(tr(m, 'title', locale)))
    .filter(Boolean)
  return {
    title: tr(t, 'label', locale),
    org: tr(t, 'org', locale),
    employmentType: t.employment_type ? (EMPLOYMENT[locale][t.employment_type] ?? '') : '',
    location: tr(t, 'location', locale),
    start: fmtDate(t.started_at, locale),
    end: fmtDate(t.ended_at, locale),
    current: !t.ended_at,
    bullets,
  }
}

/** Turn a URL into a compact display label (host + path, no protocol). */
function linkLabel(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

/* ── Composable ──────────────────────────────────────────────────────────── */

export function useCvData(initialLocale: CvLocale = 'en') {
  const landing = ref(null) as Ref<LandingPayload | null>
  const journey = ref(null) as Ref<JourneyResponse | null>
  const locale = ref<CvLocale>(initialLocale)
  const loading = ref(false)
  const error = ref<ApiError | null>(null)
  const loaded = ref(false)

  async function fetch(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const [land, jour] = await Promise.all([
        publicApi.landing(),
        api.get<JourneyResponse>('/journey').catch(() => ({ tracks: [] }) as JourneyResponse),
      ])
      landing.value = land
      journey.value = jour
      loaded.value = true
    } catch (err) {
      error.value = ApiError.from(err)
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const cv = computed<CvData | null>(() => {
    const l = landing.value
    if (!l) return null
    const loc = locale.value
    const { hero, about, contact_section: contact, skill_categories, technologies, featured_projects, stats } = l

    // Grouped technologies (fall back to a single unnamed group with the flat list).
    const techGroups = (l.technology_groups ?? [])
      .map((g) => ({ name: tr(g, 'name', loc), items: (g.technologies ?? []).map((t) => t.name) }))
      .filter((g) => g.items.length)
    if (!techGroups.length && technologies?.length) {
      techGroups.push({ name: '', items: technologies.map((t) => t.name) })
    }

    const languages = (l.languages ?? []).map((lang) => ({
      name: tr(lang, 'name', loc),
      level: lang.level === 'native' ? NATIVE_WORD[loc] : lang.level.toUpperCase(),
      note: tr(lang, 'note', loc),
    }))
    const interests = (l.interests ?? []).map((i) => tr(i, 'name', loc)).filter(Boolean)

    const tracks = journey.value?.tracks ?? []
    const experience = tracks
      .filter((t) => t.type === 'work' || t.type === 'freelance')
      .map((t) => trackToEntry(t, loc))
      .filter((e) => e.title)
    const education = tracks
      .filter((t) => t.type === 'education')
      .map((t) => trackToEntry(t, loc))
      .filter((e) => e.title)

    const role =
      tr(hero, 'badge', loc).replace(/^[>_\s]+/, '') ||
      hero?.[`typewriter_${loc}`]?.[0] ||
      hero?.typewriter_en?.[0] ||
      ''

    return {
      name: hero?.full_name || about?.display_name || '',
      role,
      summary: tr(about, 'bio', loc),
      availability: tr(about, 'availability', loc),
      photoUrl: about?.photo_url || hero?.photo_url || '',
      contact: {
        email: about?.email || contact?.email || '',
        phone: contact?.phone || '',
        location: tr(about, 'location', loc) || tr(contact, 'location', loc),
        website: hero?.cta_primary_url?.startsWith('http') ? hero.cta_primary_url : '',
      },
      links: (l.social_links ?? []).map((s) => ({
        platform: s.platform,
        url: s.url,
        label: linkLabel(s.url),
      })),
      skills: (skill_categories ?? []).map((c) => ({
        name: tr(c, 'name', loc),
        percentage: Number(c.percentage) || 0,
      })),
      technologies: (technologies ?? []).map((t) => t.name).filter(Boolean),
      experience,
      education,
      projects: (featured_projects ?? []).map((p) => ({
        title: tr(p, 'title', loc),
        description: tr(p, 'description', loc) || tr(p, 'subtitle', loc),
        tech: (p.technologies ?? []).map((t) => t.name),
        url: p.live_demo_url || p.github_url || '',
      })),
      stats: (stats ?? []).map((s) => ({ value: s.value, label: tr(s, 'label', loc) })),
      languages,
      interests,
      techGroups,
      labels: LABELS[loc],
      rtl: loc === 'ar',
    }
  })

  return { cv, locale, loading, error, loaded, fetch }
}
