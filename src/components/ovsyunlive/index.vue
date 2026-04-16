<template>
  <video
    :id="'player' + uid"
    :key="uid"
    muted
    playsinline
    width="100%"
    height="100%"
    @dblclick="videoFullscreen('player' + uid)"
    :poster="loading"
  ></video>
</template>

<script setup lang="ts">
import { nanoid } from "nanoid"
import loading from "@/assets/loading.gif"
// const img= ref()
const props = defineProps({
  videoUrl: {
    type: String,
    default: ""
  }
})
let player: any = {}
const uid = ref(nanoid())
const iffullscreen = ref(false)
watch(
  () => [props.videoUrl],
  (newVal, oldVal) => {
    // if (newVal[0] != oldVal[0]) {
    //     console.log("视频信息", newVal)
    //     nextTick(() => {
    //         play(props.videoUrl);
    //     })
    // }
  }
)
//创建实例
const create = (url) => {
  var port = ":7701"
  if (window.location.protocol == "https:") {
    port = ":7702"
  }
  // @ts-ignore
  player[uid.value] = new OvPlayer("player" + uid.value, "/ovsyunlive")
  //rtsp视频地址
  console.log("rtsp视频地址", url)
  player[uid.value].connect(url)
}
//播放
const play = (url) => {
  // console.log("播放", url);
  if (player[uid.value]) {
    console.log("销毁")
    destroy()
  }
  nextTick(() => {
    create(url)
  })
}

//销毁
const destroy = () => {
  player[uid.value] = null
  uid.value = nanoid()
}
//  视频窗口点击进入全屏事件
const videoFullscreen = (videoElement: any) => {
  if (!iffullscreen.value) {
    launchFullscreen(videoElement)
    iffullscreen.value = false
  } else {
    iffullscreen.value = true
    exitFullscreen()
  }
}
//    进入全屏
function launchFullscreen(videoElement: any) {
  let currElement: any = document.getElementById(videoElement)
  if (currElement.requestFullscreen) {
    currElement.requestFullscreen()
  } else if (currElement.mozRequestFullScreen) {
    currElement.mozRequestFullScreen()
  } else if (currElement.msRequestFullscreen) {
    currElement.msRequestFullscreen()
  } else if (currElement.oRequestFullscreen) {
    currElement.oRequestFullscreen()
  } else if (currElement.webkitRequestFullscreen) {
    currElement.webkitRequestFullScreen()
  }
  currElement.muted = false
  currElement.play()
}
//    退出全屏
function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen()
  }
}
onMounted(() => {
  if (props.videoUrl) {
    console.log("创建视频")
    nextTick(() => {
      play(props.videoUrl)
    })
  }
})
onBeforeUnmount(() => {
  console.log("销毁视频回放")
  player[uid.value] = null
})
</script>
<style lang="scss" scoped>
video {
  width: 100%;
  height: 100%;
  object-fit: fill;
}
</style>
