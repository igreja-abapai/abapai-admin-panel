import axios from 'axios'
import { awsService } from '@/services/awsService'
import { httpService } from '@/services/http'

export interface S3UploadResult {
  fileUrl: string
  fileName: string
}

/**
 * Uploads a file to S3 using signed URL (direct upload)
 * @param file - The file to upload
 * @returns Promise with the uploaded file URL and name
 */
export const uploadFileToS3 = async (file: File): Promise<S3UploadResult> => {
  const ext = file.name.split('.').pop()

  if (!ext) {
    throw new Error('Arquivo deve ter uma extensão válida')
  }

  try {
    // Get signed URL from backend
    const { url: signedUrl } = await awsService.getSignedUrl(ext)

    // Upload file to S3
    await axios.put(signedUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
    })

    // Return the file URL without query parameters
    const fileUrl = signedUrl.split('?')[0]

    return {
      fileUrl,
      fileName: file.name,
    }
  } catch (error) {
    console.error('Error uploading file to S3:', error)
    throw new Error('Erro ao fazer upload do arquivo')
  }
}

/**
 * Uploads a file via backend proxy (alternative method to avoid CORS)
 * @param file - The file to upload
 * @returns Promise with the uploaded file URL and name
 */
export const uploadFileViaBackend = async (file: File): Promise<S3UploadResult> => {
  try {
    const formData = new FormData()
    formData.append('file', file)

    // Upload via backend endpoint (you'll need to create this endpoint)
    const response = await httpService.post<{ fileUrl: string }>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return {
      fileUrl: response.fileUrl,
      fileName: file.name,
    }
  } catch (error) {
    console.error('Error uploading file via backend:', error)
    throw new Error('Erro ao fazer upload do arquivo')
  }
}

/**
 * Uploads multiple files to S3
 * @param files - Array of files to upload
 * @returns Promise with array of uploaded file URLs and names
 */
export const uploadFilesToS3 = async (files: File[]): Promise<S3UploadResult[]> => {
  const uploadPromises = files.map(uploadFileToS3)
  return Promise.all(uploadPromises)
}

/**
 * Validates if file is a valid image type
 * @param file - File to validate
 * @returns boolean indicating if file is valid image
 */
export const isValidImageFile = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  return validTypes.includes(file.type)
}

/**
 * Validates file size (default max: 5MB)
 * @param file - File to validate
 * @param maxSizeInMB - Maximum size in MB (default: 5)
 * @returns boolean indicating if file size is valid
 */
export const isValidFileSize = (file: File, maxSizeInMB: number = 5): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024
  return file.size <= maxSizeInBytes
}
