<template>
  <div class="bg-white rounded-lg shadow p-8">
    <h1 class="text-2xl font-bold text-neutral-900 mb-4">Gerenciamento do Website</h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Website Information -->
      <div class="space-y-6">
        <div class="bg-neutral-50 rounded-lg p-6">
          <h2 class="text-lg font-semibold text-primary-700 mb-4">Informações do Website</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Nome da Igreja</label>
              <input
                v-model="websiteInfo.churchName"
                type="text"
                class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Nome da Igreja"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Endereço</label>
              <input
                v-model="websiteInfo.address"
                type="text"
                class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Endereço da Igreja"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Telefone</label>
              <input
                v-model="websiteInfo.phone"
                type="text"
                class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Telefone de Contato"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Email</label>
              <input
                v-model="websiteInfo.email"
                type="email"
                class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Email de Contato"
              />
            </div>
          </div>
        </div>

        <!-- Social Media -->
        <div class="bg-neutral-50 rounded-lg p-6">
          <h2 class="text-lg font-semibold text-primary-700 mb-4">Redes Sociais</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Facebook</label>
              <input
                v-model="websiteInfo.facebook"
                type="url"
                class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="https://facebook.com/igreja"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Instagram</label>
              <input
                v-model="websiteInfo.instagram"
                type="url"
                class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="https://instagram.com/igreja"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">YouTube</label>
              <input
                v-model="websiteInfo.youtube"
                type="url"
                class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="https://youtube.com/igreja"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Content Management -->
      <div class="space-y-6">
        <div class="bg-neutral-50 rounded-lg p-6">
          <h2 class="text-lg font-semibold text-primary-700 mb-4">Conteúdo do Website</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Sobre a Igreja</label>
              <textarea
                v-model="websiteInfo.about"
                rows="4"
                class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Descrição sobre a igreja..."
              ></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1"
                >Horários dos Cultos</label
              >
              <textarea
                v-model="websiteInfo.serviceTimes"
                rows="3"
                class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Horários dos cultos..."
              ></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1"
                >Mensagem de Boas-vindas</label
              >
              <textarea
                v-model="websiteInfo.welcomeMessage"
                rows="3"
                class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Mensagem de boas-vindas..."
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Settings -->
        <div class="bg-neutral-50 rounded-lg p-6">
          <h2 class="text-lg font-semibold text-primary-700 mb-4">Configurações</h2>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <label class="block text-sm font-medium text-neutral-700">Website Ativo</label>
                <p class="text-xs text-neutral-500">Ativar ou desativar o website público</p>
              </div>
              <button
                @click="websiteInfo.isActive = !websiteInfo.isActive"
                :class="[
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  websiteInfo.isActive ? 'bg-primary-500' : 'bg-neutral-300',
                ]"
              >
                <span
                  :class="[
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    websiteInfo.isActive ? 'translate-x-6' : 'translate-x-1',
                  ]"
                ></span>
              </button>
            </div>
            <div class="flex items-center justify-between">
              <div>
                <label class="block text-sm font-medium text-neutral-700">Modo Manutenção</label>
                <p class="text-xs text-neutral-500">Ativar modo de manutenção</p>
              </div>
              <button
                @click="websiteInfo.maintenanceMode = !websiteInfo.maintenanceMode"
                :class="[
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  websiteInfo.maintenanceMode ? 'bg-yellow-500' : 'bg-neutral-300',
                ]"
              >
                <span
                  :class="[
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    websiteInfo.maintenanceMode ? 'translate-x-6' : 'translate-x-1',
                  ]"
                ></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-end space-x-4 mt-8 pt-6 border-t border-neutral-200">
      <button
        @click="resetForm"
        class="px-4 py-2 text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
      >
        Cancelar
      </button>
      <button
        @click="saveWebsiteSettings"
        :disabled="saving"
        class="px-4 py-2 bg-primary-500 text-white hover:bg-primary-600 rounded-lg transition-colors disabled:opacity-50"
      >
        <span
          v-if="saving"
          class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
        ></span>
        {{ saving ? 'Salvando...' : 'Salvar Configurações' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const saving = ref(false)

const websiteInfo = reactive({
  churchName: 'Igreja Abapai',
  address: 'Rua da Igreja, 123 - Centro',
  phone: '(11) 99999-9999',
  email: 'contato@igrejaabapai.com.br',
  facebook: 'https://facebook.com/igrejaabapai',
  instagram: 'https://instagram.com/igrejaabapai',
  youtube: 'https://youtube.com/igrejaabapai',
  about: 'Nossa igreja é um lugar de acolhimento e crescimento espiritual...',
  serviceTimes: 'Domingo: 9h e 18h\nQuarta: 19h30',
  welcomeMessage: 'Bem-vindo à Igreja Abapai! Estamos felizes em tê-lo conosco.',
  isActive: true,
  maintenanceMode: false,
})

function saveWebsiteSettings() {
  saving.value = true
  // TODO: Implement API call to save website settings
  setTimeout(() => {
    saving.value = false
    // Show success message
  }, 1000)
}

function resetForm() {
  // TODO: Reset form to original values
}
</script>
