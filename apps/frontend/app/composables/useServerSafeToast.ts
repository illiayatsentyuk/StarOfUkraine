import { useToast } from 'vue-toastification'

/**
 * vue-toastification is registered only on the client (`toast.client.ts`).
 * Calling `useToast()` during SSR when Pinia stores initialize throws and yields 500s on Vercel.
 */
export function useServerSafeToast() {
  if (import.meta.server) {
    const noop = () => {}
    return {
      error: noop,
      success: noop,
      info: noop,
      warning: noop,
    } as ReturnType<typeof useToast>
  }
  return useToast()
}
