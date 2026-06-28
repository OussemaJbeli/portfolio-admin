/**
 * Admin CRUD collections (`apiResource` routes under `/api/admin`).
 *
 * Each composable exposes reactive `items` / `current` / `pagination` /
 * `loading` / `saving` / `error` plus `index` / `show` / `create` / `update` /
 * `remove`. Projects and blogs are paginated and bound by slug; the rest
 * return plain arrays bound by id.
 */

import { defineCrudResource } from '@/composables/useCrudResource'
import type {
  AboutBullet,
  AboutBulletInput,
  AdminUser,
  AdminUserCreateInput,
  AdminUserUpdateInput,
  Blog,
  BlogCategory,
  BlogCategoryInput,
  BlogInput,
  NavItem,
  NavItemInput,
  Project,
  ProjectCategory,
  ProjectCategoryInput,
  ProjectInput,
  SkillCategory,
  SkillCategoryInput,
  SocialLink,
  SocialLinkInput,
  Stat,
  StatInput,
  Technology,
  TechnologyInput,
} from '@/api/types'

export const useNavItems = defineCrudResource<NavItem, NavItemInput>({
  resource: 'nav-items',
})

export const useSocialLinks = defineCrudResource<SocialLink, SocialLinkInput>({
  resource: 'social-links',
})

export const useStats = defineCrudResource<Stat, StatInput>({
  resource: 'stats',
})

export const useAboutBullets = defineCrudResource<AboutBullet, AboutBulletInput>({
  resource: 'about-bullets',
})

export const useSkillCategories = defineCrudResource<SkillCategory, SkillCategoryInput>({
  resource: 'skill-categories',
})

export const useTechnologies = defineCrudResource<Technology, TechnologyInput>({
  resource: 'technologies',
})

export const useProjectCategories = defineCrudResource<ProjectCategory, ProjectCategoryInput>({
  resource: 'project-categories',
})

/** Paginated; bound by slug. `index` accepts `{ category, featured, per_page, page }`. */
export const useProjects = defineCrudResource<Project, ProjectInput>({
  resource: 'projects',
  paginated: true,
})

export const useBlogCategories = defineCrudResource<BlogCategory, BlogCategoryInput>({
  resource: 'blog-categories',
})

/** Paginated; bound by slug. `index` accepts `{ category, featured, per_page, page }`. */
export const useBlogs = defineCrudResource<Blog, BlogInput>({
  resource: 'blogs',
  paginated: true,
})

/** Superadmin-only. `create` requires a password; `update` keeps it optional. */
export const useAdminUsers = defineCrudResource<
  AdminUser,
  AdminUserCreateInput,
  AdminUserUpdateInput
>({
  resource: 'admin-users',
})
