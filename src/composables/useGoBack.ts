import { useRouter } from 'vue-router'

const FORM_ROUTE_PATTERN = /\/(editar|cadastro)(\/|$|\?)/

function isFormRoute(path: string): boolean {
  return FORM_ROUTE_PATTERN.test(path)
}

export function useGoBack(fallbackRoute: string) {
  const router = useRouter()

  function goBack() {
    const backPath = window.history.state?.back

    if (typeof backPath === 'string' && backPath.length > 0 && !isFormRoute(backPath)) {
      router.back()
      return
    }

    router.push(fallbackRoute)
  }

  return { goBack }
}
