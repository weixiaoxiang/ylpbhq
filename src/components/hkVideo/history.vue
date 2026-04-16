<!-- 历史录像 -->
<template>
  <div
    class="dialog"
    v-if="show"
  >
    <div
      class="dialog-con"
      id="dialogCon"
    >
      <div class="dialog-header">
        <div class="time">
          <span>选择时间范围</span>
          <el-date-picker
            v-model="timeRange"
            type="datetimerange"
            :shortcuts="shortcuts"
            range-separator="-"
            :teleported="false"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            :default-time="defaultTime"
            :disabled-date="disabledDate"
            :clearable="false"
            style="width: 360px"
            @calendar-change="calendarChange"
            @change="changeDate"
          />
        </div>
        <div class="speed">当前播放速度：{{ playSpeed }}</div>
        <div class="btns">
          <el-dropdown
            :teleported="false"
            trigger="click"
            @command="setSpeed"
          >
            <span class="el-dropdown-link">
              <div class="btn">倍速</div>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="0.5">0.5倍速</el-dropdown-item>
                <el-dropdown-item command="1.0">1倍速</el-dropdown-item>
                <el-dropdown-item command="2.0">2倍速</el-dropdown-item>
                <el-dropdown-item command="4.0">4倍速</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <div
            class="btn"
            @click="downloadRecord()"
          >
            {{ !isdownload ? "开始录像" : "停止录像并保存" }}
          </div>
          <span
            class="playIconHistory"
            v-if="isdownload"
            style="width: 180px; padding-left: 10px; background: transparent; color: #f90000"
          >
            下载的视频可在VLC中打开
          </span>
          <div
            class="btn"
            @click="handleEvent('截屏')"
          >
            截屏
          </div>
          <div
            class="btn"
            @click="handleEvent('全屏')"
          >
            {{ fullBoolean ? "退出全屏" : "全屏" }}
          </div>
          <div
            class="btn"
            @click="close"
          >
            关闭
          </div>
        </div>
      </div>
      <div class="video">
        <player
          ref="recordVideoPlayer"
          :videoUrl="videoUrl"
          :isHistory="true"
          :key="uid"
          @downloadRecord="downloadRecordStatus"
        >
        </player>
      </div>
      <div class="bottom">
        <div
          class="playBtn"
          @click="handlePlay()"
        >
          <el-icon v-if="isPlaying">
            <VideoPause />
          </el-icon>
          <el-icon v-else>
            <VideoPlay />
          </el-icon>
        </div>
        <div class="slider-box">
          <el-slider
            class="playtime-slider"
            v-model="playTime"
            id="playtimeSlider"
            :disabled="detailFiles.length === 0"
            :min="sliderMIn"
            :max="sliderMax"
            :range="true"
            :format-tooltip="playTimeFormat"
            @change="playTimeChange"
            :marks="playTimeSliderMarks"
          >
          </el-slider>
          <div class="slider-val-box">
            <div
              class="slider-val"
              v-for="item of detailFiles"
              :style="'width:' + getDataWidth(item) + '%; left:' + getDataLeft(item) + '%'"
            ></div>
          </div>
        </div>
      </div>
    </div>
    <recordDownload ref="recordDownloadRef" />
  </div>
</template>
<script lang="ts" setup>
import recordDownload from "./recordDownload.vue"
import { VideoPause, VideoPlay } from "@element-plus/icons-vue"
import { videoApi } from "@/api/geologicalDisaster"
import player from "./index.vue"
import dayjs from "dayjs"
const recordDownloadRef = ref<any>(null)

