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
  border: 1px solid $bn-gray-200;
  background: $bn-white;
  color: $bn-gray-700;
}

.page-status--published {
  color: #2f6b3a;
  background: #f3f8f4;
  border-color: #d5e5d8;
}

.page-status--draft {
  color: $bn-gray-700;
  background: $bn-gray-50;
}

.page-status--unpublished {
  color: $bn-gray-500;
}
</style>
