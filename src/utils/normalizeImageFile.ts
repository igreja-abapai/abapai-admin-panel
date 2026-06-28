const NORMALIZABLE_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/webp'])

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = src
  })
}

async function canvasFromImageSource(
  source: CanvasImageSource,
  width: number,
  height: number,
): Promise<HTMLCanvasElement | null> {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(source, 0, 0, width, height)
  return canvas
}

async function canvasToFile(canvas: HTMLCanvasElement, file: File): Promise<File | null> {
  const mimeType = file.type === 'image/webp' ? 'image/webp' : 'image/jpeg'
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, mimeType, 0.95)
  })

  if (!blob) return null

  const extension = mimeType === 'image/webp' ? 'webp' : 'jpg'
  const baseName = file.name.replace(/\.[^.]+$/, '') || 'photo'

  return new File([blob], `${baseName}.${extension}`, {
    type: mimeType,
    lastModified: Date.now(),
  })
}

async function needsOrientationFix(file: File): Promise<boolean> {
  if (typeof createImageBitmap !== 'function') {
    return false
  }

  const raw = await createImageBitmap(file, { imageOrientation: 'none' })
  const oriented = await createImageBitmap(file, { imageOrientation: 'from-image' })

  const needsFix = raw.width !== oriented.width || raw.height !== oriented.height

  raw.close()
  oriented.close()

  return needsFix
}

async function normalizeWithImageBitmap(file: File): Promise<File | null> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })

  try {
    const canvas = await canvasFromImageSource(bitmap, bitmap.width, bitmap.height)
    if (!canvas) return null

    return canvasToFile(canvas, file)
  } finally {
    bitmap.close()
  }
}

async function normalizeWithImageElement(file: File): Promise<File | null> {
  const objectUrl = URL.createObjectURL(file)

  try {
    const img = await loadImageElement(objectUrl)
    const canvas = await canvasFromImageSource(img, img.naturalWidth, img.naturalHeight)
    if (!canvas) return null

    return canvasToFile(canvas, file)
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

/**
 * Applies EXIF orientation to pixel data only when needed.
 * Keeps the original file bytes when orientation is already correct.
 */
export async function normalizeImageFile(file: File): Promise<File> {
  if (!NORMALIZABLE_TYPES.has(file.type.toLowerCase())) {
    return file
  }

  try {
    const shouldNormalize = await needsOrientationFix(file)
    if (!shouldNormalize) {
      return file
    }

    const normalized =
      typeof createImageBitmap === 'function'
        ? await normalizeWithImageBitmap(file)
        : await normalizeWithImageElement(file)

    return normalized ?? file
  } catch {
    return file
  }
}

export async function normalizeImageFileWithPreview(file: File): Promise<{
  file: File
  previewDataUrl: string
}> {
  const normalized = await normalizeImageFile(file)
  const previewDataUrl = await readFileAsDataUrl(normalized)

  return { file: normalized, previewDataUrl }
}

const assetPhotoFrameBaseClass =
  'relative aspect-square rounded-lg overflow-hidden bg-neutral-100 shrink-0'

/** Preview no formulário de cadastro/edição */
export const assetPhotoUploadFrameClass = `${assetPhotoFrameBaseClass} w-32`

/** Miniatura na página de detalhes */
export const assetPhotoDisplayFrameClass = `${assetPhotoFrameBaseClass} w-36 sm:w-44`

/** Exibe a foto inteira, sem crop agressivo — combina bem com fotos verticais de celular */
export const assetPhotoImageClass =
  'absolute inset-0 block h-full w-full object-contain object-center'

/** @deprecated Use assetPhotoUploadFrameClass or assetPhotoDisplayFrameClass */
export const assetPhotoFrameClass = assetPhotoUploadFrameClass
