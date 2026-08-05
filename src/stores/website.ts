import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { api } from '@/lib/api'
import type {
  AnalyticsPoint,
  ContentBlock,
  MaintenanceConfig,
  MediaItem,
  Submission,
  SubmissionStatus,
  WebsitePage,
} from '@/types'

export const useWebsiteStore = defineStore('website', () => {
  const content = ref<ContentBlock[]>([])
  const media = ref<MediaItem[]>([])
  const pages = ref<WebsitePage[]>([])
  const maintenance = ref<MaintenanceConfig>({
    enabled: false,
    title: '',
    message: '',
    expectedReturn: '',
  })
  const submissions = ref<Submission[]>([])
  const analytics = ref<AnalyticsPoint[]>([])
  const deltas = ref({
    visitors: { label: '—', trend: 'flat' as 'up' | 'down' | 'flat' },
    pageviews: { label: '—', trend: 'flat' as 'up' | 'down' | 'flat' },
    submissions: { label: '—', trend: 'flat' as 'up' | 'down' | 'flat' },
  })
  const loaded = ref(false)
  const loading = ref(false)

  const newSubmissionCount = computed(
    () => submissions.value.filter((s) => s.status === 'new').length,
  )

  const publishedPageCount = computed(
    () => pages.value.filter((p) => p.status === 'published').length,
  )

  async function fetchDashboard() {
    loading.value = true
    try {
      const { data } = await api.get('/v1/dashboard')
      content.value = data.content
      media.value = data.media
      pages.value = data.pages
      maintenance.value = data.maintenance
      submissions.value = data.submissions
      analytics.value = data.analytics
      if (data.deltas) deltas.value = data.deltas
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  function clear() {
    content.value = []
    media.value = []
    pages.value = []
    submissions.value = []
    analytics.value = []
    loaded.value = false
  }

  async function updateContentBlock(id: string, value: string) {
    const { data } = await api.patch(`/v1/content/${id}`, { value })
    const idx = content.value.findIndex((b) => b.id === id)
    if (idx >= 0) content.value[idx] = data.content
  }

  async function setContentPublished(id: string, published: boolean) {
    const { data } = await api.patch(`/v1/content/${id}`, { published })
    const idx = content.value.findIndex((b) => b.id === id)
    if (idx >= 0) content.value[idx] = data.content
  }

  async function updateMaintenance(patch: Partial<MaintenanceConfig>) {
    const { data } = await api.put('/v1/maintenance', patch)
    maintenance.value = data.maintenance
  }

  async function setSubmissionStatus(id: string, status: SubmissionStatus) {
    const { data } = await api.patch(`/v1/submissions/${id}`, { status })
    const idx = submissions.value.findIndex((s) => s.id === id)
    if (idx >= 0) submissions.value[idx] = data.submission
  }

  async function setSubmissionNotes(id: string, notes: string) {
    const { data } = await api.patch(`/v1/submissions/${id}`, { notes })
    const idx = submissions.value.findIndex((s) => s.id === id)
    if (idx >= 0) submissions.value[idx] = data.submission
  }

  async function setPageStatus(id: string, status: WebsitePage['status']) {
    const { data } = await api.patch(`/v1/pages/${id}`, { status })
    const idx = pages.value.findIndex((p) => p.id === id)
    if (idx >= 0) pages.value[idx] = data.page
  }

  async function removeMedia(id: string) {
    await api.delete(`/v1/media/${id}`)
    media.value = media.value.filter((m) => m.id !== id)
  }

  async function addMedia(form: FormData) {
    const { data } = await api.post('/v1/media', form)
    media.value = [data.media, ...media.value]
    return data.media as MediaItem
  }

  async function replaceMedia(id: string, form: FormData) {
    const { data } = await api.put(`/v1/media/${id}`, form)
    const idx = media.value.findIndex((m) => m.id === id)
    if (idx >= 0) media.value[idx] = data.media
    return data.media as MediaItem
  }

  async function markAllSubmissionsRead() {
    await api.post('/v1/submissions/mark-read')
    submissions.value.forEach((s) => {
      if (s.status === 'new') s.status = 'read'
    })
  }

  async function publishSite() {
    const { data } = await api.post('/v1/publish')
    return data as {
      ok: boolean
      publishedAt: string
      blocks: number
      files: Array<{ path: string; commitSha: string; updated: boolean }>
      siteUrl: string
      repo: string
    }
  }

  return {
    content,
    media,
    pages,
    maintenance,
    submissions,
    analytics,
    deltas,
    loaded,
    loading,
    newSubmissionCount,
    publishedPageCount,
    fetchDashboard,
    clear,
    updateContentBlock,
    setContentPublished,
    updateMaintenance,
    setSubmissionStatus,
    setSubmissionNotes,
    setPageStatus,
    removeMedia,
    addMedia,
    replaceMedia,
    markAllSubmissionsRead,
    publishSite,
  }
})
