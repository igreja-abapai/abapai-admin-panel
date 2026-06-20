<template>
  <div class="w-full">
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div>
        <h1 class="text-neutral-900 font-semibold text-[28px] leading-tight">Grupos de Serviço</h1>
        <p class="text-sm text-neutral-500 mt-1">
          Cadastre grupos (ex.: casais) para escalas conjuntas.
        </p>
      </div>
      <button
        v-if="canManage"
        type="button"
        class="btn btn-primary w-full sm:w-auto"
        @click="openGroupModal()"
      >
        <PlusIcon class="w-4 h-4 mr-2" />
        Novo grupo
      </button>
    </div>

    <div v-if="loading" class="flex justify-center py-24">
      <LoadingSpinner :size="32" />
    </div>

    <div
      v-else-if="groups.length === 0"
      class="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-16 text-center"
    >
      <UserGroupIcon class="w-10 h-10 text-neutral-300 mx-auto mb-3" />
      <p class="text-neutral-600 font-medium">Nenhum grupo cadastrado</p>
      <p class="text-sm text-neutral-500 mt-1">Crie um grupo para escalar membros sempre juntos.</p>
      <button
        v-if="canManage"
        type="button"
        class="btn btn-primary mt-6"
        @click="openGroupModal()"
      >
        <PlusIcon class="w-4 h-4 mr-2" />
        Novo grupo
      </button>
    </div>

    <div v-else class="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-6">
      <div class="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <p class="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-400 mb-3 px-1">
          {{ groups.length }} {{ groups.length === 1 ? 'grupo' : 'grupos' }}
        </p>
        <div class="space-y-1.5">
          <button
            v-for="group in groups"
            :key="group.id"
            type="button"
            :class="[
              'w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-all',
              selectedGroup?.id === group.id
                ? 'border-primary-300 bg-primary-50/50 shadow-sm'
                : 'border-transparent hover:border-neutral-200 hover:bg-surface-page',
            ]"
            @click="selectGroup(group)"
          >
            <div class="flex shrink-0 -space-x-2">
              <template v-for="(member, index) in getGroupMembers(group).slice(0, 2)" :key="member.id">
                <MemberAvatar
                  :name="member.name"
                  :photo-url="member.photoUrl"
                  size="2xs"
                  wrapper-class="ring-2 ring-white"
                  :wrapper-style="{ zIndex: 2 - index }"
                />
              </template>
              <div
                v-for="index in Math.max(0, 2 - getGroupMembers(group).length)"
                :key="`placeholder-${group.id}-${index}`"
                class="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-semibold ring-2 ring-white bg-neutral-100 text-neutral-400"
              >
                ?
              </div>
            </div>

            <div class="min-w-0 flex-1">
              <p class="text-sm font-semibold text-neutral-900 truncate leading-snug">{{ group.name }}</p>
              <div class="flex items-center gap-2 mt-1 flex-wrap">
                <span
                  v-if="group.serviceRole"
                  :class="[
                    'inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold',
                    getCategoryBadgeStyle(group.serviceRole.category),
                  ]"
                >
                  {{ group.serviceRole.name }}
                </span>
                <span class="text-xs text-neutral-500">
                  • {{ getMemberCount(group) }}
                  {{ getMemberCount(group) === 1 ? 'membro' : 'membros' }}
                </span>
              </div>
            </div>

            <ChevronRightIcon
              v-if="selectedGroup?.id === group.id"
              class="w-4 h-4 shrink-0 text-primary-500"
            />
          </button>
        </div>
      </div>

      <div>
        <div v-if="selectedGroup" class="rounded-2xl border border-neutral-200 bg-white overflow-hidden">
          <div class="px-6 py-5 border-b border-neutral-100">
            <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div class="flex items-start gap-4 min-w-0">
                <div class="flex shrink-0 -space-x-3">
                  <template
                    v-for="(member, index) in getGroupMembers(selectedGroup).slice(0, 2)"
                    :key="member.id"
                  >
                    <MemberAvatar
                      :name="member.name"
                      :photo-url="member.photoUrl"
                      size="lg"
                      wrapper-class="ring-2 ring-white"
                      :wrapper-style="{ zIndex: 2 - index }"
                    />
                  </template>
                </div>

                <div class="min-w-0">
                  <h2 class="text-xl font-semibold text-neutral-900 truncate">
                    {{ selectedGroup.name }}
                  </h2>
                  <div class="flex items-center gap-2 mt-2 flex-wrap">
                    <span
                      v-if="selectedGroup.serviceRole"
                      :class="[
                        'inline-flex px-2.5 py-1 rounded-full text-xs font-semibold',
                        getCategoryBadgeStyle(selectedGroup.serviceRole.category),
                      ]"
                    >
                      {{ selectedGroup.serviceRole.name }}
                    </span>
                    <span
                      v-if="!selectedGroup.isActive"
                      class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-600"
                    >
                      Inativo
                    </span>
                  </div>
                </div>
              </div>

              <div v-if="canManage" class="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  class="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                  aria-label="Editar grupo"
                  @click="openGroupModal(selectedGroup)"
                >
                  <PencilIcon class="w-4 h-4" />
                </button>
                <button
                  type="button"
                  class="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="Excluir grupo"
                  @click="handleDeleteGroup(selectedGroup)"
                >
                  <TrashIcon class="w-4 h-4" />
                </button>
                <button type="button" class="btn btn-primary" @click="openMemberModal()">
                  <PlusIcon class="w-4 h-4 mr-2" />
                  Adicionar membro
                </button>
              </div>
            </div>
          </div>

          <div class="px-6 py-5">
            <div class="flex items-center justify-between gap-4 mb-4">
              <h3 class="text-sm font-semibold text-neutral-900">Membros deste grupo</h3>
              <span class="inline-flex items-center gap-1.5 text-xs text-neutral-500">
                <UserGroupIcon class="w-4 h-4" />
                {{ getMemberCount(selectedGroup) }}
                {{ getMemberCount(selectedGroup) === 1 ? 'membro' : 'membros' }}
              </span>
            </div>

            <div
              v-if="!selectedGroup.members?.length"
              class="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-10 text-center text-sm text-neutral-500"
            >
              Nenhum membro neste grupo.
            </div>

            <div v-else class="space-y-2">
              <div
                v-for="memberLink in selectedGroup.members"
                :key="memberLink.id"
                class="flex items-center justify-between gap-4 rounded-xl border border-neutral-100 bg-neutral-50/40 px-4 py-3.5"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <MemberAvatar
                    :name="memberLink.member?.name || 'Membro'"
                    :photo-url="memberLink.member?.photoUrl"
                    size="md"
                  />

                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-neutral-900 truncate">
                      {{ memberLink.member?.name || 'Membro' }}
                    </p>
                    <div class="flex items-center gap-1.5 mt-1">
                      <span
                        :class="[
                          'inline-block w-1.5 h-1.5 rounded-full',
                          memberLink.member?.isActive !== false
                            ? 'bg-emerald-500'
                            : 'bg-neutral-300',
                        ]"
                      />
                      <span class="text-xs text-neutral-500">
                        {{ memberLink.member?.isActive !== false ? 'Ativo' : 'Inativo' }}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  v-if="canManage"
                  type="button"
                  class="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                  aria-label="Remover membro"
                  @click="handleRemoveMember(memberLink.id)"
                >
                  <TrashIcon class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Group modal -->
    <BaseModal
      v-model="showGroupModal"
      :title="editingGroup ? 'Editar Grupo' : 'Novo Grupo'"
      form
      :error="formError"
      @submit="saveGroup"
    >
      <div>
        <label class="block text-sm font-medium text-neutral-700 mb-1">Nome</label>
        <Input v-model="groupForm.name" required placeholder="Ex.: Casal João e Maria" />
      </div>
      <div>
        <label class="block text-sm font-medium text-neutral-700 mb-1">Função de serviço</label>
        <Select
          v-model="groupForm.serviceRoleId"
          :options="serviceRoleOptions"
          placeholder="Selecione"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-neutral-700 mb-1">Membros</label>
        <MultiSelect
          v-model="groupForm.memberIds"
          :options="memberOptions"
          placeholder="Selecione os membros do grupo"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-neutral-700 mb-1">Observações</label>
        <Input v-model="groupForm.notes" />
      </div>
      <Checkbox v-model="groupForm.isActive">Ativo</Checkbox>

      <template #footer-actions>
        <button type="button" class="btn btn-secondary" @click="showGroupModal = false">
          Cancelar
        </button>
        <ModalSubmitButton :loading="saving">Salvar</ModalSubmitButton>
      </template>
    </BaseModal>

    <!-- Member modal -->
    <BaseModal
      v-model="showMemberModal"
      title="Adicionar Membro ao Grupo"
      form
      :error="formError"
      @submit="saveMember"
    >
      <div>
        <label class="block text-sm font-medium text-neutral-700 mb-1">Membro</label>
        <Select
          v-model="memberForm.memberId"
          :options="availableMemberOptions"
          placeholder="Selecione"
        />
      </div>

      <template #footer-actions>
        <button type="button" class="btn btn-secondary" @click="showMemberModal = false">
          Cancelar
        </button>
        <ModalSubmitButton :loading="saving">Salvar</ModalSubmitButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChevronRightIcon,
  UserGroupIcon,
} from '@heroicons/vue/24/outline'
import Input from '@/components/Input.vue'
import Select from '@/components/Select.vue'
import MultiSelect from '@/components/MultiSelect.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import BaseModal from '@/components/BaseModal.vue'
import Checkbox from '@/components/Checkbox.vue'
import ModalSubmitButton from '@/components/ModalSubmitButton.vue'
import MemberAvatar from '@/components/MemberAvatar.vue'
import { organizationService, type ServingGroup, type ServiceRole } from '@/services/organization'
import { membersService, type Member } from '@/services/members'
import { ServiceRoleCategory } from '@/constants/organization'
import { useAuthStore } from '@/stores/auth'
import { confirmDelete, confirmRemove } from '@/composables/useConfirm'

