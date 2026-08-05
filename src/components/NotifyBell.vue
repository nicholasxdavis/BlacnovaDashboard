<template>
  <el-popover
    v-model:visible="open"
    placement="bottom-end"
    :width="320"
    trigger="click"
  >
    <template #reference>
      <button
        class="notify-btn"
        type="button"
        aria-label="Notifications"
        :aria-expanded="open"
      >
        <PhBell :size="18" />
        <span v-if="items.length" class="notify-btn__dot" aria-hidden="true" />
      </button>
    </template>

    <div class="notify">
      <div class="notify__head">
        <span class="notify__title">Notifications</span>
        <button
          v-if="items.length"
          type="button"
          class="notify__action"
          @click="markAll"
        >
          Mark all read
        </button>
      </div>

      <div v-if="items.length" class="notify__list">
        <button
          v-for="item in items"
          :key="item.id"
          type="button"
          class="notify__item"
          @click="openItem(item.id)"
        >
          <span class="notify__item-dot" aria-hidden="true" />
          <span>
            <span class="notify__item-title">{{ item.name }}</span>
            <span class="notify__item-sub">{{ item.subject }}</span>
          </span>
        </button>
      </div>
      <div v-else class="notify__empty">You're all caught up.</div>
    </div>
  </el-popover>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { PhBell } from '@phosphor-icons/vue'
import { useWebsiteStore } from '@/stores/website'

const router = useRouter()
const websiteStore = useWebsiteStore()
const open = ref(false)

const items = computed(() =>
  websiteStore.submissions
    .filter((s) => s.status === 'new')
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 5),
)

async function markAll() {
  await websiteStore.markAllSubmissionsRead()
}

function openItem(id: string) {
  open.value = false
  router.push({ path: '/submissions', query: { id } })
}
</script>

<style scoped lang="scss">
.notify-btn {
  position: relative;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  border-radius: $bn-radius-sm;
  display: grid;
  place-items: center;
  cursor: pointer;
  color: $bn-gray-700;
}

.notify-btn:hover {
  background: $bn-gray-100;
  color: $bn-black;
}

.notify-btn__dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: $bn-orange;
  border: 1.5px solid $bn-white;
}

.notify__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}

.notify__title {
  font-size: 13px;
  font-weight: 500;
  color: $bn-black;
}

.notify__action {
  border: none;
  background: none;
  color: $bn-gray-500;
  font-size: 12px;
  cursor: pointer;
  padding: 0;
}

.notify__action:hover {
  color: $bn-orange;
}

.notify__list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 280px;
  overflow-y: auto;
}

.notify__item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  text-align: left;
  border: none;
  background: transparent;
  padding: 10px 8px;
  border-radius: $bn-radius-sm;
  cursor: pointer;
}

.notify__item:hover {
  background: $bn-gray-50;
}

.notify__item-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: $bn-orange;
  margin-top: 5px;
  flex-shrink: 0;
}

.notify__item-title {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: $bn-black;
}

.notify__item-sub {
  display: block;
  font-size: 12px;
  color: $bn-gray-500;
  margin-top: 1px;
}

.notify__empty {
  padding: 18px 8px;
  text-align: center;
  font-size: 13px;
  color: $bn-gray-500;
}
</style>
