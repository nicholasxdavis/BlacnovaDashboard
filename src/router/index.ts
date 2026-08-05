import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { useClientStore } from '@/stores/client'
import type { ModuleKey } from '@/types'

NProgress.configure({ showSpinner: false })

const Layout = () => import('@/layout/AppLayout.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { public: true },
  },
  {
    path: '/',
    component: Layout,
    redirect: '/overview',
    children: [
      {
        path: 'overview',
        name: 'Overview',
        component: () => import('@/views/OverviewView.vue'),
        meta: { module: 'overview' as ModuleKey, title: 'Overview' },
      },
      {
        path: 'content',
        name: 'Content',
        component: () => import('@/views/ContentView.vue'),
        meta: { module: 'content' as ModuleKey, title: 'Content' },
      },
      {
        path: 'media',
        name: 'Media',
        component: () => import('@/views/MediaView.vue'),
        meta: { module: 'media' as ModuleKey, title: 'Media' },
      },
      {
        path: 'pages',
        name: 'Pages',
        component: () => import('@/views/PagesView.vue'),
        meta: { module: 'pages' as ModuleKey, title: 'Pages' },
      },
      {
        path: 'maintenance',
        name: 'Maintenance',
        component: () => import('@/views/MaintenanceView.vue'),
        meta: { module: 'maintenance' as ModuleKey, title: 'Maintenance' },
      },
      {
        path: 'submissions',
        name: 'Submissions',
        component: () => import('@/views/SubmissionsView.vue'),
        meta: { module: 'submissions' as ModuleKey, title: 'Submissions' },
      },
      {
        path: 'analytics',
        name: 'Analytics',
        component: () => import('@/views/AnalyticsView.vue'),
        meta: { module: 'analytics' as ModuleKey, title: 'Analytics' },
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/SettingsView.vue'),
        meta: { module: 'settings' as ModuleKey, title: 'Settings' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { public: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to, _from, next) => {
  NProgress.start()
  if (to.meta.public) {
    next()
    return
  }

  const clientStore = useClientStore()
  const module = to.meta.module as ModuleKey | undefined
  if (module && !clientStore.canAccess(module)) {
    next('/overview')
    return
  }
  next()
})

router.afterEach(() => {
  NProgress.done()
})

export default router
