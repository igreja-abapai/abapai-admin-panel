<template>
  <div>
    <!-- Header -->
    <div class="w-full flex justify-between mb-8">
      <h1 class="text-neutral-900 font-medium text-[28px]">Detalhes do Membro</h1>
      <div class="flex gap-2 no-print">
        <router-link to="/membros" class="btn btn-secondary">
          <ArrowLeftIcon class="w-4 h-4 mr-2" />
          Voltar
        </router-link>
        <SplitButton
          label="Editar"
          :icon="PencilIcon"
          @click="handleEdit"
          toggle-title="Mais opções"
        >
          <template #menu>
            <button
              @click="handlePrint"
              :disabled="generatingPdf || !member"
              class="flex items-center w-full px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 transition-colors"
            >
              <ArrowDownTrayIcon v-if="!generatingPdf" class="w-5 h-5 mr-3 text-neutral-400" />
              <span
                v-else
                class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-3"
              ></span>
              {{ generatingPdf ? 'Gerando PDF...' : 'Baixar PDF' }}
            </button>

            <button
              v-if="member?.isActive"
              @click="openAusenteModal"
              class="flex items-center w-full px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
              :disabled="togglingStatus"
            >
              <UserMinusIcon class="w-5 h-5 mr-3 text-neutral-400" />
              Marcar como ausente
            </button>

            <button
              v-else-if="member"
              @click="handleReactivate"
              class="flex items-center w-full px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
              :disabled="togglingStatus"
            >
              <UserPlusIcon class="w-5 h-5 mr-3 text-neutral-400" />
              Reativar
            </button>
          </template>
        </SplitButton>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white rounded-lg shadow p-6">
      <div class="text-center py-8">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"
        ></div>
        <p class="text-neutral-500">Carregando detalhes do membro...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-white rounded-lg shadow p-6">
      <div class="text-center py-8">
        <ExclamationTriangleIcon class="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-neutral-900 mb-2">Erro ao carregar membro</h3>
        <p class="text-neutral-500">{{ error }}</p>
        <button @click="loadMember" class="btn btn-primary mt-4">Tentar Novamente</button>
      </div>
    </div>

    <!-- Member Details -->
    <div v-else-if="member" class="space-y-6">
      <!-- Member Header -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-start gap-6">
          <div class="flex items-center space-x-4 flex-1 min-w-0">
            <div
              v-if="member.photoUrl"
              class="w-24 h-28 rounded-lg overflow-hidden border-2 border-neutral-200 shadow-sm shrink-0"
            >
              <img
                :src="member.photoUrl"
                :alt="`Foto de ${member.name}`"
                class="w-full h-full object-cover"
              />
            </div>
            <div
              v-else
              class="w-20 h-[100px] bg-primary-600 text-white rounded-lg flex items-center justify-center text-xl font-medium shrink-0"
            >
              {{ getInitials(member.name) }}
            </div>
            <div class="min-w-0">
              <h2 class="text-2xl font-semibold text-neutral-900">{{ member.name }}</h2>
              <p class="text-neutral-500">{{ member.occupation }}</p>
              <div class="flex items-center flex-wrap gap-2 mt-2">
                <span
                  v-if="!member.isActive"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800"
                >
                  Ausente
                </span>
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  {{ member.isBaptized ? 'Batizado' : 'Não Batizado' }}
                </span>
                <span
                  v-if="member.currentPosition"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {{ member.currentPosition }}
                </span>
              </div>
            </div>
          </div>

          <div
            v-if="!member.isActive && member.absenceReason"
            class="w-full max-w-xs shrink-0"
          >
            <label class="block text-xs font-medium text-neutral-500 mb-1.5">
              Motivo da ausência
            </label>
            <textarea
              readonly
              :value="member.absenceReason"
              rows="3"
              class="w-full resize-none rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-600 cursor-default focus:outline-none"
            />
          </div>
        </div>
      </div>

      <!-- Personal Information -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-medium text-neutral-900 mb-6">Informações Pessoais</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label class="block text-sm font-medium text-neutral-500 mb-1">Nome Completo</label>
            <p class="text-neutral-900">{{ member.name }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-500 mb-1">Gênero</label>
            <p class="text-neutral-900">{{ member.gender }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-500 mb-1"
              >Data de Nascimento</label
            >
            <p class="text-neutral-900">{{ formatDate(member.birthdate) }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-500 mb-1">Nacionalidade</label>
            <p class="text-neutral-900">{{ member.nationality }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-500 mb-1">Naturalidade</label>
            <p class="text-neutral-900">{{ member.placeOfBirth || 'Não informado' }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-500 mb-1"
              >Quantidade de Filhos</label
            >
            <p class="text-neutral-900">
              {{
                member.childrenCount !== null && member.childrenCount !== undefined
                  ? member.childrenCount
                  : 'Não informado'
              }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-500 mb-1">Nome do Pai</label>
            <p class="text-neutral-900">{{ member.fatherName || 'Não informado' }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-500 mb-1">Nome da Mãe</label>
            <p class="text-neutral-900">{{ member.motherName || 'Não informado' }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-500 mb-1">Telefone</label>
            <p class="text-neutral-900">{{ member.phone }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-500 mb-1">Email</label>
            <p class="text-neutral-900">{{ member.email || 'Não informado' }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-500 mb-1">Estado Civil</label>
            <p class="text-neutral-900">{{ member.maritalStatus }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-500 mb-1">Nome do Cônjuge</label>
            <p class="text-neutral-900">{{ member.spouseName || 'Não informado' }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-500 mb-1">Escolaridade</label>
            <p class="text-neutral-900">{{ member.educationLevel }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-500 mb-1"
              >Profissão/Ocupação</label
            >
            <p class="text-neutral-900">{{ member.occupation }}</p>
          </div>
        </div>
      </div>

      <!-- Address Information -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-medium text-neutral-900 mb-6">Endereço</h3>
        <div v-if="member.address" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-neutral-500 mb-1">Rua</label>
            <p class="text-neutral-900">
              {{ member.address.streetName }}, {{ member.address.streetNumber }}
            </p>
          </div>
          <div v-if="member.address.complement">
            <label class="block text-sm font-medium text-neutral-500 mb-1">Complemento</label>
            <p class="text-neutral-900">{{ member.address.complement }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-500 mb-1">Bairro</label>
            <p class="text-neutral-900">{{ member.address.district }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-500 mb-1">Cidade</label>
            <p class="text-neutral-900">{{ member.address.city }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-500 mb-1">Estado</label>
            <p class="text-neutral-900">{{ member.address.state }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-500 mb-1">País</label>
            <p class="text-neutral-900">{{ member.address.country }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-500 mb-1">CEP</label>
            <p class="text-neutral-900">{{ member.address.postalCode || 'Não informado' }}</p>
          </div>
        </div>
        <div v-else class="text-center py-4">
          <p class="text-neutral-500">Endereço não informado</p>
        </div>
      </div>

      <!-- Document Information -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-medium text-neutral-900 mb-6">Documentos</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label class="block text-sm font-medium text-neutral-500 mb-1">CPF</label>
            <p class="text-neutral-900">{{ member.cpf }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-500 mb-1">RG</label>
            <p class="text-neutral-900">{{ member.rg }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-500 mb-1">Órgão Expedidor</label>
            <p class="text-neutral-900">{{ member.issuingBody }}</p>
          </div>
        </div>
      </div>

      <!-- Spiritual Information -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-medium text-neutral-900 mb-6">
          Informações Espirituais e Eclesiásticas
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-neutral-500 mb-1">Ano de Conversão</label>
            <p class="text-neutral-900">{{ member.yearOfConversion || 'Não informado' }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-500 mb-1">Última Igreja</label>
            <p class="text-neutral-900">{{ member.lastChurch || 'Não informado' }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-500 mb-1">Data de Admissão</label>
            <p class="text-neutral-900">
              {{ member.admissionDate || 'Não informado' }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-500 mb-1">Tipo de Admissão</label>
            <p class="text-neutral-900">{{ member.admissionType || 'Não informado' }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-500 mb-1"
              >Último Cargo Exercido</label
            >
            <p class="text-neutral-900">{{ member.lastPositionHeld || 'Não informado' }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-500 mb-1"
              >Período do Último Cargo</label
            >
            <p class="text-neutral-900">{{ member.lastPositionPeriod || 'Não informado' }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-500 mb-1">Cargo Atual</label>
            <p class="text-neutral-900">{{ member.currentPosition || 'Não informado' }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-500 mb-1">Funções de Serviço</label>
            <div v-if="loadingCapabilities" class="text-sm text-neutral-500">Carregando...</div>
            <div v-else-if="activeMemberCapabilities.length" class="flex flex-wrap gap-2">
              <span
                v-for="cap in activeMemberCapabilities"
                :key="cap.id"
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  cap.source === CapabilitySource.DEPARTMENT
                    ? 'bg-neutral-100 text-neutral-700'
                    : 'bg-primary-100 text-primary-800',
                ]"
                :title="
                  cap.source === CapabilitySource.DEPARTMENT
                    ? 'Origem: departamento'
                    : 'Origem: manual'
                "
              >
                {{ cap.serviceRole?.name || '—' }}
              </span>
            </div>
            <p v-else class="text-neutral-900">Não informado</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-500 mb-1">Área de Interesse</label>
            <p class="text-neutral-900">{{ member.areaOfInterest || 'Não informado' }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-500 mb-1"
              >Batizado nas Águas</label
            >
            <p class="text-neutral-900">
              <span
                v-if="member.isBaptized"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
              >
                Sim
              </span>
              <span
                v-else
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
              >
                Não
              </span>
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-500 mb-1">Ano do Batismo</label>
            <p class="text-neutral-900">{{ member.yearOfBaptism || 'Não informado' }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-500 mb-1">Local do Batismo</label>
            <p class="text-neutral-900">{{ member.baptismPlace || 'Não informado' }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-500 mb-1"
              >Batizado no Espírito Santo</label
            >
            <p class="text-neutral-900">
              <span
                v-if="member.isBaptizedInTheHolySpirit === true"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                Sim
              </span>
              <span
                v-else-if="member.isBaptizedInTheHolySpirit === false"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
              >
                Não
              </span>
              <span
                v-else
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                Não informado
              </span>
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-500 mb-1"
              >Deseja ser Voluntário</label
            >
            <p class="text-neutral-900">
              <span
                v-if="member.wantsToBeAVolunteer === true"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
              >
                Sim
              </span>
              <span
                v-else-if="member.wantsToBeAVolunteer === false"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
              >
                Não
              </span>
              <span
                v-else
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                Não informado
              </span>
            </p>
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-neutral-500 mb-1">Observações</label>
            <p class="text-neutral-900 whitespace-pre-wrap">
              {{ member.observations || 'Não informado' }}
            </p>
          </div>
        </div>
      </div>

      <!-- System Information -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-medium text-neutral-900 mb-6">Informações do Sistema</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-neutral-500 mb-1">ID do Membro</label>
            <p class="text-neutral-900 font-mono">{{ member.id }}</p>
          </div>
          <div v-if="member.createdAt">
            <label class="block text-sm font-medium text-neutral-500 mb-1">Data de Cadastro</label>
            <p class="text-neutral-900">{{ formatDateTimeWithRelative(member.createdAt) }}</p>
          </div>
          <div v-if="member.updatedAt">
            <label class="block text-sm font-medium text-neutral-500 mb-1"
              >Última Atualização</label
            >
            <p class="text-neutral-900">{{ formatDateTimeWithRelative(member.updatedAt) }}</p>
          </div>
          <div v-if="createdByUser">
            <label class="block text-sm font-medium text-neutral-500 mb-1">Cadastrado por</label>
            <p class="text-neutral-900">
              {{ createdByUser.firstName }} {{ createdByUser.lastName }}
            </p>
            <p class="text-xs text-neutral-500">{{ createdByUser.email }}</p>
          </div>
          <div v-if="updatedByUser">
            <label class="block text-sm font-medium text-neutral-500 mb-1">Atualizado por</label>
            <p class="text-neutral-900">
              {{ updatedByUser.firstName }} {{ updatedByUser.lastName }}
            </p>
            <p class="text-xs text-neutral-500">{{ updatedByUser.email }}</p>
          </div>
        </div>
      </div>

      <!-- Delete Member Section -->
      <div class="bg-white rounded-lg shadow p-6 border-l-4 border-red-500 no-print">
        <h3 class="text-lg font-medium text-red-700 mb-4">Cuidado, atenção!</h3>
        <p class="text-neutral-600 mb-4">
          Ao excluir este membro, ele será removido da lista ativa, mas os dados serão mantidos no
          histórico e poderão ser restaurados posteriormente.
        </p>
        <button
          @click="showDeleteConfirmation = true"
          class="btn bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700"
        >
          <TrashIcon class="w-4 h-4 mr-2" />
          Excluir Membro
        </button>
      </div>
    </div>

    <!-- Hidden Member Card for PDF Generation -->
    <div style="position: absolute; left: -9999px; top: 0; width: 210mm" ref="pdfContainerRef">
      <MemberCard v-if="member" :member="member" />
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteConfirmation"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 no-print"
      @click="showDeleteConfirmation = false"
    >
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4" @click.stop>
        <div class="flex items-center mb-4">
          <ExclamationTriangleIcon class="w-8 h-8 text-red-500 mr-3" />
          <h3 class="text-lg font-medium text-neutral-900">Confirmar Exclusão</h3>
        </div>
        <p class="text-neutral-600 mb-6">
          Tem certeza que deseja excluir o membro <strong>{{ member?.name }}</strong>? Os dados
          serão mantidos no histórico e o membro poderá ser restaurado depois.
        </p>
        <div class="flex justify-end space-x-3">
          <button @click="showDeleteConfirmation = false" class="btn btn-secondary">
            Cancelar
          </button>
          <button
            @click="handleDeleteMember"
            :disabled="deleting"
            class="btn bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700"
          >
            <span
              v-if="deleting"
              class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
            ></span>
            {{ deleting ? 'Excluindo...' : 'Sim, Excluir' }}
          </button>
        </div>
      </div>
    </div>
    <!-- Ausente Confirmation Modal -->
    <div
      v-if="showAusenteConfirmation"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 no-print"
      @click="closeAusenteModal"
    >
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4" @click.stop>
        <div class="flex items-center mb-4">
          <ExclamationTriangleIcon class="w-8 h-8 text-yellow-500 mr-3" />
          <h3 class="text-lg font-medium text-neutral-900">Marcar como ausente</h3>
        </div>
        <p class="text-neutral-600 mb-4">
          Tem certeza que deseja marcar <strong>{{ member?.name }}</strong> como
          <strong>Ausente</strong>?
        </p>
        <label class="block text-sm font-medium text-neutral-700 mb-2" for="absence-reason">
          Motivo da ausência <span class="text-neutral-400 font-normal">(opcional)</span>
        </label>
        <textarea
          id="absence-reason"
          v-model="absenceReason"
          rows="3"
          class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Ex.: Mudou de cidade, está enfermo, etc..."
        />
        <p v-if="absenceReasonError" class="mt-2 text-sm text-red-600">{{ absenceReasonError }}</p>
        <div class="flex justify-end space-x-3 mt-6">
          <button @click="closeAusenteModal" class="btn btn-secondary">Cancelar</button>
          <button @click="handleMarkAsAusente" :disabled="togglingStatus" class="btn btn-primary">
            <span
              v-if="togglingStatus"
              class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
            ></span>
            {{ togglingStatus ? 'Processando...' : 'Confirmar' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  PencilIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  UserMinusIcon,
  UserPlusIcon,
  EllipsisHorizontalIcon,
  ChevronDownIcon,
} from '@heroicons/vue/24/outline'
import { membersService, type Member } from '@/services/members'
import { usersService, type User } from '@/services/users'
import { organizationService, type MemberServiceCapability } from '@/services/organization'
import { CapabilitySource } from '@/constants/organization'
import { formatDate, formatDateTimeWithRelative } from '@/utils/dateFormat'
import html2pdf from 'html2pdf.js'
import MemberCard from '@/components/MemberCard.vue'
import SplitButton from '@/components/SplitButton.vue'
import { environment } from '@/config/environment'
import { getImageUrl } from '@/utils/imageUrl'

const route = useRoute()
const router = useRouter()
const member = ref<Member | null>(null)
const createdByUser = ref<User | null>(null)
const updatedByUser = ref<User | null>(null)
const loading = ref(false)
const error = ref('')
const showDeleteConfirmation = ref(false)
const deleting = ref(false)
const generatingPdf = ref(false)
const pdfContainerRef = ref<HTMLElement>()
const showAusenteConfirmation = ref(false)
const absenceReason = ref('')
const absenceReasonError = ref('')
const togglingStatus = ref(false)

const loadingCapabilities = ref(false)
const memberCapabilities = ref<MemberServiceCapability[]>([])

const activeMemberCapabilities = computed(() =>
  memberCapabilities.value.filter((cap) => cap.isActive),
)

function openAusenteModal() {
  absenceReason.value = ''
  absenceReasonError.value = ''
  showAusenteConfirmation.value = true
}

function closeAusenteModal() {
  showAusenteConfirmation.value = false
  absenceReason.value = ''
  absenceReasonError.value = ''
}

function getInitials(name?: string): string {
  if (!name) return ''
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function handleEdit() {
  router.push(`/membros/editar/${member.value?.id}`)
}

async function handlePrint(event?: Event) {
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }

  if (generatingPdf.value) {
    return
  }

  if (!member.value) {
    alert('Dados do membro não disponíveis')
    return
  }

  generatingPdf.value = true

  try {
    if (!pdfContainerRef.value) {
      alert('Erro ao preparar PDF. Tente recarregar a página.')
      generatingPdf.value = false
      return
    }

    await new Promise((resolve) => setTimeout(resolve, 500))

    const element = pdfContainerRef.value.querySelector('.member-card') as HTMLElement
    if (!element) {
      alert('Erro ao encontrar conteúdo para PDF. Tente novamente.')
      generatingPdf.value = false
      return
    }

    const images = Array.from(element.querySelectorAll('img'))

    if (images.length > 0) {
      // Step 1: Replace S3 URLs with proxy URLs and load images
      const loadPromises: Promise<void>[] = []

      images.forEach((img, index) => {
        if (img.src && (img.src.includes('s3.') || img.src.includes('amazonaws.com'))) {
          const proxyUrl = getImageUrl(img.src)

          const loadPromise = new Promise<void>((resolve) => {
            const newImg = new Image()
            newImg.crossOrigin = 'anonymous'

            const timeout = setTimeout(() => {
              resolve()
            }, 10000)

            newImg.onload = () => {
              clearTimeout(timeout)
              try {
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')
                if (ctx) {
                  canvas.width = newImg.naturalWidth || newImg.width
                  canvas.height = newImg.naturalHeight || newImg.height
                  ctx.drawImage(newImg, 0, 0)
                  const dataURL = canvas.toDataURL('image/jpeg', 0.95)
                  img.src = dataURL
                }
              } catch (error) {
                // Silent fail - continue without image
              }
              resolve()
            }

            newImg.onerror = () => {
              clearTimeout(timeout)
              resolve()
            }

            newImg.src = proxyUrl
          })

          loadPromises.push(loadPromise)
        } else if (img.src && !img.src.startsWith('data:')) {
          // Check if this is the logo - use PNG to preserve transparency
          const isLogo = img.hasAttribute('data-logo')
          const convertPromise = new Promise<void>((resolve) => {
            if (img.complete && img.naturalHeight !== 0) {
              convertImageToBase64(img, isLogo)
                .then(() => resolve())
                .catch(() => resolve())
            } else {
              const timeout = setTimeout(() => {
                resolve()
              }, 5000)

              img.addEventListener(
                'load',
                () => {
                  clearTimeout(timeout)
                  convertImageToBase64(img, isLogo)
                    .then(() => resolve())
                    .catch(() => resolve())
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
            }
          })
          loadPromises.push(convertPromise)
        }
      })

      await Promise.all(loadPromises)

      let retries = 0
      const maxRetries = 2

      while (retries < maxRetries) {
        let allBase64 = true
        const needsRetry: HTMLImageElement[] = []

        images.forEach((img) => {
          if (img.src && !img.src.startsWith('data:')) {
            allBase64 = false
            needsRetry.push(img)
          }
        })

        if (allBase64 || needsRetry.length === 0) {
          break
        }

        if (retries < maxRetries - 1 && needsRetry.length > 0) {
          retries++

          const retryPromises = needsRetry.map((img) => {
            return new Promise<void>((resolve) => {
              const timeout = setTimeout(() => {
                resolve()
              }, 5000)

              const isLogo = img.hasAttribute('data-logo')
              if (img.complete && img.naturalHeight !== 0) {
                try {
                  const canvas = document.createElement('canvas')
                  const ctx = canvas.getContext('2d')
                  if (ctx) {
                    canvas.width = img.naturalWidth || img.width
                    canvas.height = img.naturalHeight || img.height
                    ctx.drawImage(img, 0, 0)
                    const dataURL = isLogo
                      ? canvas.toDataURL('image/png')
                      : canvas.toDataURL('image/jpeg', 0.95)
                    img.src = dataURL
                  }
                } catch (error) {
                  // Silent fail
                }
                clearTimeout(timeout)
                resolve()
              } else {
                img.addEventListener(
                  'load',
                  () => {
                    clearTimeout(timeout)
                    try {
                      const canvas = document.createElement('canvas')
                      const ctx = canvas.getContext('2d')
                      if (ctx) {
                        canvas.width = img.naturalWidth || img.width
                        canvas.height = img.naturalHeight || img.height
                        ctx.drawImage(img, 0, 0)
                        const dataURL = isLogo
                          ? canvas.toDataURL('image/png')
                          : canvas.toDataURL('image/jpeg', 0.95)
                        img.src = dataURL
                      }
                    } catch (error) {
                      // Silent fail
                    }
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
              }
            })
          })

          await Promise.all(retryPromises)
          await new Promise((resolve) => setTimeout(resolve, 500))
        } else {
          break
        }
      }
    }

    // Configure PDF options
    const opt = {
      margin: [0, 0, 0, 0] as [number, number, number, number],
      filename: `Ficha_Membro_${member.value.name.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        letterRendering: true,
        x: 0,
        y: 0,
        onclone: (clonedDoc: Document) => {
          // Ensure images are loaded in the cloned document
          const clonedImages = clonedDoc.querySelectorAll('img')
          clonedImages.forEach((img) => {
            if (img.src && img.src.startsWith('data:')) {
              // Image is already base64, ensure it's loaded
              const newImg = new Image()
              newImg.crossOrigin = 'anonymous'
              newImg.src = img.src
              img.src = newImg.src
            }
          })
        },
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    }

    if (typeof html2pdf === 'undefined' || !html2pdf) {
      throw new Error('html2pdf não está disponível. Verifique se a biblioteca está instalada.')
    }

    const pdfWorker = html2pdf().set(opt).from(element)
    await pdfWorker.save()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao gerar PDF'
    alert(`Erro ao gerar PDF: ${errorMessage}`)
  } finally {
    generatingPdf.value = false
  }
}

// Helper function to convert image to base64
// Use PNG format for logos to preserve transparency, JPEG for photos
function convertImageToBase64(img: HTMLImageElement, usePng = false): Promise<void> {
  return new Promise((resolve) => {
    // Always resolve, never reject, to prevent Promise.all from hanging
    const resolveOnce = () => {
      resolve()
    }

    // If image is already base64, we're done
    if (img.src.startsWith('data:')) {
      resolveOnce()
      return
    }

    const timeout = setTimeout(() => {
      resolveOnce()
    }, 5000)

    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        clearTimeout(timeout)
        resolveOnce()
        return
      }

      if (!img.complete || img.naturalHeight === 0) {
        const loadHandler = () => {
          clearTimeout(timeout)
          try {
            canvas.width = img.naturalWidth || img.width || 100
            canvas.height = img.naturalHeight || img.height || 100
            ctx.drawImage(img, 0, 0)
            const dataURL = usePng
              ? canvas.toDataURL('image/png')
              : canvas.toDataURL('image/jpeg', 0.95)
            img.src = dataURL
            resolveOnce()
          } catch (error) {
            resolveOnce()
          }
        }
        const errorHandler = () => {
          clearTimeout(timeout)
          resolveOnce()
        }
        img.addEventListener('load', loadHandler, { once: true })
        img.addEventListener('error', errorHandler, { once: true })
        return
      }

      // Image is already loaded, convert it
      canvas.width = img.naturalWidth || img.width || 100
      canvas.height = img.naturalHeight || img.height || 100
      ctx.drawImage(img, 0, 0)
      const dataURL = usePng ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', 0.95)
      img.src = dataURL
      clearTimeout(timeout)
      resolveOnce()
    } catch (error) {
      clearTimeout(timeout)
      resolveOnce()
    }
  })
}

function convertImageDirectly(img: HTMLImageElement, resolve: () => void): void {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    resolve()
    return
  }

  canvas.width = img.naturalWidth || img.width || 100
  canvas.height = img.naturalHeight || img.height || 100

  try {
    ctx.drawImage(img, 0, 0)
    const dataURL = canvas.toDataURL('image/jpeg', 0.95)
    img.src = dataURL
    resolve()
  } catch (error) {
    if (!img.crossOrigin) {
      img.crossOrigin = 'anonymous'
      const newImg = new Image()
      newImg.crossOrigin = 'anonymous'

      const timeout = setTimeout(() => {
        resolve()
      }, 5000)

      newImg.onload = () => {
        clearTimeout(timeout)
        try {
          ctx.drawImage(newImg, 0, 0)
          const dataURL = canvas.toDataURL('image/jpeg', 0.95)
          img.src = dataURL
          resolve()
        } catch (e) {
          resolve()
        }
      }
      newImg.onerror = () => {
        clearTimeout(timeout)
        resolve()
      }
      newImg.src = img.src
    } else {
      resolve()
    }
  }
}

async function loadMember() {
  loading.value = true
  error.value = ''

  try {
    const memberId = route.params.id as string
    member.value = await membersService.getMember(memberId)

    // Load user information for audit fields
    if (member.value?.createdBy) {
      try {
        createdByUser.value = await usersService.getUser(member.value.createdBy)
      } catch (err) {
        console.error('Error loading created by user:', err)
      }
    }

    if (member.value?.updatedBy) {
      try {
        updatedByUser.value = await usersService.getUser(member.value.updatedBy)
      } catch (err) {
        console.error('Error loading updated by user:', err)
      }
    }

    await loadMemberCapabilities()
  } catch (err: any) {
    console.error('Error loading member:', err)
    error.value = err.response?.data?.message || 'Erro ao carregar detalhes do membro'
  } finally {
    loading.value = false
  }
}

async function loadMemberCapabilities() {
  if (!member.value) return
  loadingCapabilities.value = true
  try {
    const caps = await organizationService.getMemberCapabilities()
    const memberId = Number(member.value.id)
    memberCapabilities.value = caps.filter((cap) => cap.memberId === memberId)
  } catch (err) {
    console.error('Error loading member capabilities:', err)
  } finally {
    loadingCapabilities.value = false
  }
}

async function handleDeleteMember() {
  deleting.value = true
  try {
    await membersService.deleteMember(member.value?.id as string)
    router.push('/membros')
  } catch (err: any) {
    console.error('Error deleting member:', err)
    error.value = err.response?.data?.message || 'Erro ao excluir membro'
  } finally {
    deleting.value = false
    showDeleteConfirmation.value = false
  }
}

async function handleMarkAsAusente() {
  if (!member.value) return

  const reason = absenceReason.value.trim()
  absenceReasonError.value = ''
  togglingStatus.value = true
  try {
    const updatedMember = await membersService.updateMember(member.value.id, {
      isActive: false,
      absenceReason: reason || null,
    })
    member.value = updatedMember
    closeAusenteModal()
  } catch (err: any) {
    console.error('Error marking member as absent:', err)
    absenceReasonError.value =
      err.response?.data?.message || 'Erro ao marcar membro como ausente'
  } finally {
    togglingStatus.value = false
  }
}

async function handleReactivate() {
  if (!member.value) return

  togglingStatus.value = true
  try {
    const updatedMember = await membersService.updateMember(member.value.id, {
      isActive: true,
      absenceReason: null,
    })
    member.value = updatedMember
  } catch (err: any) {
    console.error('Error reactivating member:', err)
    error.value = err.response?.data?.message || 'Erro ao reativar membro'
  } finally {
    togglingStatus.value = false
  }
}

onMounted(() => {
  loadMember()
})
</script>

<style scoped>
/* Print styles */
@media print {
  .no-print {
    display: none !important;
  }

  /* Remove shadows and borders for cleaner print */
  .bg-white {
    box-shadow: none !important;
    border: 1px solid #e5e7eb !important;
  }

  /* Ensure proper page breaks */
  .space-y-6 > * {
    page-break-inside: avoid;
    margin-bottom: 1.5rem;
  }

  /* Optimize text colors for print */
  .text-neutral-500 {
    color: #6b7280 !important;
  }

  .text-neutral-900 {
    color: #111827 !important;
  }

  /* Remove background colors from badges for better print quality */
  .bg-green-100,
  .bg-red-100,
  .bg-blue-100,
  .bg-yellow-100,
  .bg-gray-100 {
    background-color: transparent !important;
    border: 1px solid currentColor !important;
  }

  /* Ensure images print properly */
  img {
    max-width: 100%;
    height: auto;
  }

  /* Page setup */
  @page {
    margin: 1cm;
  }

  body {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
}
</style>
