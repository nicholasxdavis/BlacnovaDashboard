import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import '@/styles/index.scss'

const BOOT_MS = 2500
const bootStarted = performance.now()

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(ElementPlus)

async function start() {
  const elapsed = performance.now() - bootStarted
  const wait = Math.max(0, BOOT_MS - elapsed)
  if (wait > 0) {
    await new Promise((resolve) => setTimeout(resolve, wait))
  }
  app.mount('#app')
}

void start()
