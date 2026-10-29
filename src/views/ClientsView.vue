<template>
  <div class="page">
    <PageHeader
      title="Clients"
      description="Websites and client portals managed by Blacnova. Send intake links, open billing, or create dashboard logins."
    >
      <template #actions>
        <el-button type="primary" @click="openCreate">Add client</el-button>
      </template>
    </PageHeader>

    <div class="surface table-scroll">
      <el-table
        :data="clients"
        v-loading="loading"
        empty-text="No clients yet"
        class="clients-table"
        style="width: 100%"
      >
        <el-table-column prop="name" label="Client" min-width="140" show-overflow-tooltip />
        <el-table-column prop="domain" label="Domain" width="170" show-overflow-tooltip>
          <template #default="{ row }">
            <a :href="'https://' + row.domain" target="_blank" rel="noopener noreferrer">
              {{ row.domain }}
            </a>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Status" width="130">
          <template #default="{ row }">
            <el-select
              :model-value="row.status"
              size="small"
              class="status-select"
              @change="(v: string) => updateStatus(row, v)"
            >
              <el-option label="Live" value="live" />
              <el-option label="Maintenance" value="maintenance" />
              <el-option label="Offline" value="offline" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="Monthly" width="120" align="right">
          <template #default="{ row }">
            <div v-if="row.billingEnabled">
              ${{ (row.monthlyFeeCents / 100).toFixed(2) }}
              <div v-if="row.billingSuspended" class="badge-off">Suspended</div>
            </div>
            <span v-else class="muted">Off</span>
          </template>
        </el-table-column>
        <el-table-column prop="accountCount" label="Accounts" width="90" align="center" />
        <el-table-column label="" width="56" align="right" fixed="right">
          <template #default="{ row }">
            <el-dropdown trigger="click" @command="(cmd: string) => onClientMenu(cmd, row)">
              <button class="row-menu-btn" type="button" aria-label="Client actions" @click.stop>
                <PhDotsThreeVertical :size="18" />
              </button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="intake">Send intake</el-dropdown-item>
                  <el-dropdown-item command="copy-intake">Copy intake link</el-dropdown-item>
                  <el-dropdown-item command="dashboard">Create dashboard login</el-dropdown-item>
                  <el-dropdown-item command="billing">Billing</el-dropdown-item>
                  <el-dropdown-item divided command="delete">Delete</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dialogOpen" title="Add client website" width="460px" class="bn-dialog" destroy-on-close>
      <div class="ticket-form">
        <div>
          <label class="field-label">Name</label>
          <el-input v-model="form.name" placeholder="Acme Dental" />
        </div>
        <div>
          <label class="field-label">Domain</label>
          <el-input v-model="form.domain" placeholder="www.acme.com" />
        </div>
        <div>
          <label class="field-label">Contact email</label>
          <el-input v-model="form.contactEmail" type="email" placeholder="hello@acme.com" />
        </div>
        <div>
          <label class="field-label">GitHub repo (optional)</label>
          <el-input v-model="form.githubRepo" placeholder="org/repo" />
        </div>
        <label class="check-row">
          <el-switch v-model="form.sendIntake" />
          <span>Send website intake link</span>
        </label>
        <label class="check-row">
          <el-switch v-model="form.createDashboard" />
          <span>Create dashboard login and email welcome</span>
        </label>
      </div>
      <template #footer>
        <el-button @click="dialogOpen = false">Cancel</el-button>
        <el-button type="primary" :loading="saving" @click="createClient">Create</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="intakeOpen" title="Send intake" width="420px" destroy-on-close>
      <p class="section__desc" style="margin-bottom: 12px">
        Email a Blacnova intake form for
        <strong>{{ active?.name }}</strong>.
      </p>
      <div class="ticket-form">
        <div>
          <label class="field-label">Email</label>
          <el-input v-model="intakeForm.email" type="email" placeholder="client@email.com" />
        </div>
        <div>
          <label class="field-label">Name (optional)</label>
          <el-input v-model="intakeForm.name" />
        </div>
      </div>
      <template #footer>
        <el-button @click="intakeOpen = false">Cancel</el-button>
        <el-button type="primary" :loading="saving" @click="sendIntake">Send intake</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="accountOpen" title="Create dashboard login" width="420px" destroy-on-close>
      <p class="section__desc" style="margin-bottom: 12px">
        Create a portal login for <strong>{{ active?.name }}</strong>.
      </p>
      <div class="ticket-form">
        <div>
          <label class="field-label">Name</label>
          <el-input v-model="accountForm.name" />
        </div>
        <div>
          <label class="field-label">Email</label>
          <el-input v-model="accountForm.email" type="email" />
        </div>
        <label class="check-row">
          <el-switch v-model="accountForm.sendWelcome" />
          <span>Email welcome with a temporary password</span>
        </label>
        <div v-if="!accountForm.sendWelcome">
          <label class="field-label">Temporary password</label>
          <el-input v-model="accountForm.password" type="password" show-password />
        </div>
      </div>
      <template #footer>
        <el-button @click="accountOpen = false">Cancel</el-button>
        <el-button type="primary" :loading="saving" @click="createDashboardLogin">Create</el-button>
      </template>
    </el-dialog>

    <el-drawer
      v-model="billingOpen"
      :size="drawerSize"
      destroy-on-close
      class="billing-drawer"
    >
      <template #header>
        <div class="drawer-head">
          <div class="drawer-head__title">Client billing</div>
          <div v-if="active" class="drawer-head__sub">{{ active.name }}</div>
        </div>
      </template>

      <template v-if="active">
        <div class="ticket-form">
          <div v-if="active.billingSuspended" class="warn-note">
            Suspended for nonpayment.
            <el-button text type="primary" :loading="restoring" @click="restoreBilling">
              Restore site
            </el-button>
          </div>
          <div>
            <label class="field-label">Enable monthly billing</label>
            <el-switch v-model="billingForm.enabled" />
            <p class="hint">
              Invoices on the 1st (UTC) via Stripe + email. Two past-due months take the site offline.
              Minimum fee $0.50.
            </p>
          </div>
          <div>
            <label class="field-label">Monthly fee (USD)</label>
            <el-input-number
              v-model="billingForm.amount"
              :min="0"
              :step="25"
              :precision="2"
              :disabled="!billingForm.enabled"
              style="width: 100%"
            />
          </div>
          <div>
            <label class="field-label">Billing name</label>
            <el-input v-model="billingForm.name" placeholder="Defaults to client name" />
          </div>
          <div>
            <label class="field-label">Billing email</label>
            <el-input
              v-model="billingForm.email"
              type="email"
              placeholder="Defaults to primary account email"
            />
          </div>
          <p v-if="active.lastRetainerPeriod" class="hint">
            Last billed period: {{ active.lastRetainerPeriod }}
          </p>
          <div class="btn-row">
            <el-button type="primary" :loading="saving" @click="saveBilling">Save</el-button>
            <el-button
              :disabled="!billingForm.enabled || active.billingSuspended"
              :loading="billingNow"
              @click="billNow"
            >
              Bill this month now
            </el-button>
          </div>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { PhDotsThreeVertical } from '@phosphor-icons/vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageHeader from '@/components/PageHeader.vue'
