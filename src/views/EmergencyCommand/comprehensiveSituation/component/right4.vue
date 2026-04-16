<script setup lang="ts">
import { GeologicHazard_VideoPlay, GetDroneRecordList } from "@/api"
import livePlayerVideo from "@/components/livePlayer/index.vue"
const emit = defineEmits<{
  renderTrack: [any]
}>()
const url = ref("")
let recordList: any = []
const currentIndex = ref<any>(null)
const cInterVal = setInterval(() => {
  if (currentIndex.value !== null && currentIndex.value < recordList.length - 1) {
    currentIndex.value++
    const line = recordList.slice(0, currentIndex.value + 1)
    emit("renderTrack", line)
  }
}, 3000)
const currentRecord = computed(() => {
  if (currentIndex.value !== null) {
    return recordList[currentIndex.value]
  }
  return null
})
let isFirst = true // 是否第一次执行代码
let intervalId: any = null
// 格式化小数点后5位
const formatToFixed5 = (value: any) => {
  if (value === undefined || value === null || value === "") {
    return 0
  }
  if (typeof value === "number") {
    return Number(value.toFixed(5))
  }
  if (typeof value === "string") {
    const num = parseFloat(value)
    return isNaN(num) ? 0 : Number(num.toFixed(5))
  }
  return 0
}
//获取视频地址
const getVideoUrl = () => {
  return GetDroneRecordList()
    .then((res: any) => {
      if (res.response.length > 0) {
        let { hfurl, ssUrl, record } = res.response[0]
        recordList = record?.map((item: any, index: number) => {
          return {
            hb: formatToFixed5(item.hb),
            speed: formatToFixed5(item.speed),
            lon: formatToFixed5(item.lon),
            lat: formatToFixed5(item.lat),
            index: index + 1
          }
        })

        if (hfurl) {
          // 历史
          url.value = "/wrjUrl" + hfurl
          currentIndex.value = 0
          intervalId && clearInterval(intervalId)
        } else if (ssUrl) {
          if (isFirst) {
            // 实时
            url.value = ssUrl
            currentIndex.value = 0
            isFirst = false
            intervalId = setInterval(() => {
              getVideoUrl()
            }, 10 * 1000)
          }
        } else {
          return ElMessage.info("没有无人机记录")
        }
      } else {
        ElMessage.error(res.msg)
        return ""
      }
      // console.log(url.value, recordList, 111)
    })
    .catch((err: any) => {})
}
const firstFrameDisplay = ref(false)
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
onMounted(() => {
  getVideoUrl()
})
onBeforeUnmount(() => {
  cInterVal && clearInterval(cInterVal)
  intervalId && clearInterval(intervalId)
})
</script>
<template>
  <div class="right4">
    <BasePanel title="无人机监测">
      <template #contain>
        <div class="con">
          <div
            class="wrj"
            v-loading="firstFrameDisplay"
            element-loading-text="视频加载中，请稍后..."
            :element-loading-spinner="svg"
            element-loading-svg-view-box="-10, -10, 50, 50"
            element-loading-background="rgba(9, 20, 31, 0.6)"
          >
            <livePlayerVideo
              v-if="url"
              ref="recordVideoPlayer"
              :currentLayout="1"
              :videoUrl="url"
              :uid="url"
              :showCustomButton="false"
              :hideSnapshotButton="true"
              :hideBigPlayButton="true"
              :hideStretchButton="true"
              :hideFluentButton="true"
            />
            <!-- <video
              :src="url"
              controls
              style="width: 100%; height: 100%"
            ></video> -->
            <!-- <hkVideo
              style="width: 100%; height: 100%"
              :video-url="url"
              :currentLayout="1"
              @firstFrameDisplay="firstFrameDisplay = false"
            /> -->
          </div>
          <div class="info">
            <div class="row">飞行点{{ currentRecord?.index }}</div>
            <div class="row">
              <img
                src="@/assets/images/emergencyCommand/icon-jd.png"
                alt=""
              />
              <span class="label">经度：</span>
              <span class="value">{{ currentRecord?.lon }}</span>
            </div>
            <div class="row">
              <img
                src="@/assets/images/emergencyCommand/icon-wd.png"
                alt=""
              />
              <span class="label">纬度：</span>
              <span class="value">{{ currentRecord?.lat }}</span>
            </div>
            <div class="row">
              <img
                src="@/assets/images/emergencyCommand/icon-fxgd.png"
                alt=""
              />
              <span class="label">飞行高度：</span>
              <span class="value">{{ currentRecord?.hb }}m</span>
            </div>
            <div class="row">
              <img
                src="@/assets/images/emergencyCommand/icon-fxsd.png"
                alt=""
              />
              <span class="label">飞行速度：</span>
              <span class="value">{{ currentRecord?.speed }}m/s</span>
            </div>
          </div>
        </div>
      </template>
    </BasePanel>
  </div>
</template>
<style lang="scss" scoped>
.right4 {
  height: vh(234);
  margin-top: vh(20);
  color: #fff;
  .con {
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
    .wrj {
      width: 300px;
      height: 100%;
      border: 1px solid #2769c6;
      margin-right: 8px;
    }
    .info {
      padding: 16px 0;
      .row {
        display: flex;
        align-items: center;
        font-size: 14px;
        &:not(:last-child) {
          margin-bottom: 22px;
        }
        img {
          margin-right: 4px;
        }
        &:nth-child(1),
        &:nth-child(2) {
          .value {
            color: #1e8fcc;
          }
        }
        &:nth-child(3) {
          .value {
            color: #1fbb77;
          }
        }
        &:nth-child(4) {
          .value {
            color: #fa9f18;
          }
        }
      }
    }
  }
}
</style>
