<template>
  <live-player
    class="video-player"
    :video-url="videoUrl"
    :live="false"
    :stretch="true"
    aspect="fullscreen"
    style="width: 100%"
    :show-custom-button="showCustomButton"
    :hide-snapshot-button="hideSnapshotButton"
    :hide-fullscreen-button="hideFullscreenButton"
    :hide-big-play-button="hideBigPlayButton"
    :hide-stretch-button="hideStretchButton"
    :hide-fluent-button="hideFluentButton"
    :controls="controls"
    :timeout="5"
  ></live-player>
</template>

<script setup lang="ts">
// @ts-ignore
import LivePlayer from "@liveqing/liveplayer-v3"
const props = defineProps({
  videoUrl: {
    type: String,
    default: ""
  },
  controls: {
    type: Boolean,
    default: true
  },
  showCustomButton: {
    type: Boolean,
    default: true
  },
  hideSnapshotButton: {
    type: Boolean,
    default: false
  },
  hideFullscreenButton: {
    type: Boolean,
    default: false
  },
  hideBigPlayButton: {
    type: Boolean,
    default: false
  },
  hideStretchButton: {
    type: Boolean,
    default: false
  },
  hideFluentButton: {
    type: Boolean,
    default: false
  }
})

onMounted(() => {})
onBeforeUnmount(() => {
  console.log("销毁视频回放")
})
</script>
<style lang="scss" scoped>
:deep(.video-js) {
  .vjs-control-bar {
    justify-content: space-between;
  }
  .vjs-live-contro,
  .vjs-time-control {
    display: none !important;
  }
}
.video-player {
  position: relative;
  width: 100%;
  height: 100%;
}
video {
  width: 100%;
  height: 100%;
  object-fit: fill;
}
</style>
