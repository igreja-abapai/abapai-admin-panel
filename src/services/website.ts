import { httpService } from './http'

export interface WebsiteSettings {
  id: number
  churchName: string
  address: string
  phone: string
  email: string
  facebook: string
  instagram: string
  youtube: string
  about: string
  serviceTimes: string
  welcomeMessage: string
  aboutWhoWeAre: string
  aboutOurMission: string
  aboutOurValues: string
  isActive: boolean
  maintenanceMode: boolean
  createdAt: string
  updatedAt: string
}

export interface UpdateWebsiteSettingsRequest {
  churchName?: string
  address?: string
  phone?: string
  email?: string
  facebook?: string
  instagram?: string
  youtube?: string
  about?: string
  serviceTimes?: string
  welcomeMessage?: string
  aboutWhoWeAre?: string
  aboutOurMission?: string
  aboutOurValues?: string
  isActive?: boolean
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

