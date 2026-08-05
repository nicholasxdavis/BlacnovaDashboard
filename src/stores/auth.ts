import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { api, getToken, setToken } from '@/lib/api'
import type { ClientWebsite } from '@/types'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
}

export interface AuthPreferences {
  submissions: boolean
  maintenance: boolean
  weeklyEmail: boolean
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(getToken())
  const user = ref<AuthUser | null>(null)
  const preferences = ref<AuthPreferences>({
    submissions: true,
    maintenance: true,
    weeklyEmail: false,
  })
  const website = ref<ClientWebsite | null>(null)
  const bootstrapped = ref(false)
  const loading = ref(false)

  const isAuthenticated = computed(() => Boolean(token.value && user.value))
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
    website: ClientWebsite & { githubRepo?: string | null }
  }) {
    if (payload.token) {
      token.value = payload.token
      setToken(payload.token)
    }
    user.value = payload.user
    if (payload.preferences) preferences.value = payload.preferences
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
    preferences.value = data.preferences
  }

  async function sendSupport(topic: string, message: string) {
    await api.post('/v1/support', { topic, message })
  }

  return {
    token,
    user,
    preferences,
    website,
    bootstrapped,
    loading,
    isAuthenticated,
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
