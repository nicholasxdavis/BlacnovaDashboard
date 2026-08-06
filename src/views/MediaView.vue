<template>
  <div class="page">
    <PageHeader
      title="Media"
      description="Images used on your site, including client logos, project screenshots, and brand assets. Replace a file here to update the live website."
    >
      <template #actions>
        <el-button type="primary" @click="openUpload()">
          <PhUploadSimple :size="16" style="margin-right: 6px" />
          Upload
        </el-button>
      </template>
    </PageHeader>

    <div class="table-toolbar">
      <div class="table-toolbar__left">
        <el-input
          v-model="search"
          class="grow-input"
          clearable
          placeholder="Search media"
        />
        <el-select v-model="typeFilter" clearable placeholder="All types" style="width: 140px">
          <el-option label="Images" value="image" />
          <el-option label="Documents" value="document" />
          <el-option label="Video" value="video" />
        </el-select>
      </div>
      <div class="table-toolbar__right">
        <span class="count-label">{{ filtered.length }} file{{ filtered.length === 1 ? '' : 's' }}</span>
      </div>
    </div>

    <template v-if="loading">
      <div class="media-grid">
        <div v-for="n in 4" :key="n" class="surface media-skel">
          <SkeletonBlock variant="block" height="140px" />
          <div class="media-skel__body">
            <SkeletonBlock width="70%" />
            <SkeletonBlock width="40%" height="10px" />
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div v-if="filtered.length" class="media-grid">
        <div v-for="item in filtered" :key="item.id" class="media-card surface">
          <div class="media-card__preview">
            <img v-if="item.type === 'image' && item.url" :src="item.url" :alt="item.name" />
            <div v-else class="media-card__file">
              <PhFile :size="28" weight="light" />
            </div>
          </div>
          <div class="media-card__body">
            <div class="media-card__name" :title="item.name">{{ item.name }}</div>
            <div class="media-card__meta">{{ item.size }} · {{ item.updatedAt }}</div>
            <div class="media-card__used">Used on {{ item.usedOn }}</div>
            <div class="media-card__actions">
              <el-button size="small" @click="openUpload(item.id)">Replace</el-button>
              <el-button size="small" text type="danger" @click="confirmDelete(item.id, item.name)">
                Remove
              </el-button>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="surface">
        <EmptyState title="No media found" description="Upload images or files to get started.">
          <template #action>
            <el-button type="primary" @click="openUpload()">Upload media</el-button>
          </template>
        </EmptyState>
      </div>
    </template>

    <el-dialog
      v-model="dialogOpen"
      :title="replaceId ? 'Replace media' : 'Upload media'"
      width="440px"
      destroy-on-close
      @closed="resetDialog"
    >
      <div class="upload-field">
        <label class="field-label" for="media-name">File name</label>
        <el-input id="media-name" v-model="uploadName" placeholder="hero-image.jpg" />
      </div>
      <div class="upload-field">
        <label class="field-label" for="media-type">Type</label>
        <el-select id="media-type" v-model="uploadType" style="width: 100%">
          <el-option label="Image" value="image" />
          <el-option label="Document" value="document" />
          <el-option label="Video" value="video" />
        </el-select>
      </div>
      <div class="upload-field">
        <label class="field-label" for="media-used">Used on</label>
        <el-input id="media-used" v-model="uploadUsedOn" placeholder="Home · Hero" />
      </div>
      <div class="upload-drop" @click="pickFile">
        <PhUploadSimple :size="22" />
        <div class="upload-drop__title">{{ filePicked ? uploadName : 'Choose a file' }}</div>
        <div class="upload-drop__hint">Select an image or document from your device</div>
      </div>
      <input
        ref="fileInput"
        type="file"
        class="file-input"
        accept="image/*,video/*,.pdf,.doc,.docx"
        @change="onFilePicked"
      />
      <template #footer>
        <el-button @click="dialogOpen = false">Cancel</el-button>
        <el-button type="primary" :loading="uploading" :disabled="!canSubmit" @click="submitUpload">
          {{ replaceId ? 'Replace' : 'Upload' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { PhUploadSimple, PhFile } from '@phosphor-icons/vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageHeader from '@/components/PageHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
import SkeletonBlock from '@/components/SkeletonBlock.vue'
import { useWebsiteStore } from '@/stores/website'
import { usePageLoading } from '@/composables/usePageLoading'
import type { MediaItem } from '@/types'

const websiteStore = useWebsiteStore()
const { loading } = usePageLoading()
const search = ref('')
const typeFilter = ref<string | undefined>()
const dialogOpen = ref(false)
const replaceId = ref<string | null>(null)
const uploadName = ref('')
const uploadType = ref<MediaItem['type']>('image')
const uploadUsedOn = ref('Library')
const filePicked = ref(false)
const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return websiteStore.media.filter((item) => {
    if (typeFilter.value && item.type !== typeFilter.value) return false
    if (!q) return true
    return item.name.toLowerCase().includes(q) || item.usedOn.toLowerCase().includes(q)
  })
})

