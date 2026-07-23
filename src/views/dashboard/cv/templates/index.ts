/**
 * CV template registry — the single source of truth for the picker in the CV
 * view. Each entry pairs a display card with its A4 component.
 *
 * Accents are drawn from the app's own molten/gold theme palette (THEME.md), so
 * every generated CV stays on-brand. The chosen accent is injected as the
 * `--cv-accent` CSS variable on the print root; templates read it via
 * `var(--cv-accent)`.
 */
import type { Component } from 'vue'

import AuroraSidebar from './AuroraSidebar.vue'
import TerminalDev from './TerminalDev.vue'
import TimelineGit from './TimelineGit.vue'
import MinimalElegant from './MinimalElegant.vue'
import BoldGradient from './BoldGradient.vue'
import CompactGrid from './CompactGrid.vue'

export interface CvTemplateMeta {
  id: string
  name: string
  tagline: string
  /** Renders on a dark surface — the picker card previews it darker. */
  dark?: boolean
  component: Component
}

export const cvTemplates: CvTemplateMeta[] = [
  { id: 'aurora', name: 'Aurora', tagline: 'Gradient sidebar · modern', component: AuroraSidebar },
  { id: 'terminal', name: 'Terminal', tagline: 'Dark · monospace · dev', dark: true, component: TerminalDev },
  { id: 'timeline', name: 'Timeline', tagline: 'Git-graph spine', component: TimelineGit },
  { id: 'minimal', name: 'Minimal', tagline: 'Elegant · airy · centered', component: MinimalElegant },
  { id: 'bold', name: 'Bold', tagline: 'Full-bleed header band', component: BoldGradient },
  { id: 'compact', name: 'Compact', tagline: 'Dense card grid', component: CompactGrid },
]

export interface AccentOption {
  id: string
  label: string
  value: string
}

/** Theme palette (molten / gold family + a deep navy from the dark theme). */
export const cvAccents: AccentOption[] = [
  { id: 'gold', label: 'Gold', value: '#f5a623' },
  { id: 'amber', label: 'Amber', value: '#ff8c1a' },
  { id: 'ember', label: 'Ember', value: '#ff5e00' },
  { id: 'crimson', label: 'Crimson', value: '#ff3d00' },
  { id: 'navy', label: 'Navy', value: '#2b3a72' },
]
