<template>
  <div class="geologicalDisaster-section wrapgeo">
    <div class="wrap-header">
      <div class="title-content">
        <img
          class="title-logo"
          :src="$fun.getImg('title-icon.svg')"
          alt=""
        />
        <div class="title">视频监控</div>
      </div>
    </div>
    <div class="line"></div>
    <div class="wrap-con">
      <!-- <player :videoUrl="url" /> -->
      <livePlayerVideo
        :key="playerKey"
        ref="recordVideoPlayer"
        :currentLayout="1"
        :videoUrl="url"
        :uid="url"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { GeologicHazard_VideoPlay } from "@/api"
import livePlayerVideo from "@/components/livePlayer/index.vue"

interface Props {
  /** 设备序列号（与下拉数据中的 deviceserial 一致），用于拉取播放地址 */
  deviceSerial: string
}
const props = withDefaults(defineProps<Props>(), {
  deviceSerial: ""
})

const url = ref("")
/** 切换设备时强制重建播放器，避免内部状态不刷新 */
const playerKey = computed(() => props.deviceSerial || "empty")

const getVideoUrl = (serial?: string) => {
  const raw = serial ?? props.deviceSerial
  const deviceSerial = raw != null && String(raw).trim() !== "" ? String(raw).trim() : ""
  if (!deviceSerial) {
    url.value = ""
    return Promise.resolve()
  }
  url.value = ""
  const query = {
    protocol: 4,
    deviceSerial
  }
  return GeologicHazard_VideoPlay(query)
    .then((res: any) => {
      if (res.response) {
        const { data, msg } = res.response
        if (!data) {
          ElMessage.info(msg || "暂无视频")
        } else {
          url.value = data.url ?? ""
        }
      } else {
        ElMessage.error(res.msg)
      }
    })
    .catch(() => {})
}

watch(
  () => props.deviceSerial,
  (newVal) => {
    getVideoUrl(newVal)
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.geologicalDisaster-section {
  height: vh(305);
  margin-top: vh(20);
}
.wrap-con {
  position: relative;
}
</style>