const canSubmit = computed(() => Boolean(uploadName.value.trim() && selectedFile.value))

function openUpload(id?: string) {
  replaceId.value = id || null
  if (id) {
    const item = websiteStore.media.find((m) => m.id === id)
    if (item) {
      uploadName.value = item.name
      uploadType.value = item.type
      uploadUsedOn.value = item.usedOn
    }
  }
  dialogOpen.value = true
}

function resetDialog() {
  replaceId.value = null
  uploadName.value = ''
  uploadType.value = 'image'
  uploadUsedOn.value = 'Library'
  filePicked.value = false
  selectedFile.value = null
  uploading.value = false
  if (fileInput.value) fileInput.value.value = ''
}

function pickFile() {
  fileInput.value?.click()
}

function onFilePicked(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  selectedFile.value = file
  filePicked.value = true
  if (!uploadName.value.trim()) uploadName.value = file.name
  if (file.type.startsWith('image/')) uploadType.value = 'image'
  else if (file.type.startsWith('video/')) uploadType.value = 'video'
  else uploadType.value = 'document'
}

async function submitUpload() {
  if (!canSubmit.value || !selectedFile.value) {
    ElMessage.error('Choose a file and enter a name')
    return
  }
  uploading.value = true
  try {
    const form = new FormData()
    form.append('file', selectedFile.value)
    form.append('name', uploadName.value.trim())
    form.append('type', uploadType.value)
    form.append('usedOn', uploadUsedOn.value.trim() || 'Library')

    if (replaceId.value) {
      await websiteStore.replaceMedia(replaceId.value, form)
      ElMessage.success('Media replaced')
    } else {
      await websiteStore.addMedia(form)
      ElMessage.success('Media uploaded')
    }
    dialogOpen.value = false
  } catch {
    ElMessage.error('Upload failed')
  } finally {
    uploading.value = false
  }
}

async function confirmDelete(id: string, name: string) {
  try {
    await ElMessageBox.confirm(
      `Remove “${name}” from the media library? This does not automatically remove it from published pages.`,
      'Remove media',
      { confirmButtonText: 'Remove', cancelButtonText: 'Cancel', type: 'warning', confirmButtonClass: 'el-button--danger' },
    )
    await websiteStore.removeMedia(id)
    ElMessage.success('Media removed')
  } catch {
    /* cancelled */
  }
}
</script>

<style scoped lang="scss">
.count-label {
  font-size: 13px;
  color: $bn-gray-500;
}

.file-input {
  display: none;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.media-skel__body {
  padding: 12px 14px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.media-card__preview {
  aspect-ratio: 4 / 3;
  background: $bn-gray-100;
  overflow: hidden;
  border-bottom: $bn-border;
}

.media-card__preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.media-card__file {
  height: 100%;
  display: grid;
  place-items: center;
  color: $bn-gray-400;
}

.media-card__body {
  padding: 12px 14px 14px;
}

.media-card__name {
  font-size: 13px;
  font-weight: 500;
  color: $bn-black;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.media-card__meta,
.media-card__used {
  font-size: 12px;
  color: $bn-gray-500;
  margin-top: 2px;
}

.media-card__actions {
  display: flex;
  gap: 4px;
  margin-top: 10px;
}

.upload-field {
  margin-bottom: 14px;
}

.upload-drop {
  border: 1px dashed $bn-gray-300;
  border-radius: $bn-radius;
  padding: 28px 16px;
  text-align: center;
  color: $bn-gray-500;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.upload-drop:hover {
  border-color: $bn-gray-400;
  background: $bn-gray-50;
}

.upload-drop__title {
  margin-top: 8px;
  font-size: 14px;
  font-weight: 500;
  color: $bn-gray-900;
}

.upload-drop__hint {
  margin-top: 4px;
  font-size: 12px;
}
</style>
