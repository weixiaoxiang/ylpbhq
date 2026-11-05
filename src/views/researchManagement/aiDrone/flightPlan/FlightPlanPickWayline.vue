<script lang="ts" setup>
import dayjs from "dayjs"
import { danieUavApi } from "@/api/danieUav"
import { getSikongToken } from "@/utils/ai-drone/sikong-token"
import { formatWaylineTemplateTypes } from "./flight-plan-utils"

/** 新建计划：选择航线（对齐大鲵 leftListHX，前端分页） */
defineOptions({ name: "FlightPlanPickWayline" })

interface Props {
  projectUuid: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  back: []
  pick: [wayline: Record<string, unknown>]
}>()

const loading = ref(false)
const allList = ref<Record<string, unknown>[]>([])
const page = ref(1)
const pageSize = 10

const total = computed(() => allList.value.length)
const pagedList = computed(() => {
  const start = (page.value - 1) * pageSize
  return allList.value.slice(start, start + pageSize)
})

async function loadList() {
  if (!props.projectUuid) {
    ElMessage.warning("请选择设备")
    return
  }
  loading.value = true
  try {
    const res = (await danieUavApi.waylineList({ token: getSikongToken(), projectUuid: props.projectUuid }, {})) as {
      data?: { list?: Record<string, unknown>[] }
    }
    const rows = res.data?.list || []
    allList.value = rows.map((item) => ({
      ...item,
      template_types_str: formatWaylineTemplateTypes(item.template_types),
      update_time_label: item.update_time ? dayjs(String(item.update_time)).format("YYYY-MM-DD HH:mm") : "—"
    }))
    const maxPage = Math.max(1, Math.ceil(allList.value.length / pageSize))
    if (page.value > maxPage) page.value = 1
  } finally {
    loading.value = false
  }
}

async function handlePick(item: Record<string, unknown>) {
  const picked: Record<string, unknown> = { ...item }
  try {
    const heightRes = (await danieUavApi.GetWaylines({ wayline_uuid: item.id })) as {
      success?: boolean
      response?: { wayline_height?: number }[]
    }
    const height = heightRes.response?.[0]?.wayline_height
    if (height != null) picked.wayline_height = height
  } catch {
    /* 高度接口失败不阻断选择 */
  }
  const detail = (await danieUavApi.waylineDetail(
    { token: getSikongToken(), projectUuid: props.projectUuid },
    { wayline_id: item.id }
  )) as { code?: number; data?: { download_url?: string } }
  if (detail.code === 0 && detail.data?.download_url) {
    picked.download_url = detail.data.download_url
  }
  emit("pick", picked)
}

watch(
  () => props.projectUuid,
  () => loadList(),
  { immediate: true }
)
</script>

<template>
  <div
    v-loading="loading"
    class="flight-plan-pick"
    element-loading-background="rgba(8, 24, 48, 0.72)"
  >
    <div class="flight-plan-pick__head">
      <span
        >航线 <b>{{ total }}</b></span
      >
      <button
        type="button"
        class="flight-plan-pick__back"
        @click="emit('back')"
      >
        退出
      </button>
    </div>
    <ul class="flight-plan-pick__list ai-scroll">
      <li
        v-for="(item, index) in pagedList"
        :key="String(item.id || index)"
        class="flight-plan-pick__row"
        @click="handlePick(item)"
      >
        <div class="flight-plan-pick__row-head">
          <span>{{ item.name }}</span>
          <span class="flight-plan-pick__tag is-info">{{ item.template_types_str }}</span>
        </div>
        <p class="flight-plan-pick__meta">Matrice 4TD</p>
        <p class="flight-plan-pick__meta">{{ item.update_time_label }}</p>
      </li>
      <li
        v-if="!loading && total === 0"
        class="flight-plan-pick__empty"
      >
        暂无数据
      </li>
    </ul>
    <el-pagination
      v-if="total > pageSize"
      v-model:current-page="page"
      class="flight-plan-pick__pager ai-pagination"
      layout="prev, pager, next"
      :page-size="pageSize"
      :total="total"
    />
  </div>
</template>

<style scoped lang="scss">
@import "./flight-plan-theme.scss";

.flight-plan-pick {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding: 12px 10px;
  border-radius: 8px;
  border: 1px solid rgba(56, 98, 140, 0.35);
  background: linear-gradient(165deg, rgba(10, 32, 58, 0.72), rgba(6, 18, 36, 0.55));
}

.flight-plan-pick__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  padding-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #9ad4ff;
  border-bottom: 1px solid rgba(56, 98, 140, 0.4);

  b {
    margin-left: 6px;
    color: #6ec4ff;
    font-weight: 600;
  }
}

.flight-plan-pick__back {
  padding: 4px 12px;
  font-size: 12px;
  color: #6ec4ff;
  border: 1px solid rgba(88, 186, 241, 0.45);
  border-radius: 4px;
  background: rgba(10, 32, 58, 0.92);
  cursor: pointer;

  &:hover {
    background: rgba(28, 72, 110, 0.65);
  }
}

.flight-plan-pick__list {
  flex: 1;
  min-height: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  overflow-y: auto;
}

.flight-plan-pick__row {
  padding: 10px;
  margin-bottom: 8px;
  border: 1px solid rgba(48, 72, 104, 0.55);
  border-radius: 4px;
  background: rgba(12, 40, 77, 0.55);
  cursor: pointer;

  &:hover {
    border-color: rgba(88, 186, 241, 0.45);
  }
}

.flight-plan-pick__row-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
  font-weight: 600;
}

.flight-plan-pick__tag {
  flex-shrink: 0;
  padding: 0 6px;
  font-size: 11px;
  border-radius: 2px;

  &.is-info {
    color: #c9d7ea;
    border: 1px solid rgba(201, 215, 234, 0.35);
  }
}

.flight-plan-pick__meta {
  margin: 0;
  font-size: 11px;
  color: rgba(190, 204, 220, 0.75);
  line-height: 1.5;
}

.flight-plan-pick__empty {
  padding: 32px 8px;
  text-align: center;
  color: rgba(255, 255, 255, 0.45);
  list-style: none;
}

.flight-plan-pick__pager {
  flex-shrink: 0;
  margin-top: 8px;
  justify-content: center;

  @include fp-pagination-dark;
}

.ai-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(62, 140, 210, 0.5) transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(62, 140, 210, 0.45);
    border-radius: 4px;
  }
}
</style>
