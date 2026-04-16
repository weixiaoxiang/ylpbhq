<script lang="ts" setup>
import {
  GetAlarmmsgListByPage,
  GetAlarmmsgStatisticalAnalysis_Lbfx,
  GetAlarmmsgStatisticalAnalysis_Sbfx,
  GetAlarmmsgStatisticalAnalysis_Sbzpl,
  GetAlarmmsgStatisticalAnalysis_Sjgk,
  GetAlarmmsgStatisticalAnalysis_Top
} from "@/api"
//@ts-ignore
import { vue3ScrollSeamless } from "vue3-scroll-seamless"
import AllFireWarning from "./AllFireWarning.vue"
const proxy = getCurrentInstance()!.proxy as any

const { showCSB } = storeToRefs(useConfigStore())
const changePanelTitleType = (type: string) => {
  if (type === "火情预警-更多") {
    showAllFireWarning.value = true
  }
  if (type.indexOf("研判分析") > -1) {
    const timeType = type.split("-")[1]
    getYpfxData(timeType)
  }
}

const popup = ref<any>(null)
const modular = ref("火情预警")
const {
  closePopup,
  popupInfo,
  popupFormatType,
  setHqDetailPopup,
  map,
  vectorFeatures,
  locationMap,
  addLayerManageData,
  removeLayerManageData
} = useOlMap(popup, {
  zoom: 12.20477,
  center: [116.16027952755078, 30.97908202369116],
  modular: modular.value,
  openOverlay: false,
  overlayOffset: [0, -70],
  overlayPositioning: "bottom-center"
})

// 获得火情预警卡口列表，地图加载点位
// const getKkList = async () => {
//   const { response } = await GetAllMonitoringList({
//     equipmentType: "防火监控点"
//   })
//   addMonitorPoints(response)
// }

// 获得今日预警信息
const jryjInfo = ref<any>({})
const getTodayYjInfo = async () => {
  const { response } = await GetAlarmmsgStatisticalAnalysis_Top()
  jryjInfo.value = response
}

// 获得累计抓拍数据
const pie3DData = ref<any>(null)
const getPie3DData = async () => {
  // pie3DData.value = [
  //   {
  //     name: "设备一",
  //     value: 175
  //   },
  //   {
  //     name: "设备二",
  //     value: 234
  //   },
  //   {
  //     name: "设备三",
  //     value: 34
  //   },
  //   {
  //     name: "设备四",
  //     value: 133
  //   }
  // ]
  const { response } = await GetAlarmmsgStatisticalAnalysis_Sbzpl()
  pie3DData.value = response.map((item: any) => {
    return {
      name: item.name,
      value: item.count
    }
  })
}
// 获得研判分析数据
const ypfxData = ref<any>({})
const barData = ref()
const getYpfxData = async (timeType?: string) => {
  const { response: data1 } = await GetAlarmmsgStatisticalAnalysis_Lbfx({
    timeType: timeType || "周"
  })
  ypfxData.value = {
    jmyh: data1.find((item: any) => item.name === "居民用火")?.value ?? 0,
    gyhy: data1.find((item: any) => item.name === "工业用火")?.value ?? 0,
    rzcc: data1.find((item: any) => item.name === "燃烧杂草")?.value ?? 0,
    hq: data1.find((item: any) => item.name === "火情")?.value ?? 0
  }
  const { response: data2 } = await GetAlarmmsgStatisticalAnalysis_Sbfx({
    timeType: timeType || "周"
  })
  if (data2?.data?.length > 0) {
    barData.value = {
      dw: "次",
      xAxis: data2.xAxis,
      data: data2.data.map((item: any) => {
        return {
          name: item.name,
          data: item.data
        }
      })
    }
  } else {
    barData.value = null
  }
}
// 获得数据概况数据
const pieData = ref<any>(null)
const sjgkInfo = ref<any>({})
const getPieData = async () => {
  const { response } = await GetAlarmmsgStatisticalAnalysis_Sjgk()
  sjgkInfo.value = {
    onlinerate: response.onlinerate,
    onlinecount: response.onlinecount,
    offlinecount: response.offlinecount
  }
  pieData.value = [
    {
      name: "在线",
      value: response.onlinecount
    },
    {
      name: "离线",
      value: response.offlinecount
    }
  ]
}

