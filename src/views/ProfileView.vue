<template>
  <div>
    <!-- Header -->
    <div class="w-full flex justify-between mb-8">
      <h1 class="text-neutral-900 font-medium text-[28px]">Minha Conta</h1>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white rounded-lg shadow p-6">
      <div class="text-center py-8">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"
        ></div>
        <p class="text-neutral-500">Carregando dados da conta...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-white rounded-lg shadow p-6">
      <div class="text-center py-8">
        <ExclamationTriangleIcon class="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-neutral-900 mb-2">Erro ao carregar dados</h3>
        <p class="text-neutral-500">{{ error }}</p>
        <button @click="loadUser" class="btn btn-primary mt-4">Tentar Novamente</button>
      </div>
    </div>

    <!-- Profile Display (Read-only) -->
    <div v-else-if="user && !isEditing" class="space-y-6">
      <!-- Personal Information -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-medium text-neutral-900">Informações Pessoais</h3>
          <button @click="startEditing" class="btn btn-primary">Editar dados</button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">Nome</label>
            <div
              class="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900"
            >
              {{ user.firstName }}
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">Sobrenome</label>
            <div
              class="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900"
            >
              {{ user.lastName }}
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">Email</label>
            <div
              class="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900"
            >
              {{ user.email }}
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">Função</label>
            <div
              class="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900"
            >
              {{ user.role?.name || 'Não definida' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Actions Section -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-medium text-neutral-900 mb-6">Ações</h3>
        <div class="flex space-x-4">
          <button @click="showChangePasswordModal = true" class="btn btn-secondary">
            <KeyIcon class="w-4 h-4 mr-2" />
            Alterar senha
          </button>
        </div>
      </div>
    </div>

    <!-- Profile Form (Editable) -->
    <form v-else-if="user && isEditing" @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Personal Information -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-medium text-neutral-900">Informações Pessoais</h3>
          <button type="button" @click="cancelEditing" class="btn btn-secondary">Cancelar</button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">Nome *</label>
            <input
              v-model="form.firstName"
              type="text"
              required
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Digite o nome"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">Sobrenome *</label>
            <input
              v-model="form.lastName"
              type="text"
              required
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Digite o sobrenome"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">Email *</label>
            <input
              v-model="form.email"
              type="email"
              required
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="email@exemplo.com"
            />
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="flex justify-end space-x-4">
        <button type="submit" :disabled="submitting" class="btn btn-primary">
          <span
            v-if="submitting"
            class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
          ></span>
          {{ submitting ? 'Salvando...' : 'Salvar Alterações' }}
        </button>
      </div>
    </form>

    <!-- Success Message -->
    <div
      v-if="successMessage"
      class="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg"
    >
      {{ successMessage }}
    </div>

    <!-- Error Message -->
    <div
      v-if="submitError"
      class="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
    >
      {{ submitError }}
    </div>

    <!-- Change Password Modal -->
    <div
      v-if="showChangePasswordModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
    >
      <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <h2 class="text-lg font-semibold mb-4">Alterar senha</h2>
        <form @submit.prevent="handleChangePassword">
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Senha atual</label>
            <input
              v-model="changePasswordForm.currentPassword"
              type="password"
              required
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Nova senha</label>
            <input
              v-model="changePasswordForm.newPassword"
              type="password"
              required
              minlength="6"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Confirmar nova senha</label>
            <input
              v-model="changePasswordForm.confirmPassword"
              type="password"
              required
              minlength="6"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p
              v-if="
                changePasswordForm.newPassword &&
                changePasswordForm.confirmPassword &&
                changePasswordForm.newPassword !== changePasswordForm.confirmPassword
              "
              class="text-xs text-red-500 mt-1"
            >
              As senhas não coincidem
            </p>
          </div>
          <div v-if="changePasswordError" class="mb-2 text-red-600 text-sm">
            {{ changePasswordError }}
          </div>
          <div v-if="changePasswordSuccess" class="mb-2 text-green-600 text-sm">
            {{ changePasswordSuccess }}
          </div>
          <div class="flex justify-end gap-2 mt-4">
            <button
              type="button"
              class="btn btn-secondary"
              @click="showChangePasswordModal = false"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="changingPassword || !isChangePasswordFormValid"
            >
              <span
                v-if="changingPassword"
                class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
              ></span>
              {{ changingPassword ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </form>
        <button
          @click="showChangePasswordModal = false"
          class="absolute top-2 right-2 text-neutral-400 hover:text-neutral-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ExclamationTriangleIcon, KeyIcon } from '@heroicons/vue/24/outline'
import { usersService, type User } from '@/services/users'
import { rolesService } from '@/services/roles'
import type { Role } from '@/stores/auth'
import { authService } from '@/services/auth'
import { useAuthStore } from '@/stores/auth'
import CustomSelect from '@/components/CustomSelect.vue'

const user = ref<User | null>(null)
const roles = ref<Role[]>([])
const loading = ref(false)
const submitting = ref(false)
const error = ref('')
const submitError = ref('')
const successMessage = ref('')
const isEditing = ref(false)

// Auth store
const authStore = useAuthStore()

// Password change modal
const showChangePasswordModal = ref(false)
const changingPassword = ref(false)
const changePasswordError = ref('')
const changePasswordSuccess = ref('')
const changePasswordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const isChangePasswordFormValid = computed(() => {
  return (
    changePasswordForm.value.currentPassword.length >= 1 &&
    changePasswordForm.value.newPassword.length >= 6 &&
    changePasswordForm.value.newPassword === changePasswordForm.value.confirmPassword
  )
})

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
})

function startEditing() {
  // Populate form with current user data
  if (user.value) {
    form.firstName = user.value.firstName
    form.lastName = user.value.lastName
    form.email = user.value.email
  }

  // Clear messages
  submitError.value = ''
  successMessage.value = ''

  isEditing.value = true
}

function cancelEditing() {
  isEditing.value = false
  submitError.value = ''
  successMessage.value = ''
}

async function handleChangePassword() {
  if (!isChangePasswordFormValid.value) return
  changingPassword.value = true
  changePasswordError.value = ''
  changePasswordSuccess.value = ''
  try {
    await authService.changePassword(
      changePasswordForm.value.currentPassword,
      changePasswordForm.value.newPassword,
    )
    changePasswordSuccess.value = 'Senha alterada com sucesso!'
    changePasswordForm.value.currentPassword = ''
    changePasswordForm.value.newPassword = ''
    changePasswordForm.value.confirmPassword = ''

    // Close modal after successful password change
    setTimeout(() => {
      showChangePasswordModal.value = false
      changePasswordSuccess.value = ''
    }, 1500)
  } catch (err: any) {
    changePasswordError.value = err.response?.data?.message || 'Erro ao alterar senha'
  } finally {
    changingPassword.value = false
  }
}

async function loadUser() {
  loading.value = true
  error.value = ''

  try {
    // Load current user data
    user.value = await usersService.getCurrentUser()

    // Load roles for the dropdown
    roles.value = await rolesService.getRoles()
  } catch (err: any) {
    console.error('Error loading user:', err)
    error.value = err.response?.data?.message || 'Erro ao carregar dados da conta'
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  submitting.value = true
  submitError.value = ''
  successMessage.value = ''

  try {
    // Prepare update data
    const updateData: any = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
    }

    // Update user
    await usersService.updateCurrentUser(updateData)

    successMessage.value = 'Dados atualizados com sucesso!'

    // Reload user data
    await loadUser()

    // Update auth store with new user data
    if (user.value) {
      authStore.setUser(user.value)
    }

    // Exit editing mode
    isEditing.value = false
  } catch (err: any) {
    console.error('Error updating user:', err)
    submitError.value = err.response?.data?.message || 'Erro ao atualizar dados'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadUser()
})
</script>
