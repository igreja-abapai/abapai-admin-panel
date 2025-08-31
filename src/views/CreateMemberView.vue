<template>
  <div>
    <!-- Header -->
    <div class="w-full flex justify-between mb-8">
      <h1 class="text-neutral-900 font-medium text-[28px]">Cadastrar Novo Membro</h1>
      <router-link to="/membros" class="btn btn-secondary">
        <ArrowLeftIcon class="w-4 h-4 mr-2" />
        Voltar
      </router-link>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Photo Upload Section -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-medium text-neutral-900 mb-6">Foto do Membro</h3>

        <div class="flex items-start space-x-6">
          <div class="relative">
            <div
              v-if="photoPreview"
              class="w-32 h-40 rounded-lg overflow-hidden border-2 border-neutral-200 shadow-sm"
            >
              <img :src="photoPreview" alt="Preview da foto" class="w-full h-full object-cover" />
            </div>
            <div
              v-else
              class="w-32 h-40 rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 flex flex-col items-center justify-center text-neutral-500 hover:border-primary-400 hover:bg-primary-50 transition-colors cursor-pointer"
              @click="photoInput?.click()"
            >
              <svg
                class="w-8 h-8 mb-2 text-neutral-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
              </svg>
              <p class="text-xs text-center px-2">Clique para adicionar foto</p>
            </div>

            <!-- Upload progress indicator -->
            <div
              v-if="uploadingPhoto"
              class="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center"
            >
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
          </div>

          <div class="flex flex-col space-y-3">
            <input
              ref="photoInput"
              type="file"
              accept="image/*"
              @change="handlePhotoChange"
              class="hidden"
            />
            <button
              type="button"
              @click="photoInput?.click()"
              :disabled="uploadingPhoto"
              class="btn btn-secondary text-sm"
            >
              {{ uploadingPhoto ? 'Enviando...' : 'Escolher Foto' }}
            </button>
            <button
              v-if="photoPreview"
              type="button"
              @click="removePhoto"
              :disabled="uploadingPhoto"
              class="text-red-600 hover:text-red-700 text-sm"
            >
              Remover foto
            </button>
            <div class="text-xs text-neutral-500 space-y-1">
              <p>Formatos aceitos: JPG, PNG, GIF, WebP</p>
              <p>Tamanho máximo: 5MB</p>
              <p>Recomendado: 3:4 (formato documento)</p>
            </div>
          </div>
        </div>

        <!-- Photo upload error -->
        <div
          v-if="photoError"
          class="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
        >
          {{ photoError }}
        </div>
      </div>

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
            <CustomSelect
              v-model="form.gender"
              :options="[
                { value: 'Masculino', label: 'Masculino' },
                { value: 'Feminino', label: 'Feminino' },
              ]"
              placeholder="Selecione o gênero"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2"
              >Data de Nascimento *</label
            >
            <VueDatePicker
              v-model="form.birthdate"
              :enable-time-picker="false"
              placeholder="dd/mm/aaaa"
              format="dd/MM/yyyy"
              class="w-full"
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
            <label class="block text-sm font-medium text-neutral-700 mb-2">Naturalidade</label>
            <input
              v-model="form.placeOfBirth"
              type="text"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Ex: São Paulo, SP"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2"
              >Quantidade de Filhos</label
            >
            <input
              v-model="form.childrenCount"
              type="number"
              min="0"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="0"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">Nome do Pai</label>
            <input
              v-model="form.fatherName"
              type="text"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Nome completo do pai"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">Nome da Mãe</label>
            <input
              v-model="form.motherName"
              type="text"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Nome completo da mãe"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">Telefone *</label>
            <input
              v-model="form.phone"
              @input="handlePhoneInput"
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
            <CustomSelect
              v-model="form.maritalStatus"
              :options="[
                { value: 'Solteiro', label: 'Solteiro' },
                { value: 'Casado', label: 'Casado' },
                { value: 'Divorciado', label: 'Divorciado' },
                { value: 'Viúvo', label: 'Viúvo' },
              ]"
              placeholder="Selecione o estado civil"
              required
            />
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
            <CustomSelect
              v-model="form.educationLevel"
              :options="[
                { value: 'Ensino Fundamental', label: 'Ensino Fundamental' },
                { value: 'Ensino Médio', label: 'Ensino Médio' },
                { value: 'Curso Técnico', label: 'Curso Técnico' },
                { value: 'Ensino Superior', label: 'Ensino Superior' },
                { value: 'Pós-Graduação', label: 'Pós-Graduação' },
                { value: 'Mestrado', label: 'Mestrado' },
                { value: 'Doutorado', label: 'Doutorado' },
                { value: 'Outro', label: 'Outro' },
              ]"
              placeholder="Selecione a escolaridade"
              required
            />
          </div>

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
        </div>
      </div>

      <!-- Address Information -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-medium text-neutral-900 mb-6">Endereço</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="md:col-span-2">
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
              @input="handleCEPInput"
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
              @input="handleCPFInput"
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

      <!-- Spiritual Information -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-medium text-neutral-900 mb-6">Informações Espirituais</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <label class="block text-sm font-medium text-neutral-700 mb-2"
              >Período do Último Cargo</label
            >
            <input
              v-model="form.lastPositionPeriod"
              type="text"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Ex: 2020-2022"
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

          <div class="flex items-center">
            <input
              v-model="form.isBaptized"
              type="checkbox"
              id="isBaptized"
              class="w-4 h-4 text-primary-600 bg-neutral-100 border-neutral-300 rounded focus:ring-primary-500 focus:ring-2"
            />
            <label for="isBaptized" class="ml-2 text-sm font-medium text-neutral-700">
              É batizado nas águas *
            </label>
          </div>

          <div v-if="form.isBaptized">
            <label class="block text-sm font-medium text-neutral-700 mb-2">Ano do Batismo</label>
            <input
              v-model="form.yearOfBaptism"
              type="text"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Ex: 2021"
            />
          </div>

          <div v-if="form.isBaptized">
            <label class="block text-sm font-medium text-neutral-700 mb-2">Local do Batismo</label>
            <input
              v-model="form.baptismPlace"
              type="text"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Ex: Igreja Batista Central"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">
              É batizado no Espírito Santo
            </label>
            <div class="space-y-2">
              <label class="flex items-center">
                <input
                  v-model="form.isBaptizedInTheHolySpirit"
                  type="radio"
                  :value="true"
                  class="w-4 h-4 text-primary-600 bg-neutral-100 border-neutral-300 focus:ring-primary-500 focus:ring-2"
                />
                <span class="ml-2 text-sm text-neutral-700">Sim</span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="form.isBaptizedInTheHolySpirit"
                  type="radio"
                  :value="false"
                  class="w-4 h-4 text-primary-600 bg-neutral-100 border-neutral-300 focus:ring-primary-500 focus:ring-2"
                />
                <span class="ml-2 text-sm text-neutral-700">Não</span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="form.isBaptizedInTheHolySpirit"
                  type="radio"
                  :value="null"
                  class="w-4 h-4 text-primary-600 bg-neutral-100 border-neutral-300 focus:ring-primary-500 focus:ring-2"
                />
                <span class="ml-2 text-sm text-neutral-700">Não informado</span>
              </label>
            </div>
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

          <div v-if="form.wantsToBeAVolunteer">
            <label class="block text-sm font-medium text-neutral-700 mb-2">Área de Interesse</label>
            <input
              v-model="form.areaOfInterest"
              type="text"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Ex: Louvor, Recepção, Dpt. Infantil, etc."
            />
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-neutral-700 mb-2">Observações</label>
            <textarea
              v-model="form.observations"
              rows="4"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Informações adicionais sobre o membro..."
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="flex justify-end space-x-4">
        <router-link to="/membros" class="btn btn-secondary"> Cancelar </router-link>
        <button type="submit" :disabled="loading" class="btn btn-primary">
          <span
            v-if="loading"
            class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
          ></span>
          {{ loading ? 'Salvando...' : 'Cadastrar Membro' }}
        </button>
      </div>
    </form>

    <!-- Error Message -->
    <div
      v-if="error"
      class="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
    >
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'
import { membersService } from '@/services/members'
import { addressService, type CreateAddressRequest } from '@/services/address'
import { uploadFileToS3, isValidImageFile, isValidFileSize } from '@/utils/s3Upload'
import { formatPhoneNumber, unformatPhoneNumber } from '@/utils/phoneMask'
import { formatCPF, unformatCPF } from '@/utils/cpfMask'
import { formatCEP, unformatCEP } from '@/utils/cepMask'
import { formatDateForInput } from '@/utils/dateFormat'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import CustomSelect from '@/components/CustomSelect.vue'

