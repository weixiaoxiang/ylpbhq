<script setup lang="ts">
import { DeleteCommandRecord, GetAlarm_CommandRecordByPage, GetPlaybackURL, PutAlarm_HandleStatusById } from "@/api"
import EmptyData from "@/components/Status/EmptyData.vue"
import { u } from "@/utils/viewerjs"
import dayjs from "dayjs"
interface Props {
  detail: any
}
const props = withDefaults(defineProps<Props>(), {
  detail: {}
})
const emit = defineEmits<{
  previewCommand: [any]
  addPlot: []
}>()
const { proxy } = getCurrentInstance() as any
const activeTab = ref("预警抓图")
const tabs = ref(["预警抓图", "视频回放", "历史监控"])
const zhjlData = ref<any>([]) // 指挥记录数据

//切换tab
const changeTab = (item: string) => {
  activeTab.value = item
  playBackDate.value = null
  if (item == "视频回放") {
    queryReplay()
  }
}
//返回列表
const back = () => {
  proxy.$mitt.emit("activePage", "")
}

// 查看预警抓图
const viewImg = () => {
  if (props.detail.imgsrcList.length > 0) {
    u.showPreviewImg(0, props.detail.imgsrcList.map((item: string) => `/fireStaticUrl/${item}`).reverse())
  } else {
    ElMessage.warning("暂无预警抓图")
  }
}

// 加载动画
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
const videoRef = ref<any>(null) // 回放视频ref
const videoUrl = ref<any>(null) // 回放地址
const firstFrameDisplay = ref(false) // 是否显示加载动画
const playBackDate = ref<any>()
const changePlayBackDate = () => {
  if (playBackDate.value) {
    queryReplay(playBackDate.value)
  }
}
// 查询视频
const queryReplay = async (time?: string) => {
  let startTime = ""
  let endTime = ""
  if (time) {
    startTime = dayjs(time).format("YYYY-MM-DD HH:mm:ss")
    endTime = dayjs(time).add(1, "hour").format("YYYY-MM-DD HH:mm:ss")
  } else {
    startTime = dayjs(props.detail.starttime).subtract(15, "minute").format("YYYY-MM-DD HH:mm:ss")
    endTime = dayjs(props.detail.starttime).add(15, "minute").format("YYYY-MM-DD HH:mm:ss")
  }
  try {
    firstFrameDisplay.value = true
    const { response } = await GetPlaybackURL({
      deviceId: props.detail.monithorcode, // "f3eae95f5045419aae6474a62850d79c",
      Playtype: "ws",
      beginTime: startTime,
      endTime: endTime
    })
    if (response?.url) {
      const startHkFormat = dayjs(startTime).format("YYYY-MM-DD") + "T" + dayjs(startTime).format("HH:mm:ss") + "Z"
      const endHkFormat = dayjs(endTime).format("YYYY-MM-DD") + "T" + dayjs(endTime).format("HH:mm:ss") + "Z"
      videoUrl.value = response.url
      ElMessage.success("播放成功，等待第一帧加载完成！")
      setTimeout(() => {
        videoRef.value.replay(response.url, startHkFormat, endHkFormat)
      }, 100)
    } else {
      ElMessage.info("未能获取到视频流信息，请重新加载！")
      firstFrameDisplay.value = false
    }
  } catch (error) {
    ElMessage.info("请求回放地址失败！")
    firstFrameDisplay.value = false
  } finally {
  }
}

// 获得指挥记录
const getCommandRecord = async () => {
  const { response } = await GetAlarm_CommandRecordByPage({
    alarmhandleid: props.detail.alarmid
  })
  zhjlData.value = response.data
}

// 删除指挥记录
const deleteCommandRecord = async (id: string) => {
  const { success } = await DeleteCommandRecord({ id: id })
  if (success) {
    ElMessage.success("删除成功")
    getCommandRecord()
  } else {
    ElMessage.info("删除失败")
  }
}
const editCommandRecord = (item: any) => {
  item.plot = item.remark1
  const data = JSON.parse(JSON.stringify(item))
  emit("previewCommand", data)
}

