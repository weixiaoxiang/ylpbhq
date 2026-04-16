<script lang="ts" setup>
import {
  GetALargeScreenSoilPatrol_Cjlx,
  GetALargeScreenSoilPatrol_JgRanking,
  GetALargeScreenSoilPatrol_Ranking,
  GetALargeScreenSoilPatrol_Sjgk,
  GetALargeScreenSoilPatrol_Week
} from "@/api"

const proxy = getCurrentInstance()!.proxy as any
const { showCSB } = storeToRefs(useConfigStore())
const popup = ref<any>(null)
const {
  map,
  popupFormatType,
  popupInfo,
  closePopup,
  vectorFeatures,
  locationMap,
  addLayerManageData,
  removeLayerManageData
} = useOlMap(popup, {
  zoom: 13,
  center: [116.0892869, 31.046022],
  openOverlay: false,
  overlayOffset: [0, -70],
  overlayPositioning: "bottom-center",
  vectorLayerDeclutter: true
})

// 获得数据概况
const dataOverview = ref<any>(null)
const getDataOverview = async () => {
  const { response } = await GetALargeScreenSoilPatrol_Sjgk()
  dataOverview.value = response
}

// 各纬度人员排名TOP10中的tab数据
const tab1 = ref("巡护里程")
const tab1Unit = ref("公里")
const tab1List = ref<any[]>(["巡护里程", "巡护次数", "巡护时长"])
const handleTab1Click = (name: string) => {
  tab1.value = name
  if (name === "巡护里程") {
    tab1Unit.value = "公里"
  } else if (name === "巡护次数") {
    tab1Unit.value = "次"
  } else if (name === "巡护时长") {
    tab1Unit.value = "小时"
  }
  getChartData1()
}
// 获得各纬度人员排名TOP10
const chartData1 = ref<any>(null)
const getChartData1 = async () => {
  const { response } = await GetALargeScreenSoilPatrol_Ranking({
    dataType: tab1.value
  })
  if (response?.length > 0) {
    chartData1.value = {
      dw: tab1Unit.value,
      xAxis: response.map((item: any) => item.name),
      data: [
        {
          name: tab1.value,
          data: response.map((item: any) => ({
            date: item.name,
            value: item.value
          }))
        }
      ]
    }
  } else {
    chartData1.value = null
  }
}

// 采集类型
const chartData2 = ref<any[] | null>([])
const getChartData2 = async () => {
  chartData2.value = [
    {
      name: "保护设施情况",
      value: 10
    },
    {
      name: "其他类型",
      value: 10
    },
    {
      name: "珍稀动植物",
      value: 10
    },
    {
      name: "违法违规问题",
      value: 10
    },
    {
      name: "界碑界桩问题",
      value: 10
    },
    {
      name: "人类活动影像情况",
      value: 10
    },
    {
      name: "宣传牌警示情况",
      value: 10
    }
  ]
  const { response } = await GetALargeScreenSoilPatrol_Cjlx()
  if (response?.length > 0) {
    chartData2.value = response
  } else {
    chartData2.value = null
  }
}

// 机构排名的tab数据
const tab2 = ref("巡护里程")
const tabUnit2 = ref("公里")
const tab2List = ref<any[]>(["巡护里程", "巡护次数", "巡护时长"])
const handleTab2Click = (name: string) => {
  tab2.value = name
  if (name === "巡护里程") {
    tabUnit2.value = "公里"
  } else if (name === "巡护次数") {
    tabUnit2.value = "次"
  } else if (name === "巡护时长") {
    tabUnit2.value = "小时"
  }
  getJgpmInfo()
}
// 获得机构排名
const jgpmInfo = ref<any>(null)
const getJgpmInfo = async () => {
  const { response } = await GetALargeScreenSoilPatrol_JgRanking({
    dataType: tab2.value
  })
  if (response?.length > 0) {
    jgpmInfo.value = {
      top1: response[0] || {},
      top2: response[1] || {},
      top3: response[2] || {}
    }
  } else {
    jgpmInfo.value = null
  }
}

