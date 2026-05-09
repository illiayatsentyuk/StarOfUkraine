// plugins/api.ts
import axios from 'axios'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  const api = axios.create({
    baseURL: config.public.apiURL as string,
    withCredentials: true,  
  })

  let isRefreshing = false
  let failedQueue: { resolve: (value?: unknown) => void; reject: (reason?: any) => void }[] = []

  const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error)
      } else {
        prom.resolve(token)
      }
    })
    failedQueue = []
  }

  api.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config
      const status = error.response?.status

      if (status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/')) {
        if (isRefreshing) {
          return new Promise(function (resolve, reject) {
            failedQueue.push({ resolve, reject })
          })
            .then(() => {
              return api(originalRequest)
            })
            .catch(err => {
              return Promise.reject(err)
            })
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
          await axios.post(`${config.public.apiURL}/auth/refresh`, {}, { withCredentials: true })
          processQueue(null)
          return api(originalRequest)
        } catch (refreshError) {
          processQueue(refreshError, null)
          
          nuxtApp.runWithContext(async () => {
            const authStore = useLoginStore()
            authStore.user = null
            authStore.authenticated = false
            await navigateTo('/')
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