import { api } from '@/lib/api'
import { clientIntakeUrl } from '@/lib/intake'
import type { AdminClient } from '@/types'

const clients = ref<AdminClient[]>([])
const loading = ref(false)
const dialogOpen = ref(false)
const billingOpen = ref(false)
const intakeOpen = ref(false)
const accountOpen = ref(false)
const saving = ref(false)
const restoring = ref(false)
const billingNow = ref(false)
const active = ref<AdminClient | null>(null)
const form = reactive({
  name: '',
  domain: '',
  githubRepo: '',
  contactEmail: '',
  sendIntake: true,
  createDashboard: false,
})
const intakeForm = reactive({ email: '', name: '' })
const accountForm = reactive({ name: '', email: '', password: '', sendWelcome: true })
const billingForm = reactive({ enabled: false, amount: 99, name: '', email: '' })
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
const drawerSize = computed(() => (windowWidth.value <= 900 ? '100%' : '420px'))

function onResize() {
  windowWidth.value = window.innerWidth
}

async function load() {
  loading.value = true
  try {
    const { data } = await api.get('/v1/admin/clients')
    clients.value = data.clients
  } catch {
    ElMessage.error('Could not load clients')
  } finally {
    loading.value = false
  }
}

function openCreate() {
  form.name = ''
  form.domain = ''
  form.githubRepo = ''
  form.contactEmail = ''
  form.sendIntake = true
  form.createDashboard = false
  dialogOpen.value = true
}

