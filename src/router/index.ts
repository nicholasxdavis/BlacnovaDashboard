import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { useAuthStore } from '@/stores/auth'
import { useClientStore } from '@/stores/client'
import { useWebsiteStore } from '@/stores/website'
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
      {
        path: 'clients',
        name: 'Clients',
        component: () => import('@/views/ClientsView.vue'),
        meta: { module: 'clients' as ModuleKey, title: 'Clients', owner: true },
      },
      {
        path: 'accounts',
        name: 'Accounts',
        component: () => import('@/views/AccountsView.vue'),
        meta: { module: 'accounts' as ModuleKey, title: 'Accounts', owner: true },
      },
      {
        path: 'billing',
        name: 'Billing',
        component: () => import('@/views/BillingView.vue'),
        meta: { module: 'billing' as ModuleKey, title: 'Billing', owner: true },
      },
      {
        path: 'invoices',
        name: 'Invoices',
        component: () => import('@/views/InvoicesView.vue'),
        meta: { module: 'invoices' as ModuleKey, title: 'Invoices', owner: true },
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

let bootPromise: Promise<boolean> | null = null

async function ensureBootstrapped() {
  const auth = useAuthStore()
  if (auth.bootstrapped) return auth.isAuthenticated
  if (!bootPromise) bootPromise = auth.bootstrap().finally(() => {
    bootPromise = null
  })
  return bootPromise
}

router.beforeEach(async (to, _from, next) => {
  NProgress.start()
  try {
    const auth = useAuthStore()
    await ensureBootstrapped()

    if (to.meta.public) {
      if (to.path === '/login' && auth.isAuthenticated) {
        next('/overview')
        return
      }
      next()
      return
    }

    if (!auth.isAuthenticated) {
      next({ path: '/login', query: { redirect: to.fullPath } })
      return
    }

    const websiteStore = useWebsiteStore()
    if (!websiteStore.loaded && !websiteStore.loading) {
      try {
        await websiteStore.fetchDashboard()
      } catch {
        await auth.logout()
        next({ path: '/login', query: { redirect: to.fullPath } })
        return
      }
    }

    const clientStore = useClientStore()
    const module = to.meta.module as ModuleKey | undefined
    if (to.meta.owner && !auth.isPlatform) {
      next('/overview')
      return
    }
    if (module && !clientStore.canAccess(module)) {
      next('/overview')
      return
    }
    next()
  } catch (err) {
    console.error('Router guard failed', err)
    next('/login')
  }
})

router.afterEach(() => {
  NProgress.done()
})

router.onError(() => {
  NProgress.done()
})

export default router