// 打开新增绘制军标
const openAddPlot = () => {
  ElMessage.info("新增绘制军标")
  emit("addPlot")
}

const { user } = storeToRefs(useConfigStore())
// 完成扑救
const handleFinish = async () => {
  const { success } = await PutAlarm_HandleStatusById({
    id: props.detail.id,
    handleuserid: user.value.userId,
    handleuser: user.value.userName
  })
  if (success) {
    ElMessage.success("完成扑救成功")
  } else {
    ElMessage.info("完成扑救失败")
  }
}
watch(
  () => props.detail,
  (val) => {
    // console.log(val)
    if (val.imgsrc) {
      val.imgsrcList = val.imgsrc.split(";")
    }
    getCommandRecord()
  }
)

onMounted(() => {
  // 监听刷新指挥记录
  proxy.$mitt.on("refreshZhjlData", (_: any) => {
    getCommandRecord()
  })
})
onBeforeUnmount(() => {
  proxy.$mitt.off("refreshZhjlData")
})
</script>
<template>
  <div class="left1">
    <BasePanel
      title="应急事件"
      class="overflow-hidden"
    >
      <template #contain>
        <div class="con">
          <div class="flexbox gap-2 bg-[#294064] text-sm leading-loose text-custom3">
            <img
              :src="$fun.getImg('arrow-left.png')"
              alt=""
            />
            基本信息
            <img
              :src="$fun.getImg('arrow-right.png')"
              alt=""
            />
          </div>
          <div class="info-box">
            <div class="info-item">
              <div class="label">描述：</div>
              <div class="value">{{ detail?.describe || "暂无" }}</div>
            </div>
            <div class="info-item">
              <div class="label">设备名称：</div>
              <div class="value">{{ detail?.eventname || "暂无" }}</div>
            </div>
            <div class="info-item">
              <div class="label">预警时间：</div>
              <div class="value">{{ detail?.starttime || "暂无" }}</div>
            </div>
            <div class="info-item">
              <div class="label">研判时间：</div>
              <div class="value">{{ detail?.judgetime || "暂无" }}</div>
            </div>
            <div class="info-item">
              <div class="label">瞭望塔位置：</div>
              <div class="value">{{ detail?.towerlon + "," + detail?.towerlat }}</div>
            </div>
            <div class="info-item">
              <div class="label">瞭望塔海拔：</div>
              <div class="value">{{ detail?.height ? detail?.height + "m" : "暂无" }}</div>
            </div>
            <div class="info-item">
              <div class="label">所属网格：</div>
              <div class="value">{{ detail?.sswg || "暂无" }}</div>
            </div>
            <div class="info-item">
              <div class="label">网格负责人：</div>
              <div class="value">{{ detail?.wgy || "暂无" }}</div>
            </div>
            <div class="info-item">
              <div class="label">联系电话：</div>
              <div class="value">{{ detail?.handleuser || "暂无" }}</div>
            </div>
          </div>
          <div class="tabs">
            <div
              class="tab"
              :class="{ active: activeTab == item }"
              v-for="item in tabs"
              @click="changeTab(item)"
            >
              {{ item }}
            </div>
          </div>
          <div
            :key="activeTab"
            class="tab-con"
          >
            <div
              v-if="activeTab === '预警抓图'"
              class="img-box"
            >
              <el-image
                :src="
                  detail?.imgsrcList?.length === 0
                    ? ''
                    : detail?.imgsrcList?.length === 1
                      ? '/fireStaticUrl/' + detail?.imgsrcList?.[0]
                      : '/fireStaticUrl/' + detail?.imgsrcList?.[1]
                "
                fit="cover"
                @click="viewImg"
              >
                <template #placeholder>
                  <el-skeleton
                    class="image-placeholder"
                    style="width: 100%; height: 100%"
                    animated
                  >
                    <template #template>
                      <el-skeleton-item
                        variant="image"
                        style="width: 100%; height: 100%"
                      />
                    </template>
                  </el-skeleton>
                </template>
                <template #error>
                  <div class="image-slot">
                    <i-ep-picture />
                    <span style="margin-left: 3px">暂无预览</span>
                  </div>
                </template>
              </el-image>
            </div>
            <div
              v-if="activeTab === '视频回放' || activeTab === '历史监控'"
              v-loading="firstFrameDisplay"
              element-loading-text="视频加载中，请稍后..."
              :element-loading-spinner="svg"
              element-loading-svg-view-box="-10, -10, 50, 50"
              element-loading-background="rgba(9, 20, 31, 0.6)"
              class="video-box"
            >
              <hkVideo
                ref="videoRef"
                :isHistory="true"
                :video-url="videoUrl"
                :currentLayout="1"
                @firstFrameDisplay="firstFrameDisplay = false"
              />
              <div
                v-if="activeTab === '历史监控'"
                class="time-select"
              >
                <el-date-picker
                  v-model="playBackDate"
                  type="datetime"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  placeholder="选择日期和时间"
                  popper-class="custom-datepicker-popper"
                  size="small"
                  @change="changePlayBackDate"
                />
              </div>
            </div>
          </div>
          <div class="flexbox gap-2 bg-[#294064] text-sm leading-loose text-custom3">
            <img
              :src="$fun.getImg('arrow-left.png')"
              alt=""
            />
            指挥记录
            <img
              :src="$fun.getImg('arrow-right.png')"
              alt=""
            />
          </div>
          <div class="zhjl-box">
            <div class="head">
              <span class="name">档案名称</span>
              <span class="time">创建时间</span>
              <span class="btn">操作 <i-ep-circle-plus @click="openAddPlot" /></span>
            </div>
            <el-scrollbar v-if="zhjlData.length > 0">
              <div
                class="zhjl-item"
                v-for="(item, index) in zhjlData"
                :key="index"
                @click="editCommandRecord(item)"
              >
                <span class="name">{{ item.mc }}</span>
                <span class="time">{{ item.createtime }}</span>
                <span
                  class="btn"
                  @click="deleteCommandRecord(item.id)"
                  >删除</span
                >
              </div>
            </el-scrollbar>
            <EmptyData
              v-else
              :image-size="70"
              :font-size="16"
            />
          </div>
          <div class="flexbox gap-2 bg-[#294064] text-sm leading-loose text-custom3">
            <img
              :src="$fun.getImg('arrow-left.png')"
              alt=""
            />
            流转记录
            <img
              :src="$fun.getImg('arrow-right.png')"
              alt=""
            />
          </div>
          <div class="lzjl-box">
            <div class="row yjtime">
              <div class="icon">
                <img src="@/assets/images/emergencyCommand/yjtime.png" />
              </div>
              <div class="circle">
                <img src="@/assets/images/emergencyCommand/circle.png" />
              </div>
              <div class="text">预警时间：{{ detail?.starttime }}</div>
            </div>
            <div class="row yptime">
              <div class="icon">
                <img src="@/assets/images/emergencyCommand/yptime.png" />
              </div>
              <div class="circle">
                <img src="@/assets/images/emergencyCommand/circle.png" />
              </div>
              <div class="text">研判时间：{{ detail?.judgetime }}</div>
            </div>
            <div class="row pjtime">
              <div class="icon">
                <img src="@/assets/images/emergencyCommand/pjtime.png" />
              </div>
              <div class="circle">
                <img src="@/assets/images/emergencyCommand/circle.png" />
              </div>
              <div class="text">完成扑救时间：{{ detail?.handletime }}</div>
              <div class="user">扑救人：{{ detail?.handleuser }}</div>
            </div>
          </div>
          <div class="btns">
            <div
              class="btn"
              @click="back"
            >
              返回
            </div>
            <div
              class="btn"
              @click="handleFinish"
            >
              完成扑救
            </div>
          </div>
        </div>
      </template>
    </BasePanel>
  </div>
