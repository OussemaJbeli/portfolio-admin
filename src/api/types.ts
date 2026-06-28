/**
 * TypeScript shapes for the portfolio API.
 *
 * Field shapes mirror the Laravel migrations and controller validation rules.
 * Most content is trilingual: every `*_en` column is required, while `*_fr`
 * and `*_ar` are nullable. The helpers below keep that pattern terse.
 */

/* ── Shared helpers ──────────────────────────────────────────────────── */

export interface Timestamps {
  created_at: string | null
  updated_at: string | null
}

/** Trilingual columns where `_en` is non-null and `_fr` / `_ar` are nullable. */
export type T3<B extends string> = { [K in `${B}_en`]: string } & {
  [K in `${B}_fr`]: string | null
} & { [K in `${B}_ar`]: string | null }

/** Trilingual columns where all three languages are nullable. */
export type T3N<B extends string> = { [K in `${B}_en`]: string | null } & {
  [K in `${B}_fr`]: string | null
} & { [K in `${B}_ar`]: string | null }

/** Trilingual input where `_en` is required and `_fr` / `_ar` are optional. */
export type T3Input<B extends string> = { [K in `${B}_en`]: string } & {
  [K in `${B}_fr`]?: string | null
} & { [K in `${B}_ar`]?: string | null }

/** Trilingual input where all three languages are optional. */
export type T3InputN<B extends string> = { [K in `${B}_en`]?: string | null } & {
  [K in `${B}_fr`]?: string | null
} & { [K in `${B}_ar`]?: string | null }

/** Editable subset of a model (drops the server-managed columns). */
export type Writable<T> = Partial<Omit<T, 'id' | 'created_at' | 'updated_at'>>

/* ── Pagination ──────────────────────────────────────────────────────── */

export interface PaginationLink {
  url: string | null
  label: string
  active: boolean
}

/** Laravel's default length-aware paginator JSON. */
export interface Paginated<T> {
  current_page: number
  data: T[]
  first_page_url: string | null
  from: number | null
  last_page: number
  last_page_url: string | null
  links: PaginationLink[]
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number | null
  total: number
}

/** Compact slice of `Paginated` exposed by the CRUD composables. */
export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number | null
  to: number | null
}

/* ── Global / layout ─────────────────────────────────────────────────── */

export type SiteSetting = Timestamps & {
  id: number
  logo_text: string
  favicon_url: string | null
  cv_url: string | null
  theme_default: 'dark' | 'light'
  lang_default: 'ar' | 'fr' | 'en'
} & T3N<'meta_title'> &
  T3N<'meta_description'> &
  T3<'footer_copy'>

export type NavItem = Timestamps & {
  id: number
  route_key: string
  href: string
  icon_class: string | null
  sort_order: number
  is_active: boolean
} & T3<'label'>

export type SocialLink = Timestamps & {
  id: number
  platform: string
  url: string
  icon_class: string | null
  /** Comma list drawn from `hero,about,footer,blog_author`. */
  display_in: string | null
  sort_order: number
  is_active: boolean
}

/* ── Hero / stats ────────────────────────────────────────────────────── */

export type Hero = Timestamps & {
  id: number
  full_name: string
  photo_url: string | null
  typewriter_en: string[] | null
  typewriter_fr: string[] | null
  typewriter_ar: string[] | null
  cta_primary_url: string | null
  cta_secondary_url: string | null
  code_badge: string
} & T3N<'badge'> &
  T3N<'greeting'> &
  T3N<'tagline'> &
  T3<'cta_primary_label'> &
  T3<'cta_secondary_label'>

export type Stat = Timestamps & {
  id: number
  value: string
  icon_class: string | null
  sort_order: number
  is_active: boolean
} & T3<'label'>

/* ── About ───────────────────────────────────────────────────────────── */

export type About = Timestamps & {
  id: number
  photo_url: string | null
  display_name: string | null
  email: string | null
  cta_url: string | null
} & T3<'section_badge'> &
  T3<'heading'> &
  T3N<'bio'> &
  T3N<'location'> &
  T3<'availability'> &
  T3<'cta_label'>

export type AboutBullet = Timestamps & {
  id: number
  icon_class: string | null
  sort_order: number
  is_active: boolean
} & T3<'text'>

/* ── Skills ──────────────────────────────────────────────────────────── */

