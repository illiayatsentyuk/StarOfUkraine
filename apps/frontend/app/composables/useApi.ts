import type { AxiosInstance } from 'axios'

export function useApi(): AxiosInstance {
  return useNuxtApp().$api
}
