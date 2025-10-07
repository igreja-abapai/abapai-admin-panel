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

    <!-- Carousel - Full width (spans both columns) -->
    <div v-else>
      <div class="bg-neutral-50 rounded-lg p-6 mb-8">
        <h2 class="text-lg font-semibold text-primary-700 mb-4">Imagens do Carrossel</h2>
        <CarouselImagesEditor ref="carouselRef" />
      </div>

      <!-- Main Content -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Website Information -->
        <div class="space-y-6">
          <div class="bg-neutral-50 rounded-lg p-6">
            <h2 class="text-lg font-semibold text-primary-700 mb-4">Conteúdo geral do Website</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-neutral-700 mb-1"
                  >URL da Mensagem da Semana (YouTube)</label
                >
                <input
                  v-model="websiteInfo.weeklyMessageUrl"
                  type="url"
                  class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
              <div class="grid grid-cols-1 gap-4">
                <div>
                  <label class="block text-sm font-medium text-neutral-700 mb-1"
                    >Título da Mensagem da Semana</label
                  >
                  <input
                    v-model="websiteInfo.weeklyMessageTitle"
                    type="text"
                    class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Título exibido na home"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-neutral-700 mb-1"
                    >Data da Mensagem da Semana</label
                  >
                  <input
                    v-model="websiteInfo.weeklyMessageDate"
                    type="text"
                    class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Ex: 21 JUL 2022"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-700 mb-4"
                  >Informações Bancárias</label
                >
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-neutral-700 mb-1">Banco</label>
                    <input
                      v-model="websiteInfo.bankInfo.bank"
                      type="text"
                      class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Ex: 403 - Banco Cora SDC"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-neutral-700 mb-1">Agência</label>
                    <input
                      v-model="websiteInfo.bankInfo.agency"
                      type="text"
                      class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Ex: 0001"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-neutral-700 mb-1"
                      >Conta Corrente</label
                    >
                    <input
                      v-model="websiteInfo.bankInfo.account"
                      type="text"
                      class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Ex: 4416982-0"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-neutral-700 mb-1">CNPJ</label>
                    <input
                      v-model="websiteInfo.bankInfo.cnpj"
                      type="text"
                      class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Ex: 52.782.534/0001-10"
                    />
                  </div>
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-neutral-700 mb-1">Nome</label>
                    <input
                      v-model="websiteInfo.bankInfo.name"
                      type="text"
                      class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Ex: Ministério Cristão Aba Pai"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-700 mb-4"
                  >Informações PIX</label
                >
                <div class="space-y-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-neutral-700 mb-1">Tipo</label>
                      <input
                        v-model="websiteInfo.pixInfo.type"
                        type="text"
                        class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Ex: CNPJ, Telefone, Email"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-neutral-700 mb-1"
                        >Chave PIX</label
                      >
                      <input
                        v-model="websiteInfo.pixInfo.key"
                        type="text"
                        class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Ex: 52.782.534/0001-10"
                      />
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-neutral-700 mb-1">Nome</label>
                    <input
                      v-model="websiteInfo.pixInfo.name"
                      type="text"
                      class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Ex: MINISTÉRIO CRISTÃO ABA PAI"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Church Schedule -->
          <div class="bg-neutral-50 rounded-lg p-6">
            <h2 class="text-lg font-semibold text-primary-700 mb-4">Programação da Igreja</h2>
            <ScheduleEventsEditor ref="scheduleRef" />
          </div>
        </div>

        <!-- Content Management -->
        <div class="space-y-6">
          <div class="bg-neutral-50 rounded-lg p-6">
            <h2 class="text-lg font-semibold text-primary-700 mb-4">Informações da igreja</h2>
            <div class="space-y-4">
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
              <div>
                <label class="block text-sm font-medium text-neutral-700 mb-1">Twitter</label>
                <input
                  v-model="websiteInfo.twitter"
                  type="url"
                  class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="https://twitter.com/igreja"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-700 mb-1">WhatsApp</label>
                <input
                  v-model="websiteInfo.whatsapp"
                  type="text"
                  class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="5584998305218"
                />
              </div>
            </div>
          </div>

          <!-- About Page Content -->
          <div class="bg-neutral-50 rounded-lg p-6">
            <h2 class="text-lg font-semibold text-primary-700 mb-4">
              Conteúdo da Página Sobre Nós
            </h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-neutral-700 mb-1">Quem Somos</label>
                <div class="quill-wrap">
                  <QuillEditor
                    v-model:content="websiteInfo.aboutWhoWeAre"
                    content-type="html"
                    :options="quillOptions"
                    class="min-h-[200px]"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-700 mb-1">Nossa Missão</label>
                <div class="quill-wrap">
                  <QuillEditor
                    v-model:content="websiteInfo.aboutOurMission"
                    content-type="html"
                    :options="quillOptions"
                    class="min-h-[200px]"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-700 mb-1"
                  >Nossos Valores</label
                >
                <div class="quill-wrap">
                  <QuillEditor
                    v-model:content="websiteInfo.aboutOurValues"
                    content-type="html"
                    :options="quillOptions"
                    class="min-h-[200px]"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Settings -->
          <!-- <div class="bg-neutral-50 rounded-lg p-6">
            <h2 class="text-lg font-semibold text-primary-700 mb-4">Configurações</h2>
            <div class="space-y-4">
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
          </div> -->
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
import ScheduleEventsEditor from '@/components/website/ScheduleEventsEditor.vue'
import CarouselImagesEditor from '@/components/website/CarouselImagesEditor.vue'

