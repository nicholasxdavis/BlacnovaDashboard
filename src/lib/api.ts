import axios from 'axios'

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, '') ||
  'https://blacnova-api.nic-58f.workers.dev'

const TOKEN_KEY = 'bn-auth-token'

export function getToken(): string | null {
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
  } catch {
    /* private mode / blocked storage */
  }
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
    const isAuthCall = url.includes('/v1/auth/login') || url.includes('/v1/auth/me')

    if (status === 401 && !onLogin && !isAuthCall) {
      setToken(null)
      const redirect = encodeURIComponent(window.location.pathname + window.location.search)
      window.location.href = `/login?redirect=${redirect}`
    }
    return Promise.reject(err)
  },
)

export { API_BASE }
