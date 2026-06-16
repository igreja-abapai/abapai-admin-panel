const NAME_PARTICLES = new Set(['da', 'das', 'do', 'dos', 'de'])

/**
 * Returns the first and second name, including a third part when the second is a Portuguese particle.
 */
export function formatMemberShortName(name?: string | null): string {
  if (!name?.trim()) return ''

  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0]

  const second = parts[1].toLowerCase()
  if (NAME_PARTICLES.has(second) && parts[2]) {
    return `${parts[0]} ${parts[1]} ${parts[2]}`
  }

  return `${parts[0]} ${parts[1]}`
}

export function formatVolunteerTooltipLabel(roleNames: string[], memberName: string): string {
  const roles = roleNames.filter(Boolean).join(', ')
  const shortName = formatMemberShortName(memberName)
  if (!roles) return shortName
  if (!shortName) return roles
  return `${roles}: ${shortName}`
}
