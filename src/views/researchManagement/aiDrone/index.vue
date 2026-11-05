<script lang="ts" setup>
import axios from "axios"
import MapLayerManage from "@/components/Map/MapLayerManage.vue"
import MapPopup from "@/components/Map/MapPopup.vue"
import MapTool from "@/components/Map/MapTool.vue"
import PageTabs from "@/views/researchManagement/researchMonitoring/components/PageTabs.vue"
import useOlMap from "@/hooks/useOlMap"
import { danieUavApi } from "@/api/danieUav"
import { isDanieOk } from "@/utils/ai-drone/response"
import { parseWaylineFromZipBlob, computeWaylineStats, type WaylineStats } from "@/utils/ai-drone/wayline-stats"
import { AI_DRONE_KEY } from "./context"
import { useDroneLayers } from "./use-drone-layers"
import EventDetailDialog from "./components/EventDetailDialog.vue"
import WarnDetailDialog from "./components/WarnDetailDialog.vue"
import LiveStreamOverlay from "./components/LiveStreamOverlay.vue"
import Overlay from "ol/Overlay"
import type Point from "ol/geom/Point"
import VideoDialog from "./components/VideoDialog.vue"
import { useCssVariables } from "@/hooks/useCssVariables"
import {
  AI_DRONE_AI_ANALYSIS_RIGHT_WIDTH,
  AI_DRONE_AI_ANALYSIS_VIDEO_GAP,
  AI_DRONE_AI_ANALYSIS_VIDEO_HEIGHT,
  AI_DRONE_BOARD_WIDTH,
  AI_DRONE_AI_ANALYSIS_DEVICE_RAIL_WIDTH,
  AI_DRONE_AI_ANALYSIS_LEGEND_DEVICE_GAP,
  AI_DRONE_AI_ANALYSIS_LEGEND_WIDTH,
  AI_DRONE_AI_ANALYSIS_MAP_OVERLAY_TOP,
  AI_DRONE_AI_ANALYSIS_OVERLAY_GAP,
  AI_DRONE_PANEL_EDGE_INSET,
  AI_DRONE_EVENT_WARNING_BOTTOM_HEIGHT,
  AI_DRONE_EVENT_WARNING_EVENT_WIDTH,
  AI_DRONE_EVENT_WARNING_PANEL_GAP,
  AI_DRONE_EVENT_WARNING_STATS_WIDTH,
  AI_DRONE_FLIGHT_PLAN_PANEL_WIDTH,
  AI_DRONE_ONE_MAP_CAPTURE_GAP,
  AI_DRONE_ONE_MAP_CAPTURE_HEIGHT,
  AI_DRONE_TABS_OFFSET,
  AI_DRONE_WAYLINE_STATS_EDGE_GAP,
  AI_DRONE_MAP_TOP_CHROME,
  AI_DRONE_LIVE_VIEW_FOCUS_BIAS_Y,
  getAiAnalysisBottomMapInset,
  getAiAnalysisLeftMapInset,
  getAiAnalysisRightMapInset,
  resolveAiDroneMapInitialView
} from "./constants"

/**
 * AI 无人机外壳
 * 地图与巡护概况相同，四个子路由只切换两侧面板
 */
defineOptions({
  name: "AiDrone"
})

const popup = ref<any>(null)
const modular = "巡护概况"
const route = useRoute()
const aiDroneMapBootView = resolveAiDroneMapInitialView(route.path)
const { closePopup, popupInfo, map, addLayerManageData, removeLayerManageData } = useOlMap(popup, {
  center: aiDroneMapBootView.center,
  zoom: aiDroneMapBootView.zoom,
  modular,
  overlayOffset: [0, -70],
  overlayPositioning: "bottom-center"
})

