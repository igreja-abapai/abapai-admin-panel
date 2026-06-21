export const DEFAULT_ROW_MENU_WIDTH = 160
export const DEFAULT_ROW_MENU_ITEM_HEIGHT = 44
export const ROW_MENU_VIEWPORT_PADDING = 8
export const ROW_MENU_OFFSET = 4

export interface RowMenuPosition {
  top: string
  left: string
}

export function calculateRowMenuPosition(
  button: HTMLElement,
  menuWidth: number,
  menuHeight: number,
): RowMenuPosition {
  const rect = button.getBoundingClientRect()
  let top = rect.bottom + ROW_MENU_OFFSET
  let left = rect.right - menuWidth

  if (top + menuHeight > window.innerHeight - ROW_MENU_VIEWPORT_PADDING) {
    top = rect.top - menuHeight - ROW_MENU_OFFSET
  }

  if (left < ROW_MENU_VIEWPORT_PADDING) {
    left = ROW_MENU_VIEWPORT_PADDING
  }

  return {
    top: `${top}px`,
    left: `${left}px`,
  }
}

let activeMenuClose: (() => void) | null = null
let documentListenerAttached = false

function ensureDocumentClickListener() {
  if (documentListenerAttached) return
  documentListenerAttached = true
  document.addEventListener('click', () => {
    closeActiveRowActionMenu()
  })
}

export function registerActiveRowActionMenu(close: () => void) {
  ensureDocumentClickListener()
  closeActiveRowActionMenu()
  activeMenuClose = close
}

export function unregisterActiveRowActionMenu(close: () => void) {
  if (activeMenuClose === close) {
    activeMenuClose = null
  }
}

export function closeActiveRowActionMenu() {
  activeMenuClose?.()
  activeMenuClose = null
}
