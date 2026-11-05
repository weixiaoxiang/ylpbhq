<script lang="ts" setup>
import { Filter } from "@element-plus/icons-vue"
import BasePanel from "@/components/Panel/BasePanel.vue"
import DroneDeviceCard, { type DroneDeviceCardData } from "../components/DroneDeviceCard.vue"
import { danieUavApi } from "@/api/danieUav"
import { danieFileUrl } from "@/utils/ai-drone/file-url"
import { isAiResultAssessed } from "@/utils/ai-drone/ai-assessment-status"
import { isDanieOk, unwrapPage } from "@/utils/ai-drone/response"
import { AI_DRONE_KEY } from "../context"
import {
  AI_DRONE_AI_ANALYSIS_RIGHT_WIDTH,
  AI_DRONE_AI_ANALYSIS_VIDEO_HEIGHT,
  AI_DRONE_TABS_OFFSET,
  UAV_AI_EVENT_CLASS_OPTIONS
} from "../constants"
import icoFd from "@/assets/images/ai-drone/capture/ico_fd.png"
import icoDw from "@/assets/images/ai-drone/capture/ico_dw.png"
import icoSc from "@/assets/images/ai-drone/capture/ico_sc.png"
import icoScOn from "@/assets/images/ai-drone/capture/ico_sc_on.png"
import VideoLibraryCarousel from "./VideoLibraryCarousel.vue"

/** AI 分析：底视频库横滑 + 左设备栏 + 右研判单列（地图居中，工具条与底栏联动） */
defineOptions({ name: "AiDroneAiAnalysis" })

const layoutStyle = {
  "--right-width": `${AI_DRONE_AI_ANALYSIS_RIGHT_WIDTH}px`,
  "--tabs-offset": `${AI_DRONE_TABS_OFFSET}px`,
  "--video-dock-height": `${AI_DRONE_AI_ANALYSIS_VIDEO_HEIGHT}px`
}
const drone = inject(AI_DRONE_KEY)!
const activeVideoId = ref<string | number>("")

const filterOpen = ref(false)
const videoLoading = ref(false)
const resultLoading = ref(false)
const videos = ref<Record<string, unknown>[]>([])
const videoTotal = ref(0)
const videoQuery = reactive({ page: 1, intPageSize: 8, sn: "", startTime: "", endTime: "" })
const videoRange = ref<string[]>([])
const results = ref<Record<string, unknown>[]>([])
const resultTotal = ref(0)
const resultQuery = reactive({
  page: 1,
  intPageSize: 8,
  class_name: "",
  taskUuid: "",
  sn: ""
})
const resultTitle = ref("研判结果")
const activeFocusId = ref<number | string>(0)
const moreVisible = ref(false)
const moreList = ref<Record<string, unknown>[]>([])
const moreTotal = ref(0)
const moreQuery = reactive({ page: 1, intPageSize: 12, class_name: "" })
const previewRefs: Record<string, { showPreview?: () => void }> = {}

function setPreviewRef(id: unknown, el: unknown) {
  if (el) previewRefs[String(id)] = el as { showPreview?: () => void }
}

