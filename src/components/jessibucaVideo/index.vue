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
  }
})
let player: any = null
const uid = ref(nanoid())
let playing = false // 播放中
let loaded = false // 加载中
let quieting = false // 静音中
let performance = "" // 性能
let useWCS = false // 使用WCS
let useMSE = true // 使用MSE
let useOffscreen = false // 使用Offscreen
let recordType = "mp4" // 录制类型 mp4 webm
const playCreate = () => {
  const container = document.getElementById("player" + uid.value)
  player = new window.Jessibuca({
    container: container,
    decoder: "/jessibuca/decoder.js",
    videoBuffer: 0.2, // 缓存时长
    isResize: true,
    useWCS: true,
    useMSE: true,
    text: "",
    // background: "bg.jpg",
    loadingText: "疯狂加载中...",
    // hasAudio:false,
    debug: true,
    supportDblclickFullscreen: true,
    showBandwidth: true, // 显示网速
    operateBtns: {
      fullscreen: true,
      screenshot: true,
      play: true,
      audio: true
    },
    // vod: true,
    forceNoOffscreen: true,
    isNotMute: true,
    timeout: 10
  })
  player.on("load", function () {
    console.log("on load")
  })

  player.on("log", function (msg) {
    console.log("on log", msg)
  })
  player.on("record", function (msg) {
    console.log("on record:", msg)
  })
  player.on("pause", function () {
    console.log("on pause")
  })
  player.on("play", function () {
    console.log("on play")
  })
  player.on("fullscreen", function (msg) {
    console.log("on fullscreen", msg)
  })

  player.on("mute", function (msg) {
    console.log("on mute", msg)
  })

  player.on("mute", function (msg) {
    console.log("on mute2", msg)
  })

  player.on("audioInfo", function (msg) {
    console.log("audioInfo", msg)
  })

  player.on("videoInfo", function (info) {
    console.log("videoInfo", info)
  })

  player.on("error", function (error) {
    console.log("error", error)
  })

  player.on("timeout", function () {
    console.log("timeout")
  })

  player.on("start", function () {
    console.log("frame start")
  })

  player.on("performance", function (performance) {
    var show = "卡顿"
    if (performance === 2) {
      show = "非常流畅"
    } else if (performance === 1) {
      show = "流畅"
    }
  })
  player.on("buffer", function (buffer) {
    console.log("buffer", buffer)
  })

  player.on("stats", function (stats) {
    console.log("stats", stats)
  })

  player.on("kBps", function (kBps) {
    console.log("kBps", kBps)
  })

  player.on("play", () => {
    playing = true
    loaded = true
    quieting = player.isMute()
  })

  player.on("recordingTimestamp", (ts) => {
    console.log("recordingTimestamp", ts)
  })
}
// 播放
const play = () => {
  if (props.videoUrl) {
    player.play(props.videoUrl)
  }
}
// 销毁
const destroy = async () => {
  if (player) {
    await player.destroy()
  }
  playCreate()
  playing = false
  loaded = false
  performance = ""
}
// 全屏
const fullscreen = () => {
  player.setFullscreen(true)
}
// 清屏
const clearView = () => {
  player.clearView()
}
// 开始录制
const startRecord = () => {
  const time = new Date().getTime()
  player.startRecord(time, recordType)
}
// 停止录制并保存
const stopAndSaveRecord = () => {
  player.stopRecordAndSave()
}
// 截图
const screenShot = () => {
  player.screenshot()
}
// 重新播放 type : mse wcs offscreen
const restartPlay = async (type) => {
  if (type === "mse") {
    useWCS = false
    useOffscreen = false
  } else if (type === "wcs") {
    useMSE = false
  } else if (type === "offscreen") {
    useMSE = false
  }

  await destroy()
  setTimeout(() => {
    play()
  }, 100)
}
// 设置缓存时长
const changeBuffer = (buffer) => {
  player.setBufferTime(Number(buffer))
}
// scale 0完全填充(拉伸) 1等比缩放 2完全填充(未拉伸)
const scaleChange = (scale) => {
  player.setScaleMode(scale)
}
watch(
  () => [props.videoUrl, props.currentLayout],
  (newVal, oldVal) => {
    if (newVal[0]) {
      // console.log("视频信息", newVal)
      nextTick(async () => {
        await destroy()
        play()
      })
    }
  },
  {
    immediate: true
  }
)
onMounted(() => {})

onBeforeUnmount(() => {
  if (player) {
    player.destroy()
    player = null
  }
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
