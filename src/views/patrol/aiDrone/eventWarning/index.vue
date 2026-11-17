<script lang="ts" setup>
import dayjs from "dayjs"
import * as echarts from "echarts"
import BasePanel from "@/components/Panel/BasePanel.vue"
import { uavApi } from "@/api/uav"
import { uavFileUrl } from "@/utils/ai-drone/file-url"
import { isUavApiOk, unwrapPage } from "@/utils/ai-drone/response"
import {
  AI_DRONE_EVENT_WARNING_ANALYSIS_MIN_HEIGHT,
  AI_DRONE_EVENT_WARNING_BOTTOM_HEIGHT,
  AI_DRONE_EVENT_WARNING_EVENT_WIDTH,
  AI_DRONE_EVENT_WARNING_KPI_MIN_HEIGHT,
  AI_DRONE_EVENT_WARNING_PANEL_GAP,
  AI_DRONE_EVENT_WARNING_STATS_WIDTH,
  AI_DRONE_EVENT_WARNING_TODAY_MIN_HEIGHT,
  AI_DRONE_TABS_OFFSET
} from "../constants"
import { AI_DRONE_KEY } from "../context"
import { bindChartResize } from "../oneMap/dashboard-charts"

/**
 * 事件预警布局：
 * 底栏「预警类型分析」贴最左 | 右列「统计/今日/分析」| 其左另列「预警事件」
 */
defineOptions({ name: "AiDroneEventWarning" })

const layoutStyle = {
  "--stats-width": `${AI_DRONE_EVENT_WARNING_STATS_WIDTH}px`,
  "--event-width": `${AI_DRONE_EVENT_WARNING_EVENT_WIDTH}px`,
  "--bottom-height": `${AI_DRONE_EVENT_WARNING_BOTTOM_HEIGHT}px`,
  "--panel-gap": `${AI_DRONE_EVENT_WARNING_PANEL_GAP}px`,
  "--today-min-height": `${AI_DRONE_EVENT_WARNING_TODAY_MIN_HEIGHT}px`,
  "--kpi-min-height": `${AI_DRONE_EVENT_WARNING_KPI_MIN_HEIGHT}px`,
  "--analysis-min-height": `${AI_DRONE_EVENT_WARNING_ANALYSIS_MIN_HEIGHT}px`,
  "--tabs-offset": `${AI_DRONE_TABS_OFFSET}px`
}

const drone = inject(AI_DRONE_KEY)!
const events = ref<Record<string, unknown>[]>([])
const eventTotal = ref(0)
const eventQuery = reactive({ page: 1, intPageSize: 8 })
const todayList = ref<Record<string, unknown>[]>([])
const stats = ref({ yjsl: 0, ycl: 0, jrwcl: 0, jrycl: 0 })
const analysis = ref({ zyfsName: "", zyfsCount: 0, zyfssjd: "", zyfssjdCount: 0 })
/** 底栏「预警类型分析」图表范围（与右侧「预警分析」互不联动） */
const chartRangeKey = ref("月")
/** 右侧「预警分析」文案统计范围 */
const analysisRangeKey = ref("月")
const pieRef = ref<HTMLElement | null>(null)
const barRef = ref<HTMLElement | null>(null)
let pieChart: echarts.ECharts | null = null
let barChart: echarts.ECharts | null = null
/** 容器尺寸变化时仅 chart.resize，避免重复打统计接口 */
let unbindPieResize: (() => void) | null = null
let unbindBarResize: (() => void) | null = null
const moreVisible = ref(false)
const moreList = ref<Record<string, unknown>[]>([])
const moreTotal = ref(0)
const morePage = ref(1)

function buildTimeRange(key: string) {
  if (key === "年") {
    return {
      startTime: dayjs().subtract(1, "year").format("YYYY-MM-DD 00:00:00"),
      endTime: dayjs().format("YYYY-MM-DD 23:59:59")
    }
  }
  if (key === "总") return { startTime: undefined, endTime: undefined }
  return {
    startTime: dayjs().subtract(1, "month").format("YYYY-MM-DD 00:00:00"),
    endTime: dayjs().format("YYYY-MM-DD 23:59:59")
  }
}