const list = ref<any[]>([])
const getList = async () => {
  const { response } = await GetAlarmmsgListByPage({
    page: 1,
    intPageSize: 30 // 默认30条
  })
  list.value = response.data
}
const viewYj = (event: any) => {
  if (event.target?.classList?.contains("info")) {
    const id = event.target.dataset.id
    const data = list.value.find((item: any) => item.id === Number(id))
    if (data) {
      popupFormatType.value = "火情预警详情"
      if (data.imgsrc) {
        data.imgsrcList = data.imgsrc.split(";")
      }
      popupInfo.value = JSON.parse(JSON.stringify(data))
      setHqDetailPopup([parseFloat(data.towerlon), parseFloat(data.towerlat)])
    }
  }
}
const showAllFireWarning = ref(false)
const { setVariable } = useCssVariables()
onMounted(() => {
  setVariable("maptool-sidebar-right", "calc(21.875vw + 40px)") // 设置地图工具栏距右侧距离
  setVariable("maptool-sidebar-bottom", "calc(305px + 40px)") // 设置地图工具栏距底部距离
  proxy.$mitt.on("changePanelTitleType", changePanelTitleType)
  getTodayYjInfo() // 获得今日预警信息
  getPie3DData() // 获得累计抓拍数据
  getYpfxData() // 获得研判分析数据
  getPieData() // 获得数据概况数据
  getList() // 获得火情预警列表
})
onBeforeUnmount(() => {
  proxy.$mitt.off("changePanelTitleType", changePanelTitleType)
})
</script>

