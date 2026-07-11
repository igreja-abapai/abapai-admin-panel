export const FLEXIBLE_DATE_PLACEHOLDER = 'aaaa, mm/aaaa ou dd/mm/aaaa'

/**
 * Parses flexible date strings used for member ecclesiastical dates.
 * Supports: yyyy, mm/yyyy, dd/mm/yyyy, and ISO yyyy-mm-dd (also partial yyyy-mm).
 */
export function parseFlexibleDate(dateStr?: string | null): Date | null {
  if (!dateStr?.trim()) return null

  const value = dateStr.trim()

  if (/^\d{4}$/.test(value)) {
    return new Date(parseInt(value, 10), 0, 1)
  }

  const isoMatch = value.match(/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/)
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10)
    const month = isoMatch[2] ? parseInt(isoMatch[2], 10) - 1 : 0
    const day = isoMatch[3] ? parseInt(isoMatch[3], 10) : 1
    const parsed = new Date(year, month, day)
    return isNaN(parsed.getTime()) ? null : parsed
  }

  const parts = value.split('/').map((part) => part.trim()).filter(Boolean)

  if (parts.length === 3) {
    const day = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10) - 1
    const year = parseInt(parts[2], 10)
    const parsed = new Date(year, month, day)
    return isNaN(parsed.getTime()) ? null : parsed
  }

  if (parts.length === 2) {
    const month = parseInt(parts[0], 10) - 1
    const year = parseInt(parts[1], 10)
    const parsed = new Date(year, month, 1)
    return isNaN(parsed.getTime()) ? null : parsed
  }

  const fallback = new Date(value)
  return isNaN(fallback.getTime()) ? null : fallback
}

/**
 * Extracts a 4-digit year from partial date strings.
 * Supports: yyyy, mm/yyyy, dd/mm/yyyy, and ISO yyyy-mm-dd.
 */
export function extractFlexibleDateYear(dateStr?: string | null): string | null {
  const parsed = parseFlexibleDate(dateStr)
  return parsed ? String(parsed.getFullYear()) : null
}

/**
 * @deprecated Use extractFlexibleDateYear
 */
export function extractAdmissionYear(admissionDate?: string | null): string | null {
  return extractFlexibleDateYear(admissionDate)
}

/**
 * Returns the member tenure label shown in lists (e.g. "Membro desde 2006").
 */
export function getMemberSinceLabel(admissionDate?: string | null): string {
  const year = extractAdmissionYear(admissionDate)
  if (!year) return ''
  return `Membro desde ${year}`
}

/**
 * Formats a date string to Brazilian Portuguese format
 * @param dateString - The date string to format
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  if (!dateString) return 'Data não informada'

  try {
    // Handle date strings in YYYY-MM-DD format specifically
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // Parse as local date to avoid timezone issues
      const [year, month, day] = dateString.split('-').map(Number)
      return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`
    }

    // For other date formats, use the Date object
    const date = new Date(dateString)

    // Get the date components in local time to avoid timezone issues
    const year = date.getFullYear()
    const month = date.getMonth() + 1 // getMonth() returns 0-11
    const day = date.getDate()

    // Format as dd/mm/yyyy
    return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`
  } catch (error) {
    return 'Data inválida'
  }
}

/**
 * Converts a date string to YYYY-MM-DD format for form inputs
 * Handles timezone conversion properly
 * @param dateString - The date string to convert
 * @returns Date in YYYY-MM-DD format
 */
export function formatDateForInput(dateString: string): string {
  if (!dateString) return ''

  try {
    // Handle date strings in YYYY-MM-DD format specifically
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString // Already in correct format
    }

    // For other date formats, create a local date to avoid timezone issues
    const date = new Date(dateString)

    // Create a new date using local components to avoid timezone shifts
    const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

    // Format as YYYY-MM-DD
    const year = localDate.getFullYear()
    const month = localDate.getMonth() + 1 // getMonth() returns 0-11
    const day = localDate.getDate()

    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
  } catch (error) {
    console.error('Error formatting date for input:', error)
    return ''
  }
}

/**
 * Formats a date and time string to Brazilian Portuguese format
 * @param dateString - The date string to format
 * @returns Formatted date and time string
 */
export function formatDateTime(dateString: string): string {
  if (!dateString) return 'Data não informada'

  try {
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'America/Sao_Paulo',
    })
  } catch (error) {
    return 'Data inválida'
  }
}

/**
 * Formats a date string to a more readable format with relative time
 * @param dateString - The date string to format
 * @returns Formatted date string with relative time
 */
export function formatDateTimeWithRelative(dateString: string): string {
  if (!dateString) return 'Data não informada'

  try {
    const date = new Date(dateString)

    // Get the date components in local time to avoid timezone issues
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = date.getHours()
    const minutes = date.getMinutes()

    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))

    let relativeTime = ''
    if (diffInDays > 0) {
      relativeTime = `há ${diffInDays} ${diffInDays === 1 ? 'dia' : 'dias'}`
    } else if (diffInHours > 0) {
      relativeTime = `há ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`
    } else if (diffInMinutes > 0) {
      relativeTime = `há ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`
    } else {
      relativeTime = 'agora mesmo'
    }

    // Format as dd/mm/yyyy hh:mm
    const formattedDate = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`

    return `${formattedDate} (${relativeTime})`
  } catch (error) {
    return 'Data inválida'
  }
}
