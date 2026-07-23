/**
 * CMS navigation — single source of truth for the sidebar groups, the routes
 * they link to, and the icons they use. The router and header both read this.
 */
import type { IconName } from '@/components/icons'

export interface NavLink {
  label: string
  /** Route path (matches the router definition). */
  to: string
  icon: IconName
}

export interface NavGroup {
  /** Small uppercase heading shown above the group. */
  label: string
  links: NavLink[]
}

export const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    links: [{ label: 'Dashboard', to: '/', icon: 'dashboard' }],
  },
  {
    label: 'Tools',
    links: [{ label: 'CV Generator', to: '/cv', icon: 'cv' }],
  },
  {
    label: 'Home Page',
    links: [
      { label: 'Hero', to: '/hero', icon: 'hero' },
      { label: 'About', to: '/about', icon: 'about' },
      { label: 'About Bullets', to: '/about-bullets', icon: 'bullets' },
      { label: 'Stats', to: '/stats', icon: 'stats' },
      { label: 'Skills', to: '/skills', icon: 'skills' },
      { label: 'Technologies', to: '/technologies', icon: 'technologies' },
      { label: 'Journey', to: '/journey', icon: 'journey' },
    ],
  },
  {
    label: 'Skills & Profile',
    links: [
      { label: 'Skill Groups', to: '/technology-groups', icon: 'layers' },
      { label: 'Languages', to: '/languages', icon: 'language' },
      { label: 'Interests', to: '/interests', icon: 'heart' },
    ],
  },
  {
    label: 'Projects',
    links: [
      { label: 'Projects', to: '/projects', icon: 'projects' },
      { label: 'Categories', to: '/project-categories', icon: 'categories' },
    ],
  },
  {
    label: 'Blog',
    links: [
      { label: 'Posts', to: '/blogs', icon: 'blogs' },
      { label: 'Categories', to: '/blog-categories', icon: 'categories' },
      { label: 'Author', to: '/author', icon: 'author' },
    ],
  },
  {
    label: 'Inbox',
    links: [{ label: 'Messages', to: '/messages', icon: 'messages' }],
  },
  {
    label: 'Configuration',
    links: [
      { label: 'Site Settings', to: '/settings', icon: 'settings' },
      { label: 'Navigation', to: '/navigation', icon: 'navigation' },
      { label: 'Social Links', to: '/social-links', icon: 'social' },
      { label: 'Contact Info', to: '/contact', icon: 'contact' },
      { label: 'Admin Users', to: '/admin-users', icon: 'users' },
    ],
  },
]

/** Flat list of all links (handy for breadcrumbs / title lookup). */
export const navLinks: NavLink[] = navGroups.flatMap((group) => group.links)

/** Resolve the title for a path (longest matching prefix wins). */
export function titleForPath(path: string): string {
  if (path === '/') return 'Dashboard'
  const match = navLinks
    .filter((link) => link.to !== '/' && path.startsWith(link.to))
    .sort((a, b) => b.to.length - a.to.length)[0]
  return match?.label ?? 'Dashboard'
}
