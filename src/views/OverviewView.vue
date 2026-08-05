<template>
  <div class="page">
    <PageHeader
      title="Overview"
      description="A quick look at your website status and what needs attention."
    />

    <div v-if="websiteStore.maintenance.enabled" class="maint-banner section">
      <PhWrench :size="18" />
      <div class="maint-banner__text">
        <strong>Maintenance mode is on.</strong>
        Visitors currently see your maintenance page.
      </div>
      <el-button size="small" @click="router.push('/maintenance')">Manage</el-button>
    </div>

    <div class="metric-grid section">
      <MetricCard
        label="Visitors (last 7 days)"
        :value="latest.visitors.toLocaleString()"
        delta="+4.8% vs prior week"
        trend="up"
      />
      <MetricCard
        label="Page views (last 7 days)"
        :value="latest.pageviews.toLocaleString()"
        delta="+3.1% vs prior week"
        trend="up"
      />
      <MetricCard
        label="New submissions"
        :value="websiteStore.newSubmissionCount"
        :accent="websiteStore.newSubmissionCount > 0"
        :delta="websiteStore.newSubmissionCount ? 'Needs review' : 'All caught up'"
        trend="flat"
      />
      <MetricCard
        label="Published pages"
        :value="websiteStore.publishedPageCount"
        :delta="`${websiteStore.pages.length} total pages`"
        trend="flat"
      />
    </div>

    <div class="overview-grid section">
      <div class="traffic-block">
        <div class="block-head">
          <div>
            <div class="section__title">Website traffic</div>
            <p class="section__desc">Visitors over the last five weeks</p>
          </div>
          <el-button text size="small" @click="router.push('/analytics')">Analytics</el-button>
        </div>
        <div class="chart-wrap">
          <BnChart :option="trafficOption" />
        </div>
      </div>

      <div class="subs-block">
        <div class="block-head block-head--pad">
          <div>
            <div class="section__title">Recent submissions</div>
            <p class="section__desc">Latest inquiries from your website</p>
          </div>
          <el-button text size="small" @click="router.push('/submissions')">View all</el-button>
        </div>
        <div v-if="recentSubmissions.length" class="sub-list">
          <button
            v-for="item in recentSubmissions"
            :key="item.id"
            type="button"
            class="sub-row"
            @click="router.push('/submissions')"
          >
            <div class="sub-row__main">
              <div class="sub-row__name">
                <span v-if="item.status === 'new'" class="unread-dot" aria-hidden="true" />
                {{ item.name }}
              </div>
              <div class="sub-row__subject">{{ item.subject }}</div>
            </div>
            <div class="sub-row__meta">
              <StatusBadge :status="item.status" />
              <span>{{ formatDate(item.createdAt) }}</span>
            </div>
          </button>
        </div>
        <EmptyState
          v-else
          title="No submissions yet"
          description="New form submissions will appear here."
        />
      </div>
    </div>

    <div class="status-strip">
      <div class="status-item">
        <div class="status-label">Availability</div>
        <div
          class="status-dot"
          :class="websiteStore.maintenance.enabled ? 'status-dot--warn' : 'status-dot--ok'"
        >
          {{ websiteStore.maintenance.enabled ? 'Maintenance mode' : 'Live' }}
        </div>
      </div>
      <div class="status-item">
        <div class="status-label">Domain</div>
        <div class="status-value">{{ clientStore.client.domain }}</div>
      </div>
      <div class="status-item">
        <div class="status-label">Draft content</div>
        <div class="status-value">
          {{ draftContentCount }} unpublished block{{ draftContentCount === 1 ? '' : 's' }}
        </div>
      </div>
      <div class="status-item">
        <div class="status-label">Media library</div>
        <div class="status-value">{{ websiteStore.media.length }} files</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { PhWrench } from '@phosphor-icons/vue'
import dayjs from 'dayjs'
import PageHeader from '@/components/PageHeader.vue'
import MetricCard from '@/components/MetricCard.vue'
import BnChart from '@/components/BnChart.vue'
import EmptyState from '@/components/EmptyState.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { useClientStore } from '@/stores/client'
import { useWebsiteStore } from '@/stores/website'

const router = useRouter()
const clientStore = useClientStore()
const websiteStore = useWebsiteStore()

const latest = computed(() => websiteStore.analytics[websiteStore.analytics.length - 1])

const draftContentCount = computed(
  () => websiteStore.content.filter((c) => !c.published).length,
)

const recentSubmissions = computed(() =>
  [...websiteStore.submissions]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 4),
)

const trafficOption = computed(() => ({
  color: ['#111111'],
  grid: { left: 36, right: 8, top: 16, bottom: 28 },
  tooltip: {
    trigger: 'axis' as const,
    backgroundColor: '#fff',
    borderColor: '#e5e5e5',
    borderWidth: 1,
    textStyle: { color: '#1a1a1a', fontSize: 12 },
  },
  xAxis: {
    type: 'category' as const,
    data: websiteStore.analytics.map((p) => dayjs(p.date).format('MMM D')),
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
      symbol: 'circle',
      symbolSize: 5,
      data: websiteStore.analytics.map((p) => p.visitors),
      lineStyle: { width: 2 },
      itemStyle: { color: '#111111' },
      areaStyle: { color: 'rgba(17, 17, 17, 0.04)' },
    },
  ],
}))

function formatDate(value: string) {
  return dayjs(value).format('MMM D')
}
</script>

<style scoped lang="scss">
.maint-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: $bn-orange-soft;
  border: 1px solid $bn-orange-border;
  border-radius: $bn-radius;
  color: $bn-gray-700;
  font-size: 13px;
}

.maint-banner__text {
  flex: 1;
  min-width: 0;
}

.maint-banner strong {
  color: $bn-black;
  margin-right: 4px;
}

.overview-grid {
  display: grid;
  grid-template-columns: 1.25fr 1fr;
  gap: 24px;
  align-items: start;
}

.block-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 4px;
}

.block-head .section__desc {
  margin-bottom: 0;
}

.block-head--pad {
  padding: 0 4px 12px;
  border-bottom: $bn-border;
  margin-bottom: 0;
}

.chart-wrap {
  margin-top: 8px;
}

.subs-block {
  min-width: 0;
}

.sub-list {
  display: flex;
  flex-direction: column;
}

.sub-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 4px;
  border: none;
  border-bottom: $bn-border;
  background: transparent;
  text-align: left;
  cursor: pointer;
  width: 100%;
}

.sub-row:last-child {
  border-bottom: none;
}

.sub-row:hover .sub-row__name {
  color: $bn-orange;
}

.sub-row__name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 13px;
  color: $bn-black;
  transition: color 0.12s ease;
}

.sub-row__subject {
  margin-top: 2px;
  font-size: 13px;
  color: $bn-gray-500;
}

.sub-row__meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  font-size: 12px;
  color: $bn-gray-500;
  flex-shrink: 0;
}

.unread-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: $bn-orange;
  flex-shrink: 0;
}

.status-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  padding: 18px 0 0;
  border-top: $bn-border;
  font-size: 14px;
}

.status-label {
  font-size: 12px;
  color: $bn-gray-500;
  margin-bottom: 6px;
}

.status-value {
  color: $bn-gray-900;
}

@media (max-width: 1000px) {
  .overview-grid,
  .status-strip {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .status-strip {
    padding-top: 16px;
  }
}

@media (max-width: 640px) {
  .maint-banner {
    flex-wrap: wrap;
  }
}
</style>
