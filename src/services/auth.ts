import { httpService } from './http'
import { useAuthStore, type User } from '@/stores/auth'

interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export class AuthService {
  private initialized = false

  async login(credentials: LoginRequest): Promise<User> {
    const response = await httpService.post<LoginResponse>('/auth/login', credentials)

    const authStore = useAuthStore()
    authStore.setTokens(response.accessToken, response.refreshToken)
    authStore.setUser(response.user)
    this.initialized = true

    return response.user
  }

  async whoami(): Promise<User> {
    return await httpService.get<User>('/auth/whoami')
  }

  async logout(): Promise<void> {
    const authStore = useAuthStore()
    authStore.logout()
    this.initialized = false
  }

  async init(): Promise<void> {
    const authStore = useAuthStore()

    // Skip if already initialized or no token
    if (this.initialized || !authStore.accessToken) {
      authStore.setAuthLoading(false)
      return
    }

    try {
      const user = await this.whoami()
      authStore.setUser(user)
      this.initialized = true
    } catch (error) {
      authStore.logout()
      this.initialized = false
    } finally {
      authStore.setAuthLoading(false)
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await httpService.patch('/auth/change-password', { currentPassword, newPassword })
  }
}

export const authService = new AuthService()
