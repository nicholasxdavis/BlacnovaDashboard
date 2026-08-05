import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  analyticsSeries,
  contentBlocks as seedContent,
  maintenanceConfig as seedMaintenance,
  mediaItems as seedMedia,
  submissions as seedSubmissions,
  websitePages as seedPages,
} from '@/data/mock'
import type {
  ContentBlock,
  MaintenanceConfig,
  MediaItem,
  Submission,
  SubmissionStatus,
  WebsitePage,
} from '@/types'

export const useWebsiteStore = defineStore('website', () => {
  const content = ref<ContentBlock[]>(structuredClone(seedContent))
  const media = ref<MediaItem[]>(structuredClone(seedMedia))
  const pages = ref<WebsitePage[]>(structuredClone(seedPages))
  const maintenance = ref<MaintenanceConfig>(structuredClone(seedMaintenance))
  const submissions = ref<Submission[]>(structuredClone(seedSubmissions))
  const analytics = ref(structuredClone(analyticsSeries))

  const newSubmissionCount = computed(
    () => submissions.value.filter((s) => s.status === 'new').length,
  )

  const publishedPageCount = computed(
    () => pages.value.filter((p) => p.status === 'published').length,
  )

  function updateContentBlock(id: string, value: string) {
    const block = content.value.find((b) => b.id === id)
    if (block) block.value = value
  }

  function setContentPublished(id: string, published: boolean) {
    const block = content.value.find((b) => b.id === id)
    if (block) block.published = published
  }

  function updateMaintenance(patch: Partial<MaintenanceConfig>) {
    maintenance.value = { ...maintenance.value, ...patch }
  }

  function setSubmissionStatus(id: string, status: SubmissionStatus) {
    const item = submissions.value.find((s) => s.id === id)
    if (item) item.status = status
  }

  function setSubmissionNotes(id: string, notes: string) {
    const item = submissions.value.find((s) => s.id === id)
    if (item) item.notes = notes
  }

  function setPageStatus(id: string, status: WebsitePage['status']) {
    const page = pages.value.find((p) => p.id === id)
    if (page) {
      page.status = status
      page.updatedAt = new Date().toISOString().slice(0, 10)
    }
  }

  function removeMedia(id: string) {
    media.value = media.value.filter((m) => m.id !== id)
  }

  function addMedia(item: MediaItem) {
    media.value = [item, ...media.value]
  }

  function replaceMedia(id: string, patch: Partial<MediaItem>) {
    const item = media.value.find((m) => m.id === id)
    if (item) Object.assign(item, patch)
  }

  function markAllSubmissionsRead() {
    submissions.value.forEach((s) => {
      if (s.status === 'new') s.status = 'read'
    })
  }

  return {
    content,
    media,
    pages,
    maintenance,
    submissions,
    analytics,
    newSubmissionCount,
    publishedPageCount,
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
  }
})
