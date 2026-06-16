import { reactive } from 'vue'

export type ConfirmVariant = 'danger' | 'primary'
export type ConfirmMode = 'confirm' | 'alert'

export interface ConfirmOptions {
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: ConfirmVariant
  mode?: ConfirmMode
  onConfirm?: () => Promise<void> | void
}

const state = reactive({
  open: false,
  title: 'Confirmar',
  message: '',
  confirmLabel: 'Confirmar',
  cancelLabel: 'Cancelar',
  variant: 'danger' as ConfirmVariant,
  mode: 'confirm' as ConfirmMode,
  loading: false,
  error: '',
  onConfirmHandler: null as (() => Promise<void> | void) | null,
})

let resolver: ((value: boolean) => void) | null = null

function getErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response
    if (response?.data?.message) return response.data.message
  }
  if (err instanceof Error && err.message) return err.message
  return 'Não foi possível concluir a ação.'
}

function close() {
  state.open = false
  state.loading = false
  state.error = ''
  state.onConfirmHandler = null
  resolver = null
}

function openConfirm(opts: ConfirmOptions) {
  const mode = opts.mode ?? 'confirm'
  const variant = opts.variant ?? (mode === 'alert' ? 'primary' : 'danger')

  state.mode = mode
  state.title =
    opts.title ?? (mode === 'alert' ? 'Aviso' : variant === 'danger' ? 'Confirmar exclusão' : 'Confirmar')
  state.message = opts.message
  state.confirmLabel =
    opts.confirmLabel ?? (mode === 'alert' ? 'OK' : variant === 'danger' ? 'Excluir' : 'Confirmar')
  state.cancelLabel = opts.cancelLabel ?? 'Cancelar'
  state.variant = variant
  state.loading = false
  state.error = ''
  state.onConfirmHandler = opts.onConfirm ?? null
  state.open = true
}

export function confirmAction(options: ConfirmOptions | string): Promise<boolean> {
  const opts: ConfirmOptions = typeof options === 'string' ? { message: options } : options
  openConfirm(opts)

  return new Promise((resolve) => {
    resolver = resolve
  })
}

export function confirmDelete(
  messageOrOptions: string | ConfirmOptions,
  title = 'Confirmar exclusão',
): Promise<boolean> {
  if (typeof messageOrOptions === 'string') {
    return confirmAction({
      title,
      message: messageOrOptions,
      variant: 'danger',
      confirmLabel: 'Excluir',
    })
  }

  return confirmAction({
    title,
    variant: 'danger',
    confirmLabel: 'Excluir',
    ...messageOrOptions,
  })
}

export function confirmRemove(
  messageOrOptions: string | ConfirmOptions,
  title = 'Confirmar remoção',
): Promise<boolean> {
  if (typeof messageOrOptions === 'string') {
    return confirmAction({
      title,
      message: messageOrOptions,
      variant: 'danger',
      confirmLabel: 'Remover',
    })
  }

  return confirmAction({
    title,
    variant: 'danger',
    confirmLabel: 'Remover',
    ...messageOrOptions,
  })
}

export function showAlert(options: ConfirmOptions | string): Promise<void> {
  const opts: ConfirmOptions =
    typeof options === 'string' ? { message: options, mode: 'alert' } : { mode: 'alert', ...options }

  return confirmAction(opts).then(() => undefined)
}

export function useConfirmModal() {
  async function onConfirm() {
    if (state.loading) return

    if (!state.onConfirmHandler) {
      resolver?.(true)
      close()
      return
    }

    state.loading = true
    state.error = ''

    try {
      await state.onConfirmHandler()
      resolver?.(true)
      close()
    } catch (err: unknown) {
      state.loading = false
      state.error = getErrorMessage(err)
    }
  }

  function onCancel() {
    if (state.loading) return
    resolver?.(false)
    close()
  }

  return {
    state,
    onConfirm,
    onCancel,
  }
}
