<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  PlusIcon,
  UserGroupIcon,
  UserIcon,
  UserMinusIcon,
  ChevronRightIcon,
} from '@heroicons/vue/24/outline'
import PrayingIcon from '@/components/icons/PrayingIcon.vue'
import { membersService, type Member } from '@/services/members'
import { prayerRequestsService, type PrayerRequest } from '@/services/prayer-requests'
import { useAuthStore } from '@/stores/auth'
import {
  getUpcomingBirthdays,
  formatBirthdayDetail,
  formatDaysUntilBadge,
  type UpcomingBirthday,
} from '@/utils/birthdays'
import StatCard from '@/components/StatCard.vue'
import RecentMembersSkeleton from '@/components/RecentMembersSkeleton.vue'

const authStore = useAuthStore()

const stats = ref({
  totalMembers: 0,
  activeMembers: 0,
  prayerRequests: 0,
  inactiveMembers: 0,
})

const statBadges = ref({
  total: { text: '', class: 'bg-green-50 text-green-700' },
  active: { text: '', class: 'bg-green-50 text-green-700' },
  inactive: { text: '', class: 'bg-amber-50 text-amber-700' },
  prayer: { text: '', class: 'bg-green-50 text-green-700' },
})

const recentMembers = ref<Member[]>([])
const recentPrayerRequests = ref<PrayerRequest[]>([])
const upcomingBirthdays = ref<UpcomingBirthday[]>([])
const loading = ref(true)

const avatarColors = ['bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 'bg-violet-500']

const dateHeader = computed(() => {
  const now = new Date()
  const weekdays = ['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO']
  const months = [
    'JANEIRO',
    'FEVEREIRO',
    'MARÇO',
    'ABRIL',
    'MAIO',
    'JUNHO',
    'JULHO',
    'AGOSTO',
    'SETEMBRO',
    'OUTUBRO',
    'NOVEMBRO',
    'DEZEMBRO',
  ]
  return `${weekdays[now.getDay()]} · ${now.getDate()} DE ${months[now.getMonth()]}`
})

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
})

function getInitials(name?: string): string {
  if (!name) return ''
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getAvatarColor(name: string): string {
  const index =
    name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % avatarColors.length
  return avatarColors[index]
}

function getNewMembersThisMonth(members: Member[]): number {
  const now = new Date()
  return members.filter((member) => {
    if (!member.createdAt) return false
    const created = new Date(member.createdAt)
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
  }).length
}

function getPrayerRequestsThisWeek(requests: PrayerRequest[]): number {
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  return requests.filter((request) => new Date(request.createdAt) >= weekAgo).length
}

function getMemberSinceLabel(member: Member): string {
  if (!member.admissionDate) return ''

  const parts = member.admissionDate.split('/').map((part) => part.trim())
  const year = parts.length === 3 ? parts[2] : parts.length === 2 ? parts[1] : ''

  if (!year) return ''

  return `Membro desde ${year}`
}

function getMemberRoleLabel(member: Member): string {
  return member.currentPosition || member.occupation || 'Membro'
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const diffInMs = Date.now() - date.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))

  if (diffInDays > 0) {
    return `há ${diffInDays} ${diffInDays === 1 ? 'dia' : 'dias'}`
  }
  if (diffInHours > 0) {
    return `há ${diffInHours} h`
  }
  if (diffInMinutes > 0) {
    return `há ${diffInMinutes} min`
  }
  return 'agora'
}

