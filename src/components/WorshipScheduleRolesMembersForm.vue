<template>
  <div class="space-y-3">
    <AccordionPanel
      v-model:open="rolesSectionOpen"
      title="Funções para escalar"
      :badge="rolesBadge"
      icon-class="bg-primary-50 text-primary-600"
    >
      <template #icon>
        <MinusIcon v-if="rolesSectionOpen" class="h-4 w-4" />
        <PlusIcon v-else class="h-4 w-4" />
      </template>

      <div class="max-h-44 overflow-y-auto thin-scrollbar px-3 py-2 space-y-0.5">
        <label
          v-for="role in roleOptions"
          :key="role.value"
          class="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-neutral-50 transition-colors cursor-pointer"
        >
          <Checkbox v-model="selectedRoleIds" :value="role.value" />
          <div
            :class="[
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
              getCategoryStyle(role.category).icon,
            ]"
          >
            <component :is="getCategoryIcon(role.category)" class="h-4 w-4" />
          </div>
          <span class="text-sm font-medium text-neutral-800">{{ role.label }}</span>
        </label>
        <p v-if="roleOptions.length === 0" class="px-2 py-3 text-sm text-neutral-500">
          Nenhuma função ativa encontrada.
        </p>
      </div>
    </AccordionPanel>

    <AccordionPanel
      v-if="selectedRoleIds.length > 0"
      v-model:open="membersSectionOpen"
      title="Membros para escalar"
      :badge="membersBadge"
      icon-class="bg-neutral-100 text-neutral-500"
    >
      <template #icon>
        <UserGroupIcon class="h-4 w-4" />
      </template>

      <div class="px-3 pt-2 pb-3">
        <Checkbox
          v-model="allMembersIncluded"
          :indeterminate="someMembersIncluded"
          class="mb-3 px-1"
          label-class="items-center"
        >
          <span class="text-sm font-medium text-neutral-800">{{ membersHint }}</span>
        </Checkbox>

        <div
          v-if="membersLoading"
          class="py-6 text-center text-sm text-neutral-500"
        >
          Carregando membros...
        </div>
        <div v-else class="max-h-44 overflow-y-auto thin-scrollbar space-y-0.5">
          <label
            v-for="member in members"
            :key="member.id"
            class="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            <Checkbox v-model="includedMemberIds" :value="member.id" />
            <MemberAvatar :name="member.name" :photo-url="member.photoUrl" size="sm" />
            <span class="min-w-0">
              <span class="block text-sm font-medium text-neutral-900 truncate">{{ member.name }}</span>
              <span
                v-if="memberRoleLabelById[member.id]"
                class="block text-xs text-neutral-500 truncate"
              >
                {{ memberRoleLabelById[member.id] }}
              </span>
            </span>
          </label>
          <p v-if="members.length === 0" class="px-2 py-3 text-sm text-neutral-500">
            Nenhum membro elegível para as funções selecionadas.
          </p>
        </div>
      </div>
    </AccordionPanel>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { MinusIcon, PlusIcon, UserGroupIcon } from '@heroicons/vue/24/outline'
import AccordionPanel from '@/components/AccordionPanel.vue'
import Checkbox from '@/components/Checkbox.vue'
import MemberAvatar from '@/components/MemberAvatar.vue'
import { getCategoryIcon, getCategoryStyle } from '@/utils/serviceRoleCategory'

export interface WorshipScheduleEligibleMember {
  id: number
  name: string
  photoUrl?: string | null
  roleNames: string[]
}

export interface WorshipScheduleRoleOption {
  value: number
  label: string
  category: string
}

const props = withDefaults(
  defineProps<{
    roleOptions: WorshipScheduleRoleOption[]
    members: WorshipScheduleEligibleMember[]
    membersLoading: boolean
    membersHint?: string
  }>(),
  {
    membersHint: 'Desmarque quem não deve entrar na escala.',
  },
)

const selectedRoleIds = defineModel<number[]>('selectedRoleIds', { required: true })
const includedMemberIds = defineModel<number[]>('includedMemberIds', { required: true })
const membersSectionOpen = defineModel<boolean>('membersSectionOpen', { required: true })
const rolesSectionOpen = defineModel<boolean>('rolesSectionOpen', { default: true })

const rolesBadge = computed(
  () => `${selectedRoleIds.value.length} de ${props.roleOptions.length}`,
)

const membersBadge = computed(
  () => `${includedMemberIds.value.length} de ${props.members.length}`,
)

const allMembersIncluded = computed({
  get: () =>
    props.members.length > 0 && includedMemberIds.value.length === props.members.length,
  set: (checked: boolean) => {
    includedMemberIds.value = checked ? props.members.map((member) => member.id) : []
  },
})

const someMembersIncluded = computed(
  () =>
    includedMemberIds.value.length > 0 &&
    includedMemberIds.value.length < props.members.length,
)

const memberRoleLabelById = computed(() => {
  const selectedIds = new Set(selectedRoleIds.value)

  return Object.fromEntries(
    props.members.map((member) => {
      const label = props.roleOptions
        .filter(
          (role) => selectedIds.has(role.value) && member.roleNames.includes(role.label),
        )
        .map((role) => role.label)
        .join(' / ')

      return [member.id, label]
    }),
  )
})
</script>
