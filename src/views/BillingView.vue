<template>
  <div class="page">
    <PageHeader
      title="Billing"
      description="Live Stripe balance, charges, and payouts for Blacnova."
    >
      <template #actions>
        <el-button :loading="loading" @click="load">Refresh</el-button>
      </template>
    </PageHeader>

    <div v-loading="loading">
      <div class="metric-grid section">
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
import type { BillingOverview } from '@/types'

const billing = ref<BillingOverview | null>(null)
const loading = ref(false)

function formatDate(value: string) {
  return dayjs(value).format('MMM D, YYYY h:mm A')
}

async function load() {
  loading.value = true
  try {
    const { data } = await api.get('/v1/admin/billing')
    billing.value = data
  } catch (err: unknown) {
    const message =
      (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
      'Could not load Stripe billing'
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
</style>
