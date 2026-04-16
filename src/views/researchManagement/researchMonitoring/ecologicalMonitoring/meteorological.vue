<script lang="ts" setup>
import {
  GetAirQualityStatistics,
  GetAirQualityStatistics_yxt,
  GetAlarmToDayCount,
  GetAllEnvironmentalEquipment,
  GetEnvironmentalIndicator,
  GetEnvironmentalReality,
  GetMeteorologicalIndicatorsToDay,
  GetMeteorologicalSituation
} from "@/api"
import {
  getAirQualityLevel,
  getFYLZLevel,
  getGZDLevel,
  getHumidityLevel,
  getPM25Level,
  getRainfallLevel,
  getTemperatureLevel,
  getWindDirection,
  getWindSpeedLevel
} from "@/utils/index"
import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"
import CallThePoliceData from "./CallThePoliceData.vue"
import DataAnalysis from "./DataAnalysis.vue"
dayjs.extend(customParseFormat)

const { showCSB } = storeToRefs(useConfigStore())
const popup = ref<any>(null)
const modular = ref("气象")
const { closePopup, popupInfo, map, addTest, popupFormatType, addLayerManageData, removeLayerManageData } = useOlMap(
  popup,
  {
    zoom: 12.20477,
    center: [116.16027952755078, 30.97908202369116],
    modular: modular.value,
    openOverlay: false,
    vectorLayerDeclutter: false,
    overlayOffset: [0, -70],
    overlayPositioning: "bottom-center"
  }
)

// 使用 fetch API 加载 鹞落坪界线JSON 数据
const jsonDataUrl = "/ylpjx_zhyhq.json"
let JXDATA: any = null
fetch(jsonDataUrl)
  .then((response) => response.json())
  .then((data) => {
    JXDATA = data
  })
  .catch((error) => {
    console.error("Error loading JSON:", error)
  })

// 克里金插值
let krigingRemove: any = null
const currentKrigingType = ref<string>("")
const kriging = async (type: string) => {
  if (krigingRemove) {
    krigingRemove()
  }
  if (currentKrigingType.value === type) {
    currentKrigingType.value = ""
    return
  }
  currentKrigingType.value = type
  const { response } = await GetEnvironmentalIndicator({
    dataType: type
  })
  let data = response.map((item: any) => {
    return {
      name: item.name,
      lon: Number(item.lon),
      lat: Number(item.lat),
      value: Number(item.value)
    }
  })
  // #region 克里金插值-测试30条数据点
  // // 随机从3个气象站生成30个数据点
  // function getRandomInRange(min: number, max: number): number {
  //   return Math.random() * (max - min) + min
  // }

  // interface Station {
  //   name: string
  //   lon: number
  //   lat: number
  //   value: number
  // }

  // const baseStations: Station[] = [
  //   {
  //     name: "测试1",
  //     lon: 116.07381048730048,
  //     lat: 30.98502829387546,
  //     value: 15254
  //   },
  //   {
  //     name: "测试2",
  //     lon: 116.08022571,
  //     lat: 30.98286307,
  //     value: 13728.6
  //   },
  //   {
  //     name: "测试3",
  //     lon: 116.1000694051287,
  //     lat: 31.0710702886,
  //     value: 12203.2
  //   },
  //   {
  //     name: "测试4",
  //     lon: 116.1397974462837,
  //     lat: 31.051554452111752,
  //     value: 14203.2
  //   },
  //   {
  //     name: "测试5",
  //     lon: 116.09417635777392,
  //     lat: 31.037407339340056,
  //     value: 13803.2
  //   },
  //   {
  //     name: "测试6",
  //     lon: 116.05055671164062,
  //     lat: 31.05056657267807,
  //     value: 13303.2
  //   },
  //   {
  //     name: "测试7",
  //     lon: 116.1494539267284,
  //     lat: 31.096356800577816,
  //     value: 16203.2
  //   }
  // ]

  // // 计算所有基站的value最大最小值
  // const values = baseStations.map((s) => s.value)
  // const minValue = Math.min(...values)
  // const maxValue = Math.max(...values)

  // const data: Station[] = Array.from({ length: 30 }, () => {
  //   // 随机选择一个基站
  //   const base = baseStations[Math.floor(Math.random() * baseStations.length)]
  //   // 在基站经纬度附近生成微小偏移，模拟真实分布
  //   const lon = getRandomInRange(base.lon - 0.01, base.lon + 0.01)
  //   const lat = getRandomInRange(base.lat - 0.01, base.lat + 0.01)
  //   // value 在所有基站value的最大最小值之间随机生成
  //   const value = getRandomInRange(minValue, maxValue)
  //   return {
  //     name: base.name,
  //     lon,
  //     lat,
  //     value: Math.round(value * 10) / 10 // 保留1位小数
  //   }
  // })
  // addTest(data)
  // #endregion
  if (!response || response.length === 0) return
  // 边界多边形坐标
  let boundary = JXDATA.coordinates[0][0]
  // 创建克里金插值图层
  const { remove } = createKrigingLayer(toRaw(map.value), data, boundary, {
    zIndex: 10,
    gridSize: 200,
    canvasSize: 800,
    colors: ["#fb3300", "#fe6c00", "#ff9000", "#ffb300", "#fdcc00"],
    opacity: 0.9,
    modelType: "spherical"
  })
  krigingRemove = remove
}

