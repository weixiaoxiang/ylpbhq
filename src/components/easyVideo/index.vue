<script lang="ts" setup>
// @ts-nocheck
import { nanoid } from "nanoid"
const props = defineProps({
  videoUrl: {
    type: String,
    default: ""
  },
  currentLayout: {
    type: Number,
    default: 1
  },
  isHistory: {
    type: Boolean,
    default: false
  }
})
const config = {
  bufferTime: 1, // 缓存时长,	加载显设置最小缓冲时长，单位秒，播放器会自动消除延迟
  loadTimeOut: 3, // 视频加载超时,单位秒。
  loadTimeReplay: 1, // 重连次数 -1为一直加载。
  stretch: false, // 视频拉伸
  hasAudio: true, //是否解析音频
  isLive: true, //是否直播
  WASM: false,
  MSE: true,
  WCS: false,
  WASMSIMD: false,
  gpuDecoder: true,
  webGPU: false,
  watermark: { text: { content: "*" }, right: 10, top: 10 }, //水印
  fullWatermark: { text: "*", angle: "", color: "", fontSize: "", opacity: "" } //全屏水印
}
let player: any = null
const uid = ref(nanoid())
const playCreate = () => {
  const container = document.getElementById("player" + uid.value)
  const easyplayer = new EasyPlayerPro(container, {
    ...config
  })

  easyplayer.on("fullscreen", function (flag) {
    console.log("is fullscreen", uid.value, flag)
  })
  easyplayer.on("playbackRate", (rate) => {
    easyplayer.setRate(rate)
  })

  easyplayer.on("playbackSeek", (data) => {
    console.log("playbackSeek", data)
  })
  player = easyplayer
}
const onPlayer = () => {
  setTimeout(
    (url) => {
      if (player) {
        player
          .play(url)
          .then(() => {})
          .catch((e) => {
            console.error(e)
          })
      }
    },
    0,
    props.videoUrl
  )
}
const onDestroy = () => {
  return new Promise((resolve, reject) => {
    if (player) {
      player.destroy()
      player = null
    }
    setTimeout(() => {
      resolve()
    }, 100)
  })
}
const onReplay = () => {
  onDestroy().then(() => {
    playCreate()
    onPlayer()
  })
}
const onPause = () => {
  player.pause()
}
const onMute = () => {
  player.setMute(true)
}
watch(
  () => [props.videoUrl, props.currentLayout],
  (newVal, oldVal) => {
    if (newVal[0]) {
      // console.log("视频信息", newVal)
      nextTick(() => {
        onReplay()
      })
    }
  },
  {
    immediate: true
  }
)
onMounted(() => {
  // playCreate()
})
</script>
<template>
  <div
    :id="'player' + uid"
    :key="uid"
    style="width: 100%; height: 100%; background-color: #000000; margin: 0 auto; position: relative"
  ></div>
</template>

<style lang="scss" scoped></style>
