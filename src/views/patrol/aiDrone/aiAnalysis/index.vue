<script lang="ts" setup>
import { Filter } from "@element-plus/icons-vue"
import BasePanel from "@/components/Panel/BasePanel.vue"
import DroneDeviceCard, { type DroneDeviceCardData } from "../components/DroneDeviceCard.vue"
import { uavApi } from "@/api/uav"
import { isUavApiOk, unwrapPage } from "@/utils/ai-drone/response"
import { AI_DRONE_KEY } from "../context"
import { AI_DRONE_AI_ANALYSIS_RIGHT_WIDTH, AI_DRONE_TABS_OFFSET } from "../constants"
import VideoLibraryList from "./VideoLibraryList.vue"
import { getVideoItemKey, getVideoTaskUuid, isSameVideoKey } from "@/utils/ai-drone/video-lib-item"

/** 飞行记录（路由 aiAnalysis）：右侧视频库列表 + 左侧地图设备栏 */
defineOptions({ name: "AiDroneAiAnalysis" })

const layoutStyle = {
  "--right-width": `${AI_DRONE_AI_ANALYSIS_RIGHT_WIDTH}px`,
  "--tabs-offset": `${AI_DRONE_TABS_OFFSET}px`
}
const drone = inject(AI_DRONE_KEY)!
/** 视频库选中键（字符串，避免 id 缺失时变成 undefined 导致无选中态） */
const activeVideoKey = ref("")

const filterOpen = ref(false)
const videoLoading = ref(false)
const videos = ref<Record<string, unknown>[]>([])
const videoTotal = ref(0)
const videoQuery = reactive({ page: 1, intPageSize: 10, sn: "", startTime: "", endTime: "" })
const videoRange = ref<string[]>([])

/** 接口设备 → 卡片 status（与大鲵 index.vue 映射一致） */
const deviceCards = computed<DroneDeviceCardData[]>(() =>
  drone.devices.value.map((item) => ({
    ...(item as DroneDeviceCardData),
    status: item.is_fly ? "use" : "on"
  }))
)

async function loadVideos() {
  videoLoading.value = true
  try {
    const res = (await uavApi.GetPageAIVideoLib({
      ...videoQuery,
      sn: videoQuery.sn || undefined,
      startTime: videoRange.value?.[0],
      endTime: videoRange.value?.[1],
      status: 2
    })) as { response?: unknown }
    const page = unwrapPage(res)
    videos.value = page.list
    videoTotal.value = page.total
  } finally {
    videoLoading.value = false
  }
}

function resetVideoFilter() {
  videoRange.value = []
  videoQuery.sn = ""
  videoQuery.page = 1
  loadVideos()
}

function searchVideos() {
  videoQuery.page = 1
  loadVideos()
}

/** 选中视频：绘制航线（不打开播放窗）；再次点击同一条则取消选中并清除航线 */
function selectVideoItem(item: Record<string, unknown>) {
  const key = getVideoItemKey(item)
  const taskUuid = getVideoTaskUuid(item)
  if (!key) {
    ElMessage.warning("该视频缺少任务标识")
    return
  }
  if (isSameVideoKey(activeVideoKey.value, key)) {
    clearVideoSelection()
    return
  }

  activeVideoKey.value = key
  if (!taskUuid) return
  uavApi.GetDroneFlyPoints({ taskUuid, task_uuid: taskUuid }).then((res) => {
    // 取消选中后忽略迟到的轨迹响应，避免路线又画回去
    if (!isSameVideoKey(activeVideoKey.value, key)) return
    const body = res as { response?: { longitude: number; latitude: number }[] }
    if (!isUavApiOk(body) || !Array.isArray(body.response) || body.response.length < 2) return
    drone.showWayline(
      body.response.map((point, index) => ({
        name: String(index),
        coordinates: `${point.longitude},${point.latitude}`
      }))
    )
  })
}

/** 播放钮：仅打开录像弹窗，不联动航线/选中态 */
function playVideoItem(item: Record<string, unknown>) {
  drone.openVideo(item)
}

function clearVideoSelection() {
  activeVideoKey.value = ""
  drone.clearWayline()
}

function openLiveFromCard(card: DroneDeviceCardData) {
  const raw = drone.devices.value.find((d) => d.device_sn === card.device_sn)
  if (raw) drone.openLive(raw)
}

watch(
  () => drone.refreshTick.value,
  () => {
    loadVideos()
  }
)

