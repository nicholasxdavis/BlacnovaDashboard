<template>
  <div class="empty-state">
    <div class="empty-state__icon">
      <slot name="icon">
        <PhTray :size="36" weight="light" />
      </slot>
    </div>
    <div class="empty-state__title">{{ title }}</div>
    <div v-if="description" class="empty-state__desc">{{ description }}</div>
    <div v-if="$slots.action" style="margin-top: 16px">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { PhTray } from '@phosphor-icons/vue'

defineProps<{
  title: string
  description?: string
}>()
</script>
