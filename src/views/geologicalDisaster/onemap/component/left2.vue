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
import player from "@/components/hkVideo/index.vue"
interface Props {
  equipmentId: string | number
}
const props = withDefaults(defineProps<Props>(), {
  equipmentId: ""
})
watch(
  () => props.equipmentId,
  (newVal, oldVal) => {
    if (newVal && newVal !== oldVal) {
      // getVideoUrl(newVal)
    }
  }
)
const url = ref("")
//获取视频地址
const getVideoUrl = (deviceId?: any) => {
  let query = {
    protocol: 4,
    deviceSerial: "FQ0153502" // deviceId
  }
  url.value = ""
  return GeologicHazard_VideoPlay(query)
    .then((res: any) => {
      if (res.response) {
        let { data, msg } = res.response
        if (!data) {
          return ElMessage.info(msg)
        } else {
          url.value = data.url
        }
      } else {
        ElMessage.error(res.msg)
        return ""
      }
    })
    .catch((err: any) => {})
}
onMounted(() => {
  getVideoUrl()
})
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
