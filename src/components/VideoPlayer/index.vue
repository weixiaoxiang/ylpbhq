<script lang="ts" setup>
import videojs from "video.js"
import "video.js/dist/video-js.css"
interface Props {
  src: string
  proportion?: string
  style?: any
  placeholder?: string
  options?: any
  // 封面图片
  posterUrl?: string
}
const props = withDefaults(defineProps<Props>(), {
  src: "",
  // style设置优先级高于proportion
  style: {
    // width: "100%",
    // height: "100%"
  },
  proportion: "vjs-16-9", // vjs-4-3 vjs-16-9 vjs-21-9
  options: {
    inline: false,
    playbackRates: [0.5, 1, 1.25, 1.5, 2],
    pictureInPictureToggle: true,
    fullscreenToggle: true
  },
  posterUrl: ""
})

const player = ref<any>(null)
const videoPlayer = ref<any>(null)
// 截取第一帧
const captureFirstFrame = () => {
  const videoElement = videoPlayer.value
  const canvas = document.createElement("canvas")
  canvas.width = videoElement.videoWidth
  canvas.height = videoElement.videoHeight

  const context = canvas.getContext("2d")!
  context.drawImage(videoElement, 0, 0, canvas.width, canvas.height)

  const dataURL = canvas.toDataURL("image/png")
  videoElement.setAttribute("poster", dataURL)
}
onMounted(() => {
  player.value = videojs(videoPlayer.value, {
    preload: "auto", // 预加载
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
        src: props.src || undefined,
        type: "video/mp4"
      }
    ],
    poster: props.posterUrl || undefined
  })
  // 获得第一帧
  player.value.on("loadeddata", () => {
    if (player.value.readyState() >= 2 && !props.posterUrl) {
      captureFirstFrame()
    }
  })
  // 播放失败处理
  player.value.on("error", () => {
    // player.value.errorDisplay.close() //将错误信息不显示
    const errorDom = document.querySelector(".vjs-error-display") as any
    errorDom.style = {
      display: "block!important"
    }
  })
})
onBeforeUnmount(() => {
  if (player.value) {
    player.value.dispose()
  }
})
</script>
<template>
  <div class="video-player">
    <video
      ref="videoPlayer"
      class="video-js vjs-big-play-centered vjs-default-skin"
      :class="[proportion]"
      :style="style"
      crossorigin="anonymous"
    ></video>
  </div>
</template>

<style lang="scss" scoped>
.video-player {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 920px;
  margin: 0 auto;
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
  //自定义视频播放器报错样式
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
