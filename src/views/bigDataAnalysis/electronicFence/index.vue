<script lang="ts" setup>
import {
  GetALargeScreen_ElectronicMonitorAIsbgk,
  GetALargeScreen_ElectronicMonitorReport,
  GetALargeScreen_ElectronicMonitorSbgk,
  GetALargeScreen_ElectronicMonitorWzsbTop,
  GetALargeScreen_ElectronicMonitorYjlx,
  GetALargeScreen_ElectronicMonitorYjqs,
  GetALargeScreen_ElectronicReport_Download
} from "@/api"
import dayjs from "dayjs"

const proxy = getCurrentInstance()!.proxy as any
const { showCSB } = storeToRefs(useConfigStore())
const changePanelTitleType = (type: string) => {
  let par = null
  if (type.includes("预警类型")) {
    par = splitFirstDash(type)[1]
    getYjlxChartData(par)
  }
  if (type.includes("预警趋势")) {
    par = splitFirstDash(type)[1]
    getLlqsChartData(par)
  }
  if (type.includes("AI识别概况")) {
    par = splitFirstDash(type)[1]
    getAisbgkData(par)
  }
  if (type.includes("智能报告")) {
    par = splitFirstDash(type)[1]
    if (par === "download") {
      // console.log(1)
      downloadReport()
    } else {
      reportTime.value = par
      getSmartReportData()
    }
  }
  // console.log(type, par, 1)

  /**
   * 只分割字符串中的第一个"-"符号
   * @param str 需要分割的字符串
   * @returns 分割后的数组，如果没有"-"则返回原字符串作为数组的唯一元素
   */
  function splitFirstDash(str: string): string[] {
    const index = str.indexOf("-")
    if (index === -1) {
      return [str]
    }
    return [str.substring(0, index), str.substring(index + 1)]
  }
}
//#region 地图相关
const popup = ref<any>(null)
const modular = ref("电子围栏一张图")
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
  zoom: 12.5381,
  center: [116.10550826192058, 31.035296306176544],
  modular: modular.value,
  openOverlay: false,
  overlayOffset: [0, -70],
  overlayPositioning: "bottom-center",
  vectorLayerDeclutter: false
})
//#endregion

// 获得设备概况
const sbgkData = ref<any>({})
const getSbgkData = async () => {
  const { response } = await GetALargeScreen_ElectronicMonitorSbgk()
  if (response) {
    sbgkData.value = response
  }
}

// 预警类型
const yjlxChartData = ref<any[] | null>([])
const getYjlxChartData = async (timeType?: string) => {
  const { response } = await GetALargeScreen_ElectronicMonitorYjlx({
    timeType: timeType || "近一月"
  })
  if (response?.length > 0) {
    yjlxChartData.value = response
  } else {
    yjlxChartData.value = null
  }
}

// 预警趋势
const llqsChartData = ref<any>(null)
// 预警趋势
const getLlqsChartData = async (timeType?: string) => {
  const { response } = await GetALargeScreen_ElectronicMonitorYjqs({
    timeType: timeType || "近一周"
  })
  if (response) {
    llqsChartData.value = {
      dw: "次",
      xAxis: response?.xAxis,
      data: response.data
    }
  } else {
    llqsChartData.value = null
  }
}

// AI识别概况
const aisbgkData = ref<any>({})
const getAisbgkData = async (timeType?: string) => {
  const { response } = await GetALargeScreen_ElectronicMonitorAIsbgk({
    timeType: timeType || "今日"
  })
  if (response) {
    aisbgkData.value = response
  }
}

// 物种识别次数排名
const cspmChartData = ref<any>(null)
const getCspmChartData = async () => {
  const { response } = await GetALargeScreen_ElectronicMonitorWzsbTop()
  const data = response?.reverse()
  if (data?.length > 0) {
    cspmChartData.value = {
      dw: "次",
      xAxis: data?.map((item: any) => item.name),
      data: [
        {
          name: "数量",
          data: data.map((item: any) => ({
            label: item.name,
            value: item.value
          }))
        }
      ]
    }
  } else {
    cspmChartData.value = null
  }
}
//  计算前12个月
const monthList = computed(() => {
  const list = []
  for (let i = 0; i < 12; i++) {
    list.push({
      label: dayjs().subtract(i, "month").format("YYYY-MM"),
      value: dayjs().subtract(i, "month").format("YYYY-MM")
    })
  }
  return list
})