const { setDrones, focusSnap, showWayline, clearWayline } = useDroneLayers(map)
const devices = ref<Record<string, unknown>[]>([])
const waylineStats = ref<WaylineStats | null>(null)
const refreshTick = ref(0)
const eventDetail = ref<Record<string, unknown> | null>(null)
const warnDetail = ref<Record<string, unknown> | null>(null)
const liveDevice = ref<Record<string, unknown> | null>(null)
const liveStreamRef = ref<InstanceType<typeof LiveStreamOverlay> | null>(null)
let liveStreamOverlay: Overlay | null = null
const videoInfo = ref<Record<string, unknown> | null>(null)

const { setVariable, removeVariable } = useCssVariables()
let droneTimer = 0

/** 一张图有底部抓拍条：左侧菜单与地图工具条按剩余高度适配 */
const isAiAnalysisPage = computed(() => route.path.includes("/aiAnalysis"))
const isEventWarningPage = computed(() => route.path.includes("/eventWarning"))
const isFlightPlanPage = computed(() => route.path.includes("/flightPlan"))

function syncOneMapLayoutVars() {
  const onOneMap = route.path.includes("/oneMap")
  const onAiAnalysis = route.path.includes("/aiAnalysis")
  const onEventWarning = route.path.includes("/eventWarning")
  const onFlightPlan = route.path.includes("/flightPlan")
  const aiVideoReserve = AI_DRONE_AI_ANALYSIS_VIDEO_HEIGHT + AI_DRONE_AI_ANALYSIS_VIDEO_GAP
  const eventWarningBottomReserve = AI_DRONE_EVENT_WARNING_BOTTOM_HEIGHT + AI_DRONE_EVENT_WARNING_PANEL_GAP
  /* 右：预警事件 + 统计列；底栏「类型分析」贴屏幕最左 */
  const eventWarningRightStack =
    AI_DRONE_EVENT_WARNING_STATS_WIDTH + AI_DRONE_EVENT_WARNING_EVENT_WIDTH + AI_DRONE_EVENT_WARNING_PANEL_GAP + 20
  const bottomReserve = onOneMap
    ? `${AI_DRONE_ONE_MAP_CAPTURE_HEIGHT + AI_DRONE_ONE_MAP_CAPTURE_GAP}px`
    : onAiAnalysis
      ? `${aiVideoReserve}px`
      : onEventWarning
        ? `${eventWarningBottomReserve}px`
        : "0px"
  setVariable("ai-drone-bottom-reserve", bottomReserve)
  const boardRight = onAiAnalysis
    ? AI_DRONE_AI_ANALYSIS_RIGHT_WIDTH
    : onEventWarning
      ? eventWarningRightStack
      : onFlightPlan
        ? AI_DRONE_FLIGHT_PLAN_PANEL_WIDTH
        : AI_DRONE_BOARD_WIDTH
  setVariable("maptool-sidebar-right", `calc(${boardRight}px + 28px)`)
  setVariable(
    "maptool-sidebar-bottom",
    onOneMap
      ? `calc(${AI_DRONE_ONE_MAP_CAPTURE_HEIGHT}px + ${AI_DRONE_ONE_MAP_CAPTURE_GAP + 18}px)`
      : onAiAnalysis
        ? `calc(${aiVideoReserve}px + 18px)`
        : onEventWarning
          ? `calc(${eventWarningBottomReserve}px + 18px)`
          : "20px"
  )
  if (onEventWarning) {
    setVariable("event-warning-right-stack", `${eventWarningRightStack}px`)
  } else {
    removeVariable("event-warning-right-stack")
  }
  // AI 分析：图例靠右，设备栏在图例左侧（right 由图例宽 + 间距推算）
  if (onAiAnalysis) {
    setVariable(
      "ai-drone-overlay-right",
      `calc(${AI_DRONE_AI_ANALYSIS_RIGHT_WIDTH}px + ${AI_DRONE_PANEL_EDGE_INSET}px + ${AI_DRONE_AI_ANALYSIS_OVERLAY_GAP}px)`
    )
    setVariable("ai-drone-legend-top", `${AI_DRONE_AI_ANALYSIS_MAP_OVERLAY_TOP}px`)
    setVariable("ai-drone-legend-width", `${AI_DRONE_AI_ANALYSIS_LEGEND_WIDTH}px`)
    setVariable("ai-drone-legend-device-gap", `${AI_DRONE_AI_ANALYSIS_LEGEND_DEVICE_GAP}px`)
    setVariable("ai-drone-device-rail-width", `${AI_DRONE_AI_ANALYSIS_DEVICE_RAIL_WIDTH}px`)
    setVariable(
      "ai-drone-device-rail-right",
      `calc(${AI_DRONE_AI_ANALYSIS_RIGHT_WIDTH}px + ${AI_DRONE_PANEL_EDGE_INSET}px + ${AI_DRONE_AI_ANALYSIS_OVERLAY_GAP}px + ${AI_DRONE_AI_ANALYSIS_LEGEND_WIDTH}px + ${AI_DRONE_AI_ANALYSIS_LEGEND_DEVICE_GAP}px)`
    )
  } else if (onEventWarning) {
    // 事件预警：图例贴「预警事件」列左缘（与右侧双列看板对齐）
    setVariable("ai-drone-overlay-right", `calc(${eventWarningRightStack}px + ${AI_DRONE_AI_ANALYSIS_OVERLAY_GAP}px)`)
    setVariable("ai-drone-legend-top", `${AI_DRONE_AI_ANALYSIS_MAP_OVERLAY_TOP}px`)
    removeVariable("ai-drone-legend-width")
    removeVariable("ai-drone-legend-device-gap")
    removeVariable("ai-drone-device-rail-width")
    removeVariable("ai-drone-device-rail-right")
  } else if (onFlightPlan) {
    // 航飞计划：图例与计划库左缘保留 overlay 间距（含看板 right:10px）
    const flightPlanOverlayRight = `calc(${AI_DRONE_FLIGHT_PLAN_PANEL_WIDTH}px + ${AI_DRONE_PANEL_EDGE_INSET}px + ${AI_DRONE_AI_ANALYSIS_OVERLAY_GAP}px)`
    setVariable("ai-drone-overlay-right", flightPlanOverlayRight)
    setVariable("ai-drone-legend-top", `${AI_DRONE_AI_ANALYSIS_MAP_OVERLAY_TOP}px`)
    // 航线统计：地图区顶部水平居中（Tab 与计划库之间）
    setVariable("ai-drone-wayline-stats-left", `calc(${AI_DRONE_TABS_OFFSET}px + ${AI_DRONE_WAYLINE_STATS_EDGE_GAP}px)`)
    setVariable("ai-drone-wayline-stats-right", flightPlanOverlayRight)
    setVariable("ai-drone-wayline-stats-top", `${AI_DRONE_AI_ANALYSIS_MAP_OVERLAY_TOP}px`)
    removeVariable("ai-drone-legend-width")
    removeVariable("ai-drone-legend-device-gap")
    removeVariable("ai-drone-device-rail-width")
    removeVariable("ai-drone-device-rail-right")
  } else {
    removeVariable("ai-drone-overlay-right")
    removeVariable("ai-drone-legend-top")
    removeVariable("ai-drone-wayline-stats-left")
    removeVariable("ai-drone-wayline-stats-right")
    removeVariable("ai-drone-wayline-stats-top")
    removeVariable("ai-drone-legend-width")
    removeVariable("ai-drone-legend-device-gap")
    removeVariable("ai-drone-device-rail-width")
    removeVariable("ai-drone-device-rail-right")
  }
}

