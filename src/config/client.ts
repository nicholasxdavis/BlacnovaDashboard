import type { ClientWebsite, ModuleKey, NavItem } from '@/types'

export const ALL_NAV: NavItem[] = [
  { key: 'overview', label: 'Overview', path: '/overview', icon: 'House' },
  { key: 'content', label: 'Content', path: '/content', icon: 'TextT' },
  { key: 'media', label: 'Media', path: '/media', icon: 'Image' },
  { key: 'pages', label: 'Pages', path: '/pages', icon: 'Files' },
  { key: 'maintenance', label: 'Maintenance', path: '/maintenance', icon: 'Wrench' },
  { key: 'submissions', label: 'Submissions', path: '/submissions', icon: 'EnvelopeSimple' },
  { key: 'analytics', label: 'Analytics', path: '/analytics', icon: 'ChartLine' },
  { key: 'settings', label: 'Settings', path: '/settings', icon: 'GearSix' },
]

/** Demo client. Swap modules to show/hide entire sections. */
export const DEMO_CLIENT: ClientWebsite = {
  id: 'demo-summit',
  name: 'Summit Ridge Dental',
  domain: 'summitridgedental.com',
  status: 'live',
  modules: [
    'overview',
    'content',
    'media',
    'pages',
    'maintenance',
    'submissions',
    'analytics',
    'settings',
  ],
}

export function getNavForClient(modules: ModuleKey[]): NavItem[] {
  return ALL_NAV.filter((item) => modules.includes(item.key))
}

export function hasModule(modules: ModuleKey[], key: ModuleKey): boolean {
  return modules.includes(key)
}