const reportTime = ref<any>(dayjs().format("YYYY-MM"))
// 智能报告
const reportRich = ref<string>("")
const getSmartReportData = async () => {
  const { response } = await GetALargeScreen_ElectronicMonitorReport({
    time: reportTime.value || monthList.value[0].value
  })
  const videoCount = response.videoCount
  const imagCount = response.imagCount
  const lastZdyjCount = response.lastMonthEventList.find((item: any) => item.name === "振动预警")?.value || 0
  const zdyjCount = response.thisMonthEventList.find((item: any) => item.name === "振动预警")?.value || 0
  const zdyjChange = zdyjCount - lastZdyjCount

  const lastDdjgCount = response.lastMonthEventList.find((item: any) => item.name === "掉电警告")?.value || 0
  const ddjgCount = response.thisMonthEventList.find((item: any) => item.name === "掉电警告")?.value || 0
  const ddjgChange = ddjgCount - lastDdjgCount

  const lastDfjgCount = response.lastMonthEventList.find((item: any) => item.name === "倒伏预警")?.value || 0
  const dfjgCount = response.thisMonthEventList.find((item: any) => item.name === "倒伏预警")?.value || 0
  const dfjgChange = dfjgCount - lastDfjgCount

  const lastDljxCount = response.lastMonthEventList.find((item: any) => item.name === "离线预警")?.value || 0
  const dljxCount = response.thisMonthEventList.find((item: any) => item.name === "离线预警")?.value || 0
  const dljxChange = dljxCount - lastDljxCount

  const sbyjCount = zdyjCount + ddjgCount + dfjgCount + dljxCount

  const lastRlrqCount = response.lastMonthIdentifyList.find((item: any) => item.name === "人类入侵")?.value || 0
  const rlrqCount = response.thisMonthIdentifyList.find((item: any) => item.name === "人类入侵")?.value || 0
  const rlrqChange = rlrqCount - lastRlrqCount

  const lastClrqCount = response.lastMonthIdentifyList.find((item: any) => item.name === "车辆入侵")?.value || 0
  const clrqCount = response.thisMonthIdentifyList.find((item: any) => item.name === "车辆入侵")?.value || 0
  const clrqChange = clrqCount - lastClrqCount

  const rqyjCount = rlrqCount + clrqCount

  if (response) {
    reportRich.value = `
       尊敬的领导：
       根据电子围栏系统，安徽省鹞落坪国家级自然保护区系统对保护区进行全面监测，现将监测情况汇报如下：<br/>
       一、监测概述<br/>
       安徽省鹞落坪国家级自然保护区系统共监测到视频 <span class="value">${videoCount}</span> 个，图片 <span class="value">${imagCount}</span> 张。<br/>
       二、预警监测<br/>
       1. 设备预警本月共收到 <span class="value">${sbyjCount}</span> 次，具体情况如下：<br/>
          Ø 振动预警 <span class="value">${zdyjCount}</span> 次，较上月${zdyjChange > 0 ? "增加" : "减少"} <span class="value">${Math.abs(zdyjChange)}</span> 次；<br/>
          Ø 掉电警告 <span class="value">${ddjgCount}</span> 次，较上月${ddjgChange > 0 ? "增加" : "减少"} <span class="value">${Math.abs(ddjgChange)}</span> 次；<br/>
          Ø 倒伏预警 <span class="value">${dfjgCount}</span> 次，较上月${dfjgChange > 0 ? "增加" : "减少"} <span class="value">${Math.abs(dfjgChange)}</span> 次；<br/>
          Ø 离线预警 <span class="value">${dljxCount}</span> 次，较上月${dljxChange > 0 ? "增加" : "减少"} <span class="value">${Math.abs(dljxChange)}</span> 次；<br/>
       2. 入侵预警本月共收到 <span class="value">${rqyjCount}</span> 次，具体情况如下：<br/>
          Ø 人类入侵 <span class="value">${rlrqCount}</span> 次，较上月${rlrqChange > 0 ? "增加" : "减少"} <span class="value">${Math.abs(rlrqChange)}</span> 次；<br/>
          Ø 车辆入侵 <span class="value">${clrqCount}</span> 次，较上月${clrqChange > 0 ? "增加" : "减少"} <span class="value">${Math.abs(clrqChange)}</span> 次；
    `
  }
}
// 下载报告
const downloadReport = async () => {
  const blob = await GetALargeScreen_ElectronicReport_Download({ time: reportTime.value || monthList.value[0].value })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = `电子围栏智能报告_${reportTime.value}.docx`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}
