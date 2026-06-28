/**
 * Admin "section config" singletons. Each exposes reactive `data` / `loading`
 * / `saving` / `error` plus `fetch()` (GET) and `save(payload)` (PUT) against
 * `/api/admin/<resource>`.
 */

import { defineSingletonResource } from '@/composables/useSingletonResource'
import type {
  About,
  AboutInput,
  Author,
  AuthorInput,
  BlogSection,
  BlogSectionInput,
  ContactSection,
  ContactSectionInput,
  Hero,
  HeroInput,
  ProjectSection,
  ProjectSectionInput,
  SiteSetting,
  SiteSettingInput,
  SkillSection,
  SkillSectionInput,
} from '@/api/types'

export const useSiteSettings = defineSingletonResource<SiteSetting, SiteSettingInput>('settings')
export const useHero = defineSingletonResource<Hero, HeroInput>('hero')
export const useAbout = defineSingletonResource<About, AboutInput>('about')
export const useSkillsSection = defineSingletonResource<SkillSection, SkillSectionInput>(
  'skills-section',
)
export const useProjectsSection = defineSingletonResource<ProjectSection, ProjectSectionInput>(
  'projects-section',
)
export const useBlogsSection = defineSingletonResource<BlogSection, BlogSectionInput>(
  'blogs-section',
)
export const useContactSection = defineSingletonResource<ContactSection, ContactSectionInput>(
  'contact-section',
)
export const useAuthor = defineSingletonResource<Author, AuthorInput>('author')
