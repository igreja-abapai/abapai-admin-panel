import { httpService } from './http'
import { useAuthStore, type User } from '@/stores/auth'

interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  accessToken: string
  refreshToken: string
}

export class AuthService {
  async login(credentials: LoginRequest): Promise<User> {
    const response = await httpService.post<LoginResponse>('/auth/login', credentials)

    const authStore = useAuthStore()
    authStore.setTokens(response.accessToken, response.refreshToken)

    // Get user info
    const user = await this.whoami()
    authStore.setUser(user)

    return user
  }

  async whoami(): Promise<User> {
    return await httpService.get<User>('/auth/whoami')
  }

  async logout(): Promise<void> {
    const authStore = useAuthStore()
    authStore.logout()
  }

  async init(): Promise<void> {
    const authStore = useAuthStore()

    if (!authStore.accessToken) {
      authStore.setAuthLoading(false)
      return
    }

    try {
      const user = await this.whoami()
      authStore.setUser(user)
    } catch (error) {
      authStore.logout()
    } finally {
      authStore.setAuthLoading(false)
    }
  }
}

export const authService = new AuthService()
