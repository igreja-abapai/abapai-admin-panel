import { httpService } from './http'

export interface SignedUrlResponse {
  url: string
}

export const awsService = {
  async getSignedUrl(ext: string): Promise<SignedUrlResponse> {
    return await httpService.get<SignedUrlResponse>(`/aws/upload-url?ext=.${ext}`)
  },
}
