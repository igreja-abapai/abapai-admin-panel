import { useRouter } from 'vue-router'

export function useGoBack(fallbackRoute: string) {
  const router = useRouter()

  function goBack() {
    if (window.history.state?.back) {
      router.back()
      return
    }

    router.push(fallbackRoute)
  }

  return { goBack }
}
