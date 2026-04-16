<template>
  <div
    class="video-box"
    element-loading-background="rgba(0, 0, 0, 0.5)"
  >
    <div
      class="player"
      id="player"
    ></div>
    <div class="right-tool">
      <div class="slider-box">
        <el-slider
          v-model="playTime"
          :format-tooltip="playTimeFormat"
          @change="playTimeChange"
          :min="sliderMIn"
          :max="sliderMaxNum"
          :marks="playTimeSliderMarks"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import dayjs from "dayjs"
const props = defineProps({
  historyUrl: {
    type: String,
    default: ""
  },
  chooseData: {
    type: String,
    default: ""
  },
  historyStarttime: {
    type: String,
    default: ""
  },
  historyEndtime: {
    type: String,
    default: ""
  }
})

const IS_MOVE_DEVICE = document.body.clientWidth < 992 // 是否移动设备
const MSE_IS_SUPPORT = !!window.MediaSource // 是否支持mse
window.player = null
const selectWindowIndex = ref(0)
const sliderMax = ref({})
const playing = ref(false)
watch(
  () => props.historyUrl,
  (val) => {
    if (val) {
      init()
      console.log(val, props.historyEndtime, props.historyStarttime)
      createPlayer()
    }
  }
)
const init = () => {
  // 设置播放容器的宽高并监听窗口大小变化
  window.addEventListener("resize", () => {
    window.player.JS_Resize()
  })
}
const createPlayer = () => {
  window.player = new JSPlugin({
    szId: "player",
    szBasePath: "/h5player/",
    bSupporDoubleClickFull: true,
    iCurrentSplit: 1,
    iMaxSplit: 1,
    openDebug: true,
    oStyle: {
      borderSelect: IS_MOVE_DEVICE ? "#000" : "#FFCC00"
    }
  })
  if (props.historyUrl) {
    playBack()
  }
  // 事件回调绑定
  window.player.JS_SetWindowControlCallback({
    StreamEnd: function (index) {
      //回放结束回调,返回对应测窗口id
      console.log("回放结束回调")
      stopAllPlay()
    }
  })
}
const stopAllPlay = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  if (window.player) {
    return window.player?.JS_StopRealPlayAll().then(
      () => {
        return true
      },
      (e) => {
        return false
      }
    )
  }
}
const playTime = ref(0)
const playSpeed = ref("1")
const sliderMIn = ref(0)
const sliderMaxNum = ref(0)
const playTimeSliderMarks = ref({})
const playTimeFormat = (val) => {
  return dayjs(parseInt(val) * 1000 + new Date(props.chooseData + " " + sliderMax.value.startTime).getTime()).format(
    "HH:mm:ss"
  )
}
const playTimeChange = (val) => {
  const index = selectWindowIndex.value
  const time = dayjs(
    parseInt(val) * 1000 + new Date(props.chooseData + " " + sliderMax.value.startTime).getTime()
  ).format("YYYY-MM-DD HH:mm:ss")
  let seekStart = time.replace(" ", "T") + "Z",
    endTime = props.chooseData + "T" + sliderMax.value.endTime + "Z"
  if (seekStart == endTime) {
    ElMessage.warning("请勿选择最后时间")
    return
  }
  window.player.JS_Seek(index, seekStart, endTime).then(
    () => {},
    (e) => {
      console.error(e)
    }
  )
}
const playHistoryVideo = async () => {
  const index = selectWindowIndex.value
  const playURL = props.historyUrl
  const mode = 0
  if (!playURL) {
    ElMessage.warning("暂无回放数据")
    return
  }
  let startTime = props.chooseData + "T" + sliderMax.value.startTime + "Z",
    endTime = props.chooseData + "T" + sliderMax.value.endTime + "Z"
  await nextTick()
  window.player
    .JS_Play(
      playURL,
      { playURL, mode },
      index,
      // 回放参数
      startTime,
      endTime
    )
    .then(
      () => {
        playSpeed.value = 1
        playing.value = true
      },
      (e) => {}
    )
}
const playBack = async () => {
  playTime.value = 0
  sliderMax.value = {
    startTime: props.historyStarttime,
    endTime: props.historyEndtime
  }
  sliderMaxNum.value =
    (new Date(props.chooseData + " " + sliderMax.value.endTime).getTime() -
      new Date(props.chooseData + " " + sliderMax.value.startTime).getTime()) /
    1000
  playTimeSliderMarks.value = {
    0: sliderMax.value.startTime,
    [sliderMaxNum.value]: sliderMax.value.endTime
  }
  await nextTick()
  playHistoryVideo()
}
let timer = null

const getCurrentTime = () => {
  const index = selectWindowIndex.value
  timer = setInterval(() => {
    window.player.JS_GetOSDTime(index).then(
      (time) => {
        // playTime.value = new Date(time).getTime()
        console.info("osdTime:", new Date(time))
        // do you want...
      },
      (err) => {
        console.info("JS_GetOSDTime failed")
        // do you want...
      }
    )
  }, 1000)
}
onMounted(async () => {})
onUnmounted(() => {
  console.log("销毁")
  stopAllPlay()
})
defineExpose({
  playBack
})
</script>

<style scoped lang="scss">
.video-box {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  .player {
    width: 100%;
    height: 100%;
  }
}
.right-tool {
  width: 100%;
  padding: 0px 30px;
  position: absolute;
  bottom: -30px;
  right: 0;
}
:deep(.el-slider__runway) {
  background-color: var(--el-color-primary);
}
:deep(.el-slider__marks-text) {
  color: #333;
}
</style>
