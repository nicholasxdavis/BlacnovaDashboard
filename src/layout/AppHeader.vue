<template>
  <header class="header">
    <div class="header__left">
      <button class="icon-btn" type="button" aria-label="Toggle navigation" @click="onToggleNav">
        <PhList :size="20" />
      </button>
      <div class="header__context">
        <div class="header__site">{{ clientStore.client.name }}</div>
        <div class="header__meta">
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
        aria-label="View site"
      >
        <PhArrowSquareOut :size="16" />
        <span>View site</span>
      </a>
      <el-dropdown trigger="click" @command="onCommand">
        <button class="user-btn" type="button" aria-label="Account menu">
          <span class="user-avatar">{{ auth.initials }}</span>
          <span class="user-name">{{ auth.user?.name || 'Account' }}</span>
          <PhCaretDown class="user-caret" :size="14" />
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
import { useRouter } from 'vue-router'
import { PhList, PhArrowSquareOut, PhCaretDown } from '@phosphor-icons/vue'
import { useAuthStore } from '@/stores/auth'
import { useClientStore } from '@/stores/client'
import NotifyBell from '@/components/NotifyBell.vue'

const router = useRouter()
const auth = useAuthStore()
const clientStore = useClientStore()

function onToggleNav() {
  if (window.innerWidth <= 900) {
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
  background: $bn-black;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  gap: 16px;
  position: sticky;
  top: 0;
  z-index: 50;
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.88);
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
  width: 40px;
  height: 40px;
  border-radius: $bn-radius-sm;
  display: grid;
  place-items: center;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.85);
  flex-shrink: 0;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.icon-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: $bn-white;
}

.header__context {
  min-width: 0;
}

.header__site {
  font-size: 14px;
  font-weight: 500;
  color: $bn-white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header__meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
  margin-top: 1px;
  white-space: nowrap;
}

.header__domain {
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
  padding: 6px 10px;
  border-radius: $bn-radius-sm;
  white-space: nowrap;
}

.header-link:hover {
  background: rgba(255, 255, 255, 0.08);
  color: $bn-white;
}

.user-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.06);
  border-radius: 999px;
  padding: 4px 10px 4px 4px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.85);
}

.user-btn:hover {
  border-color: rgba(255, 255, 255, 0.28);
  color: $bn-white;
  background: rgba(255, 255, 255, 0.1);
}

.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  display: grid;
  place-items: center;
  font-size: 11px;
  font-weight: 500;
  color: $bn-white;
}

.user-name {
  font-size: 13px;
  font-weight: 500;
}

.user-caret {
  flex-shrink: 0;
  opacity: 0.7;
}

:deep(.notify-btn) {
  color: rgba(255, 255, 255, 0.8);
}

:deep(.notify-btn:hover) {
  background: rgba(255, 255, 255, 0.08);
  color: $bn-white;
}

:deep(.notify-btn__dot) {
  border-color: $bn-black;
}

@media (max-width: 720px) {
  .header {
    padding: 0 12px;
    gap: 8px;
  }

  .header__left,
  .header__right {
    gap: 6px;
  }

  .user-name,
  .header-link span,
  .user-caret {
    display: none;
  }

  .header__domain {
    display: none;
  }

  .meta-sep {
    display: none;
  }

  .header-link {
    padding: 0;
    width: 36px;
    height: 36px;
    justify-content: center;
  }

  .user-btn {
    padding: 0;
    border: none;
    background: transparent;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    justify-content: center;
  }

  .user-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    border: none;
  }

  .user-avatar {
    width: 32px;
    height: 32px;
    font-size: 12px;
  }
}
</style>
