<template>
  <div class="metric">
    <div class="metric__label">{{ label }}</div>
    <div class="metric__value" :class="{ 'metric__value--accent': accent }">{{ value }}</div>
    <div
      v-if="delta"
      class="metric__delta"
      :class="{
        'metric__delta--up': trend === 'up',
        'metric__delta--down': trend === 'down',
      }"
    >
      {{ delta }}
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  delta?: string
  trend?: 'up' | 'down' | 'flat'
  accent?: boolean
}>()
</script>