// 关闭数据面板
const closeDataPanel = () => {
  initTabParams.value = null
}
const initTab = ref<any>(null)
const initTabParams = ref<any>(null)
// 点击地图弹框中点击查看历史AI分析记录
const handleHistoryData = (data: any) => {
  initTab.value = "AI分析记录"
  initTabParams.value = data
  showDataPanel.value = true
}

const showDataPanel = ref(false)
const { setVariable } = useCssVariables()
onMounted(() => {
  setVariable("maptool-sidebar-right", "calc(21.875vw + 40px)") // 设置地图工具栏距右侧距离
  setVariable("maptool-sidebar-bottom", "calc(20px)") // 设置地图工具栏距底部距离
  proxy.$mitt.on("changePanelTitleType", changePanelTitleType)
  getSbgkData() // 获得设备概况
  getYjlxChartData() // 预警类型
  getLlqsChartData() // 流量趋势
  getAisbgkData() // AI识别概况
  getCspmChartData() // 物种识别次数排名
  getSmartReportData() // 智能报告
})
onBeforeUnmount(() => {
  proxy.$mitt.off("changePanelTitleType", changePanelTitleType)
})
</script>
<template>
  <div class="electronicFence-onemap">
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
    <div class="left">
      <transition-group
        enter-active-class="animate__animated animate__bounceInLeft"
        leave-active-class="animate__animated animate__fadeOut"
        appear
        appear-active-class="animate__animated animate__bounceInLeft"
      >
        <div
          v-show="showCSB"
          class="section1"
          key="section1"
        >
          <BasePanel title="设备概括">
            <template #contain>
              <div class="contain">
                <div class="item">
                  <div class="item-value">{{ sbgkData.onLineCount }}</div>
                  <div class="item-title">设备在线</div>
                </div>
                <div class="item">
                  <div class="item-value">{{ sbgkData.offLineCount }}</div>
                  <div class="item-title">设备离线</div>
                </div>
                <div class="item">
                  <div class="item-value">{{ sbgkData.lowBatteryCount }}</div>
                  <div class="item-title">设备低电量</div>
                </div>
                <div class="item">
                  <div class="item-value">{{ sbgkData.equipmentAlertCount }}</div>
                  <div class="item-title">设备预警</div>
                </div>
                <div class="item">
                  <div class="item-value">{{ sbgkData.intrusionAlertCount }}</div>
                  <div class="item-title">入侵预警</div>
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
            title="预警类型"
            initSelect="近一月"
            :selectList="['近一月', '近一年', '累计']"
          >
            <template #contain>
              <div class="contain">
                <ChartPanel14
                  unit="个"
                  :data="yjlxChartData"
                />
              </div>
            </template>
          </BasePanel>
        </div>
        <div
          v-show="showCSB"
          class="section3"
          key="section3"
        >
          <BasePanel
            title="预警趋势"
            initSelect="近一周"
            :selectList="['近一周', '近一个月', '累计']"
          >
            <template #contain>
              <div class="contain">
                <LineChartPanel
                  symbol="circle"
                  :tooltip-total="true"
                  :open-effect="true"
                  :areaBackground="true"
                  :colors="['#fd897e', '#fdc77e', '#7efddb', '#7ec0fd']"
                  :data="llqsChartData"
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
          class="section4"
          key="section4"
        >
          <BasePanel
            title="AI识别概况"
            initSelect="今日"
            :selectList="['今日', '近一月', '近一年', '累计']"
          >
            <template #contain>
              <div class="contain">
                <div class="item">
                  <img
                    :src="$fun.getImg('bigDataAnalysis/m1.png')"
                    alt=""
                  />
                  <div class="item-con">
                    <div class="item-con-title">人类(次)</div>
                    <div class="item-con-value">{{ aisbgkData.humanCount }}</div>
                  </div>
                </div>
                <div class="item">
                  <img
                    :src="$fun.getImg('bigDataAnalysis/m2.png')"
                    alt=""
                  />
                  <div class="item-con">
                    <div class="item-con-title">车辆(次)</div>
                    <div class="item-con-value">{{ aisbgkData.carCount }}</div>
                  </div>
                </div>
                <div class="item">
                  <img
                    :src="$fun.getImg('bigDataAnalysis/m3.png')"
                    alt=""
                  />
                  <div class="item-con">
                    <div class="item-con-title">陆生哺乳动物(次)</div>
                    <div class="item-con-value">{{ aisbgkData.landCount }}</div>
                  </div>
                </div>
                <div class="item">
                  <img
                    :src="$fun.getImg('bigDataAnalysis/m4.png')"
                    alt=""
                  />
                  <div class="item-con">
                    <div class="item-con-title">鸟类(次)</div>
                    <div class="item-con-value">{{ aisbgkData.animalCount }}</div>
                  </div>
                </div>
              </div>
            </template>
          </BasePanel>
        </div>
        <div
          v-show="showCSB"
          class="section5"
          key="section5"
        >
          <BasePanel title="物种识别次数排名">
            <template #contain>
              <div class="contain">
                <BarReversalChartPanel
                  :show-legend="false"
                  :colors="['#3690f8|#7ee8ec']"
                  :gradient="true"
                  :data="cspmChartData"
                />
              </div>
            </template>
          </BasePanel>
        </div>
        <div
          v-show="showCSB"
          class="section6"
          key="section6"
        >
          <BasePanel
            title="智能报告"
            :initSelect="reportTime"
            :selectList="monthList"
            download
          >
            <template #contain>
              <div class="contain rich-text">
                <el-scrollbar>
                  <div v-html="reportRich"></div>
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
      <MapPopup
        ref="popup"
        :type="1"
        :format-name="popupFormatType"
        :info="popupInfo"
        @close="closePopup"
        @handleHistoryDataClick="handleHistoryData"
      />
      <MapTool
        v-if="map"
        :map="map"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.electronicFence-onemap {
  position: relative;
  height: 100%;
  color: #fff;
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
    gap: 15px;
    height: 32px;
    z-index: 1;
    transition: all 0.3s ease-in-out;
  }
  .left {
    display: flex;
    flex-direction: column;
    gap: 20px;
    position: absolute;
    top: 20px;
    bottom: 20px;
    left: 20px;
    z-index: 1;
    overflow: hidden;
    > div {
      width: 21.875vw;
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
    flex: 1;
    .contain {
      height: 100%;
      display: grid;
      grid-template-rows: 1fr 1fr; /* 两行等高 */
      grid-template-columns: repeat(3, 1fr); /* 3列等宽 */
      gap: 10px; /* 间距 */
      height: 100%;
      padding: 0 10px;

      .item {
        background: linear-gradient(to bottom, rgba(15, 88, 157, 0.3) 0%, rgba(18, 69, 112, 0.3) 100%);
        border-radius: 4px;
        padding: 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        .item-value {
          display: flex;
          align-items: center;
          flex: 1;
          font-size: 24px;
          font-weight: bold;
          text-shadow:
            0px 0px 81.9px #ffffff,
            0px 0px 11.7px #ffffff;
        }
        .item-title {
          line-height: 2em;
          color: #90a4c9;
          font-size: 14px;
          font-weight: bold;
        }
      }
      .item:nth-child(5) {
        grid-column: 2 / 4;
      }
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
    :deep(.contain) {
      height: 100%;
    }
  }
  .section4 {
    flex: 1;
    .contain {
      height: 100%;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      grid-auto-rows: 1fr;
      .item {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 5px;
        padding-left: 10px;
        img {
          width: 54px;
          height: 62px;
        }
        .item-con {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 5px;
          padding-left: 10px;
          background: linear-gradient(to right, rgba(24, 73, 121, 0.5) 0%, rgba(22, 46, 80, 0) 100%);
          padding: 10px;
          .item-con-title {
            font-size: 14px;
            color: #eee;
          }
          .item-con-value {
            font-size: 24px;
            font-weight: bold;
            background: linear-gradient(to bottom, #c8f2f8, #57cbe3); /* 渐变颜色 */
            -webkit-background-clip: text;
            color: transparent;
          }
        }
      }
    }
  }
  .section5 {
    flex: 1;
    .contain {
      height: 100%;
    }
  }
  .section6 {
    flex: 1;
    overflow: hidden;
    .contain {
      padding: 10px;
      height: 100%;
      font-size: 18px;
      //text-indent: 2em;
      color: #d8ebfd;
      line-height: 2em;
      letter-spacing: 2px;
    }
  }
}
</style>
<style lang="scss">
.electronicFence-onemap {
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
<style lang="scss">
.rich-text {
  .value {
    color: #1abc9c;
  }
}
</style>
