<template>
  <div class="skeleton" :class="[`skeleton--${variant}`]" :style="style" aria-hidden="true" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    variant?: 'line' | 'block' | 'circle'
    width?: string
    height?: string
  }>(),
  {
    variant: 'line',
    width: '100%',
    height: undefined,
  },
)

const style = computed(() => ({
  width: props.width,
  height: props.height || (props.variant === 'circle' ? props.width : props.variant === 'block' ? '120px' : '14px'),
}))
</script>

<style scoped lang="scss">
.skeleton {
  background: linear-gradient(90deg, $bn-gray-100 0%, $bn-gray-50 50%, $bn-gray-100 100%);
  background-size: 200% 100%;
  animation: shimmer 1.2s ease-in-out infinite;
  border-radius: $bn-radius-sm;
}

.skeleton--circle {
  border-radius: 50%;
}

.skeleton--block {
  border-radius: $bn-radius;
}

@keyframes shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}
</style>