function previewResult(item: Record<string, unknown>) {
  previewRefs[String(item.resultId)]?.showPreview?.()
}

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
    const res = (await danieUavApi.GetPageAIVideoLib({
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

async function loadResults() {
  resultLoading.value = true
  try {
    const res = (await danieUavApi.GetPageAIAssessmentResult({
      ...resultQuery,
      class_name: resultQuery.class_name || undefined,
      taskUuid: resultQuery.taskUuid || undefined,
      sn: resultQuery.sn || undefined
    })) as { response?: unknown }
    const page = unwrapPage(res)
    results.value = page.list
    resultTotal.value = page.total
  } finally {
    resultLoading.value = false
  }
}

async function loadMore() {
  const res = (await danieUavApi.GetPageAIAssessmentResult({
    ...moreQuery,
    class_name: moreQuery.class_name || undefined
  })) as { response?: unknown }
  const page = unwrapPage(res)
  moreList.value = page.list
  moreTotal.value = page.total
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

async function collect(item: Record<string, unknown>, reload: () => void) {
  const next = !item.is_collection
  try {
    await ElMessageBox.confirm(`是否确认${next ? "" : "取消"}收藏此条数据?`, "提示", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning"
    })
  } catch {
    return
  }
  const res = (await danieUavApi.PutAIResultCollection({ resultId: item.resultId, collection: next })) as {
    success?: boolean
  }
  if (!isDanieOk(res)) {
    ElMessage.error("收藏失败")
    return
  }
  ElMessage.success(next ? "收藏成功" : "已取消收藏")
  reload()
}

/** 点视频：筛选研判结果、播放录像、绘制航线 */
function openVideo(item: Record<string, unknown>) {
  activeVideoId.value = item.id as string | number
  resultQuery.taskUuid = String(item.taskUuid || "")
  resultQuery.sn = String(item.sn || item.device_sn || "")
  resultQuery.page = 1
  resultTitle.value = `${String(item.name || "任务")}相关事件`
  loadResults()
  drone.openVideo(item)
  danieUavApi.GetDroneFlyPoints({ taskUuid: item.taskUuid }).then((res) => {
    const body = res as { response?: { longitude: number; latitude: number }[] }
    if (!isDanieOk(body) || !Array.isArray(body.response) || body.response.length < 2) return
    drone.showWayline(
      body.response.map((point, index) => ({
        name: String(index),
        coordinates: `${point.longitude},${point.latitude}`
      }))
    )
  })
}

function exitTaskFilter() {
  resultQuery.taskUuid = ""
  resultQuery.sn = ""
  resultQuery.page = 1
  resultTitle.value = "研判结果"
  activeVideoId.value = ""
  activeFocusId.value = 0
  drone.clearWayline()
  loadResults()
}

function openResultDetail(item: Record<string, unknown>) {
  drone.openEventDetail(item)
}

function toggleFocusOnMap(item: Record<string, unknown>) {
  const id = item.resultId as number | string
  if (activeFocusId.value === id) {
    activeFocusId.value = 0
    drone.focusSnap(null)
    return
  }
  activeFocusId.value = id
  drone.focusSnap(item)
}

function openLiveFromCard(card: DroneDeviceCardData) {
  const raw = drone.devices.value.find((d) => d.device_sn === card.device_sn)
  if (raw) drone.openLive(raw)
}

function openMoreDialog() {
  moreVisible.value = true
  loadMore()
}

function onResultClassChange() {
  resultQuery.page = 1
  loadResults()
}

function searchMoreResults() {
  moreQuery.page = 1
  loadMore()
}

watch(
  () => drone.refreshTick.value,
  () => {
    loadResults()
    if (moreVisible.value) loadMore()
  }
)

onMounted(() => {
  loadVideos()
  loadResults()
})
</script>

<template>
  <div
    class="ai-analysis pointer-events-none absolute inset-0 z-10"
    :style="layoutStyle"
  >
    <!-- 左：设备状态（竖向，不挡底部视频库） -->
    <div class="device-rail ai-scroll">
      <DroneDeviceCard
        v-for="item in deviceCards"
        :key="String(item.device_sn)"
        :data="item"
        @live="openLiveFromCard"
      />
    </div>

    <!-- 右：研判列表 -->
    <aside class="right-board pointer-events-auto">
      <BasePanel :title="resultTitle">
        <template #title>
          <button
            v-if="resultQuery.taskUuid"
            type="button"
            class="panel-head-btn"
            @click="exitTaskFilter"
          >
            退出
          </button>
          <button
            v-else
            type="button"
            class="panel-head-btn panel-head-btn--accent"
            @click="openMoreDialog"
          >
            更多
          </button>
        </template>
        <div
          v-loading="resultLoading"
          class="panel-body"
        >
          <div class="result-toolbar result-toolbar--filters">
            <el-select
              v-model="resultQuery.class_name"
              clearable
              size="small"
              placeholder="事件类型"
              class="result-toolbar__select"
              popper-class="custom-select-popper"
              fit-input-width
              teleported
              @change="onResultClassChange"
            >
              <el-option
                v-for="item in UAV_AI_EVENT_CLASS_OPTIONS"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <div class="result-stats">
              <span>共 {{ resultTotal }} 条</span>
            </div>
          </div>
          <ul class="result-list ai-scroll">
            <li
              v-for="item in results"
              :key="String(item.resultId)"
              class="result-row"
              :class="{ 'is-active': activeFocusId === item.resultId }"
            >
              <div class="result-row__thumb">
                <el-image
                  :ref="(el) => setPreviewRef(item.resultId, el)"
                  class="result-row__cover"
                  :src="danieFileUrl(String(item.image_url_local || ''))"
                  fit="cover"
                  :preview-src-list="[danieFileUrl(String(item.image_url_local || ''))]"
                  preview-teleported
                  @click="openResultDetail(item)"
                />
                <div class="result-row__actions">
                  <button
                    type="button"
                    aria-label="放大"
                    @click.stop="previewResult(item)"
                  >
                    <img
                      :src="icoFd"
                      alt=""
                    />
                  </button>
                  <button
                    type="button"
                    aria-label="定位"
                    @click.stop="toggleFocusOnMap(item)"
                  >
                    <img
                      :src="icoDw"
                      alt=""
                    />
                  </button>
                  <button
                    type="button"
                    aria-label="收藏"
                    @click.stop="collect(item, loadResults)"
                  >
                    <img
                      :src="item.is_collection ? icoScOn : icoSc"
                      alt=""
                    />
                  </button>
                </div>
              </div>
              <div
                class="result-row__main"
                @click="openResultDetail(item)"
              >
                <div
                  class="result-row__class"
                  :title="String(item.class_name || '')"
                >
                  {{ item.class_name || "—" }}
                </div>
                <div class="result-row__meta">{{ item.create_time }}</div>
                <div class="result-row__tags">
                  <el-tag
                    size="small"
                    effect="dark"
                    round
                    :type="isAiResultAssessed(item) ? 'success' : 'warning'"
                    class="result-tag"
                  >
                    {{ isAiResultAssessed(item) ? "已研判" : "未研判" }}
                  </el-tag>
                </div>
              </div>
            </li>
          </ul>
          <div
            v-if="results.length === 0"
            class="list-empty"
          >
            暂无数据
          </div>
          <el-pagination
            v-model:current-page="resultQuery.page"
            class="ai-pagination"
            layout="prev, pager, next"
            :total="resultTotal"
            :page-size="resultQuery.intPageSize"
            @current-change="loadResults"
          />
        </div>
      </BasePanel>
    </aside>

    <!-- 底：视频库横向滚动（对齐一张图底部抓拍思路） -->
    <div class="video-dock pointer-events-auto">
      <BasePanel title="视频库">
        <template #title>
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
          class="video-dock__body"
        >
          <Transition name="video-library-filter">
            <div
              v-show="filterOpen"
              class="video-library-filter"
            >
              <div class="video-library-filter__bar">
                <span class="video-library-filter__label">筛选</span>
                <div class="video-library-filter__fields">
                  <div class="video-library-filter__field video-library-filter__field--range">
                    <span class="video-library-filter__field-name">时间</span>
                    <el-date-picker
                      v-model="videoRange"
                      type="datetimerange"
                      value-format="YYYY-MM-DD HH:mm:ss"
                      format="YYYY-MM-DD HH:mm"
                      size="small"
                      range-separator="至"
                      start-placeholder="开始时间"
                      end-placeholder="结束时间"
                      class="video-library-filter__range"
                      popper-class="custom-datepicker-popper"
                    />
                  </div>
                  <div class="video-library-filter__field video-library-filter__field--sn">
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
          <VideoLibraryCarousel
            :list="videos"
            :active-id="activeVideoId"
            @select="openVideo"
          />
          <el-pagination
            v-model:current-page="videoQuery.page"
            class="ai-pagination video-dock__pager"
            layout="prev, pager, next"
            :total="videoTotal"
            :page-size="videoQuery.intPageSize"
            @current-change="loadVideos"
          />
        </div>
      </BasePanel>
    </div>
  </div>

  <el-dialog
    v-model="moreVisible"
    title="全部研判结果"
    width="860px"
    append-to-body
    align-center
    destroy-on-close
    class="ai-analysis-more-dialog"
    modal-class="ai-analysis-more-dialog__overlay"
  >
    <div class="ai-more-dialog__toolbar">
      <span class="ai-more-dialog__toolbar-label">筛选</span>
      <el-select
        v-model="moreQuery.class_name"
        clearable
        size="small"
        placeholder="事件类型"
        class="ai-more-dialog__select"
        popper-class="custom-select-popper"
      >
        <el-option
          v-for="item in UAV_AI_EVENT_CLASS_OPTIONS"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <button
        type="button"
        class="ai-more-dialog__btn ai-more-dialog__btn--accent"
        @click="searchMoreResults"
      >
        查询
      </button>
    </div>
    <div class="ai-more-dialog__grid ai-scroll">
      <article
        v-for="item in moreList"
        :key="String(item.resultId)"
        class="ai-more-dialog__card"
        @click="drone.openEventDetail(item)"
      >
        <el-image
          class="ai-more-dialog__cover"
          :src="danieFileUrl(String(item.image_url_local || ''))"
          fit="cover"
        />
        <p class="ai-more-dialog__meta">
          <span class="ai-more-dialog__type">{{ item.class_name }}</span>
          <span class="ai-more-dialog__time">{{ item.create_time }}</span>
        </p>
      </article>
    </div>
    <el-pagination
      v-model:current-page="moreQuery.page"
      class="ai-pagination ai-more-dialog__pager"
      layout="prev, pager, next"
      :total="moreTotal"
      :page-size="moreQuery.intPageSize"
      @current-change="loadMore"
    />
  </el-dialog>
</template>

<style scoped lang="scss">
@import "../oneMap/one-map-filters.scss";

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

/* 设备栏：高度随卡片数量收缩，避免空白区挡住地图拖拽（right 由 index 注入） */
.device-rail {
  position: absolute;
  z-index: 2;
  top: var(--ai-drone-legend-top, 18px);
  right: var(--ai-drone-device-rail-right, calc(var(--right-width) + 12px + 168px + 12px));
  width: var(--ai-drone-device-rail-width, 268px);
  max-height: calc(100% - var(--ai-drone-legend-top, 18px) - var(--video-dock-height) - 26px);
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

.video-dock {
  position: absolute;
  z-index: 2;
  /* 与一张图「最新抓拍」一致：从容器最左 10px 起，PageTabs 浮在上方不占底栏宽度 */
  left: 10px;
  right: calc(var(--right-width) + 20px);
  bottom: 10px;
  height: var(--video-dock-height);

  :deep(.base-panel) {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
  }

  :deep(.panel-contain) {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
    padding: 0 4px 4px;
  }
}

.video-dock__body {
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

/* 视频库筛选：独立样式，勿复用 one-map-filters（会强制日期宽 108px） */
.video-library-filter {
  flex-shrink: 0;
  margin-bottom: 8px;
  overflow: hidden;
}

.video-library-filter__bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 10px;
  border-radius: 4px;
  border: 1px solid rgba(64, 105, 145, 0.55);
  background: linear-gradient(180deg, rgba(16, 48, 88, 0.92) 0%, rgba(10, 32, 62, 0.88) 100%);
  box-shadow: inset 0 1px 0 rgba(126, 200, 255, 0.08);
}

.video-library-filter__label {
  flex-shrink: 0;
  padding: 0 10px;
  height: 32px;
  line-height: 32px;
  font-size: 13px;
  font-weight: 500;
  color: #7ec8ff;
  border-radius: 2px;
  border: 1px solid rgba(62, 140, 210, 0.35);
  background: rgba(10, 67, 141, 0.35);
}

.video-library-filter__fields {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}

.video-library-filter__field {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;

  /* 双日期时间刚好容纳 YYYY-MM-DD HH:mm，不再占满整行 */
  &--range {
    max-width: 100%;
  }

  &--sn {
    width: 200px;
  }
}

.video-library-filter__field-name {
  flex-shrink: 0;
  width: 36px;
  font-size: 12px;
  color: rgba(190, 204, 220, 0.85);
  text-align: right;
}

.video-library-filter__actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;

  .panel-head-btn {
    margin-left: 0;
    height: 32px;
    line-height: 30px;
    padding: 0 14px;
  }
}

.video-library-filter {
  /* EP 2.x：range 的 el-input__wrapper 在根节点上，不能写成子选择器 */
  :deep(.video-library-filter__range.el-date-editor) {
    flex: none;
    width: 368px !important;
    max-width: 100%;
    height: 32px;
    box-sizing: border-box;
    --el-input-bg-color: rgba(8, 28, 52, 0.95);
    --el-input-border-color: rgba(48, 72, 104, 0.95);
    --el-input-hover-border-color: rgba(88, 186, 241, 0.55);
    --el-input-focus-border-color: rgba(126, 200, 255, 0.75);
    --el-input-text-color: rgba(232, 236, 241, 0.95);
    --el-text-color-placeholder: rgba(190, 204, 220, 0.5);
    padding: 0 10px;
    background-color: rgba(8, 28, 52, 0.95) !important;
    border: 1px solid rgba(48, 72, 104, 0.95) !important;
    box-shadow: none !important;
    border-radius: 2px;
  }

  :deep(.video-library-filter__range.el-date-editor:hover),
  :deep(.video-library-filter__range.el-date-editor.is-active) {
    background-color: rgba(8, 28, 52, 0.95) !important;
    box-shadow: none !important;
  }

  :deep(.video-library-filter__range .el-range-input) {
    font-size: 12px;
    color: rgba(232, 236, 241, 0.95);
    background-color: transparent;
  }

  :deep(.video-library-filter__range .el-range-separator) {
    font-size: 12px;
    color: rgba(126, 200, 255, 0.75);
  }

  :deep(.video-library-filter__range .el-range__icon),
  :deep(.video-library-filter__range .el-range__close-icon) {
    color: rgba(126, 200, 255, 0.85);
  }

  :deep(.el-select) {
    flex: 1;
    width: 100%;
  }

  :deep(.el-select .el-select__wrapper) {
    min-height: 32px;
    padding: 0 10px;
    background-color: rgba(8, 28, 52, 0.95) !important;
    border: 1px solid rgba(48, 72, 104, 0.95) !important;
    box-shadow: none !important;
    border-radius: 2px;
  }

  :deep(.el-select .el-select__placeholder),
  :deep(.el-select .el-select__selected-item) {
    font-size: 12px;
    color: rgba(232, 236, 241, 0.95);
  }
}

/* 展开/收起：不用 transform，避免挤压底栏布局 */
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
  max-height: 88px;
}

.video-dock__pager {
  flex-shrink: 0;
  margin-top: 6px;
  justify-content: flex-end;
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

/* 大屏分页：去掉 small，增大点击区域与字号 */
.ai-pagination {
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

  :deep(.el-pagination) {
    gap: 6px;
  }
}

.panel-body {
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1;
  height: 100%;
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
    box-shadow: 0 0 0 1px rgba(126, 200, 255, 0.15);
  }
}

.result-toolbar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;

  &--filters {
    justify-content: flex-start;
  }

  &__select {
    flex: 0 0 auto;
    width: 160px;
  }

  &--filters :deep(.el-select .el-select__wrapper) {
    min-height: 32px;
    padding: 0 10px;
    background-color: rgba(8, 28, 52, 0.95) !important;
    border: 1px solid rgba(48, 72, 104, 0.95) !important;
    box-shadow: none !important;
    border-radius: 2px;
  }

  &--filters :deep(.el-select .el-select__placeholder),
  &--filters :deep(.el-select .el-select__selected-item) {
    font-size: 12px;
    color: rgba(232, 236, 241, 0.95);
  }
}

.result-stats {
  flex-shrink: 0;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
  white-space: nowrap;
}

.result-list {
  flex: 1;
  min-height: 0;
  margin: 0;
  padding: 0 2px;
  list-style: none;
  overflow-y: auto;
}

.result-row {
  display: flex;
  align-items: stretch;
  gap: 12px;
  padding: 12px 4px;
  border-bottom: 1px solid rgba(48, 72, 104, 0.35);
  transition: background 0.2s ease;

  &.is-active {
    background: rgba(10, 67, 141, 0.22);
  }

  &:hover {
    background: rgba(10, 67, 141, 0.12);
  }
}

.result-row__thumb {
  position: relative;
  flex: 0 0 172px;
  height: 98px;
  border: 1px solid rgba(48, 72, 104, 0.55);
  border-radius: 4px;
  overflow: hidden;
}

.result-row__cover {
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.result-row__actions {
  position: absolute;
  top: 6px;
  right: 6px;
  display: flex;
  gap: 6px;

  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    border: none;
    border-radius: 4px;
    background: rgba(12, 40, 77, 0.88);
    cursor: pointer;

    img {
      width: 18px;
      height: 18px;
    }

    &:hover {
      background: rgba(10, 67, 141, 0.9);
    }
  }
}

.result-row__main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 2px 0;
  cursor: pointer;
}

