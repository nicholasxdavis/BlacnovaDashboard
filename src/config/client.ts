import type { ClientWebsite, ModuleKey, NavItem } from '@/types'

export const CLIENT_NAV: NavItem[] = [
  { key: 'overview', label: 'Overview', path: '/overview', icon: 'House' },
  { key: 'maintenance', label: 'Maintenance', path: '/maintenance', icon: 'Wrench' },
  { key: 'submissions', label: 'Submissions', path: '/submissions', icon: 'EnvelopeSimple' },
  { key: 'analytics', label: 'Analytics', path: '/analytics', icon: 'ChartLine' },
  { key: 'billing', label: 'Billing', path: '/billing', icon: 'CurrencyDollar' },
  { key: 'settings', label: 'Settings', path: '/settings', icon: 'GearSix' },
]

/** Platform-owner tools. Only for Blacnova staff accounts. */
export const OWNER_NAV: NavItem[] = [
  { key: 'clients', label: 'Clients', path: '/clients', icon: 'Buildings', ownerOnly: true },
  { key: 'accounts', label: 'Accounts', path: '/accounts', icon: 'Users', ownerOnly: true },
  { key: 'finance', label: 'Finance', path: '/finance', icon: 'ChartLineUp', ownerOnly: true },
  { key: 'invoices', label: 'Invoices', path: '/invoices', icon: 'Receipt', ownerOnly: true },
  {
    key: 'support',
    label: 'Dashboard Support',
    path: '/support',
    icon: 'Lifebuoy',
    ownerOnly: true,
  },
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

export function getNavForClient(
  modules: ModuleKey[],
  isPlatform = false,
  canAccessFinance = false,
): NavItem[] {
  const clientItems = CLIENT_NAV.filter((item) => modules.includes(item.key))
  if (!isPlatform) return clientItems
  const ownerItems = OWNER_NAV.filter((item) => {
    if (item.key === 'finance') return canAccessFinance
    // Finance owner sees invoices inside Finance, not as a duplicate nav item.
    if (item.key === 'invoices' && canAccessFinance) return false
    return true
  })
  return [...clientItems, ...ownerItems]
}

export function hasModule(
  modules: ModuleKey[],
  key: ModuleKey,
  isPlatform = false,
  canAccessFinance = false,
): boolean {
  if (key === 'finance') return canAccessFinance
  if (key === 'content' || key === 'media' || key === 'pages') return false
  if (OWNER_NAV.some((n) => n.key === key)) return isPlatform
  return modules.includes(key)
}
