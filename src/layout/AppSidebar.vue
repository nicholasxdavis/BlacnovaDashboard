<template>
  <aside
    class="sidebar"
    :class="{
      'is-collapsed': isIconRail,
      'is-open': clientStore.mobileNavOpen,
    }"
  >
    <div class="sidebar__brand">
      <img
        class="brand-mark"
        src="/logo_white.png"
        alt="Blacnova"
        width="28"
        height="28"
      />
      <div v-show="showLabels" class="brand-text">
        <div class="brand-name">Blacnova</div>
        <div class="brand-sub">Client Portal</div>
      </div>
      <button
        v-if="clientStore.mobileNavOpen"
        class="sidebar__close"
        type="button"
        aria-label="Close menu"
        @click="clientStore.setMobileNav(false)"
      >
        <PhX :size="20" />
      </button>
    </div>

    <nav class="sidebar__nav" aria-label="Main">
      <template v-for="(item, index) in clientStore.navItems" :key="item.key">
        <div
          v-if="item.ownerOnly && (index === 0 || !clientStore.navItems[index - 1]?.ownerOnly)"
          class="nav-divider"
        >
          <span v-show="showLabels">Blacnova admin</span>
        </div>
        <router-link
          :to="item.path"
          class="nav-item"
          :title="showLabels ? undefined : item.label"
        >
          <component :is="iconMap[item.icon]" :size="18" weight="regular" class="nav-item__icon" />
          <span v-show="showLabels" class="nav-item__label">{{ item.label }}</span>
          <span
            v-if="item.key === 'submissions' && websiteStore.newSubmissionCount && showLabels"
            class="nav-item__badge"
          >
            {{ websiteStore.newSubmissionCount }}
          </span>
        </router-link>
      </template>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  PhHouse,
  PhWrench,
  PhEnvelopeSimple,
  PhChartLine,
  PhGearSix,
  PhX,
  PhBuildings,
  PhUsers,
  PhCurrencyDollar,
  PhReceipt,
  PhChartLineUp,
  PhLifebuoy,
} from '@phosphor-icons/vue'
import { useClientStore } from '@/stores/client'
import { useWebsiteStore } from '@/stores/website'

const clientStore = useClientStore()
const websiteStore = useWebsiteStore()

/** Mobile drawer always shows labels; desktop rail can collapse. */
const showLabels = computed(
  () => clientStore.mobileNavOpen || !clientStore.sidebarCollapsed,
)

const isIconRail = computed(
  () => clientStore.sidebarCollapsed && !clientStore.mobileNavOpen,
)

const iconMap: Record<string, object> = {
  House: PhHouse,
  Wrench: PhWrench,
  EnvelopeSimple: PhEnvelopeSimple,
  ChartLine: PhChartLine,
  GearSix: PhGearSix,
  Buildings: PhBuildings,
  Users: PhUsers,
  CurrencyDollar: PhCurrencyDollar,
  Receipt: PhReceipt,
  ChartLineUp: PhChartLineUp,
  Lifebuoy: PhLifebuoy,
}
</script>

<style scoped lang="scss">
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: $bn-sidebar-width;
  background: $bn-black;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  z-index: 100;
  transition: width 0.2s ease, transform 0.2s ease;
  color: rgba(255, 255, 255, 0.85);
  padding-bottom: env(safe-area-inset-bottom);
}

.sidebar.is-collapsed {
  width: $bn-sidebar-collapsed;
}

.sidebar__brand {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  height: $bn-header-height;
  padding: 0 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
  position: relative;
}

.brand-mark {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  object-fit: contain;
  flex-shrink: 0;
  display: block;
}

.brand-text {
  min-width: 0;
}

.brand-name {
  font-size: 13px;
  font-weight: 500;
  color: $bn-white;
  line-height: 1.2;
}

.brand-sub {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 1px;
}

.sidebar__close {
  margin-left: auto;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: $bn-radius-sm;
  background: rgba(255, 255, 255, 0.08);
  color: $bn-white;
  display: grid;
  place-items: center;
  cursor: pointer;
  flex-shrink: 0;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.sidebar__close:hover {
  background: rgba(255, 255, 255, 0.14);
  color: $bn-white;
}

.sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 10px 8px;
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.nav-divider {
  margin: 8px 6px 4px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.4);
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 10px;
  border-radius: $bn-radius-sm;
  color: rgba(255, 255, 255, 0.55);
  transition: background 0.12s ease, color 0.12s ease;
  min-height: 36px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  user-select: none;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.92);
}

.nav-item.router-link-active {
  background: $bn-orange;
  color: $bn-white;
  font-weight: 500;
}

.nav-item.router-link-active:hover {
  background: $bn-orange-hover;
  color: $bn-white;
}

.nav-item.router-link-active .nav-item__icon {
  color: $bn-white;
}

.nav-item__icon {
  flex-shrink: 0;
  color: inherit;
}

.nav-item__label {
  flex: 1;
  font-size: 13px;
}

.nav-item__badge {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: $bn-orange;
  color: $bn-white;
  font-size: 11px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.nav-item.router-link-active .nav-item__badge {
  background: $bn-white;
  color: $bn-orange;
}

.sidebar.is-collapsed .nav-item {
  justify-content: center;
  padding: 8px;
}

@media (max-width: $bn-bp-mobile) {
  .sidebar {
    transform: translateX(-100%);
    width: 100% !important;
    max-width: 100%;
    border-right: none;
    box-shadow: none;
    pointer-events: none;
    z-index: 120;
  }

  .sidebar.is-collapsed {
    width: 100% !important;
  }

  .sidebar.is-open {
    transform: translateX(0);
    pointer-events: auto;
  }

  .sidebar__brand {
    padding: 0 16px;
    padding-top: env(safe-area-inset-top);
    height: calc(56px + env(safe-area-inset-top));
  }

  .sidebar__nav {
    padding: 12px 12px 24px;
    gap: 2px;
  }

  .nav-item {
    justify-content: flex-start;
    padding: 12px 14px;
    min-height: 48px;
    border-radius: 8px;
  }

  .nav-item__label {
    font-size: 15px;
  }

  .nav-divider {
    margin: 14px 8px 8px;
    font-size: 11px;
  }
}
</style>
