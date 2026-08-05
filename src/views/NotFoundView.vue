<template>
  <div class="not-found">
    <h1>Page not found</h1>
    <p>The page you’re looking for doesn’t exist or isn’t available for this website.</p>
    <el-button type="primary" @click="router.push('/overview')">Back to overview</el-button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<style scoped lang="scss">
.not-found {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px;
  gap: 12px;
  background: $bn-gray-50;
}

h1 {
  font-size: 24px;
}

p {
  color: $bn-gray-500;
  max-width: 360px;
  margin-bottom: 8px;
}
</style>
