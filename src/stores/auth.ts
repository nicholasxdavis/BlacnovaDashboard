import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { api, getToken, setToken } from '@/lib/api'
import type { ClientWebsite } from '@/types'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
  isPlatform?: boolean
}

export interface AuthPreferences {
  submissions: boolean
  maintenance: boolean
}

function isPlatformRole(user: AuthUser | null): boolean {
  if (!user) return false
  if (typeof user.isPlatform === 'boolean') return user.isPlatform
  return user.role === 'platform' || user.role === 'owner'
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(getToken())
  const user = ref<AuthUser | null>(null)
  const preferences = ref<AuthPreferences>({
    submissions: true,
    maintenance: true,
  })
  const supportEmail = ref('nic@blacnova.net')
  const website = ref<ClientWebsite | null>(null)
  const bootstrapped = ref(false)
  const loading = ref(false)

  const isAuthenticated = computed(() => Boolean(token.value && user.value))
  const isPlatform = computed(() => isPlatformRole(user.value))
  const initials = computed(() => {
    if (!user.value?.name) return '?'
    return user.value.name
      .split(/\s+/)
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  })

  function applyAuthPayload(payload: {
    token?: string
    user: AuthUser
    preferences?: AuthPreferences
    supportEmail?: string
    website: ClientWebsite & { githubRepo?: string | null }
  }) {
    if (payload.token) {
      token.value = payload.token
      setToken(payload.token)
    }
    user.value = {
      ...payload.user,
      isPlatform: isPlatformRole(payload.user),
    }
    if (payload.preferences) {
      preferences.value = {
        submissions: payload.preferences.submissions,
        maintenance: payload.preferences.maintenance,
      }
    }
    if (payload.supportEmail) supportEmail.value = payload.supportEmail
    website.value = {
      id: payload.website.id,
      name: payload.website.name,
      domain: payload.website.domain,
      status: payload.website.status,
      modules: payload.website.modules,
    }
  }

  async function login(email: string, password: string) {
    const { data } = await api.post('/v1/auth/login', { email, password })
    applyAuthPayload(data)
    return data
  }

  async function logout() {
    try {
      await api.post('/v1/auth/logout')
    } catch {
      /* ignore */
    }
    token.value = null
    user.value = null
    website.value = null
    setToken(null)
  }

  async function bootstrap() {
    if (!getToken()) {
      bootstrapped.value = true
      return false
    }
    loading.value = true
    try {
      const { data } = await api.get('/v1/auth/me')
      applyAuthPayload(data)
      return true
    } catch {
      token.value = null
      setToken(null)
      return false
    } finally {
      loading.value = false
      bootstrapped.value = true
    }
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    await api.post('/v1/auth/password', { currentPassword, newPassword })
  }

  async function savePreferences(next: AuthPreferences) {
    const { data } = await api.put('/v1/preferences', next)
    preferences.value = {
      submissions: data.preferences.submissions,
      maintenance: data.preferences.maintenance,
    }
  }

  async function sendSupport(topic: string, message: string) {
    await api.post('/v1/support', { topic, message })
  }

  return {
    token,
    user,
    preferences,
    supportEmail,
    website,
    bootstrapped,
    loading,
    isAuthenticated,
    isPlatform,
    initials,
    login,
    logout,
    bootstrap,
    changePassword,
    savePreferences,
    sendSupport,
    applyAuthPayload,
  }
})
