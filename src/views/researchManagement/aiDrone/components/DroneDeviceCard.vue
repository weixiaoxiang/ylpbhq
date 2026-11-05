<script lang="ts" setup>
import wrjOff from "@/assets/images/ai-drone/wrj/wrj_off.png"
import wrjOn from "@/assets/images/ai-drone/wrj/wrj_on.png"
import wrjUseVideo from "@/assets/images/ai-drone/wrj/wrj_use.mp4"

/** 设备卡片展示字段（与大鲵 uav-analysis-1 一致，status 由 is_fly 映射） */
export interface DroneDeviceCardData {
  device_name?: string
  device_sn?: string
  status?: "use" | "on" | "off"
  is_fly?: boolean
}

interface Props {
  data: DroneDeviceCardData
}

const props = defineProps<Props>()
const emit = defineEmits<{
  live: [DroneDeviceCardData]
}>()

/** 待机 / 飞行 / 未开机 文案 */
const statusText = computed(() => {
  const status = props.data.status
  if (status === "use") return "飞行中"
  if (status === "off") return "未开机"
  return "待机中"
})

const cardStatus = computed(() => props.data.status || "off")

function onLiveClick() {
  emit("live", props.data)
}
</script>

<template>
  <div
    class="drone-device-card"
    :class="[cardStatus]"
  >
    <div class="drone-device-card__thumb">
      <video
        v-if="cardStatus === 'use'"
        class="drone-device-card__media"
        :src="wrjUseVideo"
        autoplay
        loop
        muted
        playsinline
      />
      <img
        v-else
        class="drone-device-card__media"
        :src="cardStatus === 'off' ? wrjOff : wrjOn"
        alt=""
      />
    </div>
    <div class="drone-device-card__info">
      <div class="drone-device-card__name">{{ data.device_name || data.device_sn || "无人机" }}</div>
      <div class="drone-device-card__status">{{ statusText }}</div>
    </div>
    <button
      type="button"
      class="drone-device-card__play"
      aria-label="查看无人机监控"
      @click="onLiveClick"
    >
      <svg
        viewBox="0 0 1024 1024"
        width="14"
        height="14"
        aria-hidden="true"
      >
        <path
          d="M719.4 499.1l-296.1-215A15.9 15.9 0 00398 297v430c0 13.1 14.8 20.5 25.3 12.9l296.1-215a15.9 15.9 0 000-25.8z"
          fill="currentColor"
        />
      </svg>
    </button>
  </div>
</template>

<style scoped lang="scss">
/* 鹞落坪大屏蓝系，与 BasePanel / 抓拍卡片一致 */
.drone-device-card {
  position: relative;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid rgba(62, 140, 210, 0.35);
  background: linear-gradient(180deg, rgba(22, 58, 102, 0.78), rgba(12, 34, 62, 0.72));
  backdrop-filter: blur(8px);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    border-color: rgba(126, 200, 255, 0.65);
    box-shadow: 0 0 12px rgba(62, 140, 210, 0.22);
  }
}

.drone-device-card__thumb {
  flex-shrink: 0;
  width: 68px;
  height: 52px;
  overflow: hidden;
  border-radius: 4px;
  border: 1px solid rgba(62, 140, 210, 0.3);
  background: rgba(8, 22, 40, 0.85);
}

.drone-device-card__media {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.drone-device-card__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.drone-device-card__name {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.3;
  color: #e8f4ff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.drone-device-card__status {
  font-size: 12px;
  line-height: 1.2;
  color: rgba(190, 204, 220, 0.85);
}

.drone-device-card.off .drone-device-card__status {
  color: rgba(190, 204, 220, 0.65);
}

.drone-device-card.on .drone-device-card__status {
  color: #7ec8ff;
}

.drone-device-card.use .drone-device-card__status {
  color: #3ec6ff;
}

.drone-device-card.use .drone-device-card__thumb {
  box-shadow: inset 0 0 0 1px rgba(126, 200, 255, 0.55);
}

.drone-device-card__play {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid rgba(126, 200, 255, 0.5);
  border-radius: 50%;
  background: rgba(10, 67, 141, 0.45);
  color: #7ec8ff;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    background: rgba(10, 67, 141, 0.72);
    border-color: #7ec8ff;
  }
}
</style>