const proxy = getCurrentInstance()!.proxy as any
const station = ref()
const stationList = ref<any>([])
// 获得水质站列表
const getAllEnvironmentalEquipment = async () => {
  const { response } = await GetAllEnvironmentalEquipment({
    equipmentType: "气象"
  })
  stationList.value = response
  station.value = response[0]
  getAirQualityStatistics_yxt() // 空气质量百分比
  getAirQualityStatistics() // 空气质量统计
  getMeteorologicalIndicatorsToDay() // 气象指标当日曲线
  getEnvironmentalReality() // 环境实况
  getMeteorologicalSituation() // 气象实况
}
// 切换气象站
const changeStation = () => {
  getAirQualityStatistics_yxt() // 空气质量百分比
  getAirQualityStatistics() // 空气质量统计
  getMeteorologicalIndicatorsToDay() // 气象指标当日曲线
  getEnvironmentalReality() // 环境实况
  getMeteorologicalSituation() // 气象实况
}
// 获得今日报警数
const jrbjCount = ref(0)
const getAlarmToDayCount = async () => {
  const { response } = await GetAlarmToDayCount()
  jrbjCount.value = response?.count
}
// 空气质量统计
const dbCount = ref(0) // 达标天数
const getAirQualityStatistics = async () => {
  const { response } = await GetAirQualityStatistics({
    equipmentId: station.value.equipmentId,
    queryTime: dayjs(selectedDate.value, "YYYY年M月").format("YYYY-MM")
  })
  dates.value = []
  dbCount.value = 0
  response.forEach((item: any) => {
    if (item.statisticalTime) {
      dates.value.push({
        value: parseInt(dayjs(item.statisticalTime).format("D")),
        isqualify: item.isqualify,
        AQI: item.value
      })
      if (item.isqualify) {
        dbCount.value++
      }
    }
  })
}
const kqzlInfo = ref<any>({})
// 空气质量百分比
const getAirQualityStatistics_yxt = async () => {
  const { response } = await GetAirQualityStatistics_yxt({
    equipmentId: station.value.equipmentId
  })
  if (!response) return
  kqzlInfo.value = response
}
// 气象指标当日曲线
let qxzbdrqxType = "PM2.5" // 指标类型
const getMeteorologicalIndicatorsToDay = async () => {
  const { response } = await GetMeteorologicalIndicatorsToDay({
    equipmentId: station.value.equipmentId,
    queryType: qxzbdrqxType || "PM2.5"
  })
  if (response?.length === 0) {
    lineData.value = null
    return
  }
  lineData.value = {
    dw: qxzbdrqxType === "PM2.5" ? "ug/m³" : qxzbdrqxType === "湿度" ? "%" : "℃",
    xAxis: response.map((item: any) => {
      return item.name
    }),
    data: [
      {
        name: qxzbdrqxType,
        data: response.map((item: any) => {
          return {
            label: item.name,
            value: item.value
          }
        })
      }
    ]
  }
}
// 环境实况
const hjskInfo = ref<any>({})
const getEnvironmentalReality = async () => {
  const { response } = await GetEnvironmentalReality({
    equipmentId: station.value.equipmentId
  })
  if (!response) return
  hjskInfo.value = response
}
// 气象实况
const qxskInfo = ref<any>({
  meteorologicalData: {}
})
const getMeteorologicalSituation = async () => {
  const { response } = await GetMeteorologicalSituation({
    equipmentId: station.value.equipmentId
  })
  if (!response) return
  qxskInfo.value = response
}

const changePanelTitleType = (type: string) => {
  if (type.indexOf("气象指标当日曲线") > -1) {
    qxzbdrqxType = type.split("-")[1]
    getMeteorologicalIndicatorsToDay()
  }
}
const datesTemplate = ref<any>([])
const dates = ref<any>([])
const selectedDate = ref<any>(dayjs().format("YYYY年M月"))
for (let i = 1; i <= dayjs().daysInMonth(); i++) {
  datesTemplate.value.push(i)
}
const changeCalendar = (type: string) => {
  if (type === "left") {
    selectedDate.value = dayjs(selectedDate.value, "YYYY年M月").subtract(1, "month").format("YYYY年M月")
  }
  if (type === "right") {
    selectedDate.value = dayjs(selectedDate.value, "YYYY年M月").add(1, "month").format("YYYY年M月")
  }
  datesTemplate.value = []
  for (let i = 1; i <= dayjs(selectedDate.value, "YYYY年M月").daysInMonth(); i++) {
    datesTemplate.value.push(i)
  }
  getAirQualityStatistics()
}
const lineData = ref<any>(null)
const showCallThePolice = ref(false)
// 报警监测弹窗
const openCallThePolice = () => {
  showCallThePolice.value = true
}

