// plugins/api.ts
import axios from 'axios'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  const api = axios.create({
    baseURL: config.public.apiURL as string,
    withCredentials: true,
  })

  // On SSR, axios runs on the Node.js server and has no browser cookie jar.
  // withCredentials:true is a browser-only CORS flag and does nothing here.
  // We must manually forward the Cookie header from the incoming Nuxt request
  // so that /auth/me (and other protected endpoints) receive the auth cookies.
  if (import.meta.server) {
    const requestHeaders = useRequestHeaders(['cookie'])
    if (requestHeaders.cookie) {
      api.defaults.headers.common['Cookie'] = requestHeaders.cookie
    }
  }

  let isRefreshing = false
  let failedQueue: any[] = []

  const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error)
      } else {
        prom.resolve(token)
      }
    })
    failedQueue = []
  }

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config
      const status = error.response?.status

      // Skip auth routes (refresh/login/logout) and /auth/me — the latter is
      // expected to 401 for unauthenticated visitors browsing public pages,
      // so attempting a refresh would just trigger spurious redirects.
      const skipRefresh =
        originalRequest.url?.includes('/auth/signin') ||
        originalRequest.url?.includes('/auth/signup') ||
        originalRequest.url?.includes('/auth/refresh') ||
        originalRequest.url?.includes('/auth/logout') ||
        originalRequest.url?.includes('/auth/me')

      if (status === 401 && !originalRequest._retry && !skipRefresh) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          })
            .then(() => api(originalRequest))
            .catch((err) => Promise.reject(err))
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
          await axios.post(
            `${config.public.apiURL}/auth/refresh`,
            {},
            { withCredentials: true }
          )

          await nuxtApp.runWithContext(async () => {
             const authStore = useLoginStore()
             await authStore.fetchUser()
          })

          processQueue(null)
          return api(originalRequest)
        } catch (refreshError) {
          processQueue(refreshError, null)

          // Refresh failed — clear local auth state but DO NOT navigate.
          // Page-level middleware (`middleware/auth.ts`) decides whether the
          // current route requires authentication; forcing a redirect here
          // would kick unauthenticated visitors off legitimately public pages.
          await nuxtApp.runWithContext(() => {
            const authStore = useLoginStore()
            authStore.user = null
            authStore.isAdmin = false
            authStore.isJury = false
            authStore.image = null
          })

          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      }

      return Promise.reject(error)
    }
  )

  return { provide: { api } }
})