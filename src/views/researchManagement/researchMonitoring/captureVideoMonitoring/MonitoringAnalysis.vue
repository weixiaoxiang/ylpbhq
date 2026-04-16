<script lang="ts" setup>
import {
  GetVideoTree,
  GetPreviewURLByType,
  GetMmonitoringCj,
  MmonitoringCjAddUpdate,
  GetPlaybackURL,
  GetPtzControl
} from "@/api"
import { Search } from "@element-plus/icons-vue"
import dayjs from "dayjs"
import { nanoid } from "nanoid"
const props = {
  children: "ChildModel",
  label: "label"
}
const keyWord = ref<string>("")
const treeRef = ref<any>(null)
watch(keyWord, (val) => {
  treeRef.value!.filter(val)
})
const filterNode = (value: any, data: any) => {
  if (!value) return true
  return data.label.indexOf(value) !== -1
}
const infoData = ref<any>({
  all: 0,
  online: 0,
  offline: 0
})
const data = ref<any>([])
// 获得监控树
const getData = async () => {
  const { response } = await GetVideoTree()
  response.forEach((item: any) => {
    if (item.ChildModel) {
      item.id = nanoid()
      item.label = item.videotype
      item.ChildModel.forEach((child: any) => {
        child.label = child.videoname
      })
      infoData.value.all += item.allcount
      infoData.value.online += item.onlinecount
      infoData.value.offline += item.allcount - item.onlinecount
    } else {
    }
  })
  data.value = response
}

const videoRefs = ref<any>([])
const videoUrl = ref<any>([])
const devicenumbers = ref<any>([])
let Playtype = "ws" // hik/rtsp/rtmp/hls/ws
const handleCheck = (data: any, _selected: any) => {
  console.log(data, _selected, 1)
}
const handleNodeClick = async (data: any) => {
  try {
    const promiseAll = []
    const devices: any = []
    if (data.ChildModel) {
      data.ChildModel.forEach((item: any) => {
        if (item.status !== "在线") {
          ElMessage.info("当前设备离线，无法播放！")
          return
        }
        promiseAll.push(GetPreviewURLByType({ deviceId: item.devicenumber, Playtype }))
        devices.push(item.devicenumber)
      })
    } else {
      if (data.status !== "在线") {
        ElMessage.info("当前设备离线，无法播放！")
        return
      }
      promiseAll.push(GetPreviewURLByType({ deviceId: data.devicenumber, Playtype }))
      devices.push(data.devicenumber)
    }
    const res = await Promise.all(promiseAll)
    res.forEach(({ response }: any, index: number) => {
      devicenumbers.value[currentWindow.value] = devices[index]
      startPlay(response)
    })
  } catch (error) {
    ElMessage.info("请求视频流失败！")
  }
}

// 开始播放
const startPlay = (url: string, index?: number) => {
  // console.log(videoRefs.value[0].$el, 1111)
  if (index === undefined || index === null) {
    index = currentWindow.value
  }
  videoUrl.value[index] = url
  if (currentMode.value === 1) {
    currentWindow.value = 0
  } else if (currentMode.value === 2) {
    currentWindow.value = currentWindow.value >= 3 ? 0 : ++currentWindow.value
  } else if (currentMode.value === 3) {
    currentWindow.value = currentWindow.value >= 5 ? 0 : ++currentWindow.value
  } else if (currentMode.value === 4) {
    currentWindow.value = currentWindow.value >= 8 ? 0 : ++currentWindow.value
  }
}

// 控制方向
const clickSwitch = async (command: string) => {
  let deviceId
  if (showReplayPanel.value) {
    // deviceId = replayDevice.value.devicenumber
    ElMessage.info("当前为回放模式，无法进行操作！")
    return
  } else {
    deviceId = devicenumbers.value[currentWindow.value]
  }

  const items = findNodes(data.value, deviceId, { key: "devicenumber", children: "ChildModel" })
  if (items.length > 0) {
    const remark2 = items[0].remark2
    if (remark2 !== "球机") {
      ElMessage.info("当前仅支持球机设备进行操作！")
      return
    }
  }

  let _action = "0"
  if (command === "STOP_TRACK") {
    _action = "1"
  }
  const { success } = await GetPtzControl({
    deviceId: deviceId,
    command: command,
    _action: _action,
    speed: 15
  })
  if (success) {
    ElMessage.success("操作成功！")
  } else {
    ElMessage.error("操作失败！")
  }
}

