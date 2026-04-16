<script lang="ts" setup>
import PanelData from "./PanelData.vue"
import CountUp from "vue-countup-v3"
//@ts-ignore
import { vue3ScrollSeamless } from "vue3-scroll-seamless"
import {
  GetAllMonitoringList,
  GetCarIndicatorsToDay,
  GetCarIndicatorsToTime_Llqs,
  GetCarIndicatorsToTime_Crkfx,
  GetJckhbToDay,
  GetCarListByPage,
  GetCarAlarmListByPage
} from "@/api"
import VehicleBaseDetails from "./VehicleBaseDetails.vue"
const proxy = getCurrentInstance()!.proxy as any
const { showCSB } = storeToRefs(useConfigStore())
const popup = ref<any>(null)
const modular = ref("车辆卡口")
const {
  closePopup,
  popupInfo,
  popupFormatType,
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
// 获得进出口环比数据
const jckhbInfo = ref<any>({
  ToDayGetInto: 0,
  ToDayGetOut: 0,
  GetIntoChain: 0,
  GetOutChain: 0
})
const getJckhbToDay = async () => {
  const { response } = await GetJckhbToDay()
  jckhbInfo.value = response
}
// 获得车辆卡口列表
const kkList = ref<any>([])
const getKkList = async () => {
  const { response } = await GetAllMonitoringList({
    equipmentType: "卡口监测"
  })
  kkList.value = response
}
const changePanelTitleType = (type: string) => {
  // console.log(type)
  if (type.indexOf("车流趋势分析") > -1) {
    const timeType = type.split("-")[1]
    getClqs1(timeType)
    getClqs2(timeType)
  }
  if (type === "车辆进出记录-更多") {
    initTab.value = "车辆进出记录"
    openDataPanel()
  }
  if (type === "预警监测-更多") {
    initTab.value = "预警记录"
    openDataPanel()
  }
}
const bardata = ref<any>(null)
// 出入口分析
const getClqs1 = async (timeType?: string) => {
  // bardata.value = {
  //   dw: "km",
  //   xAxis: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"],
  //   data: [
  //     {
  //       name: "去年",
  //       data: [
  //         { date: "01", value: "867.784" },
  //         { date: "02", value: "418.636" },
  //         { date: "03", value: "756.956" },
  //         { date: "04", value: "504.631" },
  //         { date: "05", value: "188.199" },
  //         { date: "06", value: "23.163" },
  //         { date: "07", value: "144.486" },
  //         { date: "08", value: "97.827" },
  //         { date: "09", value: "97.277" },
  //         { date: "10", value: "1478.160" },
  //         { date: "11", value: "1896.292" },
  //         { date: "12", value: "74.499" }
  //       ]
  //     },
  //     {
  //       name: "今年",
  //       data: [
  //         { date: "01", value: "0.024" },
  //         { date: "02", value: "0.289" },
  //         { date: "03", value: "510.236" },
  //         { date: "04", value: "219.942" },
  //         { date: "05", value: "319.311" },
  //         { date: "06", value: "185.895" },
  //         { date: "07", value: "126.311" },
  //         { date: "08", value: "88.105" },
  //         { date: "09", value: "20.478" },
  //         { date: "10", value: "699.686" },
  //         { date: "11", value: null },
  //         { date: "12", value: null }
  //       ]
  //     }
  //   ]
  // }
  const { response } = await GetCarIndicatorsToTime_Crkfx({
    timeType: timeType || "周"
  })
  if (response?.[0]?.childer?.length > 0) {
    bardata.value = {
      dw: "辆",
      xAxis: response?.[0].childer?.map((item: any) => item.name),
      data: response.map((item: any) => ({
        name: item.name,
        data: item.childer.map((item: any) => ({
          label: item.name,
          value: item.value
        }))
      }))
    }
  } else {
    bardata.value = null
  }
}
const linedata = ref<any>(null)
// 流量趋势
const getClqs2 = async (timeType?: string) => {
  const { response } = await GetCarIndicatorsToTime_Llqs({
    timeType: timeType || "周"
  })
  if (response?.[0]?.childer?.length > 0) {
    linedata.value = {
      dw: "辆",
      xAxis: response?.[0].childer?.map((item: any) => item.name),
      data: response.map((item: any) => ({
        name: item.name,
        data: item.childer.map((item: any) => ({
          label: item.name,
          value: item.value
        }))
      }))
    }
  } else {
    linedata.value = null
  }
}
const jrgkLinedata = ref<any>(null)
// 今日概况
const getJrgk = async () => {
  const { response } = await GetCarIndicatorsToDay()
  if (response?.[0]?.childer?.length > 0) {
    jrgkLinedata.value = {
      dw: "辆",
      xAxis: response?.[0].childer?.map((item: any) => item.name),
      data: response.map((item: any) => ({
        name: item.name,
        data: item.childer.map((item: any) => ({
          label: item.name,
          value: item.value
        }))
      }))
    }
  } else {
    jrgkLinedata.value = null
  }
}

// 预警监测
const yjjcList = ref<any>([])
const getYjjcList = async () => {
  const { response } = await GetCarAlarmListByPage({
    page: 1,
    intPageSize: 20
  })
  yjjcList.value = response.data
}
// 查看预警监测详情
const viewYj = (event: any) => {
  if (event.target?.className === "arrow") {
    const id = event.target.dataset.id
    console.log(id)
  }
}

// 车辆进出记录
const cljcList = ref<any>([])
const getCljcList = async () => {
  const { response } = await GetCarListByPage({
    page: 1,
    intPageSize: 20
  })
  cljcList.value = response.data
}
const showClxqBaseDialog = ref(false)
const info = ref<any>({})
// 查看车辆进出记录详情
const viewJc = (event: any) => {
  if (event.target?.className === "view") {
    const id = event.target.dataset.id
    const find = cljcList.value.find((item: any) => item.Id === id)
    if (find) {
      info.value = find
      showClxqBaseDialog.value = true
    }
  }
}

// 数据面板
const initTab = ref<any>("")
const showDataPanel = ref(false)
// 报警监测弹窗
const openDataPanel = (type?: string) => {
  if (type) {
    initTab.value = type
  }
  showDataPanel.value = true
}
const { setVariable } = useCssVariables()
onMounted(() => {
  setVariable("maptool-sidebar-right", "calc(21.875vw + 40px)") // 设置地图工具栏距右侧距离
  setVariable("maptool-sidebar-bottom", "calc(305px + 40px)") // 设置地图工具栏距底部距离
  proxy.$mitt.on("changePanelTitleType", changePanelTitleType)
  getJckhbToDay() // 获得进出口环比数据
  getKkList() // 获得车辆卡口列表
  getClqs1() // 出入口分析
  getClqs2() // 流量趋势
  getJrgk() // 今日概况
  getYjjcList() // 预警监测轮播
  getCljcList() // 车辆进出记录轮播
})
onBeforeUnmount(() => {
  proxy.$mitt.off("changePanelTitleType", changePanelTitleType)
})
</script>
<template>
  <div class="vehicleCheckpoint">
    <div class="info-boxs">
      <div class="info-box corner">
        <div>
          <span>今日入场</span>
          <span>环比{{ jckhbInfo.GetIntoChain > 0 ? "+" + jckhbInfo.GetIntoChain : jckhbInfo.GetIntoChain }}%</span>
        </div>
        <div>
          <count-up :end-val="jckhbInfo.ToDayGetInto"></count-up>
          <span style="margin-bottom: 5px">辆</span>
        </div>
        <div class="corner-bottom-left"></div>
        <div class="corner-top-right"></div>
      </div>
      <div class="info-box corner">
        <div>
          <span>今日出场</span>
          <span>环比{{ jckhbInfo.GetOutChain > 0 ? "+" + jckhbInfo.GetOutChain : jckhbInfo.GetOutChain }}%</span>
        </div>
        <div>
          <count-up :end-val="jckhbInfo.ToDayGetOut"></count-up>
          <span style="margin-bottom: 5px">辆</span>
        </div>
        <div class="corner-bottom-left"></div>
        <div class="corner-top-right"></div>
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
      <div class="analysis-btn">
        <img
          class="analysis-btn"
          :src="$fun.getImg('researchManagement/analysis-btn.png')"
          alt=""
          @click="openDataPanel('车辆进出记录')"
        />
      </div>
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
          <BasePanel
            title="车流趋势分析"
            initType="周"
            :types="['周', '月', '年']"
          >
            <template #contain>
              <div class="contain">
                <div class="box">
                  <h3><img :src="$fun.getImg('researchManagement/hd-icon.svg')" />出入口分析</h3>
                  <BarChartPanel
                    lineBreak="custom1"
                    :gradient="true"
                    :colors="['#0a84ff', '#ff9f0a']"
                    :data="bardata"
                  />
                </div>
                <div class="box">
                  <h3><img :src="$fun.getImg('researchManagement/hd-icon.svg')" /> 流量趋势</h3>
                  <LineChartPanel
                    symbol="circle"
                    :tooltip-total="true"
                    :open-effect="true"
                    :areaBackground="true"
                    :colors="['#61f9f4', '#de327b']"
                    :data="linedata"
                  />
                </div>
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
            title="预警监测"
            :btns="['更多']"
          >
            <template #contain>
              <div
                class="contain"
                @click="viewYj"
              >
                <template v-if="yjjcList?.length > 0">
                  <vue3ScrollSeamless
                    class="scroll-wrap"
                    :classOptions="{ step: 0.1 }"
                    :dataList="yjjcList"
                  >
                    <ul class="ui-wrap-yjjc">
                      <li
                        class="li-item"
                        v-for="(item, i) of yjjcList"
                        :key="i"
                      >
                        <div class="li-item-main">
                          <div class="hd">
                            <img
                              :src="
                                $fun.getImg(
                                  `researchManagement/yjjc-icon${item.alarmtype !== '黑名单预警' ? '1' : item.alarmtype === '拥堵预警' ? '2' : '3'}.svg`
                                )
                              "
                              alt=""
                            />
                            <span class="type1">{{ item.alarmtype }}</span>
                            {{ item.alarmtime }}
                          </div>
                          <div class="text">{{ item.alarmremark }}</div>
                        </div>
                        <!-- 暂时隐藏 -->
                        <!-- <div
                          class="arrow"
                          data-id="黑名单预警"
                        >
                          <i-ep-arrow-right data-id="黑名单预警"></i-ep-arrow-right>
                        </div> -->
                      </li>
                    </ul>
                  </vue3ScrollSeamless>
                </template>
                <EmptyData v-else />
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
          <BasePanel title="今日概况">
            <template #contain>
              <div class="contain">
                <LineChartPanel
                  :nodeShadow="true"
                  :lineDashed="false"
                  :tooltipTotal="true"
                  :areaBackground="true"
                  :colors="['#cfce24', '#37b4ca']"
                  :data="jrgkLinedata"
                />
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
            title="车辆进出记录"
            :btns="['更多']"
          >
            <template #contain>
              <div
                class="contain"
                @click="viewJc"
              >
                <template v-if="cljcList?.length > 0">
                  <vue3ScrollSeamless
                    class="scroll-wrap"
                    :classOptions="{ step: 0.1 }"
                    :dataList="cljcList"
                  >
                    <ul class="ui-wrap-cljc">
                      <li
                        class="li-item"
                        v-for="(item, i) of cljcList"
                        :key="i"
                      >
                        <img
                          class="li-img"
                          :src="'/vehicleStaticUrl' + item.vehiclepicurlall"
                          alt=""
                        />
                        <div class="item-main">
                          <div class="item-section1">
                            <div>
                              {{ item.plateno }}
                              <div
                                v-if="item.isblacklist === '是'"
                                class="blacklist"
                              >
                                <img
                                  :src="$fun.getImg('researchManagement/alarm.png')"
                                  alt=""
                                />
                                黑名单
                              </div>
                            </div>
                            <div>{{ item.monitorname }}</div>
                          </div>
                          <div class="item-section2">
                            <div>{{ item.crosstime }}</div>
                            <div>{{ item.isinside === "是" ? "内部车" : "外来车" }}</div>
                            <div>车型：{{ item.vehicletypename }}</div>
                          </div>
                        </div>
                        <div
                          class="view"
                          :data-id="item.Id"
                        >
                          查看
                        </div>
                      </li>
                    </ul>
                  </vue3ScrollSeamless>
                </template>
                <EmptyData v-else />
              </div>
            </template>
          </BasePanel></div
      ></transition-group>
    </div>
    <Modal
      id="dataPanel"
      v-model:show="showDataPanel"
      disable-zoom
      :close-on-click-modal="true"
    >
      <template v-slot:container>
        <PanelData :tab="initTab" />
      </template>
    </Modal>
    <Modal
      v-model:show="showClxqBaseDialog"
      disable-zoom
    >
      <template v-slot:container>
        <VehicleBaseDetails :data="info" />
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
.vehicleCheckpoint {
  position: relative;
  height: 100%;
  .map-box {
    position: relative;
    width: 100%;
    height: 100%;
  }
  .info-boxs {
    display: flex;
    gap: 10px;
    position: absolute;
    top: 60px;
    left: calc(calc(100% - 21.875vw) / 2);
    transform: translateX(-50%);
    font-size: 0.7292vw;
    color: #fff;
    z-index: 1;
    .info-box {
      position: relative;
      background: linear-gradient(to bottom, rgba(5, 69, 109, 0.65), rgba(4, 34, 54, 0.65) 50%, rgba(4, 68, 109, 0.65));
      padding: 0.5208vw 1.0417vw;
      > div {
        &:nth-child(1) {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.5208vw;
          height: 22px;
        }
        &:nth-child(2) {
          display: flex;
          justify-content: space-between;
          align-items: end;
          .countup-wrap {
            font-size: 1.6667vw;
            color: #2cfefe;
            margin-right: 1.0417vw;
            letter-spacing: 3px;
          }
        }
      }
    }
    .corner {
      &::before,
      &::after {
        content: "";
        position: absolute;
        width: 6px;
        height: 6px;
      }
      &::before {
        top: 0;
        left: 0;
        border-top: 1px solid #38eaed;
        border-left: 1px solid #38eaed;
      }
      &::after {
        bottom: 0;
        right: 0;
        border-bottom: 1px solid #38eaed;
        border-right: 1px solid #38eaed;
      }
      .corner-top-right::before,
      .corner-bottom-left::after {
        content: "";
        position: absolute;
        width: 6px;
        height: 6px;
      }
      .corner-top-right::before {
        top: 0;
        right: 0;
        border-top: 1px solid #38eaed;
        border-right: 1px solid #38eaed;
      }
      .corner-bottom-left::after {
        bottom: 0;
        left: 0;
        border-bottom: 1px solid #38eaed;
        border-left: 1px solid #38eaed;
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
    .analysis-btn {
      display: flex;
      flex-direction: column;
      gap: 0.7813vw;
      width: 4.0104vw;
      cursor: pointer;
    }
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
    width: 47.9167vw;
    .contain {
      display: flex;
      height: 100%;
      .box {
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
  .section2 {
    flex: 1;
  }
  .section3 {
    height: 30vh;
    color: #fff;
    .contain {
      display: flex;
      flex-direction: column;
      height: 100%;
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
    .ui-wrap-yjjc {
      list-style: none;
      margin: 0;
      padding: 0;
      .li-item {
        padding: 5px;
        display: flex;
        align-items: center;
        padding: 0.5208vw;
        justify-content: space-between;
        border-bottom: 1px solid #495b71;
        .li-item-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 10px;
          .hd {
            display: flex;
            align-items: center;
            font-size: 0.625vw;
            span {
              padding: 3px 1.0417vw;
              margin-right: 4px;
              background: linear-gradient(
                to right,
                rgba(247, 83, 81, 0) 0%,
                rgba(250, 29, 26, 1) 52%,
                rgba(247, 83, 81, 0) 100%
              );
            }
          }
          .text {
            font-size: 0.7292vw;
          }
        }
        .arrow {
          width: 25px;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          svg {
            pointer-events: none;
          }
        }
      }
    }
    .ui-wrap-cljc {
      display: flex;
      flex-direction: column;
      gap: 0.5208vw;
      background-color: #192f49;
      margin: 0;
      padding: 0;
      .li-item {
        position: relative;
        display: flex;
        gap: 0.2604vw;
        margin: 0;
        font-size: 0.625vw;
        background-color: #183656;
        .li-img {
          width: 4.1667vw;
          height: 70px;
          object-fit: contain;
        }
        .item-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-evenly;
          margin-right: 2.6042vw;
          > div {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .item-section1 {
            color: #38cafe;
            font-size: 0.8333vw;
            & > div:first-child {
              display: flex;
              align-items: center;
              gap: 0.2604vw;
              .blacklist {
                display: flex;
                align-items: center;
                gap: 0.1042vw;
                font-size: 0.625vw;
                color: #f94340;
              }
            }
          }
        }
        .view {
          position: absolute;
          top: 50%;
          right: 5px;
          transform: translateY(-50%);
          color: #38cafe;
          width: 1.875vw;
          height: 18px;
          text-align: center;
          line-height: 18px;
          border-radius: 0.4688vw;
          border: 1px solid #38cafe;
          cursor: pointer;
          user-select: none;
        }
      }
    }
  }
}
</style>
<style lang="scss">
.vehicleCheckpoint {
  .el-input__wrapper {
    background-color: #0c284d;
    color: #aab4c1;
    box-shadow: none;
  }
  .el-input__inner {
    color: #aab4c1;
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
  .status1 {
    color: #fff;
    padding: 0px 10px;
    background-color: #26c353;
    border-radius: 20px;
  }
}
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
</style>
