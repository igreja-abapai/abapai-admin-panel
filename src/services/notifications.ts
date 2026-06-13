import { httpService } from './http'
import type { Notification } from '@/types/notification'

export type { Notification, NotificationData, NotificationUser } from '@/types/notification'

class NotificationsService {
  async getMyNotifications(): Promise<Notification[]> {
    return await httpService.get<Notification[]>('/notifications/me')
  }

  async markAsRead(id: number): Promise<void> {
    await httpService.patch(`/notifications/${id}/read`)
  }

  async markAllAsRead(): Promise<void> {
    await httpService.patch('/notifications/me/read-all')
  }
}

export const notificationsService = new NotificationsService()