function truncateText(text: string, maxLength = 80): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trim()}...`
}

onMounted(async () => {
  try {
    loading.value = true
    const membersResponse = await membersService.getMembers({
      isPaginated: false,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    })
    const members = membersResponse.data

    const prayerRequests = await prayerRequestsService.getPrayerRequests()
    const sortedPrayerRequests = [...prayerRequests].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )

    const activeCount = members.filter((m) => m.isActive).length
    const inactiveCount = members.filter((m) => !m.isActive).length
    const newThisMonth = getNewMembersThisMonth(members)
    const prayerThisWeek = getPrayerRequestsThisWeek(prayerRequests)
    const activePercent =
      membersResponse.total > 0 ? Math.round((activeCount / membersResponse.total) * 100) : 0

    stats.value = {
      totalMembers: membersResponse.total,
      activeMembers: activeCount,
      prayerRequests: prayerRequests.length,
      inactiveMembers: inactiveCount,
    }

    statBadges.value = {
      total:
        newThisMonth > 0
          ? { text: `+${newThisMonth} este mês`, class: 'bg-green-50 text-green-700' }
          : { text: '', class: '' },
      active: {
        text: `${activePercent}% ativos`,
        class: 'bg-green-50 text-green-700',
      },
      inactive:
        inactiveCount > 0
          ? { text: 'acompanhar', class: 'bg-amber-50 text-amber-700' }
          : { text: '', class: '' },
      prayer:
        prayerThisWeek > 0
          ? {
              text: `${prayerThisWeek} ${prayerThisWeek === 1 ? 'novo' : 'novos'}`,
              class: 'bg-green-50 text-green-700',
            }
          : { text: '', class: '' },
    }

    recentMembers.value = members.slice(0, 4)
    recentPrayerRequests.value = sortedPrayerRequests.slice(0, 3)
    upcomingBirthdays.value = getUpcomingBirthdays(members, 3)
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div>
        <p class="text-xs font-semibold tracking-wider text-primary-600 uppercase mb-2">
          {{ dateHeader }}
        </p>
        <h1 class="text-2xl sm:text-3xl font-semibold text-neutral-900 tracking-tight">
          {{ greeting }}, {{ authStore.user?.firstName }}
        </h1>
        <p class="text-neutral-500 mt-1">Aqui está o resumo da sua comunidade hoje.</p>
      </div>
      <div class="flex items-center gap-3 shrink-0">
        <router-link to="/membros" class="btn btn-secondary"> Ver membros </router-link>
        <router-link
          v-if="authStore.hasPermission('criar_membros')"
          to="/membros/cadastro"
          class="btn btn-primary"
        >
          <PlusIcon class="w-4 h-4 mr-2" />
          Novo membro
        </router-link>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard
        :icon="UserGroupIcon"
        title="Total de membros"
        :value="stats.totalMembers"
        :badge="statBadges.total.text"
        :badge-class="statBadges.total.class"
        icon-bg-color="bg-primary-50"
        icon-color="text-primary-600"
        :loading="loading"
      />
      <StatCard
        :icon="UserIcon"
        title="Membros ativos"
        :value="stats.activeMembers"
        :badge="statBadges.active.text"
        :badge-class="statBadges.active.class"
        icon-bg-color="bg-cyan-50"
        icon-color="text-cyan-600"
        :loading="loading"
      />
      <StatCard
        :icon="UserMinusIcon"
        title="Membros ausentes"
        :value="stats.inactiveMembers"
        :badge="statBadges.inactive.text"
        :badge-class="statBadges.inactive.class"
        icon-bg-color="bg-orange-50"
        icon-color="text-orange-600"
        :loading="loading"
        :to="{ path: '/membros', query: { status: 'Ausente' } }"
      />
      <StatCard
        :icon="PrayingIcon"
        title="Pedidos de oração"
        :value="stats.prayerRequests"
        :badge="statBadges.prayer.text"
        :badge-class="statBadges.prayer.class"
        icon-bg-color="bg-pink-50"
        icon-color="text-pink-600"
        :loading="loading"
      />
    </div>

    <RecentMembersSkeleton v-if="loading" />

    <div v-else class="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <div class="bg-white rounded-2xl border border-neutral-200">
        <div class="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h3 class="text-base font-semibold text-neutral-900">Membros recentes</h3>
            <p class="text-sm text-neutral-500 mt-0.5">Últimos cadastros realizados</p>
          </div>
          <router-link
            to="/membros"
            class="link text-sm"
          >
            Ver todos
          </router-link>
        </div>
        <div class="px-6">
          <div v-if="recentMembers.length === 0" class="text-center py-10">
            <UserGroupIcon class="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <p class="text-neutral-500 text-sm">Nenhum membro encontrado</p>
          </div>
          <div v-else class="divide-y divide-neutral-100">
            <div
              v-for="member in recentMembers"
              :key="member.id"
              class="flex items-center justify-between py-4"
            >
              <div class="flex items-center min-w-0">
                <div
                  v-if="member.photoUrl"
                  class="w-10 h-10 rounded-full overflow-hidden shrink-0"
                >
                  <img
                    :src="member.photoUrl"
                    :alt="`Foto de ${member.name}`"
                    class="w-full h-full object-cover"
                  />
                </div>
                <div
                  v-else
                  :class="[
                    'w-10 h-10 text-white rounded-full flex items-center justify-center text-sm font-medium shrink-0',
                    getAvatarColor(member.name),
                  ]"
                >
                  {{ getInitials(member.name) }}
                </div>
                <div class="ml-3 min-w-0">
                  <p class="font-medium text-neutral-900 truncate text-sm">{{ member.name }}</p>
                  <div class="flex flex-wrap items-center gap-1.5 mt-1">
                    <span
                      v-if="member.isActive"
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700"
                    >
                      Ativo
                    </span>
                    <span
                      v-else
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700"
                    >
                      Ausente
                    </span>
                    <span class="text-xs text-neutral-400">·</span>
                    <span class="text-xs text-neutral-500">
                      {{ getMemberRoleLabel(member) }}
                      <template v-if="getMemberSinceLabel(member)">
                        · {{ getMemberSinceLabel(member) }}
                      </template>
                    </span>
                  </div>
                </div>
              </div>
              <router-link
                :to="`/membros/detalhes/${member.id}`"
                class="link inline-flex items-center text-sm whitespace-nowrap ml-4"
              >
                Ver detalhes
                <ChevronRightIcon class="w-4 h-4 ml-0.5" />
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-neutral-200">
        <div class="px-6 pt-4 pb-5 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <div class="flex items-center gap-1.5">
              <h3 class="text-base font-semibold text-neutral-900">Próximos aniversários</h3>
              <span class="mb-1">🎂</span>
            </div>
            <p class="text-sm text-neutral-500 mt-0.5">Aniversariantes mais próximos</p>
          </div>
          <router-link
            to="/membros/aniversariantes"
            class="link text-sm"
          >
            Ver mais
          </router-link>
        </div>
        <div class="px-6">
          <div v-if="upcomingBirthdays.length === 0" class="text-center py-10">
            <p class="text-neutral-500 text-sm">Nenhum aniversariante encontrado</p>
          </div>
          <div v-else class="divide-y divide-neutral-100">
            <div
              v-for="entry in upcomingBirthdays"
              :key="entry.member.id"
              class="flex items-center justify-between py-4"
            >
              <div class="flex items-center min-w-0">
                <div
                  v-if="entry.member.photoUrl"
                  class="w-10 h-10 rounded-full overflow-hidden shrink-0"
                >
                  <img
                    :src="entry.member.photoUrl"
                    :alt="`Foto de ${entry.member.name}`"
                    class="w-full h-full object-cover"
                  />
                </div>
                <div
                  v-else
                  :class="[
                    'w-10 h-10 text-white rounded-full flex items-center justify-center text-sm font-medium shrink-0',
                    getAvatarColor(entry.member.name),
                  ]"
                >
                  {{ getInitials(entry.member.name) }}
                </div>
                <div class="ml-3 min-w-0">
                  <p class="font-medium text-neutral-900 truncate text-sm">
                    {{ entry.member.name }}
                  </p>
                  <p class="text-sm text-neutral-500 mt-0.5">
                    {{ formatBirthdayDetail(entry.nextDate, entry.ageTurning) }}
                  </p>
                </div>
              </div>
              <span
                class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 shrink-0 ml-4"
              >
                🎂 {{ formatDaysUntilBadge(entry.daysUntil) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-neutral-200">
        <div class="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h3 class="text-base font-semibold text-neutral-900">Pedidos de oração</h3>
            <p class="text-sm text-neutral-500 mt-0.5">Pedidos mais recentes</p>
          </div>
          <router-link
            to="/pedidos-de-oracao"
            class="link text-sm"
          >
            Abrir
          </router-link>
        </div>
        <div class="px-6">
          <div v-if="recentPrayerRequests.length === 0" class="text-center py-10">
            <PrayingIcon class="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <p class="text-neutral-500 text-sm">Nenhum pedido de oração encontrado</p>
          </div>
          <div v-else class="divide-y divide-neutral-100">
            <div
              v-for="request in recentPrayerRequests"
              :key="request.id"
              class="py-4"
            >
              <div class="flex items-start gap-3">
                <div
                  class="w-10 h-10 bg-violet-100 text-violet-700 rounded-full flex items-center justify-center text-sm font-medium shrink-0"
                >
                  {{ request.name ? getInitials(request.name) : '?' }}
                </div>
                <div class="min-w-0 flex-1">
                  <p class="font-medium text-neutral-900 text-sm">
                    {{ request.name || 'Anônimo' }}
                  </p>
                  <p class="text-sm text-neutral-500 mt-1 line-clamp-2">
                    {{ truncateText(request.request) }}
                  </p>
                  <p class="text-xs text-neutral-400 mt-2">
                    {{ request.area || 'Geral' }} · {{ formatRelativeTime(request.createdAt) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
