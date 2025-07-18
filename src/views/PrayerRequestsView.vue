<template>
  <div>
    <!-- Header -->
    <div class="w-full flex justify-between mb-8">
      <h1 class="text-neutral-900 font-medium text-[28px]">Pedidos de Oração</h1>
      <router-link to="/pedidos-de-oracao/novo" class="btn btn-primary">
        <PlusIcon class="w-4 h-4 mr-2" />
        Novo Pedido
      </router-link>
    </div>

    <!-- Search and Filters -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <div class="relative">
            <MagnifyingGlassIcon
              class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400"
            />
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Buscar pedidos de oração..."
              class="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
        <div class="flex gap-2">
          <select
            v-model="areaFilter"
            class="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Todas as áreas</option>
            <option value="Família">Família</option>
            <option value="Trabalho">Trabalho</option>
            <option value="Profissional">Profissional</option>
            <option value="Saúde">Saúde</option>
            <option value="Espiritual">Espiritual</option>
            <option value="Financeiro">Financeiro</option>
            <option value="Outro">Outro</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Prayer Requests List -->
    <div class="bg-white rounded-lg shadow">
      <div class="px-6 py-4 border-b border-neutral-200">
        <h3 class="text-lg font-medium text-neutral-900">
          Pedidos de Oração ({{ filteredRequests.length }})
        </h3>
      </div>

      <div class="p-6">
        <div
          v-if="error"
          class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
        >
          {{ error }}
        </div>

        <div v-if="loading" class="text-center py-8">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"
          ></div>
          <p class="mt-2 text-neutral-500">Carregando pedidos...</p>
        </div>

        <div v-else-if="filteredRequests.length === 0" class="text-center py-8">
          <HeartIcon class="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <p class="text-neutral-500">
            {{
              searchTerm || areaFilter
                ? 'Nenhum pedido encontrado com os filtros aplicados'
                : 'Nenhum pedido de oração encontrado'
            }}
          </p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="request in filteredRequests"
            :key="request.id"
            class="p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <span
                    v-if="request.area"
                    class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800"
                  >
                    {{ request.area }}
                  </span>
                  <span class="text-xs text-neutral-500">
                    {{ formatDate(request.createdAt) }}
                  </span>
                </div>

                <p class="font-medium text-neutral-900 mb-2">
                  {{ request.name }}
                </p>

                <p class="text-sm text-neutral-600 mb-3">
                  {{ request.request }}
                </p>

                <div class="flex items-center gap-4 text-xs text-neutral-500">
                  <span v-if="request.phone">📞 {{ request.phone }}</span>
                  <span v-if="request.area">📍 {{ request.area }}</span>
                </div>
              </div>

              <div class="flex items-center gap-2 ml-4">
                <button
                  @click="deleteRequest(request)"
                  class="px-3 py-1 text-xs font-medium rounded-lg bg-red-100 text-red-800 hover:bg-red-200"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { PlusIcon, MagnifyingGlassIcon, HeartIcon } from '@heroicons/vue/24/outline'
import { prayerRequestsService, type PrayerRequest } from '@/services/prayer-requests'

const loading = ref(false)
const requests = ref<PrayerRequest[]>([])
const searchTerm = ref('')
const areaFilter = ref('')
const error = ref('')

const filteredRequests = computed(() => {
  let filtered = requests.value

  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    filtered = filtered.filter(
      (request) =>
        request.name.toLowerCase().includes(search) ||
        request.request.toLowerCase().includes(search) ||
        (request.area && request.area.toLowerCase().includes(search)),
    )
  }

  if (areaFilter.value) {
    filtered = filtered.filter((request) => request.area === areaFilter.value)
  }

  return filtered
})

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR')
}

async function deleteRequest(request: PrayerRequest) {
  if (!confirm('Tem certeza que deseja excluir este pedido de oração?')) {
    return
  }

  try {
    await prayerRequestsService.deletePrayerRequest(request.id)
    // Remove from local list
    const index = requests.value.findIndex((r) => r.id === request.id)
    if (index > -1) {
      requests.value.splice(index, 1)
    }
  } catch (err: any) {
    console.error('Error deleting prayer request:', err)
    error.value = 'Erro ao excluir pedido de oração'
  }
}

async function loadPrayerRequests() {
  loading.value = true
  error.value = ''

  try {
    requests.value = await prayerRequestsService.getPrayerRequests()
  } catch (err: any) {
    console.error('Error loading prayer requests:', err)
    error.value = err.response?.data?.message || 'Erro ao carregar pedidos de oração'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadPrayerRequests()
})
</script>
