<template>
  <span
    class="page-status"
    :class="`page-status--${status}`"
  >
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WebsitePage } from '@/types'

const props = defineProps<{
  status: WebsitePage['status']
}>()

const label = computed(() => {
  if (props.status === 'published') return 'Published'
  if (props.status === 'draft') return 'Draft'
  return 'Unpublished'
})
</script>

<style scoped lang="scss">
.page-status {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid transparent;
  background: $bn-gray-500;
  color: $bn-white;
}

.page-status--published {
  color: $bn-white;
  background: $bn-orange;
  border-color: $bn-orange;
}

.page-status--draft {
  color: $bn-white;
  background: $bn-gray-700;
  border-color: $bn-gray-700;
}

.page-status--unpublished {
  color: $bn-white;
  background: $bn-gray-500;
  border-color: $bn-gray-500;
}
</style>
