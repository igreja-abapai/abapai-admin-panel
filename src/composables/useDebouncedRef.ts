import { onUnmounted, ref, watch, type Ref } from 'vue'

export const DEFAULT_SEARCH_DEBOUNCE_MS = 400

export function useDebouncedRef<T>(initialValue: T, delayMs = DEFAULT_SEARCH_DEBOUNCE_MS) {
  const value = ref(initialValue) as Ref<T>
  const debounced = ref(initialValue) as Ref<T>

  let timer: ReturnType<typeof setTimeout> | null = null

  watch(value, (next) => {
    if (timer) clearTimeout(timer)

    timer = setTimeout(() => {
      debounced.value = next
    }, delayMs)
  })

  function syncDebounced(next: T) {
    if (timer) clearTimeout(timer)
    value.value = next
    debounced.value = next
  }

  onUnmounted(() => {
    if (timer) clearTimeout(timer)
  })

  return { value, debounced, syncDebounced }
}