const show = ref(false)
const fullBoolean = ref(false)
const shortcuts = [
  {
    text: "最近2小时",
    value: () => {
      const end = dayjs().format("YYYY-MM-DD HH:mm:ss")
      const start = dayjs().subtract(2, "hours").format("YYYY-MM-DD HH:mm:ss")
      return [start, end]
    }
  },
  {
    text: "最近4小时",
    value: () => {
      const end = dayjs().format("YYYY-MM-DD HH:mm:ss")
      const start = dayjs().subtract(4, "hours").format("YYYY-MM-DD HH:mm:ss")
      return [start, end]
    }
  },
  {
    text: "最近8小时",
    value: () => {
      const end = dayjs().format("YYYY-MM-DD HH:mm:ss")
      const start = dayjs().subtract(8, "hours").format("YYYY-MM-DD HH:mm:ss")
      return [start, end]
    }
  },
  {
    text: "最近24小时",
    value: () => {
      const end = dayjs().format("YYYY-MM-DD HH:mm:ss")
      const start = dayjs().subtract(1, "day").format("YYYY-MM-DD HH:mm:ss")
      return [start, end]
    }
  }
]
const defaultTime = [dayjs().subtract(2, "hours").format("YYYY-MM-DD HH:mm:ss"), dayjs().format("YYYY-MM-DD HH:mm:ss")]
function calendarChange(dates) {}
const disabledDate = (time: any) => {
  if (time.getTime() > new Date().getTime()) {
    return time.getTime() >= new Date().getTime() //时间范围必须是时间戳
  }
}
const queryParams = ref({
  streamId: "", //流id
  deviceId: "", //设备id
  channelId: "", //通道id
  startTime: dayjs().subtract(2, "hours").format("YYYY-MM-DD HH:mm:ss"),
  endTime: dayjs().format("YYYY-MM-DD HH:mm:ss")
})
const timeRange = ref([
  dayjs().subtract(2, "hours").format("YYYY-MM-DD HH:mm:ss"),
  dayjs().format("YYYY-MM-DD HH:mm:ss")
])
const playSpeed = ref(1) //当前播放速度

const videoUrl = ref("") //播放地址
const videoError = ref("") //播放错误信息
const hasAudio = ref(false)
const recordVideoPlayer = ref<any>(null)
const isdownload = ref(false)
//播放时间
const playTime = ref<any>(null)
const sliderMIn = ref(0)
const sliderMax = ref(86400)
const chooseDate = ref(dayjs().format("YYYY-MM-DD"))
const streamInfo = ref<any>(null) //流信息
const recordsLoading = ref(false) //是否正在加载
const uid = ref("1") //唯一id
const historyUrl = ref("") //回放地址
const isPlaying = ref(false) // 是否正在播放
const playTimeSliderMarks = ref({
  0: "00:00",
  3600: "01:00",
  7200: "02:00",
  10800: "03:00",
  14400: "04:00",
  18000: "05:00",
  21600: "06:00",
  25200: "07:00",
  28800: "08:00",
  32400: "09:00",
  36000: "10:00",
  39600: "11:00",
  43200: "12:00",
  46800: "13:00",
  50400: "14:00",
  54000: "15:00",
  57600: "16:00",
  61200: "17:00",
  64800: "18:00",
  68400: "19:00",
  72000: "20:00",
  75600: "21:00",
  79200: "22:00",
  82800: "23:00",
  86400: "24:00"
})
//处理时间信息
const detailFiles = ref([])
const deviceName = ref("") //设备名称

/** 打开弹窗 */
const openDialog = async (data: any) => {
  queryParams.value.deviceId = data.deviceid
  deviceName.value = data.mc
  if (data.setTime) {
    chooseDate.value = dayjs(data.setTime).format("YYYY-MM-DD")
    queryParams.value.startTime = dayjs(data.setTime).subtract(5, "minute").format("YYYY-MM-DD HH:mm:ss")
    queryParams.value.endTime = dayjs(data.setTime).add(1, "minute").format("YYYY-MM-DD HH:mm:ss")
    timeRange.value = [queryParams.value.startTime, queryParams.value.endTime]
  }
  show.value = true
  dateChange()
  // 开始回放
  // playRecord()
  window.addEventListener("beforeunload", stopPlayRecord)
}
//关闭
const emit = defineEmits(["close"])
const close = () => {
  show.value = false
  emit("close")
  window.removeEventListener("beforeunload", stopPlayRecord)
}
defineExpose({ openDialog }) // 提供 open 方法，用于打开弹窗