watch(() => route.path, syncOneMapLayoutVars, { immediate: true })

/** 切换子页时恢复该页登记的地图 center / zoom */
function applyAiDroneMapInitialView() {
  const olMap = map.value
  if (!olMap) return
  const { center, zoom } = resolveAiDroneMapInitialView(route.path)
  olMap.getView().animate({ center, zoom, duration: 320 })
}

watch(
  [map, () => route.path],
  ([olMap]) => {
    if (!olMap) return
    applyAiDroneMapInitialView()
  },
  { immediate: true }
)

/** 拉取无人机位置并画点，不移动保护区视野 */
async function loadDrones() {
  try {
    const res = (await danieUavApi.GetDroneLastPosition({})) as {
      success?: boolean
      response?: Record<string, unknown>[]
    }
    if (!isDanieOk(res) || !Array.isArray(res.response)) return
    devices.value = res.response.map((item) => ({
      ...item,
      status: item.is_fly ? "use" : "on"
    }))
    setDrones(devices.value)
  } catch (error) {
    console.error("无人机位置加载失败", error)
  }
}

function openEventDetail(item: Record<string, unknown>) {
  eventDetail.value = item
}
function openWarnDetail(item: Record<string, unknown>) {
  warnDetail.value = item
}
/** 解析 WGS84 经纬度（与 useOlMap 默认 EPSG:4326 一致，勿用 fromLonLat） */
function readDroneCoordinate(item: Record<string, unknown>): [number, number] | null {
  const lon = Number(item.longitude ?? item.lon ?? item.lng)
  const lat = Number(item.latitude ?? item.lat)
  if (!Number.isFinite(lon) || !Number.isFinite(lat) || lon === 0 || lat === 0) return null
  return [lon, lat]
}

