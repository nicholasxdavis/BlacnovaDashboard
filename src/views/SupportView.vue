<template>
  <div class="page">
    <PageHeader
      title="Dashboard Support"
      description="Support messages sent from every client portal. Platform admin only."
    >
      <template #actions>
        <span v-if="newCount" class="new-count">{{ newCount }} new</span>
      </template>
    </PageHeader>

    <div class="table-toolbar">
      <div class="table-toolbar__left">
        <el-input
          v-model="search"
          class="grow-input"
          clearable
          placeholder="Search name, email, topic, or website"
        />
        <el-select v-model="statusFilter" clearable placeholder="All statuses" style="width: 160px">
          <el-option label="New" value="new" />
          <el-option label="Read" value="read" />
          <el-option label="In progress" value="in_progress" />
          <el-option label="Resolved" value="resolved" />
          <el-option label="Disregarded" value="archived" />
        </el-select>
      </div>
      <div class="table-toolbar__right">
        <span class="count-label">{{ filtered.length }} ticket{{ filtered.length === 1 ? '' : 's' }}</span>
      </div>
    </div>

    <div class="surface table-scroll">
      <el-table
        :data="paged"
        v-loading="loading"
        empty-text="No support tickets yet"
        style="width: 100%"
        @row-click="openDetail"
      >
        <el-table-column label="From" min-width="150">
          <template #default="{ row }">
            <div class="contact">
              <span v-if="row.status === 'new'" class="unread-dot" aria-label="Unread" />
              <span v-else class="unread-spacer" aria-hidden="true" />
              <div>
                <div class="contact__name">{{ row.userName }}</div>
                <div class="contact__email">{{ row.userEmail }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Website" width="160" show-overflow-tooltip>
          <template #default="{ row }">
            <div>{{ row.websiteName }}</div>
            <div class="muted">{{ row.websiteDomain }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="topic" label="Topic" width="140" show-overflow-tooltip>
          <template #default="{ row }">
            {{ topicLabel(row.topic) }}
          </template>
        </el-table-column>
        <el-table-column label="Status" width="118">
          <template #default="{ row }">
            <StatusBadge :status="row.status" />
          </template>
        </el-table-column>
        <el-table-column label="Received" width="150">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="" width="148" align="right">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button size="small" text @click.stop="openDetail(row)">Open</el-button>
              <el-button size="small" text type="danger" @click.stop="removeTicket(row)">
                Delete
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

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

    <el-drawer
      v-model="drawerOpen"
      title="Support ticket"
      :size="drawerSize"
      destroy-on-close
    >
      <template v-if="active">
        <div class="detail">
          <div class="detail__meta">
            <div>
              <div class="field-label">From</div>
              <div class="detail__value">{{ active.userName }}</div>
              <a class="detail__link" :href="'mailto:' + active.userEmail">{{ active.userEmail }}</a>
            </div>
            <div>
              <div class="field-label">Website</div>
              <div class="detail__value">{{ active.websiteName }}</div>
              <div class="muted">{{ active.websiteDomain }}</div>
            </div>
            <div>
              <div class="field-label">Topic</div>
              <div class="detail__value">{{ topicLabel(active.topic) }}</div>
            </div>
            <div>
              <div class="field-label">Received</div>
              <div class="detail__value">{{ formatDate(active.createdAt) }}</div>
            </div>
          </div>

          <div>
            <div class="field-label">Message</div>
            <p class="detail__message">{{ active.message }}</p>
          </div>

          <div>
            <div class="field-label">Status</div>
            <el-select v-model="active.status" style="width: 100%" @change="saveStatus">
              <el-option label="New" value="new" />
              <el-option label="Read" value="read" />
              <el-option label="In progress" value="in_progress" />
              <el-option label="Resolved" value="resolved" />
              <el-option label="Disregarded" value="archived" />
            </el-select>
          </div>

          <div>
            <div class="field-label">Internal notes</div>
            <el-input
              v-model="notesDraft"
              type="textarea"
              :rows="4"
              maxlength="2000"
              show-word-limit
              placeholder="Private notes for Blacnova staff"
            />
            <div class="btn-row">
              <el-button type="primary" :loading="saving" @click="saveNotes">Save notes</el-button>
              <el-button
                v-if="active.status !== 'archived'"
                :loading="saving"
                @click="disregard"
              >
                Disregard
              </el-button>
              <el-button type="danger" :loading="saving" @click="removeTicket(active)">
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
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageHeader from '@/components/PageHeader.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { api } from '@/lib/api'
import type { SubmissionStatus } from '@/types'

interface SupportTicket {
  id: string
  topic: string
  message: string
  status: SubmissionStatus
  notes: string
  createdAt: string
  userId: string
  userName: string
  userEmail: string
  websiteId: string
  websiteName: string
  websiteDomain: string
}

const TOPIC_LABELS: Record<string, string> = {
  content: 'Website content help',
  technical: 'Technical issue',
  billing: 'Billing or account',
  other: 'Something else',
}

const tickets = ref<SupportTicket[]>([])
const loading = ref(false)
const search = ref('')
const statusFilter = ref('')
const page = ref(1)
const pageSize = 12
const drawerOpen = ref(false)
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
const drawerSize = computed(() => (windowWidth.value < 640 ? '100%' : '420px'))

function onResize() {
  windowWidth.value = window.innerWidth
}
const active = ref<SupportTicket | null>(null)
const notesDraft = ref('')
const saving = ref(false)

const newCount = computed(() => tickets.value.filter((t) => t.status === 'new').length)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return tickets.value.filter((t) => {
    if (statusFilter.value && t.status !== statusFilter.value) return false
    if (!q) return true
    return (
      t.userName.toLowerCase().includes(q) ||
      t.userEmail.toLowerCase().includes(q) ||
      t.topic.toLowerCase().includes(q) ||
      t.message.toLowerCase().includes(q) ||
      t.websiteName.toLowerCase().includes(q) ||
      t.websiteDomain.toLowerCase().includes(q)
    )
  })
})

