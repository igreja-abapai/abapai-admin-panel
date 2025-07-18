import { httpService } from './http'

export interface PrayerRequest {
  id: string
  title: string
  description: string
  memberId: string
  memberName: string
  status: 'pending' | 'answered' | 'closed'
  createdAt: string
  updatedAt?: string
  prayerCount: number
}

export interface CreatePrayerRequestRequest {
  title: string
  description: string
  memberId: string
}

export interface UpdatePrayerRequestRequest {
  title?: string
  description?: string
  status?: 'pending' | 'answered' | 'closed'
}

export class PrayerRequestsService {
  async getPrayerRequests(): Promise<PrayerRequest[]> {
    return await httpService.get<PrayerRequest[]>('/prayer-requests')
  }

  async getPrayerRequest(id: string): Promise<PrayerRequest> {
    return await httpService.get<PrayerRequest>(`/prayer-requests/${id}`)
  }

  async createPrayerRequest(data: CreatePrayerRequestRequest): Promise<PrayerRequest> {
    return await httpService.post<PrayerRequest>('/prayer-requests', data)
  }

  async updatePrayerRequest(id: string, data: UpdatePrayerRequestRequest): Promise<PrayerRequest> {
    return await httpService.put<PrayerRequest>(`/prayer-requests/${id}`, data)
  }

  async deletePrayerRequest(id: string): Promise<void> {
    return await httpService.delete<void>(`/prayer-requests/${id}`)
  }
}

export const prayerRequestsService = new PrayerRequestsService()
