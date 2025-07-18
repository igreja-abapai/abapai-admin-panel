<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { PlusIcon, UserGroupIcon, UserIcon, HeartIcon, ClockIcon } from '@heroicons/vue/24/outline'
import { membersService, type Member } from '@/services/members'

const stats = ref({
  totalMembers: 0,
  activeMembers: 0,
  prayerRequests: 0,
  recentActivities: 0,
})

const recentMembers = ref<Member[]>([])

function getInitials(name?: string): string {
  if (!name) return ''
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

onMounted(async () => {
  try {
    // Load real members data
    const members = await membersService.getMembers()

    stats.value = {
      totalMembers: members.length,
      activeMembers: members.filter((m) => m.isBaptized).length,
      prayerRequests: 0, // TODO: Implement prayer requests count
      recentActivities: 0, // TODO: Implement recent activities count
    }

    // Get recent members (last 3)
    recentMembers.value = members.slice(-3).reverse()
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  }
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="w-full flex justify-between mb-8">
      <h1 class="text-neutral-900 font-medium text-[28px]">Home</h1>
      <button class="btn btn-primary">
        <PlusIcon class="w-4 h-4 mr-2" />
        Novo Membro
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Total Members Card -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg">
            <UserGroupIcon class="w-6 h-6 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-neutral-600">Total de Membros</p>
            <p class="text-2xl font-bold text-neutral-900">{{ stats.totalMembers }}</p>
          </div>
        </div>
      </div>

      <!-- Active Members Card -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-lg">
            <UserIcon class="w-6 h-6 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-neutral-600">Membros Ativos</p>
            <p class="text-2xl font-bold text-neutral-900">{{ stats.activeMembers }}</p>
          </div>
        </div>
      </div>

      <!-- Prayer Requests Card -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-purple-100 rounded-lg">
            <HeartIcon class="w-6 h-6 text-purple-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-neutral-600">Pedidos de Oração</p>
            <p class="text-2xl font-bold text-neutral-900">{{ stats.prayerRequests }}</p>
          </div>
        </div>
      </div>

      <!-- Recent Activity Card -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-orange-100 rounded-lg">
            <ClockIcon class="w-6 h-6 text-orange-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-neutral-600">Atividades Recentes</p>
            <p class="text-2xl font-bold text-neutral-900">{{ stats.recentActivities }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Members -->
    <div class="bg-white rounded-lg shadow">
      <div class="px-6 py-4 border-b border-neutral-200">
        <h3 class="text-lg font-medium text-neutral-900">Membros Recentes</h3>
      </div>
      <div class="p-6">
        <div v-if="recentMembers.length === 0" class="text-center py-8">
          <UserGroupIcon class="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <p class="text-neutral-500">Nenhum membro encontrado</p>
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="member in recentMembers"
            :key="member.id"
            class="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50"
          >
            <div class="flex items-center">
              <div
                class="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium"
              >
                {{ getInitials(member.name) }}
              </div>
              <div class="ml-4">
                <p class="font-medium text-neutral-900">
                  {{ member.name }}
                </p>
                <p class="text-sm text-neutral-600">{{ member.email }}</p>
              </div>
            </div>
            <router-link
              :to="`/membros/detalhes/${member.id}`"
              class="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Ver detalhes
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