function onClientMenu(command: string, row: AdminClient) {
  if (command === 'intake') {
    active.value = row
    intakeForm.email = row.billingEmail || ''
    intakeForm.name = row.billingName || row.name
    intakeOpen.value = true
    return
  }
  if (command === 'copy-intake') {
    void copyIntake(row)
    return
  }
  if (command === 'dashboard') {
    active.value = row
    accountForm.name = row.billingName || row.name
    accountForm.email = row.billingEmail || ''
    accountForm.password = ''
    accountForm.sendWelcome = true
    accountOpen.value = true
    return
  }
  if (command === 'billing') {
    openBilling(row)
    return
  }
  if (command === 'delete') {
    void removeClient(row)
  }
}

async function copyIntake(row: AdminClient) {
  try {
    await navigator.clipboard.writeText(clientIntakeUrl(row.name))
    ElMessage.success('Intake link copied')
  } catch {
    ElMessage.error('Could not copy link')
  }
}

async function sendIntake() {
  if (!active.value) return
  if (!intakeForm.email.trim()) {
    ElMessage.error('Email is required')
    return
  }
  saving.value = true
  try {
    await api.post(`/v1/admin/clients/${active.value.id}/send-intake`, {
      email: intakeForm.email.trim().toLowerCase(),
      name: intakeForm.name.trim() || undefined,
    })
    intakeOpen.value = false
    ElMessage.success('Intake emailed')
    await load()
  } catch (err: unknown) {
    const message =
      (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
      'Could not send intake'
    ElMessage.error(message)
  } finally {
    saving.value = false
  }
}

async function createDashboardLogin() {
  if (!active.value) return
  if (!accountForm.name.trim() || !accountForm.email.trim()) {
    ElMessage.error('Name and email are required')
    return
  }
  if (!accountForm.sendWelcome && accountForm.password.length < 12) {
    ElMessage.error('Password must be at least 12 characters')
    return
  }
  saving.value = true
  try {
    const { data } = await api.post('/v1/admin/accounts', {
      name: accountForm.name.trim(),
      email: accountForm.email.trim().toLowerCase(),
      websiteId: active.value.id,
      role: 'manager',
      sendWelcome: accountForm.sendWelcome,
      password: accountForm.sendWelcome ? undefined : accountForm.password,
    })
    accountOpen.value = false
    if (data.welcomeSent === false) {
      ElMessage.warning('Account created, but the welcome email did not send')
    } else {
      ElMessage.success(accountForm.sendWelcome ? 'Account created and welcome emailed' : 'Account created')
    }
    await load()
  } catch (err: unknown) {
    const message =
      (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
      'Could not create account'
    ElMessage.error(message)
  } finally {
    saving.value = false
  }
}

function openBilling(row: AdminClient) {
  active.value = row
  billingForm.enabled = row.billingEnabled
  billingForm.amount = (row.monthlyFeeCents || 0) / 100
  billingForm.name = row.billingName || ''
  billingForm.email = row.billingEmail || ''
  billingOpen.value = true
}

async function saveBilling() {
  if (!active.value) return
  if (billingForm.enabled && billingForm.amount < 0.5) {
    ElMessage.error('Monthly fee must be at least $0.50 when billing is enabled')
    return
  }
  saving.value = true
  try {
    await api.patch(`/v1/admin/clients/${active.value.id}`, {
      billingEnabled: billingForm.enabled,
      monthlyFeeCents: Math.round(billingForm.amount * 100),
      billingName: billingForm.name.trim() || null,
      billingEmail: billingForm.email.trim() || null,
    })
    ElMessage.success('Billing updated')
    billingOpen.value = false
    await load()
  } catch (err: unknown) {
    const message =
      (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
      'Could not save billing'
    ElMessage.error(message)
  } finally {
    saving.value = false
  }
}

async function billNow() {
  if (!active.value) return
  billingNow.value = true
  try {
    const { data } = await api.patch(`/v1/admin/clients/${active.value.id}/bill-now`)
    if (data.skipped) {
      ElMessage.info(
        data.skipped === 'already_billed' || data.skipped === 'period_exists'
          ? 'Already billed for this month'
          : `Skipped: ${data.skipped}`,
      )
    } else {
      ElMessage.success('Invoice created and emailed')
    }
    await load()
    const updated = clients.value.find((c) => c.id === active.value?.id)
    if (updated) active.value = updated
  } catch (err: unknown) {
    const message =
      (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
      'Could not create invoice'
    ElMessage.error(message)
  } finally {
    billingNow.value = false
  }
}

async function restoreBilling() {
  if (!active.value) return
  restoring.value = true
  try {
    await api.patch(`/v1/admin/clients/${active.value.id}/restore-billing`)
    ElMessage.success('Site restored')
    await load()
    const updated = clients.value.find((c) => c.id === active.value?.id)
    if (updated) active.value = updated
  } catch (err: unknown) {
    const message =
      (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
      'Could not restore'
    ElMessage.error(message)
  } finally {
    restoring.value = false
  }
}

async function createClient() {
  if (!form.name.trim() || !form.domain.trim()) {
    ElMessage.error('Name and domain are required')
    return
  }
  if ((form.sendIntake || form.createDashboard) && !form.contactEmail.trim()) {
    ElMessage.error('Contact email is required to send intake or create a dashboard login')
    return
  }
  saving.value = true
  try {
    const { data } = await api.post('/v1/admin/clients', {
      name: form.name.trim(),
      domain: form.domain.trim().toLowerCase(),
      githubRepo: form.githubRepo.trim() || undefined,
      contactEmail: form.contactEmail.trim() || undefined,
      sendIntake: form.sendIntake,
      createDashboard: form.createDashboard,
      sendWelcome: form.createDashboard,
    })
    dialogOpen.value = false
    if (form.sendIntake && data.intakeSent === false) {
      ElMessage.warning('Client created, but the intake email did not send')
    } else if (form.createDashboard && data.welcomeSent === false) {
      ElMessage.warning('Client created, but the welcome email did not send')
    } else {
      ElMessage.success('Client created')
    }
    await load()
  } catch (err: unknown) {
    const message =
      (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
      'Could not create client'
    ElMessage.error(message)
  } finally {
    saving.value = false
  }
}

async function updateStatus(row: AdminClient, status: string) {
  if (status === row.status) return
  try {
    await api.patch(`/v1/admin/clients/${row.id}`, { status })
    row.status = status
    ElMessage.success('Status updated')
  } catch (err: unknown) {
    const message =
      (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
      'Could not update status'
    ElMessage.error(message)
  }
}

async function removeClient(row: AdminClient) {
  try {
    await ElMessageBox.confirm(
      `Delete ${row.name} and all related accounts/content? This cannot be undone.`,
      'Delete client',
      { type: 'warning', confirmButtonText: 'Delete', confirmButtonClass: 'el-button--danger' },
    )
    await api.delete(`/v1/admin/clients/${row.id}`)
    ElMessage.success('Client deleted')
    await load()
  } catch (err: unknown) {
    if ((err as { response?: unknown })?.response) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Could not delete client'
      ElMessage.error(message)
    }
  }
}

onMounted(() => {
  window.addEventListener('resize', onResize, { passive: true })
  void load()
})
onUnmounted(() => window.removeEventListener('resize', onResize))
</script>

<style scoped lang="scss">
.clients-table {
  :deep(th .cell) {
    white-space: nowrap;
  }

  :deep(.status-select) {
    width: 100%;
    max-width: 140px;
  }
}

.row-menu-btn {
  border: none;
  background: transparent;
  width: 32px;
  height: 32px;
  border-radius: $bn-radius-sm;
  display: grid;
  place-items: center;
  cursor: pointer;
  color: $bn-gray-700;
}

.row-menu-btn:hover {
  background: $bn-gray-100;
  color: $bn-black;
}

.check-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: $bn-gray-700;
  cursor: pointer;
}

.muted {
  color: $bn-gray-400;
  font-size: 13px;
}

.badge-off {
  font-size: 11px;
  color: $bn-gray-500;
  margin-top: 2px;
}

.hint {
  margin: 6px 0 0;
  font-size: 12px;
  color: $bn-gray-500;
}

.warn-note {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: $bn-gray-100;
  border-radius: $bn-radius-sm;
  font-size: 13px;
}

.drawer-head__title {
  font-weight: 500;
  font-size: 16px;
}

.drawer-head__sub {
  margin-top: 2px;
  font-size: 13px;
  color: $bn-gray-500;
}
</style>
