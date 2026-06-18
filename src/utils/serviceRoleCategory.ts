import type { Component } from 'vue'
import {
  ClipboardDocumentListIcon,
  HeartIcon,
  MicrophoneIcon,
  MusicalNoteIcon,
  UserGroupIcon,
  VideoCameraIcon,
} from '@heroicons/vue/24/outline'
import { ServiceRoleCategory } from '@/constants/organization'

export function getCategoryStyle(category: string) {
  const styles: Record<string, { icon: string }> = {
    [ServiceRoleCategory.DIRECTION_AND_WORD]: {
      icon: 'bg-blue-50 text-blue-600',
    },
    [ServiceRoleCategory.WORSHIP]: {
      icon: 'bg-violet-50 text-violet-600',
    },
    [ServiceRoleCategory.MEDIA_AND_SOUND]: {
      icon: 'bg-teal-50 text-teal-600',
    },
    [ServiceRoleCategory.RECEPTION]: {
      icon: 'bg-amber-50 text-amber-600',
    },
    [ServiceRoleCategory.SUPPORT_AND_CARE]: {
      icon: 'bg-rose-50 text-rose-600',
    },
  }

  return (
    styles[category] || {
      icon: 'bg-neutral-100 text-neutral-600',
    }
  )
}

export function getCategoryIcon(category: string): Component {
  const icons: Record<string, Component> = {
    [ServiceRoleCategory.DIRECTION_AND_WORD]: MicrophoneIcon,
    [ServiceRoleCategory.WORSHIP]: MusicalNoteIcon,
    [ServiceRoleCategory.MEDIA_AND_SOUND]: VideoCameraIcon,
    [ServiceRoleCategory.RECEPTION]: UserGroupIcon,
    [ServiceRoleCategory.SUPPORT_AND_CARE]: HeartIcon,
  }

  return icons[category] || ClipboardDocumentListIcon
}
