<script lang="ts" setup>
/**
 * 无人机实时画面 — 地图 Overlay 小窗 + 全屏地图模式（左轨迹地图、右视频流）
 */
import DroneMonitorMapModeOverlay from "./DroneMonitorMapModeOverlay.vue"
import DroneLiveFlightControlBar from "./DroneLiveFlightControlBar.vue"
import { useUavFlightControls } from "@/composables/use-uav-flight-controls"
import {
  buildLiveCaptureFileName,
  canvasToJpegBlob,
  downloadBlobAsFile
} from "@/utils/ai-drone/download-live-capture"

interface Props {
  device: Record<string, unknown> | null
  projectUuid?: string
  airportSn?: string
  droneProjectList?: Record<string, unknown>[]
}

const props = withDefaults(defineProps<Props>(), {
  projectUuid: "",
  airportSn: "",
  droneProjectList: () => []
})

const emit = defineEmits<{
  close: []
  "map-mode-change": [inMapMode: boolean]
}>()

const overlayAnchorEl = ref<HTMLElement | null>(null)
const videoMapInnerRef = ref<HTMLDivElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const canvasMapRef = ref<HTMLCanvasElement | null>(null)
let canvasResizeObserver: ResizeObserver | null = null

const mapMode = ref(false)
const isConnected = ref(false)
const hasFrames = ref(false)
const statusText = ref("等待连接")

let socket: WebSocket | null = null
let canvasContext: CanvasRenderingContext2D | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let reconnectAttempts = 0
let closingIntentionally = false
let isConnecting = false
/** 每次停止/重连自增，作废未完成的 Image 解码与旧 WS 回调（对齐诊断页） */
let playbackEpoch = 0
let framePipelineBusy = false
let queuedFrameBlob: Blob | null = null
const MAX_RECONNECT_ATTEMPTS = 3
/** 最近一次 WS 原始 JPEG，抓拍默认下载此 Blob */
let lastRawFrameBlob: Blob | null = null
const CAPTURE_COOLDOWN_MS = 600
let lastCaptureAt = 0
const captureLoading = ref(false)

const deviceName = computed(() => String(props.device?.device_name || props.device?.name || "无人机视频流"))
const deviceSn = computed(() => String(props.device?.device_sn || props.device?.sn || ""))
const effectiveAirportSn = computed(
  () => props.airportSn || String(props.device?.airport_sn || props.device?.airportSn || "")
)
const effectiveProjectUuid = computed(() => props.projectUuid || String(props.device?.projectUuid || ""))

/** 仅起飞后可拉流、可进地图模式 */
const canEnterMapMode = computed(() => Boolean(props.device?.is_fly))
const canStream = canEnterMapMode
/** 起飞中即展示抓拍；与司空返航条解耦 */
const showCaptureButton = computed(() => !!props.device && canStream.value)

const {
  showFlightControlBar,
  returnToggleLabel,
  pauseToggleLabel,
  flightControlToggleButtons,
  loadingFlightToggle,
  handleFlightToggle,
  disposeControls
} = useUavFlightControls({
  airportSn: () => effectiveAirportSn.value,
  deviceSn: () => deviceSn.value,
  projectUuid: () => effectiveProjectUuid.value,
  isFlying: () => Boolean(props.device?.is_fly),
  enabled: () => !!props.device
})

function getOverlayAnchorEl(): HTMLElement | null {
  const el = overlayAnchorEl.value
  return el instanceof HTMLElement ? el : null
}

defineExpose({ getOverlayAnchorEl })

function activeVideoCanvas() {
  return mapMode.value ? canvasMapRef.value : canvasRef.value
}

/** 按播放区域像素尺寸设置 canvas，避免 CSS 缩放造成黑边 */
function initCanvas() {
  const canvas = activeVideoCanvas()
  if (!canvas) return
  canvasContext = canvas.getContext("2d")
  const parent = canvas.parentElement
  // clientWidth/Height 扣除 padding，与四至 20px 留白一致
  const w = Math.max(320, Math.floor(parent?.clientWidth || 960))
  const h = Math.max(180, Math.floor(parent?.clientHeight || 540))
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w
    canvas.height = h
  }
}

function bindCanvasResizeObserver() {
  canvasResizeObserver?.disconnect()
  const host = mapMode.value ? videoMapInnerRef.value : canvasRef.value?.parentElement
  if (!host) return
  canvasResizeObserver = new ResizeObserver(() => {
    initCanvas()
  })
  canvasResizeObserver.observe(host)
}

function refreshCanvasAfterLayout() {
  nextTick(() => {
    initCanvas()
    bindCanvasResizeObserver()
    requestAnimationFrame(() => initCanvas())
  })
}

