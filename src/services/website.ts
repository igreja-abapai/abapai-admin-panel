import { httpService } from './http'

export interface WebsiteSettings {
  id: number
  address: string
  phone: string
  email: string
  facebook: string
  instagram: string
  youtube: string
  twitter: string
  about: string
  serviceTimes: string
  aboutWhoWeAre: string
  aboutOurMission: string
  aboutOurValues: string
  weeklyMessageUrl: string
  weeklyMessageTitle: string
  weeklyMessageDate: string
  maintenanceMode: boolean
  createdAt: string
  updatedAt: string
}

export interface UpdateWebsiteSettingsRequest {
  address?: string
  phone?: string
  email?: string
  facebook?: string
  instagram?: string
  youtube?: string
  twitter?: string
  about?: string
  serviceTimes?: string
  aboutWhoWeAre?: string
  aboutOurMission?: string
  aboutOurValues?: string
  weeklyMessageUrl?: string
  weeklyMessageTitle?: string
  weeklyMessageDate?: string
  maintenanceMode?: boolean
}

class WebsiteService {
  async getSettings(): Promise<WebsiteSettings> {
    return await httpService.get<WebsiteSettings>('/website/settings')
  }

  async updateSettings(data: UpdateWebsiteSettingsRequest): Promise<WebsiteSettings> {
    return await httpService.put<WebsiteSettings>('/website/settings', data)
  }
}

export const websiteService = new WebsiteService()
