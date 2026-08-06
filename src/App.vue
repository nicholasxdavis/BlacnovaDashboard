<template>
  <el-config-provider :message="messageConfig">
    <router-view />
  </el-config-provider>
</template>

<script setup lang="ts">
const messageConfig = {
  placement: 'bottom-right' as const,
}
</script>
