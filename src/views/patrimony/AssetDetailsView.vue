<template>
  <div class="w-full">
    <div class="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <h1 class="text-neutral-900 font-medium text-[28px]">Detalhes do Patrimônio</h1>
      <div class="flex flex-wrap gap-2">
        <router-link to="/patrimonio/inventario" class="btn btn-secondary">
          <ArrowLeftIcon class="w-4 h-4 mr-2" />
          Voltar
        </router-link>
        <button
          v-if="canManage && asset && asset.status !== 'Baixado'"
          type="button"
          class="btn btn-primary"
          @click="openEditModal"
        >
          <PencilIcon class="w-4 h-4 mr-2" />
          Editar
        </button>
        <button
          v-if="canManage && asset && asset.status !== 'Baixado'"
          type="button"
          class="btn btn-secondary !text-red-600 !border-red-200 hover:!bg-red-50"
          @click="showDisposeModal = true"
        >
          Dar baixa
        </button>
        <button
          v-if="canManage && asset && asset.status === 'Baixado'"
          type="button"
          class="btn btn-primary"
          @click="handleReactivate"
        >
          Reativar
        </button>
      </div>
    </div>

    <div v-if="loading" class="bg-white rounded-lg shadow p-6">
      <div class="text-center py-8">
        <Spinner size="xl" class="text-primary-600 mx-auto mb-4" />
        <p class="text-neutral-500">Carregando detalhes...</p>
      </div>
    </div>

    <div v-else-if="error" class="bg-white rounded-lg shadow p-6">
      <div class="text-center py-8">
        <p class="text-neutral-500">{{ error }}</p>
        <button type="button" class="btn btn-primary mt-4" @click="loadAsset">Tentar Novamente</button>
      </div>
    </div>

    <template v-else-if="asset">
      <div class="space-y-6">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex flex-col sm:flex-row sm:items-start gap-6">
            <button
              v-if="asset.photoUrl"
              type="button"
              :class="[
                assetPhotoDisplayFrameClass,
                'border border-neutral-200 cursor-zoom-in transition-all duration-200 ease-out hover:shadow-md hover:brightness-[0.97] active:scale-[0.99]',
              ]"
              aria-label="Ampliar foto do patrimônio"
              @click="showPhotoLightbox = true"
            >
              <img
                :src="getImageUrl(asset.photoUrl)"
                :alt="asset.description"
                :class="assetPhotoImageClass"
                decoding="async"
              />
            </button>
            <div
              v-else
              :class="[assetPhotoDisplayFrameClass, 'border border-neutral-200']"
            >
              <div
                class="absolute inset-0 flex flex-col items-center justify-center text-neutral-400"
              >
                <PhotoIcon class="w-10 h-10" />
                <p class="text-xs mt-2">Sem foto</p>
              </div>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm text-neutral-500">{{ asset.code }}</p>
              <h2 class="text-2xl font-semibold text-neutral-900 mt-1">{{ asset.description }}</h2>
              <div class="flex flex-wrap items-center gap-2 mt-3">
                <span
                  :class="[
                    'inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium',
                    getAssetStatusBadgeClass(asset.status),
                  ]"
                >
                  {{ asset.status }}
                </span>
                <span
                  v-if="asset.conservationState"
                  :class="[
                    'inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium',
                    getAssetConservationBadgeClass(asset.conservationState),
                  ]"
                >
                  {{ asset.conservationState }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-base font-semibold text-neutral-900 mb-4">Informações gerais</h2>
          <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <dt class="text-xs font-semibold uppercase tracking-wide text-neutral-500">Categoria</dt>
              <dd class="text-sm text-neutral-900 mt-1">{{ asset.category?.name ?? '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs font-semibold uppercase tracking-wide text-neutral-500">Local</dt>
              <dd class="text-sm text-neutral-900 mt-1">{{ asset.location?.name ?? '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs font-semibold uppercase tracking-wide text-neutral-500">Departamento</dt>
              <dd class="text-sm text-neutral-900 mt-1">{{ asset.department?.name ?? '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs font-semibold uppercase tracking-wide text-neutral-500">Responsável</dt>
              <dd class="text-sm text-neutral-900 mt-1">{{ formatAssetResponsible(asset) }}</dd>
            </div>
            <div>
              <dt class="text-xs font-semibold uppercase tracking-wide text-neutral-500">Quantidade</dt>
              <dd class="text-sm text-neutral-900 mt-1">{{ asset.quantity }}</dd>
            </div>
            <div>
              <dt class="text-xs font-semibold uppercase tracking-wide text-neutral-500">Origem</dt>
              <dd class="text-sm text-neutral-900 mt-1">{{ asset.origin ?? '—' }}</dd>
            </div>
          </dl>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-base font-semibold text-neutral-900 mb-4">Aquisição</h2>
          <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <dt class="text-xs font-semibold uppercase tracking-wide text-neutral-500">Data</dt>
              <dd class="text-sm text-neutral-900 mt-1">{{ formatDate(asset.acquisitionDate) }}</dd>
            </div>
            <div>
              <dt class="text-xs font-semibold uppercase tracking-wide text-neutral-500">Valor unitário</dt>
              <dd class="text-sm text-neutral-900 mt-1">
                {{ formatCurrency(asset.acquisitionValue) }}
              </dd>
            </div>
            <div>
              <dt class="text-xs font-semibold uppercase tracking-wide text-neutral-500">Valor total</dt>
              <dd class="text-sm text-neutral-900 mt-1">
                {{
                  formatCurrency(
                    asset.acquisitionValue
                      ? Number(asset.acquisitionValue) * asset.quantity
                      : null,
                  )
                }}
              </dd>
            </div>
            <div>
              <dt class="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Fornecedor / Doador
              </dt>
              <dd class="text-sm text-neutral-900 mt-1">{{ asset.supplierOrDonor ?? '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Nº da nota / cupom
              </dt>
              <dd class="text-sm text-neutral-900 mt-1">{{ asset.invoiceNumber ?? '—' }}</dd>
            </div>
          </dl>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-base font-semibold text-neutral-900 mb-4">Documentos</h2>
          <AssetAttachmentsField
            :asset-id="asset.id"
            :attachments="asset.attachments ?? []"
            :disabled="!canManage"
            :show-label="false"
            @attachment-added="handleAttachmentAdded"
            @attachment-removed="handleAttachmentRemoved"
          />
        </div>

        <div v-if="asset.status === 'Baixado'" class="bg-white rounded-lg shadow p-6">
          <h2 class="text-base font-semibold text-neutral-900 mb-4">Baixa</h2>
          <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <dt class="text-xs font-semibold uppercase tracking-wide text-neutral-500">Data</dt>
              <dd class="text-sm text-neutral-900 mt-1">{{ formatDate(asset.disposedAt) }}</dd>
            </div>
            <div>
              <dt class="text-xs font-semibold uppercase tracking-wide text-neutral-500">Motivo</dt>
              <dd class="text-sm text-neutral-900 mt-1">{{ asset.disposalReason ?? '—' }}</dd>
            </div>
            <div class="sm:col-span-2">
              <dt class="text-xs font-semibold uppercase tracking-wide text-neutral-500">Observações</dt>
              <dd class="text-sm text-neutral-900 mt-1">{{ asset.disposalNotes ?? '—' }}</dd>
            </div>
          </dl>
        </div>

        <div v-if="asset.notes" class="bg-white rounded-lg shadow p-6">
          <h2 class="text-base font-semibold text-neutral-900 mb-2">Observações</h2>
          <p class="text-sm text-neutral-700 whitespace-pre-wrap">{{ asset.notes }}</p>
        </div>
      </div>
    </template>

    <BaseModal
      v-model="showEditModal"
      title="Editar patrimônio"
      max-width="xl"
      form
      :error="formError"
      @submit="saveAsset"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="md:col-span-2">
          <AssetPhotoUpload
            v-model:photo-url="photoUrl"
            v-model:photo-file="photoFile"
            :uploading="uploadingPhoto"
          />
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-neutral-700 mb-1">
            Descrição <span class="text-red-500">*</span>
          </label>
          <Input v-model="form.description" required />
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">
            Categoria <span class="text-red-500">*</span>
          </label>
          <Select
            v-model="form.categoryId"
            :options="categoryOptions"
            placeholder="Selecione"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">
            Local <span class="text-red-500">*</span>
          </label>
          <Select
            v-model="form.locationId"
            :options="locationOptions"
            placeholder="Selecione"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">Departamento</label>
          <Select v-model="form.departmentId" :options="departmentOptions" allow-empty />
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">Responsável (membro)</label>
          <Select v-model="form.responsibleMemberId" :options="memberOptions" allow-empty />
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">Responsável (texto)</label>
          <Input v-model="form.responsibleName" />
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">
            Quantidade <span class="text-red-500">*</span>
          </label>
          <Input v-model.number="form.quantity" type="number" min="1" required />
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">Origem</label>
          <Select v-model="form.origin" :options="originOptions" allow-empty />
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">Data de aquisição</label>
          <DatePickerInput
            v-model="form.acquisitionDate"
            placeholder="dd/mm/aaaa"
            format="dd/MM/yyyy"
            locale="pt-BR"
            select-text="Selecionar"
            cancel-text="Cancelar"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">Valor de aquisição (Unitário)</label>
          <Input v-model.number="form.acquisitionValue" type="number" min="0" step="0.01" />
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">Fornecedor / Doador</label>
          <Input v-model="form.supplierOrDonor" />
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">
            Nº da nota / cupom
          </label>
          <Input
            v-model="form.invoiceNumber"
            placeholder="Ex.: NF 123456 ou Cupom 4582"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">
            Situação <span class="text-red-500">*</span>
          </label>
          <Select v-model="form.status" :options="statusOptions" />
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">Conservação</label>
          <Select v-model="form.conservationState" :options="conservationOptions" allow-empty />
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-neutral-700 mb-1">Observações</label>
          <Input v-model="form.notes" />
        </div>
      </div>
      <template #footer-actions>
        <button type="button" class="btn btn-secondary" @click="showEditModal = false">Cancelar</button>
        <ModalSubmitButton :loading="saving">Salvar</ModalSubmitButton>
      </template>
    </BaseModal>

    <BaseModal
      v-model="showDisposeModal"
      title="Dar baixa no patrimônio"
      form
      :error="disposeError"
      @submit="confirmDispose"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">Data da baixa</label>
          <DatePickerInput
            v-model="disposeForm.disposedAt"
            placeholder="dd/mm/aaaa"
            format="dd/MM/yyyy"
            locale="pt-BR"
            select-text="Selecionar"
            cancel-text="Cancelar"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">
            Motivo <span class="text-red-500">*</span>
          </label>
          <Select
            v-model="disposeForm.disposalReason"
            :options="disposalReasonOptions"
            placeholder="Selecione"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">Observações</label>
          <Input v-model="disposeForm.disposalNotes" />
        </div>
      </div>
      <template #footer-actions>
        <button type="button" class="btn btn-secondary" @click="showDisposeModal = false">
          Cancelar
        </button>
        <ModalSubmitButton :loading="disposing" class="!bg-red-600 hover:!bg-red-700">
          Confirmar baixa
        </ModalSubmitButton>
      </template>
    </BaseModal>

    <ImageLightbox
      v-if="asset?.photoUrl"
      v-model="showPhotoLightbox"
      :src="getImageUrl(asset.photoUrl)"
      :alt="asset.description"
      :caption="`${asset.code} · ${asset.description}`"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeftIcon, PencilIcon, PhotoIcon } from '@heroicons/vue/24/outline'
import DatePickerInput from '@/components/DatePickerInput.vue'
import AssetAttachmentsField from '@/components/patrimony/AssetAttachmentsField.vue'
import AssetPhotoUpload from '@/components/patrimony/AssetPhotoUpload.vue'
import Spinner from '@/components/Spinner.vue'
import Input from '@/components/Input.vue'
import Select from '@/components/Select.vue'
import BaseModal from '@/components/BaseModal.vue'
import ImageLightbox from '@/components/ImageLightbox.vue'
import ModalSubmitButton from '@/components/ModalSubmitButton.vue'
import { assetsService } from '@/services/assets'
import { organizationService } from '@/services/organization'
import { membersService } from '@/services/members'
import type {
  Asset,
  AssetAttachment,
  AssetConservationState,
  AssetDisposalReason,
  AssetOrigin,
  AssetStatus,
} from '@/types/assets'
import {
  AssetConservationStateEnum,
  AssetDisposalReasonEnum,
  AssetOriginEnum,
  AssetStatusEnum,
  enumToSelectOptions,
  formatAssetResponsible,
  formatCurrency,
  getAssetConservationBadgeClass,
  getAssetStatusBadgeClass,
} from '@/constants/assets'
import { useAuthStore } from '@/stores/auth'
import { getImageUrl } from '@/utils/imageUrl'
import { assetPhotoDisplayFrameClass, assetPhotoImageClass } from '@/utils/normalizeImageFile'
import { uploadFileToS3 } from '@/utils/s3Upload'

const route = useRoute()
const authStore = useAuthStore()
const canManage = computed(() => authStore.hasPermission('gerenciar_patrimonio'))

const loading = ref(true)
const saving = ref(false)
const disposing = ref(false)
const error = ref('')
const formError = ref('')
const disposeError = ref('')
const asset = ref<Asset | null>(null)

const photoUrl = ref<string | null>(null)
const photoFile = ref<File | null>(null)
const uploadingPhoto = ref(false)

const showEditModal = ref(false)
const showDisposeModal = ref(false)
const showPhotoLightbox = ref(false)

const categories = ref<{ id: number; name: string }[]>([])
const locations = ref<{ id: number; name: string }[]>([])
const departments = ref<{ id: number; name: string }[]>([])
const members = ref<{ id: string; name: string }[]>([])

const form = ref({
  description: '',
  categoryId: '',
  locationId: '',
  departmentId: '',
  responsibleMemberId: '',
  responsibleName: '',
  quantity: 1,
  acquisitionDate: null as Date | null,
  acquisitionValue: null as number | null,
  origin: '' as AssetOrigin | '',
  supplierOrDonor: '',
  invoiceNumber: '',
  status: 'Em uso' as AssetStatus,
  conservationState: '' as AssetConservationState | '',
  notes: '',
})

const disposeForm = ref({
  disposedAt: new Date() as Date | null,
  disposalReason: '' as AssetDisposalReason | '',
  disposalNotes: '',
})

const categoryOptions = computed(() =>
  categories.value.map((c) => ({ value: String(c.id), label: c.name })),
)
const locationOptions = computed(() =>
  locations.value.map((l) => ({ value: String(l.id), label: l.name })),
)
const departmentOptions = computed(() =>
  departments.value.map((d) => ({ value: String(d.id), label: d.name })),
)
const memberOptions = computed(() =>
  members.value.map((m) => ({ value: String(m.id), label: m.name })),
)
const originOptions = enumToSelectOptions(AssetOriginEnum)
const statusOptions = enumToSelectOptions(AssetStatusEnum)
const conservationOptions = enumToSelectOptions(AssetConservationStateEnum)
const disposalReasonOptions = enumToSelectOptions(AssetDisposalReasonEnum)

function formatDate(value?: string | null): string {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('pt-BR')
}

function dateToIsoDate(d: Date | null): string | undefined {
  if (!d) return undefined
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  const day = d.getDate()
  return `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

async function loadReferenceData() {
  const [cats, locs, deps, mems] = await Promise.all([
    assetsService.getCategories(),
    assetsService.getLocations(),
    organizationService.getDepartments(),
    membersService.getMembers({ isPaginated: false, isActive: true }),
  ])
  categories.value = cats.filter((c) => c.isActive)
  locations.value = locs.filter((l) => l.isActive)
  departments.value = deps.filter((d) => d.isActive).map((d) => ({ id: d.id, name: d.name }))
  members.value = mems.data.map((m) => ({ id: m.id, name: m.name }))
}

async function loadAsset() {
  loading.value = true
  error.value = ''
  try {
    const id = Number(route.params.id)
    asset.value = await assetsService.getAsset(id)
  } catch {
    error.value = 'Patrimônio não encontrado.'
    asset.value = null
  } finally {
    loading.value = false
  }
}

function openEditModal() {
  if (!asset.value) return
  photoUrl.value = asset.value.photoUrl ?? null
  photoFile.value = null
  form.value = {
    description: asset.value.description,
    categoryId: String(asset.value.categoryId),
    locationId: String(asset.value.locationId),
    departmentId: asset.value.departmentId ? String(asset.value.departmentId) : '',
    responsibleMemberId: asset.value.responsibleMemberId
      ? String(asset.value.responsibleMemberId)
      : '',
    responsibleName: asset.value.responsibleName ?? '',
    quantity: asset.value.quantity,
    acquisitionDate: asset.value.acquisitionDate ? new Date(asset.value.acquisitionDate) : null,
    acquisitionValue: asset.value.acquisitionValue ? Number(asset.value.acquisitionValue) : null,
    origin: asset.value.origin ?? '',
    supplierOrDonor: asset.value.supplierOrDonor ?? '',
    invoiceNumber: asset.value.invoiceNumber ?? '',
    status: asset.value.status,
    conservationState: asset.value.conservationState ?? '',
    notes: asset.value.notes ?? '',
  }
  formError.value = ''
  showEditModal.value = true
}

function handleAttachmentAdded(attachment: AssetAttachment) {
  if (!asset.value) return
  asset.value.attachments = [attachment, ...(asset.value.attachments ?? [])]
}

function handleAttachmentRemoved(attachmentId: number) {
  if (!asset.value?.attachments) return
  asset.value.attachments = asset.value.attachments.filter((item) => item.id !== attachmentId)
}

async function saveAsset() {
  if (!asset.value) return
  if (form.value.origin === 'Compra' && (!form.value.acquisitionValue || form.value.acquisitionValue <= 0)) {
    formError.value = 'Valor de aquisição é obrigatório para origem Compra.'
    return
  }
  saving.value = true
  formError.value = ''
  try {
    let resolvedPhotoUrl = photoUrl.value
    if (photoFile.value) {
      uploadingPhoto.value = true
      const uploaded = await uploadFileToS3(photoFile.value)
      resolvedPhotoUrl = uploaded.fileUrl
    }

    asset.value = await assetsService.updateAsset(asset.value.id, {
      description: form.value.description,
      categoryId: Number(form.value.categoryId),
      locationId: Number(form.value.locationId),
      departmentId: form.value.departmentId ? Number(form.value.departmentId) : null,
      responsibleMemberId: form.value.responsibleMemberId
        ? Number(form.value.responsibleMemberId)
        : null,
      responsibleName: form.value.responsibleName || null,
      quantity: form.value.quantity,
      acquisitionDate: dateToIsoDate(form.value.acquisitionDate) ?? null,
      acquisitionValue: form.value.acquisitionValue ?? null,
      origin: form.value.origin || null,
      supplierOrDonor: form.value.supplierOrDonor || null,
      invoiceNumber: form.value.invoiceNumber || null,
      photoUrl: resolvedPhotoUrl ?? null,
      status: form.value.status,
      conservationState: form.value.conservationState
        ? (form.value.conservationState as AssetConservationState)
        : null,
      notes: form.value.notes || null,
    })
    showEditModal.value = false
  } catch {
    formError.value = 'Erro ao salvar patrimônio.'
  } finally {
    uploadingPhoto.value = false
    saving.value = false
  }
}

async function confirmDispose() {
  if (!asset.value || !disposeForm.value.disposalReason) {
    disposeError.value = 'Informe o motivo da baixa.'
    return
  }
  disposing.value = true
  disposeError.value = ''
  try {
    asset.value = await assetsService.disposeAsset(asset.value.id, {
      disposedAt: dateToIsoDate(disposeForm.value.disposedAt) ?? '',
      disposalReason: disposeForm.value.disposalReason,
      disposalNotes: disposeForm.value.disposalNotes || undefined,
    })
    showDisposeModal.value = false
  } catch {
    disposeError.value = 'Erro ao dar baixa.'
  } finally {
    disposing.value = false
  }
}

async function handleReactivate() {
  if (!asset.value) return
  try {
    asset.value = await assetsService.reactivateAsset(asset.value.id)
  } catch {
    error.value = 'Erro ao reativar patrimônio.'
  }
}

onMounted(async () => {
  await Promise.all([loadReferenceData(), loadAsset()])
})
</script>
