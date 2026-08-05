import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getNavForClient, hasModule } from '@/config/client'
import { useAuthStore } from '@/stores/auth'
import type { ClientWebsite, ModuleKey } from '@/types'

const EMPTY_CLIENT: ClientWebsite = {
  id: '',
  name: '',
  domain: '',
  status: 'live',
  modules: [],
}

export const useClientStore = defineStore('client', () => {
  const sidebarCollapsed = ref(false)
  const mobileNavOpen = ref(false)

  const client = computed<ClientWebsite>(() => {
    const auth = useAuthStore()
    return auth.website || EMPTY_CLIENT
  })

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
