<template>
  <div class="page">
    <PageHeader
      title="Billing"
      description="Invoices for website management with Blacnova. Monthly invoices go out on the 1st."
    >
      <template #actions>
        <el-button :loading="loading" @click="load">Refresh</el-button>
      </template>
    </PageHeader>

    <div v-if="auth.isPlatform" class="platform-note surface-pad">
      Stripe balance and Buy Me a Coffee live under
      <router-link to="/finance">Finance</router-link>.
      Set client monthly fees under
      <router-link to="/clients">Clients</router-link>.
    </div>

    <div v-loading="loading">
      <div v-if="billing?.billingSuspended" class="suspend-banner surface-pad">
        <div class="suspend-banner__title">Your website is offline</div>
        <p>
          Two or more monthly invoices are past due. Pay open invoices below, then email
          <a href="mailto:nic@blacnova.net">nic@blacnova.net</a> to restore the site.
        </p>
      </div>

      <div
        v-else-if="billing && !billing.billingEnabled"
        class="info-banner surface-pad"
      >
        <div class="info-banner__title">Billing is not active yet</div>
        <p>
          When Blacnova enables monthly billing for your site, invoices will appear here and
          by email. Questions?
          <a href="mailto:nic@blacnova.net">nic@blacnova.net</a>
        </p>
      </div>

      <div class="metric-grid section">
        <MetricCard
          label="Monthly fee"
          :value="billing?.billingEnabled ? billing.monthlyFeeFormatted : 'Not set'"
          :delta="billing?.billingEnabled ? 'Billed on the 1st' : 'Ask Blacnova to enable'"
          trend="flat"
        />
        <MetricCard
          label="Next invoice"
          :value="billing?.nextBillLabel || '-'"
          delta="First of the month"
          trend="flat"
        />
        <MetricCard
          label="Past due"
          :value="billing?.missedInvoices ?? 0"
          :delta="
            (billing?.missedInvoices ?? 0) >= 2
              ? 'Site at risk of going offline'
              : 'Unpaid monthly invoices'
          "
          :trend="(billing?.missedInvoices ?? 0) > 0 ? 'down' : 'flat'"
        />
        <MetricCard
          label="Status"
          :value="statusLabel"
          :delta="statusDelta"
          trend="flat"
        />
      </div>

      <div class="surface table-scroll">
        <div class="surface-pad" style="padding-bottom: 8px">
          <div class="section__title">Invoices</div>
          <p class="section__desc">
            Pay open invoices online. A copy is also emailed to your billing address.
          </p>
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
import { useAuthStore } from '@/stores/auth'
import type { ClientBillingSummary, DashboardInvoice } from '@/types'

const auth = useAuthStore()
const billing = ref<ClientBillingSummary | null>(null)
const invoices = ref<DashboardInvoice[]>([])
const loading = ref(false)

const statusLabel = computed(() => {
  if (!billing.value) return '-'
  if (billing.value.billingSuspended) return 'Offline'
  if (!billing.value.billingEnabled) return 'Inactive'
  return 'Active'
})

const statusDelta = computed(() => {
  if (!billing.value?.billingEnabled) return 'Waiting on Blacnova'
  return billing.value.billingEmail || 'Uses your account email'
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
.platform-note,
.info-banner,
.suspend-banner {
  margin-bottom: 20px;
  border: $bn-border;
  border-radius: $bn-radius;
  font-size: 13px;
  color: $bn-gray-700;

  a {
    color: $bn-orange;
    text-decoration: underline;
  }

  p {
    margin: 6px 0 0;
    max-width: 62ch;
    color: $bn-gray-500;
  }
}

.platform-note,
.info-banner {
  background: $bn-white;
}

.suspend-banner {
  background: $bn-gray-100;
  border-color: $bn-gray-300;
}

.suspend-banner__title,
.info-banner__title {
  font-weight: 500;
  color: $bn-gray-900;
}
</style>
