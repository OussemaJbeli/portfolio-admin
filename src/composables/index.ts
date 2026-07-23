/**
 * Barrel for the API composables — `import { useProjects, useAuth } from '@/composables'`.
 */

// Core client + error type
export {
  api,
  ApiError,
  API_BASE_URL,
  getAuthToken,
  setAuthToken,
  setUnauthorizedHandler,
} from '@/api/client'
export type { RequestOptions } from '@/api/client'

// All API shapes
export type * from '@/api/types'

// Factories (for building further resources)
export { defineCrudResource } from '@/composables/useCrudResource'
export type { CrudResourceConfig, ResourceId } from '@/composables/useCrudResource'
export { defineSingletonResource } from '@/composables/useSingletonResource'
export { defineNestedResource } from '@/composables/useNestedResource'
export type { NestedResourceConfig } from '@/composables/useNestedResource'

// Auth
export { useAuth } from '@/composables/useAuth'

// Theme (existing)
export { useTheme } from '@/composables/useTheme'
export type { Theme } from '@/composables/useTheme'

// Admin CRUD collections
export {
  useNavItems,
  useSocialLinks,
  useStats,
  useAboutBullets,
  useSkillCategories,
  useTechnologies,
  useTechnologyGroups,
  useLanguages,
  useInterests,
  useProjectCategories,
  useProjects,
  useBlogCategories,
  useBlogs,
  useAdminUsers,
} from '@/composables/resources/collections'

// Admin section singletons
export {
  useSiteSettings,
  useHero,
  useAbout,
  useSkillsSection,
  useProjectsSection,
  useBlogsSection,
  useContactSection,
  useAuthor,
} from '@/composables/resources/singletons'

// Project children + technology pivot
export {
  useProjectGallery,
  useProjectFeatures,
  useProjectRoles,
  useProjectTechnologies,
} from '@/composables/resources/projectChildren'

// Blog children + pivots
export {
  useBlogToc,
  useBlogRelated,
  useBlogCategoriesMap,
} from '@/composables/resources/blogChildren'

// Journey (git-graph parcours)
export {
  useJourneyTracks,
  useJourneyMilestones,
  useJourneySection,
  syncMilestoneTechnologies,
} from '@/composables/resources/journey'

// Contact inbox (admin)
export { useContactMessages } from '@/composables/resources/contactMessages'

// Public / frontend surface
export { publicApi, useLanding, useContactForm } from '@/composables/resources/public'
