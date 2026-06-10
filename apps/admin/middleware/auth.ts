export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  const auth = useAuthStore()
  if (!auth.user) {
    try { await auth.fetchMe() }
    catch { /* not authenticated */ }
  }
  if (!auth.user && to.path !== '/login') {
    return navigateTo('/login')
  }
  if (auth.user && to.path === '/login') {
    return navigateTo('/pos')
  }
})
