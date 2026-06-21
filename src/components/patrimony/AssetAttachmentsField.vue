<template>
  <div>
    <label v-if="showLabel" class="block text-sm font-medium text-neutral-700 mb-2">
      Documentos
    </label>
    <p v-if="showLabel" class="text-xs text-neutral-500 mb-3">
      Nota fiscal, recibo ou comprovante (PDF, XML ou imagem · máx. 10MB)
    </p>

    <ul v-if="allItems.length" class="space-y-2 mb-3">
      <li
        v-for="item in allItems"
        :key="item.key"
        class="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2"
      >
        <div class="min-w-0 flex-1">
          <a
            v-if="item.url"
            :href="item.url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-sm font-medium text-primary-600 hover:text-primary-700 truncate block"
          >
            {{ item.name }}
          </a>
          <span v-else class="text-sm font-medium text-neutral-900 truncate block">
            {{ item.name }}
          </span>
        </div>
        <button
          v-if="!disabled"
          type="button"
          class="text-sm text-red-600 hover:text-red-700 shrink-0"
          :disabled="item.removing || uploading"
          @click="removeItem(item)"
        >
          {{ item.removing ? 'Removendo...' : 'Remover' }}
        </button>
      </li>
    </ul>

    <p v-else class="text-sm text-neutral-500 mb-3">Nenhum documento anexado.</p>

    <input
      ref="fileInputRef"
      type="file"
      accept=".pdf,.xml,application/pdf,application/xml,text/xml,image/jpeg,image/png,image/webp"
      class="hidden"
      multiple
      @change="handleFilesSelected"
    />
    <button
      v-if="!disabled"
      type="button"
      class="btn btn-secondary text-sm"
      :disabled="uploading"
      @click="fileInputRef?.click()"
    >
      {{ uploading ? 'Enviando...' : 'Anexar documento' }}
    </button>

    <p v-if="error" class="mt-2 text-sm text-red-600">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { assetsService } from '@/services/assets'
import type { AssetAttachment } from '@/types/assets'
import { getFileUrl } from '@/utils/imageUrl'
import { isValidDocumentFile, isValidFileSize, uploadFileToS3 } from '@/utils/s3Upload'

export interface PendingAttachment {
  id: string
  file: File
  name: string
}

interface ListItem {
  key: string
  name: string
  url?: string
  attachmentId?: number
  pendingId?: string
  removing?: boolean
}

const props = withDefaults(
  defineProps<{
    assetId?: number | null
    attachments?: AssetAttachment[]
    showLabel?: boolean
    disabled?: boolean
  }>(),
  {
    assetId: null,
    attachments: () => [],
    showLabel: true,
    disabled: false,
  },
)

const pendingAttachments = defineModel<PendingAttachment[]>('pendingAttachments', {
  default: () => [],
})

const emit = defineEmits<{
  attachmentAdded: [attachment: AssetAttachment]
  attachmentRemoved: [attachmentId: number]
}>()

const fileInputRef = ref<HTMLInputElement>()
const uploading = ref(false)
const error = ref('')
const removingIds = ref<Set<number>>(new Set())

const allItems = computed<ListItem[]>(() => {
  const saved: ListItem[] = (props.attachments ?? []).map((attachment) => ({
    key: `saved-${attachment.id}`,
    name: attachment.fileName,
    url: getFileUrl(attachment.fileUrl),
    attachmentId: attachment.id,
    removing: removingIds.value.has(attachment.id),
  }))

  const pending: ListItem[] = pendingAttachments.value.map((item) => ({
    key: `pending-${item.id}`,
    name: item.name,
    pendingId: item.id,
  }))

  return [...saved, ...pending]
})

async function handleFilesSelected(event: Event) {
  const files = Array.from((event.target as HTMLInputElement).files ?? [])
  if (!files.length) return

  error.value = ''

  for (const file of files) {
    if (!isValidDocumentFile(file)) {
      error.value = 'Formato inválido. Use PDF, XML ou imagem.'
      continue
    }
    if (!isValidFileSize(file, 10)) {
      error.value = 'Cada arquivo deve ter no máximo 10MB.'
      continue
    }

    if (props.assetId) {
      await uploadAndSave(file)
    } else {
      pendingAttachments.value = [
        ...pendingAttachments.value,
        { id: crypto.randomUUID(), file, name: file.name },
      ]
    }
  }

  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

async function uploadAndSave(file: File) {
  if (!props.assetId) return

  uploading.value = true
  try {
    const uploaded = await uploadFileToS3(file)
    const attachment = await assetsService.addAttachment(props.assetId, {
      fileName: file.name,
      fileUrl: uploaded.fileUrl,
      mimeType: file.type || undefined,
      fileSize: file.size,
    })
    emit('attachmentAdded', attachment)
  } catch {
    error.value = 'Erro ao anexar documento.'
  } finally {
    uploading.value = false
  }
}

async function removeItem(item: ListItem) {
  error.value = ''

  if (item.pendingId) {
    pendingAttachments.value = pendingAttachments.value.filter(
      (pending) => pending.id !== item.pendingId,
    )
    return
  }

  if (!item.attachmentId || !props.assetId) return

  removingIds.value.add(item.attachmentId)
  try {
    await assetsService.removeAttachment(props.assetId, item.attachmentId)
    emit('attachmentRemoved', item.attachmentId)
  } catch {
    error.value = 'Erro ao remover documento.'
  } finally {
    removingIds.value.delete(item.attachmentId)
  }
}

/** Upload pending files after asset creation. Call from parent on save. */
async function uploadPending(assetId: number): Promise<void> {
  if (!pendingAttachments.value.length) return

  uploading.value = true
  error.value = ''

  try {
    for (const pending of pendingAttachments.value) {
      const uploaded = await uploadFileToS3(pending.file)
      const attachment = await assetsService.addAttachment(assetId, {
        fileName: pending.name,
        fileUrl: uploaded.fileUrl,
        mimeType: pending.file.type || undefined,
        fileSize: pending.file.size,
      })
      emit('attachmentAdded', attachment)
    }
    pendingAttachments.value = []
  } catch {
    error.value = 'Erro ao enviar documentos pendentes.'
    throw new Error(error.value)
  } finally {
    uploading.value = false
  }
}

defineExpose({ uploadPending })
</script>
