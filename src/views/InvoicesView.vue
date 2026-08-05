<template>
  <div class="page">
    <PageHeader
      title="Invoices"
      description="Create Stripe invoices and email them via Brevo. Optional monthly recurring billing."
    >
      <template #actions>
        <el-button @click="openRecurring">New recurring</el-button>
        <el-button type="primary" @click="openSend">Send invoice</el-button>
      </template>
    </PageHeader>

    <el-tabs v-model="tab">
      <el-tab-pane label="Sent" name="sent">
        <div class="surface">
          <el-table :data="invoices" v-loading="loading" empty-text="No invoices yet">
            <el-table-column prop="createdAt" label="Sent" width="160">
              <template #default="{ row }">{{ formatDate(row.sentAt || row.createdAt) }}</template>
            </el-table-column>
            <el-table-column prop="customerName" label="Customer" min-width="140">
              <template #default="{ row }">
                <div>{{ row.customerName }}</div>
                <div class="muted">{{ row.customerEmail }}</div>
              </template>
            </el-table-column>
            <el-table-column label="Website" min-width="140">
              <template #default="{ row }">
                {{ row.websiteName || '—' }}
              </template>
            </el-table-column>
            <el-table-column prop="description" label="Description" min-width="160" />
            <el-table-column prop="formatted" label="Amount" width="110" />
            <el-table-column prop="status" label="Status" width="110" />
            <el-table-column label="" width="100" align="right">
              <template #default="{ row }">
                <a
                  v-if="row.hostedInvoiceUrl"
                  class="link-btn"
                  :href="row.hostedInvoiceUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open
                </a>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <el-tab-pane label="Recurring" name="recurring">
        <div class="surface">
          <el-table :data="recurring" v-loading="loading" empty-text="No recurring invoices yet">
            <el-table-column prop="customerName" label="Customer" min-width="140">
              <template #default="{ row }">
                <div>{{ row.customerName }}</div>
                <div class="muted">{{ row.customerEmail }}</div>
              </template>
            </el-table-column>
            <el-table-column label="Website" min-width="140">
              <template #default="{ row }">{{ row.websiteName || '—' }}</template>
            </el-table-column>
            <el-table-column prop="description" label="Description" min-width="150" />
            <el-table-column prop="formatted" label="Amount" width="110" />
            <el-table-column label="Day" width="90">
              <template #default="{ row }">{{ row.dayOfMonth }}</template>
            </el-table-column>
            <el-table-column label="Status" width="100">
              <template #default="{ row }">
                <span
                  :class="row.active ? 'status-dot status-dot--ok' : 'status-dot status-dot--off'"
                >
                  {{ row.active ? 'Active' : 'Paused' }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="lastSentOn" label="Last sent" width="120">
              <template #default="{ row }">{{ row.lastSentOn || '—' }}</template>
            </el-table-column>
            <el-table-column label="" width="220" align="right">
              <template #default="{ row }">
                <el-button text :loading="runningId === row.id" @click="runNow(row)">
                  Send now
                </el-button>
                <el-button text @click="toggleRecurring(row)">
                  {{ row.active ? 'Pause' : 'Resume' }}
                </el-button>
                <el-button text type="danger" @click="removeRecurring(row)">Delete</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="sendOpen" title="Send invoice" width="460px" destroy-on-close>
      <div class="ticket-form">
        <div>
          <label class="field-label">Customer name</label>
          <el-input v-model="sendForm.name" placeholder="Acme Dental" />
        </div>
        <div>
          <label class="field-label">Email</label>
          <el-input v-model="sendForm.email" type="email" placeholder="billing@acme.com" />
        </div>
        <div>
          <label class="field-label">Amount (USD)</label>
          <el-input-number v-model="sendForm.amount" :min="0.5" :step="1" :precision="2" style="width: 100%" />
        </div>
        <div>
          <label class="field-label">Description</label>
          <el-input
            v-model="sendForm.description"
            type="textarea"
            :rows="2"
            placeholder="Monthly website management — August"
          />
        </div>
        <div>
          <label class="field-label">Client website (optional)</label>
          <el-select v-model="sendForm.websiteId" clearable filterable style="width: 100%" placeholder="None">
            <el-option
              v-for="c in clients"
              :key="c.id"
              :label="`${c.name} (${c.domain})`"
              :value="c.id"
            />
          </el-select>
        </div>
        <div>
          <label class="field-label">Days until due</label>
          <el-input-number v-model="sendForm.daysUntilDue" :min="1" :max="90" style="width: 100%" />
        </div>
      </div>
      <template #footer>
        <el-button @click="sendOpen = false">Cancel</el-button>
        <el-button type="primary" :loading="saving" @click="sendInvoice">Create &amp; email</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="recurringOpen" title="New recurring invoice" width="460px" destroy-on-close>
      <div class="ticket-form">
        <div>
          <label class="field-label">Customer name</label>
          <el-input v-model="recurringForm.name" />
        </div>
        <div>
          <label class="field-label">Email</label>
          <el-input v-model="recurringForm.email" type="email" />
        </div>
        <div>
          <label class="field-label">Amount (USD)</label>
          <el-input-number
            v-model="recurringForm.amount"
            :min="0.5"
            :step="1"
            :precision="2"
            style="width: 100%"
          />
        </div>
        <div>
          <label class="field-label">Description</label>
          <el-input v-model="recurringForm.description" type="textarea" :rows="2" />
        </div>
        <div>
          <label class="field-label">Bill on day of month</label>
          <el-input-number v-model="recurringForm.dayOfMonth" :min="1" :max="28" style="width: 100%" />
          <p class="hint">Uses days 1–28 so every month has that date.</p>
        </div>
        <div>
          <label class="field-label">Client website (optional)</label>
          <el-select
            v-model="recurringForm.websiteId"
            clearable
            filterable
            style="width: 100%"
            placeholder="None"
          >
            <el-option
              v-for="c in clients"
              :key="c.id"
              :label="`${c.name} (${c.domain})`"
              :value="c.id"
            />
          </el-select>
        </div>
        <div>
          <label class="field-label">Days until due</label>
          <el-input-number v-model="recurringForm.daysUntilDue" :min="1" :max="90" style="width: 100%" />
        </div>
      </div>
      <template #footer>
        <el-button @click="recurringOpen = false">Cancel</el-button>
        <el-button type="primary" :loading="saving" @click="createRecurring">Save schedule</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageHeader from '@/components/PageHeader.vue'
import { api } from '@/lib/api'
import type { AdminClient, DashboardInvoice, RecurringInvoice } from '@/types'

const tab = ref('sent')
const invoices = ref<DashboardInvoice[]>([])
const recurring = ref<RecurringInvoice[]>([])
const clients = ref<AdminClient[]>([])
const loading = ref(false)
const saving = ref(false)
const runningId = ref<string | null>(null)
const sendOpen = ref(false)
const recurringOpen = ref(false)

const sendForm = reactive({
  name: '',
  email: '',
  amount: 99,
  description: '',
  websiteId: '',
  daysUntilDue: 14,
})

const recurringForm = reactive({
  name: '',
  email: '',
  amount: 99,
  description: '',
  websiteId: '',
  dayOfMonth: 1,
  daysUntilDue: 14,
})

function formatDate(value: string) {
  return dayjs(value).format('MMM D, YYYY h:mm A')
}

async function load() {
  loading.value = true
  try {
    const [invRes, recRes, clientsRes] = await Promise.all([
      api.get('/v1/admin/invoices'),
      api.get('/v1/admin/recurring-invoices'),
      api.get('/v1/admin/clients'),
    ])
    invoices.value = invRes.data.invoices
    recurring.value = recRes.data.recurring
    clients.value = clientsRes.data.clients
  } catch {
    ElMessage.error('Could not load invoices')
  } finally {
    loading.value = false
  }
}

function openSend() {
  sendForm.name = ''
  sendForm.email = ''
  sendForm.amount = 99
  sendForm.description = ''
  sendForm.websiteId = ''
  sendForm.daysUntilDue = 14
  sendOpen.value = true
}

function openRecurring() {
  recurringForm.name = ''
  recurringForm.email = ''
  recurringForm.amount = 99
  recurringForm.description = 'Monthly website management'
  recurringForm.websiteId = ''
  recurringForm.dayOfMonth = 1
  recurringForm.daysUntilDue = 14
  recurringOpen.value = true
}

async function sendInvoice() {
  if (!sendForm.name.trim() || !sendForm.email.trim() || !sendForm.description.trim()) {
    ElMessage.error('Name, email, and description are required')
    return
  }
  saving.value = true
  try {
    await api.post('/v1/admin/invoices', {
      name: sendForm.name.trim(),
      email: sendForm.email.trim().toLowerCase(),
      amount: sendForm.amount,
      description: sendForm.description.trim(),
      websiteId: sendForm.websiteId || undefined,
      daysUntilDue: sendForm.daysUntilDue,
    })
    sendOpen.value = false
    ElMessage.success('Invoice created and emailed')
    tab.value = 'sent'
    await load()
  } catch (err: unknown) {
    const message =
      (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
      'Could not send invoice'
    ElMessage.error(message)
  } finally {
    saving.value = false
  }
}

async function createRecurring() {
  if (
    !recurringForm.name.trim() ||
    !recurringForm.email.trim() ||
    !recurringForm.description.trim()
  ) {
    ElMessage.error('Name, email, and description are required')
    return
  }
  saving.value = true
  try {
    await api.post('/v1/admin/recurring-invoices', {
      name: recurringForm.name.trim(),
      email: recurringForm.email.trim().toLowerCase(),
      amount: recurringForm.amount,
      description: recurringForm.description.trim(),
      websiteId: recurringForm.websiteId || undefined,
      dayOfMonth: recurringForm.dayOfMonth,
      daysUntilDue: recurringForm.daysUntilDue,
    })
    recurringOpen.value = false
    ElMessage.success('Recurring invoice scheduled')
    tab.value = 'recurring'
    await load()
  } catch (err: unknown) {
    const message =
      (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
      'Could not create schedule'
    ElMessage.error(message)
  } finally {
    saving.value = false
  }
}

async function toggleRecurring(row: RecurringInvoice) {
  try {
    await api.patch(`/v1/admin/recurring-invoices/${row.id}`, { active: !row.active })
    ElMessage.success(row.active ? 'Paused' : 'Resumed')
    await load()
  } catch {
    ElMessage.error('Could not update schedule')
  }
}

async function runNow(row: RecurringInvoice) {
  runningId.value = row.id
  try {
    await api.post(`/v1/admin/recurring-invoices/${row.id}/run`)
    ElMessage.success('Invoice sent')
    tab.value = 'sent'
    await load()
  } catch (err: unknown) {
    const message =
      (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
      'Could not send invoice'
    ElMessage.error(message)
  } finally {
    runningId.value = null
  }
}

async function removeRecurring(row: RecurringInvoice) {
  try {
    await ElMessageBox.confirm(`Delete recurring invoice for ${row.customerEmail}?`, 'Delete', {
      type: 'warning',
      confirmButtonText: 'Delete',
    })
    await api.delete(`/v1/admin/recurring-invoices/${row.id}`)
    ElMessage.success('Deleted')
    await load()
  } catch {
    /* cancelled */
  }
}

onMounted(load)
</script>

<style scoped lang="scss">
.muted {
  font-size: 12px;
  color: $bn-gray-500;
}

.hint {
  margin: 6px 0 0;
  font-size: 12px;
  color: $bn-gray-500;
}

.link-btn {
  font-size: 13px;
  color: $bn-gray-700;
  text-decoration: none;
}

.link-btn:hover {
  color: $bn-black;
  text-decoration: underline;
}
</style>
