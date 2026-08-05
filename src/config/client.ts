import type { ClientWebsite, ModuleKey, NavItem } from '@/types'

export const CLIENT_NAV: NavItem[] = [
  { key: 'overview', label: 'Overview', path: '/overview', icon: 'House' },
  { key: 'content', label: 'Content', path: '/content', icon: 'TextT' },
  { key: 'media', label: 'Media', path: '/media', icon: 'Image' },
  { key: 'pages', label: 'Pages', path: '/pages', icon: 'Files' },
  { key: 'maintenance', label: 'Maintenance', path: '/maintenance', icon: 'Wrench' },
  { key: 'submissions', label: 'Submissions', path: '/submissions', icon: 'EnvelopeSimple' },
  { key: 'analytics', label: 'Analytics', path: '/analytics', icon: 'ChartLine' },
  { key: 'settings', label: 'Settings', path: '/settings', icon: 'GearSix' },
]

/** Platform-owner tools — only for Blacnova staff accounts. */
export const OWNER_NAV: NavItem[] = [
  { key: 'clients', label: 'Clients', path: '/clients', icon: 'Buildings', ownerOnly: true },
  { key: 'accounts', label: 'Accounts', path: '/accounts', icon: 'Users', ownerOnly: true },
  { key: 'billing', label: 'Billing', path: '/billing', icon: 'CurrencyDollar', ownerOnly: true },
  { key: 'invoices', label: 'Invoices', path: '/invoices', icon: 'Receipt', ownerOnly: true },
]

/** @deprecated use CLIENT_NAV */
export const ALL_NAV = CLIENT_NAV

export const DEMO_CLIENT: ClientWebsite = {
  id: '',
  name: '',
  domain: '',
  status: 'live',
  modules: [],
}

export function getNavForClient(modules: ModuleKey[], isPlatform = false): NavItem[] {
  const clientItems = CLIENT_NAV.filter((item) => modules.includes(item.key))
  if (!isPlatform) return clientItems
  return [...clientItems, ...OWNER_NAV]
}

export function hasModule(
  modules: ModuleKey[],
  key: ModuleKey,
  isPlatform = false,
): boolean {
  if (OWNER_NAV.some((n) => n.key === key)) return isPlatform
  return modules.includes(key)
}
