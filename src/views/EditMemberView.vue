<template>
  <div>
    <!-- Header -->
    <div class="w-full flex justify-between mb-8">
      <h1 class="text-neutral-900 font-medium text-[28px]">Editar Membro</h1>
      <router-link :to="`/membros/detalhes/${memberId}`" class="btn btn-secondary">
        <ArrowLeftIcon class="w-4 h-4 mr-2" />
        Voltar
      </router-link>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !member" class="bg-white rounded-lg shadow p-6">
      <div class="text-center py-8">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"
        ></div>
        <p class="text-neutral-500">Carregando dados do membro...</p>
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

    <!-- Edit Form -->
    <form v-else-if="member" @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Personal Information -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-medium text-neutral-900 mb-6">Informações Pessoais</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">Nome Completo *</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Digite o nome completo"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">Gênero *</label>
            <select
              v-model="form.gender"
              required
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Selecione o gênero</option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2"
              >Data de Nascimento *</label
            >
            <input
              v-model="form.birthdate"
              type="date"
              required
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">Nacionalidade *</label>
            <input
              v-model="form.nationality"
              type="text"
              required
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Ex: Brasileira"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">Telefone *</label>
            <input
              v-model="form.phone"
              type="tel"
              required
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="(11) 99999-9999"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">Email</label>
            <input
              v-model="form.email"
              type="email"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="email@exemplo.com"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">Estado Civil *</label>
            <select
              v-model="form.maritalStatus"
              required
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Selecione o estado civil</option>
              <option value="Solteiro">Solteiro</option>
              <option value="Casado">Casado</option>
              <option value="Divorciado">Divorciado</option>
              <option value="Viúvo">Viúvo</option>
            </select>
          </div>

          <div v-if="form.maritalStatus === 'Casado'">
            <label class="block text-sm font-medium text-neutral-700 mb-2">Nome do Cônjuge</label>
            <input
              v-model="form.spouseName"
              type="text"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Nome do cônjuge"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">Escolaridade *</label>
            <select
              v-model="form.educationLevel"
              required
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Selecione a escolaridade</option>
              <option value="Ensino Fundamental">Ensino Fundamental</option>
              <option value="Ensino Médio">Ensino Médio</option>
              <option value="Curso Técnico">Curso Técnico</option>
              <option value="Ensino Superior">Ensino Superior</option>
              <option value="Pós-Graduação">Pós-Graduação</option>
              <option value="Mestrado">Mestrado</option>
              <option value="Doutorado">Doutorado</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Address Information -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-medium text-neutral-900 mb-6">Endereço</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">Rua *</label>
            <input
              v-model="addressForm.streetName"
              type="text"
              required
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Nome da rua"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">Número *</label>
            <input
              v-model="addressForm.streetNumber"
              type="text"
              required
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Número"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">Bairro *</label>
            <input
              v-model="addressForm.district"
              type="text"
              required
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Nome do bairro"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">Cidade *</label>
            <input
              v-model="addressForm.city"
              type="text"
              required
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Nome da cidade"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">Estado *</label>
            <input
              v-model="addressForm.state"
              type="text"
              required
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="UF"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">País *</label>
            <input
              v-model="addressForm.country"
              type="text"
              required
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Nome do país"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">CEP</label>
            <input
              v-model="addressForm.postalCode"
              type="text"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="00000-000"
            />
          </div>
        </div>
      </div>

      <!-- Document Information -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-medium text-neutral-900 mb-6">Documentos</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">CPF *</label>
            <input
              v-model="form.cpf"
              type="text"
              required
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="000.000.000-00"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">RG *</label>
            <input
              v-model="form.rg"
              type="text"
              required
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="00.000.000-0"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">Órgão Expedidor *</label>
            <input
              v-model="form.issuingBody"
              type="text"
              required
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="SSP"
            />
          </div>
        </div>
      </div>

      <!-- Professional Information -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-medium text-neutral-900 mb-6">Informações Profissionais</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2"
              >Profissão/Ocupação *</label
            >
            <input
              v-model="form.occupation"
              type="text"
              required
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Ex: Engenheiro, Professor, etc."
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">Ano de Conversão</label>
            <input
              v-model="form.yearOfConversion"
              type="text"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Ex: 2020"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">Última Igreja</label>
            <input
              v-model="form.lastChurch"
              type="text"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Nome da última igreja"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2"
              >Último Cargo Exercido</label
            >
            <input
              v-model="form.lastPositionHeld"
              type="text"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Ex: Diácono, Presbítero, etc."
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">Cargo Atual</label>
            <input
              v-model="form.currentPosition"
              type="text"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Ex: Membro, Líder, etc."
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">Área de Interesse</label>
            <input
              v-model="form.areaOfInterest"
              type="text"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Ex: Música, Jovens, Crianças, etc."
            />
          </div>
        </div>
      </div>

      <!-- Spiritual Information -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-medium text-neutral-900 mb-6">Informações Espirituais</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex items-center">
            <input
              v-model="form.isBaptized"
              type="checkbox"
              id="isBaptized"
              class="w-4 h-4 text-primary-600 bg-neutral-100 border-neutral-300 rounded focus:ring-primary-500 focus:ring-2"
            />
            <label for="isBaptized" class="ml-2 text-sm font-medium text-neutral-700">
              É batizado em água *
            </label>
          </div>

          <div class="flex items-center">
            <input
              v-model="form.isBaptizedInTheHolySpirit"
              type="checkbox"
              id="isBaptizedInTheHolySpirit"
              class="w-4 h-4 text-primary-600 bg-neutral-100 border-neutral-300 rounded focus:ring-primary-500 focus:ring-2"
            />
            <label
              for="isBaptizedInTheHolySpirit"
              class="ml-2 text-sm font-medium text-neutral-700"
            >
              É batizado no Espírito Santo
            </label>
          </div>

          <div class="flex items-center">
            <input
              v-model="form.wantsToBeAVolunteer"
              type="checkbox"
              id="wantsToBeAVolunteer"
              class="w-4 h-4 text-primary-600 bg-neutral-100 border-neutral-300 rounded focus:ring-primary-500 focus:ring-2"
            />
            <label for="wantsToBeAVolunteer" class="ml-2 text-sm font-medium text-neutral-700">
              Deseja ser voluntário
            </label>
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="flex justify-end space-x-4">
        <router-link :to="`/membros/detalhes/${memberId}`" class="btn btn-secondary">
          Cancelar
        </router-link>
        <button type="submit" :disabled="submitting" class="btn btn-primary">
          <span
            v-if="submitting"
            class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
          ></span>
          {{ submitting ? 'Salvando...' : 'Salvar Alterações' }}
        </button>
      </div>
    </form>

    <!-- Error Message -->
    <div
      v-if="submitError"
      class="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
    >
      {{ submitError }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeftIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import { membersService, type Member } from '@/services/members'
import { addressService, type Address } from '@/services/address'

const route = useRoute()
const router = useRouter()
const member = ref<Member | null>(null)
const loading = ref(false)
const submitting = ref(false)
const error = ref('')
const submitError = ref('')

const memberId = computed(() => route.params.id as string)

const form = reactive({
  name: '',
  gender: '',
  birthdate: '',
  nationality: '',
  phone: '',
  email: '',
  maritalStatus: '',
  spouseName: '',
  educationLevel: '',
  yearOfConversion: '',
  occupation: '',
  rg: '',
  issuingBody: '',
  cpf: '',
  lastChurch: '',
  lastPositionHeld: '',
  isBaptized: false,
  isBaptizedInTheHolySpirit: false,
  currentPosition: '',
  wantsToBeAVolunteer: false,
  areaOfInterest: '',
})

const addressForm = reactive({
  city: '',
  country: '',
  district: '',
  postalCode: '',
  streetName: '',
  streetNumber: '',
  state: '',
})

function populateForm() {
  if (!member.value) return

  // Populate member form
  Object.assign(form, {
    name: member.value.name,
    gender: member.value.gender,
    birthdate: member.value.birthdate.split('T')[0], // Convert to YYYY-MM-DD format
    nationality: member.value.nationality,
    phone: member.value.phone,
    email: member.value.email || '',
    maritalStatus: member.value.maritalStatus,
    spouseName: member.value.spouseName || '',
    educationLevel: member.value.educationLevel,
    yearOfConversion: member.value.yearOfConversion || '',
    occupation: member.value.occupation,
    rg: member.value.rg,
    issuingBody: member.value.issuingBody,
    cpf: member.value.cpf,
    lastChurch: member.value.lastChurch || '',
    lastPositionHeld: member.value.lastPositionHeld || '',
    isBaptized: member.value.isBaptized,
    isBaptizedInTheHolySpirit: member.value.isBaptizedInTheHolySpirit || false,
    currentPosition: member.value.currentPosition || '',
    wantsToBeAVolunteer: member.value.wantsToBeAVolunteer || false,
    areaOfInterest: member.value.areaOfInterest || '',
  })

  // Populate address form
  if (member.value.address) {
    Object.assign(addressForm, {
      city: member.value.address.city,
      country: member.value.address.country,
      district: member.value.address.district,
      postalCode: member.value.address.postalCode || '',
      streetName: member.value.address.streetName,
      streetNumber: member.value.address.streetNumber,
      state: member.value.address.state,
    })
  }
}

async function loadMember() {
  loading.value = true
  error.value = ''

  try {
    member.value = await membersService.getMember(memberId.value)
    populateForm()
  } catch (err: any) {
    console.error('Error loading member:', err)
    error.value = err.response?.data?.message || 'Erro ao carregar dados do membro'
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  submitting.value = true
  submitError.value = ''

  try {
    // Update address first
    if (member.value?.address) {
      await addressService.updateAddress(member.value.address.id, addressForm)
    }

    // Update member
    await membersService.updateMember(memberId.value, form)

    // Redirect to member details
    router.push(`/membros/detalhes/${memberId.value}`)
  } catch (err: any) {
    console.error('Error updating member:', err)
    submitError.value = err.response?.data?.message || 'Erro ao atualizar membro'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadMember()
})
</script>
