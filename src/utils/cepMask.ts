/**
 * Formats a CEP to Brazilian format (00000-000)
 * @param value - The raw CEP string
 * @returns Formatted CEP
 */
export function formatCEP(value: string): string {
  // Remove all non-digit characters
  const numbers = value.replace(/\D/g, '')

  // Apply Brazilian CEP format
  if (numbers.length <= 5) {
    return numbers
  } else if (numbers.length <= 8) {
    return `${numbers.slice(0, 5)}-${numbers.slice(5)}`
  } else {
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`
  }
}

/**
 * Removes formatting from a CEP
 * @param value - The formatted CEP
 * @returns Raw CEP (digits only)
 */
export function unformatCEP(value: string): string {
  return value.replace(/\D/g, '')
}
