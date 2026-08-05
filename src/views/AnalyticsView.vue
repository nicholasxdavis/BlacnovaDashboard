<template>
  <div class="page">
    <PageHeader
      title="Analytics"
      description="Live traffic for www.blacnova.net via Cloudflare Workers analytics."
    >
      <template #actions>
        <el-select v-model="range" style="width: 160px">
          <el-option label="All recorded" value="all" />
          <el-option label="Last 5 weeks" value="5w" />
          <el-option label="Last 30 days" value="30d" />
        </el-select>
      </template>
    </PageHeader>

    <div class="metric-grid section">
      <MetricCard
        label="Visitors"
        :value="totals.visitors.toLocaleString()"
        :delta="websiteStore.deltas.visitors.label"
        :trend="websiteStore.deltas.visitors.trend"
      />
      <MetricCard
        label="Page views"
        :value="totals.pageviews.toLocaleString()"
        :delta="websiteStore.deltas.pageviews.label"
        :trend="websiteStore.deltas.pageviews.trend"
      />
      <MetricCard
        label="Form submissions"
        :value="totals.submissions"
        :delta="websiteStore.deltas.submissions.label"
        :trend="websiteStore.deltas.submissions.trend"
        accent
      />
      <MetricCard
        label="Avg. pages / visit"
        :value="avgPages"
        delta="From live Cloudflare-backed tracking"
        trend="flat"
      />
    </div>

    <div class="charts section">
      <div class="chart-panel">
        <div class="section__title">Visitors over time</div>
        <p class="section__desc">How many people visited your website</p>
        <BnChart :option="visitorOption" />
      </div>
      <div class="chart-panel">
        <div class="section__title">Form submissions</div>
        <p class="section__desc">Inquiries received through your website forms</p>
        <BnChart :option="submissionOption" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import dayjs from 'dayjs'
import PageHeader from '@/components/PageHeader.vue'
import MetricCard from '@/components/MetricCard.vue'
import BnChart from '@/components/BnChart.vue'
import { useWebsiteStore } from '@/stores/website'

const websiteStore = useWebsiteStore()
const range = ref('all')

const series = computed(() => {
  const all = websiteStore.analytics
  if (range.value === '30d') {
    const cutoff = dayjs().subtract(30, 'day')
    return all.filter((p) => dayjs(p.date).isAfter(cutoff) || dayjs(p.date).isSame(cutoff, 'day'))
  }
  if (range.value === '5w') return all.slice(-5)
  return all
})

const totals = computed(() =>
  series.value.reduce(
    (acc, point) => ({
      visitors: acc.visitors + point.visitors,
      pageviews: acc.pageviews + point.pageviews,
      submissions: acc.submissions + point.submissions,
    }),
    { visitors: 0, pageviews: 0, submissions: 0 },
  ),
)

const avgPages = computed(() => {
  if (!totals.value.visitors) return '0'
  return (totals.value.pageviews / totals.value.visitors).toFixed(1)
})

const labels = computed(() => series.value.map((p) => dayjs(p.date).format('MMM D')))

const chartTooltip = {
  trigger: 'axis' as const,
  backgroundColor: '#fff',
  borderColor: '#e5e5e5',
  borderWidth: 1,
  textStyle: { color: '#1a1a1a', fontSize: 12 },
}

const visitorOption = computed(() => ({
  color: ['#111111', '#8a8a8a'],
  legend: {
    data: ['Visitors', 'Page views'],
    bottom: 0,
    icon: 'circle',
    itemWidth: 8,
    itemHeight: 8,
    textStyle: { color: '#6b6b6b', fontSize: 12 },
  },
  grid: { left: 40, right: 12, top: 16, bottom: 44 },
  tooltip: chartTooltip,
  xAxis: {
    type: 'category' as const,
    data: labels.value,
    axisLine: { lineStyle: { color: '#e5e5e5' } },
    axisTick: { show: false },
    axisLabel: { color: '#8a8a8a', fontSize: 11 },
  },
  yAxis: {
    type: 'value' as const,
    splitLine: { lineStyle: { color: '#f2f2f2', type: 'dashed' as const } },
    axisLabel: { color: '#8a8a8a', fontSize: 11 },
  },
  series: [
    {
      name: 'Visitors',
      type: 'line' as const,
      smooth: 0.35,
      symbolSize: 5,
      data: series.value.map((p) => p.visitors),
      lineStyle: { width: 2 },
    },
    {
      name: 'Page views',
      type: 'line' as const,
      smooth: 0.35,
      symbolSize: 5,
      data: series.value.map((p) => p.pageviews),
      lineStyle: { width: 2 },
    },
  ],
}))

const submissionOption = computed(() => ({
  color: ['#d4611c'],
  grid: { left: 36, right: 12, top: 16, bottom: 28 },
  tooltip: chartTooltip,
  xAxis: {
    type: 'category' as const,
    data: labels.value,
    axisLine: { lineStyle: { color: '#e5e5e5' } },
    axisTick: { show: false },
    axisLabel: { color: '#8a8a8a', fontSize: 11 },
  },
  yAxis: {
    type: 'value' as const,
    minInterval: 1,
    splitLine: { lineStyle: { color: '#f2f2f2', type: 'dashed' as const } },
    axisLabel: { color: '#8a8a8a', fontSize: 11 },
  },
  series: [
    {
      name: 'Submissions',
      type: 'bar' as const,
      barWidth: 24,
      data: series.value.map((p) => p.submissions),
      itemStyle: { borderRadius: [2, 2, 0, 0] },
    },
  ],
}))
</script>

<style scoped lang="scss">
.charts {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 28px;
}

.chart-panel {
  min-width: 0;
}

@media (max-width: 1000px) {
  .charts {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}
</style>
