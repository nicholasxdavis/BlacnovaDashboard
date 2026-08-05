import { onScopeDispose, watch, type Ref, type WatchSource } from 'vue'

let lockCount = 0
let savedScrollY = 0

function applyLock() {
  if (typeof document === 'undefined') return
  if (lockCount === 0) {
    savedScrollY = window.scrollY || window.pageYOffset || 0
    const body = document.body
    body.style.position = 'fixed'
    body.style.top = `-${savedScrollY}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.width = '100%'
    body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
  }
  lockCount += 1
}

function releaseLock() {
  if (typeof document === 'undefined') return
  lockCount = Math.max(0, lockCount - 1)
  if (lockCount > 0) return
  const body = document.body
  body.style.position = ''
  body.style.top = ''
  body.style.left = ''
  body.style.right = ''
  body.style.width = ''
  body.style.overflow = ''
  document.documentElement.style.overflow = ''
  window.scrollTo(0, savedScrollY)
}

/** Lock page scroll while a mobile drawer, dialog, or overlay is open. */
export function useBodyScrollLock(source: WatchSource<boolean> | Ref<boolean>) {
  watch(
    source,
    (locked) => {
      if (locked) applyLock()
      else releaseLock()
    },
    { immediate: true },
  )

  onScopeDispose(() => {
    // Ensure we don't leave the page locked if the consumer unmounts while locked
    const current = typeof source === 'function' ? source() : source.value
    if (current) releaseLock()
  })
}

/** Watch Element Plus popup parent class for dialogs/drawers/message-boxes. */
export function useElementPlusScrollLock() {
  if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return

  let observing = true
  let wasLocked = false

  const sync = () => {
    if (!observing) return
    const locked = document.body.classList.contains('el-popup-parent--hidden')
    if (locked && !wasLocked) {
      applyLock()
      wasLocked = true
    } else if (!locked && wasLocked) {
      releaseLock()
      wasLocked = false
    }
  }

  const observer = new MutationObserver(sync)
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] })
  sync()

  onScopeDispose(() => {
    observing = false
    observer.disconnect()
    if (wasLocked) releaseLock()
  })
}