// 近一周数据的tab数据
const tab3 = ref("在线人数")
const tab3Unit = ref("人")
const tab3List = ref<any[]>(["在线人数", "巡护里程", "巡护次数", "巡护时长"])
const handleTab3Click = (name: string) => {
  tab3.value = name
  if (name === "在线人数") {
    tab3Unit.value = "人"
  } else if (name === "巡护里程") {
    tab3Unit.value = "公里"
  } else if (name === "巡护次数") {
    tab3Unit.value = "次"
  } else if (name === "巡护时长") {
    tab3Unit.value = "小时"
  }
  getChartData3()
}
// 获得近一周数据图表数据
const chartData3 = ref<any>(null)
const getChartData3 = async () => {
  // chartData3.value = {
  //   dw: tab3Unit.value,
  //   xAxis: ["张三", "李四", "王五", "赵六", "孙七", "周八"],
  //   data: [
  //     {
  //       name: "在线人数",
  //       data: [
  //         { label: "张三", value: 867.784 },
  //         { label: "李四", value: 418.636 },
  //         { label: "王五", value: 756.956 },
  //         { label: "赵六", value: 504.631 },
  //         { label: "孙七", value: 188.199 },
  //         { label: "周八", value: 188.199 }
  //       ]
  //     }
  //   ]
  // }
  const { response } = await GetALargeScreenSoilPatrol_Week({
    dataType: tab3.value
  })
  if (response?.length > 0) {
    chartData3.value = {
      dw: tab3Unit.value,
      xAxis: response.map((item: any) => item.name),
      data: [
        {
          name: tab3.value,
          data: response.map((item: any) => ({
            date: item.name,
            value: item.value
          }))
        }
      ]
    }
  } else {
    chartData3.value = null
  }
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
  getDataOverview() // 获得数据概况
  getChartData1() // 获得各纬度人员排名TOP10
  getChartData2() // 获得采集类型
  getJgpmInfo() // 获得机构排名
  getChartData3() // 获得近一周数据
})
</script>
<template>
  <div class="intelligent-patrol">
    <div class="section-bar">
      <MapFeatureSearch
        :features="vectorFeatures"
        @location="locationMap"
      />
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
          <BasePanel title="数据概况">
            <template #contain>
              <div class="contain">
                <div class="item item1">
                  <img
                    :src="$fun.getImg('bigDataAnalysis/l2.png')"
                    alt=""
                  />
                  <div class="text-box">
                    <div>巡护总次数</div>
                    <div>{{ dataOverview?.xhzcs }}</div>
                  </div>
                </div>
                <div class="item item2">
                  <div class="text-box">
                    <div>巡护总里程</div>
                    <div>{{ dataOverview?.xhzlc }}次</div>
                  </div>
                  <img
                    :src="$fun.getImg('bigDataAnalysis/l3.png')"
                    alt=""
                  />
                </div>
                <div class="item item3">
                  <img
                    :src="$fun.getImg('bigDataAnalysis/l4.png')"
                    alt=""
                  />
                  <div class="text-box">
                    <div>巡护总时长</div>
                    <div>{{ dataOverview?.xhzsc }}次</div>
                  </div>
                </div>
                <div class="item item4">
                  <div class="text-box">
                    <div>巡护采集数</div>
                    <div>{{ dataOverview?.xhcjs }}次</div>
                  </div>
                  <img
                    :src="$fun.getImg('bigDataAnalysis/l5.png')"
                    alt=""
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
          <BasePanel title="各维度人员排名 Top10">
            <template #contain>
              <div class="contain">
                <div class="tab">
                  <div
                    v-for="item in tab1List"
                    :key="item"
                    class="tab-item"
                    :class="{ current: tab1 === item }"
                    @click="handleTab1Click(item)"
                  >
                    {{ item }}
                  </div>
                </div>
                <div class="chart">
                  <BarChartPanel
                    :bar-width="15"
                    :gradient="true"
                    :colors="['#17c9f4']"
                    :data="chartData1"
                  />
                </div>
              </div>
            </template>
          </BasePanel>
        </div>
        <div
          v-show="showCSB"
          class="section3"
          key="section3"
        >
          <BasePanel title="采集类型">
            <template #contain>
              <div class="contain">
                <ChartPanel10
                  unit="个"
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
          class="section4"
          key="section4"
        >
          <BasePanel title="机构排名">
            <template #contain>
              <div class="contain">
                <div class="tab">
                  <div
                    v-for="item in tab2List"
                    :key="item"
                    class="tab-item"
                    :class="{ current: tab2 === item }"
                    @click="handleTab2Click(item)"
                  >
                    <img
                      :src="$fun.getImg(`bigDataAnalysis/l${item}.png`)"
                      alt=""
                    />
                    {{ item }}
                  </div>
                </div>
                <div class="box">
                  <div class="box-1">
                    <img
                      :src="$fun.getImg('bigDataAnalysis/l9.png')"
                      alt=""
                    />
                    <span>TOP1 {{ jgpmInfo?.top1?.name }}</span>
                    <span>{{ jgpmInfo?.top1?.value }} {{ tabUnit2 }}</span>
                  </div>
                  <div class="box-2">
                    <img
                      :src="$fun.getImg('bigDataAnalysis/l10.png')"
                      alt=""
                    />
                    <span>TOP2 {{ jgpmInfo?.top2?.name }}</span>
                    <span>{{ jgpmInfo?.top2?.value }} {{ tabUnit2 }}</span>
                  </div>
                  <div class="box-3">
                    <img
                      :src="$fun.getImg('bigDataAnalysis/l10.png')"
                      alt=""
                    />
                    <span>TOP3 {{ jgpmInfo?.top3?.name }}</span>
                    <span>{{ jgpmInfo?.top3?.value }} {{ tabUnit2 }}</span>
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
          <BasePanel title="近一周数据">
            <template #contain>
              <div class="contain">
                <div class="tab">
                  <div
                    v-for="item in tab3List"
                    :key="item"
                    class="tab-item"
                    :class="{ current: tab3 === item }"
                    @click="handleTab3Click(item)"
                  >
                    <img
                      :src="$fun.getImg(`bigDataAnalysis/l${item}.png`)"
                      alt=""
                    />
                    {{ item }}
                  </div>
                </div>
                <div class="chart">
                  <LineChartPanel
                    :node-shadow="true"
                    :open-effect="false"
                    :areaBackground="true"
                    :colors="['#3bf4fd']"
                    :data="chartData3"
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
.intelligent-patrol {
  position: relative;
  height: 100%;
  font-size: 0.7292vw;
  color: #fff;
  .map-box {
    position: relative;
    width: 100%;
    height: 100%;
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
  .tab {
    display: flex;
    justify-content: center;
    gap: 1.0417vw;
    .tab-item {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.2604vw;
      // width: 5.5729vw;
      height: 25px;
      padding: 0 0.7813vw;
      background: url("@/assets/images/bigDataAnalysis/k4.png") no-repeat center center / 100% 100%;
      cursor: pointer;
      &.current {
        background: url("@/assets/images/bigDataAnalysis/k3.png") no-repeat center center / 100% 100%;
        color: #a9c3f1;
      }
    }
  }
  .section1 {
    flex: 1;
    overflow: hidden;
    .contain {
      position: relative;
      height: 100%;
      background: url("@/assets/images/bigDataAnalysis/l1.png") no-repeat center center / 15.625vw 6.25vw;
      .item {
        position: absolute;
        display: flex;
        align-items: center;
        gap: 0.3125vw;
        img {
          width: 2.6042vw;
          height: 1.9792vw;
        }
        .text-box {
          display: flex;
          flex-direction: column;
          justify-content: center;
          div {
            &:first-child {
              font-size: 0.7292vw;
              color: #aab4c1;
            }
            &:last-child {
              font-size: 0.9375vw;
              background: linear-gradient(to bottom, #56abf9, #fefffe); /* 渐变颜色 */
              -webkit-background-clip: text;
              color: transparent;
            }
          }
        }
      }
      .item1 {
        top: 15%;
        left: 10%;
      }
      .item2 {
        top: 15%;
        right: 10%;
      }
      .item3 {
        bottom: 15%;
        left: 10%;
      }
      .item4 {
        bottom: 15%;
        right: 10%;
      }
    }
  }
  .section2 {
    flex: 1;
    overflow: hidden;
    .contain {
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      .chart {
        flex: 1;
      }
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
    height: 60%;
    overflow: hidden;
    .contain {
      display: flex;
      flex-direction: column;
      gap: 0.2604vw;
      height: 100%;
      .tab {
        img {
          width: 0.625vw;
        }
      }
      .box {
        flex: 1;
        position: relative;
        background: url("@/assets/images/bigDataAnalysis/l9.svg") no-repeat center center / 90% 90%;
        font-size: 0.7292vw;
        .box-1 {
          position: absolute;
          top: 10%;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.2604vw;
          font-size: 0.7292vw;
          img {
            width: 1.875vw;
          }
          span {
            &:last-child {
              color: #f9d74c;
              font-size: 0.8333vw;
            }
          }
        }
        .box-2 {
          position: absolute;
          top: 30%;
          left: 10%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.2604vw;
          justify-content: center;
          font-size: 0.7292vw;
          img {
            width: 0.7292vw;
          }
          span {
            &:last-child {
              color: #75e8ee;
              font-size: 0.8333vw;
            }
          }
        }
        .box-3 {
          position: absolute;
          top: 40%;
          right: 10%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.2604vw;
          font-size: 0.7292vw;
          img {
            width: 0.7292vw;
          }
          span {
            &:last-child {
              color: #75e8ee;
              font-size: 0.8333vw;
            }
          }
        }
      }
    }
  }
  .section5 {
    height: 40%;
    overflow: hidden;
    .contain {
      display: flex;
      flex-direction: column;
      gap: 0.3125vw;
      height: 100%;
      overflow: hidden;
      .tab {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        .tab-item {
          width: fit-content;
          margin: 0 auto;
        }
      }
      .chart {
        flex: 1;
        position: relative;
      }
    }
  }
}
</style>
