import type { ServiceAssignment, WorshipService, WorshipServiceType } from '@/services/organization'

export interface WorshipSchedulePdfRow {
  roleName: string
  memberName: string
}

export interface WorshipSchedulePdfService {
  key: string
  title: string
  subtitle: string
  rows: WorshipSchedulePdfRow[]
}

function getWorshipServiceTypeRoles(type?: WorshipServiceType) {
  return type?.typeRoles ?? type?.requiredRoles ?? []
}

function getRoleGroupOrder(service: WorshipService): Map<number, number> {
  const order = new Map<number, number>()
  const typeRoles = getWorshipServiceTypeRoles(service.worshipServiceType)

  if (typeRoles.length > 0) {
    for (const typeRole of typeRoles) {
      order.set(typeRole.serviceRoleId, typeRole.sortOrder)
    }
    return order
  }

  let index = 0
  for (const assignment of service.assignments || []) {
    if (!order.has(assignment.serviceRoleId)) {
      order.set(assignment.serviceRoleId, index++)
    }
  }

  return order
}

export function getAssignmentDisplayName(assignment: ServiceAssignment): string | null {
  if (assignment.member) return assignment.member.name

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

function formatWeekdayLabel(date: Date): string {
  const weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' })
  return weekday
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('-')
}

function formatDayMonth(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}`
}

export function buildWorshipSchedulePdfServices(
  services: WorshipService[],
  selectedRoleIds: number[],
): WorshipSchedulePdfService[] {
  const selectedRoleSet = new Set(selectedRoleIds)
  const sortedServices = [...services].sort(
    (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
  )

  return sortedServices
    .map((service) => {
      const roleGroupOrder = getRoleGroupOrder(service)
      const rows = (service.assignments || [])
        .filter(
          (assignment) =>
            selectedRoleSet.has(assignment.serviceRoleId) &&
            getAssignmentDisplayName(assignment),
        )
        .sort((a, b) => {
          const orderA = roleGroupOrder.get(a.serviceRoleId) ?? Number.MAX_SAFE_INTEGER
          const orderB = roleGroupOrder.get(b.serviceRoleId) ?? Number.MAX_SAFE_INTEGER
          if (orderA !== orderB) return orderA - orderB
          if (a.serviceRoleId !== b.serviceRoleId) return a.serviceRoleId - b.serviceRoleId
          return a.slotNumber - b.slotNumber
        })
        .map((assignment) => ({
          roleName: assignment.serviceRole?.name || 'Função',
          memberName: getAssignmentDisplayName(assignment)!,
        }))

      if (rows.length === 0) return null

      const date = new Date(service.scheduledAt)
      const serviceName = service.name || service.worshipServiceType?.name || 'Culto'
      const timeLabel = date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })

      return {
        key: String(service.id),
        title: `${serviceName} - ${formatDayMonth(date)}`,
        subtitle: `${formatWeekdayLabel(date)} · ${timeLabel}`,
        rows,
      }
    })
    .filter((service): service is WorshipSchedulePdfService => service !== null)
}
