<template>
  <div class="bg-white rounded-lg shadow p-8">
    <h1 class="text-2xl font-bold text-neutral-900 mb-4">Aniversariantes</h1>

    <div class="mb-8">
      <h2 class="text-lg font-semibold text-primary-700 mb-2">Aniversariantes de hoje</h2>
      <div v-if="loading">
        <div class="flex gap-6 overflow-x-auto pb-2">
          <div
            v-for="i in 3"
            :key="i"
            class="flex flex-col items-center min-w-[90px] animate-pulse"
          >
            <div
              class="w-16 h-16 rounded-full bg-neutral-200 mb-2 border-2 border-primary-100"
            ></div>
            <div class="h-4 w-16 bg-neutral-200 rounded mb-1"></div>
            <div class="h-3 w-12 bg-neutral-100 rounded"></div>
          </div>
        </div>
      </div>
      <div v-else-if="birthdaysToday.length === 0" class="text-neutral-500">
        Nenhum aniversariante hoje.
      </div>
      <div v-else class="flex gap-6 overflow-x-auto pb-2">
        <div
          v-for="member in birthdaysToday"
          :key="member.id"
          class="flex flex-col items-center min-w-[90px]"
        >
          <div
            class="w-16 h-16 rounded-full bg-neutral-200 flex items-center justify-center overflow-hidden mb-2 border-2 border-primary-400"
          >
            <img
              v-if="member.photoUrl"
              :src="member.photoUrl"
              alt="Foto do membro"
              class="object-cover w-full h-full"
            />
            <span v-else class="text-2xl text-neutral-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </span>
          </div>
          <span class="text-sm font-medium text-neutral-900 text-center truncate w-20">{{
            member.name
          }}</span>
          <span class="text-xs text-neutral-500">{{ formatNextBirthday(member.birthdate) }}</span>
        </div>
      </div>
    </div>

    <div class="mb-8">
      <h2 class="text-lg font-semibold text-primary-700 mb-2">Próximos aniversariantes</h2>
      <div v-if="loading">
        <div class="flex gap-6 overflow-x-auto pb-2">
          <div
            v-for="i in 5"
            :key="i"
            class="flex flex-col items-center min-w-[90px] animate-pulse"
          >
            <div
              class="w-16 h-16 rounded-full bg-neutral-200 mb-2 border-2 border-primary-100"
            ></div>
            <div class="h-4 w-16 bg-neutral-200 rounded mb-1"></div>
            <div class="h-3 w-12 bg-neutral-100 rounded"></div>
          </div>
        </div>
      </div>
      <div v-else-if="nextBirthdays.length === 0" class="text-neutral-500">
        Nenhum aniversariante encontrado.
      </div>
      <div v-else class="flex gap-6 overflow-x-auto pb-2">
        <div
          v-for="entry in nextBirthdays"
          :key="entry.member.id"
          class="flex flex-col items-center min-w-[90px]"
        >
          <div
            class="w-16 h-16 rounded-full bg-neutral-200 flex items-center justify-center overflow-hidden mb-2 border-2 border-primary-400"
          >
            <img
              v-if="entry.member.photoUrl"
              :src="entry.member.photoUrl"
              alt="Foto do membro"
              class="object-cover w-full h-full"
            />
            <span v-else class="text-2xl text-neutral-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </span>
          </div>
          <span class="text-sm font-medium text-neutral-900 text-center truncate w-20">{{
            entry.member.name
          }}</span>
          <span class="text-xs text-neutral-500">{{
            formatNextBirthday(entry.member.birthdate)
          }}</span>
        </div>
      </div>
    </div>

    <div>
      <h2 class="text-lg font-semibold text-primary-700 mb-2">Aniversariantes de cada mês</h2>
      <div v-if="loading">
        <ul class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <li
            v-for="i in 12"
            :key="i"
            class="bg-neutral-50 rounded-lg p-4 flex flex-col animate-pulse"
          >
            <div class="h-4 w-24 bg-neutral-200 rounded mb-2"></div>
            <div class="h-4 w-32 bg-neutral-100 rounded mb-1"></div>
            <div class="h-3 w-20 bg-neutral-100 rounded"></div>
          </li>
        </ul>
      </div>
      <div v-else>
        <ul class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <li
            v-for="(monthMembers, idx) in nextBirthdaysByMonth"
            :key="idx"
            class="bg-neutral-50 rounded-lg p-4 flex flex-col"
          >
            <span class="font-semibold text-primary-700 mb-2">{{ monthNames[idx] }}</span>
            <template v-if="monthMembers && monthMembers.length > 0">
              <div class="space-y-2">
                <div v-for="entry in monthMembers" :key="entry.member.id" class="flex flex-col">
                  <span class="font-medium text-neutral-900">{{ entry.member.name }}</span>
                  <span class="text-neutral-500 text-sm">{{
                    formatNextBirthday(entry.member.birthdate, false)
                  }}</span>
                </div>
              </div>
            </template>
            <template v-else>
              <span class="text-neutral-400">Nenhum aniversariante</span>
            </template>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { membersService, type Member } from '@/services/members'