//时间切换
const changeDate = (val) => {
  console.log(val)
  if (val) {
    if (dayjs(val[0]).format("YYYY-MM-DD") != dayjs(val[1]).format("YYYY-MM-DD")) {
      ElMessage.warning("日期不能跨天！")
      timeRange.value = [queryParams.value.startTime, queryParams.value.endTime]
      return
    }
    if (val[0] == val[1]) {
      ElMessage.warning("开始和结束时间点不能相同！")
      timeRange.value = [queryParams.value.startTime, queryParams.value.endTime]
      return
    }
    chooseDate.value = dayjs(val[0]).format("YYYY-MM-DD")
    queryParams.value.startTime = val[0]
    queryParams.value.endTime = val[1]
    uid.value = new Date().getTime() + ""
    dateChange()
  }
}
//截屏、全屏
const handleEvent = (val) => {
  if (val == "截屏") {
    console.log(val)
    recordVideoPlayer.value.screenshot()
  } else if (val == "全屏") {
    fullScreen()
  }
}
//全屏
const fullScreen = () => {
  if (!fullBoolean.value) {
    //如果未全屏，则开启全屏
    fullBoolean.value = true
    //获取需要全屏的元素
    let full = document.getElementById("dialogCon")
    //开启全屏方法
    toFullscreen(full)
    //分辨率调整后，重新初始化方法
  } else {
    //如果已全屏，则退出全屏
    fullBoolean.value = false
    //退出全屏方法
    cancelFullscreen()
    //分辨率调整后，重新初始化方法
    // this.init();
  }
}
//全屏方法
function toFullscreen(element) {
  //全屏
  if (element.requestFullscreen) {
    element.requestFullscreen()
  }
  //兼容Firefox全屏
  else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen()
  }
  //兼容Chrome Safari Opera全屏
  else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen()
  }
  //兼容IE Edge全屏
  else if (element.msRequestFullscreen) {
    element.msRequestFullscreen()
  }
}
//退出全屏
function cancelFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen()
  } else if (document.hasOwnProperty("mozCancelFullScreen")) {
    ;(document as any).mozCancelFullScreen()
  } else if (document.hasOwnProperty("webkitCancelFullScreen")) {
    ;(document as any).webkitCancelFullScreen()
  } else if (document.hasOwnProperty("msExitFullscreen")) {
    ;(document as any).msExitFullscreen()
  }
}

//获取回放数据
function dateChange() {
  if (!chooseDate.value) {
    return
  }
  setTime(queryParams.value.startTime, queryParams.value.endTime)
  recordsLoading.value = true
  detailFiles.value = []
  let query = {
    deviceId: queryParams.value.deviceId,
    beginTime: queryParams.value.startTime,
    endTime: queryParams.value.endTime,
    Playtype: "ws"
  }
  chooseDate.value = dayjs(queryParams.value.startTime).format("YYYY-MM-DD")
  videoApi
    .getPlaybackURL(query)
    .then((res) => {
      recordsLoading.value = false
      if (res.success) {
        if (!res.response.list) {
          ElMessage.warning("该设备当前时段暂无录像数据！")
          return
        }
        // 处理时间信息
        detailFiles.value = res.response.list
        historyUrl.value = res.response.url.split("?")[0]
        // 开始回放
        playRecord(historyUrl.value, query.beginTime, query.endTime)
      } else {
        ElMessage({
          showClose: true,
          message: res.msg,
          type: "error"
        })
      }
    })
    .catch((e) => {
      recordsLoading.value = false
    })
}

