<template>
  <div class="page">
    <PageHeader
      title="Billing"
      description="Invoices for website management with Blacnova. Bills on the 1st of each month."
    >
      <template #actions>
        <el-button :loading="loading" @click="load">Refresh</el-button>
      </template>
    </PageHeader>

    <div v-loading="loading">
      <div v-if="billing?.billingSuspended" class="suspend-banner surface-pad">
        <div class="suspend-banner__title">Website unpublished for nonpayment</div>
        <p>
          Two or more monthly invoices are past due. Pay open invoices below, then email
          nic@blacnova.net to restore the site.
        </p>
      </div>

      <div class="metric-grid section">
        <MetricCard
          label="Monthly fee"
          :value="billing?.billingEnabled ? billing.monthlyFeeFormatted : 'Not set'"
          :delta="billing?.billingEnabled ? 'Due on the 1st' : 'Contact Blacnova to enable'"
          trend="flat"
        />
        <MetricCard
          label="Next bill"
          :value="billing?.nextBillLabel || '-'"
          delta="UTC billing calendar"
          trend="flat"
        />
        <MetricCard
          label="Past due"
          :value="billing?.missedInvoices ?? 0"
          :delta="(billing?.missedInvoices ?? 0) >= 2 ? 'Suspension threshold' : 'Open retainers'"
          :trend="(billing?.missedInvoices ?? 0) > 0 ? 'down' : 'flat'"
        />
        <MetricCard
          label="Status"
          :value="statusLabel"
          :delta="billing?.billingEmail || 'Uses account email'"
          trend="flat"
        />
      </div>

      <div class="surface table-scroll">
        <div class="surface-pad" style="padding-bottom: 8px">
          <div class="section__title">Invoices</div>
          <p class="section__desc">Pay open invoices online. Email copies are also sent to your billing address.</p>
        </div>
        <el-table :data="invoices" empty-text="No invoices yet">
          <el-table-column prop="createdAt" label="Date" width="150">
            <template #default="{ row }">{{ formatDate(row.sentAt || row.createdAt) }}</template>
          </el-table-column>
          <el-table-column prop="description" label="Description" min-width="200" />
          <el-table-column prop="formatted" label="Amount" width="110" />
          <el-table-column label="Type" width="100">
            <template #default="{ row }">
              {{ row.kind === 'retainer' ? 'Monthly' : 'Invoice' }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="Status" width="110" />
          <el-table-column label="" width="100" align="right">
            <template #default="{ row }">
              <a
                v-if="row.hostedInvoiceUrl && row.status !== 'paid' && row.status !== 'void'"
                class="link-btn"
                :href="row.hostedInvoiceUrl"
                target="_blank"
                rel="noopener noreferrer"
              >
                Pay
              </a>
              <a
                v-else-if="row.hostedInvoiceUrl"
                class="link-btn"
                :href="row.hostedInvoiceUrl"
                target="_blank"
                rel="noopener noreferrer"
              >
                View
              </a>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import PageHeader from '@/components/PageHeader.vue'
import MetricCard from '@/components/MetricCard.vue'
import { api } from '@/lib/api'
import type { ClientBillingSummary, DashboardInvoice } from '@/types'

const billing = ref<ClientBillingSummary | null>(null)
const invoices = ref<DashboardInvoice[]>([])
const loading = ref(false)

const statusLabel = computed(() => {
  if (!billing.value) return '-'
  if (billing.value.billingSuspended) return 'Suspended'
  if (!billing.value.billingEnabled) return 'Inactive'
  return 'Active'
})

function formatDate(value: string) {
  return dayjs(value).format('MMM D, YYYY')
}

async function load() {
  loading.value = true
  try {
    const { data } = await api.get('/v1/billing')
    billing.value = data.billing
    invoices.value = data.invoices || []
  } catch {
    ElMessage.error('Could not load billing')
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped lang="scss">
.suspend-banner {
  margin-bottom: 20px;
  background: $bn-gray-100;
  border: $bn-border;
  border-radius: $bn-radius;

  p {
    margin: 6px 0 0;
    color: $bn-gray-500;
    font-size: 13px;
    max-width: 60ch;
  }
}

.suspend-banner__title {
  font-weight: 500;
  color: $bn-gray-900;
}
</style>
