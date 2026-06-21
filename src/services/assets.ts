import { httpService } from './http'
import type {
  Asset,
  AssetAttachment,
  AssetCategory,
  AssetLocation,
  AssetSummary,
  CreateAssetCategoryRequest,
  CreateAssetAttachmentRequest,
  CreateAssetLocationRequest,
  CreateAssetRequest,
  DisposeAssetRequest,
  GetAssetsParams,
  PaginatedAssetsResponse,
  UpdateAssetCategoryRequest,
  UpdateAssetLocationRequest,
  UpdateAssetRequest,
} from '@/types/assets'

export class AssetsService {
  private buildQuery(params?: GetAssetsParams): string {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.categoryId) queryParams.append('categoryId', params.categoryId.toString())
    if (params?.locationId) queryParams.append('locationId', params.locationId.toString())
    if (params?.departmentId) queryParams.append('departmentId', params.departmentId.toString())
    if (params?.status) queryParams.append('status', params.status)
    if (params?.conservationState) queryParams.append('conservationState', params.conservationState)
    if (params?.origin) queryParams.append('origin', params.origin)
    if (params?.includeDisposed) queryParams.append('includeDisposed', 'true')
    return queryParams.toString()
  }

  async getAssets(params?: GetAssetsParams): Promise<PaginatedAssetsResponse> {
    const query = this.buildQuery(params)
    const url = query ? `/assets?${query}` : '/assets'
    return await httpService.get<PaginatedAssetsResponse>(url)
  }

  async getAsset(id: number): Promise<Asset> {
    return await httpService.get<Asset>(`/assets/${id}`)
  }

  async getSummary(): Promise<AssetSummary> {
    return await httpService.get<AssetSummary>('/assets/summary')
  }

  async createAsset(payload: CreateAssetRequest): Promise<Asset> {
    return await httpService.post<Asset>('/assets', payload)
  }

  async updateAsset(id: number, payload: UpdateAssetRequest): Promise<Asset> {
    return await httpService.patch<Asset>(`/assets/${id}`, payload)
  }

  async disposeAsset(id: number, payload: DisposeAssetRequest): Promise<Asset> {
    return await httpService.post<Asset>(`/assets/${id}/dispose`, payload)
  }

  async reactivateAsset(id: number): Promise<Asset> {
    return await httpService.post<Asset>(`/assets/${id}/reactivate`, {})
  }

  async addAttachment(
    assetId: number,
    payload: CreateAssetAttachmentRequest,
  ): Promise<AssetAttachment> {
    return await httpService.post<AssetAttachment>(`/assets/${assetId}/attachments`, payload)
  }

  async removeAttachment(assetId: number, attachmentId: number): Promise<void> {
    await httpService.delete(`/assets/${assetId}/attachments/${attachmentId}`)
  }

  async downloadExcel(params?: GetAssetsParams): Promise<Blob> {
    const query = this.buildQuery(params)
    const url = query ? `/assets/export?${query}` : '/assets/export'
    return await httpService.getBlob(url)
  }

  async getCategories(): Promise<AssetCategory[]> {
    return await httpService.get<AssetCategory[]>('/asset-categories')
  }

  async createCategory(payload: CreateAssetCategoryRequest): Promise<AssetCategory> {
    return await httpService.post<AssetCategory>('/asset-categories', payload)
  }

  async updateCategory(id: number, payload: UpdateAssetCategoryRequest): Promise<AssetCategory> {
    return await httpService.patch<AssetCategory>(`/asset-categories/${id}`, payload)
  }

  async deleteCategory(id: number): Promise<void> {
    await httpService.delete(`/asset-categories/${id}`)
  }

  async getLocations(): Promise<AssetLocation[]> {
    return await httpService.get<AssetLocation[]>('/asset-locations')
  }

  async createLocation(payload: CreateAssetLocationRequest): Promise<AssetLocation> {
    return await httpService.post<AssetLocation>('/asset-locations', payload)
  }

  async updateLocation(id: number, payload: UpdateAssetLocationRequest): Promise<AssetLocation> {
    return await httpService.patch<AssetLocation>(`/asset-locations/${id}`, payload)
  }

  async deleteLocation(id: number): Promise<void> {
    await httpService.delete(`/asset-locations/${id}`)
  }
}

export const assetsService = new AssetsService()