export type Technology = Timestamps & {
  id: number
  name: string
  icon_url: string | null
  icon_class: string | null
  color: string | null
  pivot?: { project_id: number; technology_id: number; sort_order: number }
}

export type SkillCategory = Timestamps & {
  id: number
  percentage: number
  sort_order: number
  is_active: boolean
} & T3<'name'>

export type SkillSection = Timestamps & { id: number } & T3<'section_badge'> & T3<'heading'>

/* ── Projects ────────────────────────────────────────────────────────── */

export type ProjectCategory = Timestamps & {
  id: number
  slug: string
  sort_order: number
  is_active: boolean
} & T3<'name'>

export type Project = Timestamps & {
  id: number
  slug: string
  category_id: number | null
  thumbnail_url: string | null
  is_featured: boolean
  is_active: boolean
  sort_order: number
  hero_image_url: string | null
  completed_date: string | null
  live_demo_url: string | null
  github_url: string | null
  // Relations — present depending on the endpoint (show embeds all of them).
  category?: ProjectCategory | null
  gallery?: ProjectGallery[]
  features?: ProjectFeature[]
  roles?: ProjectRole[]
  technologies?: Technology[]
} & T3<'title'> &
  T3N<'subtitle'> &
  T3N<'description'> &
  T3N<'about'> &
  T3N<'client'> &
  T3N<'duration'>

export type ProjectGallery = Timestamps & {
  id: number
  project_id: number
  image_url: string
  sort_order: number
} & T3N<'alt'>

export type ProjectFeature = Timestamps & {
  id: number
  project_id: number
  sort_order: number
} & T3<'text'>

export type ProjectRole = Timestamps & {
  id: number
  project_id: number
  icon_class: string | null
  sort_order: number
} & T3<'title'> &
  T3N<'body'>

export type ProjectSection = Timestamps & { id: number } & T3<'section_badge'> &
  T3<'heading_part1'> &
  T3N<'subheading'> &
  T3<'listing_title_part1'> &
  T3<'listing_title_part2'> &
  T3N<'listing_subtitle'> &
  T3<'cta_label'>

/* ── Blogs ───────────────────────────────────────────────────────────── */

export type BlogCategory = Timestamps & {
  id: number
  slug: string
  sort_order: number
  is_active: boolean
} & T3<'name'>

export type Blog = Timestamps & {
  id: number
  slug: string
  cover_image_url: string | null
  read_time_minutes: number | null
  views: number
  is_featured: boolean
  is_active: boolean
  published_at: string | null
  // Relations — embedded by `show`.
  categories?: BlogCategory[]
  toc?: BlogToc[]
  relatedArticles?: Blog[]
} & T3<'title'> &
  T3N<'excerpt'> &
  T3N<'body'>

export type BlogToc = Timestamps & {
  id: number
  blog_id: number
  anchor: string
  sort_order: number
} & T3<'label'>

export type BlogSection = Timestamps & { id: number } & T3<'section_badge'> &
  T3<'heading_part1'> &
  T3<'listing_badge'> &
  T3<'listing_title_part1'> &
  T3<'listing_title_part2'> &
  T3N<'listing_subtitle'> &
  T3<'cta_label'>

/* ── Author / contact ────────────────────────────────────────────────── */

export type Author = Timestamps & {
  id: number
  full_name: string
  photo_url: string | null
  profile_url: string | null
} & T3N<'role'> &
  T3N<'bio'>

export type ContactSection = Timestamps & {
  id: number
  email: string | null
  phone: string | null
} & T3<'section_badge'> &
  T3<'heading'> &
  T3N<'subtext'> &
  T3N<'location'> &
  T3<'availability'> &
  T3<'label_name'> &
  T3<'label_email'> &
  T3<'label_subject'> &
  T3<'label_message'> &
  T3<'label_send'> &
  T3<'cta_banner_heading'> &
  T3<'cta_banner_sub'> &
  T3<'cta_banner_btn'>

/** No `updated_at` — the table only tracks `created_at`. */
export interface ContactMessage {
  id: number
  sender_name: string
  sender_email: string
  subject: string | null
  message: string
  is_read: boolean
  created_at: string | null
}

/* ── Admin accounts / auth ───────────────────────────────────────────── */

export type AdminUser = Timestamps & {
  id: number
  name: string
  email: string
  role: 'superadmin' | 'editor'
  last_login_at: string | null
}

export interface LoginPayload {
  email: string
  password: string
  device_name?: string
}