onMounted(() => {
  loadVideos()
})
</script>

<template>
  <div
    class="ai-analysis pointer-events-none absolute inset-0 z-10"
    :style="layoutStyle"
  >
    <!-- 左：设备状态（竖向） -->
    <div class="device-rail ai-scroll">
      <DroneDeviceCard
        v-for="item in deviceCards"
        :key="String(item.device_sn)"
        :data="item"
        @live="openLiveFromCard"
      />
    </div>

    <!-- 右：视频库列表 + 分页 -->
    <aside class="right-board pointer-events-auto">
      <BasePanel title="视频库">
        <template #title>
          <button
            v-if="activeVideoKey"
            type="button"
            class="panel-head-btn"
            @click="clearVideoSelection"
          >
            清除航线
          </button>
          <button
            type="button"
            class="filter-toggle"
            :class="{ 'is-active': filterOpen }"
            aria-label="筛选"
            @click="filterOpen = !filterOpen"
          >
            <el-icon><Filter /></el-icon>
          </button>
        </template>
        <div
          v-loading="videoLoading"
          class="panel-body"
        >
          <Transition name="video-library-filter">
            <div
              v-show="filterOpen"
              class="video-library-filter"
            >
              <div class="video-library-filter__stack">
                <div class="video-library-filter__field">
                  <span class="video-library-filter__field-name">时间</span>
                  <el-date-picker
                    v-model="videoRange"
                    type="datetimerange"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    format="YYYY-MM-DD HH:mm"
                    size="small"
                    range-separator="至"
                    start-placeholder="开始"
                    end-placeholder="结束"
                    class="video-library-filter__range"
                    popper-class="custom-datepicker-popper"
                  />
                </div>
                <div class="video-library-filter__field">
                  <span class="video-library-filter__field-name">设备</span>
                  <el-select
                    v-model="videoQuery.sn"
                    clearable
                    size="small"
                    placeholder="全部设备"
                  >
                    <el-option
                      v-for="item in drone.devices.value"
                      :key="String(item.device_sn)"
                      :label="String(item.device_name || item.device_sn)"
                      :value="String(item.device_sn || '')"
                    />
                  </el-select>
                </div>
                <div class="video-library-filter__actions">
                  <button
                    type="button"
                    class="panel-head-btn"
                    @click="resetVideoFilter"
                  >
                    重置
                  </button>
                  <button
                    type="button"
                    class="panel-head-btn panel-head-btn--accent"
                    @click="searchVideos"
                  >
                    查询
                  </button>
                </div>
              </div>
            </div>
          </Transition>
          <div class="video-library-toolbar">
            <span>共 {{ videoTotal }} 条</span>
          </div>
          <VideoLibraryList
            :list="videos"
            :active-key="activeVideoKey"
            @select="selectVideoItem"
            @play="playVideoItem"
          />
          <el-pagination
            v-model:current-page="videoQuery.page"
            class="ai-pagination"
            layout="prev, pager, next"
            :total="videoTotal"
            :page-size="videoQuery.intPageSize"
            @current-change="loadVideos"
          />
        </div>
      </BasePanel>
    </aside>
  </div>
</template>

<style scoped lang="scss">
/* 大屏深色滚动条，避免系统默认白条 */
.ai-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(62, 140, 210, 0.5) transparent;

  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(62, 140, 210, 0.45);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(8, 24, 48, 0.35);
  }
}

.right-board {
  position: absolute;
  top: 10px;
  bottom: 10px;
  right: 10px;
  width: var(--right-width);
  z-index: 2;

  :deep(.base-panel) {
    height: 100%;
  }

  :deep(.panel-contain) {
    display: flex;
    flex-direction: column;
    min-height: 0;
    height: 100%;
    padding: 6px 8px 8px;
  }
}

/* 设备栏：全高可用，不再为底部视频库留白 */
.device-rail {
  position: absolute;
  z-index: 2;
  top: var(--ai-drone-legend-top, 18px);
  right: var(--ai-drone-device-rail-right, calc(var(--right-width) + 12px + 168px + 12px));
  width: var(--ai-drone-device-rail-width, 268px);
  max-height: calc(100% - var(--ai-drone-legend-top, 18px) - 20px);
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 2px 0;
  overflow-x: hidden;
  overflow-y: auto;
  pointer-events: none;

  :deep(.drone-device-card) {
    pointer-events: auto;
  }
}

.panel-body {
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1;
  height: 100%;
}