const router = useRouter()
const loading = ref(false)
const error = ref('')

// Photo upload states
const photoPreview = ref<string>('')
const photoFile = ref<File | null>(null)
const uploadingPhoto = ref(false)
const photoError = ref('')
const photoInput = ref<HTMLInputElement>()

const form = reactive({
  name: '',
  gender: '',
  birthdate: null as Date | null,
  nationality: '',
  phone: '',
  email: '',
  maritalStatus: '',
  spouseName: '',
  educationLevel: '',
  yearOfConversion: '',
  yearOfBaptism: '',
  placeOfBirth: '',
  occupation: '',
  rg: '',
  issuingBody: '',
  cpf: '',
  lastChurch: '',
  lastPositionHeld: '',
  isBaptized: false,
  isBaptizedInTheHolySpirit: null as boolean | null,
  currentPosition: '',
  wantsToBeAVolunteer: false,
  areaOfInterest: '',
  childrenCount: null as number | null,
  fatherName: '',
  motherName: '',
  lastPositionPeriod: '',
  baptismPlace: '',
  observations: '',
})

const addressForm = reactive<CreateAddressRequest>({
  city: '',
  country: '',
  district: '',
  postalCode: '',
  streetName: '',
  streetNumber: '',
  state: '',
})

function getInitials(name?: string): string {
  if (!name) return ''
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

async function handlePhotoChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  photoError.value = ''

  // Validate file type
  if (!isValidImageFile(file)) {
    photoError.value = 'Por favor, selecione um arquivo de imagem válido (JPG, PNG, GIF, WebP)'
    return
  }

  // Validate file size
  if (!isValidFileSize(file, 5)) {
    photoError.value = 'O arquivo deve ter no máximo 5MB'
    return
  }

  // Store file and create preview (don't upload yet)
  photoFile.value = file

  const reader = new FileReader()
  reader.onload = (e) => {
    photoPreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

function removePhoto() {
  photoPreview.value = ''
  photoFile.value = null
  photoError.value = ''
  if (photoInput.value) {
    photoInput.value.value = ''
  }
}

function handlePhoneInput(event: Event) {
  const target = event.target as HTMLInputElement
  const rawValue = target.value
  const formattedValue = formatPhoneNumber(rawValue)

  // Update the input value with formatting
  target.value = formattedValue

  // Update the form data with the formatted value
  form.phone = formattedValue
}

function handleCPFInput(event: Event) {
  const target = event.target as HTMLInputElement
  const rawValue = target.value
  const formattedValue = formatCPF(rawValue)

  // Update the input value with formatting
  target.value = formattedValue

  // Update the form data with the formatted value
  form.cpf = formattedValue
}

function handleCEPInput(event: Event) {
  const target = event.target as HTMLInputElement
  const rawValue = target.value
  const formattedValue = formatCEP(rawValue)

  // Update the input value with formatting
  target.value = formattedValue

  // Update the address form data with the formatted value
  addressForm.postalCode = formattedValue
}

async function handleSubmit() {
  loading.value = true
  error.value = ''

  try {
    let photoUrl = ''

    // Upload photo to S3 if a file is selected
    if (photoFile.value) {
      uploadingPhoto.value = true
      try {
        const result = await uploadFileToS3(photoFile.value)
        photoUrl = result.fileUrl
      } catch (err: any) {
        console.error('Error uploading photo:', err)
        error.value = 'Erro ao fazer upload da foto: ' + (err.message || 'Erro desconhecido')
        return
      } finally {
        uploadingPhoto.value = false
      }
    }

    // First create the address
    const address = await addressService.createAddress(addressForm)

    // Format birthdate properly to avoid timezone issues
    let formattedBirthdate: string = ''
    if (form.birthdate) {
      // Extract the date components and format as YYYY-MM-DD
      const year = form.birthdate.getFullYear()
      const month = form.birthdate.getMonth() + 1 // getMonth() returns 0-11
      const day = form.birthdate.getDate()

      // Format as YYYY-MM-DD with explicit timezone offset to ensure local interpretation
      const timezoneOffset = form.birthdate.getTimezoneOffset()
      const offsetHours = Math.abs(Math.floor(timezoneOffset / 60))
      const offsetMinutes = Math.abs(timezoneOffset % 60)
      const offsetSign = timezoneOffset <= 0 ? '+' : '-'

      // Send as ISO string with timezone offset to ensure correct interpretation
      formattedBirthdate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T00:00:00.000${offsetSign}${offsetHours.toString().padStart(2, '0')}:${offsetMinutes.toString().padStart(2, '0')}`
    }

    // Format the birthdate for the API (convert to yyyy-mm-dd if needed)
    const memberData = {
      ...form,
      birthdate: formattedBirthdate,
      addressId: parseInt(address.id),
      // Add photo URL if uploaded
      ...(photoUrl && { photoUrl }),
    }

    await membersService.createMember(memberData)

    // Redirect to members list
    router.push('/membros')
  } catch (err: any) {
    console.error('Error creating member:', err)
    error.value = err.response?.data?.message || 'Erro ao cadastrar membro'
  } finally {
    loading.value = false
  }
}
</script>
