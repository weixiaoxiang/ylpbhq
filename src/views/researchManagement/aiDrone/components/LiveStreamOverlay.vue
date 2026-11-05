<script lang="ts" setup>
/**
 * 无人机实时画面 — 地图 Overlay 弹框（对齐大鲵一张图 mapPopUAV 交互，鹞落坪蓝青视觉）
 */
interface Props {
  device: Record<string, unknown> | null
}

const props = defineProps<Props>()
const emit = defineEmits<{ close: [] }>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const isConnected = ref(false)
const hasFrames = ref(false)
const statusText = ref("等待连接")
let socket: WebSocket | null = null
let canvasContext: CanvasRenderingContext2D | null = null

const deviceName = computed(() => String(props.device?.device_name || props.device?.name || "无人机视频流"))
const deviceSn = computed(() => String(props.device?.device_sn || props.device?.sn || ""))
/** 仅起飞后拉流，与大鲵 isOffline 语义一致 */
const canStream = computed(() => Boolean(props.device?.is_fly))

function initCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  canvas.width = 960
  canvas.height = 540
  canvasContext = canvas.getContext("2d")
}

function closeSocket() {
  socket?.close()
  socket = null
  isConnected.value = false
}

function drawFrame(blob: Blob) {
  const url = URL.createObjectURL(blob)
  const image = new Image()
  image.onload = () => {
    if (!props.device || !canvasContext || !canvasRef.value) {
      URL.revokeObjectURL(url)
      return
    }
    const canvas = canvasRef.value
    const scale = Math.min(canvas.width / image.width, canvas.height / image.height)
    const width = image.width * scale
    const height = image.height * scale
    const x = (canvas.width - width) / 2
    const y = (canvas.height - height) / 2
    canvasContext.clearRect(0, 0, canvas.width, canvas.height)
    canvasContext.fillStyle = "#061018"
    canvasContext.fillRect(0, 0, canvas.width, canvas.height)
    canvasContext.drawImage(image, x, y, width, height)
    hasFrames.value = true
    URL.revokeObjectURL(url)
  }
  image.onerror = () => URL.revokeObjectURL(url)
  image.src = url
}

function connect() {
  closeSocket()
  hasFrames.value = false
  if (!deviceSn.value || !canStream.value) {
    statusText.value = "无人机未起飞，暂无视频流"
    return
  }
  statusText.value = "正在连接视频流..."
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
  const url = `${protocol}//183.162.224.56:8771/stream/${deviceSn.value}`
  socket = new WebSocket(url)
  socket.binaryType = "blob"
  socket.onopen = () => {
    isConnected.value = true
    statusText.value = "视频流已连接"
  }
  socket.onerror = () => {
    if (!hasFrames.value) statusText.value = "视频流连接失败"
  }
  socket.onmessage = (event) => {
    if (!props.device) return
    drawFrame(new Blob([event.data], { type: "image/jpeg" }))
  }
  socket.onclose = () => {
    isConnected.value = false
  }
}

function handleClose() {
  closeSocket()
  emit("close")
}

watch(
  () => props.device,
  (value) => {
    if (value) {
      nextTick(() => {
        initCanvas()
        connect()
      })
    } else {
      closeSocket()
      hasFrames.value = false
    }
  }
)

onBeforeUnmount(closeSocket)
</script>

<template>
  <div
    class="drone-live-pop"
    :class="{ 'drone-live-pop--idle': !device }"
  >
    <div class="drone-live-pop__box">
      <div class="drone-live-pop__head">
        <div class="drone-live-pop__title">
          <span class="drone-live-pop__name">{{ deviceName }}</span>
        </div>
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
      <div class="drone-live-pop__body">
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
  flex: 1;
  min-height: 0;
  padding: 10px 12px 12px;
  background: rgba(0, 0, 0, 0.28);
}

.drone-live-pop__canvas {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.drone-live-pop__status {
  position: absolute;
  inset: 10px 12px 12px;
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

/* 指向地图上的无人机点位 */
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
