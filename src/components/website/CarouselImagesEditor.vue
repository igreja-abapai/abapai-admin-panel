<template>
  <div>
    <div v-if="loading" class="text-sm text-neutral-500 mb-2">Carregando...</div>
    <div v-if="error" class="text-sm text-red-600 mb-2">{{ error }}</div>

    <div
      ref="scrollRef"
      class="overflow-x-auto cursor-grab"
      :class="{ 'cursor-grabbing select-none': isDragging }"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
      @mouseleave="onMouseUp"
      @touchstart.passive="onTouchStart"
      @touchmove.passive="onTouchMove"
      @touchend.passive="onTouchEnd"
    >
      <div class="flex gap-4 min-w-full">
        <div
          v-for="(image, idx) in images"
          :key="image._key"
          class="bg-white border border-neutral-200 rounded-lg p-4 shadow-sm w-[380px] flex-shrink-0"
        >
          <div class="space-y-4">
            <!-- Image Preview -->
            <div class="flex justify-center">
              <div class="w-full max-w-md aspect-video bg-neutral-100 rounded-lg overflow-hidden">
                <img
                  v-if="image.imageUrl"
                  :src="image.imageUrl"
                  alt="Carousel image"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center text-neutral-400">
                  Sem imagem
                </div>
              </div>
            </div>

            <!-- File Upload -->
            <div>
              <div class="relative">
                <input
                  :ref="`fileInput-${idx}`"
                  :data-ref="`fileInput-${idx}`"
                  type="file"
                  accept="image/*"
                  @change="handleImageUpload($event, idx)"
                  class="hidden"
                />
                <button
                  @click="() => openFileInput(idx)"
                  class="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  Selecionar Imagem
                </button>
              </div>
              <div v-if="image.uploadError" class="text-red-600 text-sm mt-1">
                {{ image.uploadError }}
              </div>
            </div>

            <!-- Form Fields -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-neutral-700 mb-1">URL do Link</label>
                <input
                  v-model="image.linkUrl"
                  type="url"
                  class="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-700 mb-1">Ativo</label>
                <select
                  v-model="image.isActive"
                  class="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                >
                  <option :value="true">Sim</option>
                  <option :value="false">Não</option>
                </select>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-center gap-2">
              <button
                @click="moveUp(idx)"
                class="px-2 py-1 rounded border border-neutral-300 text-sm"
                title="Mover para a esquerda"
              >
                ◀
              </button>
              <button
                @click="moveDown(idx)"
                class="px-2 py-1 rounded border border-neutral-300 text-sm"
                title="Mover para a direita"
              >
                ▶
              </button>
              <button
                @click="openInNewTab(image.imageUrl)"
                class="px-2 py-1 rounded border border-neutral-300 text-sm"
                title="Abrir em nova aba"
                :disabled="!image.imageUrl"
              >
                🔗
              </button>
              <button
                @click="removeImage(idx, image)"
                class="px-2 py-1 rounded bg-red-100 text-red-700 text-sm"
                title="Remover"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-4 flex justify-end">
      <button
        @click="addImage"
        class="px-3 py-1 bg-primary-500 text-white rounded hover:bg-primary-600"
      >
        Adicionar Imagem
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, defineExpose } from 'vue'
import {
  carouselImagesService,
  type CarouselImage,
  type CreateCarouselImageRequest,
  type UpdateCarouselImageRequest,
} from '@/services/carousel-images'
import { uploadFileToS3 } from '@/utils/s3Upload'

type EditableImage = {
  _key: string
  id?: number
  imageUrl: string
  linkUrl: string
  position: number
  isActive: boolean
  uploadError?: string
}

const images = reactive<EditableImage[]>([])
const loading = ref(false)
const error = ref('')

// Drag-to-scroll state
const scrollRef = ref<HTMLDivElement | null>(null)
const isDragging = ref(false)
let startX = 0
let scrollStartLeft = 0