/** 各子页地图可浏览区四边留白（主视野在扣除浮层后的偏左上方） */
function getLiveMapViewportInsets(): { left: number; right: number; top: number; bottom: number } {
  const path = route.path
  const edge = AI_DRONE_PANEL_EDGE_INSET
  const oneMapBottom = AI_DRONE_ONE_MAP_CAPTURE_HEIGHT + AI_DRONE_ONE_MAP_CAPTURE_GAP + edge
  const eventBottom = AI_DRONE_EVENT_WARNING_BOTTOM_HEIGHT + AI_DRONE_EVENT_WARNING_PANEL_GAP + edge
  const eventRightStack =
    AI_DRONE_EVENT_WARNING_STATS_WIDTH + AI_DRONE_EVENT_WARNING_EVENT_WIDTH + AI_DRONE_EVENT_WARNING_PANEL_GAP + 20
  const flightPlanRight =
    AI_DRONE_FLIGHT_PLAN_PANEL_WIDTH + edge + AI_DRONE_AI_ANALYSIS_OVERLAY_GAP + AI_DRONE_AI_ANALYSIS_LEGEND_WIDTH

  if (path.includes("/aiAnalysis")) {
    return {
      left: getAiAnalysisLeftMapInset(),
      right: getAiAnalysisRightMapInset(),
      top: AI_DRONE_AI_ANALYSIS_MAP_OVERLAY_TOP + AI_DRONE_MAP_TOP_CHROME,
      bottom: getAiAnalysisBottomMapInset()
    }
  }
  if (path.includes("/oneMap")) {
    return {
      left: getAiAnalysisLeftMapInset(),
      right: AI_DRONE_BOARD_WIDTH + edge,
      top: AI_DRONE_AI_ANALYSIS_MAP_OVERLAY_TOP + AI_DRONE_MAP_TOP_CHROME,
      bottom: oneMapBottom
    }
  }
  if (path.includes("/eventWarning")) {
    return {
      left: getAiAnalysisLeftMapInset(),
      right: eventRightStack + AI_DRONE_AI_ANALYSIS_OVERLAY_GAP,
      top: AI_DRONE_AI_ANALYSIS_MAP_OVERLAY_TOP + AI_DRONE_MAP_TOP_CHROME,
      bottom: eventBottom
    }
  }
  if (path.includes("/flightPlan")) {
    return {
      left: getAiAnalysisLeftMapInset(),
      right: flightPlanRight,
      top: AI_DRONE_AI_ANALYSIS_MAP_OVERLAY_TOP + AI_DRONE_MAP_TOP_CHROME,
      bottom: edge
    }
  }
  return {
    left: edge,
    right: edge,
    top: AI_DRONE_AI_ANALYSIS_MAP_OVERLAY_TOP + AI_DRONE_MAP_TOP_CHROME,
    bottom: edge
  }
}

