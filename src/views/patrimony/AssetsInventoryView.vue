<template>
  <div class="w-full">
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div>
        <h1 class="text-neutral-900 font-semibold text-[28px] leading-tight">Inventário</h1>
        <p class="text-sm text-neutral-500 mt-1">
          Cadastro e controle dos bens patrimoniais da igreja.
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button type="button" class="btn btn-secondary" @click="openExportModal">
          <ArrowDownTrayIcon class="w-4 h-4 mr-2" />
          Exportar
        </button>
        <button v-if="canManage" type="button" class="btn btn-primary" @click="openAssetModal()">
          <PlusIcon class="w-4 h-4 mr-2" />
          Novo patrimônio
        </button>
      </div>
    </div>

    <div v-if="summary" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <div class="bg-white rounded-lg shadow p-4">
        <p class="text-sm text-neutral-500">Itens ativos</p>
        <p class="text-2xl font-semibold text-neutral-900 mt-1">{{ summary.activeCount }}</p>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <p class="text-sm text-neutral-500">Quantidade total</p>
        <p class="text-2xl font-semibold text-neutral-900 mt-1">{{ summary.totalQuantity }}</p>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <p class="text-sm text-neutral-500">Valor total de aquisição</p>
        <p class="text-2xl font-semibold text-green-700 mt-1">
          {{ formatCurrency(summary.totalAcquisitionValue) }}
        </p>
      </div>
    </div>

    <DataTable
      :card="true"
      :clickable="true"
      :search="searchInput"
      search-placeholder="Buscar por código ou descrição..."
      :total-count="total"
      total-label="Patrimônio"
      show-filters
      :active-filters-count="activeFiltersCount"
      :error="error || undefined"
      :data="assets"
      :headers="headers"
      :is-loading="loading"
      :pagination="paginationInfo"
      min-width="1100px"
      row-key="id"
      @update:search="searchInput = $event"
      @filters-click="openFiltersModal"
      @page-change="handlePageChange"
      @row-click="goToAsset"
    >
      <template #column-code="{ item }">
        <span class="text-sm font-medium text-neutral-900">{{ (item as Asset).code }}</span>
      </template>
      <template #column-description="{ item }">
        <span class="text-sm text-neutral-700">{{ (item as Asset).description }}</span>
      </template>
      <template #column-category="{ item }">
        <span class="text-sm text-neutral-700">{{ (item as Asset).category?.name ?? '—' }}</span>
      </template>
      <template #column-location="{ item }">
        <span class="text-sm text-neutral-700">{{ (item as Asset).location?.name ?? '—' }}</span>
      </template>
      <template #column-quantity="{ item }">
        <span class="text-sm text-neutral-700 tabular-nums">{{ (item as Asset).quantity }}</span>
      </template>
      <template #column-acquisitionValue="{ item }">
        <span class="text-sm text-neutral-700 tabular-nums">
          {{ formatCurrency((item as Asset).acquisitionValue) }}
        </span>
      </template>
      <template #column-status="{ item }">
        <span
          :class="[
            'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
            getAssetStatusBadgeClass((item as Asset).status),
          ]"
        >
          {{ (item as Asset).status }}
        </span>
      </template>
      <template #actions="{ item }">
        <RowActionMenu
          v-if="canManage"
          :actions="getAssetActions(item as Asset)"
          aria-label="Opções"
          :menu-width="176"
        />
      </template>
    </DataTable>

    <BaseModal
      v-model="showAssetModal"
      :title="editingAsset ? 'Editar patrimônio' : 'Novo patrimônio'"
      max-width="2xl"
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
          <Input v-model="assetForm.description" required />
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">
            Categoria <span class="text-red-500">*</span>
          </label>
          <Select
            v-model="assetForm.categoryId"
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
            v-model="assetForm.locationId"
            :options="locationOptions"
            placeholder="Selecione"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">Departamento</label>
          <Select
            v-model="assetForm.departmentId"
            :options="departmentOptions"
            allow-empty
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">Responsável (membro)</label>
          <Select
            v-model="assetForm.responsibleMemberId"
            :options="memberOptions"
            allow-empty
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">Responsável (texto)</label>
          <Input v-model="assetForm.responsibleName" />
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">
            Quantidade <span class="text-red-500">*</span>
          </label>
          <Input v-model.number="assetForm.quantity" type="number" min="1" required />
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">Origem</label>
          <Select v-model="assetForm.origin" :options="originOptions" allow-empty />
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">Data de aquisição</label>
          <DatePickerInput
            v-model="assetForm.acquisitionDate"
            placeholder="dd/mm/aaaa"
            format="dd/MM/yyyy"
            locale="pt-BR"
            select-text="Selecionar"
            cancel-text="Cancelar"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">
            Valor de aquisição (Unitário)
            <span v-if="assetForm.origin === 'Compra'" class="text-red-500">*</span>
          </label>
          <Input
            v-model="acquisitionValueInput"
            inputmode="decimal"
            placeholder="R$ 0,00"
            @update:model-value="handleAcquisitionValueInput"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">Fornecedor / Doador</label>
          <Input v-model="assetForm.supplierOrDonor" />
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">
            Nº da nota / cupom
          </label>
          <Input
            v-model="assetForm.invoiceNumber"
            placeholder="Ex.: NF 123456 ou Cupom 4582"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">
            Situação <span class="text-red-500">*</span>
          </label>
          <Select v-model="assetForm.status" :options="statusOptions" />
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">Conservação</label>
          <Select v-model="assetForm.conservationState" :options="conservationOptions" allow-empty />
        </div>
        <div class="md:col-span-2">
          <AssetAttachmentsField
            ref="attachmentsFieldRef"
            v-model:pending-attachments="pendingAttachments"
            :asset-id="editingAsset?.id ?? null"
            :attachments="modalAttachments"
            @attachment-added="handleAttachmentAdded"
            @attachment-removed="handleAttachmentRemoved"
          />
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-neutral-700 mb-1">Observações</label>
          <Input v-model="assetForm.notes" />
        </div>
      </div>
      <template #footer-actions>
        <button type="button" class="btn btn-secondary" @click="showAssetModal = false">
          Cancelar
        </button>
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
      <p v-if="disposingAsset" class="text-sm text-neutral-600 mb-4">
        {{ disposingAsset.code }} — {{ disposingAsset.description }}
      </p>
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

    <BaseModal
      v-model="filtersModalOpen"
      title="Filtros"
      max-width="md"
      @close="closeFiltersModal"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-2">Categoria</label>
          <Select
            v-model="filterCategoryIdDraft"
            :options="categoryFilterOptions"
            placeholder="Todas"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-2">Local</label>
          <Select
            v-model="filterLocationIdDraft"
            :options="locationFilterOptions"
            placeholder="Todos"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-2">Situação</label>
          <Select
            v-model="filterStatusDraft"
            :options="statusFilterOptions"
            placeholder="Todas"
          />
        </div>
        <Checkbox v-model="includeDisposedDraft">Mostrar baixados</Checkbox>
      </div>

      <template #footer-summary>
        <button
          type="button"
          class="text-sm font-medium text-neutral-600 hover:text-neutral-900"
          @click="clearFilters"
        >
          Limpar filtros
        </button>
      </template>
      <template #footer-actions>
        <button type="button" class="btn btn-secondary" @click="closeFiltersModal">
          Cancelar
        </button>
        <button type="button" class="btn btn-primary" @click="applyFiltersModal">
          Aplicar
        </button>
      </template>
    </BaseModal>

    <BaseModal
      v-model="showExportModal"
      title="Exportar inventário"
      subtitle="Escolha o formato para exportar os itens com os filtros aplicados."
      max-width="md"
      form
      :error="exportError"
      @submit="confirmExport"
    >
      <template #icon>
        <ArrowDownTrayIcon class="h-5 w-5" />
      </template>

      <div>
        <label class="block text-sm font-medium text-neutral-700 mb-1">Formato</label>
        <Select v-model="exportFormat" :options="exportFormatOptions" />
      </div>

      <template #footer-actions>
        <button type="button" class="btn btn-secondary" @click="showExportModal = false">
          Cancelar
        </button>
        <ModalSubmitButton :loading="exporting">
          <template #icon>
            <ArrowDownTrayIcon class="h-4 w-4" />
          </template>
          Exportar
        </ModalSubmitButton>
      </template>
    </BaseModal>

    <div style="position: absolute; left: -9999px; top: 0; width: 297mm" ref="pdfContainerRef">
      <AssetInventoryPdf
        v-if="pdfAssets.length > 0"
        :assets="pdfAssets"
        :generated-at="pdfGeneratedAt"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { PlusIcon, PencilIcon, TrashIcon, ArrowDownTrayIcon } from '@heroicons/vue/24/outline'
