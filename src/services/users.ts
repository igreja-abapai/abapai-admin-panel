import { httpService } from './http'
import type { Role } from '@/stores/auth'

export interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  roleId?: number
  role?: Role
  createdAt: string
  updatedAt: string
}

export interface CreateUserRequest {
  firstName: string
  lastName: string
  email: string
  password: string
  roleId?: number
}

export interface UpdateUserRequest {
  firstName?: string
  lastName?: string
  email?: string
  password?: string
  roleId?: number
}

class UsersService {
  async getUsers(): Promise<User[]> {
    return await httpService.get<User[]>('/users')
  }

  async getUser(id: number): Promise<User> {
    return await httpService.get<User>(`/users/${id}`)
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    return await httpService.post<User>('/users', userData)
  }

  async updateUser(id: number, userData: UpdateUserRequest): Promise<User> {
    return await httpService.patch<User>(`/users/${id}`, userData)
  }

  async deleteUser(id: number): Promise<void> {
    return await httpService.delete(`/users/${id}`)
  }
}

export const usersService = new UsersService()
