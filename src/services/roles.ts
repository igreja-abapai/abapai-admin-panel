import { httpService } from './http'
import type { Role } from '@/stores/auth'

export class RolesService {
  async getRoles(): Promise<Role[]> {
    return await httpService.get<Role[]>('/roles')
  }
}

export const rolesService = new RolesService()
