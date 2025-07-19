import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import { environment } from '@/config/environment'
import { useAuthStore } from '@/stores/auth'

class HttpService {
  private http: AxiosInstance

  constructor() {
    this.http = axios.create({
      baseURL: environment.clientApiBaseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.http.interceptors.request.use(
      (config) => {
        const authStore = useAuthStore()
        if (authStore.accessToken) {
          config.headers.Authorization = `Bearer ${authStore.accessToken}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      },
    )

    // Response interceptor to handle auth errors
    this.http.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      async (error) => {
        const authStore = useAuthStore()

        // Only handle 401 errors for authenticated requests (with Authorization header)
        if (error.response?.status === 401 && error.config?.headers?.Authorization) {
          authStore.logout()
          // Use router navigation instead of window.location.href to prevent page refresh
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
        }

        return Promise.reject(error)
      },
    )
  }

  async get<T>(url: string, config?: any): Promise<T> {
    const response = await this.http.get<T>(url, config)
    return response.data
  }

  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.http.post<T>(url, data, config)
    return response.data
  }

  async put<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.http.put<T>(url, data, config)
    return response.data
  }

  async patch<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.http.patch<T>(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: any): Promise<T> {
    const response = await this.http.delete<T>(url, config)
    return response.data
  }
}

export const httpService = new HttpService()
