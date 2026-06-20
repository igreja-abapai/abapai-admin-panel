<template>
  <div ref="rootRef" class="relative global-search">
    <div class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
      <MagnifyingGlassIcon v-if="!loading" class="h-4 w-4 text-neutral-400" />
      <Spinner v-else size="sm" class="text-neutral-400" />
    </div>
    <input
      ref="inputRef"
      v-model="query"
      type="text"
      placeholder="Pesquisar"
      autocomplete="off"
      class="w-full pl-10 pr-3 py-2 bg-surface-page border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300 transition-colors"
      @focus="handleFocus"
      @keydown.escape.prevent="closeDropdown"
    />

    <Teleport to="body">
      <div
        v-if="isDropdownOpen"
        ref="dropdownRef"
        :style="dropdownStyle"
        class="fixed z-[100] overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg"
      >
        <div
          v-if="searchError"
          class="px-4 py-6 text-center text-sm text-red-600"
        >
          {{ searchError }}
        </div>

        <div
          v-else-if="sections.length === 0"
          class="px-4 py-6 text-center text-sm text-neutral-500"
        >
          Nenhum resultado encontrado.
        </div>

        <div v-else class="max-h-96 overflow-y-auto py-2">
          <section v-for="section in sections" :key="section.type" class="py-1">
            <p
              class="px-4 py-1.5 text-[13px] font-semibold tracking-wide text-neutral-400"
            >
              {{ section.label }}
            </p>

            <ul>
              <li v-for="item in section.items" :key="`${section.type}-${item.id}`">
                <button
                  type="button"
                  class="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-neutral-50 transition-colors"
                  @mousedown.prevent="selectItem(item)"
                >
                  <MemberAvatar
                    v-if="item.type === 'members'"
                    :name="item.title"
                    :photo-url="item.photoUrl"
                    size="sm"
                  />
                  <div
                    v-else
                    class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700"
                  >
                    <BuildingOffice2Icon class="h-4 w-4" />
                  </div>

                  <div class="min-w-0">
                    <p class="truncate text-sm font-medium text-neutral-900">{{ item.title }}</p>
                    <p v-if="item.subtitle" class="truncate text-xs text-neutral-500">
                      {{ item.subtitle }}
                    </p>
                  </div>
                </button>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { BuildingOffice2Icon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import MemberAvatar from '@/components/MemberAvatar.vue'
import Spinner from '@/components/Spinner.vue'
import {
  GLOBAL_SEARCH_MIN_QUERY_LENGTH,
  runGlobalSearch,
} from '@/services/globalSearch'
import { useDebouncedRef } from '@/composables/useDebouncedRef'
import { useAuthStore } from '@/stores/auth'
import type { GlobalSearchResultItem, GlobalSearchResultSection } from '@/types/globalSearch'

const router = useRouter()
const authStore = useAuthStore()

const rootRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)
const { value: query, debounced: debouncedQuery } = useDebouncedRef('')
const sections = ref<GlobalSearchResultSection[]>([])
const loading = ref(false)
const hasSearched = ref(false)
const searchError = ref('')
const dropdownOpen = ref(false)
const dropdownStyle = ref<{ top: string; left: string; width: string }>({
  top: '0px',
  left: '0px',
  width: '0px',
})

let searchRequestId = 0

const isDropdownOpen = computed(
  () =>
    dropdownOpen.value &&
    query.value.trim().length >= GLOBAL_SEARCH_MIN_QUERY_LENGTH &&
    !loading.value &&
    hasSearched.value,
)

function updateDropdownPosition() {
  if (!inputRef.value) return

  const rect = inputRef.value.getBoundingClientRect()
  dropdownStyle.value = {
    top: `${rect.bottom + 8}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
  }
}

async function runSearch(trimmed: string) {
  const requestId = ++searchRequestId
  loading.value = true
  hasSearched.value = false
  searchError.value = ''

  try {
    const results = await runGlobalSearch(trimmed, (permission) =>
      authStore.hasPermission(permission),
    )

    if (requestId !== searchRequestId) return

    sections.value = results
    hasSearched.value = true
  } catch (error: any) {
    if (requestId !== searchRequestId) return

    sections.value = []
    hasSearched.value = true
    searchError.value = error?.response?.data?.message || 'Erro ao buscar. Tente novamente.'
  } finally {
    if (requestId === searchRequestId) {
      loading.value = false
      dropdownOpen.value = true
      await nextTick()
      updateDropdownPosition()
    }
  }
}

watch(query, (value) => {
  const trimmed = value.trim()
  if (trimmed.length < GLOBAL_SEARCH_MIN_QUERY_LENGTH) {
    sections.value = []
    loading.value = false
    hasSearched.value = false
    searchError.value = ''
    dropdownOpen.value = false
    return
  }

  loading.value = false
  hasSearched.value = false
  searchError.value = ''
  dropdownOpen.value = false
})

watch(debouncedQuery, (value) => {
  const trimmed = value.trim()
  if (trimmed.length < GLOBAL_SEARCH_MIN_QUERY_LENGTH) return
  runSearch(trimmed)
})

watch(isDropdownOpen, async (open) => {
  if (open) {
    await nextTick()
    updateDropdownPosition()
  }
})

function handleFocus() {
  if (
    query.value.trim().length >= GLOBAL_SEARCH_MIN_QUERY_LENGTH &&
    hasSearched.value &&
    !loading.value
  ) {
    dropdownOpen.value = true
    updateDropdownPosition()
  }
}

function closeDropdown() {
  dropdownOpen.value = false
  inputRef.value?.blur()
}

function selectItem(item: GlobalSearchResultItem) {
  closeDropdown()
  query.value = ''
  sections.value = []
  hasSearched.value = false
  searchError.value = ''
  router.push(item.to)
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (
    !target.closest('.global-search') &&
    !dropdownRef.value?.contains(target)
  ) {
    dropdownOpen.value = false
  }
}

function handleReposition() {
  if (isDropdownOpen.value) {
    updateDropdownPosition()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', handleReposition)
  window.addEventListener('scroll', handleReposition, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', handleReposition)
  window.removeEventListener('scroll', handleReposition, true)
})
</script>
