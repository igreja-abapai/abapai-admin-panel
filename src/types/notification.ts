export interface NotificationUser {
  id: number
}

export interface NotificationData {
  members?: Array<{ id: number; name: string }>
}

export interface Notification {
  id: number
  title: string
  message: string
  type: string
  data?: NotificationData
  createdAt: string
  recipients: NotificationUser[]
  readBy: NotificationUser[]
}
