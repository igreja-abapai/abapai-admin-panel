<template>
  <div>
    <!-- Header -->
    <div class="w-full flex justify-between mb-8">
      <h1 class="text-neutral-900 font-medium text-[28px]">Pedidos de Oração</h1>
      <button class="btn btn-primary">
        <PlusIcon class="w-4 h-4 mr-2" />
        Novo Pedido
      </button>
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
            v-model="statusFilter"
            class="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Todos os status</option>
            <option value="pending">Pendente</option>
            <option value="answered">Respondido</option>
            <option value="closed">Fechado</option>
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
              searchTerm || statusFilter
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
                    :class="[
                      'px-2 py-1 text-xs font-medium rounded-full',
                      getStatusClass(request.status),
                    ]"
                  >
                    {{ getStatusText(request.status) }}
                  </span>
                  <span class="text-xs text-neutral-500">
                    {{ formatDate(request.createdAt) }}
                  </span>
                </div>

                <p class="font-medium text-neutral-900 mb-2">
                  {{ request.title }}
                </p>

                <p class="text-sm text-neutral-600 mb-3">
                  {{ request.description }}
                </p>

                <div class="flex items-center gap-4 text-xs text-neutral-500">
                  <span>Por: {{ request.memberName }}</span>
                  <span>•</span>
                  <span>{{ request.prayerCount }} orações</span>
                </div>
              </div>

              <div class="flex items-center gap-2 ml-4">
                <button
                  @click="toggleAnswered(request)"
                  :class="[
                    'px-3 py-1 text-xs font-medium rounded-lg',
                    request.status === 'answered'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200',
                  ]"
                >
                  {{ request.status === 'answered' ? 'Respondido' : 'Marcar como Respondido' }}
                </button>

                <button
                  @click="closeRequest(request)"
                  :class="[
                    'px-3 py-1 text-xs font-medium rounded-lg',
                    request.status === 'closed'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200',
                  ]"
                >
                  {{ request.status === 'closed' ? 'Fechado' : 'Fechar' }}
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

interface PrayerRequest {
  id: string
  title: string
  description: string
  memberName: string
  status: 'pending' | 'answered' | 'closed'
  createdAt: string
  prayerCount: number
}

const loading = ref(false)
const requests = ref<PrayerRequest[]>([])
const searchTerm = ref('')
const statusFilter = ref('')

const filteredRequests = computed(() => {
  let filtered = requests.value

  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    filtered = filtered.filter(
      (request) =>
        request.title.toLowerCase().includes(search) ||
        request.description.toLowerCase().includes(search) ||
        request.memberName.toLowerCase().includes(search),
    )
  }

  if (statusFilter.value) {
    filtered = filtered.filter((request) => request.status === statusFilter.value)
  }

  return filtered
})

function getStatusClass(status: string): string {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    answered: 'bg-green-100 text-green-800',
    closed: 'bg-red-100 text-red-800',
  }
  return classes[status as keyof typeof classes] || classes.pending
}

function getStatusText(status: string): string {
  const texts = {
    pending: 'Pendente',
    answered: 'Respondido',
    closed: 'Fechado',
  }
  return texts[status as keyof typeof texts] || 'Pendente'
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR')
}

function toggleAnswered(request: PrayerRequest) {
  request.status = request.status === 'answered' ? 'pending' : 'answered'
}

function closeRequest(request: PrayerRequest) {
  request.status = 'closed'
}

onMounted(async () => {
  loading.value = true

  try {
    // TODO: Fetch real data from API
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

    requests.value = [
      {
        id: '1',
        title: 'Cura para minha mãe',
        description: 'Minha mãe está doente e precisa de oração para sua recuperação.',
        memberName: 'João Silva',
        status: 'pending',
        createdAt: '2024-01-15T10:30:00Z',
        prayerCount: 5,
      },
      {
        id: '2',
        title: 'Emprego',
        description: 'Preciso de um novo emprego para sustentar minha família.',
        memberName: 'Maria Santos',
        status: 'answered',
        createdAt: '2024-01-14T15:45:00Z',
        prayerCount: 12,
      },
      {
        id: '3',
        title: 'Problemas familiares',
        description: 'Estamos passando por dificuldades em nossa família.',
        memberName: 'Pedro Oliveira',
        status: 'closed',
        createdAt: '2024-01-13T09:20:00Z',
        prayerCount: 8,
      },
      {
        id: '4',
        title: 'Estudos',
        description: 'Preciso de foco e sabedoria para meus estudos.',
        memberName: 'Ana Costa',
        status: 'pending',
        createdAt: '2024-01-12T14:15:00Z',
        prayerCount: 3,
      },
    ]
  } catch (error) {
    console.error('Error loading prayer requests:', error)
  } finally {
    loading.value = false
  }
})
</script>
