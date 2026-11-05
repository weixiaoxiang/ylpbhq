<script lang="ts" setup>
import { Plus, TopRight } from "@element-plus/icons-vue"
import dayjs from "dayjs"
import BasePanel from "@/components/Panel/BasePanel.vue"
import { danieUavApi } from "@/api/danieUav"
import { getSikongToken, mapDroneDeviceItem } from "@/utils/ai-drone/sikong-token"
import { isDanieOk } from "@/utils/ai-drone/response"
import { AI_DRONE_FLIGHT_PLAN_PANEL_WIDTH } from "../constants"
import { AI_DRONE_KEY } from "../context"
import FlightPlanCreatePanel from "./FlightPlanCreatePanel.vue"
import FlightPlanPickDevice from "./FlightPlanPickDevice.vue"
import FlightPlanPickWayline from "./FlightPlanPickWayline.vue"
import {
  buildTaskPostPayload,
  createDefaultFlightPlanForm,
  formatPlanTimestamp,
  formatWaylineTemplateTypes
} from "./flight-plan-utils"

/** 航飞计划：功能对齐大鲵 HFJH（筛选/搜索/面板内新建/选设备航线） */
defineOptions({ name: "AiDroneFlightPlan" })

type PanelView = "list" | "create" | "device" | "wayline"

const layoutStyle = {
  "--panel-width": `${AI_DRONE_FLIGHT_PLAN_PANEL_WIDTH}px`
}

const drone = inject(AI_DRONE_KEY)!
const panelView = ref<PanelView>("list")
const devices = ref<Record<string, unknown>[]>([])
const deviceIndex = ref<number | "">(0)
const status = ref("未完成")
const queryName = ref("")
const dateRange = ref<string[]>([
  dayjs().startOf("day").format("YYYY-MM-DD"),
  dayjs().add(1, "month").format("YYYY-MM-DD")
])
const plans = ref<Record<string, unknown>[]>([])
const loading = ref(false)
/** 计划库列表当前选中项，用于高亮与地图预览航线 */
const activePlanId = ref<string>("")

const createForm = reactive(createDefaultFlightPlanForm())
const createDevice = ref<Record<string, unknown> | null>(null)
const createWayline = ref<Record<string, unknown> | null>(null)
const createProjectUuid = computed(() => String(createDevice.value?.projectUuid || ""))

const panelTitle = computed(() => {
  if (panelView.value === "create") return "新建计划"
  if (panelView.value === "device") return "选择设备"
  if (panelView.value === "wayline") return "选择航线"
  return "计划库"
})

const statusLabel: Record<string, string> = {
  waiting: "待开始",
  starting_failure: "启动失败",
  executing: "执行中",
  paused: "暂停",
  suspended: "挂起",
  terminated: "终止",
  success: "成功",
  timeout: "超时"
}

const statusBadgeClass: Record<string, string> = {
  waiting: "is-warn",
  executing: "is-success",
  success: "is-success",
  paused: "is-warn",
  suspended: "is-info",
  starting_failure: "is-danger",
  terminated: "is-danger",
  timeout: "is-danger"
}

const currentDevice = computed(() => {
  if (deviceIndex.value === "" || deviceIndex.value == null) return undefined
  return devices.value[deviceIndex.value] as Record<string, unknown> | undefined
})

function deviceOptionLabel(item: Record<string, unknown>) {
  return String(item.airportCallsign || item.device_name || item.name || item.device_sn || item.sn || "未命名机场")
}

async function loadDevices() {
  const res = (await danieUavApi.GetPageDrone({ page: 1, intPageSize: 20 })) as {
    response?: Record<string, unknown>[]
  }
  if (!isDanieOk(res) || !Array.isArray(res.response)) return
  devices.value = res.response
    .filter((row) => Array.isArray(row.drones) && (row.drones as unknown[]).length > 0)
    .map((item) => mapDroneDeviceItem(item as { drones?: Record<string, unknown>[] }))
    .filter(Boolean) as Record<string, unknown>[]
  if (devices.value.length && deviceIndex.value === "") deviceIndex.value = 0
  if (devices.value.length) loadPlans()
}

