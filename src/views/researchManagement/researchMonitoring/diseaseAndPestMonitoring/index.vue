<script lang="ts" setup>
import {
  GetPestEquipment_All,
  GetPestEquipment_Info,
  GetPestEquipment_Jdhcljsjtj,
  GetPestEquipment_qs,
  GetPestEquipment_Sbljbzhcsl,
  GetPestEquipment_Statistics,
  GetPestEquipment_ThisMonthMonitoring_Download,
  GetPestEquipment_ThisMonthMonitoringReport,
  GetPestEquipment_Zltj,
  GetPestSpeciesContents
} from "@/api"
import PanelData from "./PanelData.vue"
import dayjs from "dayjs"
const proxy = getCurrentInstance()!.proxy as any
const { showCSB } = storeToRefs(useConfigStore())
const changePanelTitleType = (type: string) => {
  if (type.indexOf("详情") > -1) {
    initTab.value = "害虫管理"
    showDataPanel.value = true
  } else if (type.indexOf("害虫统计") > -1) {
    // console.log(type.split("-")[1])
    getChartData3(type.split("-")[1])
  } else if (type.indexOf("害虫数量趋势") > -1) {
    getChartData4(type.split("-")[1])
  } else if (type.indexOf("监测报告") > -1) {
    if (type.split("-")[1] === "download") {
      // console.log(1)
      downloadReport()
    }
  }
}
const popup = ref<any>(null)
const modular = ref("病虫害监测")
const { map, vectorFeatures, locationMap, addLayerManageData, removeLayerManageData } = useOlMap(popup, {
  popupFormatType: "虫情测报灯",
  zoom: 12,
  center: [116.16027952755078, 30.97908202369116],
  modular: modular.value,
  openOverlay: false,
  overlayOffset: [0, -70],
  overlayPositioning: "bottom-center",
  vectorLayerDeclutter: false,
  callBack: {
    // 地图点击动植物弹出详情弹框
    click: (data: any) => {
      initTab.value = "监测记录"
      initTabParams.value = data
      showDataPanel.value = true
    }
  }
})

const addCqcbdData = (data: any, option: any) => {
  data.forEach((item: any) => {
    item.name = item.equipmentname
  })
  addLayerManageData(data, option)
}

// 获得设备统计信息
const sbtjInfo = ref<any>({})
const getSbtjInfo = async () => {
  const { response } = await GetPestEquipment_Statistics()
  sbtjInfo.value = response
}

// 获得八大害虫累计数量
const chartData1 = ref<any[]>([])
const getChartData1 = async () => {
  const { response } = await GetPestEquipment_Jdhcljsjtj()
  chartData1.value = response.map((item: any) => ({
    name: item.xAxis,
    value: item.yAxis
  }))
}

// 获得设备累计捕捉害虫数量
const chartData2 = ref<any>(null)
const getChartData2 = async () => {
  const { response } = await GetPestEquipment_Sbljbzhcsl()
  if (response?.length > 0) {
    chartData2.value = {
      dw: "只",
      xAxis: response.map((item: any) => item.xAxis),
      data: [
        {
          name: "害虫数量",
          data: response.map((item: any) => {
            return {
              label: item.xAxis,
              value: item.yAxis
            }
          })
        }
      ]
    }
  } else {
    chartData2.value = null
  }
}
// 获得害虫统计
const chartData3 = ref<any>(null)
const getChartData3 = async (timeType?: string) => {
  const { response } = await GetPestEquipment_Zltj({
    timeType: timeType || "近七天"
  })
  if (response?.length > 0) {
    chartData3.value = {
      dw: "只",
      xAxis: response.map((item: any) => item.xAxis),
      data: [
        {
          name: "害虫数量",
          data: response.map((item: any) => {
            return {
              label: item.xAxis,
              value: item.yAxis
            }
          })
        }
      ]
    }
  } else {
    chartData3.value = null
  }
}
// 获得害虫列表
const pestList = ref<any[]>([])
const getPestList = async () => {
  const { response } = await GetPestSpeciesContents()
  response.unshift("全部害虫")
  pestList.value = response
}
// 获得害虫数量趋势
const chartData4 = ref<any>(null)
const getChartData4 = async (pesttype?: string) => {
  // chartData4.value = {
  //   dw: "只",
  //   xAxis: ["美国白蛾", "春尺蠖",],
  //   data: [
  //     {
  //       name: "去年数量",
  //       data: [
  //         {
  //           label: "美国白蛾",
  //           value: 11
  //         },
  //         {
  //           label: "春尺蠖",
  //           value: 25
  //         },
  //       ]
  //     },
  //   ]
  // }
  if (pesttype === "全部害虫") {
    pesttype = ""
  }
  const { response } = await GetPestEquipment_qs({
    pesttype: pesttype || ""
  })
  if (response) {
    chartData4.value = {
      dw: "只",
      xAxis: response.xAxis,
      data: response.yAxis.map((item: any) => ({
        name: item.name,
        data: item.value.map((d: any, index: number) => ({
          label: response.xAxis[index],
          value: d
        }))
      }))
    }
  } else {
    chartData4.value = null
  }
}

