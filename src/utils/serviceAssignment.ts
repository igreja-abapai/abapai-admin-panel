import type { ServiceAssignment } from '@/services/organization'

export function isGuestAssignment(assignment: ServiceAssignment): boolean {
  return Boolean(assignment.preacherId || assignment.guestName?.trim())
}

export function isAssignmentFilled(assignment: ServiceAssignment): boolean {
  return Boolean(
    assignment.memberId ||
      assignment.servingGroupId ||
      assignment.preacherId ||
      assignment.guestName?.trim(),
  )
}

export function getAssignmentDisplayName(assignment: ServiceAssignment): string | null {
  if (assignment.member) return assignment.member.name

  if (assignment.preacher?.name) {
    return assignment.preacher.name
  }

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
  if (assignment.preacher?.name) return assignment.preacher.name
  if (assignment.guestName?.trim()) return assignment.guestName.trim()
  return ''
}

export function getAssignmentPhotoUrl(assignment: ServiceAssignment): string | null | undefined {
  if (assignment.member?.photoUrl) return assignment.member.photoUrl
  if (assignment.preacher?.photoUrl) return assignment.preacher.photoUrl
  return undefined
}
