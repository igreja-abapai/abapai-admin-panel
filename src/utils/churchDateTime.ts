export const CHURCH_TIMEZONE = 'America/Sao_Paulo'

type DateTimeParts = Record<'year' | 'month' | 'day' | 'hour' | 'minute' | 'weekday', string>

function getChurchDateTimeParts(value: string | Date, includeTime = false): DateTimeParts {
  const date = value instanceof Date ? value : new Date(value)
  const formatOptions: Intl.DateTimeFormatOptions = {
    timeZone: CHURCH_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }

  if (includeTime) {
    formatOptions.hour = '2-digit'
    formatOptions.minute = '2-digit'
    formatOptions.hour12 = false
  }

  const parts = new Intl.DateTimeFormat('en-US', formatOptions).formatToParts(date)
  const result: Partial<DateTimeParts> = {}

  for (const part of parts) {
    if (part.type !== 'literal') {
      result[part.type as keyof DateTimeParts] = part.value
    }
  }

  return result as DateTimeParts
}

export function getChurchDateKey(value: string | Date): string {
  const { year, month, day } = getChurchDateTimeParts(value)
  return `${year}-${month}-${day}`
}

export function getChurchTodayKey(): string {
  return getChurchDateKey(new Date())
}

export function getChurchMonth(): number {
  return Number(getChurchDateTimeParts(new Date()).month)
}

export function getChurchYear(): number {
  return Number(getChurchDateTimeParts(new Date()).year)
}

export function churchDateInputToIso(dateValue: string): string {
  return new Date(`${dateValue}T00:00:00-03:00`).toISOString()
}

export function getChurchDayNumber(value: string | Date): number {
  return Number(getChurchDateTimeParts(value).day)
}

export function getChurchWeekdayIndex(value: string | Date): number {
  const weekday = getChurchDateTimeParts(value).weekday
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  }

  return map[weekday] ?? 0
}

export function formatChurchTime(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value)
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: CHURCH_TIMEZONE,
  })
}

export function formatChurchDateTime(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value)
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: CHURCH_TIMEZONE,
  })
}

export function formatChurchScheduleDate(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value)
  const formatted = date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: CHURCH_TIMEZONE,
  })

  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export function formatChurchWeekday(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value)
  const weekday = date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    timeZone: CHURCH_TIMEZONE,
  })

  return weekday
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('-')
}

export function formatChurchDayMonth(value: string | Date): string {
  const { day, month } = getChurchDateTimeParts(value)
  return `${day}/${month}`
}

export function toChurchDatetimeLocalValue(value: string | Date): string {
  const { year, month, day, hour, minute } = getChurchDateTimeParts(value, true)
  return `${year}-${month}-${day}T${hour}:${minute}`
}

/**
 * Interprets a datetime-local value as wall-clock time in Brazil and returns UTC ISO.
 */
export function churchDatetimeLocalToIso(localValue: string): string {
  const match = localValue.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/)
  if (!match) {
    return new Date(localValue).toISOString()
  }

  return new Date(`${match[1]}T${match[2]}:00-03:00`).toISOString()
}

export function combineChurchDateWithTime(date: Date, time: string): Date {
  const { year, month, day } = getChurchDateTimeParts(date)
  const [hours, minutes] = time.split(':').map((part) => Number(part))
  const hour = Number.isNaN(hours) ? 19 : hours
  const minute = Number.isNaN(minutes) ? 0 : minutes

  return new Date(
    `${year}-${month}-${day}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00-03:00`,
  )
}

export function getNextWeekdayOccurrencesInChurch(
  startFrom: string | Date,
  jsWeekday: number,
  count: number,
): Date[] {
  const startKey =
    typeof startFrom === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(startFrom)
      ? startFrom
      : getChurchDateKey(startFrom)

  let cursor = new Date(`${startKey}T12:00:00-03:00`)
  const dates: Date[] = []

  while (getChurchWeekdayIndex(cursor) !== jsWeekday) {
    cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000)
  }

  while (dates.length < count) {
    dates.push(new Date(cursor))
    cursor = new Date(cursor.getTime() + 7 * 24 * 60 * 60 * 1000)
  }

  return dates
}