const showDataAnalysis = ref(false)
// 数据分析弹窗
const openDataAnalysis = () => {
  showDataAnalysis.value = true
}
const { setVariable } = useCssVariables()
onMounted(() => {
  setVariable("maptool-sidebar-right", "calc(21.875vw + 40px)") // 设置地图工具栏距右侧距离
  setVariable("maptool-sidebar-bottom", "calc(305px + 40px)") // 设置地图工具栏距底部距离
  proxy.$mitt.on("changePanelTitleType", changePanelTitleType)
  getAllEnvironmentalEquipment()
  getAlarmToDayCount() // 今日报警数
})
onBeforeUnmount(() => {
  proxy.$mitt.off("changePanelTitleType", changePanelTitleType)
})
</script>
<template>
  <div class="meteorological">
    <div class="section-bar">
      <MapLayerManage
        :modular="modular"
        :init-checked-keys="[35]"
        @addLayer="addLayerManageData"
        @removeLayer="removeLayerManageData"
      />
      <el-select
        v-model="station"
        placeholder="选择气象站"
        value-key="id"
        style="width: 160px"
        popper-class="custom-select-popper"
        @change="changeStation"
      >
        <template #label="{ label, value }">
          <span>{{ label }}</span>
        </template>
        <el-option
          v-for="item in stationList"
          :key="item.Id"
          :label="item.name"
          :value="item"
        />
      </el-select>
      <div
        class="count"
        @click="openCallThePolice"
      >
        <img
          :src="$fun.getImg('researchManagement/alarm-icon.png')"
          alt=""
        />
        今日报警{{ jrbjCount }}次
      </div>
    </div>
    <img
      class="analysis-btn"
      :src="$fun.getImg('researchManagement/analysis-btn.png')"
      alt=""
      @click="openDataAnalysis"
    />
    <div class="kriging-btns">
      <div
        v-show="currentKrigingType"
        class="kriging-legend"
      ></div>
      <div
        :class="{ current: currentKrigingType === '负氧离子' }"
        @click="kriging('负氧离子')"
      >
        负氧离子
        <img
          :src="$fun.getImg('researchManagement/克里金-负氧离子.png')"
          alt=""
        />
      </div>
      <div
        :class="{ current: currentKrigingType === '温度' }"
        @click="kriging('温度')"
      >
        温度
        <img
          :src="$fun.getImg('researchManagement/克里金-温度.png')"
          alt=""
        />
      </div>
      <div
        :class="{ current: currentKrigingType === '湿度' }"
        @click="kriging('湿度')"
      >
        湿度
        <img
          :src="$fun.getImg('researchManagement/克里金-湿度.png')"
          alt=""
        />
      </div>
      <div
        :class="{ current: currentKrigingType === 'pm2.5' }"
        @click="kriging('pm2.5')"
      >
        PM2.5
        <img
          :src="$fun.getImg('researchManagement/克里金-PM2.5.png')"
          alt=""
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
          <BasePanel title="空气质量统计">
            <template #contain>
              <div class="contain">
                <div class="box1">
                  <img
                    :src="$fun.getImg('researchManagement/bg1.png')"
                    alt=""
                  />
                  <div class="title">
                    本年度空气优良率
                    <el-tooltip
                      placement="bottom"
                      popper-class="custom-popper"
                    >
                      <template #content>
                        <div class="tip">
                          说明<br />
                          空气优良率:(优良天数/总天数)*100%
                        </div>
                      </template>
                      <i-ep-question-filled></i-ep-question-filled>
                    </el-tooltip>
                  </div>
                  <div class="info info1">
                    <div class="name">优良天数</div>
                    <div class="value">{{ kqzlInfo.ExcellentDays || 0 }}天</div>
                  </div>
                  <div class="info info2">
                    <div class="name">总天数</div>
                    <div class="value">{{ kqzlInfo.ExcellentAllDays || 0 }}天</div>
                  </div>
                  <div class="proportion">{{ kqzlInfo.AQIYll || 0 }}%</div>
                </div>
                <div class="box2">
                  <div class="hd">
                    <div>
                      气象达标<span class="day-count">{{ dbCount }}天</span>
                    </div>
                    <div>
                      <img
                        :src="$fun.getImg('researchManagement/arrow-left.png')"
                        alt=""
                        @click="changeCalendar('left')"
                      />
                      {{ selectedDate }}
                      <img
                        :src="$fun.getImg('researchManagement/arrow-right.png')"
                        alt=""
                        @click="changeCalendar('right')"
                      />
                    </div>
                  </div>
                  <div class="calendar">
                    <div
                      v-for="item in datesTemplate"
                      :key="item"
                      :class="{
                        db: dates.some((date: any) => date.value === item && date.isqualify),
                        wdb: dates.some((date: any) => date.value === item && !date.isqualify)
                      }"
                    >
                      <el-tooltip
                        placement="top"
                        :enterable="false"
                        effect="light"
                      >
                        <template #content>
                          <div class="tip">
                            AQI<br />
                            {{ dates.find((date: any) => date.value === item)?.AQI ?? "" }}
                          </div>
                        </template>
                        <span>{{ item }}</span>
                      </el-tooltip>
                    </div>
                  </div>
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
            title="气象指标当日曲线"
            initType="PM2.5"
            :types="['PM2.5', '湿度', '温度']"
          >
            <template #contain>
              <LineChartPanel
                path="path://M 0 -8 L 7 -4 L 7 4 L 0 8 L -7 4 L -7 -4 Z M 0 -2 A 2 2 0 1 1 0 2 A 2 2 0 1 1 0 -2 Z"
                :symbol-size="14"
                :node-shadow="true"
                :open-effect="true"
                :data="lineData"
                :colors="['#15B392']"
              />
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
          <BasePanel title="环境实况">
            <template #contain>
              <div class="contain">
                <div class="box1">
                  <div class="box1-left">
                    AQI:{{ hjskInfo?.AQI || 0 }}
                    <span
                      class="class-color"
                      :class="{
                        'class-green': hjskInfo?.AQI >= 0 && hjskInfo?.AQI <= 50,
                        'class-yellow': hjskInfo?.AQI > 50 && hjskInfo?.AQI <= 100,
                        'class-orange': hjskInfo?.AQI > 100 && hjskInfo?.AQI <= 150,
                        'class-red': hjskInfo?.AQI > 150 && hjskInfo?.AQI <= 200,
                        'class-purple': hjskInfo?.AQI > 200 && hjskInfo?.AQI <= 300,
                        'class-orangered': hjskInfo?.AQI > 300
                      }"
                      >{{ getAirQualityLevel(hjskInfo?.AQI) }}</span
                    >
                  </div>
                  <div class="time">
                    更新时间:{{ hjskInfo?.meteorologicalData?.createTime || "2024/08/30 14:00:00" }}
                  </div>
                </div>
                <div class="box2">
                  <div class="box2-con">
                    空气质量指数
                    <!-- <span class="grade">一级</span> -->
                  </div>
                  <img
                    :src="$fun.getImg('researchManagement/grade-img.svg')"
                    alt=""
                  />
                </div>
                <!-- <el-scrollbar class="box3-scrollbar"> -->
                <div class="box3">
                  <div class="item">
                    <div class="item-hd">
                      <div class="name">
                        <img
                          :src="$fun.getImg('researchManagement/icon1.png')"
                          alt=""
                        />
                        温度
                      </div>
                      <div
                        class="degree class-color"
                        :class="{
                          'class-deepblue':
                            hjskInfo?.meteorologicalData?.hw >= -40 && hjskInfo?.meteorologicalData?.hw <= 10,
                          'class-blue': hjskInfo?.meteorologicalData?.hw > 10 && hjskInfo?.meteorologicalData?.hw <= 20,
                          'class-green':
                            hjskInfo?.meteorologicalData?.hw > 20 && hjskInfo?.meteorologicalData?.hw <= 26,
                          'class-orange':
                            hjskInfo?.meteorologicalData?.hw > 26 && hjskInfo?.meteorologicalData?.hw <= 30,
                          'class-red': hjskInfo?.meteorologicalData?.hw > 30
                        }"
                      >
                        {{ getTemperatureLevel(hjskInfo?.meteorologicalData?.hw) }}
                      </div>
                    </div>
                    <div class="item-bd">{{ hjskInfo?.meteorologicalData?.hw || 0 }}℃</div>
                    <!-- <div class="item-footer">℃</div> -->
                  </div>
                  <div class="item">
                    <div class="item-hd">
                      <div class="name">
                        <img
                          :src="$fun.getImg('researchManagement/icon2.png')"
                          alt=""
                        />
                        湿度
                      </div>
                      <div
                        class="degree class-color"
                        :class="{
                          'class-yellow':
                            hjskInfo?.meteorologicalData?.hs >= 20 && hjskInfo?.meteorologicalData?.hs <= 30,
                          'class-white':
                            hjskInfo?.meteorologicalData?.hs > 30 && hjskInfo?.meteorologicalData?.hs <= 50,
                          'class-blue': hjskInfo?.meteorologicalData?.hs > 50 && hjskInfo?.meteorologicalData?.hs <= 70,
                          'class-deepblue': hjskInfo?.meteorologicalData?.hs > 70
                        }"
                      >
                        {{ getHumidityLevel(hjskInfo?.meteorologicalData?.hs) }}
                      </div>
                    </div>
                    <div class="item-bd">{{ hjskInfo?.meteorologicalData?.hs || 0 }}%</div>
                    <!-- <div class="item-footer">%</div> -->
                  </div>
                  <div class="item">
                    <div class="item-hd">
                      <div class="name">
                        <img
                          :src="$fun.getImg('researchManagement/icon3.png')"
                          alt=""
                        />
                        PM2.5
                      </div>
                      <div
                        class="degree class-color"
                        :class="{
                          'class-green':
                            hjskInfo?.meteorologicalData?.pm2_5 >= 0 && hjskInfo?.meteorologicalData?.pm2_5 <= 35,
                          'class-yellow':
                            hjskInfo?.meteorologicalData?.pm2_5 > 35 && hjskInfo?.meteorologicalData?.pm2_5 <= 75,
                          'class-orange':
                            hjskInfo?.meteorologicalData?.pm2_5 > 75 && hjskInfo?.meteorologicalData?.pm2_5 <= 115,
                          'class-red':
                            hjskInfo?.meteorologicalData?.pm2_5 > 115 && hjskInfo?.meteorologicalData?.pm2_5 <= 150,
                          'class-purple':
                            hjskInfo?.meteorologicalData?.pm2_5 > 150 && hjskInfo?.meteorologicalData?.pm2_5 <= 250,
                          'class-orangered': hjskInfo?.meteorologicalData?.pm2_5 > 250
                        }"
                      >
                        {{ getPM25Level(hjskInfo?.meteorologicalData?.pm2_5) }}
                      </div>
                    </div>
                    <div class="item-bd">{{ hjskInfo?.meteorologicalData?.pm2_5 || 0 }}ug/m³</div>
                    <!-- <div class="item-footer">ug/m³</div> -->
                  </div>
                  <div class="item">
                    <div class="item-hd">
                      <div class="name text-small">
                        <img
                          :src="$fun.getImg('researchManagement/icon4.png')"
                          alt=""
                        />
                        负氧离子
                      </div>
                      <div
                        class="degree class-color"
                        :class="{
                          'class-cgreen': hjskInfo?.meteorologicalData?.fylz > 2000,
                          'class-green':
                            hjskInfo?.meteorologicalData?.fylz > 1500 && hjskInfo?.meteorologicalData?.fylz <= 2000,
                          'class-hgreen':
                            hjskInfo?.meteorologicalData?.fylz > 1000 && hjskInfo?.meteorologicalData?.fylz <= 1500,
                          'class-yellow':
                            hjskInfo?.meteorologicalData?.fylz > 500 && hjskInfo?.meteorologicalData?.fylz <= 1000,
                          'class-orange': hjskInfo?.meteorologicalData?.fylz <= 500
                        }"
                      >
                        {{ getFYLZLevel(hjskInfo?.meteorologicalData?.fylz) }}
                      </div>
                    </div>
                    <div class="item-bd">{{ hjskInfo?.meteorologicalData?.fylz || 0 }}个/cm³</div>
                    <!-- <div class="item-footer">个/cm³</div> -->
                  </div>
                  <div class="item">
                    <div class="item-hd">
                      <div class="name">
                        <img
                          :src="$fun.getImg('researchManagement/icon5.png')"
                          alt=""
                        />
                        光照强度
                      </div>
                      <div
                        class="degree class-color"
                        :class="{
                          'class-deepblue':
                            hjskInfo?.meteorologicalData?.gzd >= 0 && hjskInfo?.meteorologicalData?.gzd < 10,
                          'class-ablue':
                            hjskInfo?.meteorologicalData?.gzd >= 10 && hjskInfo?.meteorologicalData?.gzd < 30,
                          'class-zgrey':
                            hjskInfo?.meteorologicalData?.gzd >= 30 && hjskInfo?.meteorologicalData?.gzd < 100,
                          'class-qgrey':
                            hjskInfo?.meteorologicalData?.gzd >= 100 && hjskInfo?.meteorologicalData?.gzd < 300,
                          'class-lgrey':
                            hjskInfo?.meteorologicalData?.gzd >= 300 && hjskInfo?.meteorologicalData?.gzd < 500,
                          'class-mwhite':
                            hjskInfo?.meteorologicalData?.gzd >= 500 && hjskInfo?.meteorologicalData?.gzd < 1000,
                          'class-jwhite':
                            hjskInfo?.meteorologicalData?.gzd >= 1000 && hjskInfo?.meteorologicalData?.gzd < 5000,
                          'class-white': hjskInfo?.meteorologicalData?.gzd >= 5000
                        }"
                      >
                        {{ getGZDLevel(hjskInfo?.meteorologicalData?.gzd) }}
                      </div>
                    </div>
                    <div class="item-bd">{{ hjskInfo?.meteorologicalData?.gzd || 0 }}KLux</div>
                    <!-- <div class="item-footer">KLux</div> -->
                  </div>
                  <div class="item">
                    <div class="item-hd">
                      <div class="name">
                        <img
                          :src="$fun.getImg('researchManagement/icon6.png')"
                          alt=""
                        />
                        风向
                      </div>
                      <div
                        class="degree class-color"
                        :class="{
                          'class-blue':
                            (hjskInfo?.meteorologicalData?.fx >= 0 && hjskInfo?.meteorologicalData?.fx < 22.5) ||
                            hjskInfo?.meteorologicalData?.fx >= 337.5,
                          'class-qs':
                            hjskInfo?.meteorologicalData?.fx >= 22.5 && hjskInfo?.meteorologicalData?.fx < 67.5,
                          'class-green':
                            hjskInfo?.meteorologicalData?.fx >= 67.5 && hjskInfo?.meteorologicalData?.fx < 112.5,
                          'class-hgreen':
                            hjskInfo?.meteorologicalData?.fx >= 112.5 && hjskInfo?.meteorologicalData?.fx < 157.5,
                          'class-yellow':
                            hjskInfo?.meteorologicalData?.fx >= 157.5 && hjskInfo?.meteorologicalData?.fx < 202.5,
                          'class-orange':
                            hjskInfo?.meteorologicalData?.fx >= 202.5 && hjskInfo?.meteorologicalData?.fx < 247.5,
                          'class-red':
                            hjskInfo?.meteorologicalData?.fx >= 247.5 && hjskInfo?.meteorologicalData?.fx < 292.5,
                          'class-purple':
                            hjskInfo?.meteorologicalData?.fx >= 292.5 && hjskInfo?.meteorologicalData?.fx < 337.5
                        }"
                      >
                        {{ getWindDirection(hjskInfo?.meteorologicalData?.fx) }}
                      </div>
                    </div>
                    <div class="item-bd">{{ hjskInfo?.meteorologicalData?.fx || 0 }}°</div>
                    <!-- <div class="item-footer">°</div> -->
                  </div>
                  <div class="item">
                    <div class="item-hd">
                      <div class="name">
                        <img
                          :src="$fun.getImg('researchManagement/icon7.png')"
                          alt=""
                        />
                        风速
                      </div>
                      <div
                        class="degree class-color"
                        :class="{
                          'class-dblue':
                            hjskInfo?.meteorologicalData?.ssfs >= 0 && hjskInfo?.meteorologicalData?.ssfs <= 0.3,
                          'class-qblue':
                            hjskInfo?.meteorologicalData?.ssfs > 0.3 && hjskInfo?.meteorologicalData?.ssfs <= 1.5,
                          'class-tblue':
                            hjskInfo?.meteorologicalData?.ssfs > 1.5 && hjskInfo?.meteorologicalData?.ssfs <= 3.3,
                          'class-zblue':
                            hjskInfo?.meteorologicalData?.ssfs > 3.3 && hjskInfo?.meteorologicalData?.ssfs <= 5.4,
                          'class-deepblue':
                            hjskInfo?.meteorologicalData?.ssfs > 5.4 && hjskInfo?.meteorologicalData?.ssfs <= 7.9,
                          'class-lblue':
                            hjskInfo?.meteorologicalData?.ssfs > 7.9 && hjskInfo?.meteorologicalData?.ssfs <= 10.7,
                          'class-green':
                            hjskInfo?.meteorologicalData?.ssfs > 10.7 && hjskInfo?.meteorologicalData?.ssfs <= 13.8,
                          'class-hgreen':
                            hjskInfo?.meteorologicalData?.ssfs > 13.8 && hjskInfo?.meteorologicalData?.ssfs <= 17.1
                        }"
                      >
                        {{ getWindSpeedLevel(hjskInfo?.meteorologicalData?.ssfs).name }}
                      </div>
                    </div>
                    <div class="item-bd">{{ hjskInfo?.meteorologicalData?.ssfs || 0 }}m/s</div>
                    <!-- <div class="item-footer">m/s</div> -->
                  </div>
                  <div class="item">
                    <div class="item-hd">
                      <div class="name">
                        <img
                          :src="$fun.getImg('researchManagement/icon8.png')"
                          alt=""
                        />
                        降雨量
                      </div>
                      <div
                        class="degree class-color"
                        :class="{
                          'class-qblue':
                            hjskInfo?.meteorologicalData?.ylrlj >= 1 && hjskInfo?.meteorologicalData?.ylrlj <= 10,
                          'class-blue':
                            hjskInfo?.meteorologicalData?.ylrlj > 10 && hjskInfo?.meteorologicalData?.ylrlj <= 25,
                          'class-deepblue':
                            hjskInfo?.meteorologicalData?.ylrlj > 25 && hjskInfo?.meteorologicalData?.ylrlj <= 50,
                          'class-green':
                            hjskInfo?.meteorologicalData?.ylrlj > 50 && hjskInfo?.meteorologicalData?.ylrlj <= 100,
                          'class-yellow':
                            hjskInfo?.meteorologicalData?.ylrlj > 100 && hjskInfo?.meteorologicalData?.ylrlj <= 200,
                          'class-orangered': hjskInfo?.meteorologicalData?.ylrlj > 200,
                          'class-white': hjskInfo?.meteorologicalData?.ylrlj < 1
                        }"
                      >
                        {{ getRainfallLevel(hjskInfo?.meteorologicalData?.ylrlj) }}
                      </div>
                    </div>
                    <div class="item-bd">{{ hjskInfo?.meteorologicalData?.ylrlj || 0 }}mm</div>
                    <!-- <div class="item-footer">mm</div> -->
                  </div>
                </div>
                <!-- </el-scrollbar> -->
              </div>
            </template>
          </BasePanel>
        </div>
        <div
          v-show="showCSB"
          class="section4"
          key="section4"
        >
          <BasePanel title="风象实况">
            <template #contain>
              <div class="contain">
                <div class="box1">
                  <div class="fc corner">
                    <img
                      :src="$fun.getImg('researchManagement/风叶.svg')"
                      alt=""
                    />
                    <div class="corner-top-right"></div>
                    <div class="corner-bottom-left"></div>
                  </div>
                  <div class="fc-1">
                    <div class="corner">
                      <div class="corner-top-right"></div>
                      <div class="corner-bottom-left"></div>
                      <div class="title">
                        <img
                          :src="$fun.getImg('researchManagement/icon12.png')"
                          alt=""
                        />
                        今日风速
                      </div>
                      <div class="value">{{ getWindSpeedLevel(qxskInfo.nowWindSpeed).name }}</div>
                    </div>
                    <div class="corner">
                      <div class="corner-top-right"></div>
                      <div class="corner-bottom-left"></div>
                      <div class="title">
                        <img
                          :src="$fun.getImg('researchManagement/icon13.png')"
                          alt=""
                        />
                        今日风向
                      </div>
                      <div class="value">{{ getWindDirection(qxskInfo.windDirection) }}</div>
                    </div>
                  </div>
                </div>
                <div class="box2">
                  <div>
                    风指数：<span>{{ getWindSpeedLevel(hjskInfo?.meteorologicalData?.ssfs).name }}</span
                    ><span>{{ getWindSpeedLevel(hjskInfo?.meteorologicalData?.ssfs).value }}级</span>
                  </div>
                  <img
                    :src="$fun.getImg('researchManagement/fj-bg.svg')"
                    alt=""
                  />
                </div>
                <div class="box3">
                  <div class="item">
                    <img
                      :src="$fun.getImg('researchManagement/icon9.png')"
                      alt=""
                    />
                    <div>
                      <div>
                        <span>{{ qxskInfo.nowWindSpeed || "0" }}</span> 米/秒
                      </div>
                      <div>当前风速</div>
                    </div>
                  </div>
                  <div class="item">
                    <img
                      :src="$fun.getImg('researchManagement/icon10.png')"
                      alt=""
                    />
                    <div>
                      <div>
                        <span>{{ qxskInfo.maxWindSpeed || "0" }}</span> 米/秒
                      </div>
                      <div>最大风速</div>
                    </div>
                  </div>
                  <div class="item">
                    <img
                      :src="$fun.getImg('researchManagement/icon11.png')"
                      alt=""
                    />
                    <div>
                      <div>
                        <span>{{ qxskInfo.minWindSpeed || "0" }}</span> 米/秒
                      </div>
                      <div>最小风速</div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </BasePanel>
        </div></transition-group
      >
    </div>
    <Modal
      v-model:show="showCallThePolice"
      disable-zoom
      :close-on-click-modal="false"
    >
      <template v-slot:container>
        <CallThePoliceData
          :id="station.equipmentId"
          type="气象"
        />
      </template>
    </Modal>
    <Modal
      v-model:show="showDataAnalysis"
      disable-zoom
      :close-on-click-modal="false"
    >
      <template v-slot:container>
        <DataAnalysis
          :id="station.equipmentId"
          type="气象"
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
      />
      <MapTool
        v-if="map"
        :map="map"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.meteorological {
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
    .count {
      display: flex;
      align-items: center;
      gap: 0.5208vw;
      color: #f94340;
      border: 1px solid #f94340;
      box-shadow: 0 0 10px 3px rgba(223, 68, 66, 0.7) inset;
      border-bottom-left-radius: 4px;
      border-bottom-right-radius: 4px;
      font-size: 0.7292vw;
      padding: 0 0.5208vw;
      cursor: pointer;
      img {
        width: 0.8333vw;
      }
    }
  }
  .analysis-btn {
    position: absolute;
    top: 75px;
    right: var(--maptool-sidebar-right);
    width: 4.0104vw;
    z-index: 1;
    cursor: pointer;
    transition: all 0.3s ease-in-out;
  }
  .kriging-btns {
    position: absolute;
    right: calc(var(--maptool-sidebar-right) + 40px);
    bottom: calc(var(--maptool-sidebar-bottom));
    display: flex;
    gap: 15px;
    z-index: 1;
    transition: all 0.3s ease-in-out;
    > div {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 0.2604vw;
      font-size: 0.7292vw;
      cursor: pointer;
      img {
        width: 2.3958vw;
        height: 3.8021vw;
      }
    }
    .current {
      color: orangered;
    }
    .kriging-legend {
      position: absolute;
      top: -100%;
      right: 0.5208vw;
      transform: translateY(-10px);
      width: 0.7813vw;
      height: 5.2083vw;
      background: linear-gradient(to bottom, #fb3300, #fe6c00, #ff9000, #ffb300, #fdcc00);
      font-size: 0.7292vw;
      font-weight: bold;
      z-index: 1;
      &::before {
        content: "高";
        position: absolute;
        top: 0;
        left: -1.5em;
        color: #fb3300;
        font-size: 0.625vw;
      }
      &::after {
        content: "低";
        position: absolute;
        bottom: 0;
        left: -1.5em;
        color: #fdcc00;
        font-size: 0.625vw;
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
    width: 42.8646vw;
    .contain {
      display: flex;
      height: 100%;
      .box1 {
        position: relative;
        width: 17.7083vw;
        img {
          position: absolute;
          top: 50%;
          left: 50%;
          animation: rotate 10s linear infinite;
        }
        .title {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0fd9e8;
          gap: 5px;
        }
        .info {
          position: absolute;
          width: 6.6667vw;
          height: 64px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 10px;
          background: linear-gradient(to right, rgba(50, 81, 117, 0.7), rgba(34, 45, 71, 0.7));
          border-radius: 10px;
          font-size: 14px;
          padding: 10px;
          .name {
            text-align: left;
          }
          .value {
            text-align: right;
            color: #f7a91b;
            font-size: 18px;
          }
        }
        .info1 {
          top: 20%;
          left: 20px;
        }
        .info2 {
          bottom: 20%;
          right: 20px;
        }
        .proportion {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 24px;
          color: #00ffff;
        }
      }
      .box2 {
        flex: 1;
        display: flex;
        flex-direction: column;
        .hd {
          display: flex;
          justify-content: space-between;
          align-items: center;
          line-height: 2em;
          user-select: none;
          .day-count {
            color: #27ed46;
            font-size: 16px;
            font-weight: 700;
            margin-left: 5px;
            text-decoration: underline;
          }
          img {
            cursor: pointer;
          }
        }
        .calendar {
          flex: 1;
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 5px;
          font-size: 0.7292vw;
          color: #cfdef9;
          > div {
            display: flex;
            align-items: center;
            justify-content: center;
            background: #103856;
            span {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 100%;
              height: 100%;
            }
          }
          .db {
            position: relative;
            color: #fff;
            font-size: 16px;
            font-weight: bold;
            background: linear-gradient(to bottom, #0c60a0 0%, #13314e 50%, #0c60a0 77%, #1c73b1 100%);
            &:after {
              content: "";
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background-color: #24ac68;
              position: absolute;
              top: 3px;
              right: 3px;
            }
          }
          .wdb {
            position: relative;
            color: #fff;
            font-size: 16px;
            font-weight: bold;
            background: linear-gradient(to bottom, #13aae069 0, #35136c47 100%);
            &:after {
              content: "";
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background-color: #13aae0;
              position: absolute;
              top: 3px;
              right: 3px;
            }
          }
        }
      }
    }
  }
  .section2 {
    flex: 1;
  }
  .section3 {
    height: 45vh;
    color: #fff;
    .contain {
      display: flex;
      flex-direction: column;
      height: 100%;
      .box1 {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 18px;
        font-weight: bold;
        .box1-left {
          display: flex;
          align-items: center;
          gap: 0.2604vw;
          padding: 5px 0;
        }
        span {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 3px 0.5208vw;
          font-size: 0.625vw;
        }
        .time {
          font-size: 0.625vw;
          color: #a7b0bc;
        }
      }
      .box2 {
        margin: 0.2604vw 0 0.2604vw 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.2604vw;
        .box2-con {
          width: max-content;
          font-size: 18px;
          background-color: #132941;
          padding: 0 20px;
          border: 1px solid #224c90;
          padding: 5px;
          .grade {
            color: #179966;
            line-height: 2em;
          }
        }
      }
      .box3-scrollbar {
        flex: 1;
      }
      .box3 {
        height: 100%;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        background-color: rgba(38, 252, 251, 0.3);
        grid-gap: 1.5px;
        .item {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 0.1563vw;
          background-color: #1b344c;
          .item-hd {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 0.5208vw;
            width: 100%;
            .name {
              display: flex;
              gap: 0.2604vw;
              align-items: center;
              font-size: 0.8333vw;
              img {
                width: 0.7292vw;
              }
            }
            .text-small {
              font-size: 0.7292vw;
            }
            .degree {
              min-width: 1.6667vw;
              padding: 0 0.3125vw;
              text-align: center;
              font-size: 0.8333vw;
              background-color: green;
              mix-blend-mode: difference;
            }
          }
          .item-bd {
            font-size: 0.9375vw;
            align-self: center;
          }
          .item-footer {
            font-size: 0.7292vw;
            align-self: flex-end;
          }
        }
      }
    }
  }
  .class-color {
    // mix-blend-mode: difference;
    &.class-green {
      background-color: green !important;
    }
    &.class-yellow {
      background-color: yellow !important;
    }
    &.class-orange {
      background-color: orange !important;
    }
    &.class-white {
      background-color: white !important;
      color: #000 !important;
    }
    &.class-red {
      background-color: red !important;
    }
    &.class-purple {
      background-color: purple !important;
    }
    &.class-orangered {
      background-color: orangered !important;
    }
    &.class-deepblue {
      background-color: blue !important;
    }
    &.class-blue {
      background-color: rgb(33, 33, 193) !important;
    }
    &.class-dblue {
      // 淡蓝色
      background-color: #00bfff !important;
    }
    &.class-qblue {
      // 浅蓝色
      background-color: #add8e6 !important;
    }
    &.class-tblue {
      // 天蓝色
      background-color: #87ceeb !important;
    }
    &.class-zblue {
      // 中蓝色
      background-color: #4682b4 !important;
    }
    &.class-lblue {
      // 蓝绿色
      background-color: #20b2aa !important;
    }
    &.class-ablue {
      // 淡蓝色
      background-color: #00008b !important;
    }
    &.class-cgreen {
      // 翠绿色
      background-color: #00ff00 !important;
      color: #132941;
    }
    &.class-hgreen {
      // 黄绿色
      background-color: #adff2f !important;
      color: #333;
    }
    &.class-qs {
      // 青色
      background-color: #00ffff !important;
    }

    &.class-zgrey {
      // 中灰色
      background-color: #808080 !important;
      color: #333;
    }
    &.class-qgrey {
      // 浅灰色
      background-color: #d3d3d3 !important;
      color: #333;
    }
    &.class-lgrey {
      // 亮灰色
      background-color: #f0f8ff !important;
      color: #333;
    }
    &.class-mwhite {
      // 米白色
      background-color: #f5f5dc !important;
      color: #333;
    }
    &.class-jwhite {
      // 接近纯白色
      background-color: #f4f4f4 !important;
      color: #333;
    }
  }
  .section4 {
    flex: 1;
    .contain {
      display: flex;
      flex-direction: column;
      height: 100%;
      .box1 {
        display: flex;
        gap: 10px;
        .fc {
          position: relative;
          width: 9.6354vw;
          height: 14vh;
          display: flex;
          align-items: center;
          justify-content: center;
          img {
            width: 100%;
          }
        }
        .fc-1 {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          > div {
            position: relative;
            height: 6.5vh;
            background: url("@/assets/images/researchManagement/grid-bg.png") no-repeat center center / 100% 100%;
            padding: 4px 6px;
            .title {
              line-height: 2em;
              color: #35dadf;
              font-size: 0.8333vw;
            }
            .value {
              text-align: center;
              font-size: 1.0417vw;
            }
          }
        }
      }
      .box2 {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: 10px;
        color: #4ae9f8;
        font-size: 0.7292vw;
        gap: 10px;
        line-height: 2em;
        span {
          font-size: 1.1458vw;
          font-weight: bold;
          &:nth-child(2) {
            color: yellowgreen;
          }
        }
        img {
          width: 15.8333vw;
        }
      }
      .box3 {
        flex: 1;
        display: flex;
        justify-content: space-between;
        font-size: 0.8333vw;
        .item {
          display: flex;
          align-items: center;
          gap: 5px;
          img {
            width: 1.5625vw;
          }
          > div {
            line-height: 2em;
            span {
              font-size: 0.8333vw;
              color: #e69f1d;
            }
          }
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
  // 定义旋转360度动画
  @keyframes rotate {
    0% {
      transform: translate(-50%, -50%) rotate(0deg);
    }
    100% {
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }
}
</style>
<style lang="scss">
.meteorological {
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
  .status2 {
    color: #fff;
    padding: 0px 10px;
    background-color: #cf3426;
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
    width: 185px;
    height: 56px;
    font-size: 12px;
    padding: 4px 0 4px 14px;
    line-height: 16px;
    background: url("@/assets/images/researchManagement/bg2.png") no-repeat center center / 100% 100%;
  }
}
</style>