.video-library-toolbar {
  flex-shrink: 0;
  margin-bottom: 6px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
}

.video-library-filter {
  flex-shrink: 0;
  margin-bottom: 8px;
  overflow: hidden;
}

.video-library-filter__stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid rgba(64, 105, 145, 0.55);
  background: linear-gradient(180deg, rgba(16, 48, 88, 0.92) 0%, rgba(10, 32, 62, 0.88) 100%);
}

.video-library-filter__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.video-library-filter__field-name {
  font-size: 12px;
  color: rgba(190, 204, 220, 0.85);
}

.video-library-filter__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 4px;

  .panel-head-btn {
    margin-left: 0;
    height: 32px;
    line-height: 30px;
    padding: 0 14px;
  }
}

.video-library-filter {
  :deep(.video-library-filter__range.el-date-editor) {
    width: 100% !important;
    height: 32px;
    box-sizing: border-box;
    --el-input-bg-color: rgba(8, 28, 52, 0.95);
    --el-input-border-color: rgba(48, 72, 104, 0.95);
    --el-input-text-color: rgba(232, 236, 241, 0.95);
    background-color: rgba(8, 28, 52, 0.95) !important;
    border: 1px solid rgba(48, 72, 104, 0.95) !important;
    box-shadow: none !important;
    border-radius: 2px;
  }

  :deep(.el-select .el-select__wrapper) {
    min-height: 32px;
    background-color: rgba(8, 28, 52, 0.95) !important;
    border: 1px solid rgba(48, 72, 104, 0.95) !important;
    box-shadow: none !important;
  }
}

.video-library-filter-enter-active,
.video-library-filter-leave-active {
  transition:
    opacity 0.22s ease,
    max-height 0.22s ease;
}

.video-library-filter-enter-from,
.video-library-filter-leave-to {
  opacity: 0;
  max-height: 0;
}

.video-library-filter-enter-to,
.video-library-filter-leave-from {
  opacity: 1;
  max-height: 280px;
}

.panel-head-btn {
  margin-left: 10px;
  height: 28px;
  padding: 0 16px;
  font-size: 13px;
  line-height: 26px;
  color: #beccdc;
  border: 1px solid rgba(64, 105, 145, 0.75);
  border-radius: 2px;
  background: rgba(20, 35, 53, 0.9);
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background 0.2s ease;

  &:hover {
    border-color: rgba(126, 200, 255, 0.55);
    color: #fff;
  }

  &--accent {
    color: #fff;
    border-color: rgba(88, 186, 241, 0.65);
    background: linear-gradient(90deg, #58baf1 0%, #4693be 50%, #346d8d 100%);
  }
}

.filter-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin-left: 8px;
  padding: 0;
  border: 1px solid rgba(48, 72, 104, 0.9);
  border-radius: 4px;
  background: rgba(12, 40, 77, 0.85);
  color: #7ec8ff;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    color 0.2s ease;

  &:hover {
    border-color: #3ec6ff;
    background: rgba(10, 67, 141, 0.55);
  }

  &.is-active {
    border-color: rgba(88, 186, 241, 0.75);
    background: linear-gradient(180deg, rgba(70, 147, 190, 0.45), rgba(52, 109, 141, 0.35));
    color: #fff;
  }
}

.ai-pagination {
  flex-shrink: 0;
  margin-top: 8px;
  justify-content: center;

  :deep(.btn-prev),
  :deep(.btn-next),
  :deep(.el-pager li) {
    min-width: 34px !important;
    height: 34px !important;
    line-height: 34px !important;
    font-size: 14px !important;
    background: rgba(12, 40, 77, 0.92) !important;
    color: rgba(255, 255, 255, 0.82) !important;
    border: 1px solid rgba(48, 72, 104, 0.75);
    border-radius: 2px;
  }

  :deep(.el-pager li.is-active) {
    color: #fff !important;
    background: linear-gradient(180deg, rgba(70, 147, 190, 0.95), rgba(52, 109, 141, 0.95)) !important;
    border-color: rgba(126, 200, 255, 0.55) !important;
  }
}

.right-board :deep(.panel-title > .flex.items-center) {
  flex: 1;
  min-width: 0;
}

.right-board :deep(.panel-title .title-text) {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.right-board :deep(.panel-title .title-text .panel-head-btn) {
  flex-shrink: 0;
  margin-left: auto;
  margin-right: 2px;
}
</style>