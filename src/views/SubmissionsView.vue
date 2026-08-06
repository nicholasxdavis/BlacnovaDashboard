<template>
  <div class="page">
    <PageHeader
      title="Submissions"
      description="Review and manage inquiries, leads, and form messages from your website."
    >
      <template #actions>
        <span v-if="websiteStore.newSubmissionCount" class="new-count">
          {{ websiteStore.newSubmissionCount }} new
        </span>
        <el-button
          v-if="websiteStore.newSubmissionCount"
          size="small"
          @click="markAllRead"
        >
          Mark all read
        </el-button>
      </template>
    </PageHeader>

    <div class="table-toolbar">
      <div class="table-toolbar__left">
        <el-input
          v-model="search"
          class="grow-input"
          clearable
          placeholder="Search name, email, or subject"
        />
        <el-select
          v-model="statusFilter"
          clearable
          placeholder="All statuses"
          style="width: 160px"
        >
          <el-option label="New" value="new" />
          <el-option label="Read" value="read" />
          <el-option label="In progress" value="in_progress" />
          <el-option label="Resolved" value="resolved" />
          <el-option label="Disregarded" value="archived" />
        </el-select>
      </div>
      <div class="table-toolbar__right">
        <el-select v-model="sortBy" style="width: 150px">
          <el-option label="Newest first" value="newest" />
          <el-option label="Oldest first" value="oldest" />
        </el-select>
        <span class="count-label">{{ filtered.length }} result{{ filtered.length === 1 ? '' : 's' }}</span>
      </div>
    </div>

    <!-- Desktop / tablet table -->
    <div class="surface desktop-only">
      <div class="table-scroll">
        <el-table
          :data="paged"
          empty-text="No submissions match your filters"
          style="width: 100%"
          @row-click="openDetail"
        >
          <el-table-column label="Contact" min-width="160">
            <template #default="{ row }">
              <div class="contact">
                <span v-if="row.status === 'new'" class="unread-dot" aria-label="Unread" />
                <span v-else class="unread-spacer" aria-hidden="true" />
                <div>
                  <div class="contact__name">{{ row.name }}</div>
                  <div class="contact__email">{{ row.email }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="subject" label="Subject" width="150" show-overflow-tooltip />
          <el-table-column prop="source" label="Source" width="120" show-overflow-tooltip />
          <el-table-column label="Status" width="118">
            <template #default="{ row }">
              <StatusBadge :status="row.status" />
            </template>
          </el-table-column>
          <el-table-column label="Received" width="112">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="" width="148" align="right">
            <template #default="{ row }">
              <div class="table-actions">
                <el-button size="small" text @click.stop="openDetail(row)">Open</el-button>
                <el-button size="small" text type="danger" @click.stop="removeSubmission(row)">
                  Delete
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div v-if="filtered.length" class="pager-wrap">
        <el-pagination
          v-model:current-page="page"
          :page-size="pageSize"
          layout="prev, pager, next"
          :total="filtered.length"
          background
        />
      </div>
    </div>

    <!-- Mobile card list -->
    <div class="mobile-only">
      <div v-if="paged.length" class="card-list">
        <button
          v-for="row in paged"
          :key="row.id"
          type="button"
          class="sub-card"
          @click="openDetail(row)"
        >
          <div class="sub-card__top">
            <div class="contact">
              <span v-if="row.status === 'new'" class="unread-dot" aria-hidden="true" />
              <div>
                <div class="contact__name">{{ row.name }}</div>
                <div class="contact__email">{{ row.email }}</div>
              </div>
            </div>
            <StatusBadge :status="row.status" />
          </div>
          <div class="sub-card__subject">{{ row.subject }}</div>
          <div class="sub-card__meta">
            <span>{{ row.source }}</span>
            <span>{{ formatDate(row.createdAt) }}</span>
          </div>
        </button>
      </div>
      <div v-else class="surface">
        <EmptyState title="No submissions found" description="Try a different search or status filter." />
      </div>
      <div v-if="filtered.length" class="pager-wrap pager-wrap--mobile">
        <el-pagination
          v-model:current-page="page"
          :page-size="pageSize"
          layout="prev, pager, next"
          :total="filtered.length"
          background
        />
      </div>
    </div>

    <el-drawer
      v-model="drawerOpen"
      :size="drawerSize"
      destroy-on-close
      class="submission-drawer"
    >
      <template #header>
        <div class="drawer-head">
          <div class="drawer-head__title">Submission</div>
          <div v-if="active" class="drawer-head__sub">{{ active.subject }}</div>
        </div>
      </template>

      <template v-if="active">
        <div class="detail">
          <div class="detail__block">
            <div class="detail__label">Status</div>
            <el-select
              :model-value="active.status"
              style="width: 100%"
              @change="(v: SubmissionStatus) => updateStatus(v)"
            >
              <el-option label="New" value="new" />
              <el-option label="Read" value="read" />
              <el-option label="In progress" value="in_progress" />
              <el-option label="Resolved" value="resolved" />
              <el-option label="Disregarded" value="archived" />
            </el-select>
          </div>

          <div class="detail__block">
            <div class="detail__label">From</div>
            <div class="detail__value">{{ active.name }}</div>
            <div class="detail__contact-row">
              <a class="detail__link" :href="'mailto:' + active.email">{{ active.email }}</a>
              <el-button size="small" text @click="copyText(active.email)">Copy</el-button>
            </div>
            <a v-if="active.phone" class="detail__link" :href="'tel:' + active.phone">{{ active.phone }}</a>
          </div>

          <div class="detail__block">
            <div class="detail__label">Message</div>
            <div class="detail__message">{{ active.message }}</div>
          </div>

          <div class="detail__block detail__meta-grid">
            <div>
              <div class="detail__label">Source</div>
              <div class="detail__value">{{ active.source }}</div>
            </div>
            <div>
              <div class="detail__label">Received</div>
              <div class="detail__value">{{ formatDate(active.createdAt, true) }}</div>
            </div>
          </div>

          <div class="detail__block">
            <div class="detail__label">Internal notes</div>
            <el-input
              v-model="notesDraft"
              type="textarea"
              :rows="4"
              placeholder="Add a note for your team"
            />
            <div class="detail__actions">
              <el-button type="primary" size="small" @click="saveNotes">Save notes</el-button>
              <el-button
                v-if="active.status !== 'archived'"
                size="small"
                @click="disregard"
              >
                Disregard
              </el-button>
              <el-button size="small" type="danger" @click="removeSubmission(active)">
                Delete
              </el-button>
            </div>
          </div>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageHeader from '@/components/PageHeader.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import EmptyState from '@/components/EmptyState.vue'
import { useWebsiteStore } from '@/stores/website'
import type { Submission, SubmissionStatus } from '@/types'

const route = useRoute()
const websiteStore = useWebsiteStore()
const search = ref('')
const statusFilter = ref<SubmissionStatus | undefined>()
const sortBy = ref<'newest' | 'oldest'>('newest')
const page = ref(1)
const pageSize = 8
const drawerOpen = ref(false)
const active = ref<Submission | null>(null)
const notesDraft = ref('')
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1200)

