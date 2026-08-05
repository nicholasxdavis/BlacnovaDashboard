<template>
  <div class="page">
    <PageHeader
      title="Billing"
      description="Stripe payments plus Buy Me a Coffee donations and memberships."
    >
      <template #actions>
        <el-button :loading="loading" @click="load">Refresh</el-button>
      </template>
    </PageHeader>

    <div v-loading="loading">
      <div class="section">
        <div class="section__title">Stripe</div>
        <p class="section__desc">Live balance, charges, and payouts</p>
        <div class="metric-grid">
          <MetricCard
            label="Available"
            :value="billing?.balance.available.formatted || '—'"
            delta="Stripe balance"
            trend="flat"
          />
          <MetricCard
            label="Pending"
            :value="billing?.balance.pending.formatted || '—'"
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
        <div class="surface">
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

        <div class="surface">
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
            :value="bmc?.balance.formatted || '—'"
            delta="All donations added up"
            trend="up"
          />
          <MetricCard
            label="Donations"
            :value="bmc?.donations.formatted || '—'"
            :delta="`${bmc?.donations.count ?? 0} entries`"
            trend="flat"
          />
          <MetricCard
            label="Memberships"
            :value="bmc?.memberships.formatted || '—'"
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

      <div class="surface section">
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
            <template #default="{ row }">{{ row.membershipLevel || '—' }}</template>
          </el-table-column>
          <el-table-column prop="message" label="Note" min-width="160">
            <template #default="{ row }">{{ row.message || '—' }}</template>
          </el-table-column>
          <el-table-column prop="formatted" label="Amount" width="120" />
          <el-table-column prop="status" label="Status" width="110" />
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import PageHeader from '@/components/PageHeader.vue'
import MetricCard from '@/components/MetricCard.vue'
import { api } from '@/lib/api'
import type { BillingOverview, BmcOverview } from '@/types'

const billing = ref<BillingOverview | null>(null)
const bmc = ref<BmcOverview | null>(null)
const loading = ref(false)

function formatDate(value: string) {
  return dayjs(value).format('MMM D, YYYY h:mm A')
}

async function load() {
  loading.value = true
  try {
    const [billingRes, bmcRes] = await Promise.all([
      api.get('/v1/admin/billing'),
      api.get('/v1/admin/bmc'),
    ])
    billing.value = billingRes.data
    bmc.value = bmcRes.data
  } catch (err: unknown) {
    const message =
      (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
      'Could not load billing'
    ElMessage.error(message)
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
</style>
