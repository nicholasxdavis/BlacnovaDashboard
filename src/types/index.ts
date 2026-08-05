export type ModuleKey =
  | 'overview'
  | 'content'
  | 'media'
  | 'pages'
  | 'maintenance'
  | 'submissions'
  | 'analytics'
  | 'settings'
  | 'clients'
  | 'accounts'
  | 'billing'

export type UserRole = 'platform' | 'owner' | 'manager'

export interface NavItem {
  key: ModuleKey
  label: string
  path: string
  icon: string
  ownerOnly?: boolean
}

export interface ClientWebsite {
  id: string
  name: string
  domain: string
  status: 'live' | 'maintenance' | 'offline'
  modules: ModuleKey[]
}

export interface ContentBlock {
  id: string
  pageId: string
  pageName: string
  section: string
  label: string
  type: 'text' | 'textarea' | 'heading'
  value: string
  published: boolean
}

export interface MediaItem {
  id: string
  name: string
  type: 'image' | 'video' | 'document'
  size: string
  updatedAt: string
  usedOn: string
  url: string
}

export interface WebsitePage {
  id: string
  title: string
  slug: string
  status: 'published' | 'draft' | 'unpublished'
  updatedAt: string
}

export interface MaintenanceConfig {
  enabled: boolean
  title: string
  message: string
  expectedReturn: string
}

export type SubmissionStatus = 'new' | 'read' | 'in_progress' | 'resolved' | 'archived'

export interface Submission {
  id: string
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  source: string
  status: SubmissionStatus
  createdAt: string
  notes?: string
}

export interface AnalyticsPoint {
  date: string
  visitors: number
  pageviews: number
  submissions: number
}

export interface AdminClient {
  id: string
  name: string
  domain: string
  status: string
  modules: string[]
  githubRepo: string | null
  accountCount: number
  newSubmissions: number
  createdAt: string
  updatedAt: string
}

export interface AdminAccount {
  id: string
  email: string
  name: string
  role: string
  websiteId: string
  websiteName: string | null
  websiteDomain: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface BillingCharge {
  id: string
  amount: number
  currency: string
  formatted: string
  status: string
  paid: boolean
  description: string
  customer: string
  createdAt: string
}

export interface BillingOverview {
  balance: {
    available: { amount: number; currency: string; formatted: string }
    pending: { amount: number; currency: string; formatted: string }
  }
  charges: BillingCharge[]
  payouts: Array<{
    id: string
    amount: number
    currency: string
    formatted: string
    status: string
    arrivalDate: string
    createdAt: string
  }>
}