const drawerSize = computed(() => (windowWidth.value < 640 ? '100%' : '420px'))

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  const list = websiteStore.submissions.filter((item) => {
    if (statusFilter.value && item.status !== statusFilter.value) return false
    if (!q) return true
    return (
      item.name.toLowerCase().includes(q) ||
      item.email.toLowerCase().includes(q) ||
      item.subject.toLowerCase().includes(q) ||
      item.source.toLowerCase().includes(q)
    )
  })
  return list.sort((a, b) => {
    const diff = +new Date(b.createdAt) - +new Date(a.createdAt)
    return sortBy.value === 'newest' ? diff : -diff
  })
})

const paged = computed(() => {
  const start = (page.value - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})

watch([search, statusFilter, sortBy], () => {
  page.value = 1
})

watch(
  () => route.query.id,
  (id) => {
    if (typeof id === 'string') {
      const row = websiteStore.submissions.find((s) => s.id === id)
      if (row) openDetail(row)
    }
  },
  { immediate: true },
)

function onResize() {
  windowWidth.value = window.innerWidth
}

onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))

function formatDate(value: string, withTime = false) {
  return dayjs(value).format(withTime ? 'MMM D, YYYY h:mm A' : 'MMM D, YYYY')
}

async function openDetail(row: Submission) {
  active.value = { ...row }
  notesDraft.value = row.notes || ''
  drawerOpen.value = true
  if (row.status === 'new') {
    await websiteStore.setSubmissionStatus(row.id, 'read')
    active.value = { ...row, status: 'read' }
  }
}

async function updateStatus(status: SubmissionStatus) {
  if (!active.value) return
  try {
    await websiteStore.setSubmissionStatus(active.value.id, status)
    active.value = { ...active.value, status }
    ElMessage.success('Status updated')
  } catch {
    ElMessage.error('Could not update status')
  }
}

