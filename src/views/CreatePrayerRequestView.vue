<template>
  <div>
    <!-- Header -->
    <div class="w-full flex justify-between mb-8">
      <h1 class="text-neutral-900 font-medium text-[28px]">Novo Pedido de Oração</h1>
      <router-link to="/pedidos-de-oracao" class="btn btn-secondary">
        <ArrowLeftIcon class="w-4 h-4 mr-2" />
        Voltar
      </router-link>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Prayer Request Form -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-medium text-neutral-900 mb-6">Informações do Pedido</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">Nome *</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Seu nome completo"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">Telefone</label>
            <input
              v-model="form.phone"
              type="tel"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="(84) 99999-9999"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">Área</label>
            <CustomSelect
              v-model="form.area"
              :options="[
                { value: 'Família', label: 'Família' },
                { value: 'Trabalho', label: 'Trabalho' },
                { value: 'Profissional', label: 'Profissional' },
                { value: 'Saúde', label: 'Saúde' },
                { value: 'Espiritual', label: 'Espiritual' },
                { value: 'Financeiro', label: 'Financeiro' },
                { value: 'Outro', label: 'Outro' },
              ]"
              placeholder="Selecione uma área"
            />
          </div>
        </div>

        <div class="mt-6">
          <label class="block text-sm font-medium text-neutral-700 mb-2">Pedido de Oração *</label>
          <textarea
            v-model="form.request"
            required
            rows="6"
            class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Descreva seu pedido de oração aqui..."
          ></textarea>
          <p class="text-xs text-neutral-500 mt-1">
            Compartilhe detalhes sobre sua situação para que possamos orar de forma mais específica.
          </p>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="flex justify-end space-x-4">
        <router-link to="/pedidos-de-oracao" class="btn btn-secondary"> Cancelar </router-link>
        <button type="submit" :disabled="submitting" class="btn btn-primary">
          <span
            v-if="submitting"
            class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
          ></span>
          {{ submitting ? 'Enviando...' : 'Enviar Pedido' }}
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
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'
import { prayerRequestsService } from '@/services/prayer-requests'
import CustomSelect from '@/components/CustomSelect.vue'

const router = useRouter()
const submitting = ref(false)
const error = ref('')
const success = ref('')

const form = reactive({
  name: '',
  phone: '',
  area: '',
  request: '',
})

async function handleSubmit() {
  submitting.value = true
  error.value = ''
  success.value = ''

  try {
    // Clean up the form data
    const requestData = {
      name: form.name.trim(),
      phone: form.phone.trim() || undefined,
      area: form.area || undefined,
      request: form.request.trim(),
    }

    await prayerRequestsService.createPrayerRequest(requestData)

    // Show success message
    success.value = 'Pedido de oração enviado com sucesso!'

    // Reset form
    Object.assign(form, {
      name: '',
      phone: '',
      area: '',
      request: '',
    })

    // Redirect after a short delay
    setTimeout(() => {
      router.push('/pedidos-de-oracao')
    }, 2000)
  } catch (err: any) {
    console.error('Error creating prayer request:', err)
    error.value = err.response?.data?.message || 'Erro ao enviar pedido de oração'
  } finally {
    submitting.value = false
  }
}
</script>
