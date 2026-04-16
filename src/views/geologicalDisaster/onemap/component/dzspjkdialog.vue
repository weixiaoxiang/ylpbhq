<template>
  <div class="data-panel-dzsp">
    <div class="title-box">
      <img
        :src="$fun.getImg('researchManagement/icon14.png')"
        alt=""
      />
      <div>地灾视频监控</div>
    </div>
    <div class="mian">
      <div class="left-box1">
        <leftTree
          @clickTree="clickTree"
          :currentVideo="currentVideo"
          @contextMenuEvent="contextMenuEvent"
          @controlChange="controlChange"
          @playHistory="playHistory"
          :isPlayeHistory="isPlayeHistory"
        />
      </div>
      <div
        class="right-box"
        v-if="!isPlayeHistory"
      >
        <div class="header-btn">
          <div class="layout">
            <span style="color: #abb9ca">选择布局</span>
            <img
              class="mode"
              :class="{ current: currentLayout === 1 }"
              :src="$fun.getImg('researchManagement/mode-icon1.png')"
              @click="changeLayout(1)"
            />
            <img
              class="mode"
              :class="{ current: currentLayout === 4 }"
              :src="$fun.getImg('researchManagement/mode-icon2.png')"
              @click="changeLayout(4)"
            />
            <img
              class="mode"
              :class="{ current: currentLayout === 6 }"
              :src="$fun.getImg('researchManagement/mode-icon3.png')"
              @click="changeLayout(6)"
            />
            <img
              class="mode"
              :class="{ current: currentLayout === 9 }"
              :src="$fun.getImg('researchManagement/mode-icon4.png')"
              @click="changeLayout(9)"
            />
          </div>
          <div class="btns">
            <!-- <el-dropdown
              :teleported="false"
              trigger="click"
            >
              <div class="dropdown">
                <span class="name"> {{ playWay }}</span>
                <el-icon>
                  <ArrowDown />
                </el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click.stop="changePlayer('rtsp')"> rtsp </el-dropdown-item>
                  <el-dropdown-item @click.stop="changePlayer('hls')"> hls </el-dropdown-item>
                  <el-dropdown-item @click.stop="changePlayer('ws')"> ws </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown> -->
            <div
              class="fun-btn"
              :class="{ active: currentTool === 1 }"
              @click="handleClose()"
            >
              <img
                :src="$fun.getImg('researchManagement/tool-icon2.png')"
                alt=""
              />
              关闭
            </div>
            <div
              class="fun-btn"
              :class="{ active: currentTool === 2 }"
              @click="handleRefresh()"
            >
              <img
                :src="$fun.getImg('researchManagement/tool-icon3.png')"
                alt=""
              />
              刷新
            </div>
            <div
              class="fun-btn"
              :class="{ active: currentTool === 3 }"
              @click="handleFullScreen()"
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
          id="videoBox"
          class="video-list"
          :class="'videoBox' + currentLayout"
        >
          <div
            class="video-item"
            :class="{ active: activeIndex == index }"
            v-for="(item, index) in currentLayout"
            :key="index"
            @click="changeIndex(index)"
          >
            <div
              v-if="!videoUrlArr[index]"
              class="video-label"
            >
              {{ index + 1 }}
            </div>
            <Ovsyunlive
              v-else-if="playWay == 'rtsp'"
              ref="recordVideoPlayer"
              :currentLayout="currentLayout"
              :videoUrl="videoUrlArr[index].url"
              :uid="index"
            />
            <!-- <livePlayerVideo
              v-else-if="playWay == 'hls'"
              ref="recordVideoPlayer"
              :currentLayout="currentLayout"
              :videoUrl="videoUrlArr[index].url"
              :uid="index"
            /> -->
            <easyVideo
              v-else-if="playWay == 'hls'"
              ref="recordVideoPlayer"
              :currentLayout="currentLayout"
              :videoUrl="videoUrlArr[index]?.url"
              :uid="index"
            />
            <hkVideo
              v-else-if="playWay == 'ws'"
              ref="recordVideoPlayer"
              :currentLayout="currentLayout"
              :videoUrl="videoUrlArr[index].url"
              :uid="index"
            />
          </div>
        </div>
      </div>
      <history
        class="right-box2"
        v-if="isPlayeHistory"
        ref="historyVideoRef"
        @close="isPlayeHistory = false"
      ></history>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { GeologicHazard_VideoPlay } from "@/api"
