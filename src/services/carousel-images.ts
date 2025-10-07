import { httpService } from './http'

export interface CarouselImage {
  id: number
  imageUrl: string
  linkUrl?: string
  position: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateCarouselImageRequest {
  imageUrl: string
  linkUrl?: string
  position?: number
  isActive?: boolean
}

export type UpdateCarouselImageRequest = Partial<CreateCarouselImageRequest>

export const carouselImagesService = {
  list(): Promise<CarouselImage[]> {
    return httpService.get<CarouselImage[]>('/carousel-images/admin')
  },
  create(payload: CreateCarouselImageRequest): Promise<CarouselImage> {
    return httpService.post<CarouselImage>('/carousel-images', payload)
  },
  update(id: number, payload: UpdateCarouselImageRequest): Promise<CarouselImage> {
    return httpService.put<CarouselImage>(`/carousel-images/${id}`, payload)
  },
  remove(id: number): Promise<void> {
    return httpService.delete<void>(`/carousel-images/${id}`)
  },
}