function playTimeFormat(val: any) {
  let h = parseInt((val / 3600).toString())
  let m = parseInt(((val - h * 3600) / 60).toString())
  let s = parseInt((val - h * 3600 - m * 60).toString())

  let hStr: any = h
  let mStr: any = m
  let sStr: any = s
  if (h < 10) {
    hStr = "0" + hStr
  }
  if (m < 10) {
    mStr = "0" + mStr
    s
  }
  if (s < 10) {
    sStr = "0" + sStr
  }
  return hStr + ":" + mStr + ":" + sStr
}
function setTime(startTime, endTime) {
  queryParams.value.startTime = startTime
  queryParams.value.endTime = endTime
  let start = (new Date(startTime).getTime() - new Date(chooseDate.value + " 00:00:00").getTime()) / 1000
  let end = (new Date(endTime).getTime() - new Date(chooseDate.value + " 00:00:00").getTime()) / 1000
  // console.log(start)
  // console.log(end)
  playTime.value = [start, end]
  timeRange.value = [startTime, endTime]
}
function getDataWidth(item: any) {
  let timeForFile: any = getTimeForFile(item)
  let result = timeForFile[2] / ((sliderMax.value - sliderMIn.value) * 1000)
  return result * 100
}
function getDataLeft(item) {
  let timeForFile: any = getTimeForFile(item)
  let differenceTime: any = timeForFile[0].getTime() - new Date(chooseDate.value + " 00:00:00").getTime()
  let str = ((differenceTime - sliderMIn.value * 1000) / ((sliderMax.value - sliderMIn.value) * 1000)).toString()
  return parseFloat(str) * 100
}
function getTimeForFile(file) {
  file.beginTime = dayjs(file.beginTime).format("YYYY-MM-DD HH:mm:ss")
  file.endTime = dayjs(file.endTime).format("YYYY-MM-DD HH:mm:ss")
  let startTime = new Date(file.beginTime)
  let endTime = new Date(file.endTime)
  return [startTime, endTime, endTime.getTime() - startTime.getTime()]
}
function playTimeChange(val) {
  console.log(val)
  let startTimeStr = dayjs(new Date(chooseDate.value + " 00:00:00").getTime() + val[0] * 1000).format(
    "YYYY-MM-DD HH:mm:ss"
  )
  let endTimeStr = dayjs(new Date(chooseDate.value + " 00:00:00").getTime() + val[1] * 1000).format(
    "YYYY-MM-DD HH:mm:ss"
  )
  queryParams.value.startTime = startTimeStr
  queryParams.value.endTime = endTimeStr
  playRecord(historyUrl.value, startTimeStr, endTimeStr)
}
//回放
function playRecord(playURL, startTime, endTime) {
  setTime(startTime, endTime)
  recordVideoPlayer.value.playbackStart(playURL, startTime, endTime)
  isPlaying.value = true
  // if (isPlaying.value) {
  // 	stopPlayRecord(() => {
  // 		playRecord(playURL, startTime, endTime);
  // 	})
  // } else {
  // 	setTime(startTime, endTime);
  // 	recordVideoPlayer.value.playbackStart(playURL, startTime, endTime)
  // 	isPlaying.value = true
  // }
}
//停止录像回放
function stopPlayRecord(callback) {
  console.log("停止录像回放")
  if (isPlaying.value) {
    isPlaying.value = false
    recordVideoPlayer.value.stopPlay()
  }
}
//获取播放地址
function getUrlByStreamInfo() {
  if (location.protocol === "https:") {
    videoUrl.value = streamInfo.value["wss_flv"]
  } else {
    videoUrl.value = streamInfo.value["ws_flv"]
  }
  return videoUrl.value
}
//设置播放速度
const setSpeed = async (command) => {
  if (playSpeed.value < command) {
    let count = Math.ceil(command / playSpeed.value / 2)
    console.log("次数 " + count)
    for (let i = 0; i < count; i++) {
      playSpeed.value = await recordVideoPlayer.value.playbackFast()
    }
  } else if (playSpeed.value > command) {
    let count = Math.floor(playSpeed.value / command / 2)
    console.log("次数 " + count)
    for (let i = 0; i < count; i++) {
      playSpeed.value = await recordVideoPlayer.value.playbackSlow()
    }
    if (playSpeed.value == -4) {
      playSpeed.value = await recordVideoPlayer.value.playbackFast()
    }
    if (playSpeed.value == -2) {
      playSpeed.value = 0.5
    }
  }

  // playSpeed.value = command
  // console.log('前端控制：倍速 ' + command);
}
//下载录像
const downloadRecord = () => {
  // let query = {
  // 	beginTime: queryParams.value.startTime,
  // 	endTime: queryParams.value.endTime,
  // 	deviceId: queryParams.value.deviceId,
  // }
  // videoApi.getPlaybackURLUpload(query).then((res) => {
  // 	if (res.success) {
  // 		recordDownloadRef.value.openDialog(res.response.url, query);
  // 	}
  // 	else {
  // 		ElMessage({
  // 			showClose: true,
  // 			message: res.msg,
  // 			type: "error",
  // 		});
  // 	}
  // })
  recordVideoPlayer.value.downloadRecord(isdownload.value, deviceName.value)
}
//下载录像状态
const downloadRecordStatus = (val) => {
  isdownload.value = val
}
//历史播放暂停
const handlePlay = () => {
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    recordVideoPlayer.value.playbackResume()
  } else {
    recordVideoPlayer.value.playbackPause()
  }
}