import DatePickerInput from '@/components/DatePickerInput.vue'
import DataTable, { type TableHeader } from '@/components/DataTable.vue'
import RowActionMenu, { type RowActionMenuItem } from '@/components/RowActionMenu.vue'
import Input from '@/components/Input.vue'
import Select from '@/components/Select.vue'
import Checkbox from '@/components/Checkbox.vue'
import BaseModal from '@/components/BaseModal.vue'
import ModalSubmitButton from '@/components/ModalSubmitButton.vue'
import AssetInventoryPdf from '@/components/patrimony/AssetInventoryPdf.vue'
import AssetPhotoUpload from '@/components/patrimony/AssetPhotoUpload.vue'
import AssetAttachmentsField, {
  type PendingAttachment,
} from '@/components/patrimony/AssetAttachmentsField.vue'
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
  AssetSummary,
} from '@/types/assets'
import {
  AssetConservationStateEnum,
  AssetDisposalReasonEnum,
  AssetOriginEnum,
  AssetStatusEnum,
  enumToSelectOptions,
  formatCurrency,
  getAssetStatusBadgeClass,
} from '@/constants/assets'
import { useAuthStore } from '@/stores/auth'
import { useDebouncedRef } from '@/composables/useDebouncedRef'
import { generatePdfFromElement } from '@/utils/generatePdf'
import { uploadFileToS3 } from '@/utils/s3Upload'
import {
  formatBRLInput,
  formatNumberToBRLInput,
  parseBRLInputToNumber,
} from '@/utils/currencyInput'

