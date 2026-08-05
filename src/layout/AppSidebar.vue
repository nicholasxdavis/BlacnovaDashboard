<template>
  <aside
    class="sidebar"
    :class="{ 'is-collapsed': clientStore.sidebarCollapsed, 'is-open': clientStore.mobileNavOpen }"
  >
    <div class="sidebar__brand">
      <img
        class="brand-mark"
        src="/bn-icon.png"
        alt="Blacnova"
        width="32"
        height="32"
      />
      <div class="brand-text">
        <div class="brand-name">Blacnova</div>
        <div class="brand-sub">Client Portal</div>
      </div>
    </div>

    <nav class="sidebar__nav" aria-label="Main">
      <router-link
        v-for="item in clientStore.navItems"
        :key="item.key"
        :to="item.path"
        class="nav-item"
        :title="clientStore.sidebarCollapsed ? item.label : undefined"
        @click="clientStore.setMobileNav(false)"
      >
        <component :is="iconMap[item.icon]" :size="20" weight="regular" class="nav-item__icon" />
        <span v-show="!clientStore.sidebarCollapsed" class="nav-item__label">{{ item.label }}</span>
        <span
          v-if="item.key === 'submissions' && websiteStore.newSubmissionCount && !clientStore.sidebarCollapsed"
          class="nav-item__badge"
        >
          {{ websiteStore.newSubmissionCount }}
        </span>
      </router-link>
    </nav>

    <div v-show="!clientStore.sidebarCollapsed" class="sidebar__site">
      <div class="site-label">Current website</div>
      <div class="site-name">{{ clientStore.client.name }}</div>
      <div class="site-domain">{{ clientStore.client.domain }}</div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import {
  PhHouse,
  PhTextT,
  PhImage,
  PhFiles,
  PhWrench,
  PhEnvelopeSimple,
  PhChartLine,
  PhGearSix,
} from '@phosphor-icons/vue'
import { useClientStore } from '@/stores/client'
import { useWebsiteStore } from '@/stores/website'

const clientStore = useClientStore()
const websiteStore = useWebsiteStore()

const iconMap: Record<string, object> = {
  House: PhHouse,
  TextT: PhTextT,
  Image: PhImage,
  Files: PhFiles,
  Wrench: PhWrench,
  EnvelopeSimple: PhEnvelopeSimple,
  ChartLine: PhChartLine,
  GearSix: PhGearSix,
}
</script>

<style scoped lang="scss">
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: $bn-sidebar-width;
  background: $bn-white;
  border-right: $bn-border;
  display: flex;
  flex-direction: column;
  z-index: 100;
  transition: width 0.2s ease, transform 0.2s ease;
}

.sidebar.is-collapsed {
  width: 72px;
}

.sidebar__brand {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  height: $bn-header-height;
  padding: 0 18px;
  border-bottom: $bn-border;
  flex-shrink: 0;
}

.brand-mark {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
  display: block;
}

.brand-text {
  display: none;
}

.sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 14px 10px;
  flex: 1;
  overflow-y: auto;
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: $bn-radius-sm;
  color: $bn-gray-500;
  transition: background 0.12s ease, color 0.12s ease;
  min-height: 38px;
}

.nav-item:hover {
  background: $bn-gray-50;
  color: $bn-gray-900;
}

.nav-item.router-link-active {
  background: $bn-gray-50;
  color: $bn-black;
  font-weight: 600;
}

.nav-item.router-link-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 2px;
  border-radius: 1px;
  background: $bn-orange;
}

.nav-item.router-link-active .nav-item__icon {
  color: $bn-black;
}

.nav-item__icon {
  flex-shrink: 0;
  color: inherit;
}

.nav-item__label {
  flex: 1;
  font-size: 13.5px;
}

.nav-item__badge {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: $bn-orange;
  color: $bn-white;
  font-size: 11px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.sidebar.is-collapsed .nav-item {
  justify-content: center;
  padding: 10px;
}

.sidebar.is-collapsed .nav-item.router-link-active::before {
  display: none;
}

.sidebar__site {
  margin: 0 12px 16px;
  padding: 12px;
  border-top: $bn-border;
  border-radius: 0;
  background: transparent;
  border-left: none;
  border-right: none;
  border-bottom: none;
}

.site-label {
  font-size: 11px;
  color: $bn-gray-400;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 6px;
}

.site-name {
  font-size: 13px;
  font-weight: 600;
  color: $bn-gray-900;
}

.site-domain {
  font-size: 12px;
  color: $bn-gray-500;
  margin-top: 2px;
  word-break: break-all;
}

@media (max-width: 900px) {
  .sidebar {
    transform: translateX(-100%);
    width: $bn-sidebar-width !important;
  }

  .sidebar.is-open {
    transform: translateX(0);
  }
}
</style>
