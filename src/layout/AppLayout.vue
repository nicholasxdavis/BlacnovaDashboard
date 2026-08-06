<template>
  <div class="app-layout" :class="{ 'is-collapsed': clientStore.sidebarCollapsed }">
    <div
      v-if="clientStore.mobileNavOpen"
      class="sidebar-backdrop"
      aria-hidden="true"
      @click="clientStore.setMobileNav(false)"
    />
    <AppSidebar />
    <div class="app-main">
      <AppHeader />
      <main class="app-content">
        <router-view v-slot="{ Component, route }">
          <transition name="fade">
            <component :is="Component" :key="route.path" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
import { useClientStore } from '@/stores/client'
import { useBodyScrollLock, useElementPlusScrollLock } from '@/composables/useBodyScrollLock'

const route = useRoute()
const clientStore = useClientStore()

const lockBackground = computed(() => {
  if (!clientStore.mobileNavOpen) return false
  if (typeof window === 'undefined') return false
  return window.innerWidth <= 900
})

useBodyScrollLock(lockBackground, 'mobile-nav')
useElementPlusScrollLock()

// Close drawer after navigation completes (don't interrupt the router-link click).
watch(
  () => route.fullPath,
  () => {
    if (clientStore.mobileNavOpen) clientStore.setMobileNav(false)
  },
)

function onResize() {
  if (window.innerWidth > 900 && clientStore.mobileNavOpen) {
    clientStore.setMobileNav(false)
  }
}

onMounted(() => window.addEventListener('resize', onResize, { passive: true }))
onUnmounted(() => window.removeEventListener('resize', onResize))
</script>

<style scoped lang="scss">
.app-layout {
  display: flex;
  min-height: 100vh;
  background: $bn-gray-50;
}

.sidebar-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(17, 17, 17, 0.35);
  z-index: 90;
  display: none;
}

.app-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  margin-left: $bn-sidebar-width;
  transition: margin-left 0.2s ease;
}

.is-collapsed .app-main {
  margin-left: 72px;
}

.app-content {
  flex: 1;
  padding: 22px 28px 48px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.12s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 900px) {
  .app-main {
    margin-left: 0 !important;
  }

  .sidebar-backdrop {
    display: block;
  }

  .app-content {
    padding: 16px 16px 32px;
  }

  /* Avoid out-in stalls feeling like dead clicks on mobile. */
  .fade-enter-active,
  .fade-leave-active {
    transition: none;
  }
}
</style>
