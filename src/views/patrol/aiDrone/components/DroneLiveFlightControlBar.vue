<script lang="ts" setup>
import { Camera, HomeFilled, Loading, VideoPause, VideoPlay } from "@element-plus/icons-vue"
import { computed } from "vue"
import type { FlightControlToggle, FlightControlToggleButtonState } from "@/utils/ai-drone/uav-flight-control"

interface Props {
  visible: boolean
  returnToggleLabel: string
  pauseToggleLabel: string
  flightControlToggleButtons: FlightControlToggleButtonState
  loadingFlightToggle: FlightControlToggle | ""
  /** 地图小窗内使用紧凑尺寸，全屏地图模式保持默认 */
  compact?: boolean
  /** 展示抓拍按钮（无司空返航/暂停时也可单独显示条） */
  showCapture?: boolean
  captureDisabled?: boolean
  captureLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  compact: false,
  showCapture: false,
  captureDisabled: true,
  captureLoading: false
})

const emit = defineEmits<{
  toggle: [FlightControlToggle]
  capture: []
}>()

const barVisible = computed(() => props.visible || props.showCapture)

const isReturnActive = computed(() => props.returnToggleLabel === "取消返航")
const isPauseActive = computed(() => props.pauseToggleLabel === "恢复")
</script>

<template>
  <div
    v-if="barVisible"
    class="drone-flight-control-bar"
    :class="{ 'drone-flight-control-bar--compact': compact }"
    @click.stop
  >
    <span
      v-if="visible || showCapture"
      class="drone-flight-control-bar__label"
    >{{ visible ? (compact ? "控制" : "飞行控制") : (compact ? "直播" : "直播画面") }}</span>
    <div
      v-if="visible"
      class="drone-flight-control-bar__segment"
    >
      <button
        type="button"
        class="drone-flight-control-bar__btn drone-flight-control-bar__btn--return"
        :class="{
          'is-loading': loadingFlightToggle === 'return',
          'is-active': isReturnActive
        }"
        :disabled="!flightControlToggleButtons.returnToggle"
        @click="emit('toggle', 'return')"
      >
        <el-icon
          v-if="loadingFlightToggle === 'return'"
          class="drone-flight-control-bar__icon is-loading"
        >
          <Loading />
        </el-icon>
        <el-icon
          v-else
          class="drone-flight-control-bar__icon"
        >
          <HomeFilled />
        </el-icon>
        <span>{{ returnToggleLabel }}</span>
      </button>
      <span
        class="drone-flight-control-bar__split"
        aria-hidden="true"
      />
      <button
        type="button"
        class="drone-flight-control-bar__btn drone-flight-control-bar__btn--pause"
        :class="{
          'is-loading': loadingFlightToggle === 'pause',
          'is-active': isPauseActive
        }"
        :disabled="!flightControlToggleButtons.pauseToggle"
        @click="emit('toggle', 'pause')"
      >
        <el-icon
          v-if="loadingFlightToggle === 'pause'"
          class="drone-flight-control-bar__icon is-loading"
        >
          <Loading />
        </el-icon>
        <el-icon
          v-else
          class="drone-flight-control-bar__icon"
        >
          <VideoPlay v-if="isPauseActive" />
          <VideoPause v-else />
        </el-icon>
        <span>{{ pauseToggleLabel }}</span>
      </button>
    </div>
    <div
      v-if="showCapture"
      class="drone-flight-control-bar__segment drone-flight-control-bar__segment--capture"
    >
      <button
        type="button"
        class="drone-flight-control-bar__btn drone-flight-control-bar__btn--capture"
        :class="{ 'is-loading': captureLoading }"
        :disabled="captureDisabled || captureLoading"
        @click="emit('capture')"
      >
        <el-icon
          v-if="captureLoading"
          class="drone-flight-control-bar__icon is-loading"
        >
          <Loading />
        </el-icon>
        <el-icon
          v-else
          class="drone-flight-control-bar__icon"
        >
          <Camera />
        </el-icon>
        <span>抓拍</span>
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.drone-flight-control-bar {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 4;
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 8px 12px;
  pointer-events: auto;
  background: linear-gradient(180deg, rgba(12, 32, 58, 0.92) 0%, rgba(8, 22, 42, 0.88) 100%);
  border: 1px solid rgba(126, 200, 255, 0.42);
  border-radius: 10px;
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.42),
    inset 0 1px 0 rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(10px);

  /* 顶缘强调线，与航线统计胶囊风格一致 */
  &::before {
    position: absolute;
    top: 0;
    right: 16px;
    left: 16px;
    height: 2px;
    content: "";
    border-radius: 0 0 2px 2px;
    background: linear-gradient(90deg, transparent 0%, rgba(126, 200, 255, 0.85) 50%, transparent 100%);
  }
}

