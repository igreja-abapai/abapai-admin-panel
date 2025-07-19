/**
 * Formats a CPF to Brazilian format (000.000.000-00)
 * @param value - The raw CPF string
 * @returns Formatted CPF
 */
export function formatCPF(value: string): string {
  // Remove all non-digit characters
  const numbers = value.replace(/\D/g, '')

  // Apply Brazilian CPF format
  if (numbers.length <= 3) {
    return numbers
  } else if (numbers.length <= 6) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3)}`
  } else if (numbers.length <= 9) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`
  } else if (numbers.length <= 11) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`
  } else {
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`
  }
}

/**
 * Removes formatting from a CPF
 * @param value - The formatted CPF
 * @returns Raw CPF (digits only)
 */
export function unformatCPF(value: string): string {
  return value.replace(/\D/g, '')
}
