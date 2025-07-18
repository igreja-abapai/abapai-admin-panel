<template>
  <div>
    <!-- Header -->
    <div class="w-full flex justify-between mb-8">
      <h1 class="text-neutral-900 font-medium text-[28px]">Novo Usuário</h1>
      <router-link to="/usuarios" class="btn btn-secondary">
        <ArrowLeftIcon class="w-4 h-4 mr-2" />
        Voltar
      </router-link>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
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
              <option value="">Selecione um cargo</option>
              <option v-for="role in roles" :key="role.id" :value="role.id">
                {{ role.name.charAt(0).toUpperCase() + role.name.slice(1) }} -
                {{ role.description }}
              </option>
            </select>
            <p class="text-xs text-neutral-500 mt-1">Opcional - define as permissões do usuário</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">Senha *</label>
            <input
              v-model="form.password"
              type="password"
              required
              minlength="6"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Senha"
            />
            <p class="text-xs text-neutral-500 mt-1">Mínimo 6 caracteres</p>
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-neutral-700 mb-2">Confirmar Senha *</label>
            <input
              v-model="form.confirmPassword"
              type="password"
              required
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Confirme a senha"
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
          {{ submitting ? 'Criando...' : 'Criar Usuário' }}
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
import { useRouter } from 'vue-router'
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'
import { usersService } from '@/services/users'
import { rolesService } from '@/services/roles'
import type { Role } from '@/stores/auth'

const router = useRouter()
const submitting = ref(false)
const error = ref('')
const success = ref('')
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
  return (
    form.firstName.length >= 2 &&
    form.lastName.length >= 2 &&
    form.email.includes('@') &&
    form.password.length >= 6 &&
    form.password === form.confirmPassword
  )
})

onMounted(async () => {
  try {
    roles.value = await rolesService.getRoles()
  } catch (err) {
    console.error('Error loading roles:', err)
  }
})

async function handleSubmit() {
  if (!isFormValid.value) {
    return
  }

  submitting.value = true
  error.value = ''
  success.value = ''

  try {
    const userData = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      ...(form.roleId && { roleId: form.roleId }),
    }

    await usersService.createUser(userData)

    // Show success message
    success.value = 'Usuário criado com sucesso!'

    // Reset form
    Object.assign(form, {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      roleId: null,
    })

    // Redirect after a short delay
    setTimeout(() => {
      router.push('/usuarios')
    }, 2000)
  } catch (err: any) {
    console.error('Error creating user:', err)
    error.value = err.response?.data?.message || 'Erro ao criar usuário'
  } finally {
    submitting.value = false
  }
}
</script>
