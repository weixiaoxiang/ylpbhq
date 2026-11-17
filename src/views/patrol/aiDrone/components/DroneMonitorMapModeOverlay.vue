<script lang="ts" setup>
import DroneLiveTrackMapPanel from "./DroneLiveTrackMapPanel.vue"

interface Props {
  modelValue?: boolean
  title?: string
  deviceSn: string
  airportSn?: string
  projectUuid?: string
  droneProjectList?: Record<string, unknown>[]
}

withDefaults(defineProps<Props>(), {
  modelValue: false,
  title: "无人机监控",
  airportSn: "",
  projectUuid: "",
  droneProjectList: () => []
})

const emit = defineEmits<{
  "update:modelValue": [value: boolean]
  back: []
  close: []
}>()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="drone-monitor-map-mode"
      role="dialog"
      aria-modal="true"
      :aria-label="title || '地图模式'"
    >
      <header class="drone-monitor-map-mode__header">
        <span class="drone-monitor-map-mode__title">{{ title }}</span>
        <div class="drone-monitor-map-mode__actions">
          <button
            type="button"
            class="drone-monitor-map-mode__btn"
            @click="emit('back')"
          >
            返回小窗
          </button>
          <button
            type="button"
            class="drone-monitor-map-mode__btn drone-monitor-map-mode__btn--close"
            aria-label="关闭"
            @click="emit('close')"
          >
            <img
              src="@/assets/ico-close.svg"
              alt=""
            />
          </button>
        </div>
      </header>
      <div class="drone-monitor-map-mode__body">
        <section class="drone-monitor-map-mode__map">
          <DroneLiveTrackMapPanel
            :device-sn="deviceSn"
            :airport-sn="airportSn"
            :project-uuid="projectUuid"
            :drone-project-list="droneProjectList"
            :active="modelValue"
          />
        </section>
        <section class="drone-monitor-map-mode__video">
          <slot name="video" />
        </section>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss">
@import "../styles/ai-drone-monitor-map-mode.scss";
</style>