<template>
  <div class="fire-warning">
    <div class="info-box">
      <div class="info-item">
        <div>今日预警信息</div>
        <div>{{ jryjInfo.allcount }}条</div>
      </div>
      <div class="info-item">
        <div>已研判</div>
        <div>{{ jryjInfo.yypcount }}条</div>
      </div>
      <div class="info-item">
        <div>未研判</div>
        <div>{{ jryjInfo.wypcount }}条</div>
      </div>
    </div>
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
    </div>
    <div class="bottom">
      <transition-group
        enter-active-class="animate__animated animate__bounceInDown"
        leave-active-class="animate__animated animate__fadeOut"
        appear
        appear-active-class="animate__animated  animate__bounceInDown"
      >
        <div
          v-show="showCSB"
          class="section1"
          key="section1"
        >
          <BasePanel title="累计抓拍">
            <template #contain>
              <div class="contain">
                <Pie3DChartPanel
                  size="1"
                  title="总抓拍次数"
                  unit="次"
                  :data="pie3DData"
                />
              </div>
            </template>
          </BasePanel>
        </div>
        <div
          v-show="showCSB"
          class="section2"
          key="section2"
        >
          <BasePanel
            title="研判分析"
            initType="周"
            :types="['周', '月', '年']"
          >
            <template #contain>
              <div class="contain">
                <div class="box1">
                  <h3><img :src="$fun.getImg('researchManagement/hd-icon.svg')" />类别分析</h3>
                  <div class="infos">
                    <div class="item item1">
                      <div>居民用火</div>
                      <div class="value">{{ ypfxData.jmyh }}<span>起</span></div>
                    </div>
                    <div class="item item2">
                      <div>工业用火</div>
                      <div class="value">{{ ypfxData.gyhy }}<span>起</span></div>
                    </div>
                    <div class="item item3">
                      <div>燃烧杂草</div>
                      <div class="value">{{ ypfxData.rzcc }}<span>起</span></div>
                    </div>
                    <div class="item item4">
                      <div>火情</div>
                      <div class="value">{{ ypfxData.hq }}<span>起</span></div>
                    </div>
                  </div>
                </div>
                <div class="box2">
                  <h3><img :src="$fun.getImg('researchManagement/hd-icon.svg')" />设备分析</h3>
                  <BarReversalStackChartPanel
                    :show-legend="true"
                    :colors="['#32ade5', '#d27042', '#31ab93', '#c79c52']"
                    :gradient="true"
                    :data="barData"
                  />
                </div>
              </div>
            </template>
          </BasePanel>
        </div>
      </transition-group>
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
          <BasePanel title="数据概况">
            <template #contain>
              <div class="contain">
                <div class="info">
                  <img
                    :src="$fun.getImg('researchManagement/sbtj-img.png')"
                    alt=""
                  />
                  <span style="margin-left: -10px">设备在线率</span>
                  <span class="value">{{ sjgkInfo.onlinerate }}%</span>
                </div>
                <div class="box">
                  <el-row>
                    <el-col :span="16">
                      <HollowPieChartPanel
                        dw="个"
                        title="设备总数"
                        :colors="['#18dfb1', '#9f5555']"
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
                          <span class="value">{{ sjgkInfo.onlinecount }}个</span>
                          <img
                            :src="$fun.getImg('researchManagement/online.png')"
                            alt=""
                          />
                        </div>
                      </div>
                      <div class="item">
                        <div>设备离线个数</div>
                        <div>
                          <span class="value">{{ sjgkInfo.offlinecount }}个</span>
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
          </BasePanel>
        </div>
        <div
          v-show="showCSB"
          class="section4"
          key="section4"
        >
          <BasePanel
            title="火情预警"
            :btns="['更多']"
          >
            <template #contain>
              <div
                v-if="list.length > 0"
                class="contain"
                @click="viewYj"
              >
                <vue3ScrollSeamless
                  class="scroll-wrap"
                  :classOptions="{ step: 0.1 }"
                  :dataList="list"
                >
                  <ul class="ui-wrap-hqyj">
                    <li
                      class="li-item"
                      v-for="(item, i) of list"
                      :key="item.id"
                    >
                      <div class="item-box">
                        <div class="name">设备名称：{{ item.cameraname }}</div>
                        <div class="time-box">
                          <div>
                            <img
                              :src="$fun.getImg('researchManagement/time-icon.png')"
                              alt=""
                            />
                            <span>{{ item.starttime }}</span>
                          </div>
                          <div
                            class="info"
                            :data-id="item.id"
                          >
                            详情 >
                          </div>
                        </div>
                      </div>
                      <img
                        v-if="i < 5"
                        class="top-img"
                        :src="$fun.getImg('researchManagement/hqyj-img1.svg')"
                        alt=""
                      />
                      <img
                        v-else
                        class="top-img"
                        :src="$fun.getImg('researchManagement/hqyj-img2.svg')"
                        alt=""
                      />
                      <div
                        class="type-box type1"
                        :class="[
                          item.status === '未研判'
                            ? 'type1'
                            : item.status === '火情'
                              ? 'type2'
                              : item.status === '误报'
                                ? 'type3'
                                : item.status === '重复火情'
                                  ? 'type4'
                                  : item.status === '居民用火'
                                    ? 'type5'
                                    : item.status === '工业用火'
                                      ? 'type6'
                                      : 'type7'
                        ]"
                      >
                        {{ item.status }}
                      </div>
                    </li>
                  </ul>
                </vue3ScrollSeamless>
              </div>
              <EmptyData v-else />
            </template>
          </BasePanel>
        </div>
      </transition-group>
    </div>
    <Modal
      id="fireWarning"
      v-model:show="showAllFireWarning"
      disable-zoom
      :close-on-click-modal="false"
    >
      <template v-slot:container>
        <AllFireWarning />
      </template>
    </Modal>
    <div
      class="map-box"
      id="map"
    >
      <MapPopup
        ref="popup"
        :type="1"
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
.fire-warning {
  position: relative;
  height: 100%;
  .map-box {
    position: relative;
    width: 100%;
    height: 100%;
  }
  .info-box {
    position: absolute;
    top: 70px;
    left: calc(calc(100% - 21.875vw) / 2);
    transform: translateX(-50%);
    z-index: 1;
    display: flex;
    gap: 3.125vw;
    align-items: center;
    .info-item {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 4px;
      > div {
        display: flex;
        &:first-child {
          font-size: 0.8333vw;
          color: #fff;
        }
        &:last-child {
          font-size: 1.25vw;
          font-weight: bold;
        }
      }
      &:nth-child(1) {
        > div {
          &:last-child {
            background: linear-gradient(to bottom, #85bee7, #5191d6); /* 渐变颜色 */
            -webkit-background-clip: text;
            color: transparent;
          }
        }
      }
      &:nth-child(2) {
        > div {
          &:last-child {
            background: linear-gradient(to bottom, #25c9e7, #25c9e7); /* 渐变颜色 */
            -webkit-background-clip: text;
            color: transparent;
          }
        }
      }
      &:nth-child(3) {
        > div {
          &:last-child {
            background: linear-gradient(to bottom, #f09a38, #e75f23); /* 渐变颜色 */
            -webkit-background-clip: text;
            color: transparent;
          }
        }
      }
    }
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
  }
  .bottom {
    display: flex;
    gap: 20px;
    position: absolute;
    bottom: 20px;
    left: 20px;
    right: calc(21.875vw + 40px);
    z-index: 1;
    overflow: hidden;
    > div {
      height: 305px;
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
  .section1 {
    width: 400px;
    .contain {
      display: flex;
      height: 100%;
    }
  }
  .section2 {
    flex: 1;
    .contain {
      display: flex;
      height: 100%;
      .box1 {
        position: relative;
        display: flex;
        flex-direction: column;
        width: 21.875vw;
        min-width: 260px;
        h3 {
          display: flex;
          align-items: center;
          font-size: 0.7292vw;
          color: #34bcec;
          margin: 0;
          img {
            width: 1.8229vw;
            margin-right: 5px;
          }
        }
        .infos {
          position: relative;
          flex: 1;
          align-items: center;
          justify-content: center;
          height: 190px;
          background: url("@/assets/images/researchManagement/ypfx-bg.png") no-repeat center center / 100% 100%;
          .item {
            position: absolute;
            display: flex;
            flex-direction: column;
            gap: 0.2604vw;
            div {
              font-size: 0.7292vw;
            }
            .value {
              font-size: 0.9375vw;
              background: linear-gradient(to bottom, #fefefe, #0cbefe); /* 渐变颜色 */
              -webkit-background-clip: text;
              color: transparent;
              font-weight: bold;
              span {
                font-size: 0.625vw;
                margin-left: 0.2604vw;
              }
            }
          }
          .item1 {
            top: 55px;
            left: 25px;
          }
          .item2 {
            top: 55px;
            right: 25px;
            text-align: right;
          }
          .item3 {
            bottom: 55px;
            left: 25px;
          }
          .item4 {
            bottom: 55px;
            right: 25px;
            text-align: right;
          }
        }
      }
      .box2 {
        position: relative;
        flex: 1;
        display: flex;
        flex-direction: column;
        h3 {
          display: flex;
          align-items: center;
          font-size: 0.7292vw;
          color: #34bcec;
          margin: 0;
          img {
            width: 1.8229vw;
            margin-right: 5px;
          }
        }
      }
    }
  }
  .section3 {
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
  .section4 {
    flex: 1;
    overflow: hidden;
    .contain {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
  }
  :deep(.scroll-wrap) {
    .ui-wrap-hqyj {
      display: flex;
      flex-direction: column;
      background-color: #192f49;
      margin: 0;
      padding: 0;
      .li-item {
        position: relative;
        background-color: #133857;
        font-size: 0.7292vw;
        color: #fff;
        line-height: 2em;
        margin: 3px 0;
        padding: 0.5208vw;
        .item-box {
          margin-top: 15px;
          .name {
            text-align: left;
          }
          .time-box {
            display: flex;
            justify-content: space-between;
            font-size: 0.625vw;
            color: #66bac8;
            > div {
              display: flex;
              align-items: center;
              gap: 0.2083vw;
              img {
                width: 0.9375vw;
              }
            }
            .info {
              color: #66bac8;
              cursor: pointer;
              font-size: 0.8333vw;
            }
          }
        }
        .top-img {
          position: absolute;
          top: 0;
          left: 0;
          width: 4.8958vw;
        }
        .type-box {
          position: absolute;
          top: 5px;
          right: 0.5208vw;
          width: 3.3333vw;
          height: 22px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-width: 1px;
          border-style: solid;
          color: #fff;
          // &.type1 {
          //   border-color: #de721a;
          //   color: #de721a;
          //   background-color: rgba(205, 108, 29, 0.2);
          // }
          // &.type2 {
          //   border-color: #19e5b5;
          //   color: #19e5b5;
          //   background-color: rgba(26, 212, 170, 0.2);
          // }
          &.type1 {
            background-color: rgba(67, 53, 167, 0.5);
            border-color: rgb(67, 53, 167);
          }
          &.type2 {
            background-color: rgba(33, 155, 157, 0.5);
            border-color: rgb(33, 155, 157);
          }
          &.type3 {
            background-color: rgba(13, 146, 244, 0.5);
            border-color: rgb(13, 146, 244);
          }
          &.type4 {
            background-color: rgba(204, 43, 82, 0.5);
            border-color: rgb(204, 43, 82);
          }
          &.type5 {
            background-color: rgba(236, 131, 5, 0.5);
            border-color: rgb(236, 131, 5);
          }
          &.type6 {
            background-color: rgba(35, 93, 220, 0.5);
            border-color: rgb(35, 93, 220);
          }
          &.type7 {
            background-color: rgba(232, 67, 172, 0.5);
            border-color: rgb(232, 67, 172);
          }
        }
      }
    }
  }
}
</style>
<style lang="scss">
.fire-warning {
  .el-input__wrapper {
    background-color: #0c284d;
    color: #aab4c1;
    box-shadow: none;
  }
  .el-select__wrapper {
    background-color: #0c284d;
    color: #aab4c1;
    box-shadow: none;
  }
  .el-date-editor {
    background-color: #0c284d;
    color: #aab4c1;
    box-shadow: none;
  }
  .el-range-input {
    color: #aab4c1;
  }
  .el-range-separator {
    color: #aab4c1;
  }
  .el-select__placeholder {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #aab4c1;
  }
}
</style>
