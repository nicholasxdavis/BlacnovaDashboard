import { onBeforeUnmount, onMounted, type Ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { ElMessageBox } from 'element-plus'

/** Warn before leaving when a form has unsaved changes. */
export function useUnsavedGuard(dirty: Ref<boolean>, message?: string) {
  const text =
    message ||
    'You have unsaved changes. Leave this page and discard them?'

  function onBeforeUnload(event: BeforeUnloadEvent) {
    if (!dirty.value) return
    event.preventDefault()
    event.returnValue = ''
  }

  onMounted(() => {
    window.addEventListener('beforeunload', onBeforeUnload)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', onBeforeUnload)
  })

  onBeforeRouteLeave(async () => {
    if (!dirty.value) return true
    try {
      await ElMessageBox.confirm(text, 'Unsaved changes', {
        confirmButtonText: 'Leave',
        cancelButtonText: 'Stay',
        type: 'warning',
        appendTo: document.body,
        closeOnClickModal: false,
      })
      return true
    } catch {
      return false
    }
  })
}
