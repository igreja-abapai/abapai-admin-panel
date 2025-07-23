import { defineStore } from 'pinia'
import { notificationsService, type Notification } from '@/services/notifications'

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    notifications: [] as Notification[],
    loading: false,
  }),
  getters: {
    unreadCount(state) {
      // A notification is unread if the current user is not in readBy
      // (Assume backend returns readBy as array of user objects)
      // In the UI, filter by current user id
      return (userId: number) =>
        state.notifications.filter((n) => !n.readBy.some((u) => u.id === userId)).length
    },
  },
  actions: {
    async fetchNotifications() {
      this.loading = true
      try {
        this.notifications = await notificationsService.getMyNotifications()
      } finally {
        this.loading = false
      }
    },
    async markAsRead(id: number) {
      await notificationsService.markAsRead(id)
      // Update local state
      const notif = this.notifications.find((n) => n.id === id)
      if (notif && notif.readBy) {
        // You may want to push the current user to readBy here for instant UI update
        // But best is to refetch
        await this.fetchNotifications()
      }
    },
  },
})
