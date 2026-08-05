import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { DEMO_CLIENT, getNavForClient, hasModule } from '@/config/client'
import type { ClientWebsite, ModuleKey } from '@/types'

export const useClientStore = defineStore('client', () => {
  const client = ref<ClientWebsite>({ ...DEMO_CLIENT })
  const sidebarCollapsed = ref(false)
  const mobileNavOpen = ref(false)

  const navItems = computed(() => getNavForClient(client.value.modules))

  function canAccess(module: ModuleKey) {
    return hasModule(client.value.modules, module)
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
