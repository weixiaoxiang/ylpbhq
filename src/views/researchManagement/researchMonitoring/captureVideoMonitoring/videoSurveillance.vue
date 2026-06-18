<script lang="ts" setup>
import { GetAllMonitoringList, GetVideoStatisticalAnalysis_Sbgk, GetVideoStatisticalAnalysis_Sbtj } from "@/api"
import MonitoringAnalysis from "./MonitoringAnalysis.vue"
import dayjs from "dayjs"

const { showCSB } = storeToRefs(useConfigStore())
const popup = ref<any>(null)
const modular = ref("视频监控")
const {
  closePopup,
  map,
  popupInfo,
  popupFormatType,
  vectorFeatures,
  locationMap,
  addLayerManageData,
  removeLayerManageData
} = useOlMap(popup, {
  zoom: 12.5381,
  center: [116.12950826192058, 31.035296306176544],
  modular: modular.value,
  vectorLayerDeclutter: false,
  openOverlay: false,
  overlayOffset: [0, -70],
  overlayPositioning: "bottom-center"
})

// 获得视频监控点列表
const jkdList = ref<any>([])
const getJkdList = async () => {
  const { response } = await GetAllMonitoringList({
    equipmentType: "视频监控点"
  })
  jkdList.value = response
}

// 获得设备概况数据
const sbgkData = ref<any>({})
// 当前时间
const currentTime = dayjs().format("YYYY-MM-DD HH:mm:ss")
const getSbgkData = async () => {
  const { response } = await GetVideoStatisticalAnalysis_Sbgk()
  sbgkData.value = response
}