async function disregard() {
  if (!active.value) return
  try {
    await websiteStore.setSubmissionStatus(active.value.id, 'archived')
    active.value = { ...active.value, status: 'archived' }
    drawerOpen.value = false
    ElMessage.success('Submission disregarded')
  } catch {
    ElMessage.error('Could not disregard submission')
  }
}

async function removeSubmission(row: Submission) {
  try {
    await ElMessageBox.confirm(
      `Delete submission from ${row.name}? This cannot be undone.`,
      'Delete submission',
      { type: 'warning', confirmButtonText: 'Delete', confirmButtonClass: 'el-button--danger' },
    )
    await websiteStore.removeSubmission(row.id)
    if (active.value?.id === row.id) {
      drawerOpen.value = false
      active.value = null
    }
    ElMessage.success('Submission deleted')
  } catch {
    /* cancelled or failed */
  }
}

async function saveNotes() {
  if (!active.value) return
  try {
    await websiteStore.setSubmissionNotes(active.value.id, notesDraft.value)
    active.value = { ...active.value, notes: notesDraft.value }
    ElMessage.success('Notes saved')
  } catch {
    ElMessage.error('Could not save notes')
  }
}

async function markAllRead() {
  try {
    await websiteStore.markAllSubmissionsRead()
    ElMessage.success('All submissions marked as read')
  } catch {
    ElMessage.error('Could not mark submissions as read')
  }
}

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value)
    ElMessage.success('Copied to clipboard')
  } catch {
    ElMessage.error('Could not copy')
  }
}

</script>

<style scoped lang="scss">
.new-count {
  font-size: 12px;
  font-weight: 500;
  color: $bn-white;
  background: $bn-orange;
  border: 1px solid $bn-orange;
  border-radius: 999px;
  padding: 4px 10px;
}

.count-label {
  font-size: 13px;
  color: $bn-gray-500;
}

.contact {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.contact__name {
  font-weight: 500;
  color: $bn-black;
}

.contact__email {
  font-size: 12px;
  color: $bn-gray-500;
}

.unread-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: $bn-orange;
  margin-top: 6px;
  flex-shrink: 0;
}

.unread-spacer {
  width: 7px;
  flex-shrink: 0;
}

.pager-wrap {
  padding: 12px 16px 16px;
  border-top: $bn-border;
  display: flex;
  justify-content: flex-end;
}

.pager-wrap--mobile {
  border-top: none;
  padding: 12px 0 0;
}

.drawer-head__title {
  font-size: 16px;
  font-weight: 500;
  color: $bn-black;
}

.drawer-head__sub {
  margin-top: 2px;
  font-size: 13px;
  color: $bn-gray-500;
  font-weight: 400;
}

.detail__block {
  margin-bottom: 22px;
}

.detail__label {
  font-size: 11px;
  color: $bn-gray-500;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 500;
}

.detail__value {
  font-size: 14px;
  color: $bn-gray-900;
  font-weight: 500;
}

.detail__link {
  display: block;
  font-size: 13px;
  color: $bn-gray-700;
  margin-top: 3px;
}

.detail__contact-row {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
}

.detail__contact-row .detail__link {
  margin-top: 0;
}

.detail__link:hover {
  color: $bn-orange;
}

.detail__message {
  font-size: 14px;
  line-height: 1.55;
  color: $bn-gray-700;
  white-space: pre-wrap;
  padding: 12px 14px;
  background: $bn-gray-50;
  border-radius: $bn-radius-sm;
  border: $bn-border;
}

.detail__meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.detail__actions {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sub-card {
  width: 100%;
  text-align: left;
  background: $bn-white;
  border: $bn-border;
  border-radius: $bn-radius;
  padding: 14px;
  cursor: pointer;
}

.sub-card:hover {
  border-color: $bn-gray-300;
}

.sub-card__top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.sub-card__subject {
  margin-top: 10px;
  font-size: 14px;
  color: $bn-gray-900;
  font-weight: 500;
}

.sub-card__meta {
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  color: $bn-gray-500;
}

.desktop-only {
  display: block;
}

.mobile-only {
  display: none;
}

:deep(.el-table__row) {
  cursor: pointer;
}

@media (max-width: 768px) {
  .desktop-only {
    display: none;
  }

  .mobile-only {
    display: block;
  }
}
</style>