import history from "@/components/hkVideo/historydzsp.vue"
import hkVideo from "@/components/hkVideo/index.vue"
import livePlayerVideo from "@/components/livePlayer/index.vue"
import Ovsyunlive from "@/components/ovsyunlive/index.vue"
import { ArrowDown } from "@element-plus/icons-vue"
import leftTree from "./videoMonitoring/leftTree.vue"
const currentVideo = computed(() => {
  return videoUrlArr.value[activeIndex.value]
})
//云台控制
const controlChange = async (type: any, action = 1) => {
  const index = activeIndex.value
  if (!videoUrlArr.value[index]) {
    ElMessage.warning("当前窗口未播放设备!")
    return
  }
}

//播放历史
const playHistory = (data: any) => {
  isPlayeHistory.value = true
  videoUrlArr.value = []
  nextTick(() => {
    historyVideoRef.value.openDialog(data)
  })
}

// 当前激活的工具
const currentTool = ref()
const currentLayout = ref(9)
const playWay = ref("hls")
const isPlayeHistory = ref(false)
const historyVideoRef = ref()

//切换播放方式
const changePlayer = (type: string) => {
  playWay.value = type
  let arr = JSON.parse(JSON.stringify(videoUrlArr.value))
  videoUrlArr.value = []
  arr.forEach(async (item: any) => {
    if (item) {
      item.url = await getVideoUrl(item.deviceid)
      videoUrlArr.value.push(item)
    }
  })
}
//切换播放索引
const changeIndex = (index: number) => {
  activeIndex.value = index
}

//关闭
const handleClose = () => {
  currentTool.value = 1
  videoUrlArr.value = []
}

//刷新
const handleRefresh = () => {
  currentTool.value = 2

  let arr = JSON.parse(JSON.stringify(videoUrlArr.value)) //创建了一个videoUrlArr.value的深拷贝
  videoUrlArr.value = []
  nextTick(() => {
    videoUrlArr.value = arr
  })
}