</template>

<style lang="scss" scoped>
.left1 {
  position: absolute;
  top: vh(20);
  bottom: vh(20);
  left: vw(20);
  width: 420px;
  margin-top: vh(15);
  color: #fff;
  .con {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .info-box {
    padding: vh(10) 8px;
    .info-item {
      display: flex;
      font-size: 14px;
      margin-bottom: vh(5);
      .label {
        width: 102px;
        text-align: justify;
        color: #2fbadc;
        flex-shrink: 0;
      }
    }
  }
  .tabs {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px vh(10);
    .tab {
      width: 109.54px;
      height: 28.74px;
      line-height: 28.74px;
      background: #1e4672;
      text-align: center;
      border: 1px solid #2b639a;
      box-shadow: inset 0px 0px 8px 5px rgba(1, 2, 39, 0.25);
      cursor: pointer;
    }
    .active {
      background: #8e6e1d;
      border: 1px solid #7d5b0b;
      box-shadow: inset 0px 0px 8px 5px rgba(1, 2, 39, 0.25);
    }
  }
  .tab-con {
    margin: 0 20px vh(10);
    height: 168.48px;
    .img-box {
      width: 100%;
      height: 100%;
      .el-image {
        width: 100%;
        height: 100%;
        .image-slot {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100%;
          border: 1px dashed #999;
          color: var(--el-text-color-secondary);
          font-size: 0.9375vw;
        }
      }
    }
    .video-box {
      position: relative;
      width: 100%;
      height: 100%;
      :deep(.time-select) {
        // display: none;
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: rgab(0, 0, 0, 0.3);
        text-align: center;
        .el-input__wrapper,
        .el-select__wrapper {
          background-color: #0c284d;
          box-shadow: none;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 0;
        }
        .el-input__inner {
          color: #fff;
        }
      }
    }
  }
  .zhjl-box {
    position: relative;
    // flex: 1;
    overflow: hidden;
    margin-top: vh(8);
    min-height: 160px;
    .head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 29px;
      margin-bottom: 8px;
      padding: 0 18px;
      background: url("@/assets/images/emergencyCommand/zhjl-bg.png");
      background-size: 100% 100%;
      font-size: 14px;
      margin-bottom: 10px;
      .btn {
        display: flex;
        align-items: center;
        gap: 2px;
        cursor: pointer;
        color: rgba(47, 186, 220, 1);
      }
    }
    .el-scrollbar {
      height: calc(100% - 40px);
    }
    .zhjl-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 29px;
      margin-bottom: 8px;
      padding: 0 18px;
      background: url("@/assets/images/emergencyCommand/zhjl-bg.png");
      background-size: 100% 100%;
      font-size: 14px;
      .name {
        width: 100px;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
      }
      .time {
        flex: 1;
        text-align: center;
      }
      .btn {
        color: rgba(47, 186, 220, 1);
        cursor: pointer;
      }
    }
  }
  .lzjl-box {
    max-height: 108px;
    overflow: auto;
    margin-top: vh(8);
    margin-bottom: vh(8);
    .row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
      padding-right: 20px;
      .icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
      }
      .circle {
        position: relative;
        width: 44px;
        padding-left: 5px;
        padding-right: 6px;
        img {
          width: 32px;
          height: 32px;
        }
      }
      .text {
        flex: 1;
      }
      &.yjtime,
      &.yptime {
        .circle {
          &::after {
            content: "";
            position: absolute;
            left: 50%;
            top: 20px;
            transform: translateX(-50%);
            width: 1px;
            height: 30px;
            background: url("@/assets/images/emergencyCommand/line.png");
            background-size: cover;
          }
        }
      }
    }
  }
  .btns {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 80px;
    .btn {
      width: 88.55px;
      height: 32px;
      line-height: 32px;
      text-align: center;
      border-radius: 3px;
      cursor: pointer;
      &:nth-child(1) {
        background: url("@/assets/images/emergencyCommand/btn-bg.png") no-repeat;
        background-size: 100% 100%;
        box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
        color: rgba(42, 234, 247, 1);
      }
      &:nth-child(2) {
        border: 0.5px solid #2aeaf7;
        background: linear-gradient(
          270deg,
          #2aeaf7 -3%,
          rgba(42, 234, 247, 0.5) 5%,
          rgba(42, 234, 247, 0.5) 93%,
          #2aeaf7 104%
        );
        box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
      }
    }
  }
}
</style>
