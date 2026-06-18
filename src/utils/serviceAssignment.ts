import type { ServiceAssignment } from '@/services/organization'

export function isAssignmentFilled(assignment: ServiceAssignment): boolean {
  return Boolean(
    assignment.memberId ||
      assignment.servingGroupId ||
      assignment.guestName?.trim(),
  )
}

export function getAssignmentDisplayName(assignment: ServiceAssignment): string | null {
  if (assignment.member) return assignment.member.name

  if (assignment.guestName?.trim()) {
    return assignment.guestName.trim()
  }

  if (assignment.servingGroup) {
    const members = assignment.servingGroup.members
      ?.map((member) => member.member?.name)
      .filter(Boolean)
      .join(' · ')

    return members
      ? `Grupo: ${assignment.servingGroup.name} (${members})`
      : `Grupo: ${assignment.servingGroup.name}`
  }

  return null
}

export function getAssignmentAvatarName(assignment: ServiceAssignment): string {
  if (assignment.member?.name) return assignment.member.name
  if (assignment.guestName?.trim()) return assignment.guestName.trim()
  return ''
}
