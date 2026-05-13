// plugins/api.ts
import axios from 'axios'

export default defineNuxtPlugin(() => {
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