const router = useRouter()
const authStore = useAuthStore()
const canManage = computed(() => authStore.hasPermission('gerenciar_patrimonio'))

const loading = ref(false)
const saving = ref(false)
const disposing = ref(false)
const error = ref('')
const formError = ref('')
const disposeError = ref('')

const { value: searchInput, debounced: searchTerm } = useDebouncedRef('')
const assets = ref<Asset[]>([])
const summary = ref<AssetSummary | null>(null)
const page = ref(1)
const limit = ref(10)
const total = ref(0)

const filterCategoryIdDraft = ref('')
const filterLocationIdDraft = ref('')
const filterStatusDraft = ref<AssetStatus | ''>('')
const includeDisposedDraft = ref(false)

const appliedFilterCategoryId = ref('')
const appliedFilterLocationId = ref('')
const appliedFilterStatus = ref<AssetStatus | ''>('')
const appliedIncludeDisposed = ref(false)

const filtersModalOpen = ref(false)

const showExportModal = ref(false)
const exportFormat = ref<'excel' | 'pdf'>('excel')
const exportError = ref('')
const exporting = ref(false)

const exportFormatOptions = [
  { value: 'excel', label: 'Excel (.xlsx)' },
  { value: 'pdf', label: 'PDF (.pdf)' },
]

const activeFiltersCount = computed(() => {
  let count = 0
  if (appliedFilterCategoryId.value) count++
  if (appliedFilterLocationId.value) count++
  if (appliedFilterStatus.value) count++
  if (appliedIncludeDisposed.value) count++
  return count
})

const categories = ref<{ id: number; name: string }[]>([])
const locations = ref<{ id: number; name: string }[]>([])
const departments = ref<{ id: number; name: string }[]>([])
const members = ref<{ id: string; name: string }[]>([])

const showAssetModal = ref(false)
const showDisposeModal = ref(false)
const editingAsset = ref<Asset | null>(null)
const disposingAsset = ref<Asset | null>(null)

