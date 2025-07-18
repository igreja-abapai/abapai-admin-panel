import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { jwtDecode } from 'jwt-decode'

export interface Permission {
  id: number
  code: string
  description: string
}

export interface Role {
  id: number
  name: string
  description: string
  permissions: Permission[]
}

export interface User {
  id: number
  email: string
  firstName?: string
  lastName?: string
  roleId?: number
  role?: Role
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
    const { firstName, lastName } = user.value
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
  })

  const userPermissions = computed(() => {
    return user.value?.role?.permissions || []
  })

  const hasPermission = computed(() => (permissionCode: string) => {
    return userPermissions.value.some((permission) => permission.code === permissionCode)
  })

  const userRole = computed(() => {
    return user.value?.role?.name || null
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
    userPermissions,
    hasPermission,
    userRole,
    setTokens,
    setUser,
    setAuthLoading,
    logout,
    getTokenPayload,
  }
})