/** 设备点位应对准的可视区中心像素（弹框仍绑在机位坐标） */
function getLiveViewFocusPixel(size: [number, number]): [number, number] {
  const [w, h] = size
  const { left, right, top, bottom } = getLiveMapViewportInsets()
  const innerW = Math.max(160, w - left - right)
  const innerH = Math.max(160, h - top - bottom)
  const centerY = top + innerH / 2 + AI_DRONE_LIVE_VIEW_FOCUS_BIAS_Y
  const maxY = h - bottom - 24
  return [left + innerW / 2, Math.min(centerY, maxY)]
}

/** 以机位为基准平移：该坐标落在可视区中心（OpenLayers View#centerOn） */
function panMapToLiveDevice(coordinate: [number, number]) {
  const olMap = map.value
  if (!olMap) return
  const view = olMap.getView()
  const size = olMap.getSize()
  if (!size || size[0] <= 0 || size[1] <= 0) return

  const focusPixel = getLiveViewFocusPixel([size[0], size[1]])
  const beforeCenter = view.getCenter()
  if (!beforeCenter) return

  view.centerOn(coordinate, size, focusPixel)
  const targetCenter = view.getCenter()
  view.setCenter(beforeCenter)
  if (!targetCenter) return
  view.animate({ center: targetCenter, duration: 320 })
}

function ensureLiveOverlay() {
  if (!map.value || liveStreamOverlay || !liveStreamRef.value?.$el) return
  liveStreamOverlay = new Overlay({
    element: liveStreamRef.value.$el as HTMLElement,
    positioning: "bottom-center",
    offset: [0, -36],
    stopEvent: true,
    autoPan: false
  })
  map.value.addOverlay(liveStreamOverlay)
}

function openLive(item: Record<string, unknown>, mapCoordinate?: number[]) {
  const coordinate =
    mapCoordinate && mapCoordinate.length >= 2
      ? ([mapCoordinate[0], mapCoordinate[1]] as [number, number])
      : readDroneCoordinate(item)
  if (!coordinate) {
    ElMessage.warning("暂无无人机位置，无法在地图上打开视频窗")
    return
  }
  closePopup()
  liveDevice.value = item
  nextTick(() => {
    ensureLiveOverlay()
    panMapToLiveDevice(coordinate)
    liveStreamOverlay?.setPosition(coordinate)
  })
}

function closeLive() {
  liveDevice.value = null
  liveStreamOverlay?.setPosition(undefined)
}
function openVideo(item: Record<string, unknown>) {
  videoInfo.value = item
}

/** 选中航线后下载 kmz 并画到地图上（对齐大鲵 showHX） */
async function drawWaylineByUrl(downloadUrl?: string) {
  if (!downloadUrl) {
    clearWayline()
    waylineStats.value = null
    return
  }
  try {
    const res = await axios.get<Blob>(downloadUrl, { responseType: "blob" })
    const waypoints = await parseWaylineFromZipBlob(res.data)
    waylineStats.value = computeWaylineStats(waypoints)
    showWayline(waypoints)
  } catch (error) {
    console.error("航线下载或解析失败", error)
    clearWayline()
    waylineStats.value = null
    ElMessage.error("航线预览失败")
  }
}

provide(AI_DRONE_KEY, {
  devices,
  waylineStats,
  refreshTick,
  openEventDetail,
  openWarnDetail,
  openLive,
  openVideo,
  focusSnap,
  showWayline,
  loadWaylineUrl: drawWaylineByUrl,
  clearWayline: () => {
    clearWayline()
    waylineStats.value = null
  }
})

