<template>
  <div class="map-pop">
    <div class="map-pop-topright"></div>
    <div
      class="map-pop-close"
      @click="closemapPop"
    ></div>
    <div class="map-pop-box">
      <div class="map-pop-title">
        <div class="title">{{ popupInfo?.name || "" }}</div>
        <!-- <img
          src="@/assets/images/IntelligentPatrol/ico-close.svg"
          alt=""
          @click="close"
        /> -->
      </div>
      <div class="map-pop-content">
        <div class="content1">
          <div
            class="box"
            style="margin-bottom: 10px"
          >
            <div class="box-title">
              <div class="jt"></div>
              <div class="titlename">基本信息</div>
            </div>

            <div class="box-content">
              <div class="row">
                <span class="label">所属单位：</span>
                <span class="value">{{ popupInfo?.ssdw || "" }}</span>
              </div>
              <div class="row">
                <span class="label">运维单位：</span>
                <span class="value">{{ popupInfo?.ywdw || "" }}</span>
              </div>
              <div class="row">
                <span class="label">运维电话：</span>
                <span class="value">{{ popupInfo?.ywdh || "" }}</span>
              </div>
              <div class="row">
                <span class="label">设备类型：</span>
                <span class="value">{{ popupInfo?.sblx || "" }}</span>
              </div>
            </div>
          </div>
          <div class="box box2">
            <div class="box-content">
              <!-- <div class="box-title1">监测数据</div> -->

              <div class="box-title1">
                <div class="jt"></div>
                <div class="titlename">监测数据</div>
              </div>

              <div class="box-title2">
                <div class="jt"></div>
                <div class="titlename">视频数据</div>
              </div>

              <!-- <div class="box-title2">视频数据</div> -->
              <div class="box-content1">
                <div
                  class="item"
                  v-for="item in jcData"
                  :key="item.name"
                >
                  <div class="img">
                    <img
                      :src="item.img"
                      style="width: 14px; height: 16px; margin-top: -2px"
                    />
                  </div>
                  <div class="data">
                    <div class="name">{{ item.name }}</div>
                    <div class="value">{{ item.value }}{{ item.unit }}</div>
                  </div>
                </div>
              </div>
              <div class="box-content2">
                <player
                  :videoUrl="url"
                  class="jessibucaVideo"
                />
              </div>
            </div>
          </div>
        </div>
        <!-- <div class="right">
          <div
            class="box-title"
            style="margin-bottom: 14px"
          >
            监控画面
          </div>
          <player
            :videoUrl="url"
            class="jessibucaVideo"
          />
        </div> -->
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
    unit: "cm"
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
.map-pop {
  position: relative;
  width: 527px;
  height: 323px;
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
  .box-title {
    display: flex;
    align-items: center;
    width: 100%;
    height: 28px;
    padding: 0 10px;
    // margin-bottom: 10px;
  }
  .content1 {
    width: 100%;
    font-size: 14px;
    .jt {
      width: 16px;
      height: 15px;
      background: url("/images/geologicalDisaster/dialogimage/jt.png") no-repeat center center;
    }
    .titlename {
      width: 57.14px;
      height: 18px;
      margin-left: 10px;

      color: #2cfefe;
    }
    .box-content {
      margin-left: 10px;
      display: flex;
      flex-wrap: wrap;
      .row {
        display: flex;
        align-items: center;
        width: 50%;
        margin-top: 10px;
        // &:not(:last-child) {
        //   margin-bottom: 8px;
        // }
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
    .box2 {
      .box-title1 {
        display: flex;
        align-items: center;
        width: 60%;
        height: 18px;
        margin-bottom: 16px;
      }
      .box-title2 {
        display: flex;
        align-items: center;
        width: 40%;
        height: 18px;
        margin-bottom: 16px;
      }
      .box-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        .box-content1 {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          width: 60%;

          .item {
            display: flex;
            align-items: center;
            width: 50%;
            margin-bottom: 12px;

            .img {
              display: flex;
              justify-content: center;
              width: 60px;
              height: 36px;
              margin-right: 5px;
              background: url("/images/geologicalDisaster/dialogimage/icon1-2.png") no-repeat;
              background-size: 100% 100%;
            }

            .data {
              .name {
                //  margin-bottom: 4px;

                font-family: Inter;
                font-size: 14px;
                font-weight: 400;
                line-height: 16.94px;
                text-align: left;
              }
              .value {
                font-family: Inter;
                font-size: 14px;
                font-weight: 400;
                line-height: 16.94px;
                text-align: left;
                text-underline-position: from-font;
                text-decoration-skip-ink: none;

                background: linear-gradient(0deg, #2cfefe 0%, #f0f0f0 100%);

                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                text-fill-color: transparent;
              }
            }
          }
        }
        .box-content2 {
          width: 40%;
          height: 123px;
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
