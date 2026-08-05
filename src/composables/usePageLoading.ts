import { onMounted, onUnmounted, ref } from 'vue'

/** Brief first-paint loading state for pages that would fetch remote data. */
export function usePageLoading(delayMs = 280) {
  const loading = ref(true)
  let timer = 0

  onMounted(() => {
    timer = window.setTimeout(() => {
      loading.value = false
    }, delayMs)
  })

  onUnmounted(() => {
    window.clearTimeout(timer)
  })

  return { loading }
}