/** 卸载旧 WebSocket，避免 close 过程中仍触发 onmessage */
function teardownSocket(ws: WebSocket | null) {
  if (!ws) return
  ws.onopen = null
  ws.onmessage = null
  ws.onerror = null
  ws.onclose = null
  try {
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close()
    }
  } catch {
    /* 忽略关闭异常 */
  }
}

function resetFramePipeline() {
  framePipelineBusy = false
  queuedFrameBlob = null
}

/** 停止拉流并作废未完成帧（关闭 popup、切换设备、组件卸载） */
function stopStream() {
  closingIntentionally = true
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  const ws = socket
  socket = null
  teardownSocket(ws)
  isConnected.value = false
  isConnecting = false
  reconnectAttempts = 0
  playbackEpoch++
  resetFramePipeline()
  resetCaptureCache()
  hasFrames.value = false
}

function closeSocket() {
  stopStream()
}

function paintFrameToCanvas(image: HTMLImageElement) {
  initCanvas()
  const canvas = activeVideoCanvas()
  if (!canvas) return
  const ctx = canvas.getContext("2d")
  if (!ctx) return
  canvasContext = ctx
  const scaleX = canvas.width / image.width
  const scaleY = canvas.height / image.height
  // 地图模式铺满可视区；小窗保持完整画面
  const scale = mapMode.value ? Math.max(scaleX, scaleY) : Math.min(scaleX, scaleY)
  const width = image.width * scale
  const height = image.height * scale
  const x = (canvas.width - width) / 2
  const y = (canvas.height - height) / 2
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = "#061018"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(image, x, y, width, height)
  hasFrames.value = true
}

function flushQueuedFrame(epoch: number) {
  if (!props.device || epoch !== playbackEpoch || !queuedFrameBlob) return
  const next = queuedFrameBlob
  queuedFrameBlob = null
  enqueueFrameDecode(next, epoch)
}

function enqueueFrameDecode(blob: Blob, epoch: number) {
  if (!props.device || epoch !== playbackEpoch) return
  if (framePipelineBusy) {
    queuedFrameBlob = blob
    return
  }
  framePipelineBusy = true
  lastRawFrameBlob = blob
  const url = URL.createObjectURL(blob)
  const image = new Image()
  image.onload = () => {
    framePipelineBusy = false
    if (!props.device || epoch !== playbackEpoch) {
      URL.revokeObjectURL(url)
      flushQueuedFrame(epoch)
      return
    }
    paintFrameToCanvas(image)
    URL.revokeObjectURL(url)
    flushQueuedFrame(epoch)
  }
  image.onerror = () => {
    framePipelineBusy = false
    URL.revokeObjectURL(url)
    flushQueuedFrame(epoch)
  }
  image.src = url
}

function handleSocketMessage(event: MessageEvent, epoch: number) {
  if (!props.device || epoch !== playbackEpoch) return
  enqueueFrameDecode(new Blob([event.data], { type: "image/jpeg" }), epoch)
}

function scheduleReconnect() {
  if (!props.device || !canStream.value) return
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    statusText.value = "重连次数已达上限"
    return
  }
  reconnectAttempts++
  statusText.value = `正在重连... (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`
  reconnectTimer = setTimeout(() => {
    connect()
  }, 2000 * reconnectAttempts)
}

async function handleCaptureFrame() {
  if (!hasFrames.value) {
    ElMessage.warning("暂无画面，请稍后再试")
    return
  }
  const now = Date.now()
  if (captureLoading.value) return
  if (now - lastCaptureAt < CAPTURE_COOLDOWN_MS) {
    ElMessage.warning("操作过快，请稍后再抓拍")
    return
  }

  captureLoading.value = true
  try {
    let blob: Blob | null = lastRawFrameBlob
    // 优先原始帧；极短窗口内无缓存时再导出 canvas
    if (!blob) {
      const canvas = activeVideoCanvas()
      if (canvas) {
        blob = await canvasToJpegBlob(canvas)
      }
    }
    if (!blob) {
      ElMessage.warning("暂无画面，请稍后再试")
      return
    }
    const fileName = buildLiveCaptureFileName(deviceName.value, deviceSn.value)
    downloadBlobAsFile(blob, fileName)
    lastCaptureAt = now
    ElMessage.success("抓拍已下载")
  } catch (error) {
    console.error("直播抓拍下载失败:", error)
    ElMessage.error("抓拍失败，请重试")
  } finally {
    captureLoading.value = false
  }
}

function resetCaptureCache() {
  lastRawFrameBlob = null
  lastCaptureAt = 0
}

