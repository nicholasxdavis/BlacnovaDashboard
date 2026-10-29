<template>
  <div class="page">
    <PageHeader
      title="Finance"
      description="Stripe, client invoices, and Buy Me a Coffee. Monthly retainers are set under Clients → Billing."
    >
      <template #actions>
        <el-button :loading="loading" @click="load">Refresh</el-button>
      </template>
    </PageHeader>

    <el-tabs v-model="tab" class="finance-tabs">
      <el-tab-pane label="Overview" name="overview">
        <div v-loading="loading">
          <div class="section">
            <div class="section__title">Client invoices</div>
            <p class="section__desc">
              What clients owe and what you collect. Open the Invoices tab to send or schedule bills.
            </p>
            <div class="metric-grid">
              <MetricCard
                label="Collected"
                :value="invoiceSummary?.paidFormatted || '-'"
                :delta="`${invoiceSummary?.paidCount ?? 0} paid`"
                trend="flat"
              />
              <MetricCard
                label="Outstanding"
                :value="invoiceSummary?.openFormatted || '-'"
                :delta="`${invoiceSummary?.openCount ?? 0} open`"
                trend="flat"
              />
              <MetricCard
                label="Expected monthly"
                :value="invoiceSummary?.expectedMonthlyFormatted || '-'"
                :delta="`${invoiceSummary?.retainerClients ?? 0} retainers · ${invoiceSummary?.recurringActive ?? 0} recurring`"
                trend="flat"
              />
              <MetricCard
                label="Billed"
                :value="invoiceSummary?.billedFormatted || '-'"
                :delta="`${invoiceSummary?.invoiceCount ?? 0} invoices`"
                trend="flat"
              />
            </div>
            <div class="section-link">
              <el-button text @click="tab = 'invoices'">View invoices</el-button>
            </div>
          </div>

          <div class="section">
            <div class="section__title">Stripe</div>
            <p class="section__desc">Live balance, charges, and payouts</p>
            <div class="metric-grid">
              <MetricCard
                label="Available"
                :value="billing?.balance.available.formatted || '-'"
                delta="Stripe balance"
                trend="flat"
              />
              <MetricCard
                label="Pending"
                :value="billing?.balance.pending.formatted || '-'"
                delta="Awaiting payout"
                trend="flat"
              />
              <MetricCard
                label="Recent charges"
                :value="billing?.charges.length ?? 0"
                delta="Last 15 from Stripe"
                trend="flat"
              />
              <MetricCard
                label="Recent payouts"
                :value="billing?.payouts.length ?? 0"
                delta="Last 8 from Stripe"
                trend="flat"
              />
            </div>
          </div>

          <div class="billing-grid section">
            <div class="surface table-scroll">
              <div class="surface-pad" style="padding-bottom: 8px">
                <div class="section__title">Charges</div>
                <p class="section__desc">Latest payments from Stripe</p>
              </div>
              <el-table :data="billing?.charges || []" empty-text="No charges yet">
                <el-table-column prop="createdAt" label="Date" width="160">
                  <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
                </el-table-column>
                <el-table-column prop="customer" label="Customer" min-width="140" />
                <el-table-column prop="description" label="Description" min-width="160" />
                <el-table-column prop="formatted" label="Amount" width="120" />
                <el-table-column prop="status" label="Status" width="110" />
              </el-table>
            </div>

            <div class="surface table-scroll">
              <div class="surface-pad" style="padding-bottom: 8px">
                <div class="section__title">Payouts</div>
                <p class="section__desc">Transfers to your bank</p>
              </div>
              <el-table :data="billing?.payouts || []" empty-text="No payouts yet">
                <el-table-column prop="arrivalDate" label="Arrival" width="120" />
                <el-table-column prop="formatted" label="Amount" width="120" />
                <el-table-column prop="status" label="Status" width="110" />
                <el-table-column prop="id" label="Payout ID" min-width="160" />
              </el-table>
            </div>
          </div>

          <div class="section">
            <div class="section__title">Buy Me a Coffee</div>
            <p class="section__desc">
              Outstanding balance is the sum of donations and memberships (you don’t spend from here).
            </p>
            <div class="metric-grid">
              <MetricCard
                label="Outstanding balance"
                :value="bmc?.balance.formatted || '-'"
                delta="All donations added up"
                trend="up"
              />
              <MetricCard
                label="Donations"
                :value="bmc?.donations.formatted || '-'"
                :delta="`${bmc?.donations.count ?? 0} entries`"
                trend="flat"
              />
              <MetricCard
                label="Memberships"
                :value="bmc?.memberships.formatted || '-'"
                :delta="`${bmc?.memberships.count ?? 0} entries`"
                trend="flat"
              />
              <MetricCard
                label="Activity"
                :value="bmc?.entries.length ?? 0"
                delta="Recent events shown"
                trend="flat"
              />
            </div>
          </div>

          <div class="surface section table-scroll">
            <div class="surface-pad" style="padding-bottom: 8px">
              <div class="section__title">Supporters &amp; memberships</div>
              <p class="section__desc">
                Live from webhooks. Webhook URL:
                <code class="inline-code">{{ bmc?.webhookUrl }}</code>
              </p>
            </div>
            <el-table :data="bmc?.entries || []" empty-text="No Buy Me a Coffee activity yet">
              <el-table-column prop="occurredAt" label="Date" width="160">
                <template #default="{ row }">{{ formatDate(row.occurredAt) }}</template>
              </el-table-column>
              <el-table-column prop="supporterName" label="Supporter" min-width="140">
                <template #default="{ row }">
                  <div>{{ row.supporterName }}</div>
                  <div v-if="row.supporterEmail" class="muted">{{ row.supporterEmail }}</div>
                </template>
              </el-table-column>
              <el-table-column prop="kind" label="Type" width="120" />
              <el-table-column prop="membershipLevel" label="Level" width="120">
                <template #default="{ row }">{{ row.membershipLevel || '-' }}</template>
              </el-table-column>
              <el-table-column prop="message" label="Note" min-width="160">
                <template #default="{ row }">{{ row.message || '-' }}</template>
              </el-table-column>
              <el-table-column prop="formatted" label="Amount" width="120" />
              <el-table-column prop="status" label="Status" width="110" />
            </el-table>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="Invoices" name="invoices" lazy>
        <InvoicesPanel />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import PageHeader from '@/components/PageHeader.vue'