async function loadEvents() {
  const res = (await uavApi.GetPageAIWarningResult({
    ...eventQuery,
    is_warning: true
  })) as { response?: unknown }
  const page = unwrapPage(res)
  events.value = page.list
  eventTotal.value = page.total
}

async function loadToday() {
  const res = (await uavApi.GetPageAIWarningResult({
    page: 1,
    intPageSize: 10,
    is_warning: true,
    startTime: dayjs().format("YYYY-MM-DD 00:00:00"),
    endTime: dayjs().format("YYYY-MM-DD 23:59:59")
  })) as { response?: unknown }
  todayList.value = unwrapPage(res).list
}

async function loadKpiStats() {
  const res = (await uavApi.GetAIWarningResultStatistics({})) as { response?: typeof stats.value }
  if (isUavApiOk(res) && res.response) stats.value = res.response
}

async function loadAnalysisSummary() {
  const analysisRes = (await uavApi.GetAIWarningResultAnalysis(buildTimeRange(analysisRangeKey.value))) as {
    response?: typeof analysis.value
  }
  if (isUavApiOk(analysisRes) && analysisRes.response) analysis.value = analysisRes.response
}

async function loadStats() {
  await loadKpiStats()
  await loadAnalysisSummary()
}

/** 首次挂载时初始化 ECharts 实例，并绑定 ResizeObserver 仅做 resize */
function ensureChartInstances() {
  if (pieRef.value && !pieChart) {
    pieChart = echarts.init(pieRef.value)
    unbindPieResize?.()
    unbindPieResize = bindChartResize(pieChart, pieRef.value)
  }
  if (barRef.value && !barChart) {
    barChart = echarts.init(barRef.value)
    unbindBarResize?.()
    unbindBarResize = bindChartResize(barChart, barRef.value)
  }
}

/** 拉取饼图/柱状图数据并 setOption（切换月年、首次进入时调用，不在 window resize 时调用） */
async function loadChartData() {
  await nextTick()
  ensureChartInstances()
  const chartRange = buildTimeRange(chartRangeKey.value)
  const [pieRes, lineRes] = await Promise.all([
    uavApi.GetAIWarningResultStatisticsPie(chartRange) as Promise<{
      response?: { name: string; value: number }[]
    }>,
    uavApi.GetAIWarningResultStatisticsLine(chartRange) as Promise<{
      response?: Record<string, unknown>[]
    }>
  ])
  const rows = Array.isArray(pieRes.response) ? pieRes.response : []
  pieChart?.setOption({
    tooltip: { trigger: "item" },
    color: ["#58baf1", "#7ec8ff", "#4693be", "#346d8d", "#9ad4ff"],
    series: [
      {
        type: "pie",
        radius: ["42%", "68%"],
        label: { color: "#c9d7ea", fontSize: 11 },
        data: rows.length ? rows : [{ name: "暂无", value: 0 }]
      }
    ]
  })
  const lineRows = Array.isArray(lineRes.response) ? lineRes.response : []
  barChart?.setOption({
    tooltip: { trigger: "axis" },
    legend: { textStyle: { color: "#c9d7ea" }, data: ["烟", "火", "人员", "车辆"] },
    grid: { left: 36, right: 12, top: 28, bottom: 24 },
    xAxis: {
      type: "category",
      data: lineRows.map((row) => row.XAxis),
      axisLabel: { color: "#c9d7ea", fontSize: 10 }
    },
    yAxis: {
      type: "value",
      axisLabel: { color: "#c9d7ea", fontSize: 10 },
      splitLine: { lineStyle: { color: "rgba(255,255,255,.08)" } }
    },
    series: [
      {
        name: "烟",
        type: "bar",
        barMaxWidth: 14,
        itemStyle: { color: "#58baf1" },
        data: lineRows.map((row) => row.SmokeCount)
      },
      {
        name: "火",
        type: "bar",
        barMaxWidth: 14,
        itemStyle: { color: "#f59e6a" },
        data: lineRows.map((row) => row.FireCount)
      },
      {
        name: "人员",
        type: "bar",
        barMaxWidth: 14,
        itemStyle: { color: "#7ec8ff" },
        data: lineRows.map((row) => row.PersonCount)
      },
      {
        name: "车辆",
        type: "bar",
        barMaxWidth: 14,
        itemStyle: { color: "#4693be" },
        data: lineRows.map((row) => row.VehicleCount)
      }
    ]
  })
}

