<template>
  <div class="bg-white rounded-lg shadow p-8">
    <h1 class="text-2xl font-bold text-neutral-900 mb-4">Gerenciamento do Website</h1>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"
      ></div>
      <p class="text-neutral-500">Carregando configurações...</p>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
    >
      {{ error }}
    </div>

    <!-- Main Content -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

        <!-- About Page Content -->
        <div class="bg-neutral-50 rounded-lg p-6">
          <h2 class="text-lg font-semibold text-primary-700 mb-4">Conteúdo da Página Sobre Nós</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Quem Somos</label>
              <QuillEditor
                v-model:content="websiteInfo.aboutWhoWeAre"
                content-type="html"
                :options="quillOptions"
                class="min-h-[200px]"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Nossa Missão</label>
              <QuillEditor
                v-model:content="websiteInfo.aboutOurMission"
                content-type="html"
                :options="quillOptions"
                class="min-h-[200px]"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Nossos Valores</label>
              <QuillEditor
                v-model:content="websiteInfo.aboutOurValues"
                content-type="html"
                :options="quillOptions"
                class="min-h-[200px]"
              />
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
    <div v-if="!loading" class="flex justify-end space-x-4 mt-8 pt-6 border-t border-neutral-200">
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
import { ref, reactive, onMounted } from 'vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { websiteService, type WebsiteSettings } from '@/services/website'

const saving = ref(false)
const loading = ref(false)
const error = ref('')

const websiteInfo = reactive({
  churchName: '',
  address: '',
  phone: '',
  email: '',
  facebook: '',
  instagram: '',
  youtube: '',
  about: '',
  serviceTimes: '',
  welcomeMessage: '',
  aboutWhoWeAre: '',
  aboutOurMission: '',
  aboutOurValues: '',
  isActive: true,
  maintenanceMode: false,
})

// Quill editor options
const quillOptions = {
  theme: 'snow',
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline'],
      ['blockquote', 'code-block'],
      [{ header: 1 }, { header: 2 }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      ['link'],
      ['clean'],
    ],
  },
}

async function loadSettings() {
  loading.value = true
  error.value = ''

  try {
    const settings = await websiteService.getSettings()
    Object.assign(websiteInfo, settings)
  } catch (err: any) {
    console.error('Error loading website settings:', err)
    error.value = err.response?.data?.message || 'Erro ao carregar configurações do website'
  } finally {
    loading.value = false
  }
}

async function saveWebsiteSettings() {
  saving.value = true
  error.value = ''

  try {
    await websiteService.updateSettings(websiteInfo)
    // Show success message
    console.log('Website settings saved successfully')
  } catch (err: any) {
    console.error('Error saving website settings:', err)
    error.value = err.response?.data?.message || 'Erro ao salvar configurações do website'
  } finally {
    saving.value = false
  }
}

function resetForm() {
  loadSettings()
}

onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
/* Custom styling for QuillEditor */
:deep(.ql-editor) {
  min-height: 200px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
}

:deep(.ql-toolbar) {
  border-top: 1px solid #d1d5db;
  border-left: 1px solid #d1d5db;
  border-right: 1px solid #d1d5db;
  border-radius: 8px 8px 0 0;
}

:deep(.ql-container) {
  border-bottom: 1px solid #d1d5db;
  border-left: 1px solid #d1d5db;
  border-right: 1px solid #d1d5db;
  border-radius: 0 0 8px 8px;
}

:deep(.ql-editor:focus) {
  outline: none;
}

:deep(.ql-toolbar .ql-stroke) {
  stroke: #6b7280;
}

:deep(.ql-toolbar .ql-fill) {
  fill: #6b7280;
}

:deep(.ql-toolbar button:hover .ql-stroke) {
  stroke: #374151;
}

:deep(.ql-toolbar button:hover .ql-fill) {
  fill: #374151;
}

:deep(.ql-toolbar button.ql-active .ql-stroke) {
  stroke: #3b82f6;
}

:deep(.ql-toolbar button.ql-active .ql-fill) {
  fill: #3b82f6;
}
</style>
