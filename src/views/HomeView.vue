<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  PlusIcon,
  UserGroupIcon,
  UserIcon,
  HeartIcon,
  UserMinusIcon,
} from '@heroicons/vue/24/outline'
import { membersService, type Member } from '@/services/members'
import { prayerRequestsService } from '@/services/prayer-requests'
import StatCard from '@/components/StatCard.vue'
import RecentMembersSkeleton from '@/components/RecentMembersSkeleton.vue'

const stats = ref({
  totalMembers: 0,
  activeMembers: 0,
  prayerRequests: 0,
  inactiveMembers: 0,
})

const recentMembers = ref<Member[]>([])
const loading = ref(true)

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
    loading.value = true
    // Load real members data
    const members = await membersService.getMembers()

    // Load real prayer requests data
    const prayerRequests = await prayerRequestsService.getPrayerRequests()

    stats.value = {
      totalMembers: members.length,
      activeMembers: members.filter((m) => m.isActive).length,
      prayerRequests: prayerRequests.length,
      inactiveMembers: members.filter((m) => !m.isActive).length,
    }

    // Get recent members (last 3)
    recentMembers.value = members.slice(-3).reverse()
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  } finally {
    loading.value = false
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
      <StatCard
        :icon="UserGroupIcon"
        title="Total de Membros"
        :value="stats.totalMembers"
        icon-bg-color="bg-blue-100"
        icon-color="text-blue-600"
        :loading="loading"
      />
      <StatCard
        :icon="UserIcon"
        title="Membros Ativos"
        :value="stats.activeMembers"
        icon-bg-color="bg-green-100"
        icon-color="text-green-600"
        :loading="loading"
      />
      <StatCard
        :icon="UserMinusIcon"
        title="Membros afastados"
        :value="stats.inactiveMembers"
        icon-bg-color="bg-red-100"
        icon-color="text-red-600"
        :loading="loading"
      />
      <StatCard
        :icon="HeartIcon"
        title="Pedidos de Oração"
        :value="stats.prayerRequests"
        icon-bg-color="bg-purple-100"
        icon-color="text-purple-600"
        :loading="loading"
      />
    </div>

    <!-- Recent Members -->
    <RecentMembersSkeleton v-if="loading" />
    <div v-else class="bg-white rounded-lg shadow">
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
                v-if="member.photoUrl"
                class="w-10 h-10 rounded-full overflow-hidden border-2 border-neutral-200"
              >
                <img
                  :src="member.photoUrl"
                  :alt="`Foto de ${member.name}`"
                  class="w-full h-full object-cover"
                />
              </div>
              <div
                v-else
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
