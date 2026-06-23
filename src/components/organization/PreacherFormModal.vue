<template>
  <BaseModal
    v-model="open"
    :title="preacher ? 'Editar Pregador' : 'Novo Pregador'"
    z-index="stacked"
    form
    :error="formError"
    @submit="save"
  >
    <div>
      <label class="block text-sm font-medium text-neutral-700 mb-1">Nome</label>
      <Input v-model="form.name" required placeholder="Ex.: Pr. João Silva" />
    </div>

    <div>
      <label class="block text-sm font-medium text-neutral-700 mb-1">Telefone</label>
      <Input
        v-model="form.phone"
        type="tel"
        placeholder="(00) 00000-0000"
        @input="handlePhoneInput"
      />
    </div>

    <PreacherPhotoUpload
      v-model:photo-url="form.photoUrl"
      v-model:photo-file="photoFile"
      :uploading="uploadingPhoto"
    />

    <Checkbox v-model="form.isActive">Ativo</Checkbox>

    <template #footer-actions>
      <button type="button" class="btn btn-secondary" @click="open = false">Cancelar</button>
      <ModalSubmitButton :loading="saving">Salvar</ModalSubmitButton>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseModal from '@/components/BaseModal.vue'
import Input from '@/components/Input.vue'
import Checkbox from '@/components/Checkbox.vue'
import ModalSubmitButton from '@/components/ModalSubmitButton.vue'
import PreacherPhotoUpload from '@/components/organization/PreacherPhotoUpload.vue'
import { organizationService, type Preacher } from '@/services/organization'
import { uploadFileToS3 } from '@/utils/s3Upload'
import { formatPhoneNumber } from '@/utils/phoneMask'

const open = defineModel<boolean>({ required: true })

const props = defineProps<{
  preacher?: Preacher | null
}>()

const emit = defineEmits<{
  (e: 'saved', preacher: Preacher): void
}>()

const saving = ref(false)
const uploadingPhoto = ref(false)
const formError = ref('')
const photoFile = ref<File | null>(null)
const form = ref({
  name: '',
  phone: '',
  photoUrl: null as string | null,
  isActive: true,
})

watch(
  () => [open.value, props.preacher] as const,
  ([isOpen, preacher]) => {
    if (!isOpen) return
    formError.value = ''
    photoFile.value = null
    form.value = {
      name: preacher?.name ?? '',
      phone: preacher?.phone ? formatPhoneNumber(preacher.phone) : '',
      photoUrl: preacher?.photoUrl ?? null,
      isActive: preacher?.isActive ?? true,
    }
  },
  { immediate: true },
)

function handlePhoneInput(event: Event) {
  const target = event.target as HTMLInputElement
  const formattedValue = formatPhoneNumber(target.value)
  target.value = formattedValue
  form.value.phone = formattedValue
}

async function save() {
  if (!form.value.name.trim()) {
    formError.value = 'Informe o nome do pregador'
    return
  }

  saving.value = true
  formError.value = ''

  try {
    let photoUrl = form.value.photoUrl

    if (photoFile.value) {
      uploadingPhoto.value = true
      const uploaded = await uploadFileToS3(photoFile.value)
      photoUrl = uploaded.fileUrl
      uploadingPhoto.value = false
    }

    const payload = {
      name: form.value.name.trim(),
      phone: form.value.phone.trim() || undefined,
      photoUrl: photoUrl || undefined,
      isActive: form.value.isActive,
    }

    const saved = props.preacher
      ? await organizationService.updatePreacher(props.preacher.id, payload)
      : await organizationService.createPreacher(payload)

    emit('saved', saved)
    open.value = false
  } catch (err: unknown) {
    formError.value = err instanceof Error ? err.message : 'Erro ao salvar pregador.'
  } finally {
    saving.value = false
    uploadingPhoto.value = false
  }
}
</script>
