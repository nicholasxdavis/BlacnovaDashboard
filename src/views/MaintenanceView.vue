<template>
  <div class="page">
    <PageHeader
      title="Maintenance"
      description="Control what visitors see when your website is temporarily unavailable."
    >
      <template #actions>
        <span v-if="dirty" class="unsaved-pill">
          <PhCircle :size="8" weight="fill" />
          Unsaved changes
        </span>
        <el-button :disabled="!dirty" @click="discard">Cancel</el-button>
        <el-button type="primary" :disabled="!dirty" :loading="saving" @click="save">
          Save
        </el-button>
      </template>
    </PageHeader>

    <div class="split-layout">
      <div class="surface surface-pad">
        <div class="toggle-row">
          <div>
            <div class="section__title" style="margin-bottom: 4px">Maintenance mode</div>
            <p class="section__desc" style="margin: 0">
              When enabled, visitors see the message below instead of your live website.
            </p>
          </div>
          <el-switch v-model="draft.enabled" size="large" @change="onToggleAttempt" />
        </div>

        <div class="status-line">
          <span
            class="status-dot"
            :class="draft.enabled ? 'status-dot--warn' : 'status-dot--ok'"
          >
            Currently {{ draft.enabled ? 'active' : 'inactive' }}
          </span>
        </div>

        <div class="field-group" style="margin-top: 20px">
          <div>
            <label class="field-label" for="maint-title">Title</label>
            <el-input id="maint-title" v-model="draft.title" maxlength="80" show-word-limit />
          </div>
          <div>
            <label class="field-label" for="maint-message">Message</label>
            <el-input
              id="maint-message"
              v-model="draft.message"
              type="textarea"
              :rows="5"
              maxlength="400"
              show-word-limit
            />
          </div>
          <div>
            <label class="field-label" for="maint-return">Expected return (optional)</label>
            <el-date-picker
              id="maint-return"
              v-model="draft.expectedReturn"
              type="datetime"
              placeholder="Select date and time"
              style="width: 100%"
              value-format="YYYY-MM-DD HH:mm"
            />
            <p class="form-hint">Shown to visitors when provided. Leave blank if unknown.</p>
          </div>
        </div>
      </div>

      <div class="surface surface-pad preview">
        <div class="section__title">Visitor preview</div>
        <p class="section__desc">Approximate view of the maintenance page</p>
        <div class="preview-frame">
          <div class="preview-card">
            <div class="preview-brand">{{ clientStore.client.name }}</div>
            <h2>{{ draft.title || 'Maintenance' }}</h2>
            <p>{{ draft.message || 'Please check back soon.' }}</p>
            <p v-if="draft.expectedReturn" class="preview-return">
              Expected return: {{ draft.expectedReturn }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { PhCircle } from '@phosphor-icons/vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageHeader from '@/components/PageHeader.vue'
import { useClientStore } from '@/stores/client'
import { useWebsiteStore } from '@/stores/website'
import { useUnsavedGuard } from '@/composables/useUnsavedGuard'
import type { MaintenanceConfig } from '@/types'

const clientStore = useClientStore()
const websiteStore = useWebsiteStore()
const saving = ref(false)
const draft = reactive<MaintenanceConfig>({ ...websiteStore.maintenance })
let previousEnabled = websiteStore.maintenance.enabled

function hydrate() {
  Object.assign(draft, websiteStore.maintenance)
  previousEnabled = websiteStore.maintenance.enabled
}

watch(() => websiteStore.maintenance, hydrate, { deep: true })

const dirty = computed(
  () =>
    draft.enabled !== websiteStore.maintenance.enabled ||
    draft.title !== websiteStore.maintenance.title ||
    draft.message !== websiteStore.maintenance.message ||
    draft.expectedReturn !== websiteStore.maintenance.expectedReturn,
)

useUnsavedGuard(dirty)

async function onToggleAttempt(value: string | number | boolean) {
  const enabled = Boolean(value)
  if (enabled === previousEnabled) return
  try {
    await ElMessageBox.confirm(
      enabled
        ? 'Turn on maintenance mode? Visitors will see the maintenance page until you turn it off.'
        : 'Turn off maintenance mode? Your live website will become available again after you save.',
      enabled ? 'Enable maintenance' : 'Disable maintenance',
      { confirmButtonText: 'Continue', cancelButtonText: 'Cancel' },
    )
    previousEnabled = enabled
  } catch {
    draft.enabled = previousEnabled
  }
}

function discard() {
  hydrate()
  ElMessage.info('Changes discarded')
}

async function save() {
  if (!draft.title.trim() || !draft.message.trim()) {
    ElMessage.error('Title and message are required')
    return
  }
  saving.value = true
  try {
    await websiteStore.updateMaintenance({ ...draft })
    previousEnabled = draft.enabled
    ElMessage.success(draft.enabled ? 'Maintenance mode saved and active' : 'Maintenance settings saved')
  } catch {
    ElMessage.error('Could not save maintenance settings')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped lang="scss">
.toggle-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.status-line {
  margin-top: 16px;
  padding-top: 16px;
  border-top: $bn-border;
}

.preview-frame {
  margin-top: 8px;
  min-height: 320px;
  background: $bn-gray-100;
  border-radius: $bn-radius;
  display: grid;
  place-items: center;
  padding: 24px;
}

.preview-card {
  background: $bn-white;
  border: $bn-border;
  border-radius: $bn-radius;
  padding: 28px 24px;
  max-width: 360px;
  text-align: center;
}

.preview-brand {
  font-size: 12px;
  color: $bn-gray-500;
  margin-bottom: 16px;
  letter-spacing: 0.02em;
}

.preview-card h2 {
  font-size: 20px;
  margin-bottom: 10px;
}

.preview-card p {
  font-size: 14px;
  color: $bn-gray-700;
  line-height: 1.55;
}

.preview-return {
  margin-top: 14px !important;
  font-size: 12px !important;
  color: $bn-gray-500 !important;
}
</style>
