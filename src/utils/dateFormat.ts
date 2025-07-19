/**
 * Formats a date string to Brazilian Portuguese format
 * @param dateString - The date string to format
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  if (!dateString) return 'Data não informada'

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'America/Sao_Paulo',
    })
  } catch (error) {
    return 'Data inválida'
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
    let date: Date

    // If the date string ends with 'Z', it's UTC - convert to Brazil time
    if (dateString.endsWith('Z')) {
      const utcDate = new Date(dateString)
      const brazilOffset = -3 * 60 * 60 * 1000 // UTC-3 in milliseconds
      date = new Date(utcDate.getTime() + brazilOffset)
    } else {
      date = new Date(dateString)
    }

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

    const formattedDate = date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo',
    })

    return `${formattedDate} (${relativeTime})`
  } catch (error) {
    return 'Data inválida'
  }
}
