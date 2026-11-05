<script lang="ts" setup>
import dayjs from "dayjs"
import * as echarts from "echarts"
import BasePanel from "@/components/Panel/BasePanel.vue"
import { danieUavApi } from "@/api/danieUav"
import { isDanieOk } from "@/utils/ai-drone/response"
import { AI_DRONE_KEY } from "../context"
import CaptureCarousel from "./CaptureCarousel.vue"
import { AI_DRONE_BOARD_WIDTH, AI_DRONE_ONE_MAP_CAPTURE_HEIGHT } from "../constants"
import { bindChartResize, buildAiAnalysisOption, buildCarTypeOption } from "./dashboard-charts"

/** 一张图：右侧看板 + 底部最新抓拍 */
defineOptions({ name: "AiDroneOneMap" })

/** 供样式 v-bind，与 constants 保持同一高度源 */
const capturePanelHeight = AI_DRONE_ONE_MAP_CAPTURE_HEIGHT
const boardWidthPx = `${AI_DRONE_BOARD_WIDTH}px`

const drone = inject(AI_DRONE_KEY)!
const month = ref(dayjs().format("YYYY-MM"))
const flightMonth = ref(dayjs().format("YYYY-MM"))
const deviceSn = ref("")
const summary = ref({ total: 0, assessment: 0, unassessment: 0 })
const flight = ref({ fxhx: 0, fxjc: 0, fxlc: 0, fxsc: 0 })
const tasks = ref<{ dzx: number; zxz: number; ywc: number; airports: Record<string, unknown>[] }>({
  dzx: 0,
  zxz: 0,
  ywc: 0,
  airports: []
})

const aiLegend = ref<{ name: string; color: string }[]>([])
const carLegend = ref<{ name: string; color: string; value: number }[]>([])
const aiChartRef = ref<HTMLElement | null>(null)
const carChartRef = ref<HTMLElement | null>(null)
let aiChart: echarts.ECharts | null = null
let carChart: echarts.ECharts | null = null
let unbindAiResize: (() => void) | null = null
let unbindCarResize: (() => void) | null = null
let refreshTimer = 0

const flying = computed(() => drone.devices.value.filter((item) => item.is_fly).length)
const standby = computed(() => drone.devices.value.length - flying.value)

function monthRange(value: string) {
  return {
    startTime: dayjs(value).startOf("month").format("YYYY-MM-DD 00:00:00"),
    endTime: dayjs(value).endOf("month").format("YYYY-MM-DD 23:59:59")
  }
}

function formatFlightNum(value: unknown) {
  return parseFloat(Math.abs(Number(value) || 0).toFixed(1))
}

async function loadSummary() {
  const res = (await danieUavApi.GetAIEventStatistics({})) as { response?: typeof summary.value }
  if (isDanieOk(res) && res.response) summary.value = res.response
}

async function loadFlight() {
  const res = (await danieUavApi.GetFlightStatistics(monthRange(flightMonth.value))) as {
    response?: typeof flight.value
  }
  if (isDanieOk(res) && res.response) flight.value = res.response
  const taskRes = (await danieUavApi.GetFlyTaskStatistics({})) as { response?: typeof tasks.value }
  if (isDanieOk(taskRes) && taskRes.response) {
    tasks.value = {
      dzx: taskRes.response.dzx || 0,
      zxz: taskRes.response.zxz || 0,
      ywc: taskRes.response.ywc || 0,
      airports: Array.isArray(taskRes.response.airports) ? taskRes.response.airports : []
    }
  }
}

async function renderAiChart() {
  const res = (await danieUavApi.GetAIAnalysis(monthRange(month.value))) as { response?: Record<string, unknown>[] }
  const rows = Array.isArray(res.response) ? res.response : []
  if (!aiChartRef.value) return
  unbindAiResize?.()
  aiChart?.dispose()
  aiChart = echarts.init(aiChartRef.value)
  const { option, legend } = buildAiAnalysisOption(rows)
  aiLegend.value = legend
  aiChart.setOption(option)
  unbindAiResize = bindChartResize(aiChart, aiChartRef.value)
}

async function renderCarChart() {
  const res = (await danieUavApi.GetAICarTypeAnalysis({ ...monthRange(month.value), sn: deviceSn.value })) as {
    response?: { type: string; count: number }[]
  }
  const rows = Array.isArray(res.response) ? res.response : []
  if (!carChartRef.value) return
  unbindCarResize?.()
  carChart?.dispose()
  carChart = echarts.init(carChartRef.value)
  const { option, legend } = buildCarTypeOption(rows)
  carLegend.value = legend
  carChart.setOption(option)
  unbindCarResize = bindChartResize(carChart, carChartRef.value)
}

function reloadCharts() {
  renderAiChart()
  renderCarChart()
}

function refreshBoard() {
  loadSummary()
  loadFlight()
  reloadCharts()
}

onMounted(() => {
  loadSummary()
  loadFlight()
  nextTick(() => {
    reloadCharts()
  })
  refreshTimer = window.setInterval(refreshBoard, 30_000)
})