const modeCount = ref(1) // 格子展示·数量
const currentMode = ref<any>(1)
// 切换布局
const changeMode = (mode: number) => {
  currentMode.value = mode
  if (mode === 1) {
    modeCount.value = 1
  }
  if (mode === 2) {
    modeCount.value = 4
  }
  if (mode === 3) {
    modeCount.value = 6
  }
  if (mode === 4) {
    modeCount.value = 9
  }
  currentWindow.value = 0
}
const sceneData = ref<any>([])
const maxName = ref<number>(0) // 当前场景名称最大
// 获得场景
const getScene = async () => {
  const { response } = await GetMmonitoringCj()
  sceneData.value = response.slice(-2)
  maxName.value = Math.max(...response.map((item: any) => item.type))
}
const currenScene = ref(999)
const currentSceneData = ref<any>(null)
// 切换场景
const changeScene = (scene: number) => {
  currenScene.value = scene
  const data = sceneData.value.find((item: any) => item.id === scene)
  currentSceneData.value = data
  const deviceIds = data?.xlhlist?.split(",") || []
  videoUrl.value = []
  if (deviceIds.length === 0) {
    // return ElMessage.info("当前场景暂无视频！")
    return
  } else {
    if (deviceIds.length === 1) {
      changeMode(1)
    }
    if (deviceIds.length >= 2 && deviceIds.length < 5) {
      changeMode(2)
    }
    if (deviceIds.length >= 5 && deviceIds.length < 7) {
      changeMode(3)
    }
    if (deviceIds.length >= 7) {
      changeMode(4)
    }
  }
  const nodes = deviceIds.map((item: any) => {
    return {
      status: "在线",
      devicenumber: item
    }
  })
  handleNodeClick({
    ChildModel: nodes
  })
}
// 切换工具
const changeTool = (tool: number) => {
  // 保存场景
  if (tool === 1) {
    saveScene()
  }
  // 关闭视频
  if (tool === 2) {
    if (videoUrl.value[currentWindow.value]) {
      videoRefs.value[currentWindow.value].destroy()
      videoUrl.value[currentWindow.value] = ""
      devicenumbers.value.splice(currentWindow.value, 1)
    }
  }
  // 刷新视频
  if (tool === 3) {
    if (videoUrl.value[currentWindow.value]) {
      const url = videoUrl.value[currentWindow.value]
      videoRefs.value[currentWindow.value].play(url)
    }
  }
  // 全屏
  if (tool === 4) {
    fullScreenDisplay()
  }
}
// 保存场景
const saveScene = async () => {
  if (currenScene.value === 999) {
    currentSceneData.value = {
      type: maxName.value + 1
    }
  }
  const { msg } = await MmonitoringCjAddUpdate({
    id: currentSceneData.value.id,
    type: currentSceneData.value.type,
    xlhlist: devicenumbers.value.join(","),
    createtime: dayjs().format("YYYY-MM-DD HH:mm:ss")
  })
  ElMessage.info(msg)
  getScene()
}
// 全屏显示
const fullScreenDisplay = () => {
  const players = document.getElementById("players")
  players?.requestFullscreen()
}
const currentWindow = ref(0)
const changeWindow = (index: number) => {
  currentWindow.value = index
}

// 加载动画
const loading = ref(false)
const svg = `
        <path class="path" d="
          M 30 15
          L 28 17
          M 25.61 25.61
          A 15 15, 0, 0, 1, 15 30
          A 15 15, 0, 1, 1, 27.99 7.5
          L 15 15
        " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
      `

