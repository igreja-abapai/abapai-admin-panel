import html2pdf from 'html2pdf.js'

export interface GeneratePdfOptions {
  filename: string
  orientation?: 'portrait' | 'landscape'
}

function convertImageToBase64(img: HTMLImageElement, usePng = false): Promise<void> {
  return new Promise((resolve) => {
    const resolveOnce = () => resolve()

    if (img.src.startsWith('data:')) {
      resolveOnce()
      return
    }

    const timeout = setTimeout(resolveOnce, 5000)

    const convert = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          clearTimeout(timeout)
          resolveOnce()
          return
        }

        canvas.width = img.naturalWidth || img.width || 100
        canvas.height = img.naturalHeight || img.height || 100
        ctx.drawImage(img, 0, 0)
        img.src = usePng
          ? canvas.toDataURL('image/png')
          : canvas.toDataURL('image/jpeg', 0.95)
      } catch {
        // Continue without image conversion
      }

      clearTimeout(timeout)
      resolveOnce()
    }

    if (!img.complete || img.naturalHeight === 0) {
      img.addEventListener('load', convert, { once: true })
      img.addEventListener(
        'error',
        () => {
          clearTimeout(timeout)
          resolveOnce()
        },
        { once: true },
      )
      return
    }

    convert()
  })
}

function waitForImage(img: HTMLImageElement): Promise<void> {
  return new Promise((resolve) => {
    if (img.complete && img.naturalHeight > 0) {
      resolve()
      return
    }

    const timeout = setTimeout(resolve, 5000)
    img.addEventListener(
      'load',
      () => {
        clearTimeout(timeout)
        resolve()
      },
      { once: true },
    )
    img.addEventListener(
      'error',
      () => {
        clearTimeout(timeout)
        resolve()
      },
      { once: true },
    )
  })
}

async function prepareElementImages(element: HTMLElement): Promise<void> {
  const images = Array.from(element.querySelectorAll('img'))
  await Promise.all(images.map((img) => waitForImage(img)))
  await Promise.all(
    images.map((img) => {
      if (!img.hasAttribute('data-logo')) {
        return Promise.resolve()
      }
      return convertImageToBase64(img, true)
    }),
  )
}

export async function generatePdfFromElement(
  element: HTMLElement,
  options: GeneratePdfOptions,
): Promise<void> {
  await prepareElementImages(element)
  await document.fonts.ready
  await new Promise((resolve) => setTimeout(resolve, 300))

  const pdfOptions = {
    margin: [0, 0, 0, 0] as [number, number, number, number],
    filename: options.filename,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      letterRendering: true,
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4' as const,
      orientation: options.orientation ?? 'portrait',
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
  }

  await html2pdf().set(pdfOptions).from(element).save()
}