const photoUrl = ref<string | null>(null)
const photoFile = ref<File | null>(null)
const uploadingPhoto = ref(false)
const modalAttachments = ref<AssetAttachment[]>([])
const pendingAttachments = ref<PendingAttachment[]>([])
const attachmentsFieldRef = ref<InstanceType<typeof AssetAttachmentsField> | null>(null)
const acquisitionValueInput = ref('')

const pdfContainerRef = ref<HTMLElement>()
const pdfAssets = ref<Asset[]>([])
const pdfGeneratedAt = ref('')

const assetForm = ref({
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

const headers: TableHeader<Asset>[] = [
  { key: 'code', label: 'Código', align: 'left' },
  { key: 'description', label: 'Descrição', align: 'left' },
  { key: 'category', label: 'Categoria', align: 'left' },
  { key: 'location', label: 'Local', align: 'left' },
  { key: 'quantity', label: 'Qtd', align: 'right' },
  { key: 'acquisitionValue', label: 'Valor (Unitário)', align: 'right' },
  { key: 'status', label: 'Situação', align: 'left' },
]

const paginationInfo = computed(() => ({
  currentPage: page.value,
  totalPages: Math.max(1, Math.ceil(total.value / limit.value)),
}))

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

const categoryFilterOptions = computed(() => [
  { value: '', label: 'Todas' },
  ...categoryOptions.value,
])
const locationFilterOptions = computed(() => [
  { value: '', label: 'Todos' },
  ...locationOptions.value,
])
const statusFilterOptions = computed(() => [
  { value: '', label: 'Todas' },
  ...enumToSelectOptions(AssetStatusEnum),
])
const originOptions = enumToSelectOptions(AssetOriginEnum)
const statusOptions = enumToSelectOptions(AssetStatusEnum)
const conservationOptions = enumToSelectOptions(AssetConservationStateEnum)
const disposalReasonOptions = enumToSelectOptions(AssetDisposalReasonEnum)

function dateToIsoDate(d: Date | null): string | undefined {
  if (!d) return undefined
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  const day = d.getDate()
  return `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function buildQueryParams() {
  return {
    page: page.value,
    limit: limit.value,
    search: searchTerm.value.trim() || undefined,
    categoryId: appliedFilterCategoryId.value ? Number(appliedFilterCategoryId.value) : undefined,
    locationId: appliedFilterLocationId.value ? Number(appliedFilterLocationId.value) : undefined,
    status: appliedFilterStatus.value || undefined,
    includeDisposed: appliedIncludeDisposed.value || undefined,
  }
}

function openFiltersModal() {
  filterCategoryIdDraft.value = appliedFilterCategoryId.value
  filterLocationIdDraft.value = appliedFilterLocationId.value
  filterStatusDraft.value = appliedFilterStatus.value
  includeDisposedDraft.value = appliedIncludeDisposed.value
  filtersModalOpen.value = true
}

function closeFiltersModal() {
  filtersModalOpen.value = false
}

function applyFiltersModal() {
  appliedFilterCategoryId.value = filterCategoryIdDraft.value
  appliedFilterLocationId.value = filterLocationIdDraft.value
  appliedFilterStatus.value = filterStatusDraft.value
  appliedIncludeDisposed.value = includeDisposedDraft.value
  page.value = 1
  closeFiltersModal()
  loadAssets()
}

function clearFilters() {
  filterCategoryIdDraft.value = ''
  filterLocationIdDraft.value = ''
  filterStatusDraft.value = ''
  includeDisposedDraft.value = false
}

async function loadAssets() {
  loading.value = true
  error.value = ''
  try {
    const response = await assetsService.getAssets(buildQueryParams())
    assets.value = response.data
    total.value = response.total
  } catch {
    error.value = 'Erro ao carregar inventário.'
  } finally {
    loading.value = false
  }
}

async function loadSummary() {
  try {
    summary.value = await assetsService.getSummary()
  } catch {
    summary.value = null
  }
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

function handlePageChange(newPage: number) {
  page.value = newPage
  loadAssets()
}

function goToAsset(asset: Asset) {
  router.push(`/patrimonio/inventario/${asset.id}`)
}

function handleAttachmentAdded(attachment: AssetAttachment) {
  modalAttachments.value = [attachment, ...modalAttachments.value]
}

function handleAttachmentRemoved(attachmentId: number) {
  modalAttachments.value = modalAttachments.value.filter((item) => item.id !== attachmentId)
}

async function openAssetModal(asset?: Asset) {
  editingAsset.value = asset ?? null
  photoUrl.value = null
  photoFile.value = null
  modalAttachments.value = []
  pendingAttachments.value = []

  let source = asset
  if (asset?.id) {
    try {
      source = await assetsService.getAsset(asset.id)
      editingAsset.value = source
      modalAttachments.value = source.attachments ?? []
      photoUrl.value = source.photoUrl ?? null
    } catch {
      formError.value = 'Erro ao carregar patrimônio.'
      return
    }
  }

  assetForm.value = {
    description: source?.description ?? '',
    categoryId: source?.categoryId ? String(source.categoryId) : '',
    locationId: source?.locationId ? String(source.locationId) : '',
    departmentId: source?.departmentId ? String(source.departmentId) : '',
    responsibleMemberId: source?.responsibleMemberId
      ? String(source.responsibleMemberId)
      : '',
    responsibleName: source?.responsibleName ?? '',
    quantity: source?.quantity ?? 1,
    acquisitionDate: source?.acquisitionDate ? new Date(source.acquisitionDate) : null,
    acquisitionValue: source?.acquisitionValue ? Number(source.acquisitionValue) : null,
    origin: source?.origin ?? '',
    supplierOrDonor: source?.supplierOrDonor ?? '',
    invoiceNumber: source?.invoiceNumber ?? '',
    status: source?.status ?? 'Em uso',
    conservationState: source?.conservationState ?? '',
    notes: source?.notes ?? '',
  }
  acquisitionValueInput.value = formatNumberToBRLInput(assetForm.value.acquisitionValue)
  formError.value = ''
  showAssetModal.value = true
}

function handleAcquisitionValueInput(value: string | number | null | undefined) {
  const raw = String(value ?? '')
  acquisitionValueInput.value = formatBRLInput(raw)
  assetForm.value.acquisitionValue = parseBRLInputToNumber(raw)
}

function validateAssetForm(): boolean {
  if (assetForm.value.origin === 'Compra') {
    if (!assetForm.value.acquisitionValue || assetForm.value.acquisitionValue <= 0) {
      formError.value = 'Valor de aquisição é obrigatório para origem Compra.'
      return false
    }
  }
  if (!assetForm.value.categoryId || !assetForm.value.locationId) {
    formError.value = 'Categoria e local são obrigatórios.'
    return false
  }
  return true
}

async function saveAsset() {
  if (!validateAssetForm()) return
  saving.value = true
  formError.value = ''
  try {
    let resolvedPhotoUrl = photoUrl.value
    if (photoFile.value) {
      uploadingPhoto.value = true
      const uploaded = await uploadFileToS3(photoFile.value)
      resolvedPhotoUrl = uploaded.fileUrl
    }

    const payload = {
      description: assetForm.value.description,
      categoryId: Number(assetForm.value.categoryId),
      locationId: Number(assetForm.value.locationId),
      departmentId: assetForm.value.departmentId
        ? Number(assetForm.value.departmentId)
        : undefined,
      responsibleMemberId: assetForm.value.responsibleMemberId
        ? Number(assetForm.value.responsibleMemberId)
        : undefined,
      responsibleName: assetForm.value.responsibleName || undefined,
      quantity: assetForm.value.quantity,
      acquisitionDate: dateToIsoDate(assetForm.value.acquisitionDate),
      acquisitionValue: assetForm.value.acquisitionValue ?? undefined,
      origin: assetForm.value.origin || undefined,
      supplierOrDonor: assetForm.value.supplierOrDonor || undefined,
      invoiceNumber: assetForm.value.invoiceNumber || undefined,
      photoUrl: resolvedPhotoUrl ?? null,
      status: assetForm.value.status,
      conservationState: assetForm.value.conservationState
        ? (assetForm.value.conservationState as AssetConservationState)
        : undefined,
      notes: assetForm.value.notes || undefined,
    }

    if (editingAsset.value) {
      await assetsService.updateAsset(editingAsset.value.id, payload)
    } else {
      const created = await assetsService.createAsset(payload)
      await attachmentsFieldRef.value?.uploadPending(created.id)
    }

    showAssetModal.value = false
    await Promise.all([loadAssets(), loadSummary()])
  } catch (err: unknown) {
    const message =
      (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message
    formError.value = Array.isArray(message)
      ? message.join(', ')
      : typeof message === 'string'
        ? message
        : 'Erro ao salvar patrimônio.'
  } finally {
    uploadingPhoto.value = false
    saving.value = false
  }
}

function openDisposeModal(asset: Asset) {
  disposingAsset.value = asset
  disposeForm.value = {
    disposedAt: new Date(),
    disposalReason: '',
    disposalNotes: '',
  }
  disposeError.value = ''
  showDisposeModal.value = true
}

async function confirmDispose() {
  if (!disposingAsset.value || !disposeForm.value.disposalReason) {
    disposeError.value = 'Informe o motivo da baixa.'
    return
  }
  disposing.value = true
  disposeError.value = ''
  try {
    await assetsService.disposeAsset(disposingAsset.value.id, {
      disposedAt: dateToIsoDate(disposeForm.value.disposedAt) ?? '',
      disposalReason: disposeForm.value.disposalReason,
      disposalNotes: disposeForm.value.disposalNotes || undefined,
    })
    showDisposeModal.value = false
    await Promise.all([loadAssets(), loadSummary()])
  } catch {
    disposeError.value = 'Erro ao dar baixa no patrimônio.'
  } finally {
    disposing.value = false
  }
}

async function confirmExport() {
  exportError.value = ''
  exporting.value = true
  try {
    if (exportFormat.value === 'excel') {
      await exportExcel()
    } else {
      await exportPdf()
    }
    showExportModal.value = false
  } catch {
    if (!exportError.value) {
      exportError.value =
        exportFormat.value === 'excel' ? 'Erro ao exportar Excel.' : 'Erro ao exportar PDF.'
    }
  } finally {
    exporting.value = false
    pdfAssets.value = []
  }
}

function openExportModal() {
  exportFormat.value = 'excel'
  exportError.value = ''
  showExportModal.value = true
}

async function exportExcel() {
  const blob = await assetsService.downloadExcel(buildQueryParams())
  const date = new Date().toISOString().slice(0, 10)
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `patrimonio-${date}.xlsx`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

async function exportPdf() {
  const response = await assetsService.getAssets({ ...buildQueryParams(), page: 1, limit: 10000 })
  if (response.data.length === 0) {
    exportError.value = 'Nenhum item para exportar.'
    throw new Error('empty')
  }
  pdfAssets.value = response.data
  pdfGeneratedAt.value = new Date().toLocaleString('pt-BR')
  await new Promise((resolve) => setTimeout(resolve, 100))
  const element = pdfContainerRef.value?.querySelector('.asset-inventory-pdf') as HTMLElement
  if (!element) {
    exportError.value = 'Erro ao preparar PDF.'
    throw new Error('pdf element missing')
  }
  const date = new Date().toISOString().slice(0, 10)
  await generatePdfFromElement(element, {
    filename: `patrimonio-${date}.pdf`,
    orientation: 'landscape',
    // Avoid-all pushes the whole table to page 2 when it doesn't fit after the header.
    pagebreakMode: ['css', 'legacy'],
  })
}

function getAssetActions(asset: Asset): RowActionMenuItem[] {
  return [
    { label: 'Editar', icon: PencilIcon, onClick: () => openAssetModal(asset) },
    {
      label: 'Dar baixa',
      icon: TrashIcon,
      variant: 'danger',
      hidden: asset.status === 'Baixado',
      onClick: () => openDisposeModal(asset),
    },
  ]
}

watch(searchTerm, () => {
  page.value = 1
  loadAssets()
})

onMounted(async () => {
  await Promise.all([loadReferenceData(), loadAssets(), loadSummary()])
})
</script>
