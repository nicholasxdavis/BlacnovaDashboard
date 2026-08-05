<template>
  <div class="page">
    <PageHeader
      title="Content"
      description="Edit website text by page and section. Changes stay unpublished until you save them."
    >
      <template #actions>
        <span v-if="dirty" class="unsaved-pill">
          <PhCircle :size="8" weight="fill" />
          Unsaved changes
        </span>
        <el-button :disabled="!dirty" @click="discard">Cancel</el-button>
        <el-button type="primary" :disabled="!dirty" :loading="saving" @click="save">
          Save changes
        </el-button>
        <el-button :loading="publishing" @click="publish">
          Publish to site
        </el-button>
      </template>
    </PageHeader>

    <div class="table-toolbar">
      <div class="table-toolbar__left">
        <el-select v-model="pageFilter" placeholder="All pages" style="width: 180px" clearable>
          <el-option
            v-for="page in pageOptions"
            :key="page"
            :label="page"
            :value="page"
          />
        </el-select>
        <el-input
          v-model="search"
          class="grow-input"
          clearable
          placeholder="Search content"
        />
      </div>
    </div>

    <div v-if="grouped.length" class="content-groups">
      <div v-for="group in grouped" :key="group.key" class="surface content-group">
        <div class="content-group__head">
          <div>
            <div class="content-group__page">{{ group.pageName }}</div>
            <div class="content-group__section">{{ group.section }}</div>
          </div>
        </div>
        <div class="content-group__body field-group">
          <div v-for="block in group.blocks" :key="block.id" class="field">
            <div class="field-top">
              <label class="field-label" :for="block.id">{{ block.label }}</label>
              <span
                class="pub-pill"
                :class="draft[block.id]?.published ? 'pub-pill--on' : 'pub-pill--off'"
              >
                {{ draft[block.id]?.published ? 'Published' : 'Unpublished' }}
              </span>
            </div>
            <el-input
              v-if="block.type !== 'textarea'"
              :id="block.id"
              v-model="draft[block.id].value"
              :maxlength="block.type === 'heading' ? 120 : 200"
              show-word-limit
            />
            <el-input
              v-else
              :id="block.id"
              v-model="draft[block.id].value"
              type="textarea"
              :rows="3"
              maxlength="500"
              show-word-limit
            />
            <div class="field-actions">
              <el-switch
                v-model="draft[block.id].published"
                inline-prompt
                active-text="Pub"
                inactive-text="Off"
              />
              <span class="form-hint">
                {{ draft[block.id].published ? 'Visible on the live site after save' : 'Hidden from the live site' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="surface">
      <EmptyState title="No content found" description="Try a different page or search term." />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { PhCircle } from '@phosphor-icons/vue'
import { ElMessage } from 'element-plus'
import PageHeader from '@/components/PageHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
import { useWebsiteStore } from '@/stores/website'
import { useUnsavedGuard } from '@/composables/useUnsavedGuard'

const route = useRoute()
const websiteStore = useWebsiteStore()
const search = ref('')
const pageFilter = ref<string | undefined>(
  typeof route.query.page === 'string' ? route.query.page : undefined,
)
const saving = ref(false)
const publishing = ref(false)

type DraftBlock = { value: string; published: boolean }
const draft = reactive<Record<string, DraftBlock>>({})

function hydrate() {
  Object.keys(draft).forEach((k) => delete draft[k])
  websiteStore.content.forEach((block) => {
    draft[block.id] = { value: block.value, published: block.published }
  })
}

hydrate()
watch(() => websiteStore.content, hydrate, { deep: true })

const pageOptions = computed(() =>
  [...new Set(websiteStore.content.map((c) => c.pageName))],
)

const dirty = computed(() =>
  websiteStore.content.some(
    (b) => draft[b.id]?.value !== b.value || draft[b.id]?.published !== b.published,
  ),
)

useUnsavedGuard(dirty)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return websiteStore.content.filter((b) => {
    if (pageFilter.value && b.pageName !== pageFilter.value) return false
    if (!q) return true
    return (
      b.label.toLowerCase().includes(q) ||
      b.section.toLowerCase().includes(q) ||
      b.value.toLowerCase().includes(q) ||
      b.pageName.toLowerCase().includes(q)
    )
  })
})

const grouped = computed(() => {
  const map = new Map<string, { key: string; pageName: string; section: string; blocks: typeof filtered.value }>()
  filtered.value.forEach((block) => {
    const key = `${block.pageId}:${block.section}`
    if (!map.has(key)) {
      map.set(key, { key, pageName: block.pageName, section: block.section, blocks: [] })
    }
    map.get(key)!.blocks.push(block)
  })
  return [...map.values()]
})

function discard() {
  hydrate()
  ElMessage.info('Changes discarded')
}

async function save() {
  saving.value = true
  try {
    for (const block of websiteStore.content) {
      const d = draft[block.id]
      if (!d) continue
      if (d.value !== block.value) {
        await websiteStore.updateContentBlock(block.id, d.value)
      }
      if (d.published !== block.published) {
        await websiteStore.setContentPublished(block.id, d.published)
      }
    }
    hydrate()
    ElMessage.success('Content saved')
  } catch {
    ElMessage.error('Could not save content')
  } finally {
    saving.value = false
  }
}

async function publish() {
  if (dirty.value) {
    ElMessage.warning('Save your changes before publishing')
    return
  }
  publishing.value = true
  try {
    const result = await websiteStore.publishSite()
    const changed = result.files.filter((f) => f.updated).length
    ElMessage.success(
      changed
        ? `Published ${result.blocks} blocks to GitHub (${changed} file${changed === 1 ? '' : 's'} updated)`
        : `Synced ${result.blocks} blocks — site files already up to date`,
    )
  } catch (err: unknown) {
    const message =
      (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
      'Publish failed'
    ElMessage.error(message)
  } finally {
    publishing.value = false
  }
}
</script>

<style scoped lang="scss">
.content-groups {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.content-group__head {
  padding: 14px 20px;
  border-bottom: $bn-border;
  background: $bn-gray-50;
}

.content-group__page {
  font-size: 14px;
  font-weight: 500;
  color: $bn-black;
}

.content-group__section {
  font-size: 12px;
  color: $bn-gray-500;
  margin-top: 2px;
}

.content-group__body {
  padding: 20px;
}

.field-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}

.field-top .field-label {
  margin-bottom: 0;
}

.field-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
}

.pub-pill {
  font-size: 12px;
  font-weight: 500;
  height: 22px;
  padding: 0 8px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  border: 1px solid $bn-gray-200;
}

.pub-pill--on {
  color: $bn-orange;
  background: $bn-orange-soft;
  border-color: $bn-orange-border;
}

.pub-pill--off {
  color: $bn-gray-500;
  background: $bn-white;
}
</style>
