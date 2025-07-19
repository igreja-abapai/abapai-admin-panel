<template>
  <div>
    <!-- Header -->
    <div class="w-full flex justify-between mb-8">
      <h1 class="text-neutral-900 font-medium text-[28px]">Detalhes do Membro</h1>
      <div class="flex gap-2">
        <router-link to="/membros" class="btn btn-secondary">
          <ArrowLeftIcon class="w-4 h-4 mr-2" />
          Voltar
        </router-link>
        <button class="btn btn-secondary" @click="handleEdit">
          <PencilIcon class="w-4 h-4 mr-2" />
          Editar
        </button>
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
        <div class="flex items-center space-x-4">
          <div
            v-if="member.photoUrl"
            class="w-24 h-28 rounded-lg overflow-hidden border-2 border-neutral-200 shadow-sm"
          >
            <img
              :src="member.photoUrl"
              :alt="`Foto de ${member.name}`"
              class="w-full h-full object-cover"
            />
          </div>
          <div
            v-else
            class="w-20 h-[100px] bg-primary-600 text-white rounded-lg flex items-center justify-center text-xl font-medium"
          >
            {{ getInitials(member.name) }}
          </div>
          <div>
            <h2 class="text-2xl font-semibold text-neutral-900">{{ member.name }}</h2>
            <p class="text-neutral-500">{{ member.occupation }}</p>
            <div class="flex items-center space-x-4 mt-2">
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
          <div v-if="member.spouseName">
            <label class="block text-sm font-medium text-neutral-500 mb-1">Nome do Cônjuge</label>
            <p class="text-neutral-900">{{ member.spouseName }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-500 mb-1">Escolaridade</label>
            <p class="text-neutral-900">{{ member.educationLevel }}</p>
          </div>
        </div>
      </div>

      <!-- Address Information -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-medium text-neutral-900 mb-6">Endereço</h3>
        <div v-if="member.address" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label class="block text-sm font-medium text-neutral-500 mb-1">Rua</label>
            <p class="text-neutral-900">
              {{ member.address.streetName }}, {{ member.address.streetNumber }}
            </p>
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
          <div v-if="member.address.postalCode">
            <label class="block text-sm font-medium text-neutral-500 mb-1">CEP</label>
            <p class="text-neutral-900">{{ member.address.postalCode }}</p>
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

      <!-- Professional Information -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-medium text-neutral-900 mb-6">Informações Profissionais</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-neutral-500 mb-1"
              >Profissão/Ocupação</label
            >
            <p class="text-neutral-900">{{ member.occupation }}</p>
          </div>
          <div v-if="member.yearOfConversion">
            <label class="block text-sm font-medium text-neutral-500 mb-1">Ano de Conversão</label>
            <p class="text-neutral-900">{{ member.yearOfConversion }}</p>
          </div>
          <div v-if="member.lastChurch">
            <label class="block text-sm font-medium text-neutral-500 mb-1">Última Igreja</label>
            <p class="text-neutral-900">{{ member.lastChurch }}</p>
          </div>
          <div v-if="member.lastPositionHeld">
            <label class="block text-sm font-medium text-neutral-500 mb-1"
              >Último Cargo Exercido</label
            >
            <p class="text-neutral-900">{{ member.lastPositionHeld }}</p>
          </div>
          <div v-if="member.currentPosition">
            <label class="block text-sm font-medium text-neutral-500 mb-1">Cargo Atual</label>
            <p class="text-neutral-900">{{ member.currentPosition }}</p>
          </div>
          <div v-if="member.areaOfInterest">
            <label class="block text-sm font-medium text-neutral-500 mb-1">Área de Interesse</label>
            <p class="text-neutral-900">{{ member.areaOfInterest }}</p>
          </div>
        </div>
      </div>

      <!-- Spiritual Information -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-medium text-neutral-900 mb-6">Informações Espirituais</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-neutral-500 mb-1">Batizado em Água</label>
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
            <label class="block text-sm font-medium text-neutral-500 mb-1"
              >Batizado no Espírito Santo</label
            >
            <p class="text-neutral-900">
              <span
                v-if="member.isBaptizedInTheHolySpirit"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                Sim
              </span>
              <span
                v-else
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                Não
              </span>
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-500 mb-1"
              >Deseja ser Voluntário</label
            >
            <p class="text-neutral-900">
              <span
                v-if="member.wantsToBeAVolunteer"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
              >
                Sim
              </span>
              <span
                v-else
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                Não
              </span>
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
            <p class="text-neutral-900">{{ formatDateTime(member.createdAt) }}</p>
          </div>
          <div v-if="member.updatedAt">
            <label class="block text-sm font-medium text-neutral-500 mb-1"
              >Última Atualização</label
            >
            <p class="text-neutral-900">{{ formatDateTime(member.updatedAt) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  PencilIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
} from '@heroicons/vue/24/outline'
import { membersService, type Member } from '@/services/members'

const route = useRoute()
const router = useRouter()
const member = ref<Member | null>(null)
const loading = ref(false)
const error = ref('')

function getInitials(name?: string): string {
  if (!name) return ''
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatDate(dateString: string): string {
  if (!dateString) return 'Data não informada'

  const [year, month, day] = dateString.split('-')
  if (year && month && day) {
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    return date.toLocaleDateString('pt-BR')
  }

  return new Date(dateString).toLocaleDateString('pt-BR')
}

function formatDateTime(dateString: string): string {
  if (!dateString) return 'Data não informada'
  return new Date(dateString).toLocaleString('pt-BR')
}

function handleEdit() {
  router.push(`/membros/editar/${member.value?.id}`)
}

async function loadMember() {
  loading.value = true
  error.value = ''

  try {
    const memberId = route.params.id as string
    member.value = await membersService.getMember(memberId)
  } catch (err: any) {
    console.error('Error loading member:', err)
    error.value = err.response?.data?.message || 'Erro ao carregar detalhes do membro'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadMember()
})
</script>
