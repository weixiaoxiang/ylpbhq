<script lang="ts" setup>
import videojs from "video.js"
import "video.js/dist/video-js.css"

/** 多视频源选项 */
export interface VideoSourceOption {
  label: string
  src: string
}

interface Props {
  /** 单视频地址，兼容旧用法 */
  src?: string
  /** 多视频源列表，存在多个有效源时展示切换 UI */
  sources?: VideoSourceOption[]
  proportion?: string
  style?: Record<string, string>
  placeholder?: string
  options?: {
    inline?: boolean
    playbackRates?: number[]
    pictureInPictureToggle?: boolean
    fullscreenToggle?: boolean
  }
  /** 封面图片 */
  posterUrl?: string
}

const props = withDefaults(defineProps<Props>(), {
  src: "",
  sources: () => [],
  style: () => ({}),
  proportion: "vjs-16-9",
  options: () => ({
    inline: false,
    playbackRates: [0.5, 1, 1.25, 1.5, 2],
    pictureInPictureToggle: true,
    fullscreenToggle: true
  }),
  posterUrl: ""
})

const player = ref<any>(null)
const videoPlayer = ref<HTMLVideoElement | null>(null)
const activeSourceIndex = ref(0)
const isPlayerReady = ref(false)

/** 解析最终可用的视频源：优先 sources，其次回退到 src */
const resolvedSources = computed<VideoSourceOption[]>(() => {
  const fromSources = (props.sources || []).filter((item) => item?.src)
  if (fromSources.length > 0) return fromSources
  if (props.src) return [{ label: "视频", src: props.src }]
  return []
})

/** 是否存在多个可切换的视频源 */
const showSourceSwitcher = computed(() => resolvedSources.value.length > 1)

/** 当前选中的视频源 */
const currentSource = computed(() => resolvedSources.value[activeSourceIndex.value] || resolvedSources.value[0])

/** 截取第一帧作为封面 */
function captureFirstFrame() {
  const videoElement = videoPlayer.value
  if (!videoElement || !videoElement.videoWidth) return

  const canvas = document.createElement("canvas")
  canvas.width = videoElement.videoWidth
  canvas.height = videoElement.videoHeight

  const context = canvas.getContext("2d")
  if (!context) return

  context.drawImage(videoElement, 0, 0, canvas.width, canvas.height)
  videoElement.setAttribute("poster", canvas.toDataURL("image/png"))
}

/** 初始化 video.js 播放器 */
function initPlayer() {
  if (!videoPlayer.value || !currentSource.value?.src) return

  player.value = videojs(videoPlayer.value, {
    preload: "auto",
    autoplay: false,
    controls: true,
    playbackRates: props.options.playbackRates,
    controlBar: {
      volumePanel: { inline: props.options.inline },
      pictureInPictureToggle: props.options.pictureInPictureToggle,
      fullscreenToggle: props.options.fullscreenToggle
    },
    sources: [
      {
        src: currentSource.value.src,
        type: "video/mp4"
      }
    ],
    poster: props.posterUrl || undefined
  })

  player.value.on("loadeddata", () => {
    if (player.value?.readyState() >= 2 && !props.posterUrl) {
      captureFirstFrame()
    }
  })

  player.value.on("error", () => {
    const errorDom = player.value?.el()?.querySelector(".vjs-error-display") as HTMLElement | null
    if (errorDom) {
      errorDom.style.display = "block"
    }
  })

  isPlayerReady.value = true
}

/** 切换视频源并保持播放进度归零 */
function switchSource(index: number) {
  if (index === activeSourceIndex.value || !resolvedSources.value[index]) return

  activeSourceIndex.value = index
  if (!player.value || !currentSource.value?.src) return

  player.value.pause()
  player.value.src({
    src: currentSource.value.src,
    type: "video/mp4"
  })
  player.value.load()
}

/** 视频源列表变化时重置到第一项 */
watch(
  resolvedSources,
  () => {
    activeSourceIndex.value = 0
    if (!isPlayerReady.value || !player.value || !currentSource.value?.src) return

    player.value.pause()
    player.value.src({
      src: currentSource.value.src,
      type: "video/mp4"
    })
    player.value.load()
  },
  { deep: true }
)

onMounted(() => {
  initPlayer()
})

onBeforeUnmount(() => {
  if (player.value) {
    player.value.dispose()
    player.value = null
  }
  isPlayerReady.value = false
})
</script>

<template>
  <div class="video-player">
    <!-- 多视频源切换栏：仅在有多个有效源时显示 -->
    <div
      v-if="showSourceSwitcher"
      class="source-switcher"
    >
      <button
        v-for="(source, index) in resolvedSources"
        :key="`${source.label}-${source.src}`"
        type="button"
        class="source-switcher__btn"
        :class="{ 'is-active': activeSourceIndex === index }"
        @click="switchSource(index)"
      >
        <span class="source-switcher__dot" />
        <span>{{ source.label }}</span>
      </button>
    </div>

    <video
      ref="videoPlayer"
      class="video-js vjs-big-play-centered vjs-default-skin"
      :class="[proportion]"
      :style="style"
      crossorigin="anonymous"
    />
  </div>
</template>

<style lang="scss" scoped>
.video-player {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  max-width: 920px;
  margin: 0 auto;
}

.source-switcher {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px;
  border-radius: 4px;
  background: rgba(12, 40, 77, 0.92);
  border: 1px solid #304868;
  box-shadow: 0 0 12px rgba(56, 202, 254, 0.12) inset;
}

.source-switcher__btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 96px;
  height: 32px;
  padding: 0 16px;
  border: 1px solid transparent;
  border-radius: 2px;
  background: #142335;
  color: #adb2b8;
  font-size: 13px;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    color: #dbe7f3;
    border-color: #3a5f86;
  }

  &.is-active {
    color: #fff;
    border-color: #58baf1;
    background: linear-gradient(to right, #58baf1, #346d8d);
    box-shadow: 0 0 10px rgba(88, 186, 241, 0.35);
  }
}

.source-switcher__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #667689;
  flex-shrink: 0;

  .is-active & {
    background: #38e6ea;
    box-shadow: 0 0 6px rgba(56, 230, 234, 0.8);
  }
}
</style>

<style lang="scss">
.video-player {
  .vjs-paused .vjs-big-play-button,
  .vjs-paused.vjs-has-started .vjs-big-play-button {
    display: block;
  }

  .video-js .vjs-time-control {
    display: block;
  }

  .video-js .vjs-remaining-time {
    display: none;
  }

  .vjs-error-display {
    width: 100%;
    height: 100%;
    background-color: rgba(29, 29, 61, 0.8);

    &:before {
      display: none;
    }

    &:after {
      color: #ffffff;
      content: "请检查播放源";
      font-family: PingFangSC, PingFangSC-Regular;
      font-size: 0.8333vw;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      position: absolute;
      width: 100%;
      padding: 0 10px;
      display: flex;
      justify-content: center;
    }

    .vjs-modal-dialog-content {
      display: none;
    }
  }
}
</style>