async function loadPlans() {
  const device = currentDevice.value
  if (!device?.projectUuid) {
    plans.value = []
    return
  }
  loading.value = true
  try {
    const res = (await danieUavApi.taskList(
      { token: getSikongToken(), projectUuid: String(device.projectUuid) },
      {
        name: queryName.value || undefined,
        sn: device.airportSn,
        status:
          status.value === "已结束" ? "success,terminated" : "waiting,starting_failure,executing,paused,suspended",
        begin_at: dayjs(dateRange.value[0] + " 00:00:00").unix(),
        end_at: dayjs(dateRange.value[1] + " 23:59:59").unix()
      }
    )) as { code?: number; message?: string; data?: { list?: Record<string, unknown>[] } }
    if (res.code && res.code !== 0) {
      ElMessage.error(res.message || "航飞计划加载失败，请检查司空 Token")
      plans.value = []
      return
    }
    plans.value = [...(res.data?.list || [])].reverse()
  } finally {
    loading.value = false
  }
}

function onDeviceChange() {
  if (deviceIndex.value === "") {
    plans.value = []
    return
  }
  loadPlans()
}

function changeStatus(value: string) {
  status.value = value
  dateRange.value =
    value === "未完成"
      ? [dayjs().startOf("day").format("YYYY-MM-DD"), dayjs().add(1, "month").format("YYYY-MM-DD")]
      : [dayjs().subtract(7, "day").startOf("day").format("YYYY-MM-DD"), dayjs().format("YYYY-MM-DD")]
  loadPlans()
}

function openCreate() {
  Object.assign(createForm, createDefaultFlightPlanForm())
  createDevice.value = null
  createWayline.value = null
  const device = currentDevice.value
  if (device) applyCreateDevice(device)
  panelView.value = "create"
}

function cancelCreate() {
  panelView.value = "list"
}

function openWaylinePick() {
  if (!createProjectUuid.value) {
    ElMessage.warning("请先选择设备")
    return
  }
  panelView.value = "wayline"
}

function applyCreateDevice(device: Record<string, unknown>) {
  createDevice.value = device
  createForm.sn = String(device.airportSn || device.device_sn || "")
}

function onPickDevice(device: Record<string, unknown>) {
  applyCreateDevice(device)
  panelView.value = "create"
}

function onPickWayline(item: Record<string, unknown>) {
  createWayline.value = item
  createForm.wayline_uuid = String(item.id)
  createForm.waylineName = String(item.name || "")
  const height = Number(item.wayline_height)
  if (Number.isFinite(height) && height > 0) createForm.rth_altitude = height
  const url = item.download_url as string | undefined
  if (url) drone.loadWaylineUrl(url)
  panelView.value = "create"
}

async function submitCreate() {
  if (!createForm.sn) {
    ElMessage.warning("请选择设备")
    return
  }
  const payload = buildTaskPostPayload(createForm)
  if (!payload) {
    ElMessage.warning("请完善计划名称、航线及执行时间")
    return
  }
  const projectUuid = createProjectUuid.value
  if (!projectUuid) {
    ElMessage.warning("设备缺少项目 UUID")
    return
  }
  const res = (await danieUavApi.taskPost({ token: getSikongToken(), projectUuid }, payload)) as {
    code?: number
    message?: string
  }
  if (res.code && res.code !== 0) {
    ElMessage.error(res.message || "创建失败")
    return
  }
  ElMessage.success("计划已创建")
  panelView.value = "list"
  loadPlans()
}

/** 点击计划：预览航线；再次点击同一项则取消高亮并清除地图航线 */
async function previewPlanWayline(item: Record<string, unknown>) {
  const planId = String(item.id ?? item.uuid ?? "")
  if (activePlanId.value === planId) {
    activePlanId.value = ""
    drone.clearWayline()
    return
  }
  activePlanId.value = planId
  const waylineId = item.wayline_uuid || item.wayline_id || item.file_id
  const device = currentDevice.value
  if (!waylineId || !device?.projectUuid) return
  const detail = (await danieUavApi.waylineDetail(
    { token: getSikongToken(), projectUuid: String(device.projectUuid) },
    { wayline_id: String(waylineId) }
  )) as { code?: number; data?: { download_url?: string } }
  if (detail.code === 0 && detail.data?.download_url) {
    drone.loadWaylineUrl(detail.data.download_url)
  }
}

function openSikong() {
  window.open("https://fh.dji.com/login", "_blank")
}

function planStatusClass(planStatus: unknown) {
  return statusBadgeClass[String(planStatus || "")] || "is-danger"
}

onMounted(loadDevices)
</script>