.result-row__class {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.95);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-row__meta {
  margin-top: 6px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.55);
}

.result-row__tags {
  margin-top: 10px;

  :deep(.result-tag.el-tag) {
    border: none;
    font-size: 12px;
    height: 26px;
    padding: 0 12px;
  }

  :deep(.el-tag.el-tag--success) {
    background: rgba(69, 164, 134, 0.28);
    color: #9ae8c8;
  }

  :deep(.el-tag.el-tag--warning) {
    background: rgba(255, 160, 60, 0.22);
    color: #ffd9a0;
  }
}

.list-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.45);
}

/* 研判标题栏：「更多/退出」靠面板右侧 */
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
  margin-left: auto;
  margin-right: 2px;
}

.right-board .ai-pagination {
  flex-shrink: 0;
  margin-top: 8px;
  justify-content: center;
}
</style>

<!-- 弹层挂载 body，需非 scoped 深色主题 -->
<style lang="scss">
.ai-analysis-more-dialog__overlay {
  background-color: rgba(2, 8, 18, 0.62) !important;
  backdrop-filter: blur(4px);
}

.ai-analysis-more-dialog {
  --el-dialog-bg-color: transparent;
  --el-dialog-padding-primary: 0;
  padding: 0;
  background: transparent;
  border: none;
  box-shadow: none;

  .el-dialog__header {
    margin: 0;
    padding: 14px 18px 12px;
    border-radius: 8px 8px 0 0;
    border: 1px solid rgba(62, 140, 210, 0.45);
    border-bottom: none;
    background: linear-gradient(180deg, rgba(22, 58, 102, 0.98), rgba(10, 32, 62, 0.96));
  }

  .el-dialog__title {
    font-size: 16px;
    font-weight: 600;
    color: #e8f2ff;
    letter-spacing: 0.02em;
  }

  .el-dialog__headerbtn {
    top: 12px;
    right: 14px;
    width: 32px;
    height: 32px;

    .el-dialog__close {
      color: rgba(190, 204, 220, 0.9);
      font-size: 18px;

      &:hover {
        color: #7ec8ff;
      }
    }
  }

  .el-dialog__body {
    padding: 14px 18px 16px;
    color: #e8f2ff;
    border: 1px solid rgba(62, 140, 210, 0.45);
    border-top: 1px solid rgba(48, 72, 104, 0.55);
    border-radius: 0 0 8px 8px;
    background: linear-gradient(165deg, rgba(8, 24, 48, 0.98) 0%, rgba(5, 14, 30, 0.98) 100%);
    box-shadow:
      0 0 0 1px rgba(126, 200, 255, 0.06) inset,
      0 20px 56px rgba(0, 0, 0, 0.55);
  }
}

