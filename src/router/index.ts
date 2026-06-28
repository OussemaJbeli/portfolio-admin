import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import { useAuth } from '@/composables/useAuth'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/login.vue'),
    meta: { guestOnly: true },
  },
  {
    // Authenticated CMS shell — every child renders inside the dashboard layout.
    path: '/',
    component: () => import('@/Layouts/DashbaordLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'dashboard', component: () => import('@/views/dashboard/index.vue') },

      // Home page
      { path: 'hero', name: 'hero', component: () => import('@/views/dashboard/hero/index.vue') },
      { path: 'about', name: 'about', component: () => import('@/views/dashboard/about/index.vue') },
      {
        path: 'about-bullets',
        name: 'about-bullets',
        component: () => import('@/views/dashboard/about-bullets/index.vue'),
      },
      { path: 'stats', name: 'stats', component: () => import('@/views/dashboard/stats/index.vue') },
      {
        path: 'skills',
        name: 'skills',
        component: () => import('@/views/dashboard/skills/index.vue'),
      },
      {
        path: 'technologies',
        name: 'technologies',
        component: () => import('@/views/dashboard/technologies/index.vue'),
      },

      // Projects
      {
        path: 'projects',
        name: 'projects',
        component: () => import('@/views/dashboard/projects/index.vue'),
      },
      {
        path: 'project-categories',
        name: 'project-categories',
        component: () => import('@/views/dashboard/project-categories/index.vue'),
      },

      // Blog
      { path: 'blogs', name: 'blogs', component: () => import('@/views/dashboard/blogs/index.vue') },
      {
        path: 'blog-categories',
        name: 'blog-categories',
        component: () => import('@/views/dashboard/blog-categories/index.vue'),
      },
      {
        path: 'author',
        name: 'author',
        component: () => import('@/views/dashboard/author/index.vue'),
      },

      // Inbox
      {
        path: 'messages',
        name: 'messages',
        component: () => import('@/views/dashboard/messages/index.vue'),
      },

      // Configuration
      {
        path: 'settings',
        name: 'settings',
        component: () => import('@/views/dashboard/settings/index.vue'),
      },
      {
        path: 'navigation',
        name: 'navigation',
        component: () => import('@/views/dashboard/navigation/index.vue'),
      },
      {
        path: 'social-links',
        name: 'social-links',
        component: () => import('@/views/dashboard/social-links/index.vue'),
      },
      {
        path: 'contact',
        name: 'contact',
        component: () => import('@/views/dashboard/contact/index.vue'),
      },
      {
        path: 'admin-users',
        name: 'admin-users',
        component: () => import('@/views/dashboard/admin-users/index.vue'),
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition ?? { top: 0 }
  },
})

// Auth guard: protect the dashboard, keep authed users out of /login.
router.beforeEach((to) => {
  const { isAuthenticated } = useAuth()

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guestOnly && isAuthenticated.value) {
    return { name: 'dashboard' }
  }

  return true
})

export default router