.drone-flight-control-bar__label {
  flex-shrink: 0;
  padding-right: 12px;
  font-size: 12px;
  font-weight: 600;
  color: rgba(200, 220, 245, 0.95);
  letter-spacing: 0.04em;
  border-right: 1px solid rgba(126, 200, 255, 0.28);
}

.drone-flight-control-bar__segment {
  display: inline-flex;
  align-items: stretch;
  padding: 3px;
  background: rgba(0, 0, 0, 0.32);
  border: 1px solid rgba(126, 200, 255, 0.18);
  border-radius: 8px;
}

.drone-flight-control-bar__split {
  align-self: center;
  width: 1px;
  height: 20px;
  background: linear-gradient(180deg, transparent 0%, rgba(126, 200, 255, 0.45) 50%, transparent 100%);
}

.drone-flight-control-bar__btn {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
  min-width: 72px;
  height: 30px;
  padding: 0 12px;
  font-size: 13px;
  font-weight: 500;
  color: rgba(232, 244, 255, 0.88);
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: 6px;
  transition:
    color 0.15s ease,
    background-color 0.15s ease;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.38;
  }

  &.is-loading {
    opacity: 0.92;
  }

  &.is-active {
    font-weight: 600;
    color: #fff;
  }
}

.drone-flight-control-bar__icon {
  font-size: 14px;
  opacity: 0.92;
}

.drone-flight-control-bar__btn--return {
  &:hover:not(:disabled) {
    color: #fff;
    background: rgba(255, 168, 72, 0.22);
  }

  &.is-active {
    background: rgba(255, 148, 48, 0.28);
    box-shadow: inset 0 0 0 1px rgba(255, 180, 100, 0.35);
  }
}

.drone-flight-control-bar__btn--pause {
  &:hover:not(:disabled) {
    color: #fff;
    background: rgba(126, 200, 255, 0.22);
  }

  &.is-active {
    background: rgba(62, 140, 210, 0.38);
    box-shadow: inset 0 0 0 1px rgba(126, 200, 255, 0.4);
  }
}

.drone-flight-control-bar__segment--capture {
  margin-left: 2px;
}

.drone-flight-control-bar__btn--capture {
  &:hover:not(:disabled) {
    color: #fff;
    background: rgba(92, 220, 168, 0.22);
  }
}

/* 地图锚点小窗：整体缩小，减少对画面的遮挡 */
.drone-flight-control-bar--compact {
  top: 12px;
  left: 12px;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 8px;
  box-shadow:
    0 4px 14px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);

  &::before {
    right: 10px;
    left: 10px;
    height: 1px;
  }

  .drone-flight-control-bar__label {
    padding-right: 8px;
    font-size: 11px;
    font-weight: 500;
  }

  .drone-flight-control-bar__segment {
    padding: 2px;
    border-radius: 6px;
  }

  .drone-flight-control-bar__split {
    height: 14px;
  }

  .drone-flight-control-bar__btn {
    gap: 4px;
    min-width: 56px;
    height: 24px;
    padding: 0 8px;
    font-size: 12px;
    border-radius: 4px;
  }

  .drone-flight-control-bar__icon {
    font-size: 12px;
  }
}
</style>