import MetricCard from '@/components/MetricCard.vue'
import InvoicesPanel from '@/components/InvoicesPanel.vue'
import { api } from '@/lib/api'
import type { BillingOverview, BmcOverview, InvoiceSummary } from '@/types'

const route = useRoute()
const router = useRouter()
const tab = ref(route.query.tab === 'invoices' ? 'invoices' : 'overview')
const billing = ref<BillingOverview | null>(null)
const bmc = ref<BmcOverview | null>(null)
const invoiceSummary = ref<InvoiceSummary | null>(null)
const loading = ref(false)

function formatDate(value: string) {
  return dayjs(value).format('MMM D, YYYY h:mm A')
}

watch(tab, (name) => {
  const wantsInvoices = name === 'invoices'
  const hasInvoices = route.query.tab === 'invoices'
  if (wantsInvoices === hasInvoices) return
  router.replace({ query: wantsInvoices ? { tab: 'invoices' } : {} })
})

watch(
  () => route.query.tab,
  (value) => {
    const next = value === 'invoices' ? 'invoices' : 'overview'
    if (tab.value !== next) tab.value = next
  },
)

async function load() {
  loading.value = true
  try {
    const [billingRes, bmcRes, invRes] = await Promise.allSettled([
      api.get('/v1/admin/billing'),
      api.get('/v1/admin/bmc'),
      api.get('/v1/admin/invoices'),
    ])
    if (billingRes.status === 'fulfilled') {
      billing.value = billingRes.value.data
    } else {
      billing.value = null
      ElMessage.error('Could not load Stripe finance')
    }
    if (bmcRes.status === 'fulfilled') {
      bmc.value = bmcRes.value.data
    } else {
      bmc.value = null
      ElMessage.error('Could not load Buy Me a Coffee')
    }
    if (invRes.status === 'fulfilled') {
      invoiceSummary.value = invRes.value.data.summary || null
    } else {
      invoiceSummary.value = null
      ElMessage.error('Could not load client invoices')
    }
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped lang="scss">
.billing-grid {
  display: grid;
  gap: 16px;
}

.muted {
  font-size: 12px;
  color: $bn-gray-500;
}

.inline-code {
  font-size: 12px;
  word-break: break-all;
  color: $bn-gray-700;
}

.section-link {
  margin-top: 10px;
}

.finance-tabs :deep(.el-tabs__header) {
  margin-bottom: 18px;
}
</style>
