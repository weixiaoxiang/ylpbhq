<script lang="ts" setup>
import {
  GetALargeScreenSoilMonitor_EcologyEQI,
  GetALargeScreenSoilMonitor_EcologyReport,
  GetALargeScreenSoilMonitor_EcologyReport_Download,
  GetALargeScreenSoilMonitor_Qxalarm,
  GetALargeScreenSoilMonitor_ssjc,
  GetALargeScreenSoilMonitor_Tjfx,
  GetALargeScreenSoilMonitor_TopStatict,
  GetALargeScreenSoilMonitor_Wljyl,
  GetAllEnvironmentalEquipment
} from "@/api"
import dayjs from "dayjs"
// @ts-expect-error  说明原因
import { vue3ScrollSeamless } from "vue3-scroll-seamless"
const proxy = getCurrentInstance()!.proxy as any
const { showCSB } = storeToRefs(useConfigStore())
const popup = ref<any>(null)
const { map, popupFormatType, popupInfo, closePopup, addLayerManageData, removeLayerManageData } = useOlMap(popup, {
  popupFormatType: "虫情测报灯",
  zoom: 13,
  center: [116.0992869, 31.046022],
  openOverlay: false,
  overlayOffset: [0, -70],
  overlayPositioning: "bottom-center",
  vectorLayerDeclutter: true
})

// 获得头部数据
const infoData = ref<any>({})
const getInfoData = async () => {
  const { response } = await GetALargeScreenSoilMonitor_TopStatict()
  infoData.value = {
    qxzxsb: response.qxzxsb,
    qxlxsb: response.qxlxsb,
    qxAll: response.qxzxsb + response.qxlxsb,
    swzxsb: response.swzxsb,
    swlxsb: response.swlxsb,
    swAll: response.swzxsb + response.swlxsb,
    trzxsb: response.trzxsb,
    trlxsb: response.trlxsb,
    trAll: response.trzxsb + response.trlxsb
  }
}

