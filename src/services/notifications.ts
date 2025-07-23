import { httpService } from './http'

export interface Notification {
  id: number
  title: string
  message: string
  type: string
  data?: any
  createdAt: string
  recipients: any[]
  readBy: any[]
}

class NotificationsService {
  async getMyNotifications(): Promise<Notification[]> {
    return await httpService.get<Notification[]>('/notifications/me')
  }

  async markAsRead(id: number): Promise<void> {
    await httpService.patch(`/notifications/${id}/read`)
  }
}

export const notificationsService = new NotificationsService()
