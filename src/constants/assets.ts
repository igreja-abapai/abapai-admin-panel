import type { AssetConservationState, AssetStatus } from '@/types/assets'

export const AssetStatusEnum = {
  IN_USE: 'Em uso',
  IN_MAINTENANCE: 'Em manutenção',
  LOANED: 'Emprestado',
  STORED: 'Guardado',
  DISPOSED: 'Baixado',
} as const

export const AssetConservationStateEnum = {
  GOOD: 'Bom',
  FAIR: 'Regular',
  POOR: 'Ruim',
} as const

export const AssetOriginEnum = {
  PURCHASE: 'Compra',
  DONATION: 'Doação',
  TRANSFER: 'Transferência',
  OTHER: 'Outro',
} as const

export const AssetDisposalReasonEnum = {
  BROKEN: 'Quebra',
  THEFT: 'Roubo/Furto',
  SALE: 'Venda',
  DONATION: 'Doação',
  DISCARD: 'Descarte',
  OTHER: 'Outro',
} as const

export function enumToSelectOptions<T extends Record<string, string>>(
  enumObj: T,
): { value: string; label: string }[] {
  return Object.values(enumObj).map((value) => ({ value, label: value }))
}

export function getAssetStatusBadgeClass(status: AssetStatus): string {
  switch (status) {
    case 'Em uso':
      return 'bg-green-100 text-green-800'
    case 'Em manutenção':
      return 'bg-amber-100 text-amber-800'
    case 'Emprestado':
      return 'bg-blue-100 text-blue-800'
    case 'Guardado':
      return 'bg-neutral-100 text-neutral-700'
    case 'Baixado':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-neutral-100 text-neutral-600'
  }
}

export function getAssetConservationBadgeClass(state: AssetConservationState): string {
  switch (state) {
    case 'Bom':
      return 'bg-green-100 text-green-800'
    case 'Regular':
      return 'bg-amber-100 text-amber-800'
    case 'Ruim':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-neutral-100 text-neutral-600'
  }
}

export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—'
  const num = typeof value === 'string' ? Number(value) : value
  if (Number.isNaN(num)) return '—'
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatAssetResponsible(asset: {
  responsibleMember?: { name: string } | null
  responsibleName?: string | null
}): string {
  if (asset.responsibleMember?.name) return asset.responsibleMember.name
  if (asset.responsibleName) return asset.responsibleName
  return '—'
}
