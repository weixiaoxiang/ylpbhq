<script lang="ts" setup>
import { usageInstructionsApi, type SysCzznListItem } from "@/api/SystemManage/usageInstructions"

const visible = defineModel<boolean>({ default: false })

const list = ref<SysCzznListItem[]>([])
const isLoading = ref(false)

const sortedList = computed(() => {
  return [...list.value].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
})

const STATIS_URL_PREFIX = "/statisUrl/"

/** 站内资源经 /statisUrl/ 代理；完整 http(s) 地址不拼接 */
function resolveOpenUrl(path: string): string {
  const raw = path?.trim() ?? ""
  if (!raw) return ""
  if (/^https?:\/\//i.test(raw)) return raw
  if (raw.startsWith(STATIS_URL_PREFIX)) return raw
  const segment = raw.replace(/^\/+/, "")
  return `${STATIS_URL_PREFIX}${segment}`
}

async function fetchList() {
  isLoading.value = true
  try {
    const res = await usageInstructionsApi.getSysCzznList()
    list.value = Array.isArray(res.response) ? res.response : []
  } catch {
    list.value = []
  } finally {
    isLoading.value = false
  }
}

function handleOpenItem(item: SysCzznListItem) {
  const url = resolveOpenUrl(item.path)
  if (!url) {
    ElMessage.warning("文件地址无效")
    return
  }
  window.open(url, "_blank", "noopener,noreferrer")
}

watch(visible, (v) => {
  if (v) {
    fetchList()
  }
})
</script>

<template>
  <el-dialog
    v-model="visible"
    title="使用说明"
    width="520px"
    destroy-on-close
    append-to-body
    class="usage-instructions-dialog"
  >
    <el-skeleton
      v-if="isLoading"
      :rows="6"
      animated
    />
    <el-empty
      v-else-if="!sortedList.length"
      description="暂无使用说明"
    />
    <ul
      v-else
      class="usage-list"
    >
      <li
        v-for="item in sortedList"
        :key="item.id"
        class="usage-list__item"
        role="button"
        tabindex="0"
        @click="handleOpenItem(item)"
        @keydown.enter="handleOpenItem(item)"
      >
        <span class="usage-list__name">{{ item.name }}</span>
        <el-tag
          v-if="item.type"
          size="small"
          type="info"
          class="shrink-0"
        >
          {{ item.type }}
        </el-tag>
        <el-icon class="usage-list__arrow"><i-ep-arrow-right /></el-icon>
      </li>
    </ul>
  </el-dialog>
</template>

<style lang="scss" scoped>
.usage-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.usage-list__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: var(--el-fill-color-light);
  }

  &:focus-visible {
    outline: 2px solid var(--el-color-primary);
    outline-offset: 2px;
  }
}

.usage-list__name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.usage-list__arrow {
  flex-shrink: 0;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}
</style>
