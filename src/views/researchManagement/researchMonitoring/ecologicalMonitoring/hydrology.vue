<script lang="ts" setup>
import {
  GetAllEnvironmentalEquipment,
  GetCurrentWaterQuality,
  GetWaterQualityIndicators,
  GetWaterQualityIndicatorsToDay,
  GetWaterQualityStatistics
} from "@/api"
import { getPHLevel, getWQILevel } from "@/utils"
import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"
import DataAnalysis from "./DataAnalysis.vue"
const { showCSB } = storeToRefs(useConfigStore())
const popup = ref<any>(null)
const modular = ref("水文")
const {
  closePopup,
  popupInfo,
  popupFormatType,
  map,
  vectorFeatures,
  addLayerManageData,
  locationMap,
  removeLayerManageData
} = useOlMap(popup, {
  zoom: 12.20477,
  center: [116.16027952755078, 30.97908202369116],
  modular: modular.value,
  openOverlay: false,
  vectorLayerDeclutter: false,
  overlayOffset: [0, -70],
  overlayPositioning: "bottom-center"
})

dayjs.extend(customParseFormat)

const proxy = getCurrentInstance()!.proxy as any
const station = ref()
const stationList = ref<any>([])
// 获得水质站列表
const getAllEnvironmentalEquipment = async () => {
  const { response } = await GetAllEnvironmentalEquipment({
    equipmentType: "水文"
  })
  stationList.value = response
  // addQxSwPoints(response)
  station.value = response[0]
  getWaterQualityStatistics() // 水质质量统计
  getWaterQualityIndicatorsToDay() // 水质指标当日曲线
  getCurrentWaterQuality() // 水质实况
  getWaterQualityIndicators() // 水质指标
}
// 切换水文站
const changeStation = () => {
  getWaterQualityStatistics() // 水质质量统计
  getWaterQualityIndicatorsToDay() // 水质指标当日曲线
  getCurrentWaterQuality() // 水质实况
  getWaterQualityIndicators() // 水质指标
}
// 水质质量统计
const dbCount = ref(0) // 达标天数
const getWaterQualityStatistics = async () => {
  const { response } = await GetWaterQualityStatistics({
    equipmentId: station.value.equipmentId,
    queryTime: dayjs(selectedDate.value, "YYYY年M月").format("YYYY-MM")
  })
  // console.log(response)
  dates.value = []
  dbCount.value = 0
  response.forEach((item: any) => {
    if (item.statisticalTime) {
      dates.value.push({
        value: parseInt(dayjs(item.statisticalTime).format("D")),
        isqualify: item.isqualify,
        WQI: item.value
      })
      if (item.isqualify) {
        dbCount.value++
      }
    }
  })
}
const lineData = ref<any>(null)
// 水质指标当日曲线
let szzbdrqxType = "水温" // 指标类型
const getWaterQualityIndicatorsToDay = async () => {
  const { response } = await GetWaterQualityIndicatorsToDay({
    equipmentId: station.value.equipmentId,
    queryType: szzbdrqxType || "水温"
  })
  if (response?.length === 0) {
    lineData.value = null
    return
  }
  lineData.value = {
    dw:
      szzbdrqxType === "水温"
        ? "℃"
        : szzbdrqxType === "电导率"
          ? "ms/m"
          : szzbdrqxType === "浊度"
            ? "NTU"
            : szzbdrqxType === "溶解氧"
              ? "mg/L"
              : "mg/L",
    xAxis: response.map((item: any) => {
      return item.name
    }),
    data: [
      {
        name: szzbdrqxType,
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
// 水质实况
const szskInfo = ref<any>({})
const getCurrentWaterQuality = async () => {
  const { response } = await GetCurrentWaterQuality({
    equipmentId: station.value.equipmentId
  })
  if (!response) {
    szskInfo.value = {}
    return
  }
  szskInfo.value = response
  let section1 = szskInfo.value.WQI / 350
  if (section1 > 1) {
    section1 = 100
  } else {
    section1 = section1 * 100
  }
  const positionImg1 = document.querySelector(".position-img1") as HTMLElement
  if (positionImg1) {
    positionImg1.style.left = section1 + "%"
  }
}
// 水质指标
const szzbInfo = ref<any>({})
const getWaterQualityIndicators = async () => {
  const { response } = await GetWaterQualityIndicators({
    equipmentId: station.value.equipmentId
  })
  if (!response) {
    szzbInfo.value = {}
    return
  }
  szzbInfo.value = response
}
const changePanelTitleType = (type: string) => {
  if (type.indexOf("水质指标当日曲线") > -1) {
    szzbdrqxType = type.split("-")[1]
  }
  getWaterQualityIndicatorsToDay()
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
  getWaterQualityStatistics()
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
})
onBeforeUnmount(() => {
  proxy.$mitt.off("changePanelTitleType", changePanelTitleType)
})
</script>
<template>
  <div class="hydrology">
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
      <el-select
        v-model="station"
        placeholder="选择水文站"
        value-key="Id"
        style="width: 160px"
        popper-class="custom-select-popper"
        @change="changeStation"
      >
        <template #label="{ label, value }">
          <span>{{ label }}</span>
          <!-- <span
            v-if="value.statu === '0'"
            class="status1"
            >正常</span
          >
          <span
            v-if="value.statu === '1'"
            class="status2"
            >异常</span
          > -->
        </template>
        <el-option
          v-for="item in stationList"
          :key="item.Id"
          :label="item.name"
          :value="item"
        />
      </el-select>
    </div>
    <img
      class="analysis-btn"
      :src="$fun.getImg('researchManagement/analysis-btn.png')"
      alt=""
      @click="openDataAnalysis"
    />
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
          <BasePanel title="水质质量统计">
            <template #contain>
              <div class="contain">
                <div class="box2">
                  <div class="hd">
                    <div>
                      水质达标<span class="day-count">{{ dbCount }}天</span>
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
                            WQI<br />
                            {{ dates.find((date: any) => date.value === item)?.WQI ?? "" }}
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
            title="水质指标当日曲线"
            initType="水温"
            :types="['水温', '电导率', '浊度', '溶解氧', '氨氮']"
          >
            <template #contain>
              <LineChartPanel
                :open-effect="true"
                :node-shadow="true"
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
          <BasePanel title="水质实况">
            <template #contain>
              <div class="contain">
                <div class="box1">
                  <div class="hd">
                    <div class="hd-left">
                      WQI
                      <span class="status2">{{ getWQILevel(szskInfo.WQI) }}</span>
                    </div>
                    <div class="time">更新时间:{{ szskInfo.time || "暂无" }}</div>
                  </div>
                  <div class="box1-item">
                    <div class="item-a">
                      <img
                        :src="$fun.getImg('researchManagement/circle.svg')"
                        alt=""
                      />
                      <span>{{ szskInfo.WQI || "无" }}</span>
                    </div>
                    <div class="item-b">
                      <div class="item-b-con">
                        综合水质标识类别
                        <!-- <span class="item-b-grade">一级</span> -->
                      </div>
                      <div class="img-box">
                        <img
                          :src="$fun.getImg('researchManagement/色条.svg')"
                          alt=""
                        />
                        <img
                          class="position-img position-img1"
                          :src="$fun.getImg('researchManagement/current-色条.svg')"
                          alt=""
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div class="box2">
                  <div class="hd">
                    <div class="hd-left">
                      PH
                      <span class="status2">{{ getPHLevel(szskInfo.PH) }}</span>
                    </div>
                  </div>
                  <div class="box2-item">
                    <div class="item-a">
                      <div class="a-left">
                        <img
                          :src="$fun.getImg('researchManagement/rec.svg')"
                          alt=""
                        />
                        <span>{{ szskInfo.PH || "无" }}</span>
                      </div>
                      <div class="item-b-con">
                        水质酸碱度
                        <span class="item-b-grade">{{ getPHLevel(szskInfo.PH) }}</span>
                      </div>
                    </div>
                    <div class="item-b">
                      <div class="img-box">
                        <img
                          :src="$fun.getImg('researchManagement/色条1.svg')"
                          alt=""
                        />
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
          <BasePanel title="水质指标">
            <template #contain>
              <div class="contain">
                <div class="box1">
                  <div class="box1-left">
                    <div class="box1-left-item">
                      <div>最高水温</div>
                      <div>{{ szzbInfo.maxWaterTemperature }}℃</div>
                    </div>
                    <div class="box1-left-item">
                      <div>最低水温</div>
                      <div>{{ szzbInfo.minWaterTemperature }}℃</div>
                    </div>
                    <div class="box1-left-item">
                      <div>当前水温</div>
                      <div>{{ szzbInfo.nowWaterTemperature }}℃</div>
                    </div>
                  </div>
                  <div class="box1-right">
                    <img
                      :src="$fun.getImg('researchManagement/water-circle.svg')"
                      alt=""
                    />
                  </div>
                </div>
                <div class="box2">
                  <div class="box2-item">
                    <img
                      :src="$fun.getImg('researchManagement/电导率.svg')"
                      alt=""
                    />
                    <ul>
                      <li>电导率</li>
                      <li>
                        <span>{{ szzbInfo.conductivity || "暂无" }}</span> ms/m
                      </li>
                    </ul>
                  </div>
                  <div class="box2-item">
                    <img
                      :src="$fun.getImg('researchManagement/氨氮.svg')"
                      alt=""
                    />
                    <ul>
                      <li>氨氮</li>
                      <li>
                        <span>{{ szzbInfo.ammonia || "暂无" }}</span> mg/L
                      </li>
                    </ul>
                  </div>
                  <div class="box2-item">
                    <img
                      :src="$fun.getImg('researchManagement/溶解氧.svg')"
                      alt=""
                    />
                    <ul>
                      <li>溶解氧</li>
                      <li>
                        <span>{{ szzbInfo.dissolvedOxygen || "暂无" }}</span> mg/L
                      </li>
                    </ul>
                  </div>
                  <div class="box2-item">
                    <img
                      :src="$fun.getImg('researchManagement/浊度.svg')"
                      alt=""
                    />
                    <ul>
                      <li>浊度</li>
                      <li>
                        <span>{{ szzbInfo.turbidity || "暂无" }}</span> NTU
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </template>
          </BasePanel>
        </div>
      </transition-group>
    </div>
    <Modal
      v-model:show="showDataAnalysis"
      disable-zoom
      :close-on-click-modal="false"
    >
      <template v-slot:container>
        <DataAnalysis
          :id="station.equipmentId"
          type="水文"
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
.hydrology {
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
      gap: 10px;
      color: #f94340;
      border: 1px solid #f94340;
      box-shadow: 0 0 10px 3px rgba(223, 68, 66, 0.7) inset;
      border-bottom-left-radius: 4px;
      border-bottom-right-radius: 4px;
      padding: 0 10px;
      cursor: pointer;
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
    flex: 1;
    .contain {
      display: flex;
      height: 100%;
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
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
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
    width: 42.8646vw;
  }
  .section3 {
    height: 40vh;
    color: #fff;
    .contain {
      display: flex;
      flex-direction: column;
      height: 100%;
      .hd {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.9375vw;
        font-weight: bold;
        .hd-left {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 5px 0;
        }
        span {
          display: inline-block;
          padding: 0.1563vw 0.5208vw;
          font-size: 0.625vw;

          &.status1 {
            background-color: #f9e03d;
          }
        }
        .time {
          font-size: 0.625vw;
          color: #a7b0bc;
        }
      }
      .box1 {
        display: flex;
        flex-direction: column;
        // flex: 1;
        height: 40%;
        .box1-item {
          display: flex;
          flex: 1;
          gap: 0.5208vw;
          // padding: 0.5208vw;
          .item-a {
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
            font-size: 1.5625vw;
            font-weight: bold;
            img {
              width: 5.625vw;
              height: 10vh;
              animation: rotate 10s linear infinite;
            }
            span {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
            }
          }
          .item-b {
            flex: 1;
            // margin: 10px 0 10px 0;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: space-between;
            .item-b-con {
              width: 100%;
              font-size: 0.9375vw;
              background-color: #132941;
              padding: 0 1.0417vw;
              border: 1px solid #224c90;
              height: 3.6vh;
              text-align: center;
              line-height: 3.6vh;
              .item-b-grade {
                color: #179966;
              }
            }
            .img-box {
              position: relative;
              width: 100%;
              img {
                width: 100%;
              }
              .position-img {
                position: absolute;
                width: 0.5729vw;
              }
              .position-img1 {
                left: 0;
                top: -2px;
              }
            }
          }
        }
      }
      .box2 {
        display: flex;
        flex-direction: column;
        flex: 1;
        .box2-item {
          display: flex;
          flex-direction: column;
          flex: 1;
          gap: 5px;
          // padding: 0.5208vw;
          .item-a {
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 1.5625vw;
            font-weight: bold;
            gap: 10px;
            .a-left {
              position: relative;
              img {
                width: 4.8438vw;
                height: 8.61vh;
              }
              > span {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
              }
            }

            .item-b-con {
              width: 100%;
              font-size: 0.9375vw;
              background-color: #132941;
              border: 1px solid #224c90;
              height: 3.6vh;
              text-align: center;
              line-height: 3.6vh;
              .item-b-grade {
                color: #179966;
              }
            }
          }
          .item-b {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            .img-box {
              position: relative;
              width: 100%;
              img {
                width: 100%;
              }
              .position-img {
                position: absolute;
                top: -0.625vw;
                left: 50px;
                width: 0.5729vw;
              }
            }
          }
        }
      }
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
        height: 15.27vh;
        gap: 10px;
        .box1-left {
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          flex: 1;
          .box1-left-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            height: 40px;
            padding-left: 2.5625vw;
            padding-right: 0.5208vw;
            &:nth-child(1) {
              background: url("@/assets/images/researchManagement/sw-bg1.png") no-repeat center center / 100% 100%;
              color: #d62d2a;
            }
            &:nth-child(2) {
              background: url("@/assets/images/researchManagement/sw-bg2.png") no-repeat center center / 100% 100%;
              color: #4ae9f8;
            }
            &:nth-child(3) {
              background: url("@/assets/images/researchManagement/sw-bg2.png") no-repeat center center / 100% 100%;
              color: #ffffff;
            }
          }
        }
        .box1-right {
          width: 5.9375vw;
          display: flex;
          align-items: center;
          justify-content: center;
          img {
            aspect-ratio: 1;
            width: 100%;
          }
        }
      }
      .box2 {
        flex: 1;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        .box2-item {
          display: flex;
          align-items: center;
          gap: 4px;
          img {
            width: 4.6875vw;
          }
          ul {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            margin: 4px 0;
            padding: 0;
            list-style: none;
            gap: 10px;
            li {
              font-size: 0.7292vw;
              span {
                font-size: 1.0417vw;
                color: #9ee4f1;
              }
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
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
}
</style>
<style lang="scss">
.hydrology {
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
