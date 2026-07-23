/**
 * Normalized, presentation-ready CV model. `useCvData` flattens the trilingual
 * backend payloads (landing + journey) into this single shape for a chosen
 * locale, so every template renders from the same clean data — no `_en/_fr/_ar`
 * juggling inside the templates.
 */

export type CvLocale = 'en' | 'fr' | 'ar'

export interface CvContact {
  email: string
  phone: string
  location: string
  website: string
}

export interface CvLink {
  platform: string
  url: string
  /** Bare handle/host for display (e.g. "github.com/oj"). */
  label: string
}

export interface CvSkill {
  name: string
  /** 0–100 proficiency. */
  percentage: number
}

/** A work / education / freelance entry (from a journey track + its commits). */
export interface CvEntry {
  title: string
  org: string
  /** Localized employment-type label ("Full-time", "Internship"…) or "". */
  employmentType: string
  location: string
  /** Pre-formatted for the active locale, e.g. "Sep 2020". */
  start: string
  end: string
  current: boolean
  bullets: string[]
}

export interface CvLanguage {
  name: string
  /** Display label, e.g. "Native" or "B1". */
  level: string
  note: string
}

/** A named skill bucket with its technologies. */
export interface CvTechGroup {
  name: string
  items: string[]
}

export interface CvProject {
  title: string
  description: string
  tech: string[]
  url: string
}

export interface CvStat {
  value: string
  label: string
}

/** Localized section headings, so every template is trilingual out of the box. */
export interface CvLabels {
  profile: string
  summary: string
  experience: string
  education: string
  skills: string
  technologies: string
  projects: string
  contact: string
  present: string
  stats: string
  languages: string
  interests: string
}

export interface CvData {
  name: string
  role: string
  summary: string
  availability: string
  photoUrl: string
  contact: CvContact
  links: CvLink[]
  skills: CvSkill[]
  technologies: string[]
  experience: CvEntry[]
  education: CvEntry[]
  projects: CvProject[]
  stats: CvStat[]
  languages: CvLanguage[]
  interests: string[]
  /** Technologies grouped into buckets; falls back to a single group. */
  techGroups: CvTechGroup[]
  labels: CvLabels
  /** RTL when the chosen locale is Arabic — templates set `dir`. */
  rtl: boolean
}

/** Every template receives exactly this. Accent is injected via the
 *  `--cv-accent` CSS variable on the print root, so it isn't a prop. */
export interface CvTemplateProps {
  data: CvData
}