async function loadMore() {
  const res = (await uavApi.GetPageAIWarningResult({
    page: morePage.value,
    intPageSize: 8,
    is_warning: true
  })) as { response?: unknown }
  const page = unwrapPage(res)
  moreList.value = page.list
  moreTotal.value = page.total
}

function openMoreDialog() {
  moreVisible.value = true
  loadMore()
}

function setChartRange(key: string) {
  chartRangeKey.value = key
  loadChartData()
}

function setAnalysisRange(key: string) {
  analysisRangeKey.value = key
  loadAnalysisSummary()
}

watch(
  () => drone.refreshTick.value,
  () => {
    loadEvents()
    loadToday()
    loadStats()
  }
)

onMounted(() => {
  loadEvents()
  loadToday()
  loadStats()
  nextTick(loadChartData)
})

onBeforeUnmount(() => {
  unbindPieResize?.()
  unbindBarResize?.()
  pieChart?.dispose()
  barChart?.dispose()
})
</script>

<template>
  <div
    class="event-warning pointer-events-none absolute inset-0 z-10"
    :style="layoutStyle"
  >
    <!-- 底：预警类型分析（占满地图区，避开右侧双列） -->
    <div class="event-warning__bottom pointer-events-auto">
      <BasePanel title="预警类型分析">
        <div class="event-warning__charts-wrap">
          <div class="event-warning__charts-toolbar">
            <span class="event-warning__charts-toolbar-label">统计范围</span>
            <div class="event-warning__range-group event-warning__range-group--inline">
              <button
                v-for="item in ['月', '年']"
                :key="item"
                type="button"
                class="range-btn"
                :class="{ active: chartRangeKey === item }"
                @click="setChartRange(item)"
              >
                {{ item }}
              </button>
            </div>
          </div>
          <div class="event-warning__charts">
            <div
              ref="pieRef"
              class="event-warning__chart"
            />
            <div
              ref="barRef"
              class="event-warning__chart"
            />
          </div>
        </div>
      </BasePanel>
    </div>

    <!-- 右二列：预警事件（与统计列对齐、另起一列） -->
    <aside class="event-warning__events pointer-events-auto">
      <BasePanel title="预警事件">
        <template #title>
          <button
            type="button"
            class="panel-head-btn panel-head-btn--accent"
            @click="openMoreDialog"
          >
            更多
          </button>
        </template>
        <div class="event-warning__events-body">
          <ul class="event-warning__event-list ai-scroll">
            <li
              v-for="item in events"
              :key="String(item.id || item.resultId)"
              class="event-warning__event-row"
              @click="drone.openWarnDetail(item)"
            >
              <el-image
                class="event-warning__event-thumb"
                :src="uavFileUrl(String(item.image_url_local || ''))"
                fit="cover"
              />
              <div class="event-warning__event-meta">
                <p class="event-warning__event-time">{{ item.create_time }}</p>
                <p class="event-warning__event-name">{{ item.droneName }}</p>
                <p class="event-warning__event-tags">
                  <span>{{ item.class_name }}</span>
                  <span
                    class="event-warning__status"
                    :class="{ 'is-done': item.is_warning_disposal }"
                  >
                    {{ item.is_warning_disposal ? "已处理" : "未处理" }}
                  </span>
                </p>
              </div>
            </li>
            <li
              v-if="events.length === 0"
              class="event-warning__empty"
            >
              暂无数据
            </li>
          </ul>
          <el-pagination
            v-model:current-page="eventQuery.page"
            class="ai-pagination event-warning__pager"
            layout="prev, pager, next"
            :page-size="eventQuery.intPageSize"
            :total="eventTotal"
            @current-change="loadEvents"
          />
        </div>
      </BasePanel>
    </aside>

    <!-- 右：统计 / 今日 / 分析 -->
    <aside class="event-warning__stats pointer-events-auto">
      <BasePanel
        title="预警统计"
        class="event-warning__stats-kpi"
      >
        <div class="event-warning__kpi-grid">
          <div class="event-warning__kpi-item">
            <b>{{ stats.yjsl }}</b>
            <span>预警数量</span>
          </div>
          <div class="event-warning__kpi-item">
            <b>{{ stats.ycl }}</b>
            <span>已处理</span>
          </div>
          <div class="event-warning__kpi-item">
            <b>{{ stats.jrwcl }}</b>
            <span>今日未处理</span>
          </div>
          <div class="event-warning__kpi-item">
            <b>{{ stats.jrycl }}</b>
            <span>今日已处理</span>
          </div>
        </div>
      </BasePanel>

      <BasePanel
        title="今日预警"
        class="event-warning__stats-today"
      >
        <ul class="event-warning__today-list ai-scroll">
          <li
            v-for="item in todayList"
            :key="String(item.id || item.resultId)"
            class="event-warning__today-row"
            @click="drone.openWarnDetail(item)"
          >
            <el-image
              class="event-warning__today-thumb"
              :src="uavFileUrl(String(item.image_url_local || ''))"
              fit="cover"
            />
            <div>
              <p class="event-warning__today-type">{{ item.class_name }}</p>
              <p class="event-warning__today-time">{{ item.create_time }}</p>
            </div>
          </li>
          <li
            v-if="todayList.length === 0"
            class="event-warning__empty"
          >
            暂无数据
          </li>
        </ul>
      </BasePanel>

      <BasePanel
        title="预警分析"
        class="event-warning__stats-analysis"
      >
        <div class="event-warning__range-group event-warning__range-group--compact">
          <button
            v-for="item in ['月', '年', '总']"
            :key="item"
            type="button"
            class="range-btn"
            :class="{ active: analysisRangeKey === item }"
            @click="setAnalysisRange(item)"
          >
            {{ item }}
          </button>
        </div>
        <div class="event-warning__analysis-grid">
          <p>最易发生 {{ analysis.zyfsName || "暂无" }} {{ analysis.zyfsCount }} 次</p>
          <p>最热时段 {{ analysis.zyfssjd || "暂无" }} {{ analysis.zyfssjdCount }} 次</p>
        </div>
      </BasePanel>
    </aside>
  </div>

  <el-dialog
    v-model="moreVisible"
    title="全部预警事件"
    width="760px"
    append-to-body
    align-center
    destroy-on-close
    class="ai-event-warning-more-dialog"
    modal-class="ai-event-warning-more-dialog__overlay"
  >
    <ul class="ai-event-warning-more-list ai-scroll">
      <li
        v-for="item in moreList"
        :key="String(item.id || item.resultId)"
        class="ai-event-warning-more-row"
        @click="drone.openWarnDetail(item)"
      >
        <el-image
          class="ai-event-warning-more-thumb"
          :src="uavFileUrl(String(item.image_url_local || ''))"
          fit="cover"
        />
        <div>
          <p>{{ item.create_time }} · {{ item.class_name }}</p>
          <p class="ai-event-warning-more-sub">
            {{ item.droneName }} · {{ item.is_warning_disposal ? "已处理" : "未处理" }}
          </p>
        </div>
      </li>
    </ul>
    <el-pagination
      v-model:current-page="morePage"
      class="ai-pagination ai-event-warning-more-pager"
      layout="prev, pager, next"
      :total="moreTotal"
      :page-size="8"
      @current-change="loadMore"
    />
  </el-dialog>
