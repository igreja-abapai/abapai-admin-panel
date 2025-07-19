/**
 * Formats a phone number to Brazilian format (##) #####-####
 * @param value - The raw phone number string
 * @returns Formatted phone number
 */
export function formatPhoneNumber(value: string): string {
  // Remove all non-digit characters
  const numbers = value.replace(/\D/g, '')

  // Apply Brazilian phone format
  if (numbers.length <= 2) {
    return numbers
  } else if (numbers.length <= 7) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
  } else if (numbers.length <= 11) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`
  } else {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
  }
}

/**
 * Removes formatting from a phone number
 * @param value - The formatted phone number
 * @returns Raw phone number (digits only)
 */
export function unformatPhoneNumber(value: string): string {
  return value.replace(/\D/g, '')
}
