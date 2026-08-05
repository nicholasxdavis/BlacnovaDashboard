export type ModuleKey =
  | 'overview'
  | 'content'
  | 'media'
  | 'pages'
  | 'maintenance'
  | 'submissions'
  | 'analytics'
  | 'settings'

export interface NavItem {
  key: ModuleKey
  label: string
  path: string
  icon: string
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