function toEditable(img: CarouselImage): EditableImage {
  return {
    _key: `${img.id}-${Math.random().toString(36).slice(2, 8)}`,
    id: img.id,
    imageUrl: img.imageUrl,
    linkUrl: img.linkUrl || '',
    position: img.position ?? 0,
    isActive: img.isActive ?? true,
  }
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await carouselImagesService.list()
    images.splice(0, images.length, ...data.sort((a, b) => a.position - b.position).map(toEditable))
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Erro ao carregar imagens do carrossel'
  } finally {
    loading.value = false
  }
}

function addImage() {
  images.push({
    _key: `new-${Date.now()}`,
    imageUrl: '',
    linkUrl: '',
    position: images.length,
    isActive: true,
  })
}

function moveUp(index: number) {
  if (index <= 0) return
  const [item] = images.splice(index, 1)
  images.splice(index - 1, 0, item)
}

function moveDown(index: number) {
  if (index >= images.length - 1) return
  const [item] = images.splice(index, 1)
  images.splice(index + 1, 0, item)
}

async function removeImage(index: number, image: EditableImage) {
  if (image.id) {
    try {
      await carouselImagesService.remove(image.id)
    } catch {}
  }
  images.splice(index, 1)
}

async function handleImageUpload(event: Event, index: number) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  const image = images[index]
  image.uploadError = ''

  // Validate file type
  if (!file.type.startsWith('image/')) {
    image.uploadError = 'Por favor, selecione um arquivo de imagem válido'
    return
  }

  // Validate file size (10MB max)
  if (file.size > 10 * 1024 * 1024) {
    image.uploadError = 'O arquivo deve ter no máximo 10MB'
    return
  }

  try {
    const result = await uploadFileToS3(file)
    image.imageUrl = result.fileUrl
  } catch (err: any) {
    image.uploadError = 'Erro ao fazer upload da imagem: ' + (err.message || 'Erro desconhecido')
  }

  // Reset file input
  target.value = ''
}

function toPayload(
  image: EditableImage,
  position: number,
): CreateCarouselImageRequest | UpdateCarouselImageRequest {
  return {
    imageUrl: image.imageUrl,
    linkUrl: image.linkUrl || undefined,
    position,
    isActive: image.isActive,
  }
}

async function save() {
  error.value = ''
  try {
    for (let i = 0; i < images.length; i++) {
      const image = images[i]
      const payload = toPayload(image, i)
      if (image.id) {
        await carouselImagesService.update(image.id, payload)
      } else {
        const created = await carouselImagesService.create(payload as CreateCarouselImageRequest)
        image.id = created.id
      }
    }
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Erro ao salvar imagens do carrossel'
  } finally {
    await load()
  }
}

onMounted(load)

defineExpose({ save, load })

function onMouseDown(e: MouseEvent) {
  const el = scrollRef.value
  if (!el) return
  isDragging.value = true
  startX = e.pageX - el.offsetLeft
  scrollStartLeft = el.scrollLeft
}

function onMouseMove(e: MouseEvent) {
  const el = scrollRef.value
  if (!el || !isDragging.value) return
  const x = e.pageX - el.offsetLeft
  const walk = (x - startX) * 1
  el.scrollLeft = scrollStartLeft - walk
}

function onMouseUp() {
  isDragging.value = false
}

function onTouchStart(e: TouchEvent) {
  const el = scrollRef.value
  if (!el) return
  isDragging.value = true
  startX = e.touches[0].pageX - el.offsetLeft
  scrollStartLeft = el.scrollLeft
}

function onTouchMove(e: TouchEvent) {
  const el = scrollRef.value
  if (!el || !isDragging.value) return
  const x = e.touches[0].pageX - el.offsetLeft
  const walk = (x - startX) * 1
  el.scrollLeft = scrollStartLeft - walk
}

function onTouchEnd() {
  isDragging.value = false
}

function openFileInput(index: number) {
  const input = document.querySelector(`input[data-ref="fileInput-${index}"]`) as HTMLInputElement
  if (input) {
    input.click()
  }
}

function openInNewTab(url: string) {
  if (!url) return
  window.open(url, '_blank')
}
</script>