const authStore = useAuthStore()
const canManage = computed(() => authStore.hasPermission('gerenciar_escalas'))

const loading = ref(false)
const saving = ref(false)
const formError = ref('')

const groups = ref<ServingGroup[]>([])
const members = ref<Member[]>([])
const serviceRoles = ref<ServiceRole[]>([])
const selectedGroup = ref<ServingGroup | null>(null)

const showGroupModal = ref(false)
const showMemberModal = ref(false)
const editingGroup = ref<ServingGroup | null>(null)

const groupForm = ref({
  name: '',
  serviceRoleId: '',
  memberIds: [] as string[],
  notes: '',
  isActive: true,
})
const memberForm = ref({ memberId: '' })

const serviceRoleOptions = computed(() =>
  serviceRoles.value
    .filter((role) => role.isActive)
    .map((role) => ({ value: String(role.id), label: role.name })),
)

const memberOptions = computed(() =>
  members.value.map((m) => ({ value: String(m.id), label: m.name })),
)

const availableMemberOptions = computed(() => {
  const existingIds = new Set(
    selectedGroup.value?.members?.map((link) => String(link.memberId)) || [],
  )
  return memberOptions.value.filter((option) => !existingIds.has(option.value))
})

function getGroupMembers(group: ServingGroup): Member[] {
  return (group.members || [])
    .map((link) => link.member)
    .filter((member): member is Member => Boolean(member))
}