function connect() {
  if (socket || isConnecting) return
  closingIntentionally = false
  playbackEpoch++
  const epoch = playbackEpoch
  resetFramePipeline()
  hasFrames.value = false
  resetCaptureCache()
  if (!deviceSn.value || !canStream.value) {
    statusText.value = "无人机未起飞，暂无视频流"
    return
  }
  statusText.value = "正在连接视频流..."
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
  const url = `${protocol}//183.162.224.56:8770/stream/${deviceSn.value}`
  isConnecting = true
  const ws = new WebSocket(url)
  socket = ws
  ws.binaryType = "blob"
  ws.onopen = () => {
    if (ws !== socket || epoch !== playbackEpoch) return
    isConnecting = false
    isConnected.value = true
    reconnectAttempts = 0
    statusText.value = "视频流已连接"
    initCanvas()
  }
  ws.onerror = () => {
    if (ws !== socket) return
    if (!hasFrames.value) statusText.value = "视频流连接失败"
  }
  ws.onmessage = (event) => {
    if (ws !== socket) return
    handleSocketMessage(event, epoch)
  }
  ws.onclose = () => {
    if (ws === socket) socket = null
    isConnecting = false
    isConnected.value = false
    if (props.device && canStream.value && epoch === playbackEpoch && !closingIntentionally) {
      scheduleReconnect()
    }
  }
}

function enterMapMode() {
  if (!canEnterMapMode.value) return
  mapMode.value = true
  emit("map-mode-change", true)
  refreshCanvasAfterLayout()
}

function exitMapMode() {
  mapMode.value = false
  emit("map-mode-change", false)
  refreshCanvasAfterLayout()
}

function handleCloseFromMapMode() {
  mapMode.value = false
  emit("map-mode-change", false)
  handleClose()
}

function handleClose() {
  mapMode.value = false
  emit("map-mode-change", false)
  disposeControls()
  closeSocket()
  emit("close")
}

/** 地图模式时标记 body，供 MessageBox 遮罩 z-index 全局样式生效 */
const BODY_MAP_MODE_CLASS = "ai-drone-map-mode-active"

function syncBodyMapModeClass(active: boolean) {
  document.body.classList.toggle(BODY_MAP_MODE_CLASS, active)
}

watch(mapMode, (active) => syncBodyMapModeClass(active), { immediate: true })

watch(
  () => props.device,
  (value) => {
    if (value) {
      mapMode.value = false
      nextTick(() => {
        closeSocket()
        refreshCanvasAfterLayout()
        connect()
      })
    } else {
      disposeControls()
      stopStream()
      mapMode.value = false
    }
  }
)

onBeforeUnmount(() => {
  syncBodyMapModeClass(false)
  canvasResizeObserver?.disconnect()
  canvasResizeObserver = null
  disposeControls()
  closeSocket()
})
</script>

<template>
  <DroneMonitorMapModeOverlay
    v-model="mapMode"
    :title="deviceName"
    :device-sn="deviceSn"
    :airport-sn="effectiveAirportSn"
    :project-uuid="effectiveProjectUuid"
    :drone-project-list="droneProjectList"
    @back="exitMapMode"
    @close="handleCloseFromMapMode"
  >
    <template #video>
      <div
        ref="videoMapInnerRef"
        class="drone-monitor-map-mode__video-inner"
      >
        <DroneLiveFlightControlBar
          :visible="showFlightControlBar"
          :show-capture="showCaptureButton"
          :capture-disabled="!hasFrames"
          :capture-loading="captureLoading"
          :return-toggle-label="returnToggleLabel"
          :pause-toggle-label="pauseToggleLabel"
          :flight-control-toggle-buttons="flightControlToggleButtons"
          :loading-flight-toggle="loadingFlightToggle"
          @toggle="handleFlightToggle"
          @capture="handleCaptureFrame"
        />
        <canvas
          ref="canvasMapRef"
          class="drone-live-pop__canvas"
        />
        <div
          v-if="!hasFrames"
          class="drone-live-pop__status"
        >
          <span
            v-if="canStream"
            class="drone-live-pop__spinner"
          />
          <span>{{ statusText }}</span>
        </div>
      </div>
    </template>
  </DroneMonitorMapModeOverlay>

  <div
    ref="overlayAnchorEl"
    v-show="!mapMode"
    class="drone-live-pop"
    :class="{ 'drone-live-pop--idle': !device }"
  >
    <div class="drone-live-pop__box">
      <div class="drone-live-pop__head">
        <div class="drone-live-pop__title">
          <span class="drone-live-pop__name">{{ deviceName }}</span>
        </div>
        <div class="drone-live-pop__head-actions">
          <el-tooltip
            :content="canEnterMapMode ? '切换地图模式' : '无人机未起飞，暂无地图模式'"
            placement="top"
          >
            <button
              type="button"
              class="drone-live-pop__map-mode-btn"
              :disabled="!canEnterMapMode"
              @click="enterMapMode"
            >
              地图模式
            </button>
          </el-tooltip>
          <button
            type="button"
            class="drone-live-pop__close"
            aria-label="关闭"
            @click="handleClose"
          >
            <img
              src="@/assets/ico-close.svg"
              alt=""
            />
          </button>
        </div>
      </div>
      <div class="drone-live-pop__body">
        <DroneLiveFlightControlBar
          compact
          :visible="showFlightControlBar"
          :show-capture="showCaptureButton"
          :capture-disabled="!hasFrames"
          :capture-loading="captureLoading"
          :return-toggle-label="returnToggleLabel"
          :pause-toggle-label="pauseToggleLabel"
          :flight-control-toggle-buttons="flightControlToggleButtons"
          :loading-flight-toggle="loadingFlightToggle"
          @toggle="handleFlightToggle"
          @capture="handleCaptureFrame"
        />
        <canvas
          ref="canvasRef"
          class="drone-live-pop__canvas"
        />
        <div
          v-if="!hasFrames"
          class="drone-live-pop__status"
        >
          <span
            v-if="canStream"
            class="drone-live-pop__spinner"
          />
          <span>{{ statusText }}</span>
        </div>
      </div>
    </div>
    <div
      class="drone-live-pop__arrow"
      aria-hidden="true"
    />
  </div>
