import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { jwtDecode } from 'jwt-decode'

export interface User {
  id: string
  email: string
  givenName?: string
  familyName?: string
  profiles?: Array<{
    permissions?: Array<{
      code: string
    }>
  }>
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  authLoading: boolean
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const accessToken = ref<string | null>(localStorage.getItem('accessToken'))
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'))
  const authLoading = ref(true)

  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)
  const userInitials = computed(() => {
    if (!user.value) return ''
    const { givenName, familyName } = user.value
    return `${givenName?.[0] || ''}${familyName?.[0] || ''}`.toUpperCase()
  })

  function setTokens(access: string, refresh: string) {
    accessToken.value = access
    refreshToken.value = refresh
    localStorage.setItem('accessToken', access)
    localStorage.setItem('refreshToken', refresh)
  }

  function setUser(userData: User | null) {
    user.value = userData
  }

  function setAuthLoading(loading: boolean) {
    authLoading.value = loading
  }

  function logout() {
    user.value = null
    accessToken.value = null
    refreshToken.value = null
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  function getTokenPayload() {
    if (!accessToken.value) return null
    try {
      return jwtDecode(accessToken.value)
    } catch {
      return null
    }
  }

  return {
    user,
    accessToken,
    refreshToken,
    authLoading,
    isAuthenticated,
    userInitials,
    setTokens,
    setUser,
    setAuthLoading,
    logout,
    getTokenPayload,
  }
})
