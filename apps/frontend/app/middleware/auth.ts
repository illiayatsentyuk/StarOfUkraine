export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useLoginStore()
  if (!auth.user) {
    await auth.fetchUser()
  }
  if (!auth.user) {
    return navigateTo({ path: '/auth', query: { redirect: to.fullPath } })
  }
})
