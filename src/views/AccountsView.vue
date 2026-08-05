<template>
  <div class="page">
    <PageHeader
      title="Accounts"
      description="Dashboard logins for client portals. Create, deactivate, or reset passwords."
    >
      <template #actions>
        <el-button type="primary" @click="openCreate">Create account</el-button>
      </template>
    </PageHeader>

    <div class="surface table-scroll">
      <el-table :data="accounts" v-loading="loading" empty-text="No accounts yet" style="width: 100%">
        <el-table-column prop="name" label="Name" min-width="120" />
        <el-table-column prop="email" label="Email" width="200" show-overflow-tooltip />
        <el-table-column label="Website" width="150" show-overflow-tooltip>
          <template #default="{ row }">
            <div>{{ row.websiteName || '—' }}</div>
            <div class="muted">{{ row.websiteDomain }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="role" label="Role" width="100" />
        <el-table-column label="Status" width="100">
          <template #default="{ row }">
            <span :class="row.active ? 'status-dot status-dot--ok' : 'status-dot status-dot--off'">
              {{ row.active ? 'Active' : 'Off' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="" width="240" align="right">
          <template #default="{ row }">
            <el-button text @click="openReset(row)">Reset password</el-button>
            <el-button
              v-if="row.id !== auth.user?.id"
              text
              @click="toggleActive(row)"
            >
              {{ row.active ? 'Deactivate' : 'Activate' }}
            </el-button>
            <el-button
              v-if="row.id !== auth.user?.id"
              text
              type="danger"
              @click="removeAccount(row)"
            >
              Delete
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="createOpen" title="Create dashboard account" width="440px" destroy-on-close>
      <div class="ticket-form">
        <div>
          <label class="field-label">Name</label>
          <el-input v-model="createForm.name" />
        </div>
        <div>
          <label class="field-label">Email</label>
          <el-input v-model="createForm.email" type="email" />
        </div>
        <div>
          <label class="field-label">Temporary password</label>
          <el-input v-model="createForm.password" type="password" show-password />
        </div>
        <div>
          <label class="field-label">Client website</label>
          <el-select v-model="createForm.websiteId" style="width: 100%" filterable>
            <el-option
              v-for="c in clients"
              :key="c.id"
              :label="`${c.name} (${c.domain})`"
              :value="c.id"
            />
          </el-select>
        </div>
        <div>
          <label class="field-label">Role</label>
          <el-select v-model="createForm.role" style="width: 100%">
            <el-option label="Website manager" value="manager" />
            <el-option label="Platform admin" value="platform" />
          </el-select>
        </div>
      </div>
      <template #footer>
        <el-button @click="createOpen = false">Cancel</el-button>
        <el-button type="primary" :loading="saving" @click="createAccount">Create</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="resetOpen" title="Reset password" width="400px" destroy-on-close>
      <p class="section__desc" style="margin-bottom: 12px">
        Set a new password for <strong>{{ resetTarget?.email }}</strong>.
      </p>
      <el-input v-model="resetPassword" type="password" show-password placeholder="New password" />
      <template #footer>
        <el-button @click="resetOpen = false">Cancel</el-button>
        <el-button type="primary" :loading="saving" @click="resetPasswordSubmit">Update</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageHeader from '@/components/PageHeader.vue'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import type { AdminAccount, AdminClient } from '@/types'

const auth = useAuthStore()
const accounts = ref<AdminAccount[]>([])
const clients = ref<AdminClient[]>([])
const loading = ref(false)
const saving = ref(false)
const createOpen = ref(false)
const resetOpen = ref(false)
const resetTarget = ref<AdminAccount | null>(null)
const resetPassword = ref('')
const createForm = reactive({
  name: '',
  email: '',
  password: '',
  websiteId: '',
  role: 'manager',
})

async function load() {
  loading.value = true
  try {
    const [accountsRes, clientsRes] = await Promise.all([
      api.get('/v1/admin/accounts'),
      api.get('/v1/admin/clients'),
    ])
    accounts.value = accountsRes.data.accounts
    clients.value = clientsRes.data.clients
  } catch {
    ElMessage.error('Could not load accounts')
  } finally {
    loading.value = false
  }
}

function openCreate() {
  createForm.name = ''
  createForm.email = ''
  createForm.password = ''
  createForm.websiteId = clients.value[0]?.id || ''
  createForm.role = 'manager'
  createOpen.value = true
}

async function createAccount() {
  if (!createForm.name || !createForm.email || !createForm.password || !createForm.websiteId) {
    ElMessage.error('Fill in all fields')
    return
  }
  saving.value = true
  try {
    await api.post('/v1/admin/accounts', { ...createForm })
    createOpen.value = false
    ElMessage.success('Account created')
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

function openReset(row: AdminAccount) {
  resetTarget.value = row
  resetPassword.value = ''
  resetOpen.value = true
}

async function resetPasswordSubmit() {
  if (!resetTarget.value || resetPassword.value.length < 4) {
    ElMessage.error('Password must be at least 4 characters')
    return
  }
  saving.value = true
  try {
    await api.post(`/v1/admin/accounts/${resetTarget.value.id}/reset-password`, {
      password: resetPassword.value,
    })
    resetOpen.value = false
    ElMessage.success('Password updated')
  } catch (err: unknown) {
    const message =
      (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
      'Could not reset password'
    ElMessage.error(message)
  } finally {
    saving.value = false
  }
}

async function toggleActive(row: AdminAccount) {
  try {
    await api.patch(`/v1/admin/accounts/${row.id}`, { active: !row.active })
    ElMessage.success(row.active ? 'Account deactivated' : 'Account activated')
    await load()
  } catch {
    ElMessage.error('Could not update account')
  }
}

async function removeAccount(row: AdminAccount) {
  try {
    await ElMessageBox.confirm(`Delete account ${row.email}?`, 'Delete account', {
      type: 'warning',
      confirmButtonText: 'Delete',
    })
    await api.delete(`/v1/admin/accounts/${row.id}`)
    ElMessage.success('Account deleted')
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
</style>