const members = ref<Member[]>([])
const loading = ref(false)
const today = new Date()

const monthNames = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

function parseDate(dateStr: string): Date {
  // Handles YYYY-MM-DD or ISO strings
  if (dateStr.length === 10) {
    const [year, month, day] = dateStr.split('-').map(Number)
    return new Date(year, month - 1, day)
  }
  return new Date(dateStr)
}

function getNextBirthdayDate(birthdateStr: string): Date {
  const birth = parseDate(birthdateStr)
  const thisYear = today.getFullYear()
  let next = new Date(thisYear, birth.getMonth(), birth.getDate())
  if (
    next < today &&
    !(next.getDate() === today.getDate() && next.getMonth() === today.getMonth())
  ) {
    next.setFullYear(thisYear + 1)
  }
  return next
}

function formatNextBirthday(birthdateStr: string, includeYear: boolean = true): string {
  const next = getNextBirthdayDate(birthdateStr)
  return next.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    ...(includeYear && { year: 'numeric' }),
  })
}

const birthdaysToday = computed(() => {
  return members.value.filter((member) => {
    if (!member.birthdate) return false
    const date = parseDate(member.birthdate)
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth()
  })
})

// Next 5 birthdays (from today onward, including today)
const nextBirthdays = computed(() => {
  const todayY = today.getFullYear()
  const all = members.value
    .filter((m) => m.birthdate)
    .map((m) => {
      const date = parseDate(m.birthdate)
      let next = new Date(todayY, date.getMonth(), date.getDate())
      if (
        next < today &&
        !(next.getDate() === today.getDate() && next.getMonth() === today.getMonth())
      ) {
        next.setFullYear(todayY + 1)
      }
      return { member: m, next }
    })
  all.sort((a, b) => a.next.getTime() - b.next.getTime())
  return all.slice(0, 5)
})

// For each month, find all members with birthdays in that month
const nextBirthdaysByMonth = computed(() => {
  const result: Array<{ member: Member; date: Date }[] | null> = []
  for (let month = 0; month < 12; month++) {
    // All members with a birthday in this month
    const monthMembers = members.value
      .filter((m) => m.birthdate)
      .map((m) => ({ member: m, date: parseDate(m.birthdate) }))
      .filter(({ date }) => date.getMonth() === month)

    if (monthMembers.length === 0) {
      result.push(null)
      continue
    }

    // Calculate next birthday date for each member in this month
    const todayY = today.getFullYear()
    const membersWithNextBirthday = monthMembers.map(({ member, date }) => {
      // Set year to this year for comparison
      const candidateDate = new Date(todayY, month, date.getDate())
      // If birthday already passed this year, set to next year
      if (
        candidateDate < today &&
        !(
          candidateDate.getDate() === today.getDate() &&
          candidateDate.getMonth() === today.getMonth()
        )
      ) {
        candidateDate.setFullYear(todayY + 1)
      }
      return { member, date: candidateDate }
    })

    // Sort by date (earliest first)
    membersWithNextBirthday.sort((a, b) => a.date.getTime() - b.date.getTime())
    result.push(membersWithNextBirthday)
  }
  return result
})

onMounted(async () => {
  loading.value = true
  try {
    const response = await membersService.getMembers({ limit: 1000 })
    members.value = response.data
  } finally {
    loading.value = false
  }
})
</script>
