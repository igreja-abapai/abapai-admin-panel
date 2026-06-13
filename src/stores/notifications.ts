import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Notification } from '@/types/notification'

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([])
  const loading = ref(false)

  function unreadCount(userId: number) {
    return notifications.value.filter((n) => !n.readBy.some((u) => u.id === userId)).length
  }

  async function fetchNotifications() {
    loading.value = true
    try {
      const { notificationsService } = await import('@/services/notifications')
      notifications.value = await notificationsService.getMyNotifications()
    } finally {
      loading.value = false
    }
  }

  async function markAsRead(id: number) {
    const { notificationsService } = await import('@/services/notifications')
    await notificationsService.markAsRead(id)
    await fetchNotifications()
  }

  async function markAllAsRead(userId: number) {
    const { notificationsService } = await import('@/services/notifications')
    await notificationsService.markAllAsRead()
    notifications.value.forEach((notification) => {
      if (!notification.readBy.some((u) => u.id === userId)) {
        notification.readBy.push({ id: userId })
      }
    })
  }

  return {
    notifications,
    loading,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  }
})
