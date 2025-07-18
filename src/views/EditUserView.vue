<template>
  <div>
    <!-- Header -->
    <div class="w-full flex justify-between mb-8">
      <h1 class="text-neutral-900 font-medium text-[28px]">Editar Usuário</h1>
      <router-link to="/usuarios" class="btn btn-secondary">
        <ArrowLeftIcon class="w-4 h-4 mr-2" />
        Voltar
      </router-link>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
      <p class="mt-2 text-neutral-500">Carregando usuário...</p>
    </div>

    <div
      v-else-if="error"
      class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
    >
      {{ error }}
    </div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-6">
      <!-- User Form -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-medium text-neutral-900 mb-6">Informações do Usuário</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">Nome *</label>
            <input
              v-model="form.firstName"
              type="text"
              required
              minlength="2"
              maxlength="15"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Nome do usuário"
            />
            <p class="text-xs text-neutral-500 mt-1">Mínimo 2, máximo 15 caracteres</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">Sobrenome *</label>
            <input
              v-model="form.lastName"
              type="text"
              required
              minlength="2"
              maxlength="15"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Sobrenome do usuário"
            />
            <p class="text-xs text-neutral-500 mt-1">Mínimo 2, máximo 15 caracteres</p>
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-neutral-700 mb-2">Email *</label>
            <input
              v-model="form.email"
              type="email"
              required
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="usuario@exemplo.com"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">Cargo/Função</label>
            <select
              v-model="form.roleId"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Nenhum cargo</option>
              <option v-for="role in roles" :key="role.id" :value="role.id">
                {{ role.name.charAt(0).toUpperCase() + role.name.slice(1) }} -
                {{ role.description }}
              </option>
            </select>
            <p class="text-xs text-neutral-500 mt-1">Opcional - define as permissões do usuário</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2"
              >Nova Senha (opcional)</label
            >
            <input
              v-model="form.password"
              type="password"
              minlength="6"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Deixe em branco para manter a senha atual"
            />
            <p class="text-xs text-neutral-500 mt-1">Mínimo 6 caracteres</p>
          </div>

          <div v-if="form.password" class="md:col-span-2">
            <label class="block text-sm font-medium text-neutral-700 mb-2"
              >Confirmar Nova Senha</label
            >
            <input
              v-model="form.confirmPassword"
              type="password"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Confirme a nova senha"
            />
            <p
              v-if="form.password && form.confirmPassword && form.password !== form.confirmPassword"
              class="text-xs text-red-500 mt-1"
            >
              As senhas não coincidem
            </p>
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="flex justify-end space-x-4">
        <router-link to="/usuarios" class="btn btn-secondary"> Cancelar </router-link>
        <button type="submit" :disabled="submitting || !isFormValid" class="btn btn-primary">
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

    <!-- Success Message -->
    <div
      v-if="success"
      class="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg"
    >
      <div class="flex items-center">
        <CheckCircleIcon class="w-5 h-5 mr-2" />
        {{ success }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'
import { usersService, type User } from '@/services/users'
import { rolesService } from '@/services/roles'
import type { Role } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const error = ref('')
const submitError = ref('')
const success = ref('')
const submitting = ref(false)
const roles = ref<Role[]>([])

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  roleId: null as number | null,
})

const isFormValid = computed(() => {
  const basicValid =
    form.firstName.length >= 2 && form.lastName.length >= 2 && form.email.includes('@')

  if (form.password) {
    return basicValid && form.password.length >= 6 && form.password === form.confirmPassword
  }

  return basicValid
})

async function loadRoles() {
  try {
    roles.value = await rolesService.getRoles()
  } catch (err) {
    console.error('Error loading roles:', err)
  }
}

async function loadUser() {
  const userId = parseInt(route.params.id as string)
  if (isNaN(userId)) {
    error.value = 'ID de usuário inválido'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const user = await usersService.getUser(userId)

    // Populate form with user data
    form.firstName = user.firstName
    form.lastName = user.lastName
    form.email = user.email
    form.roleId = user.roleId || null
    form.password = ''
    form.confirmPassword = ''
  } catch (err: any) {
    console.error('Error loading user:', err)
    error.value = err.response?.data?.message || 'Erro ao carregar usuário'
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  if (!isFormValid.value) {
    return
  }

  submitting.value = true
  submitError.value = ''
  success.value = ''

  try {
    const userId = parseInt(route.params.id as string)
    const updateData: any = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim().toLowerCase(),
      roleId: form.roleId,
    }

    // Only include password if it's being changed
    if (form.password) {
      updateData.password = form.password
    }

    await usersService.updateUser(userId, updateData)

    // Show success message
    success.value = 'Usuário atualizado com sucesso!'

    // Clear password fields
    form.password = ''
    form.confirmPassword = ''

    // Redirect after a short delay
    setTimeout(() => {
      router.push('/usuarios')
    }, 2000)
  } catch (err: any) {
    console.error('Error updating user:', err)
    submitError.value = err.response?.data?.message || 'Erro ao atualizar usuário'
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadRoles(), loadUser()])
})
</script>
