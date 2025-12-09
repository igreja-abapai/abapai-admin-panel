import { environment } from '@/config/environment'

/**
 * Converts an S3 URL to a proxy URL to avoid CORS issues.
 * If the URL is not an S3 URL, returns it unchanged.
 */
export function getImageUrl(url: string | undefined): string {
  if (!url) return ''

  try {
    const urlObj = new URL(url)
    const isS3Url =
      urlObj.hostname.includes('s3.') || urlObj.hostname.includes('amazonaws.com')

    if (isS3Url) {
      const key = urlObj.pathname.startsWith('/')
        ? urlObj.pathname.slice(1)
        : urlObj.pathname
      return `${environment.clientApiBaseUrl}/aws/image/${key}`
    }

    return url
  } catch {
    return url
  }
}