/** 临时调试：点击地图时在控制台输出当前 center + zoom（确认视野后可删除） */
function logMapViewOnClick() {
  const olMap = map.value
  if (!olMap) return
  const view = olMap.getView()
  const center = view.getCenter()
  const zoom = view.getZoom()
  if (!center || zoom == null) return
  const [lon, lat] = center
  console.info("[AI无人机地图] center + zoom", {
    center: [lon, lat],
    centerLon: lon,
    centerLat: lat,
    zoom
  })
  console.info(`[AI无人机地图] center: [${lon}, ${lat}], zoom: ${zoom}`)
}

function onMapClick(event: { pixel: number[] }) {
  if (!map.value) return
  logMapViewOnClick()
  const feature = map.value.forEachFeatureAtPixel(event.pixel, (item) => item)
  const kind = feature?.get("aiKind")
  const payload = feature?.get("payload") as Record<string, unknown> | undefined
  if (kind === "drone" && payload) {
    const geometry = feature?.getGeometry() as Point | undefined
    openLive(payload, geometry?.getCoordinates())
  }
  if (kind === "snap" && payload) openEventDetail(payload)
}

watch(map, (value, _, onCleanup) => {
  if (!value) return
  value.on("click", onMapClick)
  nextTick(() => ensureLiveOverlay())
  onCleanup(() => {
    value.un("click", onMapClick)
    if (liveStreamOverlay) {
      value.removeOverlay(liveStreamOverlay)
      liveStreamOverlay = null
    }
  })
})

function onRefresh() {
  refreshTick.value += 1
}

/** 大鲵 dev 5178 对 djicdn 的 xhr 常不带 Referer；4173 会带 Referer 触发 CDN ACL */
let savedReferrerContent: string | null = null

function applyNoReferrerPolicy() {
  const existing = document.querySelector<HTMLMetaElement>('meta[name="referrer"]')
  if (existing) {
    savedReferrerContent = existing.getAttribute("content")
    existing.setAttribute("content", "no-referrer")
    existing.dataset.aiDroneReferrerPolicy = "patched"
    return
  }
  const meta = document.createElement("meta")
  meta.name = "referrer"
  meta.content = "no-referrer"
  meta.dataset.aiDroneReferrerPolicy = "added"
  document.head.appendChild(meta)
}

function restoreReferrerPolicy() {
  const patched = document.querySelector<HTMLMetaElement>(
    'meta[name="referrer"][data-ai-drone-referrer-policy="patched"]'
  )
  if (patched) {
    if (savedReferrerContent != null) {
      patched.setAttribute("content", savedReferrerContent)
    }
    delete patched.dataset.aiDroneReferrerPolicy
    savedReferrerContent = null
    return
  }
  const added = document.querySelector<HTMLMetaElement>('meta[name="referrer"][data-ai-drone-referrer-policy="added"]')
  added?.remove()
}

onMounted(() => {
  applyNoReferrerPolicy()
  syncOneMapLayoutVars()
  loadDrones()
  droneTimer = window.setInterval(loadDrones, 10000)
  nextTick(() => ensureLiveOverlay())
})

onBeforeUnmount(() => {
  restoreReferrerPolicy()
  window.clearInterval(droneTimer)
  removeVariable("ai-drone-bottom-reserve")
})
</script>