const saving = ref(false)
const loading = ref(false)
const error = ref('')
const scheduleRef = ref()
const carouselRef = ref()

const websiteInfo = reactive({
  address: '',
  phone: '',
  email: '',
  facebook: '',
  instagram: '',
  youtube: '',
  twitter: '',
  whatsapp: '',
  about: '',
  serviceTimes: '',
  aboutWhoWeAre: '',
  aboutOurMission: '',
  aboutOurValues: '',
  weeklyMessageUrl: '',
  weeklyMessageTitle: '',
  weeklyMessageDate: '',
  bankInfo: {
    bank: '',
    agency: '',
    account: '',
    cnpj: '',
    name: '',
  },
  pixInfo: {
    type: '',
    key: '',
    name: '',
  },
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

    // Ensure bankInfo and pixInfo objects are initialized
    if (!websiteInfo.bankInfo) {
      websiteInfo.bankInfo = {
        bank: '',
        agency: '',
        account: '',
        cnpj: '',
        name: '',
      }
    }
    if (!websiteInfo.pixInfo) {
      websiteInfo.pixInfo = {
        type: '',
        key: '',
        name: '',
      }
    }
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
    // Save carousel images first
    const carousel = (carouselRef as any)?.value
    if (carousel && typeof carousel.save === 'function') {
      await carousel.save()
    }
    // Save schedule
    const schedule = (scheduleRef as any)?.value
    if (schedule && typeof schedule.save === 'function') {
      await schedule.save()
    }
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
.quill-wrap :deep(.ql-toolbar),
.quill-wrap :deep(.ql-container),
.quill-wrap :deep(.ql-editor) {
  background-color: #ffffff !important;
}

::deep(.ql-editor) {
  min-height: 200px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
}

::deep(.ql-toolbar) {
  border-top: 1px solid #d1d5db;
  border-left: 1px solid #d1d5db;
  border-right: 1px solid #d1d5db;
  border-radius: 8px 8px 0 0;
}

::deep(.ql-container) {
  border-bottom: 1px solid #d1d5db;
  border-left: 1px solid #d1d5db;
  border-right: 1px solid #d1d5db;
  border-radius: 0 0 8px 8px;
}

.quill-wrap :deep(.ql-snow .ql-editor) {
  background-color: #ffffff !important;
}

::deep(.ql-editor:focus) {
  outline: none;
}

::deep(.ql-toolbar .ql-stroke) {
  stroke: #6b7280;
}

::deep(.ql-toolbar .ql-fill) {
  fill: #6b7280;
}

::deep(.ql-toolbar button:hover .ql-stroke) {
  stroke: #374151;
}

::deep(.ql-toolbar button:hover .ql-fill) {
  fill: #374151;
}

::deep(.ql-toolbar button.ql-active .ql-stroke) {
  stroke: #3b82f6;
}

::deep(.ql-toolbar button.ql-active .ql-fill) {
  fill: #3b82f6;
}
</style>
