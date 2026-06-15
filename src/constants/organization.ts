export const DepartmentType = {
  DEPARTMENT: 'Departamento',
  MINISTRY: 'Ministério',
} as const

export const MemberDepartmentRole = {
  LEADER: 'Líder',
  MEMBER: 'Membro',
  ASSISTANT: 'Auxiliar',
} as const

export const ServiceRoleCategory = {
  DIRECTION_AND_WORD: 'Direção & Palavra',
  WORSHIP: 'Louvor',
  MEDIA_AND_SOUND: 'Mídia & Som',
  RECEPTION: 'Recepção',
  SUPPORT_AND_CARE: 'Apoio & Cuidado',
} as const

export const ChurchPositionCategory = {
  MINISTERIAL: 'Ministerial',
  OPERATIONAL: 'Operacional',
} as const

export const SERVICE_ROLE_CATEGORY_ORDER = [
  ServiceRoleCategory.DIRECTION_AND_WORD,
  ServiceRoleCategory.WORSHIP,
  ServiceRoleCategory.MEDIA_AND_SOUND,
  ServiceRoleCategory.RECEPTION,
  ServiceRoleCategory.SUPPORT_AND_CARE,
] as const

export const CapabilitySource = {
  MANUAL: 'Manual',
  DEPARTMENT: 'Departamento',
} as const

export const Weekday = {
  SUNDAY: 'Domingo',
  MONDAY: 'Segunda-feira',
  TUESDAY: 'Terça-feira',
  WEDNESDAY: 'Quarta-feira',
  THURSDAY: 'Quinta-feira',
  FRIDAY: 'Sexta-feira',
  SATURDAY: 'Sábado',
} as const

export const WorshipServiceStatus = {
  DRAFT: 'Rascunho',
  PUBLISHED: 'Publicada',
  COMPLETED: 'Concluída',
} as const

export const AssignmentStatus = {
  EMPTY: 'Vaga',
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmada',
  DECLINED: 'Recusada',
} as const

export function enumToSelectOptions(values: Record<string, string>) {
  return Object.values(values).map((value) => ({ value, label: value }))
}

export function formatDepartmentBadgeName(name: string): string {
  return name.replace(/\bDepartamento\b/gi, 'Dep.').replace(/\s+/g, ' ').trim()
}