// 报告折叠
const reportBoxFold = ref(false) // 报告是否折叠
const handleReportBoxButtonClick = async (type: string) => {
  if (type === "折叠") {
    reportBoxFold.value = !reportBoxFold.value
  } else if (type === "下载") {
    // 下载word文档 下载文档
    const blob = await GetALargeScreenSoilMonitor_EcologyReport_Download()
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `生态监测报告_${dayjs().format("YYYY年MM月DD日")}.docx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
  }
}
// 当前月份
const currentMonth = ref<any>(dayjs().format("YYYY年M月"))
// 获得报告数据
const reportData = ref<any>(null)
const getReportData = async () => {
  const { response } = await GetALargeScreenSoilMonitor_EcologyReport()
  // reportData.value = response
  const {
    qxdescribe,
    qxqualifiedlist,
    qxunqualifiedlist,
    szdescribe,
    szqualifiedlist,
    szunqualifiedlist,
    avgsd,
    avgwd,
    maxsd,
    maxwd,
    minsd,
    minwd
  } = response
  // 构建报告内容，遇到为null的数据则不显示对应文本
  let reportHtml = `
    <p class="rich-p">尊敬的领导：</p>
    <p class="rich-p">根据环境监测工作安排，安徽省鹞落坪国家级自然保护区系统对保护区环境进行了全面监测，并特此就监测情况进行汇报。具体情况如下：</p>
    <p class="rich-p">一、气象环境监测情况</p>
    <p class="rich-p">安徽省鹞落坪国家级自然保护区系统对空气中的各项指数进行了监测，结果显示，`

  if (qxqualifiedlist != null && qxqualifiedlist !== "") {
    reportHtml += `<span class="text1">${qxqualifiedlist}</span>关键指标稳定在合格范围内；`
  }
  if (qxunqualifiedlist != null && qxunqualifiedlist !== "") {
    reportHtml += `<span class="text1">${qxunqualifiedlist}</span>指标在不合格范围内；`
  }

  // 温度和湿度相关内容拼接
  let tempHumStr = "本月，"
  const tempArr: string[] = []
  if (maxwd != null) tempArr.push(`保护区最高温度<span class="text1">${Number(maxwd).toFixed(1)}</span>℃`)
  if (minwd != null) tempArr.push(`最低温度<span class="text1">${Number(minwd).toFixed(1)}</span>℃`)
  if (avgwd != null) tempArr.push(`平均温度<span class="text1">${Number(avgwd).toFixed(1)}</span>℃`)
  if (maxsd != null) tempArr.push(`最高湿度<span class="text1">${Number(maxsd).toFixed(1)}</span>%`)
  if (minsd != null) tempArr.push(`最低湿度<span class="text1">${Number(minsd).toFixed(1)}</span>%`)
  if (avgsd != null) tempArr.push(`平均湿度<span class="text1">${Number(avgsd).toFixed(1)}</span>%`)
  if (tempArr.length > 0) {
    tempHumStr += tempArr.join("，") + "。"
    reportHtml += tempHumStr
  }

  if (qxdescribe != null && qxdescribe !== "") {
    reportHtml += `<span>总体来看，${qxdescribe}。</span>`
  }

  reportHtml += `</p>`

  // 水质监测部分
  reportHtml += `<p class="rich-p">二、水质环境监测情况</p>`
  reportHtml += `<p class="rich-p">安徽省鹞落坪国家级自然保护区系统对水体各项指标进行了监测，结果显示，`

  if (szqualifiedlist != null && szqualifiedlist !== "") {
    reportHtml += `<span class="text1">${szqualifiedlist}</span>关键指标稳定在合格范围内；`
  }
  if (szunqualifiedlist != null && szunqualifiedlist !== "") {
    reportHtml += `<span class="text1">${szunqualifiedlist}</span>指标在不合格范围内；`
  }
  if (szdescribe != null && szdescribe !== "") {
    reportHtml += `<span>总体来看，${szdescribe}。</span>`
  }

  reportHtml += `</p>`

  reportData.value = reportHtml
}

// 当前时间
const currentTime = dayjs().format("YYYY/MM/DD HH:mm:ss")

// 获得环境指数EQI
const eqiData = ref<any>(null)
const getEqiData = async () => {
  const { response } = await GetALargeScreenSoilMonitor_EcologyEQI()
  eqiData.value = response
}

// 获得天气预测
const weatherForecastData = ref<any>(null)
const getWeatherForecastData = async () => {
  const res = await axios.get("http://www.nmc.cn/rest/weather?stationid=GbhPZ&_=1729230315064")
  res.data.data.tempchart.forEach((item: any) => {
    item.time = dayjs(item.time).format("YYYY-MM-DD")
  })
  const tempchart = res.data.data.tempchart
  const daysInChinese = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"]
  weatherForecastData.value = res.data.data.predict.detail.splice(0, 7).map((item: any) => {
    const temp = tempchart.find((i: any) => i.time === item.date)
    return {
      name: daysInChinese[dayjs(item.date).day()],
      time: dayjs(item.date).format("MM-DD"),
      weather: item.day.weather.info,
      temperature: item.day.weather.temperature,
      tempRange: Math.round(temp.min_temp) + "~" + Math.round(temp.max_temp)
    }
  })
}

// 未来降雨当前时间
const currentHour = ref("未来6小时")
const handleTimeHourClick = async (time: string) => {
  currentHour.value = time
  getBarData()
}

// 获得未来降雨数据
const barData = ref<any>(null)
const getBarData = async () => {
  const { response } = await GetALargeScreenSoilMonitor_Wljyl({
    dataType: currentHour.value
  })
  if (response?.length > 0) {
    barData.value = {
      dw: "mm",
      xAxis: response.map((item: any) => item.name),
      data: response
    }
  } else {
    barData.value = null
  }
}
// 土壤检测设备
const trjc = ref("")
// 获得土壤检测设备
const trjcList = ref<any>([])
const getTrjcList = async () => {
  const { response } = await GetAllEnvironmentalEquipment({
    equipmentType: "土壤"
  })
  trjcList.value = response
  if (trjcList.value.length > 0) {
    trjc.value = trjcList.value[0].equipmentId
    getTrjcSdData()
    getLineBarData()
  }
}
const handleTrjcChange = (_: string) => {
  // console.log(value)
  getTrjcSdData()
  getLineBarData()
}

// 获得土壤监测土壤深度数据
const trjcSdData = ref<any>([])
const getTrjcSdData = async () => {
  const img = proxy.$fun.getImg("bigDataAnalysis/j8.png")
  const { response } = await GetALargeScreenSoilMonitor_ssjc({
    equipmentid: trjc.value
  })
  if (response?.length > 0) {
    // trjcSdData.value = response.map((item: any, index: number) => {
    //   return {
    //     img: imgs[index],
    //     depth: item.depth,
    //     temperature: item.temperature,
    //     humidity: item.humidity
    //   }
    // })
    const data = response[0]
    const list = new Array(10).fill(0).map((item: any, index: number) => {
      return {
        img,
        depth: (index + 1) * 10,
        soilhumig: data["soilhumig" + (index + 1)],
        soiltempg: data["soiltempg" + (index + 1)]
      }
    })
    trjcSdData.value = list
  } else {
    trjcSdData.value = []
  }
}

// 统计分析当前时间类型
const currentTimeType = ref("周")
const handleTimeTypeClick = (type: string) => {
  currentTimeType.value = type
  getLineBarData()
}
// 获得统计分析数据
const lineBarData = ref<any>(null)
const getLineBarData = async () => {
  const { response } = await GetALargeScreenSoilMonitor_Tjfx({
    equipmentid: trjc.value,
    timeType: currentTimeType.value
  })
  if (response?.[0]?.childer?.length > 0) {
    lineBarData.value = {
      dw: ["℃", "%"],
      xAxis: response[0].childer.map((item: any) => item.name),
      data: response.map((item: any) => {
        if (item.name === "湿度") {
          return {
            name: item.name,
            type: "line",
            dw: "%",
            data: item.childer.map((item: any) => ({
              label: item.name,
              value: item.value
            }))
          }
        }
        if (item.name === "温度") {
          return {
            name: item.name,
            type: "bar",
            dw: "℃",
            data: item.childer.map((item: any) => ({
              label: item.name,
              value: item.value
            }))
          }
        }
      })
    }
  } else {
    lineBarData.value = null
  }
}

// 获得今日预警信息
const jryjList = ref<any>([])
const getJryj = async () => {
  const { response } = await GetALargeScreenSoilMonitor_Qxalarm()
  jryjList.value = response
}

const showDataPanel = ref(false)
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

const { setVariable } = useCssVariables()
onMounted(() => {
  setVariable("maptool-sidebar-right", "calc(21.875vw + 40px)") // 设置地图工具栏距右侧距离
  setVariable("maptool-sidebar-bottom", "calc(20px)") // 设置地图工具栏距底部距离
  getInfoData() // 获得头部数据
  getReportData() // 获得报告数据
  getEqiData() // 获得EQI数据
  getWeatherForecastData() // 获得天气预测
  getBarData() // 获得未来降雨数据
  getTrjcList() // 获得土壤检测设备
  // 土壤监测粒子特效
  initStarEffect("tree-svg", {
    fullScreen: false,
    particles: {
      number: {
        value: 3000
      },
      color: {
        value: ["#4393d9", "#1441d1", "#040b22", "#ffffff"]
      }
    }
  })
  getJryj() // 获得今日预警信息
})
</script>
<template>
  <div class="ecological-monitoring-one-map">
    <div class="info-box">
      <div class="info">
        <img
          :src="$fun.getImg('bigDataAnalysis/j1.png')"
          alt=""
        />
        <div class="info-text">
          <span>{{ infoData.qxzxsb }}</span
          >/{{ infoData.qxAll }}
        </div>
      </div>
      <div class="info">
        <img
          :src="$fun.getImg('bigDataAnalysis/j2.png')"
          alt=""
        />
        <div class="info-text">
          <span>{{ infoData.swzxsb }}</span
          >/{{ infoData.swAll }}
        </div>
      </div>
      <div class="info">
        <img
          :src="$fun.getImg('bigDataAnalysis/j3.png')"
          alt=""
        />
        <div class="info-text">
          <span>{{ infoData.trzxsb }}</span
          >/{{ infoData.trAll }}
        </div>
      </div>
    </div>
    <div class="earlyWarning-box">
      <vue3ScrollSeamless
        class="scroll-wrap"
        :classOptions="{ step: 0.08, limitMoveNum: 2, hoverStop: false }"
        :dataList="jryjList"
      >
        <ul class="ui-wrap">
          <li
            class="li-item"
            v-for="(item, i) of jryjList"
            :key="i"
          >
            <div class="earlyWarning-title">{{ item.name }}今日预警</div>
            <div>{{ item.factor }}{{ item.instructions }}</div>
          </li>
        </ul></vue3ScrollSeamless
      >
    </div>
    <div class="report-box">
      <div class="report-box-top">
        <div class="report-box-title">
          <h3>
            <img
              :src="$fun.getImg('bigDataAnalysis/j4.png')"
              alt=""
            />
            {{ currentMonth }}生态环境监测报告
          </h3>
        </div>
        <div class="report-box-button">
          <img
            :class="{ fold: reportBoxFold }"
            :src="$fun.getImg('bigDataAnalysis/j7.png')"
            alt=""
            @click="handleReportBoxButtonClick('折叠')"
          />
          <img
            :src="$fun.getImg('bigDataAnalysis/j5.png')"
            alt=""
            @click="handleReportBoxButtonClick('下载')"
          />
        </div>
      </div>
      <div
        class="report-box-bottom"
        :class="{ fold: reportBoxFold }"
      >
        <el-scrollbar max-height="16vw">
          <div v-html="reportData"></div>
        </el-scrollbar>
        <!-- <el-text line-clamp="4">
          本报告旨在评估和记录保护区在10月份的生态环境状况，包括但不限于空气质量、水质状况、植被覆盖、野生动物种群动态等，以便于制定相应的保护和管理措施。
        </el-text> -->
      </div>
    </div>
    <div class="section-bar">
      <MapLayerManage
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
          <BasePanel
            title="环境指数EQI"
            :sub-title="`更新时间：${currentTime}`"
          >
            <template #contain>
              <div class="contain">
                <div class="chart">
                  <ChartPanel8 :data="eqiData" />
                </div>
              </div> </template
          ></BasePanel>
        </div>
        <div
          v-show="showCSB"
          class="section2"
          key="section2"
        >
          <BasePanel
            title="天气预测"
            :sub-title="`更新时间：${currentTime}`"
          >
            <template #contain>
              <div class="contain">
                <div
                  v-for="(item, i) of weatherForecastData"
                  :key="i"
                  class="item"
                >
                  <div class="item-top">
                    <div>{{ item.name }}</div>
                    <div>{{ item.time }}</div>
                    <div>{{ item.weather }} {{ item.temperature }}℃</div>
                  </div>
                  <div class="item-bottom">{{ item.tempRange }}℃</div>
                </div>
              </div>
            </template></BasePanel
          >
        </div>
        <div
          v-show="showCSB"
          class="section3"
          key="section3"
        >
          <BasePanel
            title="未来降雨"
            :sub-title="`更新时间：${currentTime}`"
          >
            <template #contain>
              <div class="contain">
                <div class="tip">
                  <img
                    :src="$fun.getImg('bigDataAnalysis/j4.png')"
                    alt=""
                  />
                  保护区未来6小时（截止12时）平均降雨量[770]mm
                </div>
                <div class="time-box">
                  <div
                    class="time-item"
                    :class="{ current: currentHour === '未来6小时' }"
                    @click="handleTimeHourClick('未来6小时')"
                  >
                    未来6小时
                  </div>
                  <div
                    class="time-item"
                    :class="{ current: currentHour === '未来12小时' }"
                    @click="handleTimeHourClick('未来12小时')"
                  >
                    未来12小时
                  </div>
                  <div
                    class="time-item"
                    :class="{ current: currentHour === '未来24小时' }"
                    @click="handleTimeHourClick('未来24小时')"
                  >
                    未来24小时
                  </div>
                </div>
                <div class="flex-1">
                  <Bar3DChartPanel
                    :left-colors="['#18c7e5', '#0a3267']"
                    :right-colors="['#1e90b8', '#196190']"
                    :top-colors="['#134c7e', '#1badd0']"
                    :data="barData"
                  />
                </div>
              </div> </template
          ></BasePanel>
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
            title="土壤监测"
            :sub-title="`更新时间：${currentTime}`"
          >
            <template #contain>
              <div class="contain">
                <el-select
                  class="custom-select"
                  v-model="trjc"
                  placeholder="请选择土壤检测设备"
                  :teleported="false"
                  size="small"
                  clearable
                  popper-class="custom-select-popper"
                  @change="handleTrjcChange"
                >
                  <el-option
                    v-for="item of trjcList"
                    :key="item.Id"
                    :label="item.name"
                    :value="item.equipmentId"
                  />
                </el-select>
                <div
                  class="tree-svg"
                  id="tree-svg"
                >
                  <img
                    :src="$fun.getImg('bigDataAnalysis/j8.svg')"
                    alt=""
                  />
                </div>
                <div class="tree-box">
                  <template v-if="trjcSdData.length > 0">
                    <div
                      v-for="(item, i) of trjcSdData"
                      :key="i"
                      class="tree-item"
                    >
                      <img
                        :src="item.img"
                        alt=""
                      />
                      <div class="tree-item-text">
                        <span>深度：{{ item.depth }}CM</span>
                        &nbsp;&nbsp;&nbsp;
                        <span>土壤湿度：{{ item.soilhumig }}°</span>
                        &nbsp;&nbsp;&nbsp;
                        <span>土壤温度：{{ item.soiltempg }}℃</span>
                      </div>
                    </div>
                  </template>
                  <EmptyData v-else />
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
          <BasePanel
            title="统计分析"
            :sub-title="`更新时间：${currentTime}`"
          >
            <template #contain>
              <div class="contain">
                <div class="time-box">
                  <div
                    class="time-item"
                    :class="{ current: currentTimeType === '周' }"
                    @click="handleTimeTypeClick('周')"
                  >
                    周
                  </div>
                  <div
                    class="time-item"
                    :class="{ current: currentTimeType === '月' }"
                    @click="handleTimeTypeClick('月')"
                  >
                    月
                  </div>
                  <div
                    class="time-item"
                    :class="{ current: currentTimeType === '年' }"
                    @click="handleTimeTypeClick('年')"
                  >
                    年
                  </div>
                </div>
                <div class="flex-1">
                  <LineBarChartPanel
                    :lineColors="['#15a134', '#417064']"
                    :bar-colors="['#BB6821', '#F9F9E3']"
                    :gradient="true"
                    :area-background="true"
                    :open-effect="true"
                    :node-shadow="true"
                    :line-dashed="false"
                    :data="lineBarData"
                  />
                </div>
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
.ecological-monitoring-one-map {
  position: relative;
  height: 100%;
  font-size: 0.7292vw;
  color: #fff;
  .map-box {
    position: relative;
    width: 100%;
    height: 100%;
  }
  .info-box {
    display: flex;
    gap: 0.5208vw;
    position: absolute;
    top: 1.0417vw;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1;
    .info {
      position: relative;
      width: 10.2083vw;
      height: 5.1042vw;
      img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
      }
      .info-text {
        position: absolute;
        top: 1.5208vw;
        left: 4.5625vw;
        font-size: 1.25vw;
        color: rgba(255, 255, 255, 0.65);
        span {
          font-size: 1.6667vw;
          color: #fff;
          text-shadow: 0px 0px 10px rgba(255, 255, 255, 1); //x y 模糊距离 模糊大小 颜色
        }
      }
    }
  }
  .earlyWarning-box {
    position: absolute;
    top: 6.7708vw;
    left: 50%;
    transform: translateX(-50%);
    // width: 31.25vw;
    height: 1.6667vw;
    overflow: hidden;
    border: 1px solid #57535e;
    background-color: #1e0814;
    font-size: 0.8333vw;
    color: #d52e48;
    z-index: 1;
    .scroll-wrap {
      .ui-wrap {
        margin: 0;
        padding: 0;
        .li-item {
          display: flex;
          align-items: center;
          gap: 0.5208vw;
          height: 1.6667vw;
          padding: 0 1.0417vw;
          .earlyWarning-title {
            display: flex;
            align-items: center;
            justify-content: center;
            // width: 3.6458vw;
            width: fit-content;
            height: 1.1458vw;
            padding: 0 0.1563vw;
            color: #fff;
            font-size: 0.7292vw;
            background: url("@/assets/images/bigDataAnalysis/j14.png") no-repeat center center / 100% 100%;
          }
        }
      }
    }
  }
  .report-box {
    position: absolute;
    bottom: 20px;
    left: var(--maptool-sidebar-right);
    width: 18.75vw;
    background-color: #021424;
    padding: 0.5208vw;
    font-size: 0.75vw;
    border-radius: 4px;
    box-shadow: 0 0 5px 1px rgba(255, 255, 255, 0.05);
    z-index: 1;
    .report-box-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      line-height: 1.5em;
      .report-box-title {
        display: flex;
        align-items: center;
        gap: 0.5208vw;
        img {
          width: 0.9375vw;
        }
        h3 {
          font-size: 0.8333vw;
        }
      }
      .report-box-button {
        display: flex;
        align-items: center;
        gap: 0.5208vw;
        cursor: pointer;
        img {
          width: 1.25vw;
          transform-origin: center;
          transition: transform 0.3s ease-in-out;
        }
        > .fold {
          transform: rotate(180deg);
        }
      }
    }
    .report-box-bottom {
      overflow: hidden;
      transition: max-height 0.3s ease-in-out;
      max-height: 16vw;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
      // 折叠状态
      &.fold {
        max-height: 0;
        border-top: none;
      }
    }
  }
  :deep(.section-bar) {
    position: absolute;
    top: 20px;
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
    height: 30%;
    .contain {
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 0.2604vw;
      .chart {
        flex: 1;
      }
    }
  }
  .section2 {
    height: 25%;
    .contain {
      height: 100%;
      display: flex;
      justify-content: space-between;
      // gap: 0.2604vw;
      .item {
        width: fit-content;
        padding: 0 0.1042vw;
        // flex: 1;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        color: #a0b6cb;
        border-radius: 2px;
        overflow: hidden;
        background: url("@/assets/images/bigDataAnalysis/j6.png") no-repeat center center;
        background-size: 100% 100%;
        .item-top {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 0.5208vw;
          width: 100%;
          > div {
            &:nth-child(1) {
              font-size: 0.7292vw;
              font-style: italic;
            }
            &:nth-child(2) {
              font-size: 0.7292vw;
              font-weight: 700;
              color: #abc0d4;
            }
            &:nth-child(3) {
              font-size: 0.625vw;
            }
          }
        }
        .item-bottom {
          height: 35px;
          line-height: 35px;
          font-size: 0.625vw;
          font-weight: 700;
          color: #fff;
          text-shadow: 0px 0px 10px rgba(255, 255, 255, 1);
        }
      }
    }
  }
  .section3 {
    height: 45%;
    .contain {
      display: flex;
      flex-direction: column;
      gap: 0.3125vw;
      height: 100%;
      overflow: hidden;
      .tip {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.3125vw;
        margin: 0 0.5208vw;
        padding: 0.5208vw 0;
        font-size: 0.625vw;
        background-color: #1b3253;
        color: #919cac;
        img {
          width: 0.9375vw;
        }
      }
      .time-box {
        display: flex;
        align-items: center;
        margin: 0 0.5208vw;
        font-size: 0.625vw;
        background-color: #1c2d3f;
        color: #8e969f;
        font-size: 0.7292vw;
        .time-item {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
          height: 100%;
          padding: 0.5208vw 0;
          cursor: pointer;
          &.current {
            background: linear-gradient(to bottom, #93c7e6, #2e71bf);
            color: #fff;
          }
        }
      }
    }
  }
  .section4 {
    height: 60%;
    .contain {
      position: relative;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.3125vw;
      .custom-select {
        position: absolute;
        top: 0.5208vw;
        right: 0.5208vw;
        width: 7.8125vw;
        border: 1px solid #4fbef1;
        border-radius: 3px;
        z-index: 1;
      }
      .tree-svg {
        position: relative;
        width: 100%;
        height: 12.0833vw;
        img {
          position: absolute;
          inset: 0;
          width: 100%;
        }
      }
      .tree-box {
        position: relative;
        flex: 1;
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 0.3125vw;
        .tree-item {
          display: flex;
          align-items: center;
          // justify-content: center;
          position: relative;
          // flex: 1;
          height: calc(100% / 6);
          background-color: #fff;
          img {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
          }
          .tree-item-text {
            margin-left: 30px;
            z-index: 1;
            font-weight: bold;
            color: #18304b;
          }
        }
      }
    }
  }
  .section5 {
    height: 40%;
    .contain {
      display: flex;
      flex-direction: column;
      gap: 0.3125vw;
      height: 100%;
      overflow: hidden;
      .time-box {
        display: flex;
        align-items: center;
        margin: 0 0.5208vw;
        font-size: 0.625vw;
        background-color: #1c2d3f;
        color: #8e969f;
        font-size: 0.7292vw;
        .time-item {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
          height: 100%;
          padding: 0.5208vw 0;
          cursor: pointer;
          &.current {
            background: linear-gradient(to bottom, #93c7e6, #2e71bf);
            color: #fff;
          }
        }
      }
    }
  }
}
</style>
<style lang="scss">
.ecological-monitoring-one-map {
  .el-select__wrapper {
    background-color: #0c284d;
    color: #4fbef1;
    box-shadow: none;
  }
  .el-select__placeholder {
    color: #4fbef1;
    font-size: 0.7292vw;
  }

  .rich-p {
    text-indent: 2em;
    line-height: 2em;
    margin: 5px 0;
  }
  .text1 {
    color: #16a085;
    // font-size: 0.8vw;
    margin: 0 2px;
  }
}
</style>