<template>
  <div
    class="flight-plan pointer-events-none absolute inset-0 z-10"
    :style="layoutStyle"
  >
    <aside class="flight-plan__board pointer-events-auto">
      <BasePanel
        v-loading="loading && panelView === 'list'"
        :title="panelTitle"
        element-loading-background="rgba(8, 24, 48, 0.72)"
      >
        <div class="flight-plan__body">
          <!-- 计划库列表 -->
          <template v-if="panelView === 'list'">
            <div class="flight-plan__filters one-map-filters fp-list-filters">
              <p class="flight-plan__section-label">当前设备</p>
              <div class="flight-plan__filter-row flight-plan__filter-row--split">
                <el-date-picker
                  v-model="dateRange"
                  type="daterange"
                  value-format="YYYY-MM-DD"
                  range-separator="-"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  :clearable="false"
                  class="flight-plan-filter__range"
                  popper-class="ai-flight-plan-popper"
                  @change="loadPlans"
                />
                <button
                  type="button"
                  class="flight-plan__head-btn flight-plan__head-btn--inline"
                  aria-label="新建计划"
                  @click="openCreate"
                >
                  <el-icon><Plus /></el-icon>
                </button>
              </div>
              <div class="flight-plan__filter-row flight-plan__filter-row--split">
                <el-select
                  v-model="deviceIndex"
                  class="flight-plan__select-inline"
                  clearable
                  placeholder="抓拍设备"
                  teleported
                  popper-class="custom-select-popper ai-flight-plan-popper"
                  @change="onDeviceChange"
                >
                  <el-option
                    v-for="(item, index) in devices"
                    :key="String(item.device_sn || item.airportSn || index)"
                    :label="deviceOptionLabel(item)"
                    :value="index"
                  />
                </el-select>
                <el-input
                  v-model="queryName"
                  class="flight-plan__search"
                  placeholder="搜索航线/计划名称"
                  clearable
                  @keyup.enter="loadPlans"
                  @clear="loadPlans"
                />
              </div>

              <div class="flight-plan__section-head">
                <p class="flight-plan__section-label">航飞计划</p>
                <button
                  type="button"
                  class="flight-plan__link-btn"
                  @click="openSikong"
                >
                  <span>无人机调动</span>
                  <el-icon aria-hidden="true"><TopRight /></el-icon>
                </button>
              </div>

              <div class="flight-plan__segment">
                <button
                  type="button"
                  class="flight-plan__segment-item"
                  :class="{ 'is-active': status === '未完成' }"
                  @click="changeStatus('未完成')"
                >
                  未完成
                </button>
                <button
                  type="button"
                  class="flight-plan__segment-item"
                  :class="{ 'is-active': status === '已结束' }"
                  @click="changeStatus('已结束')"
                >
                  已结束
                </button>
              </div>
            </div>

            <ul class="flight-plan__list ai-scroll">
              <li
                v-for="item in plans"
                :key="String(item.uuid || item.id)"
                class="flight-plan__item"
                :class="{ 'is-active': activePlanId === String(item.id ?? item.uuid) }"
                @click="previewPlanWayline(item)"
              >
                <div class="flight-plan__item-head">
                  <span class="flight-plan__item-name">{{ item.name }}</span>
                  <span
                    class="flight-plan__badge"
                    :class="planStatusClass(item.status)"
                  >
                    {{ statusLabel[String(item.status)] || item.status }}
                  </span>
                </div>
                <p class="flight-plan__item-meta">开始 {{ formatPlanTimestamp(item.begin_at) }}</p>
                <p class="flight-plan__item-meta">结束 {{ formatPlanTimestamp(item.end_at) }}</p>
              </li>
              <li
                v-if="!loading && plans.length === 0"
                class="flight-plan__empty"
              >
                暂无数据
              </li>
            </ul>
          </template>

          <FlightPlanCreatePanel
            v-else-if="panelView === 'create'"
            :form="createForm"
            :device-label="createDevice ? deviceOptionLabel(createDevice) : '—'"
            :device-online="!!createDevice?.airportOnlineStatus"
            :device-working="!!createDevice?.isFly"
            :drone-name="String(createDevice?.droneName || '')"
            :wayline-label="createForm.waylineName || '—'"
            :wayline-type="createWayline ? String(createWayline.template_types_str || '') : ''"
            @cancel="cancelCreate"
            @submit="submitCreate"
            @pick-device="panelView = 'device'"
            @pick-wayline="openWaylinePick"
          />

          <FlightPlanPickDevice
            v-else-if="panelView === 'device'"
            @back="panelView = 'create'"
            @pick="onPickDevice"
          />

          <FlightPlanPickWayline
            v-else-if="panelView === 'wayline'"
            :project-uuid="createProjectUuid"
            @back="panelView = 'create'"
            @pick="onPickWayline"
          />
        </div>
      </BasePanel>
    </aside>
  </div>
</template>

<style scoped lang="scss">
@import "../oneMap/one-map-filters.scss";

