import axios from 'axios'

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, '') ||
  'https://blacnova-api.nic-58f.workers.dev'

const TOKEN_KEY = 'bn-auth-token'
let memoryToken: string | null | undefined

export function getToken(): string | null {
  if (memoryToken !== undefined) return memoryToken
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
    memoryToken = undefined
  } catch {
    memoryToken = token
  }
}

export function dashboardReturnPath(value: unknown): string {
  return typeof value === 'string' && /^\/(?![/\\])/.test(value) && !value.includes('\\')
    ? value
    : '/overview'
}

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status
    const url = String(err.config?.url || '')
    const onLogin = window.location.pathname === '/login'
    const handledByRouter = ['/v1/auth/login', '/v1/auth/me', '/v1/dashboard'].includes(url)

    if (status === 401 && !onLogin && !handledByRouter) {
      setToken(null)
      const redirect = encodeURIComponent(window.location.pathname + window.location.search)
      window.location.href = `/login?redirect=${redirect}`
    }
    return Promise.reject(err)
  },
)

export { API_BASE }
