/**
 * Public (read-only) frontend surface — no auth required. Covers the one-shot
 * landing payload, every public GET, and the visitor contact-form submission.
 *
 * `publicApi` is a plain service object (stateless promises). `useLanding` and
 * `useContactForm` wrap the two calls a CMS preview / embedded form may want
 * with reactive state.
 */

import { ref, type Ref } from 'vue'

import { api, ApiError } from '@/api/client'
import type {
  About,
  AboutBullet,
  Author,
  Blog,
  BlogCategory,
  BlogSection,
  ContactMessageInput,
  ContactSection,
  Hero,
  LandingPayload,
  NavItem,
  Paginated,
  Project,
  ProjectCategory,
  ProjectSection,
  SiteSetting,
  SkillCategory,
  SkillSection,
  SocialLink,
  Stat,
  Technology,
} from '@/api/types'

/** Stateless calls to every public `/api/*` read endpoint. */
export const publicApi = {
  landing: () => api.get<LandingPayload>('/landing'),

  // Global / layout
  settings: () => api.get<SiteSetting>('/settings'),
  navigation: () => api.get<NavItem[]>('/navigation'),
  socialLinks: () => api.get<SocialLink[]>('/social-links'),

  // Home sections
  hero: () => api.get<Hero>('/hero'),
  stats: () => api.get<Stat[]>('/stats'),
  about: () => api.get<About>('/about'),
  aboutBullets: () => api.get<AboutBullet[]>('/about-bullets'),
  skillsSection: () => api.get<SkillSection>('/skills-section'),
  skillCategories: () => api.get<SkillCategory[]>('/skill-categories'),
  technologies: () => api.get<Technology[]>('/technologies'),

  // Projects
  projectsSection: () => api.get<ProjectSection>('/projects-section'),
  projectCategories: () => api.get<ProjectCategory[]>('/project-categories'),
  projects: (params?: { category?: string; featured?: boolean; per_page?: number; page?: number }) =>
    api.get<Paginated<Project>>('/projects', params),
  project: (slug: string) => api.get<Project>(`/projects/${slug}`),

  // Blogs
  blogsSection: () => api.get<BlogSection>('/blogs-section'),
  blogCategories: () => api.get<BlogCategory[]>('/blog-categories'),
  blogs: (params?: { category?: string; featured?: boolean; per_page?: number; page?: number }) =>
    api.get<Paginated<Blog>>('/blogs', params),
  blog: (slug: string) => api.get<Blog>(`/blogs/${slug}`),

  // Author + contact
  author: () => api.get<Author>('/author'),
  contactSection: () => api.get<ContactSection>('/contact-section'),

  /** POST /contact-messages — visitor contact form (throttled server-side). */
  submitContactMessage: (payload: ContactMessageInput) =>
    api.post<{ message: string }>('/contact-messages', payload),
}

/** GET /landing — the whole homepage payload in one request. */
export function useLanding() {
  const data = ref(null) as Ref<LandingPayload | null>
  const loading = ref(false)
  const error = ref<ApiError | null>(null)

  async function fetch(): Promise<LandingPayload> {
    loading.value = true
    error.value = null
    try {
      const payload = await publicApi.landing()
      data.value = payload
      return payload
    } catch (err) {
      error.value = ApiError.from(err)
      throw error.value
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, fetch }
}

/** POST /contact-messages — visitor contact form with reactive state. */
export function useContactForm() {
  const saving = ref(false)
  const error = ref<ApiError | null>(null)
  const success = ref<string | null>(null)

  async function submit(payload: ContactMessageInput): Promise<string> {
    saving.value = true
    error.value = null
    success.value = null
    try {
      const res = await publicApi.submitContactMessage(payload)
      success.value = res.message
      return res.message
    } catch (err) {
      error.value = ApiError.from(err)
      throw error.value
    } finally {
      saving.value = false
    }
  }

  return { saving, error, success, submit }
}
