import { onScopeDispose, watch, type Ref, type WatchSource } from 'vue'

const locks = new Set<string>()
let savedScrollY = 0
let stylesApplied = false

function applyStyles() {
  if (typeof document === 'undefined' || stylesApplied) return
  savedScrollY = window.scrollY || window.pageYOffset || 0
  const body = document.body
  const html = document.documentElement
  body.style.position = 'fixed'
  body.style.top = `-${savedScrollY}px`
  body.style.left = '0'
  body.style.right = '0'
  body.style.width = '100%'
  body.style.overflow = 'hidden'
  html.style.overflow = 'hidden'
  stylesApplied = true
}

function clearStyles() {
  if (typeof document === 'undefined' || !stylesApplied) return
  const body = document.body
  const html = document.documentElement
  body.style.position = ''
  body.style.top = ''
  body.style.left = ''
  body.style.right = ''
  body.style.width = ''
  body.style.overflow = ''
  html.style.overflow = ''
  stylesApplied = false
  window.scrollTo(0, savedScrollY)
}

export function lockBody(id: string) {
  const wasEmpty = locks.size === 0
  locks.add(id)
  if (wasEmpty) applyStyles()
}

export function unlockBody(id: string) {
  locks.delete(id)
  if (locks.size === 0) clearStyles()
}

/** Force-clear all scroll locks (recovery if counts ever drift). */
export function resetBodyScrollLocks() {
  locks.clear()
  clearStyles()
}

/** Lock page scroll while a mobile drawer, dialog, or overlay is open. */
export function useBodyScrollLock(
  source: WatchSource<boolean> | Ref<boolean>,
  id = 'default',
) {
  watch(
    source,
    (locked) => {
      if (locked) lockBody(id)
      else unlockBody(id)
    },
    { immediate: true },
  )

  onScopeDispose(() => {
    unlockBody(id)
  })
}

/** Watch Element Plus popup parent class for dialogs/drawers/message-boxes. */
export function useElementPlusScrollLock() {
  if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return

  const id = 'element-plus'
  let observing = true

  const sync = () => {
    if (!observing) return
    if (document.body.classList.contains('el-popup-parent--hidden')) {
      lockBody(id)
    } else {
      unlockBody(id)
    }
  }

  const observer = new MutationObserver(sync)
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] })
  sync()

  onScopeDispose(() => {
    observing = false
    observer.disconnect()
    unlockBody(id)
  })
}