<template>
  <div
    class="ai-drone relative h-full"
    :class="{
      'ai-drone--ai-analysis': isAiAnalysisPage,
      'ai-drone--event-warning': isEventWarningPage,
      'ai-drone--flight-plan': isFlightPlanPage
    }"
  >
    <div
      id="map"
      class="map-box"
    />
    <!-- 与巡护概况等页面一致：section-bar 固定 32px 高度，图例标题与边框样式才统一 -->
    <div class="section-bar">
      <MapLayerManage
        :modular="modular"
        :layer-names="['保护区界线']"
        :init-checked-keys="[35]"
        @add-layer="addLayerManageData"
        @remove-layer="removeLayerManageData"
      />
    </div>
    <MapPopup
      ref="popup"
      :info="popupInfo"
      @close="closePopup"
    />
    <MapTool
      v-if="map"
      :map="map"
      :hidden-tools="['toggleSidebar']"
    />
    <PageTabs class="pages-tabs" />
    <div
      v-if="waylineStats"
      class="wayline-stats"
    >
      <div class="wayline-stats__pill">
        <span class="wayline-stats__item">
          节点数量：<em>{{ waylineStats.nodeCount }}</em>
        </span>
        <span
          class="wayline-stats__divider"
          aria-hidden="true"
        />
        <span class="wayline-stats__item">
          航线长度：<em>{{ waylineStats.lengthLabel }}</em>
        </span>
      </div>
    </div>
    <router-view />

    <EventDetailDialog
      :detail="eventDetail"
      @close="eventDetail = null"
      @saved="onRefresh"
    />
    <WarnDetailDialog
      :detail="warnDetail"
      @close="warnDetail = null"
      @saved="onRefresh"
    />
    <LiveStreamOverlay
      ref="liveStreamRef"
      :device="liveDevice"
      @close="closeLive"
    />
    <VideoDialog
      :info="videoInfo"
      @close="videoInfo = null"
    />
  </div>
</template>

<style scoped lang="scss">
.ai-drone {
  height: 100%;
  color: #fff;
  font-size: 14px;
  .map-box {
    position: absolute;
    inset: 0;
  }
  .section-bar {
    position: absolute;
    top: 20px;
    right: var(--maptool-sidebar-right);
    display: flex;
    gap: 15px;
    height: 32px;
    z-index: 12;
    transition: all 0.3s ease-in-out;
  }
  .pages-tabs {
    position: absolute;
    left: 10px;
    /* 在扣除底部抓拍条后的剩余高度内垂直居中 */
    top: calc((100% - var(--ai-drone-bottom-reserve, 0px)) / 2);
    z-index: 12;
    transform: translateY(-50%);
  }
  .wayline-stats {
    position: absolute;
    z-index: 12;
    top: var(--ai-drone-wayline-stats-top, 16px);
    left: var(--ai-drone-wayline-stats-left, 220px);
    right: var(--ai-drone-wayline-stats-right, auto);
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    padding: 0;
    border: none;
    background: transparent;
  }

  .wayline-stats__pill {
    display: inline-flex;
    align-items: center;
    gap: 14px;
    max-width: 100%;
    padding: 6px 16px;
    font-size: 13px;
    line-height: 1.25;
    color: rgba(190, 204, 220, 0.9);
    white-space: nowrap;
    border: 1px solid rgba(88, 186, 241, 0.35);
    border-radius: 6px;
    background: rgba(8, 24, 48, 0.88);
    box-shadow: 0 0 12px rgba(52, 120, 168, 0.2);
  }

  .wayline-stats__item em {
    font-style: normal;
    font-weight: 600;
    color: #7ec8ff;
  }

  .wayline-stats__divider {
    width: 1px;
    height: 14px;
    background: rgba(88, 186, 241, 0.35);
  }

  /* AI 分析 / 事件预警：图例贴右侧看板左缘，顶对齐 section-bar */
  &.ai-drone--ai-analysis,
  &.ai-drone--event-warning,
  &.ai-drone--flight-plan {
    .section-bar {
      top: var(--ai-drone-legend-top, 18px);
      right: var(--ai-drone-overlay-right, calc(420px + 12px));
      left: auto;
      width: auto;
      justify-content: flex-end;
    }
  }

  &.ai-drone--event-warning {
    .section-bar {
      /* 双列宽度：统计 + 预警事件 + 间距 + 边距，与 syncOneMapLayoutVars 一致 */
      right: var(--ai-drone-overlay-right, calc(var(--event-warning-right-stack, 750px) + 12px));
    }
  }
}
</style>