function getMemberCount(group: ServingGroup): number {
  return group.members?.length || 0
}

function getCategoryBadgeStyle(category?: string): string {
  const styles: Record<string, string> = {
    [ServiceRoleCategory.DIRECTION_AND_WORD]: 'bg-blue-50 text-blue-700',
    [ServiceRoleCategory.WORSHIP]: 'bg-violet-50 text-violet-700',
    [ServiceRoleCategory.MEDIA_AND_SOUND]: 'bg-teal-50 text-teal-700',
    [ServiceRoleCategory.RECEPTION]: 'bg-emerald-50 text-emerald-700',
    [ServiceRoleCategory.SUPPORT_AND_CARE]: 'bg-rose-50 text-rose-700',
  }

  return styles[category || ''] || 'bg-neutral-100 text-neutral-600'
}

async function loadData() {
  loading.value = true
  try {
    const [groupsRes, membersRes, rolesRes] = await Promise.all([
      organizationService.getServingGroups(),
      membersService.getMembers({ isPaginated: false, isActive: true }),
      organizationService.getServiceRoles(),
    ])
    groups.value = groupsRes
    members.value = membersRes.data
    serviceRoles.value = rolesRes
    if (selectedGroup.value) {
      selectedGroup.value =
        groups.value.find((g) => g.id === selectedGroup.value?.id) || groups.value[0] || null
    } else if (groups.value.length > 0) {
      selectedGroup.value = groups.value[0]
    }
  } finally {
    loading.value = false
  }
}