</template>

<!-- 飞行控制 MessageBox 遮罩层级（非 scoped，作用于 body 下 overlay） -->
<style lang="scss">
@import "../styles/ai-drone-flight-message-layer.scss";
</style>

<style scoped lang="scss">
.drone-live-pop {
  position: relative;
  width: 520px;
  pointer-events: auto;
  filter: drop-shadow(0 10px 28px rgba(0, 0, 0, 0.45));

  &--idle {
    visibility: hidden;
    pointer-events: none;
  }
}

.drone-live-pop__box {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 375px;
  overflow: hidden;
  background: rgba(8, 22, 42, 0.94);
  border: 1px solid rgba(126, 200, 255, 0.42);
  border-radius: 6px;
  backdrop-filter: blur(12px);
}

.drone-live-pop__head {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  padding: 0 12px;
  border-bottom: 1px solid rgba(62, 140, 210, 0.28);
  background: linear-gradient(90deg, rgba(62, 140, 210, 0.22) 0%, rgba(62, 140, 210, 0.06) 55%, transparent 100%);
}

.drone-live-pop__head-actions {
  display: flex;
  gap: 6px;
  align-items: center;
}

.drone-live-pop__map-mode-btn {
  height: 26px;
  padding: 0 10px;
  font-size: 12px;
  color: #c9d7ea;
  cursor: pointer;
  background: rgba(12, 40, 77, 0.65);
  border: 1px solid rgba(126, 200, 255, 0.45);
  border-radius: 4px;

  &:hover:not(:disabled) {
    color: #fff;
    border-color: #7ec8ff;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
}

.drone-live-pop__name {
  display: flex;
  align-items: center;
  font-size: 15px;
  font-weight: 600;
  color: #e8f2ff;

  &::before {
    display: inline-block;
    width: 3px;
    height: 14px;
    margin-right: 8px;
    content: "";
    background: linear-gradient(180deg, #7ec8ff, #3d8fd4);
    border-radius: 2px;
  }
}

.drone-live-pop__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  cursor: pointer;
  background: rgba(12, 40, 77, 0.65);
  border: 1px solid rgba(126, 200, 255, 0.25);
  border-radius: 4px;

  img {
    width: 14px;
    height: 14px;
    opacity: 0.9;
  }

  &:hover {
    border-color: rgba(126, 200, 255, 0.55);
  }
}

.drone-live-pop__body {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  padding: 20px;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.28);
}

.drone-live-pop__canvas {
  display: block;
  flex: 1;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.drone-live-pop__status {
  position: absolute;
  inset: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: rgba(201, 215, 234, 0.85);
  pointer-events: none;
}

.drone-live-pop__spinner {
  width: 28px;
  height: 28px;
  border: 2px solid rgba(126, 200, 255, 0.25);
  border-top-color: #7ec8ff;
  border-radius: 50%;
  animation: drone-live-spin 0.9s linear infinite;
}

@keyframes drone-live-spin {
  to {
    transform: rotate(360deg);
  }
}

.drone-live-pop__arrow {
  width: 0;
  height: 0;
  margin: -1px auto 0;
  border-top: 10px solid rgba(8, 22, 42, 0.94);
  border-right: 10px solid transparent;
  border-left: 10px solid transparent;
  filter: drop-shadow(0 1px 0 rgba(126, 200, 255, 0.35));
}
</style>
