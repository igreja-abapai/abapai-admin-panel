import { httpService } from './http'

export interface PrayerRequest {
  id: string
  name: string
  phone?: string
  area?: string
  request: string
  createdAt: string
  updatedAt?: string
}

export interface CreatePrayerRequestRequest {
  name: string
  phone?: string
  area?: string
  request: string
}

export interface UpdatePrayerRequestRequest {
  name?: string
  phone?: string
  area?: string
  request?: string
}

export class PrayerRequestsService {
  async getPrayerRequests(): Promise<PrayerRequest[]> {
    return await httpService.get<PrayerRequest[]>('/prayer-request')
  }

  async getPrayerRequest(id: string): Promise<PrayerRequest> {
    return await httpService.get<PrayerRequest>(`/prayer-request/${id}`)
  }

  async createPrayerRequest(data: CreatePrayerRequestRequest): Promise<PrayerRequest> {
    return await httpService.post<PrayerRequest>('/prayer-request', data)
  }

  async updatePrayerRequest(id: string, data: UpdatePrayerRequestRequest): Promise<PrayerRequest> {
    return await httpService.put<PrayerRequest>(`/prayer-request/${id}`, data)
  }

  async deletePrayerRequest(id: string): Promise<void> {
    return await httpService.delete<void>(`/prayer-request/${id}`)
  }
}

export const prayerRequestsService = new PrayerRequestsService()