function selectGroup(group: ServingGroup) {
  selectedGroup.value = group
}

function openGroupModal(group?: ServingGroup) {
  editingGroup.value = group || null
  groupForm.value = {
    name: group?.name || '',
    serviceRoleId: group?.serviceRoleId ? String(group.serviceRoleId) : '',
    memberIds: group?.members?.map((link) => String(link.memberId)) || [],
    notes: group?.notes || '',
    isActive: group?.isActive ?? true,
  }
  formError.value = ''
  showGroupModal.value = true
}

async function saveGroup() {
  saving.value = true
  formError.value = ''
  try {
    if (!groupForm.value.serviceRoleId) {
      formError.value = 'Selecione a função de serviço'
      return
    }

    if (groupForm.value.memberIds.length === 0) {
      formError.value = 'Selecione pelo menos um membro'
      return
    }

    const payload = {
      name: groupForm.value.name,
      serviceRoleId: Number(groupForm.value.serviceRoleId),
      memberIds: groupForm.value.memberIds.map((id) => Number(id)),
      notes: groupForm.value.notes || undefined,
      isActive: groupForm.value.isActive,
    }
    if (editingGroup.value) {
      await organizationService.updateServingGroup(editingGroup.value.id, payload)
    } else {
      await organizationService.createServingGroup(payload)
    }
    showGroupModal.value = false
    await loadData()
  } catch (err: any) {
    formError.value = err.response?.data?.message || 'Erro ao salvar grupo'
  } finally {
    saving.value = false
  }
}

async function handleDeleteGroup(group: ServingGroup) {
  await confirmDelete({
    message: `Tem certeza que deseja excluir "${group.name}"?`,
    onConfirm: async () => {
      await organizationService.deleteServingGroup(group.id)
      if (selectedGroup.value?.id === group.id) selectedGroup.value = null
      await loadData()
    },
  })
}

function openMemberModal() {
  memberForm.value = { memberId: '' }
  formError.value = ''
  showMemberModal.value = true
}

async function saveMember() {
  if (!selectedGroup.value) return
  saving.value = true
  formError.value = ''
  try {
    await organizationService.createServingGroupMember({
      servingGroupId: selectedGroup.value.id,
      memberId: Number(memberForm.value.memberId),
    })
    showMemberModal.value = false
    await loadData()
  } catch (err: any) {
    formError.value = err.response?.data?.message || 'Erro ao adicionar membro'
  } finally {
    saving.value = false
  }
}

async function handleRemoveMember(memberLinkId: number) {
  await confirmRemove({
    message: 'Remover membro do grupo?',
    onConfirm: async () => {
      await organizationService.deleteServingGroupMember(memberLinkId)
      await loadData()
    },
  })
}

onMounted(loadData)
</script>