// 获得设备统计饼图数据
const pieData = ref<any>(null)
const sbzxData = ref<any>({
  online: 0,
  offline: 0,
  all: 0,
  rate: 0
})
const getPieData = async () => {
  const { response } = await GetVideoStatisticalAnalysis_Sbtj()
  pieData.value = response
  sbzxData.value.online = response.find((item: any) => item.name === "在线")?.value ?? 0
  sbzxData.value.offline = response.find((item: any) => item.name === "离线")?.value ?? 0
  sbzxData.value.all = response.reduce((prev: number, cur: any) => prev + cur.value, 0) || 100
  sbzxData.value.rate = ((sbzxData.value.online / sbzxData.value.all) * 100).toFixed(0)
}
const showMonitoringAnalysis = ref<any>(false)
const openDataPanel = () => {
  showMonitoringAnalysis.value = true
}
const { setVariable } = useCssVariables()
onMounted(() => {
  setVariable("maptool-sidebar-right", "calc(21.875vw + 40px)") // 设置地图工具栏距右侧距离
  setVariable("maptool-sidebar-bottom", "calc(20px)") // 设置地图工具栏距底部距离
  getJkdList()
  getSbgkData()
  getPieData()
})
onBeforeUnmount(() => {})
</script>
<template>
  <div class="videoSurveillance">
    <div class="section-bar">
      <MapFeatureSearch
        :features="vectorFeatures"
        @location="locationMap"
      />
      <MapLayerManage
        :modular="modular"
        :init-checked-keys="[35]"
        @addLayer="addLayerManageData"
        @removeLayer="removeLayerManageData"
      />
      <div class="analysis-btn">
        <img
          :src="$fun.getImg('researchManagement/analysis-btn.png')"
          alt=""
          @click="openDataPanel"
        />
      </div>
    </div>
    <div class="right">
      <transition-group
        enter-active-class="animate__animated animate__bounceInRight"
        leave-active-class="animate__animated animate__fadeOut"
        appear
        appear-active-class="animate__animated animate__bounceInRight"
      >
        <div
          v-show="showCSB"
          class="section3"
          key="section3"
        >
          <BasePanel title="设备概况">
            <template #contain>
              <div class="contain">
                <div class="time">更新时间：{{ currentTime }}</div>
                <div class="box">
                  <div
                    v-for="item in sbgkData"
                    :key="item.name"
                  >
                    <img
                      :src="'/statisUrl/' + item.iconurl"
                      alt=""
                    />
                    <div class="r-con">
                      <div class="name">{{ item.name }}</div>
                      <div class="infos">
                        <div>
                          <span class="text">总数</span>
                          <span class="value1">{{ item.allcount }}个</span>
                        </div>
                        <div>
                          <span class="text">在线个数</span>
                          <span class="value2">{{ item.onlinecount }}个</span>
                        </div>
                        <div>
                          <span class="text">离线个数</span>
                          <span class="value3">{{ item.offlinecount }}个</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </BasePanel>
        </div>
        <div
          v-show="showCSB"
          class="section4"
          key="section4"
        >
          <BasePanel title="设备统计">
            <template #contain>
              <div class="contain">
                <div class="info">
                  <img
                    :src="$fun.getImg('researchManagement/sbtj-img.png')"
                    alt=""
                  />
                  <span style="margin-left: -10px">设备在线率</span>
                  <span class="value">{{ sbzxData.rate }}%</span>
                </div>
                <div class="box">
                  <el-row>
                    <el-col :span="16">
                      <HollowPieChartPanel
                        dw="个"
                        title="设备总数"
                        :colors="['#9f5555', '#18dfb1']"
                        :data="pieData"
                      />
                    </el-col>
                    <el-col
                      :span="8"
                      class="r-con"
                    >
                      <div class="item">
                        <div>设备在线个数</div>
                        <div>
                          <span class="value">{{ sbzxData.online }}个</span>
                          <img
                            :src="$fun.getImg('researchManagement/online.png')"
                            alt=""
                          />
                        </div>
                      </div>
                      <div class="item">
                        <div>设备离线个数</div>
                        <div>
                          <span class="value">{{ sbzxData.offline }}个</span>
                          <img
                            :src="$fun.getImg('researchManagement/offline.png')"
                            alt=""
                          />
                        </div>
                      </div>
                    </el-col>
                  </el-row>
                </div>
              </div>
            </template>
          </BasePanel></div
      ></transition-group>
    </div>
    <Modal
      id="monitoringAnalysis"
      v-model:show="showMonitoringAnalysis"
      disable-zoom
      :close-on-click-modal="false"
    >
      <template v-slot:container>
        <MonitoringAnalysis />
      </template>
    </Modal>
    <div
      class="map-box"
      id="map"
    >
      <MapPopup
        ref="popup"
        :type="2"
        :format-name="popupFormatType"
        :info="popupInfo"
        @close="closePopup"
      />
      <MapTool
        v-if="map"
        :map="map"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.videoSurveillance {
  position: relative;
  height: 100%;
  .map-box {
    position: relative;
    width: 100%;
    height: 100%;
  }
  .section-bar {
    position: absolute;
    top: 20px;
    // right: calc(21.875vw + 40px);
    right: var(--maptool-sidebar-right);
    display: flex;
    gap: 0.2604vw;
    height: 32px;
    z-index: 1;
    transition: all 0.3s ease-in-out;
    .analysis-btn {
      display: flex;
      flex-direction: column;
      gap: 0.7813vw;
      width: 4.0104vw;
      cursor: pointer;
    }
  }
  .right {
    display: flex;
    flex-direction: column;
    gap: 20px;
    position: absolute;
    top: 20px;
    bottom: 20px;
    right: 20px;
    z-index: 1;
    overflow: hidden;
    > div {
      width: 21.875vw;
    }
  }
  .section3 {
    // height: 38vh;
    flex: 1;
    .contain {
      height: 100%;
      padding: 0 10px 10px 10px;
      .time {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        font-size: 0.625vw;
        color: #667689;
        height: 22px;
      }
      .box {
        height: calc(100% - 22px);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        > div {
          display: flex;
          gap: 0.5208vw;
          img {
            width: 2.6042vw;
          }
          .r-con {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-evenly;
            font-size: 0.8333vw;
            color: #fff;
            .infos {
              display: flex;
              justify-content: space-between;
              align-items: center;
              > div {
                font-size: 0.7292vw;
                color: #667689;
                .text {
                  margin-right: 5px;
                }

                .value1 {
                  background: linear-gradient(to bottom, #15eddf, #3b989f);
                }
                .value2 {
                  background: linear-gradient(to bottom, #1fec8c, #6fd2c0);
                }
                .value3 {
                  background: linear-gradient(to bottom, #ec561f, #feb47b);
                }
                .value1,
                .value2,
                .value3 {
                  -webkit-background-clip: text;
                  color: transparent;
                  font-size: 0.8333vw;
                }
              }
            }
          }
        }
      }
    }
  }
  .section4 {
    height: 38vh;
    .contain {
      padding: 0 0.7813vw;
      display: flex;
      flex-direction: column;
      height: 100%;
      .info {
        display: flex;
        justify-content: space-evenly;
        align-items: center;
        // width: 18.125vw;
        width: 100%;
        height: 8vh;
        background: url("@/assets/images/researchManagement/sbtj-bg.png") no-repeat center center / 100% 100%;
        font-size: 1.0417vw;
        font-weight: bold;
        img {
          width: 4.1667vw;
        }
        .value {
          font-size: 1.25vw;
          color: #27ed46;
        }
      }
      .box {
        flex: 1;
        margin-top: 10px;
        .el-row {
          height: 100%;
        }
        .el-col {
          height: 100%;
        }
        .r-con {
          display: flex;
          flex-direction: column;
          justify-content: space-evenly;
          .item {
            display: flex;
            flex-direction: column;
            gap: 10px;
            font-size: 0.7292vw;
            > div {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 1.0417vw;
              .value {
                background: linear-gradient(to bottom, #1fec8c, #6fd2c0);
                -webkit-background-clip: text;
                color: transparent;
                font-size: 0.8333vw;
              }
              img {
                width: 1.25vw;
              }
            }
          }
        }
      }
    }
  }
}
</style>
<style lang="scss">
.videoSurveillance {
  .el-date-editor {
    background-color: #0c284d;
    color: #aab4c1;
    box-shadow: none;
    &.el-input__wrapper {
      width: 16.6667vw;
      &:hover {
        box-shadow: none !important;
      }
    }
  }
  .el-range-input {
    color: #aab4c1;
    font-size: 0.625vw;
  }
  .el-range-separator {
    color: #aab4c1;
  }
}
</style>
