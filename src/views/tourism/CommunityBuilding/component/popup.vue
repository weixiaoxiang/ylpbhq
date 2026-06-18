<template>
  <div class="map-pop-comm">
    <div class="map-pop-topright"></div>
    <div
      class="map-pop-close"
      @click="closemapPop"
    ></div>
    <div class="map-pop-box">
      <div class="map-pop-title">
        <div class="title">{{ popupInfo?.orgname || "" }}</div>
      </div>
      <div class="map-pop-content">
        <div class="content1">
          <div
            class="box"
            style="margin-bottom: 10px"
          >
            <!-- <div class="box-title">
              <div class="titlename">{{}}</div>
            </div> -->

            <div class="box-content">
              <div class="row">
                <span class="label">所属区域：</span>
                <span class="value">{{ popupInfo?.orgname || "" }}</span>
              </div>
              <!-- <div class="row">
                <span class="label">网格编号：</span>
                <span class="value">{{ popupInfo?.ywdw || "" }}</span>
              </div> -->
              <div class="row">
                <span class="label">责任人：</span>
                <span class="value">{{ popupInfo?.ultimateperson || "" }}</span>
              </div>
              <div class="row">
                <span class="label">电话：</span>
                <span class="value">{{ popupInfo?.ultimatepersontel || "" }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { videoApi } from "@/api/geologicalDisaster"
import { geologicalDisasterApi } from "@/api/geologicalDisaster"
import player from "@/components/hkVideo/index.vue"

const emit = defineEmits(["closemapPop"])
const closemapPop = () => {
  emit("closemapPop")
}
let props = defineProps(["popupInfo"])

// let popupInfo={

//   equipmentId:{
//     type:Number,
//     default:null
//   }
// }

//监测数据
const jcData = ref<any>([
  {
    name: "高程变化",
    img: "/images/geologicalDisaster/dialogimage/icon1-1.png",
    value: "0",
    unit: "mm"
  },
  {
    name: "地表裂缝",
    img: "/images/geologicalDisaster/dialogimage/icon2-1.png",
    value: "0",
    unit: "mm"
  },
  {
    name: "北向量变化",
    img: "/images/geologicalDisaster/dialogimage/icon3-1.png",
    value: "0",
    unit: "mm"
  },
  {
    name: "降雨量",
    img: "/images/geologicalDisaster/dialogimage/icon4-1.png",
    value: "0",
    unit: "mm"
  },
  {
    name: "东向量变化",
    img: "/images/geologicalDisaster/dialogimage/icon5-1.png",
    value: "0",
    unit: "mm"
  },
  {
    name: "土壤含水率",
    img: "/images/geologicalDisaster/dialogimage/icon6-1.png",
    value: "0",
    unit: "%"
  }
])
const url = ref("")

//获取详情
let getDetail = (id: any) => {
  geologicalDisasterApi.GetGeologicHazardReality({ equipmentId: id }).then((res) => {
    if (res?.success) {
      jcData.value[0].value = res.response.gpsTotalZ.toFixed(2)
      jcData.value[1].value = res.response.rainfall.toFixed(2)
      jcData.value[2].value = res.response.gpsTotalY.toFixed(2)
      jcData.value[3].value = res.response.soilMoistureContent
      jcData.value[4].value = res.response.gpsTotalX.toFixed(2)
      jcData.value[5].value = res.response.surfaceCracks
      getVideoUrl(props.popupInfo.monitorCode)
    } else {
      ElMessage.error(res?.msg)
    }
  })
}

//获取视频地址
const getVideoUrl = (deviceId: any) => {
  let query = {
    deviceId: deviceId,
    Playtype: "ws"
  }
  videoApi
    .getPlayVideoUrl(query)
    .then((res: any) => {
      // loading.close();
      if (res.success && res.response) {
        url.value = res.response
      } else {
        ElMessage.error(res.msg)
        return ""
      }
    })
    .catch((err: any) => {
      // loading.close();
    })
}

onMounted(() => {
  watch(
    () => props.popupInfo,
    (newVal, oldVal) => {
      if (props.popupInfo?.equipmentId) {
        getDetail(props.popupInfo.equipmentId)
      }
    }
  )
})
</script>

<style lang="scss" scoped>
.map-pop-comm {
  position: relative;
  width: 280px;
  height: 150px;
  color: #fff;
  // background: rgba(1, 37, 42, 0.77);
  // border: 1px solid #31e4be;
  // border-bottom: 2px solid #31e4be;
  z-index: 9999;
  background: url("/images/geologicalDisaster/dialogimage/jcsbdialog.png") no-repeat center center;
  &:after {
    position: absolute;
    content: "";
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-top: 10px solid #2cadff;
    bottom: -12px;
    left: 50%;
    transform: translateX(-50%);
  }
}
.map-pop-box {
  height: 100%;
}

.map-pop-title {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  background: url("/images/geologicalDisaster/dialogimage/title-bj.png") no-repeat center center;

  .title {
    width: 241px;
    height: 20px;
    text-align: center;
    line-height: 20px;
    font-size: 14px;
    font-weight: 500;
    // background: url("@/assets/ScientificResearch/title-bg.png") no-repeat center center;
  }
  img {
    position: absolute;
    right: 10px;
    cursor: pointer;
    width: 20px;
    height: 20px;
  }
}

.map-pop-content {
  display: flex;
  justify-content: space-between;
  height: calc(100% - 28px);
  width: 100%;
  padding: 10px 10px 16px;

  .content1 {
    width: 100%;
    font-size: 14px;
    .titlename {
      width: 57.14px;
      height: 18px;
      margin-left: 10px;

      color: #2cfefe;
    }
    .box-content {
      margin-left: 10px;
      // display: flex;
      // flex-wrap: wrap;
      .row {
        display: flex;
        align-items: center;
        width: 100%;
        margin-top: 10px;
        .label,
        .value {
          display: flex;
          align-items: center;
          font-family: Inter;
          font-size: 14px;
          font-weight: 400;
          line-height: 16.94px;
          text-align: left;
          text-underline-position: from-font;
          text-decoration-skip-ink: none;
        }
      }
    }
  }

  .jessibucaVideo {
    width: 221px;
    height: 11px;
  }
}

.map-pop-topright {
  position: absolute;
  top: -4px;
  right: 0px;
  width: 120px;
  height: 4px;
  background: url("/images/geologicalDisaster/dialogimage/jcsbdialog-topright.png") no-repeat center center;
  // cursor: pointer;
}
.map-pop-close {
  position: absolute;
  top: 9px;
  right: 9px;
  width: 10px;
  height: 10px;
  background: url("/images/geologicalDisaster/dialogimage/close.png") no-repeat center center;
  cursor: pointer;
  z-index: 999;
}
</style>