</template>

<style scoped lang="scss">
.event-warning {
  color: #e8f2ff;
  font-size: 13px;
}

/* 底栏：预警类型分析顶到容器最左侧，右侧让出双列看板 */
.event-warning__bottom {
  position: absolute;
  z-index: 2;
  left: 10px;
  right: calc(var(--stats-width) + var(--event-width) + var(--panel-gap) + 20px);
  bottom: 10px;
  height: var(--bottom-height);

  :deep(.base-panel) {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  :deep(.panel-contain) {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    padding: 4px 8px 8px;
  }
}

.event-warning__charts-wrap {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  height: 100%;
}

.event-warning__charts-toolbar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-bottom: 6px;
  padding: 0 2px;
}

.event-warning__charts-toolbar-label {
  font-size: 12px;
  color: rgba(190, 204, 220, 0.65);
}

.event-warning__charts {
  display: grid;
  flex: 1;
  grid-template-columns: 1fr 1.2fr;
  gap: 8px;
  min-height: 0;
}

.event-warning__chart {
  min-height: 0;
  height: 100%;
}

/* 预警事件：在统计列左侧另起一列，顶底与统计列对齐 */
.event-warning__events {
  position: absolute;
  z-index: 2;
  top: 10px;
  bottom: 10px;
  right: calc(var(--stats-width) + 20px);
  width: var(--event-width);

  :deep(.base-panel) {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  :deep(.panel-contain) {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    padding: 6px 8px 8px;
  }
}

.event-warning__events :deep(.panel-title) {
  position: relative;
  padding-right: 88px;
}

.event-warning__events :deep(.panel-title .title-text .panel-head-btn) {
  position: absolute;
  top: 50%;
  right: 10px;
  margin: 0;
  margin-top: -14px;
}

.event-warning__events-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.event-warning__event-list {
  flex: 1;
  min-height: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  overflow-y: auto;
}

.event-warning__event-row {
  display: flex;
  gap: 10px;
  padding: 10px 4px;
  border-bottom: 1px solid rgba(48, 72, 104, 0.35);
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(10, 67, 141, 0.15);
  }
}