//全屏
const handleFullScreen = () => {
  let element: any = document.getElementById("videoBox")
  currentTool.value = 3
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

const activeIndex = ref(0) // 当前播放的索引
const videoUrlArr = ref<any>([]) // 视频地址
//切换布局
const changeLayout = (value: any) => {
  currentLayout.value = value
  if (activeIndex.value >= value) {
    activeIndex.value = 0
  }
  for (let i = 0; i < currentLayout.value; i++) {
    if (!videoUrlArr.value[i]) {
      videoUrlArr.value[i] = ""
    }
  }
}
//获取视频地址
const getVideoUrl = (deviceId: any) => {
  let query = {
    protocol: 4,
    deviceSerial: deviceId
  }
  return GeologicHazard_VideoPlay(query)
    .then((res: any) => {
      if (res.data) {
        let { data: videoData, msg } = res.response
        if (!videoData) {
          return ElMessage.info(msg)
        } else {
          const { url } = videoData
          return url
        }
      } else {
        ElMessage.error(res.msg)
        return ""
      }
    })
    .catch((err: any) => {})
}

//点击左侧树播放视频
const clickTree = async (data: any, playIndex = activeIndex.value) => {
  if (isPlayeHistory.value) return
  if (data.status == "离线") {
    ElMessage.warning("该设备不在线!")
    return
  }
  let ele = videoUrlArr.value.findIndex((i: any) => {
    return i && i.id == data.id
  })
  if (ele != -1) {
    ElMessage.warning("该设备已播放!")
    return
  }
  let { response }: any = await GeologicHazard_VideoPlay({
    protocol: 4,
    deviceSerial: data.deviceserial
  })
  const { data: videoData, msg } = response
  if (!videoData) {
    return ElMessage.info(msg)
  } else {
    const { url } = videoData
    videoUrlArr.value[playIndex] = null
    nextTick(() => {
      videoUrlArr.value[playIndex] = {
        name: data.name,
        url: url || "",
        id: data.id,
        deviceid: data.deviceserial,
        equipmentid: data.equipmentid
      }
    })
  }
}

//右键树节点
const contextMenuEvent = (data: any) => {
  let videosArr = Object.assign({}, data)?.Children || []

  let videos = videosArr.filter((i: any) => i.status == "0")

  if (videos.length == 1) {
    currentLayout.value = 1
  } else if (videos.length < 5) {
    currentLayout.value = 4
  } else if (videos.length < 9) {
    currentLayout.value = 6
  } else {
    currentLayout.value = 9
  }
  videoUrlArr.value = []
  let arr = videos
  if (arr.length > 9) {
    arr = arr.slice(0, 9)
  }
  arr.forEach((item: any, index: any) => {
    clickTree(item, index)
  })
}
</script>

<style lang="scss" scoped>
.data-panel-dzsp {
  width: vw(1320);
  height: vh(885);
  background: url("/images/geologicalDisaster/dialog-bg.png") no-repeat center center / 100% 100%;
  display: flex;
  flex-direction: column;
  .title-box {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 70px;
    color: #fff;
    img {
      width: 1.3542vw;
      margin-right: 0.5208vw;
    }
  }
  .mian {
    flex: 1;
    display: flex;
    padding: 0 24px;
    // flex-direction: column;
    overflow-y: hidden;
    height: calc(100% - 70px);
    justify-content: space-around;

    .left-box1 {
      width: 308.82px;
      height: vh(528);
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .right-box {
      width: 1236px;
      height: calc(100% - 84px);
      // background: #fff;
    }
    .right-box2 {
      position: relative;
      width: 1236px;
      height: calc(100% - 84px);
    }
    .header-btn {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 40px;
      margin-bottom: 10px;
      .layout {
        display: flex;
        align-items: center;
        font-weight: 500;
        font-size: 16px;
        > span {
          margin-right: 20px;
        }

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

        .layout-data {
          display: flex;
          .item {
            margin-right: 20px;
            cursor: pointer;
            font-size: 24px;
            color: rgba(196, 196, 196, 1);
            &.active {
              color: #1890ff;
            }
          }
        }
      }
      .tabs {
        display: flex;
        height: 40px;
        border-radius: 32px;
        border: 1px solid #a8abb2;
        overflow: hidden;
        .tab-item {
          line-height: 40px;
          text-align: center;
          padding: 0 20px;
          cursor: pointer;
          &.active {
            color: #fff;
            background: var(--el-color-primary);
          }
          &:nth-child(2) {
            border-left: 1px solid #a8abb2;
            border-right: 1px solid #a8abb2;
          }
        }
      }
      .btns {
        display: flex;
        align-items: center;
        .el-dropdown {
          color: #fff;
        }
        .dropdown {
          margin-right: 20px;
          cursor: pointer;
        }

        .fun-btn {
          position: relative;
          width: 88.55px;
          height: 33.73px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 8px;
          box-shadow: 0 0 5px 1px rgba(29, 164, 184, 1) inset;
          border: 1px solid #1fadc1;
          border-radius: 2px;
          color: #1d98ac;
          cursor: pointer;
          &.active {
            background-color: #1d98ac;
            color: #1a393a;
            img {
              opacity: 1;
            }
          }
        }
      }
    }
    .video-list {
      height: calc(100% - 50px);
      .video-item {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #000;
        box-sizing: border-box;
        border: 2px solid rgba(0, 0, 0, 0.2);
        cursor: pointer;
        &.active {
          border: 4px solid rgba(0, 82, 217, 1);
        }
        .video-label {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #ffffff;
          font-size: 30px;
          font-weight: bold;
          z-index: 1;
        }
      }
    }
    .videoBox1 {
      .video-item {
        width: 100%;
        height: 100%;
      }
    }
    .videoBox4 {
      .video-item {
        float: left;
        width: calc((100% - 16px) / 2);
        height: calc((100% - 16px) / 2);
        &:nth-child(-n + 3) {
          margin-bottom: 16px;
        }
        &:nth-child(2n) {
          margin-left: 16px;
        }
      }
    }
    .videoBox6 {
      position: relative;
      .video-item {
        position: absolute;
        width: calc((100% - 32px) / 3);
        height: calc((100% - 32px) / 3);
        &:nth-child(1) {
          width: calc(((100% - 32px) / 3) * 2 + 16px);
          height: calc(((100% - 32px) / 3) * 2 + 16px);
          margin-right: 16px;
        }
        &:nth-child(2) {
          right: 0;
        }
        &:nth-child(3) {
          top: calc((100% - 32px) / 3 + 16px);
          right: 0;
        }
        &:nth-child(n + 3) {
          bottom: 0;
        }
        &:nth-child(5) {
          left: calc((100% - 32px) / 3 + 16px);
        }
        &:nth-child(6) {
          right: 0;
        }
      }
    }
    .videoBox9 {
      .video-item {
        float: left;
        width: calc((100% - 32px) / 3);
        height: calc((100% - 32px) / 3);
        &:nth-child(-n + 7) {
          margin-bottom: 16px;
        }
        &:nth-child(3n-1) {
          margin: 0 16px;
        }
      }
    }
  }
}
</style>
