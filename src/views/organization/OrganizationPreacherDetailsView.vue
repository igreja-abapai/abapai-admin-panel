<template>
  <div class="w-full">
    <div class="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <h1 class="text-neutral-900 font-medium text-[28px]">Detalhes do Pregador</h1>
      <div class="flex gap-2">
        <router-link to="/organizacao/pregadores" class="btn btn-secondary">
          <ArrowLeftIcon class="w-4 h-4 mr-2" />
          Voltar
        </router-link>
        <button
          v-if="canManage && preacher"
          type="button"
          class="btn btn-primary"
          @click="showEditModal = true"
        >
          <PencilIcon class="w-4 h-4 mr-2" />
          Editar
        </button>
      </div>
    </div>

    <div v-if="loading" class="bg-white rounded-lg shadow p-6">
      <div class="text-center py-8">
        <Spinner size="xl" class="text-primary-600 mx-auto mb-4" />
        <p class="text-neutral-500">Carregando detalhes do pregador...</p>
      </div>
    </div>

    <div v-else-if="error" class="bg-white rounded-lg shadow p-6">
      <div class="text-center py-8">
        <p class="text-neutral-500">{{ error }}</p>
        <button type="button" class="btn btn-primary mt-4" @click="loadPreacher">
          Tentar Novamente
        </button>
      </div>
    </div>

    <template v-else-if="preacher">
      <div class="space-y-6">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex flex-col sm:flex-row items-start gap-6">
            <MemberAvatar
              :name="preacher.name"
              :photo-url="preacher.photoUrl"
              rounded="lg"
              size="profile"
            />
            <div class="min-w-0 flex-1 space-y-4">
              <div>
                <h2 class="text-2xl font-semibold text-neutral-900">{{ preacher.name }}</h2>
                <div class="flex flex-wrap items-center gap-2 mt-2">
                  <span
                    :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      preacher.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-neutral-100 text-neutral-600',
                    ]"
                  >
                    {{ preacher.isActive ? 'Ativo' : 'Inativo' }}
                  </span>
                </div>
              </div>
              <div>
                <p class="text-xs font-medium uppercase tracking-wide text-neutral-400">Telefone</p>
                <p class="text-sm text-neutral-800 mt-1">
                  {{ preacher.phone ? formatPhoneNumber(preacher.phone) : '—' }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div class="px-6 py-6 border-b border-neutral-100">
            <h2 class="text-base font-semibold text-neutral-900">Histórico de pregações</h2>
            <p class="text-sm text-neutral-500 mt-1">
              Cultos em que este pregador foi escalado (passados e futuros).
            </p>
          </div>

          <div v-if="historyLoading" class="p-6 text-center text-neutral-500">
            Carregando histórico...
          </div>
          <p v-else-if="historyError" class="p-6 text-red-600">{{ historyError }}</p>
          <div v-else-if="history.length === 0" class="p-6 text-sm text-neutral-500">
            Nenhuma pregação registrada ainda.
          </div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-neutral-100">
              <thead class="bg-neutral-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                    Data
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                    Culto
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                    Função
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-100">
                <tr v-for="item in history" :key="item.assignmentId">
                  <td class="px-6 py-4 text-sm text-neutral-800 whitespace-nowrap">
                    {{ formatDateTime(item.scheduledAt) }}
                  </td>
                  <td class="px-6 py-4 text-sm text-neutral-800">
                    <router-link
                      :to="`/organizacao/escalas/${item.worshipServiceId}`"
                      class="text-primary-600 hover:text-primary-700"
                    >
                      {{ item.serviceName }}
                    </router-link>
                  </td>
                  <td class="px-6 py-4 text-sm text-neutral-600">{{ item.serviceRoleName }}</td>
                  <td class="px-6 py-4 text-sm text-neutral-600">{{ item.status }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>

    <PreacherFormModal
      v-model="showEditModal"
      :preacher="preacher"
      @saved="handleSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeftIcon, PencilIcon } from '@heroicons/vue/24/outline'
import Spinner from '@/components/Spinner.vue'
import MemberAvatar from '@/components/MemberAvatar.vue'
import PreacherFormModal from '@/components/organization/PreacherFormModal.vue'
import {
  organizationService,
  type Preacher,
  type PreacherScheduleHistoryItem,
} from '@/services/organization'
import { useAuthStore } from '@/stores/auth'
import { formatChurchDateTime } from '@/utils/churchDateTime'
import { formatPhoneNumber } from '@/utils/phoneMask'

const route = useRoute()
const authStore = useAuthStore()
const canManage = computed(() => authStore.hasPermission('gerenciar_escalas'))

const loading = ref(false)
const historyLoading = ref(false)
const error = ref('')
const historyError = ref('')
const preacher = ref<Preacher | null>(null)
const history = ref<PreacherScheduleHistoryItem[]>([])
const showEditModal = ref(false)

function formatDateTime(value: string) {
  return formatChurchDateTime(value)
}

async function loadPreacher() {
  loading.value = true
  error.value = ''
  try {
    const id = Number(route.params.id)
    preacher.value = await organizationService.getPreacher(id)
  } catch {
    error.value = 'Erro ao carregar pregador.'
  } finally {
    loading.value = false
  }
}

async function loadHistory() {
  if (!preacher.value) return
  historyLoading.value = true
  historyError.value = ''
  try {
    history.value = await organizationService.getPreacherScheduleHistory(preacher.value.id)
  } catch {
    historyError.value = 'Erro ao carregar histórico.'
  } finally {
    historyLoading.value = false
  }
}

async function handleSaved(saved: Preacher) {
  preacher.value = saved
  await loadHistory()
}

watch(
  () => route.params.id,
  async () => {
    await loadPreacher()
    if (preacher.value) {
      await loadHistory()
    }
  },
)

onMounted(async () => {
  await loadPreacher()
  if (preacher.value) {
    await loadHistory()
  }
})
</script>
