import type { Member } from '@/services/members'

export interface UpcomingBirthday {
  member: Member
  nextDate: Date
  daysUntil: number
  ageTurning: number
}

const MONTHS_PT = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
]

export function parseBirthdate(dateStr: string): Date {
  if (dateStr.length === 10 && dateStr.includes('-')) {
    const [year, month, day] = dateStr.split('-').map(Number)
    return new Date(year, month - 1, day)
  }
  return new Date(dateStr)
}

export function getUpcomingBirthdays(members: Member[], limit = 3): UpcomingBirthday[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const currentYear = today.getFullYear()

  return members
    .filter((member) => member.birthdate)
    .map((member) => {
      const birth = parseBirthdate(member.birthdate)
      let nextDate = new Date(currentYear, birth.getMonth(), birth.getDate())
      if (nextDate < today) {
        nextDate = new Date(currentYear + 1, birth.getMonth(), birth.getDate())
      }

      const daysUntil = Math.round(
        (nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      )
      const ageTurning = nextDate.getFullYear() - birth.getFullYear()

      return { member, nextDate, daysUntil, ageTurning }
    })
    .sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime())
    .slice(0, limit)
}

export function formatBirthdayDetail(nextDate: Date, ageTurning: number): string {
  return `${nextDate.getDate()} de ${MONTHS_PT[nextDate.getMonth()]} · faz ${ageTurning}`
}

export function formatDaysUntilBadge(daysUntil: number): string {
  if (daysUntil === 0) return 'hoje'
  return `${daysUntil} d`
}
