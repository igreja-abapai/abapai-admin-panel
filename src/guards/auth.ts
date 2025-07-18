import { type NavigationGuardNext, type RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export function authGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  const authStore = useAuthStore()

  if (authStore.authLoading) {
    // Wait for auth to initialize
    return
  }

  if (!authStore.isAuthenticated) {
    next('/login')
    return
  }

  next()
}

export function publicGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  const authStore = useAuthStore()

  if (authStore.authLoading) {
    // Wait for auth to initialize
    return
  }

  if (authStore.isAuthenticated) {
    next('/home')
    return
  }

  next()
}
