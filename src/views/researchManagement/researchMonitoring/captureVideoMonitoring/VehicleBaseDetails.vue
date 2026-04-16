<script lang="ts" setup>
import { GetPlaybackURL } from "@/api"
import { u } from "@/utils/viewerjs"
import dayjs from "dayjs"
interface Props {
  data?: any
}
const props = withDefaults(defineProps<Props>(), {
  data: {}
})
// 预览图片
const preview = (url: string) => {
  u.showPreviewImg(0, [url])
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
const firstFrameDisplay = ref(true) // 是否显示加载动画
// 查询视频
const queryReplay = async () => {
  const startTime = dayjs(props.data.time).subtract(2, "minute").format("YYYY-MM-DD HH:mm:ss")
  const endTime = dayjs(props.data.time).add(2, "minute").format("YYYY-MM-DD HH:mm:ss")

  try {
    firstFrameDisplay.value = true
    const { response } = await GetPlaybackURL({
      deviceId: props.data.deviceid || props.data.monitorindexcode, // "f3eae95f5045419aae6474a62850d79c",
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
      ElMessage.info("当前时间未获取到回放视频，请耐心等待回传！")
    }
  } catch (error) {
    ElMessage.info("请求回放地址失败！")
  } finally {
    firstFrameDisplay.value = false
  }
}
onMounted(() => {
  queryReplay() // 加载视频
})
</script>
<template>
  <div class="vehicle-base-details">
    <h3>车辆详情</h3>
    <div class="contain panzoom-exclude">
      <div class="row">
        <div class="col">
          <div class="label">车牌号码:</div>
          <el-text
            class="value"
            truncated
          >
            {{ data.plateno }}
          </el-text>
        </div>
        <div class="col">
          <div class="label">车身颜色:</div>
          <el-text
            class="value"
            truncated
          >
            {{ "暂无" }}
          </el-text>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <div class="label">抓拍地点:</div>
          <el-text
            class="value"
            truncated
            >{{ data.monitorname }}</el-text
          >
        </div>
        <div class="col">
          <div class="label">车型:</div>
          <el-text
            class="value"
            truncated
          >
            {{ data.vehicletypename || "暂无" }}
          </el-text>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <div class="label">是否为黑名单:</div>
          <el-text
            class="value"
            truncated
          >
            {{ data.isblacklist || "暂无" }}
          </el-text>
        </div>
        <div class="col">
          <div class="label">是否为内部车:</div>
          <el-text
            class="value"
            truncated
          >
            {{ data.isinside || "暂无" }}
          </el-text>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <div class="label">品牌:</div>
          <el-text
            class="value"
            truncated
          >
            {{ "暂无" }}
          </el-text>
        </div>
        <div class="col">
          <div class="label">子品牌:</div>
          <el-text
            class="value"
            truncated
          >
            {{ "暂无" }}</el-text
          >
        </div>
      </div>
      <div class="row">
        <div class="col">
          <div class="label">行驶方向:</div>
          <el-text
            class="value"
            truncated
          >
            {{ "暂无" }}
          </el-text>
        </div>
        <div class="col">
          <div class="label">车速:</div>
          <el-text
            class="value"
            truncated
            >{{ data.speed }}</el-text
          >
        </div>
      </div>
    </div>
    <div class="box panzoom-exclude">
      <div class="box-item">
        <div class="title">车辆图片/视频:</div>
        <div class="box-item-body">
          <el-image
            :src="'/vehicleStaticUrl' + data.vehiclepicurlall"
            fit="fill"
            @click="preview('/vehicleStaticUrl' + data.vehiclepicurlall)"
          >
            <template #error>
              <div class="image-slot">
                <i-ep-picture />
                <span style="margin-left: 3px">暂无预览</span>
              </div>
            </template>
          </el-image>
          <div
            v-loading="firstFrameDisplay"
            element-loading-text="视频加载中，请稍后..."
            :element-loading-spinner="svg"
            element-loading-svg-view-box="-10, -10, 50, 50"
            element-loading-background="rgba(9, 20, 31, 0.6)"
            class="video-box"
          >
            <!-- <VideoPlayer
              :style="{ height: '100%' }"
              src="https://vjs.zencdn.net/v/oceans.mp4"
            /> -->
            <hkVideo
              ref="videoRef"
              :isHistory="true"
              :video-url="videoUrl"
              :currentLayout="1"
              @firstFrameDisplay="firstFrameDisplay = false"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.vehicle-base-details {
  display: flex;
  flex-direction: column;
  width: 45.9375vw;
  height: 600px;
  background: url("@/assets/images/dialog-bg1.png") no-repeat center center / 100% 100%;
  font-size: 0.7292vw;
  color: #beccdc;
  padding: 20px 1.8229vw 30px 1.8229vw;
  h3 {
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    font-size: 1.25vw;
    font-weight: bold;
    font-style: italic;
  }
  .contain {
    display: flex;
    flex-direction: column;
    .row {
      display: flex;
      align-items: center;
      gap: 0.5208vw;
      padding: 8px 0;
      border-bottom: 1px solid #4977a1;
      .col {
        display: flex;
        height: 100%;
        width: 50%;
        line-height: 1.5em;
        .label {
          width: 6.25vw;
          height: 100%;
          text-align: left;
          font-size: 0.7292vw;
          color: #426e98;
        }
        .value {
          flex: 1;
          overflow: hidden;
          width: 100%;
          color: #beccdc;
          font-size: 0.7292vw;
        }
      }
    }
  }
  .box {
    display: flex;
    flex: 1;
    gap: 0.5208vw;
    overflow-y: hidden;
    > .box-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      //background: url("@/assets/images/dialog-bg2.png") no-repeat center center / 100% 100%;
      overflow: hidden;
      .title {
        display: flex;
        align-items: center;
        line-height: 2em;
        color: #fff;
        font-size: 0.7292vw;
      }
      .box-item-body {
        flex: 1;
        display: flex;
        overflow: hidden;
        gap: 0.2604vw;
        padding: 0.2604vw;
        .el-image {
          flex: 1;
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
        .video-box {
          flex: 1;
          height: 100%;
          video {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
      }
    }
  }
}
</style>
<style lang="scss">
.vehicle-details {
  .custom-popper {
    background: none !important;
    border: none !important;
    padding: 0 !important;
    .el-popper__arrow {
      display: none !important;
    }
    .tip {
      width: 155px;
      height: 36px;
      font-size: 8px;
      padding: 4px 0 4px 14px;
      line-height: 16px;
      background: url("@/assets/images/researchManagement/bg2.png") no-repeat center center / 100% 100%;
    }
  }
}
</style>
