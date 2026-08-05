<template>
  <div class="page">
    <PageHeader
      title="Clients"
      description="Websites and client portals managed by Blacnova."
    >
      <template #actions>
        <el-button type="primary" @click="openCreate">Add client</el-button>
      </template>
    </PageHeader>

    <div class="surface table-scroll">
      <el-table :data="clients" v-loading="loading" empty-text="No clients yet">
        <el-table-column prop="name" label="Client" min-width="160" />
        <el-table-column prop="domain" label="Domain" min-width="180">
          <template #default="{ row }">
            <a :href="'https://' + row.domain" target="_blank" rel="noopener noreferrer">
              {{ row.domain }}
            </a>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Status" width="150">
          <template #default="{ row }">
            <el-select
              :model-value="row.status"
              size="small"
              style="width: 128px"
              @change="(value: string) => updateStatus(row, value)"
            >
              <el-option label="Live" value="live" />
              <el-option label="Maintenance" value="maintenance" />
              <el-option label="Offline" value="offline" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="accountCount" label="Accounts" width="100" />
        <el-table-column prop="newSubmissions" label="New leads" width="110" />
        <el-table-column label="" width="100" align="right">
          <template #default="{ row }">
            <el-button text type="danger" @click="removeClient(row)">Delete</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dialogOpen" title="Add client website" width="440px" class="bn-dialog" destroy-on-close>
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
          <label class="field-label">GitHub repo (optional)</label>
          <el-input v-model="form.githubRepo" placeholder="org/repo" />
        </div>
      </div>
      <template #footer>
        <el-button @click="dialogOpen = false">Cancel</el-button>
        <el-button type="primary" :loading="saving" @click="createClient">Create</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageHeader from '@/components/PageHeader.vue'
import { api } from '@/lib/api'
import type { AdminClient } from '@/types'

const clients = ref<AdminClient[]>([])
const loading = ref(false)
const dialogOpen = ref(false)
const saving = ref(false)
const form = reactive({ name: '', domain: '', githubRepo: '' })

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
  dialogOpen.value = true
}

async function createClient() {
  if (!form.name.trim() || !form.domain.trim()) {
    ElMessage.error('Name and domain are required')
    return
  }
  saving.value = true
  try {
    await api.post('/v1/admin/clients', {
      name: form.name.trim(),
      domain: form.domain.trim().toLowerCase(),
      githubRepo: form.githubRepo.trim() || undefined,
    })
    dialogOpen.value = false
    ElMessage.success('Client created')
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
      { type: 'warning', confirmButtonText: 'Delete' },
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

onMounted(load)
</script>