const paged = computed(() => {
  const start = (page.value - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})

function topicLabel(topic: string) {
  return TOPIC_LABELS[topic] || topic
}

function formatDate(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(+d)) return iso
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

async function load() {
  loading.value = true
  try {
    const { data } = await api.get('/v1/admin/support')
    tickets.value = data.tickets
  } catch {
    ElMessage.error('Could not load support tickets')
  } finally {
    loading.value = false
  }
}

async function openDetail(row: SupportTicket) {
  active.value = { ...row }
  notesDraft.value = row.notes || ''
  drawerOpen.value = true
  if (row.status === 'new') {
    try {
      await api.patch(`/v1/admin/support/${row.id}`, { status: 'read' })
      row.status = 'read'
      active.value.status = 'read'
    } catch {
      /* ignore */
    }
  }
}

async function saveStatus() {
  if (!active.value) return
  try {
    await api.patch(`/v1/admin/support/${active.value.id}`, { status: active.value.status })
    const row = tickets.value.find((t) => t.id === active.value!.id)
    if (row) row.status = active.value.status
    ElMessage.success('Status updated')
  } catch {
    ElMessage.error('Could not update status')
  }
}

async function disregard() {
  if (!active.value) return
  saving.value = true
  try {
    await api.patch(`/v1/admin/support/${active.value.id}`, { status: 'archived' })
    const row = tickets.value.find((t) => t.id === active.value!.id)
    if (row) row.status = 'archived'
    active.value.status = 'archived'
    drawerOpen.value = false
    ElMessage.success('Ticket disregarded')
  } catch {
    ElMessage.error('Could not disregard ticket')
  } finally {
    saving.value = false
  }
}

async function removeTicket(row: SupportTicket) {
  try {
    await ElMessageBox.confirm(
      `Delete support ticket from ${row.userName}? This cannot be undone.`,
      'Delete ticket',
      { type: 'warning', confirmButtonText: 'Delete', confirmButtonClass: 'el-button--danger' },
    )
    await api.delete(`/v1/admin/support/${row.id}`)
    tickets.value = tickets.value.filter((t) => t.id !== row.id)
    if (active.value?.id === row.id) {
      drawerOpen.value = false
      active.value = null
    }
    ElMessage.success('Ticket deleted')
  } catch {
    /* cancelled */
  }
}

async function saveNotes() {
  if (!active.value) return
  saving.value = true
  try {
    await api.patch(`/v1/admin/support/${active.value.id}`, { notes: notesDraft.value })
    const row = tickets.value.find((t) => t.id === active.value!.id)
    if (row) row.notes = notesDraft.value
    active.value.notes = notesDraft.value
    ElMessage.success('Notes saved')
  } catch {
    ElMessage.error('Could not save notes')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', onResize, { passive: true })
  void load()
})
onUnmounted(() => window.removeEventListener('resize', onResize))
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

.contact {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.contact__name {
  font-weight: 500;
  color: $bn-gray-900;
}

.contact__email,
.muted {
  font-size: 12px;
  color: $bn-gray-500;
}

.unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: $bn-orange;
  margin-top: 6px;
  flex-shrink: 0;
}

.unread-spacer {
  width: 8px;
  flex-shrink: 0;
}

.pager-wrap {
  display: flex;
  justify-content: flex-end;
  padding: 12px 16px 4px;
}

.detail {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.detail__meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.field-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: $bn-gray-400;
  margin-bottom: 4px;
}

.detail__value {
  font-size: 14px;
  color: $bn-gray-900;
  font-weight: 500;
}

.detail__link {
  color: $bn-orange;
  font-size: 13px;
}

.detail__message {
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.55;
  color: $bn-gray-700;
  font-size: 14px;
}

.btn-row {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

@media (max-width: 560px) {
  .detail__meta {
    grid-template-columns: 1fr;
  }
}
</style>
