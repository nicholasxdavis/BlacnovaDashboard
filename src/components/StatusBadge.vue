<template>
  <span class="status-badge" :class="`status-badge--${tone}`">
    <span v-if="dot" class="status-badge__dot" aria-hidden="true" />
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SubmissionStatus } from '@/types'

const props = defineProps<{
  status: SubmissionStatus
}>()

const label = computed(() => {
  const map: Record<SubmissionStatus, string> = {
    new: 'New',
    read: 'Read',
    in_progress: 'In progress',
    resolved: 'Resolved',
    archived: 'Archived',
  }
  return map[props.status]
})

const tone = computed(() => {
  if (props.status === 'new') return 'accent'
  if (props.status === 'in_progress') return 'muted'
  if (props.status === 'resolved') return 'ok'
  return 'neutral'
})

const dot = computed(() => props.status === 'new')
</script>

<style scoped lang="scss">
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 22px;
  padding: 0 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  border: 1px solid transparent;
  white-space: nowrap;
}

.status-badge__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.status-badge--accent {
  color: $bn-orange;
  background: $bn-orange-soft;
  border-color: $bn-orange-border;
}

.status-badge--muted {
  color: $bn-gray-700;
  background: $bn-gray-50;
  border-color: $bn-gray-200;
}

.status-badge--ok {
  color: $bn-orange;
  background: $bn-orange-soft;
  border-color: $bn-orange-border;
}

.status-badge--neutral {
  color: $bn-gray-500;
  background: $bn-white;
  border-color: $bn-gray-200;
}
</style>