.ai-more-dialog__toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  padding: 8px 10px;
  border-radius: 4px;
  border: 1px solid rgba(64, 105, 145, 0.55);
  background: linear-gradient(180deg, rgba(16, 48, 88, 0.92) 0%, rgba(10, 32, 62, 0.88) 100%);
}

.ai-more-dialog__toolbar-label {
  flex-shrink: 0;
  padding: 0 10px;
  height: 32px;
  line-height: 32px;
  font-size: 13px;
  color: #7ec8ff;
  border-radius: 2px;
  border: 1px solid rgba(62, 140, 210, 0.35);
  background: rgba(10, 67, 141, 0.35);
}

.ai-more-dialog__select {
  width: 200px;
}

.ai-analysis-more-dialog .ai-more-dialog__select .el-select__wrapper {
  min-height: 32px;
  background-color: rgba(8, 28, 52, 0.95) !important;
  border: 1px solid rgba(48, 72, 104, 0.95) !important;
  box-shadow: none !important;
}

.ai-analysis-more-dialog .ai-more-dialog__select .el-select__placeholder,
.ai-analysis-more-dialog .ai-more-dialog__select .el-select__selected-item {
  font-size: 12px;
  color: rgba(232, 236, 241, 0.95);
}

.ai-more-dialog__btn {
  margin-left: auto;
  height: 32px;
  padding: 0 16px;
  font-size: 13px;
  line-height: 30px;
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

.ai-more-dialog__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  max-height: 480px;
  overflow-y: auto;
  padding: 2px 2px 4px;
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

.ai-more-dialog__card {
  margin: 0;
  padding: 0;
  border: 1px solid rgba(48, 72, 104, 0.65);
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  background: rgba(8, 22, 42, 0.85);
  transition:
    border-color 0.2s ease,
    background 0.2s ease;

  &:hover {
    border-color: rgba(126, 200, 255, 0.45);
    background: rgba(10, 40, 72, 0.55);
  }
}

.ai-more-dialog__cover {
  display: block;
  width: 100%;
  height: 96px;
}

.ai-more-dialog__meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 0;
  padding: 6px 8px 8px;
  font-size: 12px;
  line-height: 1.35;
}

.ai-more-dialog__type {
  color: #7ec8ff;
  font-weight: 500;
}

.ai-more-dialog__time {
  color: rgba(190, 204, 220, 0.75);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ai-more-dialog__pager {
  margin-top: 14px;
  justify-content: center;
}

.ai-analysis-more-dialog .ai-pagination .btn-prev,
.ai-analysis-more-dialog .ai-pagination .btn-next,
.ai-analysis-more-dialog .ai-pagination .el-pager li {
  min-width: 34px !important;
  height: 34px !important;
  line-height: 34px !important;
  font-size: 14px !important;
  background: rgba(12, 40, 77, 0.92) !important;
  color: rgba(255, 255, 255, 0.82) !important;
  border: 1px solid rgba(48, 72, 104, 0.75);
  border-radius: 2px;
}

.ai-analysis-more-dialog .ai-pagination .el-pager li.is-active {
  color: #fff !important;
  background: linear-gradient(180deg, rgba(70, 147, 190, 0.95), rgba(52, 109, 141, 0.95)) !important;
  border-color: rgba(126, 200, 255, 0.55) !important;
}
</style>
