export type AssetStatus = 'Em uso' | 'Em manutenção' | 'Emprestado' | 'Guardado' | 'Baixado'
export type AssetConservationState = 'Bom' | 'Regular' | 'Ruim'
export type AssetOrigin = 'Compra' | 'Doação' | 'Transferência' | 'Outro'
export type AssetDisposalReason =
  | 'Quebra'
  | 'Roubo/Furto'
  | 'Venda'
  | 'Doação'
  | 'Descarte'
  | 'Outro'

export interface AssetCategory {
  id: number
  name: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AssetLocation {
  id: number
  name: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AssetMemberRef {
  id: number
  name: string
}

export interface AssetDepartmentRef {
  id: number
  name: string
}

export interface AssetAttachment {
  id: number
  assetId: number
  fileName: string
  fileUrl: string
  mimeType?: string | null
  fileSize?: number | null
  createdAt: string
  updatedAt: string
}

export interface Asset {
  id: number
  code: string
  description: string
  photoUrl?: string | null
  categoryId: number
  locationId: number
  departmentId?: number | null
  responsibleMemberId?: number | null
  responsibleName?: string | null
  quantity: number
  acquisitionDate?: string | null
  acquisitionValue?: string | null
  origin?: AssetOrigin | null
  supplierOrDonor?: string | null
  invoiceNumber?: string | null
  status: AssetStatus
  conservationState?: AssetConservationState | null
  notes?: string | null
  disposedAt?: string | null
  disposalReason?: AssetDisposalReason | null
  disposalNotes?: string | null
  category?: AssetCategory
  location?: AssetLocation
  department?: AssetDepartmentRef | null
  responsibleMember?: AssetMemberRef | null
  attachments?: AssetAttachment[]
  createdAt: string
  updatedAt: string
  createdBy?: number
  updatedBy?: number
}

export interface PaginatedAssetsResponse {
  data: Asset[]
  total: number
  page: number
  limit: number
}

export interface AssetSummary {
  activeCount: number
  totalQuantity: number
  totalAcquisitionValue: number
  disposedCount: number
}

export interface GetAssetsParams {
  page?: number
  limit?: number
  search?: string
  categoryId?: number
  locationId?: number
  departmentId?: number
  status?: AssetStatus
  conservationState?: AssetConservationState
  origin?: AssetOrigin
  includeDisposed?: boolean
}

export interface CreateAssetRequest {
  description: string
  categoryId: number
  locationId: number
  departmentId?: number
  responsibleMemberId?: number
  responsibleName?: string
  quantity?: number
  acquisitionDate?: string
  acquisitionValue?: number
  origin?: AssetOrigin
  supplierOrDonor?: string
  invoiceNumber?: string
  photoUrl?: string | null
  status?: AssetStatus
  conservationState?: AssetConservationState
  notes?: string
}

export interface UpdateAssetRequest {
  description?: string
  categoryId?: number
  locationId?: number
  departmentId?: number | null
  responsibleMemberId?: number | null
  responsibleName?: string | null
  quantity?: number
  acquisitionDate?: string | null
  acquisitionValue?: number | null
  origin?: AssetOrigin | null
  supplierOrDonor?: string | null
  invoiceNumber?: string | null
  photoUrl?: string | null
  status?: AssetStatus
  conservationState?: AssetConservationState | null
  notes?: string | null
}

export interface DisposeAssetRequest {
  disposedAt: string
  disposalReason: AssetDisposalReason
  disposalNotes?: string
}

export interface CreateAssetAttachmentRequest {
  fileName: string
  fileUrl: string
  mimeType?: string
  fileSize?: number
}

export interface CreateAssetCategoryRequest {
  name: string
  isActive?: boolean
}

export interface UpdateAssetCategoryRequest {
  name?: string
  isActive?: boolean
}

export interface CreateAssetLocationRequest {
  name: string
  isActive?: boolean
}

export interface UpdateAssetLocationRequest {
  name?: string
  isActive?: boolean
}