.event-warning__event-thumb {
  flex: 0 0 96px;
  height: 64px;
  border: 1px solid rgba(48, 72, 104, 0.55);
  border-radius: 4px;
  overflow: hidden;
}

.event-warning__event-meta {
  min-width: 0;
  flex: 1;
}

.event-warning__event-time {
  margin: 0 0 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
}

.event-warning__event-name {
  margin: 0 0 4px;
  font-size: 12px;
  color: rgba(190, 204, 220, 0.8);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-warning__event-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 12px;
  color: #7ec8ff;
}

.event-warning__status {
  padding: 0 6px;
  border-radius: 2px;
  font-size: 11px;
  color: #ffb86c;
  border: 1px solid rgba(255, 184, 108, 0.45);
  background: rgba(255, 184, 108, 0.12);

  &.is-done {
    color: #7ec8ff;
    border-color: rgba(126, 200, 255, 0.45);
    background: rgba(126, 200, 255, 0.12);
  }
}

.event-warning__pager {
  flex-shrink: 0;
  margin-top: 8px;
  justify-content: center;
}

/* 右列：统计 */
.event-warning__stats {
  position: absolute;
  z-index: 2;
  top: 10px;
  right: 10px;
  bottom: 10px;
  width: var(--stats-width);
  display: flex;
  flex-direction: column;
  gap: var(--panel-gap);
  min-height: 0;
}

.event-warning__stats-kpi {
  flex: 0 0 var(--kpi-min-height);
  min-height: var(--kpi-min-height);

  :deep(.base-panel) {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: var(--kpi-min-height);
  }

  :deep(.panel-contain) {
    flex: 1;
    display: flex;
    align-items: center;
    padding: 10px 12px 12px;
  }
}

.event-warning__kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  text-align: center;
}

.event-warning__kpi-item {
  b {
    display: block;
    margin-bottom: 6px;
    font-size: 22px;
    font-weight: 600;
    color: #7ec8ff;
  }

  span {
    font-size: 12px;
    color: rgba(190, 204, 220, 0.75);
  }
}

/* 今日预警：单独占一块，高度优先于「分析」 */
.event-warning__stats-today {
  flex: 1 1 var(--today-min-height);
  min-height: var(--today-min-height);
  height: auto !important;

  :deep(.base-panel) {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: var(--today-min-height);
  }

  :deep(.panel-contain) {
    flex: 1;
    min-height: 0;
    padding: 6px 8px 8px;
  }
}

