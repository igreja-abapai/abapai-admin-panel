<template>
  <div>
    <label v-if="showLabel" class="block text-sm font-medium text-neutral-700 mb-2">
      Foto do patrimônio
    </label>
    <div class="flex flex-col sm:flex-row items-start gap-4">
      <div
        :class="[assetPhotoUploadFrameClass, 'border-2 border-dashed border-neutral-300']"
      >
        <img
          v-if="displayPreview"
          :src="displayPreview"
          alt="Foto do patrimônio"
          :class="assetPhotoImageClass"
        />
        <div
          v-else
          class="absolute inset-0 flex flex-col items-center justify-center text-neutral-400 p-2"
        >
          <PhotoIcon class="w-8 h-8 mb-1" />
          <p class="text-xs text-center">Sem foto</p>
        </div>
        <div
          v-if="uploading || processing"
          class="absolute inset-0 bg-black/50 flex items-center justify-center"
        >
          <Spinner size="md" class="text-white" />
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <input
          ref="fileInputRef"
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          class="hidden"
          @change="handleFileChange"
        />
        <button
          type="button"
          class="btn btn-secondary text-sm"
          :disabled="uploading || processing || disabled"
          @click="fileInputRef?.click()"
        >
          {{ displayPreview ? 'Alterar foto' : 'Escolher foto' }}
        </button>
        <button
          v-if="displayPreview"
          type="button"
          class="text-sm text-red-600 hover:text-red-700 text-left"
          :disabled="uploading || processing || disabled"
          @click="removePhoto"
        >
          Remover foto
        </button>
        <p class="text-xs text-neutral-500">JPG, PNG, GIF ou WebP · máx. 5MB</p>
      </div>
    </div>
    <p v-if="error" class="mt-2 text-sm text-red-600">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { PhotoIcon } from '@heroicons/vue/24/outline'
import Spinner from '@/components/Spinner.vue'
import { getImageUrl } from '@/utils/imageUrl'
import {
  assetPhotoUploadFrameClass,
  assetPhotoImageClass,
  normalizeImageFileWithPreview,
} from '@/utils/normalizeImageFile'
import { isValidFileSize, isValidImageFile } from '@/utils/s3Upload'

const props = withDefaults(
  defineProps<{
    showLabel?: boolean
    disabled?: boolean
    uploading?: boolean
  }>(),
  {
    showLabel: true,
    disabled: false,
    uploading: false,
  },
)

const photoUrl = defineModel<string | null>('photoUrl', { default: null })
const photoFile = defineModel<File | null>('photoFile', { default: null })

const fileInputRef = ref<HTMLInputElement>()
const localPreview = ref('')
const processing = ref(false)
const error = ref('')

const displayPreview = computed(() => {
  if (localPreview.value) return localPreview.value
  if (photoUrl.value) return getImageUrl(photoUrl.value)
  return ''
})

watch(
  () => photoUrl.value,
  (url) => {
    if (!photoFile.value && url) {
      localPreview.value = ''
    }
  },
)

async function handleFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  error.value = ''

  if (!isValidImageFile(file)) {
    error.value = 'Selecione uma imagem válida (JPG, PNG, GIF ou WebP).'
    return
  }

  if (!isValidFileSize(file, 5)) {
    error.value = 'A imagem deve ter no máximo 5MB.'
    return
  }

  processing.value = true

  try {
    const { file: normalizedFile, previewDataUrl } = await normalizeImageFileWithPreview(file)
    photoFile.value = normalizedFile
    localPreview.value = previewDataUrl
  } catch {
    error.value = 'Não foi possível processar a imagem.'
    photoFile.value = null
    localPreview.value = ''
  } finally {
    processing.value = false
  }
}

function removePhoto() {
  photoUrl.value = null
  photoFile.value = null
  localPreview.value = ''
  error.value = ''
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

defineExpose({ error })
</script>
