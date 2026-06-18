const AVATAR_COLORS = [
  'bg-amber-500',
  'bg-teal-500',
  'bg-blue-500',
  'bg-violet-500',
  'bg-rose-500',
  'bg-emerald-500',
]

/**
 * Returns two initials from a member name: first letter of the first name
 * and first letter of the second name (not the last name).
 */
export function getMemberInitials(name?: string): string {
  if (!name?.trim()) return '?'

  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }

  return parts[0].slice(0, 2).toUpperCase()
}

export function getMemberAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }

  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}
