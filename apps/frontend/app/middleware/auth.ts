export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useLoginStore()
  const localePath = useLocalePath()
  if (!auth.user) {
    await auth.fetchUser()
  }
  if (!auth.user) {
    return navigateTo({ path: localePath('/auth'), query: { redirect: to.fullPath } })
  }
})
