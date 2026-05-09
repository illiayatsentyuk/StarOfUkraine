// plugins/api.ts
import axios from 'axios'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const api = axios.create({
    baseURL: config.public.apiURL as string,
    withCredentials: true,  
  })

  api.interceptors.response.use(
    response => response,
    async error => {
      const original = error.config
      const status = error.response?.status

      if (status === 401 && !original._retry && !original.url?.includes('/auth/')) {
        original._retry = true
        try {
          await api.post('/auth/refresh')
          return api(original)  
        } catch {
          useLoginStore().user = null
          await navigateTo('/auth')
        }
      }

      return Promise.reject(error)
    }
  )

  return { provide: { api } }
})