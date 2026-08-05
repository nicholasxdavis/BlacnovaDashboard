<template>
  <div class="app-layout" :class="{ 'is-collapsed': clientStore.sidebarCollapsed }">
    <div
      v-if="clientStore.mobileNavOpen"
      class="sidebar-backdrop"
      @click="clientStore.setMobileNav(false)"
    />
    <AppSidebar />
    <div class="app-main">
      <AppHeader />
      <main class="app-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
import { useClientStore } from '@/stores/client'
import { useBodyScrollLock, useElementPlusScrollLock } from '@/composables/useBodyScrollLock'

const clientStore = useClientStore()

const lockBackground = computed(
  () => clientStore.mobileNavOpen && typeof window !== 'undefined' && window.innerWidth <= 900,
)

useBodyScrollLock(lockBackground)
useElementPlusScrollLock()

function onResize() {
  if (window.innerWidth > 900 && clientStore.mobileNavOpen) {
    clientStore.setMobileNav(false)
  }
}

onMounted(() => window.addEventListener('resize', onResize))
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
  touch-action: none;
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
  transition: opacity 0.15s ease;
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
}
</style>