export interface LoginResponse {
  token: string
  token_type: string
  user: AdminUser
}

/* ── Write payloads (create / update) ────────────────────────────────── */

export type NavItemInput = {
  route_key: string
  href: string
  icon_class?: string | null
  sort_order?: number
  is_active?: boolean
} & T3Input<'label'>

export type SocialLinkInput = {
  platform: string
  url: string
  icon_class?: string | null
  display_in?: string | null
  sort_order?: number
  is_active?: boolean
}

export type StatInput = {
  value: string
  icon_class?: string | null
  sort_order?: number
  is_active?: boolean
} & T3Input<'label'>

export type AboutBulletInput = {
  icon_class?: string | null
  sort_order?: number
  is_active?: boolean
} & T3Input<'text'>

export type SkillCategoryInput = {
  percentage: number
  sort_order?: number
  is_active?: boolean
} & T3Input<'name'>

export type TechnologyInput = {
  name: string
  icon_url?: string | null
  icon_class?: string | null
  color?: string | null
}

export type ProjectCategoryInput = {
  slug: string
  sort_order?: number
  is_active?: boolean
} & T3Input<'name'>

export type ProjectInput = {
  slug: string
  category_id?: number | null
  thumbnail_url?: string | null
  is_featured?: boolean
  is_active?: boolean
  sort_order?: number
  hero_image_url?: string | null
  completed_date?: string | null
  live_demo_url?: string | null
  github_url?: string | null
} & T3Input<'title'> &
  T3InputN<'subtitle'> &
  T3InputN<'description'> &
  T3InputN<'about'> &
  T3InputN<'client'> &
  T3InputN<'duration'>

export type BlogCategoryInput = {
  slug: string
  sort_order?: number
  is_active?: boolean
} & T3Input<'name'>

export type BlogInput = {
  slug: string
  cover_image_url?: string | null
  read_time_minutes?: number | null
  is_featured?: boolean
  is_active?: boolean
  published_at?: string | null
} & T3Input<'title'> &
  T3InputN<'excerpt'> &
  T3InputN<'body'>

export type ProjectGalleryInput = {
  image_url: string
  sort_order?: number
} & T3InputN<'alt'>

export type ProjectFeatureInput = {
  sort_order?: number
} & T3Input<'text'>

export type ProjectRoleInput = {
  icon_class?: string | null
  sort_order?: number
} & T3Input<'title'> &
  T3InputN<'body'>

export type BlogTocInput = {
  anchor: string
  sort_order?: number
} & T3Input<'label'>

export interface AdminUserCreateInput {
  name: string
  email: string
  password: string
  role: 'superadmin' | 'editor'
}

export type AdminUserUpdateInput = Partial<AdminUserCreateInput>

export interface ContactMessageInput {
  sender_name: string
  sender_email: string
  subject?: string | null
  message: string
}

/* ── Pivot payloads ──────────────────────────────────────────────────── */

export interface AttachTechnologyInput {
  technology_id: number
  sort_order?: number
}

export interface SyncTechnologiesInput {
  technology_ids: number[]
}

export interface AttachRelatedInput {
  related_id: number
  sort_order?: number
}

export interface AttachBlogCategoryInput {
  category_id: number
}

export interface SyncBlogCategoriesInput {
  category_ids: number[]
}

/* ── Singleton update payloads ───────────────────────────────────────── */

export type SiteSettingInput = Writable<SiteSetting>
export type HeroInput = Writable<Hero>
export type AboutInput = Writable<About>
export type SkillSectionInput = Writable<SkillSection>
export type ProjectSectionInput = Writable<ProjectSection>
export type BlogSectionInput = Writable<BlogSection>
export type ContactSectionInput = Writable<ContactSection>
export type AuthorInput = Writable<Author>

/* ── Landing (one-shot public payload) ───────────────────────────────── */

export interface LandingPayload {
  settings: SiteSetting | null
  navigation: NavItem[]
  social_links: SocialLink[]
  hero: Hero | null
  stats: Stat[]
  about: About | null
  about_bullets: AboutBullet[]
  skills_section: SkillSection | null
  skill_categories: SkillCategory[]
  technologies: Technology[]
  projects_section: ProjectSection | null
  featured_projects: Project[]
  blogs_section: BlogSection | null
  recent_blogs: Blog[]
  contact_section: ContactSection | null
  author: Author | null
}