.flight-plan {
  color: #e8f2ff;
  font-size: 13px;
}

.flight-plan__board {
  position: absolute;
  z-index: 2;
  top: 10px;
  right: 10px;
  bottom: 10px;
  width: var(--panel-width);

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
    padding: 8px 10px 10px;
  }
}

.flight-plan__body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.flight-plan__filters {
  flex-shrink: 0;
  margin-bottom: 12px;
  padding: 12px 10px 10px;
  border-radius: 8px;
  border: 1px solid rgba(56, 98, 140, 0.35);
  background: linear-gradient(165deg, rgba(10, 32, 58, 0.65), rgba(6, 18, 36, 0.5));

  :deep(.el-select .el-select__wrapper) {
    min-height: 32px;
    background-color: rgba(8, 28, 52, 0.95) !important;
    border: 1px solid rgba(48, 72, 104, 0.95) !important;
    box-shadow: none !important;
  }

  :deep(.el-input__wrapper) {
    background-color: rgba(8, 28, 52, 0.95) !important;
    border: 1px solid rgba(48, 72, 104, 0.95) !important;
    box-shadow: none !important;
  }

  :deep(.el-input__inner) {
    color: rgba(232, 236, 241, 0.95);
    font-size: 12px;
  }

  :deep(.flight-plan-filter__range.el-date-editor) {
    flex: 1;
    min-width: 0;
    width: auto !important;
    height: 32px;
    background-color: rgba(8, 28, 52, 0.95) !important;
    border: 1px solid rgba(48, 72, 104, 0.95) !important;
    box-shadow: none !important;
  }

  :deep(.flight-plan-filter__range .el-range-input) {
    font-size: 12px;
    color: rgba(232, 236, 241, 0.95);
    background: transparent;
  }
}

.flight-plan__filter-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;

  &--split {
    min-width: 0;
  }
}

.flight-plan__select-inline {
  flex: 0 0 140px;
  min-width: 0;
}

.flight-plan__search {
  flex: 1;
  min-width: 0;
}

.flight-plan__head-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  color: #fff;
  border: 1px solid rgba(88, 186, 241, 0.65);
  border-radius: 4px;
  background: linear-gradient(90deg, #58baf1 0%, #4693be 50%, #346d8d 100%);
  cursor: pointer;
  flex-shrink: 0;

  &--inline {
    height: 32px;
    width: 32px;
  }
}

.flight-plan__section-label {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: rgba(201, 215, 234, 0.9);
}

.flight-plan__section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 4px;
  margin-bottom: 6px;

  .flight-plan__section-label {
    margin: 0;
  }
}

.flight-plan__link-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  font-size: 12px;
  color: #7ec8ff;
  border: none;
  background: transparent;
  cursor: pointer;
}

.flight-plan__segment {
  display: flex;
  gap: 6px;
  padding: 3px;
  border-radius: 4px;
  border: 1px solid rgba(48, 72, 104, 0.75);
  background: rgba(8, 24, 48, 0.55);
}

.flight-plan__segment-item {
  flex: 1;
  height: 32px;
  font-size: 13px;
  color: rgba(201, 215, 234, 0.85);
  border: 1px solid transparent;
  border-radius: 2px;
  background: transparent;
  cursor: pointer;

  &.is-active,
  &:hover {
    color: #7ec8ff;
    border-color: rgba(62, 140, 210, 0.55);
    background: rgba(10, 67, 141, 0.35);
  }
}

.flight-plan__list {
  flex: 1;
  min-height: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  overflow-y: auto;
}

.flight-plan__item {
  padding: 10px;
  margin-bottom: 8px;
  border: 1px solid rgba(48, 72, 104, 0.55);
  border-radius: 4px;
  background: linear-gradient(165deg, rgba(16, 52, 96, 0.55), rgba(8, 28, 52, 0.45));
  cursor: pointer;

  &.is-active,
  &:hover {
    border-color: rgba(88, 186, 241, 0.55);
  }
}

.flight-plan__item-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}

