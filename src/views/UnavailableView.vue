<template>
  <main class="unavailable">
    <h1>Dashboard temporarily unavailable</h1>
    <p>We couldn’t reach the dashboard service. Try again in a moment.</p>
    <el-button type="primary" @click="router.replace(dashboardReturnPath(route.query.redirect))">
      Try again
    </el-button>
  </main>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { dashboardReturnPath } from '@/lib/api'

const route = useRoute()
const router = useRouter()
</script>

<style scoped lang="scss">
.unavailable {
  min-height: 100dvh;
  display: grid;
  place-content: center;
  justify-items: center;
  text-align: center;
  padding: 24px;
  gap: 16px;
  background: $bn-gray-50;
}
</style>