onMounted(() => {})

onBeforeUnmount(() => {
  console.log("销毁视频")
})
</script>
<style scoped lang="scss">
.dialog {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 9;

  .dialog-con {
    width: 100%;
    height: 100%;
    background-color: #fff;
    position: absolute;
    left: 50%;
    top: 50%;
    padding: 10px;
    color: #333;
    transform: translate(-50%, -50%);
    background: #fff;
    overflow: hidden;
  }
}

.dialog-header {
  display: flex;
  height: 30px;
  margin-bottom: 16px;
  font-size: 14px;

  .time {
    display: flex;
    align-items: center;

    > span {
      margin-right: 10px;
      font-weight: 600;
    }
  }

  .speed {
    flex: 1;
    height: 30px;
    line-height: 30px;
    text-align: right;
    margin-right: 10px;
  }

  .btns {
    display: flex;
    align-items: center;
    height: 30px;

    .btn {
      /* width: 48px; */
      height: 30px;
      line-height: 30px;
      padding: 0 6px;
      text-align: center;
      color: #fff;
      background: var(--el-color-primary);
      border-radius: 3px;
      margin-left: 10px;
      cursor: pointer;
    }
  }
}

.video {
  position: relative;
  width: 100%;
  height: calc(100% - 30px - 16px - 50px);
  /* background: hsla(0, 0%, 50%, 0.5); */
}

.bottom {
  display: flex;
  align-items: center;
  height: 58px;
  background: #333;

  .playBtn {
    width: 40px;
    font-size: 30px;
    text-align: center;
    padding-left: 10px;
    padding-top: 10px;
    background: #333;
    color: #fff;
    cursor: pointer;
  }

  .slider-box {
    flex: 1;
    margin-left: 10px;
  }
}

.slider-box {
  position: relative;
  padding: 10px 20px;
  /* background: #333; */
  --el-color-info: #fff;

  .el-slider__runway {
    background-color: rgba(206, 206, 206, 0.47) !important;
  }

  .el-slider__bar {
    background-color: rgba(153, 153, 153, 0) !important;
  }

  .playtime-slider {
    position: relative;
    z-index: 100;
  }

  .slider-val-box {
    height: 6px;
    position: relative;
    top: -19px;
    z-index: 2;
  }

  .slider-val {
    height: 6px;
    background-color: var(--el-color-primary);
    position: absolute;
  }
}

#container {
  background: rgba(13, 14, 27, 0.7);
  width: 100%;
  height: 100%;
}
</style>