.flight-plan__item-name {
  min-width: 0;
  font-size: 13px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.flight-plan__badge {
  flex-shrink: 0;
  padding: 0 6px;
  font-size: 11px;
  line-height: 20px;
  border-radius: 2px;

  &.is-success {
    color: #7ec8ff;
    border: 1px solid rgba(126, 200, 255, 0.45);
  }

  &.is-warn {
    color: #ffb86c;
    border: 1px solid rgba(255, 184, 108, 0.45);
  }

  &.is-info {
    color: #c9d7ea;
    border: 1px solid rgba(201, 215, 234, 0.35);
  }

  &.is-danger {
    color: #ff8a8a;
    border: 1px solid rgba(255, 138, 138, 0.45);
  }
}

.flight-plan__item-meta {
  margin: 0;
  font-size: 11px;
  line-height: 1.5;
  color: rgba(190, 204, 220, 0.72);
}

.flight-plan__empty {
  padding: 36px 8px;
  text-align: center;
  color: rgba(255, 255, 255, 0.45);
  list-style: none;
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

<style lang="scss">
@import "./flight-plan-theme.scss";

/* 下拉 / 日期时间面板：全深色，杜绝白底 footer */
.ai-flight-plan-popper.el-popper {
  z-index: 2400 !important;
  background: rgba(6, 18, 36, 0.98) !important;
  border: 1px solid rgba(56, 98, 140, 0.65) !important;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.45) !important;

  .el-popper__arrow::before {
    background: rgba(6, 18, 36, 0.98) !important;
    border-color: rgba(56, 98, 140, 0.65) !important;
  }

  /* 覆盖 global .custom-select-popper 的灰字/渐变选中，保证深色面板可读 */
  .el-select-dropdown__wrap {
    background: rgba(6, 18, 36, 0.98) !important;
  }

  .el-select-dropdown__item {
    font-size: 13px;
    color: rgba(232, 241, 255, 0.92) !important;
    background: transparent !important;
  }

  .el-select-dropdown__item.is-hovering,
  .el-select-dropdown__item.hover,
  .el-select-dropdown__item:hover {
    background: rgba(28, 72, 110, 0.55) !important;
    color: #e8f2ff !important;
  }

  .el-select-dropdown__item.is-selected {
    color: #6ec4ff !important;
    font-weight: 600;
    background: rgba(52, 120, 168, 0.35) !important;
    -webkit-background-clip: unset !important;
    background-clip: unset !important;
  }

  .el-picker-panel,
  .el-picker-panel__body-wrapper,
  .el-picker-panel__body,
  .el-date-range-picker__content,
  .el-date-range-picker__time-header,
  .el-date-picker__header,
  .el-time-panel {
    background: rgba(6, 18, 36, 0.98) !important;
    border-color: rgba(56, 98, 140, 0.45) !important;
    color: rgba(232, 241, 255, 0.92) !important;
  }

  .el-picker-panel__footer,
  .el-picker-panel__shortcut {
    background: rgba(8, 24, 48, 0.98) !important;
    border-top: 1px solid rgba(56, 98, 140, 0.45) !important;
  }

  .el-picker-panel__footer .el-button,
  .el-picker-panel__link-btn {
    color: #6ec4ff !important;
    background: transparent !important;

    &.is-plain,
    &.el-button--primary {
      color: #e8f2ff !important;
      background: rgba(52, 120, 168, 0.55) !important;
      border-color: rgba(88, 186, 241, 0.45) !important;
    }
  }

  .el-date-table th,
  .el-date-picker__header-label,
  .el-picker-panel__icon-btn {
    color: rgba(190, 204, 220, 0.85) !important;
  }

  .el-date-table td.available .el-date-table-cell__text {
    color: rgba(220, 232, 248, 0.88);
  }

  .el-date-table td.today .el-date-table-cell__text {
    color: #6ec4ff;
  }

  .el-date-table td.current:not(.disabled) .el-date-table-cell__text {
    color: #e8f2ff !important;
    background: rgba(52, 120, 168, 0.85) !important;
  }

  .el-date-table td.in-range .el-date-table-cell {
    background: rgba(28, 72, 110, 0.35) !important;
  }

  .el-time-spinner__item {
    color: rgba(201, 215, 234, 0.85);

    &.is-active:not(.is-disabled) {
      color: #e8f2ff;
      font-weight: 600;
    }

    &:hover:not(.is-disabled):not(.is-active) {
      background: rgba(28, 72, 110, 0.45);
    }
  }

  .el-time-panel__footer {
    background: rgba(8, 24, 48, 0.98) !important;
    border-top: 1px solid rgba(56, 98, 140, 0.45) !important;
  }

  .el-input__wrapper {
    background: rgba(8, 28, 52, 0.96) !important;
    box-shadow: none !important;
    border: 1px solid rgba(56, 98, 140, 0.55) !important;
  }

  .el-input__inner {
    color: #e8f2ff !important;
  }
}

.ai-flight-plan-message-box {
  background: rgba(8, 24, 48, 0.98) !important;
  border: 1px solid rgba(56, 98, 140, 0.55);

  .el-message-box__title,
  .el-message-box__message {
    color: #e8f2ff;
  }
}
</style>
