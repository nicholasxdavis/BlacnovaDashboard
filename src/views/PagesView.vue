<template>
  <div class="page">
    <PageHeader
      title="Pages"
      description="Review website pages and publishing status."
    />

    <div class="table-toolbar">
      <div class="table-toolbar__left">
        <el-input
          v-model="search"
          class="grow-input"
          clearable
          placeholder="Search pages"
        />
        <el-select v-model="statusFilter" clearable placeholder="All statuses" style="width: 160px">
          <el-option label="Published" value="published" />
          <el-option label="Draft" value="draft" />
          <el-option label="Unpublished" value="unpublished" />
        </el-select>
      </div>
    </div>

    <div class="surface">
      <div class="table-scroll">
        <el-table :data="filtered" empty-text="No pages match your filters" style="min-width: 640px">
          <el-table-column prop="title" label="Page" min-width="180">
            <template #default="{ row }">
              <div class="page-title">{{ row.title }}</div>
              <div class="page-slug">{{ row.slug }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="Status" width="140">
            <template #default="{ row }">
              <PageStatus :status="row.status" />
            </template>
          </el-table-column>
          <el-table-column prop="updatedAt" label="Updated" width="130" />
          <el-table-column label="" width="220" align="right">
            <template #default="{ row }">
              <el-button size="small" text @click="goContent(row.title)">Edit content</el-button>
              <el-dropdown trigger="click" @command="(cmd: string) => onStatus(row.id, cmd)">
                <el-button size="small">Status</el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="published">Publish</el-dropdown-item>
                    <el-dropdown-item command="draft">Set as draft</el-dropdown-item>
                    <el-dropdown-item command="unpublished">Unpublish</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import PageHeader from '@/components/PageHeader.vue'
import PageStatus from '@/components/PageStatus.vue'
import { useWebsiteStore } from '@/stores/website'
import type { WebsitePage } from '@/types'

const router = useRouter()
const websiteStore = useWebsiteStore()
const search = ref('')
const statusFilter = ref<WebsitePage['status'] | undefined>()

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return websiteStore.pages.filter((page) => {
    if (statusFilter.value && page.status !== statusFilter.value) return false
    if (!q) return true
    return page.title.toLowerCase().includes(q) || page.slug.toLowerCase().includes(q)
  })
})

function goContent(pageTitle: string) {
  router.push({ path: '/content', query: { page: pageTitle } })
}

function onStatus(id: string, status: string) {
  websiteStore.setPageStatus(id, status as WebsitePage['status'])
  ElMessage.success('Page status updated')
}
</script>

<style scoped lang="scss">
.page-title {
  font-weight: 600;
  color: $bn-black;
}

.page-slug {
  font-size: 12px;
  color: $bn-gray-500;
}
</style>