onBeforeUnmount(() => {
  window.clearInterval(refreshTimer)
  unbindAiResize?.()
  unbindCarResize?.()
  aiChart?.dispose()
  carChart?.dispose()
})
</script>

<template>
  <div class="one-map pointer-events-none absolute inset-0 z-10">
    <div class="captures pointer-events-auto">
      <BasePanel title="最新抓拍">
        <CaptureCarousel />
      </BasePanel>
    </div>

    <div class="right-board pointer-events-auto">
      <BasePanel
        title="无人机数据看板"
        class="kpi-panel"
      >
        <div class="kpi-grid">
          <div class="kpi-item">
            <div class="kpi-label">待研判</div>
            <div class="kpi-value">{{ summary.unassessment }}</div>
          </div>
          <div class="kpi-item">
            <div class="kpi-label">已研判</div>
            <div class="kpi-value">{{ summary.assessment }}</div>
          </div>
          <div class="kpi-item">
            <div class="kpi-label">总量</div>
            <div class="kpi-value">{{ summary.total }}</div>
          </div>
          <div class="kpi-item kpi-item--split">
            <div class="kpi-label">无人机状态</div>
            <div class="kpi-pair">
              <span><em>待机</em>{{ standby }}</span>
              <span><em>飞行</em>{{ flying }}</span>
            </div>
          </div>
        </div>
      </BasePanel>

      <BasePanel
        title="数据分析"
        class="analysis-panel"
      >
        <div class="dashboard-charts one-map-filters">
          <div class="charts-col">
            <div class="section-head">
              <span class="section-title">AI分析</span>
              <el-date-picker
                v-model="month"
                type="month"
                value-format="YYYY-MM"
                format="YYYY-MM"
                size="small"
                :clearable="false"
                popper-class="custom-datepicker-popper"
                @change="reloadCharts"
              />
            </div>
            <div class="chart-block">
              <div
                v-if="aiLegend.length"
                class="legend-row"
              >
                <div
                  v-for="item in aiLegend"
                  :key="item.name"
                  class="legend-item"
                >
                  <i :style="{ background: item.color }" />
                  {{ item.name }}
                </div>
              </div>
              <div
                ref="aiChartRef"
                class="chart"
              />
            </div>

            <div class="section-head section-head--tight">
              <span class="section-title">车辆类型</span>
              <el-select
                v-model="deviceSn"
                size="small"
                placeholder="总量"
                popper-class="custom-select-popper"
                @change="renderCarChart"
              >
                <el-option
                  label="总量"
                  value=""
                />
                <el-option
                  v-for="item in drone.devices.value"
                  :key="String(item.device_sn)"
                  :label="String(item.device_name || item.device_sn)"
                  :value="String(item.device_sn || '')"
                />
              </el-select>
            </div>
            <div class="chart-block chart-block--pie">
              <div
                v-if="carLegend.length"
                class="legend-row legend-row--wrap"
              >
                <div
                  v-for="item in carLegend"
                  :key="item.name"
                  class="legend-item"
                >
                  <i :style="{ background: item.color }" />
                  {{ item.name }}
                </div>
              </div>
              <div
                ref="carChartRef"
                class="chart"
              />
            </div>
          </div>

          <div class="charts-col">
            <div class="section-head">
              <span class="section-title">飞行统计</span>
              <el-date-picker
                v-model="flightMonth"
                type="month"
                value-format="YYYY-MM"
                format="YYYY-MM"
                size="small"
                :clearable="false"
                popper-class="custom-datepicker-popper"
                @change="loadFlight"
              />
            </div>
            <div class="flight-grid">
              <div class="kpi-item kpi-item--mini">
                <div class="kpi-label">飞行里程（公里）</div>
                <div class="kpi-value">{{ formatFlightNum(flight.fxlc) }}</div>
              </div>
              <div class="kpi-item kpi-item--mini">
                <div class="kpi-label">飞行架次（次）</div>
                <div class="kpi-value">{{ flight.fxjc ?? 0 }}</div>
              </div>
              <div class="kpi-item kpi-item--mini">
                <div class="kpi-label">飞行时长（小时）</div>
                <div class="kpi-value">{{ formatFlightNum(flight.fxsc) }}</div>
              </div>
              <div class="kpi-item kpi-item--mini">
                <div class="kpi-label">飞行航线（条）</div>
                <div class="kpi-value">{{ flight.fxhx ?? 0 }}</div>
              </div>
            </div>

            <div class="section-head section-head--task">
              <span class="section-title">飞行任务状态</span>
            </div>
            <div class="task-wrap">
              <div class="task-summary">
                <div>
                  <span class="task-label">待执行</span>
                  <span class="task-value task-value--pending">{{ tasks.dzx }}</span>
                </div>
                <div>
                  <span class="task-label">已完成</span>
                  <span class="task-value">{{ tasks.ywc }}</span>
                </div>
              </div>
              <div class="task-list">
                <div
                  v-for="(item, index) in tasks.airports"
                  :key="index"
                  class="task-card"
                >
                  <div class="task-card__head">
                    <span>{{ item.AirportCallsign }}</span>
                    <span :class="{ idle: !item.LastTaskUuid }">
                      {{ item.LastTaskUuid ? item.LastTaskStatus : "无任务" }}
                    </span>
                  </div>
                  <div class="task-card__meta">航线：{{ item.LastTaskName || "无航线" }}</div>
                  <div class="task-card__meta">时间：{{ item.LastExecuteTime || "无执行时间" }}</div>
                </div>
                <div
                  v-if="tasks.airports.length === 0"
                  class="task-empty"
                >
                  暂无任务记录
                </div>
              </div>
            </div>
          </div>
        </div>
      </BasePanel>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "./one-map-filters.scss";