// 获取本月监测报告
const thisMonthMonitoringReport = ref<any>({})
const getThisMonthMonitoringReport = async () => {
  const { response } = await GetPestEquipment_ThisMonthMonitoringReport()
  thisMonthMonitoringReport.value = response
}
const downloadReport = async () => {
  const blob = await GetPestEquipment_ThisMonthMonitoring_Download()
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = `病虫害监测报告_${dayjs().format("YYYY年MM月DD日")}.docx`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}

// 统计分析等等按钮点击事件
const showDataPanel = ref(false) // 数据面板是否显示
// 关闭数据面板
const closeDataPanel = () => {
  initTabParams.value = null
}
const initTab = ref<any>("统计分析") // 数据面板tab
const initTabParams = ref<any>(null) // 数据面板tab参数
const handleAnalysisBtnClick = (type: string) => {
  // console.log(type)
  initTab.value = type
  showDataPanel.value = true
}
const { setVariable } = useCssVariables()
onMounted(() => {
  setVariable("maptool-sidebar-right", "calc(21.875vw + 40px)") // 设置地图工具栏距右侧距离
  setVariable("maptool-sidebar-bottom", "calc(305px + 40px)") // 设置地图工具栏距底部距离
  proxy.$mitt.on("changePanelTitleType", changePanelTitleType)
  getSbtjInfo() // 获取设备统计信息
  getChartData1() // 获取八大害虫累计数量
  getChartData2() // 获取设备累计捕捉害虫数量
  getChartData3() // 获取害虫统计
  getChartData4() // 获取害虫数量趋势
  getPestList() // 获取害虫列表
  getThisMonthMonitoringReport() // 获取本月监测报告
})
onBeforeUnmount(() => {
  proxy.$mitt.off("changePanelTitleType", changePanelTitleType)
})
</script>
<template>
  <div class="diseaseAndPest-monitoring">
    <div class="section-bar">
      <MapFeatureSearch
        :features="vectorFeatures"
        @location="locationMap"
      />
      <BaseLayerSelect
        v-if="map"
        :map="map"
        :init-show="false"
        :init-checked-keys="[]"
      />
      <MapLayerManage
        :modular="modular"
        :init-checked-keys="[35]"
        @addLayer="addCqcbdData"
        @removeLayer="removeLayerManageData"
      />
      <div class="analysis-btn">
        <img
          :src="$fun.getImg('researchManagement/e5.png')"
          alt=""
          title="统计分析"
          @click="handleAnalysisBtnClick('统计分析')"
        />
        <img
          :src="$fun.getImg('researchManagement/d7.png')"
          alt=""
          title="害虫管理"
          @click="handleAnalysisBtnClick('害虫管理')"
        />
        <img
          :src="$fun.getImg('researchManagement/d8.png')"
          alt=""
          title="监测记录"
          @click="handleAnalysisBtnClick('监测记录')"
        />
        <img
          :src="$fun.getImg('researchManagement/d9.png')"
          alt=""
          title="枯木多时相对比"
          @click="handleAnalysisBtnClick('枯木多时相对比')"
        />
      </div>
    </div>
    <div class="info-box">
      <div class="info-item">
        <img
          :src="$fun.getImg('researchManagement/e2.png')"
          alt=""
        />
        <div class="info-item-right">
          <span class="value value1">{{ sbtjInfo.equipmentTotal }}台</span>
          <span class="title"
            >设备总数 <span class="zx">在线率{{ sbtjInfo.onlineRate }}%</span></span
          >
        </div>
      </div>
      <div class="info-item">
        <img
          :src="$fun.getImg('researchManagement/e3.png')"
          alt=""
        />
        <div class="info-item-right">
          <span class="value value2">{{ sbtjInfo.equipmentOnLine }}台</span>
          <span class="title">在线设备数量</span>
        </div>
      </div>
      <div class="info-item">
        <img
          :src="$fun.getImg('researchManagement/e4.png')"
          alt=""
        />
        <div class="info-item-right">
          <span class="value value3">{{ sbtjInfo.equipmentOffLine }}台</span>
          <span class="title">离线设备数量</span>
        </div>
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
          <BasePanel>
            <template #title>
              <span
                class="title"
                style="display: flex; gap: 3px; align-items: center"
              >
                八大害虫累计数量
                <!-- <el-tooltip
                  effect="dark"
                  content="请选择关注的害虫种类，地图将呈现其在监测区域的活动热力图"
                  placement="top-start"
                >
                  <i-ep-question-filled style="font-size: 0.7292vw; color: #0fe3f1" />
                </el-tooltip> -->
              </span>
            </template>
            <template #contain>
              <div class="contain">
                <ChartPanel2
                  unit="只"
                  :data="chartData1"
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
          <BasePanel title="设备累计捕捉害虫数量">
            <template #contain>
              <div class="contain">
                <BarChartPanel
                  :colors="['#01feff|#0A84FF']"
                  :gradient="true"
                  :data="chartData2"
                />
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
          <BasePanel
            title="害虫统计"
            initType="近七天"
            :types="['近七天', '近14天', '近30天']"
          >
            <template #contain>
              <div class="contain">
                <LineChartPanel
                  :colors="['#02b4ec']"
                  :node-shadow="true"
                  :open-effect="true"
                  :data="chartData3"
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
            title="害虫数量趋势"
            initSelect="全部害虫"
            :selectList="pestList"
          >
            <template #contain>
              <div class="contain">
                <LineChartPanel
                  :colors="['#563A9C', '#F87A53']"
                  :node-shadow="true"
                  :open-effect="true"
                  :area-background="true"
                  :line-dashed="false"
                  :data="chartData4"
                />
              </div>
            </template>
          </BasePanel>
        </div>
        <div
          v-show="showCSB"
          class="section5"
          key="section5"
        >
          <BasePanel
            title="监测报告"
            download
          >
            <template #contain>
              <div class="contain">
                <el-scrollbar height="100%">
                  本月监测期间，共记录到<span>{{ thisMonthMonitoringReport.pestTypesTotal }}</span
                  >种主要病虫害：<span>{{ thisMonthMonitoringReport.pestTypesTotalName }}</span
                  >。其中，<span>{{ thisMonthMonitoringReport.pestTypesTop1Name }}</span
                  >数量最多，共计<span>{{ thisMonthMonitoringReport.pestTypesTop1Count }}</span
                  >只，成为本月主要监测对象。<span>{{ thisMonthMonitoringReport.pestTypesIncreaseMaxName }}</span
                  >数量较上月有所增加，共监测到<span>{{ thisMonthMonitoringReport.pestTypesIncreaseMaxCount }}</span
                  >只；而<span>{{ thisMonthMonitoringReport.pestTypesIncreaseMinName }}</span
                  >数量则呈现减少趋势，本月共记录<span>{{ thisMonthMonitoringReport.pestTypesIncreaseMinCount }}</span
                  >只。 针对上述监测结果，提出以下建议： 1、对于数量众多的<span>{{
                    thisMonthMonitoringReport.pestTypesTop1Name
                  }}</span
                  >，应强化监测措施，密切关注其活动范围与数量变化，并及时采取有效防治手段，防止其进一步扩散危害。
                  2、尽管<span>{{ thisMonthMonitoringReport.pestTypesIncreaseMinName }}</span
                  >数量有所减少，但仍需保持警惕，继续巩固防治成效，加强植物健康管理，提升植物抗病性，防止其再次爆发。
                </el-scrollbar>
              </div>
            </template>
          </BasePanel>
        </div>
      </transition-group>
    </div>
    <Modal
      id="dataPanel"
      v-model:show="showDataPanel"
      disable-zoom
      :close-on-click-modal="false"
      @close="closeDataPanel"
    >
      <template v-slot:container>
        <PanelData
          :tab="initTab"
          :tab-params="initTabParams"
        />
      </template>
    </Modal>
    <div
      class="map-box"
      id="map"
    >
      <!-- <MapPopup
        ref="popup"
        :type="1"
        :format-name="popupFormatType"
        :info="popupInfo"
        @close="closePopup"
      /> -->
      <MapTool
        v-if="map"
        :map="map"
      />
      <div class="map-radial-overlay"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.diseaseAndPest-monitoring {
  position: relative;
  height: 100%;
  .map-box {
    position: relative;
    width: 100%;
    height: 100%;

    .map-radial-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      background:
        linear-gradient(
          to right,
          rgba(0, 0, 0, 0.5),
          rgba(255, 255, 255, 0) 30%,
          rgba(255, 255, 255, 0) 70%,
          rgba(0, 0, 0, 1)
        ),
        linear-gradient(
          to bottom,
          rgba(0, 0, 0, 0.5),
          rgba(255, 255, 255, 0) 30%,
          rgba(255, 255, 255, 0) 70%,
          rgba(0, 0, 0, 1)
        );
      z-index: 1;
    }
  }
  .section-bar {
    position: absolute;
    top: 20px;
    right: var(--maptool-sidebar-right);
    display: flex;
    gap: 15px;
    height: 32px;
    z-index: 2;
    transition: all 0.3s ease-in-out;
    .analysis-btn {
      display: flex;
      flex-direction: column;
      width: 2.6042vw;
      img {
        cursor: pointer;
      }
    }
  }
  .info-box {
    display: flex;
    justify-content: space-evenly;
    position: absolute;
    top: 30px;
    left: 20px;
    width: 30.9375vw;
    height: 67px;
    background: url("@/assets/images/researchManagement/e1.png") no-repeat center center / 100% 100%;
    z-index: 10;
    .info-item {
      display: flex;
      align-items: center;
      gap: 0.5208vw;
      .info-item-right {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 0.5208vw;
        .value {
          font-size: 1.0417vw;
        }
        .value1 {
          color: #5fb3f5;
        }
        .value2 {
          color: #00ffd4;
        }
        .value3 {
          color: #e45a83;
        }
        .zx {
          font-size: 0.5208vw;
          color: #ffbb40;
        }
        .title {
          font-size: 0.625vw;
          color: #098192;
        }
      }
    }
  }
  .bottom {
    display: flex;
    gap: 20px;
    position: absolute;
    bottom: 20px;
    left: 20px;
    right: calc(21.875vw + 40px);
    z-index: 2;
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
    z-index: 2;
    overflow: hidden;
    > div {
      width: 21.875vw;
    }
  }
  .section1 {
    width: 445px;
    .contain {
      height: 100%;
    }
  }
  .section2 {
    flex: 1;
    .contain {
      height: 100%;
    }
  }
  .section3 {
    flex: 1;
    overflow: hidden;
    .contain {
      height: 100%;
    }
  }
  .section4 {
    flex: 1;
    overflow: hidden;
    .contain {
      height: 100%;
    }
  }
  .section5 {
    height: 305px;
    .contain {
      height: 100%;
      line-height: 2em;
      background: url("@/assets/images/researchManagement/d6.png") no-repeat center center / 100% 100%;
      padding: 10px 15px;
      font-size: 14px;
      text-indent: 2em;
      color: #d8ebfd;
      span {
        color: orangered;
      }
    }
  }
}
</style>
<style lang="scss">
.diseaseAndPest-monitoring {
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
  .el-table {
    thead {
      font-size: 0.6771vw;
    }
    tbody {
      font-size: 0.6771vw;
    }
  }
}
</style>
