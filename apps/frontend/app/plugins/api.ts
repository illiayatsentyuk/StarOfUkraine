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

      // Avoid refresh for auth routes where it doesn't make sense or causes loops
      const isAuthRoute = 
        originalRequest.url?.includes('/auth/signin') || 
        originalRequest.url?.includes('/auth/signup') || 
        originalRequest.url?.includes('/auth/refresh') ||
        originalRequest.url?.includes('/auth/logout')

      if (status === 401 && !originalRequest._retry && !isAuthRoute) {
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
          // Attempt to refresh tokens
          await axios.post(
            `${config.public.apiURL}/auth/refresh`,
            {},
            { withCredentials: true }
          )

          // IMPORTANT: After refresh, we need to sync the user state 
          // because the role (ADMIN/USER) might have changed or needs to be re-read from the new token
          await nuxtApp.runWithContext(async () => {
             const authStore = useLoginStore()
             await authStore.fetchUser()
          })

          processQueue(null)
          return api(originalRequest)
        } catch (refreshError) {
          processQueue(refreshError, null)
          
          // If refresh fails, clear user state and redirect to home/login
          await nuxtApp.runWithContext(async () => {
            const authStore = useLoginStore()
            authStore.user = null
            authStore.authenticated = false
            authStore.isAdmin = false
            
            const route = useRoute()
            if (route.path !== '/') {
              await navigateTo('/')
            }
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