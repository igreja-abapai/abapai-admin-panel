export function parseBRLInputToNumber(value: string): number | null {
  const digits = value.replace(/\D/g, '')
  if (!digits) return null
  return Number(digits) / 100
}

export function formatNumberToBRLInput(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return ''
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatBRLInput(value: string): string {
  const parsed = parseBRLInputToNumber(value)
  if (parsed === null) return ''
  return formatNumberToBRLInput(parsed)
}