.event-warning__today-list {
  height: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
  overflow-y: auto;
}

.event-warning__today-row {
  display: flex;
  gap: 8px;
  padding: 8px 2px;
  border-bottom: 1px solid rgba(48, 72, 104, 0.3);
  cursor: pointer;

  &:hover {
    background: rgba(10, 67, 141, 0.12);
  }
}

.event-warning__today-thumb {
  flex: 0 0 64px;
  height: 48px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgba(48, 72, 104, 0.5);
}

.event-warning__today-type {
  margin: 0 0 2px;
  font-size: 12px;
  color: #e8f2ff;
}

.event-warning__today-time {
  margin: 0;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.event-warning__stats-analysis {
  flex: 0 0 var(--analysis-min-height);
  min-height: var(--analysis-min-height);

  :deep(.base-panel) {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: var(--analysis-min-height);
  }

  :deep(.panel-contain) {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 10px 12px 12px;
  }
}

.event-warning__analysis-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 10px;
  font-size: 13px;
  line-height: 1.5;
  color: rgba(201, 215, 234, 0.9);
}

.event-warning__empty {
  padding: 32px 8px;
  text-align: center;
  color: rgba(255, 255, 255, 0.45);
  list-style: none;
}

.event-warning__range-group {
  display: flex;
  gap: 6px;

  &--inline {
    flex-shrink: 0;
  }

  &--compact {
    margin-bottom: 4px;
  }
}

.range-btn {
  height: 26px;
  padding: 0 10px;
  font-size: 12px;
  color: #c9d7ea;
  border: 1px solid #304868;
  border-radius: 2px;
  background: rgba(12, 40, 77, 0.85);
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    color 0.2s ease;

  &.active,
  &:hover {
    color: #7ec8ff;
    border-color: #3ec6ff;
  }
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

  &--accent {
    color: #fff;
    border-color: rgba(88, 186, 241, 0.65);
    background: linear-gradient(90deg, #58baf1 0%, #4693be 50%, #346d8d 100%);
  }
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
}
</style>

<style lang="scss">
.ai-event-warning-more-dialog__overlay {
  background-color: rgba(2, 8, 18, 0.62) !important;
  backdrop-filter: blur(4px);
}

.ai-event-warning-more-dialog {
  --el-dialog-bg-color: transparent;
  padding: 0;
  background: transparent;

  .el-dialog__header {
    margin: 0;
    padding: 14px 18px 12px;
    border: 1px solid rgba(62, 140, 210, 0.45);
    border-radius: 8px 8px 0 0;
    background: linear-gradient(180deg, rgba(22, 58, 102, 0.98), rgba(10, 32, 62, 0.96));
  }

  .el-dialog__title {
    color: #e8f2ff;
    font-size: 16px;
  }

  .el-dialog__headerbtn .el-dialog__close {
    color: rgba(190, 204, 220, 0.9);
  }

  .el-dialog__body {
    padding: 14px 18px 16px;
    border: 1px solid rgba(62, 140, 210, 0.45);
    border-top: none;
    border-radius: 0 0 8px 8px;
    background: linear-gradient(165deg, rgba(8, 24, 48, 0.98), rgba(5, 14, 30, 0.98));
  }
}

.ai-event-warning-more-list {
  max-height: 480px;
  margin: 0;
  padding: 0;
  list-style: none;
  overflow-y: auto;
}

.ai-event-warning-more-row {
  display: flex;
  gap: 12px;
  padding: 10px 4px;
  border-bottom: 1px solid rgba(48, 72, 104, 0.35);
  cursor: pointer;
  color: #e8f2ff;

  &:hover {
    background: rgba(10, 67, 141, 0.15);
  }
}

.ai-event-warning-more-thumb {
  flex: 0 0 96px;
  height: 64px;
  border-radius: 4px;
  overflow: hidden;
}

.ai-event-warning-more-sub {
  margin: 4px 0 0;
  font-size: 12px;
  color: rgba(190, 204, 220, 0.75);
}

.ai-event-warning-more-pager {
  margin-top: 12px;
  justify-content: center;
}
</style>