// 打开回放页面
const showReplayPanel = ref(false)
// 当前激活的回放工具
const currentReplayTool = ref(1)
const speed = ref(1)
// 切换回放工具
const changeReplayTool = (replayTool: number) => {
  currentReplayTool.value = replayTool
  // 返回
  if (replayTool === 4) {
    showReplayPanel.value = false
    speed.value = 1
  }
  // 倍速
  if (replayTool === 1) {
    replayVideoRef.value.doubleSpeed(2)
    speed.value = speed.value * 2
  }
  // 截屏
  if (replayTool === 3) {
    // 自定义文件名和清晰度
    captureAndDownload("replay-video", `回放截屏-${dayjs().valueOf()}`, 3)
  }
}
const replayDate = ref(dayjs().format("YYYY-MM-DD"))
let startTime = ""
let endTime = ""
const changeDate = () => {
  queryReplay()
}
// 回放
const replay = (data: any) => {
  showReplayPanel.value = true
  replayDevice.value = data
  queryReplay()
}
const replayVideoRef = ref<any>(null) // 回放视频ref
const replayUrl = ref<any>(null) // 回放地址
const replayDevice = ref<any>({}) // 回放设备
// 查询回放
const queryReplay = async () => {
  if (!replayDate.value) {
    ElMessage.info("请选择回放日期")
    return
  }
  startTime = dayjs(replayDate.value).format("YYYY-MM-DD") + " " + formatTooltip(replayTime.value)
  endTime = dayjs(replayDate.value).format("YYYY-MM-DD 23:59:59")
  try {
    loading.value = true
    const { response } = await GetPlaybackURL({
      deviceId: replayDevice.value.devicenumber, // "f3eae95f5045419aae6474a62850d79c",
      Playtype: "ws",
      beginTime: startTime,
      endTime: endTime
    })
    if (response?.url) {
      const startHkFormat = dayjs(replayDate.value).format("YYYY-MM-DD") + "T" + formatTooltip(replayTime.value) + "Z"
      const endHkFormat = dayjs(replayDate.value).format("YYYY-MM-DD") + "T" + "23:59:59Z"
      replayUrl.value = response.url
      ElMessage.success("播放成功，等待第一帧加载完成！")
      setTimeout(() => {
        replayVideoRef.value.replay(response.url, startHkFormat, endHkFormat)
      }, 100)
    } else {
      ElMessage.info("未能获取到视频流信息，请重新加载！")
    }
  } catch (error) {
    ElMessage.info("请求回放地址失败！")
  } finally {
    loading.value = false
  }
}
const replayTime = ref(0)
const marks = ref<any>({
  0: "00:00",
  // 4.166: '01:00',
  7200: "02:00",
  // 12.5: '03:00',
  14400: "04:00",
  // 20.833: '05:00',
  21600: "06:00",
  // 29.166: '07:00',
  28800: "08:00",
  // 37.5: '09:00',
  36000: "10:00",
  // 45.833: '11:00',
  43200: "12:00",
  // 54.166: '13:00',
  50400: "14:00",
  //  62.5: '15:00',
  57600: "16:00",
  // 70.833: '17:00',
  64800: "18:00",
  // 79.166: '19:00',
  72000: "20:00",
  // 87.5: '21:00',
  79200: "22:00",
  // 95.833: '23:00',
  86400: "24:00"
})
// 格式化时间轴
const formatTooltip = (val: number) => {
  return percentageToTime(val).formatted
}
// 将秒转换为当天具体的时间
const percentageToTime = (percentage: number) => {
  // 验证输入范围
  if (percentage < 0 || percentage > 86400) {
    throw new Error("时间必须在0到24小时之间")
  }
  // 根据百分比计算当天已经过的秒数
  const totalSeconds = percentage

  // 计算时分秒
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  // 格式化时间字符串
  const formatted = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`

  return {
    hours,
    minutes,
    seconds,
    formatted
  }
}
onMounted(() => {
  getData()
  getScene()
})
</script>
<template>
  <div class="monitoring-analysis">
    <div class="title-box">
      <img
        :src="$fun.getImg('researchManagement/icon14.png')"
        alt=""
      />
      监控分析
    </div>
    <div
      v-loading="loading"
      element-loading-text="视频加载中，请稍后..."
      :element-loading-spinner="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
      element-loading-background="rgba(9, 58, 121, 0.6)"
      class="main panzoom-exclude"
    >
      <div class="left-section">
        <div class="tree">
          <div class="infos">
            <div class="info">
              <img
                :src="$fun.getImg('researchManagement/icon15.png')"
                alt=""
              />
              <div>
                <div class="value1">{{ infoData.all }}</div>
                <div>设备总数</div>
              </div>
            </div>
            <div class="info">
              <img
                :src="$fun.getImg('researchManagement/icon16.png')"
                alt=""
              />
              <div>
                <div class="value2">{{ infoData.online }}</div>
                <div>在线总数</div>
              </div>
            </div>
            <div class="info">
              <img
                :src="$fun.getImg('researchManagement/icon17.png')"
                alt=""
              />
              <div>
                <div class="value3">{{ infoData.offline }}</div>
                <div>离线总数</div>
              </div>
            </div>
          </div>
          <el-input
            v-model.trim="keyWord"
            placeholder="请输入关键字"
            :prefix-icon="Search"
            clearable
            size="small"
          />
          <el-scrollbar height="100%">
            <el-tree
              :data="data"
              ref="treeRef"
              class="tree-data"
              :props="props"
              node-key="id"
              default-expand-all
              :expand-on-click-node="false"
              :filter-node-method="filterNode"
              @check="handleCheck"
              @node-click="handleNodeClick"
            >
              <template #default="{ node, data }">
                <div
                  v-if="data.ChildModel"
                  class="father-node-label"
                >
                  {{ data.label }}
                </div>
                <div
                  v-else
                  class="child-node-label"
                >
                  <div :class="{ offLine: data.status !== '在线' }">
                    <img
                      :src="$fun.getImg('researchManagement/monitor-icon1.png')"
                      alt=""
                    />
                    <span class="label-text"> {{ data.label }}</span>
                    <img
                      :src="$fun.getImg('researchManagement/phone-icon.png')"
                      alt=""
                    />
                  </div>
                  <div @click.stop="replay(data)">
                    <img
                      :src="$fun.getImg('researchManagement/replay-icon.png')"
                      alt=""
                    />
                  </div>
                </div>
              </template> </el-tree
          ></el-scrollbar>
        </div>
        <div
          v-if="videoUrl[currentWindow]"
          class="switch"
        >
          <img
            :src="$fun.getImg('researchManagement/switch-bg.svg')"
            alt=""
          />
          <img
            :src="$fun.getImg('researchManagement/switch-point.svg')"
            alt=""
            @click="clickSwitch('STOP_TRACK')"
          />
          <img
            :src="$fun.getImg('researchManagement/switch-top.svg')"
            alt=""
            @click="clickSwitch('UP')"
          />
          <img
            :src="$fun.getImg('researchManagement/switch-right.svg')"
            alt=""
            @click="clickSwitch('RIGHT')"
          />
          <img
            :src="$fun.getImg('researchManagement/switch-bottom.svg')"
            alt=""
            @click="clickSwitch('DOWN')"
          />
          <img
            :src="$fun.getImg('researchManagement/switch-left.svg')"
            alt=""
            @click="clickSwitch('LEFT')"
          />
        </div>
      </div>
      <div class="right-section">
        <div class="header-box">
          <div class="modes">
            <p>选择布局</p>
            <img
              class="mode"
              :class="{ current: currentMode === 1 }"
              :src="$fun.getImg('researchManagement/mode-icon1.png')"
              @click="changeMode(1)"
            />
            <img
              class="mode"
              :class="{ current: currentMode === 2 }"
              :src="$fun.getImg('researchManagement/mode-icon2.png')"
              @click="changeMode(2)"
            />
            <img
              class="mode"
              :class="{ current: currentMode === 3 }"
              :src="$fun.getImg('researchManagement/mode-icon3.png')"
              @click="changeMode(3)"
            />
            <img
              class="mode"
              :class="{ current: currentMode === 4 }"
              :src="$fun.getImg('researchManagement/mode-icon4.png')"
              @click="changeMode(4)"
            />
          </div>

          <el-scrollbar class="scrollbar">
            <div class="scene-box">
              <div
                :class="{ current: currenScene === 999 }"
                @click="changeScene(999)"
              >
                自定义场景
              </div>
              <div
                v-for="item in sceneData"
                :key="item.id"
                :class="{ current: currenScene === item.id }"
                @click="changeScene(item.id)"
              >
                {{ "场景" + item.type }}
              </div>
            </div>
          </el-scrollbar>
          <div class="tool-box">
            <div
              class="tool"
              @click="changeTool(1)"
            >
              <img
                :src="$fun.getImg('researchManagement/tool-icon1.png')"
                alt=""
              />
              保存场景
            </div>
            <div
              class="tool"
              @click="changeTool(2)"
            >
              <img
                :src="$fun.getImg('researchManagement/tool-icon2.png')"
                alt=""
              />
              关闭
            </div>
            <div
              class="tool"
              @click="changeTool(3)"
            >
              <img
                :src="$fun.getImg('researchManagement/tool-icon3.png')"
                alt=""
              />
              刷新
            </div>
            <div
              class="tool"
              @click="changeTool(4)"
            >
              <img
                :src="$fun.getImg('researchManagement/tool-icon4.png')"
                alt=""
              />
              全屏
            </div>
          </div>
        </div>
        <div
          class="contain"
          id="players"
          :class="[currentMode === 1 ? 'mode1' : currentMode === 2 ? 'mode2' : currentMode === 3 ? 'mode3' : 'mode4']"
        >
          <div
            v-for="(item, index) in modeCount"
            :key="item"
            class="monitor-box"
            :class="{ current: currentWindow === index }"
            @click="changeWindow(index)"
          >
            <span>从左侧列表选择</span>
            <hkVideo
              v-show="videoUrl[index]"
              :ref="(el) => (videoRefs[index] = el)"
              :video-url="videoUrl[index]"
              :currentLayout="currentMode"
            />
          </div>
        </div>
        <div
          v-if="showReplayPanel"
          class="replay"
        >
          <div class="header-box">
            <div class="modes">
              <p>选择日期</p>
              <el-date-picker
                v-model="replayDate"
                type="date"
                size="small"
                popper-class="custom-datepicker-popper"
                @change="changeDate"
              />
            </div>

            <div class="tool-box">
              <p>播放速度:{{ speed }}</p>
              <div
                class="tool"
                :class="{ current: currentReplayTool === 1 }"
                @click="changeReplayTool(1)"
              >
                <img
                  :src="$fun.getImg('researchManagement/replaytool-icon1.png')"
                  alt=""
                />
                倍速
              </div>
              <!-- <div
                class="tool"
                :class="{ current: currentReplayTool === 2 }"
                @click="changeReplayTool(2)"
              >
                <img
                  :src="$fun.getImg('researchManagement/replaytool-icon2.png')"
                  alt=""
                />
                下载
              </div> -->
              <div
                class="tool"
                :class="{ current: currentReplayTool === 3 }"
                @click="changeReplayTool(3)"
              >
                <img
                  :src="$fun.getImg('researchManagement/replaytool-icon3.png')"
                  alt=""
                />
                截屏
              </div>
              <div
                class="tool"
                :class="{ current: currentReplayTool === 4 }"
                @click="changeReplayTool(4)"
              >
                <img
                  :src="$fun.getImg('researchManagement/replaytool-icon4.png')"
                  alt=""
                />
                返回
              </div>
            </div>
          </div>
          <div class="contain mode1">
            <div
              id="replay-video"
              class="monitor-box"
            >
              <hkVideo
                ref="replayVideoRef"
                :isHistory="showReplayPanel"
                :video-url="replayUrl"
                :currentLayout="currentMode"
              />
            </div>
          </div>
          <div class="time-line">
            <div class="name">{{ replayDevice.label }}</div>
            <div class="time-line-box">
              <el-slider
                v-model="replayTime"
                :min="0"
                :max="86400"
                :marks="marks"
                :format-tooltip="formatTooltip"
                @change="queryReplay"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.monitoring-analysis {
  position: relative;
  width: 62.5vw;
  height: 720px;
  background: url("@/assets/images/dialog-bg.png") no-repeat center center / 100% 100%;
  display: flex;
  flex-direction: column;
  padding: 0 1.25vw;
  .title-box {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 50px;
    font-size: 0.9375vw;
    padding-top: 15px;
    img {
      width: 1.3542vw;
      margin-right: 0.5208vw;
    }
  }
  .main {
    display: flex;
    gap: 0.5208vw;
    flex: 1;
    margin-bottom: 20px;
    overflow: hidden;
    .left-section {
      width: 15.625vw;
      min-width: 240px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      :deep(.tree) {
        display: flex;
        flex-direction: column;
        gap: 10px;
        overflow-y: hidden;
        height: 450px;
        background-color: #011226;
        box-shadow: 0 0 8px 1px rgba(255, 255, 255, 0.1) inset;
        border-radius: 4px;
        padding: 1.0417vw 0.7292vw;
        .infos {
          display: flex;
          justify-content: space-between;
          .info {
            display: flex;
            align-items: center;
            gap: 0.3125vw;
            > div {
              font-size: 0.625vw;
              color: #aab8c8;
              .value1 {
                font-size: 0.7813vw;
                color: #19a8e5;
              }
              .value2 {
                font-size: 0.7813vw;
                color: #19a8e5;
              }
              .value3 {
                font-size: 0.7813vw;
                color: #f94340;
              }
            }
          }
        }
        .el-input__wrapper {
          background-color: #0c284d;
          color: #aab4c1;
          box-shadow: none;
        }
        .tree-data {
          background: transparent !important;
          .el-tree-node__expand-icon {
            color: #aab4c1 !important;
          }
          .el-tree-node:focus > .el-tree-node__content {
            background-color: #1b345a;
          }
          .el-tree-node__content:hover {
            background-color: #1b345a;
          }
          .el-tree-node__content {
            height: 42px;
          }
          .father-node-label {
            font-size: 0.8333vw;
            color: #fff;
          }
          .child-node-label {
            flex: 1;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.7292vw;
            color: #fff;
            padding-right: 1.0417vw;
            > div {
              display: flex;
              align-items: center;
              &.offLine {
                filter: brightness(0.5);
                cursor: not-allowed;
              }
              .label-text {
                display: inline-block;
                margin-left: 6px;
                margin-right: 8px;
              }
              img {
                width: 1.1458vw;
              }
            }
          }

          .is-checked {
            .child-node-label {
              background: url("@/assets/images/patrol/active-circle.png") no-repeat left center / 10px 10px;
            }
          }
          .el-checkbox {
            .is-indeterminate {
              .el-checkbox__inner {
                background: #01b3ff;
                border: 1px solid #01b3ff;
              }
            }
            .el-checkbox__inner {
              background: rgb(17, 34, 46);
              border: 1px solid #3e3e3e;
            }
          }
          .el-checkbox.is-checked {
            .el-checkbox__inner {
              background: #01b3ff;
              border: 1px solid #01b3ff;
            }
          }
          .el-tree-node__expand-icon {
            color: #01b3ff;
          }
        }
      }
      .switch {
        flex: 1;
        position: relative;
        background: linear-gradient(to bottom, #0f2131 0%, #073f85 100%);
        box-shadow: 0 0 8px 1px rgba(255, 255, 255, 0.1) inset;
        border-radius: 4px;
        img {
          &:nth-child(1) {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 10.5208vw;
            max-width: 160px;
          }
          &:nth-child(2) {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 1.9271vw;
            cursor: pointer;
          }
          &:nth-child(3) {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, calc(-50% - 1.8vw));
            width: 1.7708vw;
            cursor: pointer;
          }
          &:nth-child(4) {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(calc(-50% + 1.8vw), -50%);
            width: 0.8854vw;
            cursor: pointer;
          }
          &:nth-child(5) {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, calc(-50% + 1.8vw));
            width: 1.7708vw;
            cursor: pointer;
          }
          &:nth-child(6) {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(calc(-50% - 1.8vw), -50%);
            width: 0.8854vw;
            cursor: pointer;
          }
        }
      }
    }
    .right-section {
      position: relative;
      flex: 1;
      display: flex;
      flex-direction: column;
      font-size: 0.8333vw;
      color: #9facbc;
      overflow: hidden;
      .header-box {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5208vw;
        .modes {
          display: flex;
          align-items: center;
          gap: 0.5208vw;
          .mode {
            width: 1.3542vw;
            box-sizing: content-box;
            opacity: 0.3;
            transition: all 0.3s;
            cursor: pointer;
            &.current {
              opacity: 1;
            }
          }
        }
        :deep(.scrollbar) {
          overflow-x: auto;
          width: 12.5vw;
          .el-scrollbar__view {
            height: 100%;
            .scene-box {
              height: 100%;
              display: flex;
              align-items: center;
              gap: 0.5208vw;

              > div {
                padding-bottom: 2px;
                text-overflow: ellipsis;
                white-space: nowrap;
                cursor: pointer;
                &.current {
                  color: #2aeaf7;
                  border-bottom: 1px solid #2aeaf7;
                }
              }
            }
          }
        }
        .tool-box {
          display: flex;
          align-items: center;
          gap: 0.5208vw;
          .tool {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 3px;
            padding: 0 0.5208vw;
            height: 26px;
            font-size: 0.7292vw;
            box-shadow: 0 0 5px 1px rgba(29, 164, 184, 1) inset;
            border: 1px solid #1fadc1;
            border-radius: 2px;
            color: #1d98ac;
            transition: all 0.3s;
            cursor: pointer;
            transition: all 0.3s;
            img {
              width: 0.7292vw;
              opacity: 0.5;
              transition: all 0.3s;
            }
            &.current {
              background-color: #1d98ac;
              color: #1a393a;
              img {
                opacity: 1;
              }
            }
          }
        }
      }
      .contain {
        width: 100%;
        flex: 1;
        display: grid;
        gap: 0.3125vw;
        margin-top: 10px;
        overflow: hidden;
        &.mode1 {
          grid-template-columns: repeat(1, 1fr);
          grid-auto-rows: calc(100%);
        }
        &.mode2 {
          grid-template-columns: repeat(2, 1fr);
          grid-auto-rows: calc((100% - 0.3125vw) / 2);
        }
        &.mode3 {
          grid-template-columns: repeat(3, 1fr);
          .monitor-box:nth-child(1) {
            grid-row: 1 / 3;
            grid-column: 1 / 3;
          }
          grid-auto-rows: calc((100% - 0.625vw) / 3);
        }
        &.mode4 {
          grid-template-columns: repeat(3, 1fr);
          grid-auto-rows: calc((100% - 0.625vw) / 3);
        }
        .monitor-box {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #2e2e2e;
          border: 1px solid #057ec7;
          border-radius: 2px;
          overflow: hidden;
          span {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
          }
          &.current {
            border: 2px dashed #d58514;
          }
        }
      }
      .replay {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        display: flex;
        flex-direction: column;
        padding: 0.5208vw;
        gap: 0.3125vw;
        font-size: 0.6771vw;
        color: #9facbc;
        background: linear-gradient(to bottom, #0f2131 0%, #073f85 100%);
        :deep(.header-box) {
          .el-input {
            width: 150px;
            .el-input__wrapper {
              background-color: rgba(60, 93, 128, 0.5);
              box-shadow: none;
              .el-input__inner {
                color: #fff;
              }
            }
          }
        }
        .tool {
          padding: 0 0.2083vw;
        }
        .time-line {
          display: flex;
          flex-direction: column;
          // position: absolute;
          // bottom: 0;
          // left: 0;
          // right: 0;
          height: 70px;
          background-color: #121212;
          display: flex;
          font-size: 0.625vw;
          color: #fff;
          // margin: 0 0.5208vw;
          .name {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.7813vw;
            line-height: 2em;
            padding: 0 0.5208vw;
          }
          :deep(.time-line-box) {
            flex: 1;
            padding: 0 1.8229vw;
            .el-slider {
              .el-slider__bar {
                background-color: #11ae68;
              }
              .el-slider__button {
                width: 1.0417vw;
                height: 1.0417vw;
                border-color: #11ae68;
              }
              .el-slider__stop {
                background-color: #ffffff;
              }
              .el-slider__runway {
                background-color: #747474;
              }
              .el-slider__marks-text {
                font-size: 0.7292vw;
              }
            }
          }
        }
        .contain {
          margin-top: 0;
          flex: 1;
        }
      }
    }
  }
}
</style>
