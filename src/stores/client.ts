import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { getNavForClient, hasModule } from '@/config/client'
import { useAuthStore } from '@/stores/auth'
import type { ClientWebsite, ModuleKey } from '@/types'

const EMPTY_CLIENT: ClientWebsite = {
  id: '',
  name: 'Blacnova',
  domain: 'www.blacnova.net',
  status: 'live',
  modules: [],
}

const SIDEBAR_KEY = 'bn-sidebar-collapsed'

function readSidebarCollapsed(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === '1'
  } catch {
    return false
  }
}

function writeSidebarCollapsed(collapsed: boolean) {
  try {
    localStorage.setItem(SIDEBAR_KEY, collapsed ? '1' : '0')
  } catch {
    /* ignore */
  }
}

export const useClientStore = defineStore('client', () => {
  const auth = useAuthStore()
  const sidebarCollapsed = ref(readSidebarCollapsed())
  const mobileNavOpen = ref(false)

  const client = computed<ClientWebsite>(() => auth.website ?? EMPTY_CLIENT)
  const navItems = computed(() =>
    getNavForClient(client.value.modules, auth.isPlatform),
  )

  watch(sidebarCollapsed, (collapsed) => {
    writeSidebarCollapsed(collapsed)
  })

  function canAccess(module: ModuleKey) {
    return hasModule(client.value.modules, module, auth.isPlatform)
  }

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function setMobileNav(open: boolean) {
    mobileNavOpen.value = open
  }

  return {
    client,
    sidebarCollapsed,
    mobileNavOpen,
    navItems,
    canAccess,
    toggleSidebar,
    setMobileNav,
  }
})