.one-map {
  --board-width: v-bind(boardWidthPx);
}

.captures {
  position: absolute;
  left: 10px;
  right: calc(var(--board-width) + 20px);
  bottom: 10px;
  height: calc(v-bind(capturePanelHeight) * 1px);

  :deep(.base-panel) {
    height: 100%;
  }

  :deep(.panel-contain) {
    min-height: 0;
    height: 100%;
    padding: 0 4px 4px;
  }
}

.right-board {
  position: absolute;
  top: 10px;
  right: 10px;
  bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: var(--board-width);

  /* KPI 面板只占内容高度，避免 h-full 占满整列导致「数据分析」不可见 */
  .kpi-panel {
    flex: 0 0 auto;
    height: auto !important;

    :deep(.panel-contain) {
      padding: 8px 10px 10px;
    }
  }

  .analysis-panel {
    flex: 1;
    min-height: 0;
    height: auto !important;

    :deep(.panel-contain) {
      display: flex;
      flex-direction: column;
      min-height: 0;
      height: 100%;
      padding: 8px;
    }
  }
}

.kpi-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.kpi-item {
  min-height: 72px;
  padding: 8px 10px;
  background: linear-gradient(180deg, rgba(22, 58, 102, 0.72), rgba(12, 34, 62, 0.55));
  border: 1px solid rgba(62, 140, 210, 0.35);
  border-radius: 4px;

  &--split {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  &--mini {
    min-height: 64px;
  }
}

.kpi-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.72);
}

.kpi-value {
  margin-top: 6px;
  font-size: 24px;
  font-weight: 600;
  line-height: 1;
  color: #7ec8ff;
}

.kpi-pair {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #7ec8ff;

  em {
    display: block;
    margin-bottom: 4px;
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.65);
  }
}

.dashboard-charts {
  display: flex;
  flex: 1;
  gap: 10px;
  min-height: 0;
}

.charts-col {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  padding: 8px;
  background: rgba(8, 28, 52, 0.35);
  border: 1px solid rgba(62, 140, 210, 0.22);
  border-radius: 6px;
}

.section-head {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.92);

  &--tight {
    margin-top: 2px;
  }

  &--task {
    margin-top: 4px;
  }
}

.section-title {
  flex-shrink: 0;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.chart-block {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 108px;
  margin-bottom: 4px;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(62, 140, 210, 0.12);

  &--pie {
    flex: 1.05;
    min-height: 96px;
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
}

.legend-row {
  display: flex;
  flex-shrink: 0;
  gap: 10px;
  margin-bottom: 4px;

  &--wrap {
    flex-wrap: wrap;
    justify-content: center;
  }
}

.legend-item {
  display: flex;
  gap: 4px;
  align-items: center;
  font-size: 12px;
  color: rgba(201, 215, 234, 0.95);

  i {
    width: 10px;
    height: 10px;
    border-radius: 1px;
  }
}

.chart {
  flex: 1;
  min-height: 72px;
}

.flight-grid {
  display: grid;
  flex-shrink: 0;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 8px;
}

.task-wrap {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

.task-summary {
  display: flex;
  flex-shrink: 0;
  justify-content: space-between;
  margin-bottom: 8px;
  padding: 0 4px;
  font-size: 13px;

  .task-label {
    margin-right: 6px;
    color: rgba(255, 255, 255, 0.65);
  }

  .task-value {
    font-size: 18px;
    font-weight: 600;
    color: #7ec8ff;

    &--pending {
      color: #ffb84d;
    }
  }
}

.task-list {
  flex: 1;
  min-height: 0;
  padding-right: 2px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(126, 200, 255, 0.35);
    border-radius: 2px;
  }
}

.task-card {
  margin-bottom: 8px;
  padding: 8px 10px;
  font-size: 12px;
  background: rgba(16, 52, 96, 0.5);
  border: 1px solid rgba(62, 140, 210, 0.28);
  border-radius: 4px;

  &__head {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
    font-size: 13px;

    .idle {
      color: rgba(255, 255, 255, 0.45);
    }

    span:last-child {
      color: #7ec8ff;
    }
  }

  &__meta {
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.62);
  }
}

.task-empty {
  padding: 24px 0;
  color: rgba(255, 255, 255, 0.45);
  text-align: center;
}
</style>
