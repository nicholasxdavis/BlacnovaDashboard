<template>
  <header class="header">
    <div class="header__left">
      <button class="icon-btn" type="button" aria-label="Toggle navigation" @click="onToggleNav">
        <PhList :size="20" />
      </button>
      <div class="header__context">
        <div class="header__site">{{ clientStore.client.name }}</div>
        <div class="header__meta">
          <span class="status-dot" :class="statusClass">{{ statusLabel }}</span>
          <span class="meta-sep" aria-hidden="true">·</span>
          <span class="header__domain">{{ clientStore.client.domain }}</span>
        </div>
      </div>
    </div>

    <div class="header__right">
      <NotifyBell />
      <a
        class="header-link"
        :href="'https://' + clientStore.client.domain"
        target="_blank"
        rel="noopener noreferrer"
      >
        <PhArrowSquareOut :size="16" />
        <span>View site</span>
      </a>
      <el-dropdown trigger="click" @command="onCommand">
        <button class="user-btn" type="button" aria-label="Account menu">
          <span class="user-avatar">{{ auth.initials }}</span>
          <span class="user-name">{{ auth.user?.name || 'Account' }}</span>
          <PhCaretDown :size="14" />
        </button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="settings">Settings</el-dropdown-item>
            <el-dropdown-item divided command="logout">Sign out</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { PhList, PhArrowSquareOut, PhCaretDown } from '@phosphor-icons/vue'
import { useAuthStore } from '@/stores/auth'
import { useClientStore } from '@/stores/client'
import { useWebsiteStore } from '@/stores/website'
import NotifyBell from '@/components/NotifyBell.vue'

const router = useRouter()
const auth = useAuthStore()
const clientStore = useClientStore()
const websiteStore = useWebsiteStore()

const statusLabel = computed(() => {
  if (websiteStore.maintenance.enabled) return 'Maintenance mode'
  if (clientStore.client.status === 'live') return 'Live'
  if (clientStore.client.status === 'offline') return 'Offline'
  return 'Maintenance mode'
})

const statusClass = computed(() => {
  if (websiteStore.maintenance.enabled) return 'status-dot--warn'
  if (clientStore.client.status === 'live') return 'status-dot--ok'
  return 'status-dot--off'
})

function onToggleNav() {
  if (window.innerWidth <= 900) {
    // Mobile drawer is always the expanded labeled menu
    clientStore.setMobileNav(!clientStore.mobileNavOpen)
  } else {
    clientStore.toggleSidebar()
  }
}

async function onCommand(command: string) {
  if (command === 'settings') {
    router.push('/settings')
    return
  }
  if (command === 'logout') {
    websiteStore.clear()
    await auth.logout()
    router.push('/login')
  }
}
</script>

<style scoped lang="scss">
.header {
  height: $bn-header-height;
  background: $bn-white;
  border-bottom: $bn-border;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  gap: 16px;
  position: sticky;
  top: 0;
  z-index: 50;
  flex-shrink: 0;
}

.header__left,
.header__right {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.icon-btn {
  border: none;
  background: transparent;
  width: 36px;
  height: 36px;
  border-radius: $bn-radius-sm;
  display: grid;
  place-items: center;
  cursor: pointer;
  color: $bn-gray-700;
  flex-shrink: 0;
}

.icon-btn:hover {
  background: $bn-gray-100;
  color: $bn-black;
}

.header__context {
  min-width: 0;
}

.header__site {
  font-size: 14px;
  font-weight: 500;
  color: $bn-black;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header__meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: $bn-gray-500;
  margin-top: 1px;
  white-space: nowrap;
}

.header__domain {
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta-sep {
  color: $bn-gray-300;
}

.header-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: $bn-gray-700;
  padding: 6px 10px;
  border-radius: $bn-radius-sm;
  white-space: nowrap;
}

.header-link:hover {
  background: $bn-gray-100;
  color: $bn-black;
}

.user-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: $bn-border;
  background: $bn-white;
  border-radius: 999px;
  padding: 4px 10px 4px 4px;
  cursor: pointer;
  color: $bn-gray-700;
}

.user-btn:hover {
  border-color: $bn-gray-300;
  color: $bn-black;
}

.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: $bn-gray-100;
  display: grid;
  place-items: center;
  font-size: 11px;
  font-weight: 500;
  color: $bn-gray-700;
}

.user-name {
  font-size: 13px;
  font-weight: 500;
}

@media (max-width: 720px) {
  .user-name,
  .header-link span {
    display: none;
  }

  .header__domain {
    display: none;
  }

  .meta-sep {
    display: none;
  }

  .user-btn {
    padding: 4px;
    border-radius: 50%;
  }
}
</style>
