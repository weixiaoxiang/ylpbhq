<script lang="ts" setup>
import {
  GetALargeScreen_Agefx,
  GetALargeScreen_CarFestivalfx,
  GetALargeScreen_Carfx,
  GetALargeScreen_CarWeekfx,
  GetALargeScreen_Genderfx,
  GetALargeScreen_Lkfx,
  GetALargeScreen_Monitor,
  GetALargeScreen_Sscarhb,
  GetALargeScreen_Warning
} from "@/api"
import dayjs from "dayjs"
import CountUp from "vue-countup-v3"
const proxy = getCurrentInstance()!.proxy as any
const { showCSB } = storeToRefs(useConfigStore())
const changePanelTitleType = (type: string) => {
  // console.log(type)
  if (type.indexOf("人员分析") > -1) {
    getChartData4(type.split("-")[1])
    getChartData5(type.split("-")[1])
    getChartData6(type.split("-")[1])
  }
  if (type.indexOf("车辆分析") > -1) {
    getChartData1(type.split("-")[1])
  }
}
const popup = ref<any>(null)
const { map, popupFormatType, popupInfo, closePopup, addLayerManageData, removeLayerManageData } = useOlMap(popup, {
  zoom: 12,
  center: [116.108266, 30.982858],
  openOverlay: false,
  overlayOffset: [0, -70],
  overlayPositioning: "bottom-center",
  vectorLayerDeclutter: true
})

// 车辆分析数据
const chartData1 = ref<any>(null)
const getChartData1 = async (timeType?: string) => {
  // chartData1.value = chartData1.value = {
  //   dw: ["辆", "辆"],
  //   xAxis: ["11月1日", "11月2日", "11月3日", "11月4日", "11月5日", "11月6日", "11月7日"],
  //   data: [
  //     {
  //       name: "入场",
  //       type: "line",
  //       dw: "辆",
  //       data: [
  //         {
  //           label: "11月1日",
  //           value: 10
  //         },
  //         {
  //           label: "11月2日",
  //           value: 24
  //         },
  //         {
  //           label: "11月3日",
  //           value: 92
  //         },
  //         {
  //           label: "11月4日",
  //           value: 40
  //         },
  //         {
  //           label: "11月5日",
  //           value: 87
  //         },
  //         {
  //           label: "11月6日",
  //           value: 64
  //         },
  //         {
  //           label: "11月7日",
  //           value: 19
  //         }
  //       ]
  //     },
  //     {
  //       name: "出场",
  //       type: "bar",
  //       dw: "辆",
  //       data: [
  //         {
  //           label: "11月1日",
  //           value: 101
  //         },
  //         {
  //           label: "11月2日",
  //           value: 224
  //         },
  //         {
  //           label: "11月3日",
  //           value: 192
  //         },
  //         {
  //           label: "11月4日",
  //           value: 40
  //         },
  //         {
  //           label: "11月5日",
  //           value: 67
  //         },
  //         {
  //           label: "11月6日",
  //           value: 46
  //         },
  //         {
  //           label: "11月7日",
  //           value: 159
  //         }
  //       ]
  //     }
  //   ]
  // }
  const { response } = await GetALargeScreen_Carfx({
    timeType: timeType || "今日"
  })
  if (response?.[0]?.childer?.length > 0) {
    chartData1.value = {
      dw: ["辆", "辆"],
      xAxis: response?.[0].childer?.map((item: any) => item.name),
      data: response.map((item: any) => {
        let type = "line"
        if (item.name === "进场") {
          type = "line"
        } else {
          type = "bar"
        }
        return {
          name: item.name,
          type: type,
          dw: "辆",
          data: item.childer.map((item: any) => ({
            label: item.name,
            value: item.value
          }))
        }
      })
    }
  } else {
    chartData1.value = null
  }
}

// 未来7天车流预测数据
const chartData2 = ref<any>(null)
const getChartData2 = async () => {
  // chartData2.value = {
  //   dw: "辆",
  //   xAxis: ["11月1日", "11月2日", "11月3日", "11月4日", "11月5日", "11月6日", "11月7日"],
  //   data: [
  //     {
  //       name: "入场",
  //       data: [
  //         {
  //           label: "11月1日",
  //           value: 10
  //         },
  //         {
  //           label: "11月2日",
  //           value: 24
  //         },
  //         {
  //           label: "11月3日",
  //           value: 92
  //         },
  //         {
  //           label: "11月4日",
  //           value: 40
  //         },
  //         {
  //           label: "11月5日",
  //           value: 87
  //         },
  //         {
  //           label: "11月6日",
  //           value: 64
  //         },
  //         {
  //           label: "11月7日",
  //           value: 19
  //         }
  //       ]
  //     },
  //     {
  //       name: "出场",
  //       data: [
  //         {
  //           label: "11月1日",
  //           value: 101
  //         },
  //         {
  //           label: "11月2日",
  //           value: 224
  //         },
  //         {
  //           label: "11月3日",
  //           value: 192
  //         },
  //         {
  //           label: "11月4日",
  //           value: 40
  //         },
  //         {
  //           label: "11月5日",
  //           value: 67
  //         },
  //         {
  //           label: "11月6日",
  //           value: 46
  //         },
  //         {
  //           label: "11月7日",
  //           value: 159
  //         }
  //       ]
  //     }
  //   ]
  // }
  const { response } = await GetALargeScreen_CarWeekfx()
  if (response?.data?.[0]?.value?.length > 0) {
    chartData2.value = {
      dw: "辆",
      xAxis: response?.xAxis,
      data: response?.data?.map((item: any) => ({
        name: item.name,
        data: item.value.map((d: any, index: number) => ({
          label: response.xAxis[index],
          value: d
        }))
      }))
    }
  } else {
    chartData2.value = null
  }
}

// 预警概况数据
const chartData3 = ref<any>(null)
const getChartData3 = async () => {
  // chartData3.value = [
  //   {
  //     name: "车辆预警数",
  //     value: 1715
  //   },
  //   {
  //     name: "火情预警数",
  //     value: 2344
  //   }
  // ]
  const { response } = await GetALargeScreen_Warning()
  if (response) {
    chartData3.value = [
      {
        name: "车辆预警数",
        value: response.caralarmcount
      },
      {
        name: "火情预警数",
        value: response.firealarmcount
      }
    ]
  } else {
    chartData3.value = null
  }
}
// 路口分析数据
const chartData4 = ref<any>(null)
const getChartData4 = async (timeType?: string) => {
  // chartData4.value = {
  //   dw: "人",
  //   xAxis: ["路口1", "路口2", "路口3", "路口4", "路口5", "路口6"],
  //   data: [
  //     {
  //       name: "人数",
  //       data: [
  //         {
  //           label: "路口1",
  //           value: 10
  //         },
  //         {
  //           label: "路口2",
  //           value: 24
  //         },
  //         {
  //           label: "路口3",
  //           value: 92
  //         },
  //         {
  //           label: "路口4",
  //           value: 40
  //         },
  //         {
  //           label: "路口5",
  //           value: 87
  //         },
  //         {
  //           label: "路口6",
  //           value: 64
  //         }
  //       ]
  //     }
  //   ]
  // }
  const { response } = await GetALargeScreen_Lkfx({
    timeType: timeType || "今日"
  })
  if (response?.length > 0) {
    // 如果所有值都为0，则不显示图表
    if (response.every((item: any) => item.value === 0)) {
      chartData4.value = null
      return
    }
    chartData4.value = {
      dw: "人",
      xAxis: response.map((item: any) => item.name),
      data: [
        {
          name: "人数",
          data: response
        }
      ]
    }
  } else {
    chartData4.value = null
  }
}
// 当前时间
const currentTime = dayjs().format("YYYY/MM/DD HH:mm:ss")

// 性别及年龄比例数据
const genderData = ref<any>({})
const chartData5 = ref<any>(null)
const getChartData5 = async (timeType?: string) => {
  // chartData5.value = {
  //   dw: "人",
  //   yAxis: ["男性", "女性"],
  //   data: [
  //     {
  //       name: "男性",
  //       value: 300
  //     },
  //     {
  //       name: "女性",
  //       value: 150
  //     }
  //   ]
  // }
  const { response } = await GetALargeScreen_Genderfx({
    timeType: timeType || "今日"
  })

  if (response?.length > 0) {
    const data = response.filter((item: any) => item.name === "男" || item.name === "女")
    genderData.value = {
      total: response.find((item: any) => item.name.includes("抓拍人数"))?.value,
      man: data.find((item: any) => item.name === "男")?.value || 0,
      woman: data.find((item: any) => item.name === "女")?.value || 0
    }
    if (!genderData.value.man && !genderData.value.woman) {
      chartData5.value = null
      return
    }

    chartData5.value = {
      dw: "人",
      yAxis: data.map((item: any) => item.name),
      data: data
    }
  } else {
    genderData.value = {}
    chartData5.value = null
  }
}

// 性别及年龄比例图表数据
const chartData6 = ref<any>(null)
const getChartData6 = async (timeType?: string) => {
  const { response } = await GetALargeScreen_Agefx({
    timeType: timeType || "今日"
  })
  if (response?.length > 0) {
    chartData6.value = response
  } else {
    chartData6.value = null
  }
}

// 节假日进场车辆预测数据
const jjrcData = ref<any>([])
const getJjrcData = async () => {
  const { response } = await GetALargeScreen_CarFestivalfx()
  jjrcData.value = response
}

// 监控设备数据
const monitorData = ref<any>([])
const getMonitorData = async () => {
  const { response } = await GetALargeScreen_Monitor()
  monitorData.value = response
}

// 实时车辆环比数据
const sscData = ref<any>({
  GetIntoChain: 0,
  GetOutChain: 0,
  AllCountChain: 0,
  ToDayGetInto: 0,
  YesterDayGetInto: 0,
  YesterDayAllCount: 0
})
const getSscData = async () => {
  const { response } = await GetALargeScreen_Sscarhb()
  sscData.value = response
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
  setVariable("maptool-sidebar-bottom", "calc(305px + 40px)") // 设置地图工具栏距底部距离
  proxy.$mitt.on("changePanelTitleType", changePanelTitleType)
  getChartData1() // 获取车辆分析数据
  getChartData2() // 获取未来7天车流预测数据
  getChartData3() // 获取预警概况数据
  getChartData4() // 获取路口分析数据
  getChartData5() // 获取性别及年龄比例数据
  getChartData6() // 获取性别及年龄比例图表数据
  getJjrcData() // 获取节假日进场车辆预测数据
  getMonitorData() // 获取监控设备数据
  getSscData() // 获取实时车辆环比数据
})
onBeforeUnmount(() => {
  proxy.$mitt.off("changePanelTitleType", changePanelTitleType)
})
</script>
<template>
  <div class="capture-video-one-map">
    <div class="info-boxs">
      <div class="info-box corner">
        <div>实时累计车辆</div>
        <div>
          <div class="count-up-box">
            <count-up :end-val="sscData.AllCountChain"></count-up>
            <span>辆</span>
          </div>
          <span>环比{{ (sscData.AllCountChain > 0 ? "+" : "") + sscData.AllCountChain }}%</span>
        </div>
        <div>
          <span>昨日累计车辆</span>
          <span>{{ sscData.YesterDayAllCount }}</span>
        </div>
        <div class="corner-bottom-left"></div>
        <div class="corner-top-right"></div>
      </div>
      <div class="info-box corner">
        <div>实时入场车辆</div>
        <div>
          <div class="count-up-box">
            <count-up :end-val="sscData.ToDayGetInto"></count-up>
            <span>辆</span>
          </div>
          <span>环比{{ (sscData.GetIntoChain > 0 ? "+" : "") + sscData.GetIntoChain }}%</span>
        </div>
        <div>
          <span>昨日入场车辆</span>
          <span>{{ sscData.YesterDayGetInto }}</span>
        </div>
        <div class="corner-bottom-left"></div>
        <div class="corner-top-right"></div>
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
            title="人员分析"
            initType="今日"
            :types="['今日', '本月', '今年']"
          >
            <template #contain>
              <div class="contain">
                <div class="time">{{ currentTime }}</div>
                <div class="box">
                  <div>
                    <img
                      :src="$fun.getImg('arrow-left.png')"
                      alt=""
                    />
                    性别及年龄比例
                    <img
                      :src="$fun.getImg('arrow-right.png')"
                      alt=""
                    />
                  </div>
                  <div class="gender-box">
                    <div class="gender-box-item1">
                      <div class="gender-part1">
                        <div>累计抓拍</div>
                        <div>{{ genderData.total }}</div>
                        <img
                          :src="$fun.getImg('bigDataAnalysis/g5.png')"
                          alt=""
                        />
                      </div>
                      <div class="gender-part2">
                        <img
                          :src="$fun.getImg('bigDataAnalysis/g6.png')"
                          alt=""
                        />
                      </div>
                      <div class="gender-part3">
                        <div>
                          <div class="info">
                            <span>女性</span>
                            <span class="count">{{ genderData.woman || 0 }}人</span>
                          </div>
                          <div class="info">
                            <span>男性</span>
                            <span class="count">{{ genderData.man || 0 }}人</span>
                          </div>
                        </div>
                        <div class="chart">
                          <PictorialBarChartPanel :data="chartData5" />
                        </div>
                      </div>
                    </div>
                    <div class="gender-box-item2">
                      <ChartPanel5
                        unit="人"
                        :data="chartData6"
                      />
                    </div>
                  </div>
                </div>
                <div class="box">
                  <div>
                    <img
                      :src="$fun.getImg('arrow-left.png')"
                      alt=""
                    />
                    路口分析
                    <img
                      :src="$fun.getImg('arrow-right.png')"
                      alt=""
                    />
                  </div>
                  <div
                    :class="{ 'empty-data': !chartData4 }"
                    class="lkfx-box"
                  >
                    <ChartPanel4
                      :bar-width="10"
                      :gradient="true"
                      :colors="['#33BFEA']"
                      :data="chartData4"
                    />
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
            title="设备监控"
            :sub-title="`更新时间：${currentTime}`"
          >
            <template #contain>
              <div class="contain">
                <div class="hd bg">
                  <div>设备名称</div>
                  <div class="online">在线数量</div>
                  <div class="offline">离线数量</div>
                </div>
                <div class="bd">
                  <el-scrollbar height="100%">
                    <div
                      v-for="item in monitorData"
                      :key="item.name"
                      class="bd-row bg"
                    >
                      <div>{{ item.name }}</div>
                      <div class="online">{{ item.onlinecount }}</div>
                      <div class="offline">{{ item.offlinecount }}</div>
                    </div>
                  </el-scrollbar>
                </div>
              </div>
            </template>
          </BasePanel>
        </div>
      </transition-group>
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
          class="section3"
          key="section3"
        >
          <BasePanel title="节假日进场车辆预测">
            <template #contain>
              <div class="contain">
                <div class="box1">
                  <div
                    v-for="item in jjrcData"
                    :key="item.name"
                  >
                    {{ item.name }}
                  </div>
                </div>
                <div class="box2">
                  <div
                    v-for="item in jjrcData"
                    :key="item.name"
                  >
                    <img
                      :src="$fun.getImg('bigDataAnalysis/g2.png')"
                      alt=""
                    />
                    <span>{{ item.value }}辆</span>
                  </div>
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
          class="section4"
          key="section4"
        >
          <BasePanel title="预警概况">
            <template #contain>
              <div class="contain">
                <ChartPanel3
                  title="预警总数"
                  dw="件"
                  :show-legend="false"
                  :gradient="false"
                  :showLabel="true"
                  :colors="['#00e3ff', '#d0ae3e']"
                  :data="chartData3"
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
            title="车辆分析"
            initType="今日"
            :types="['今日', '本月', '今年']"
          >
            <template #contain>
              <div class="contain">
                <LineBarChartPanel
                  :lineColors="['#44e4ca']"
                  :gradient="true"
                  :tooltip-total="true"
                  :barColors="['#62fee0|#399bfb']"
                  :area-background="true"
                  :open-division="false"
                  :open-effect="true"
                  :node-shadow="true"
                  :data="chartData1"
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
          <BasePanel title="未来7天车流预测">
            <template #contain>
              <div class="contain">
                <LineChartPanel
                  path="path://M 0 -8 L 7 -4 L 7 4 L 0 8 L -7 4 L -7 -4 Z M 0 -2 A 2 2 0 1 1 0 2 A 2 2 0 1 1 0 -2 Z"
                  :symbol-size="10"
                  :tooltip-total="true"
                  :colors="['#f2ca20', '#30ee38']"
                  :node-shadow="true"
                  :open-effect="true"
                  :area-background="false"
                  :line-dashed="false"
                  :data="chartData2"
                />
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
.capture-video-one-map {
  position: relative;
  height: 100%;
  font-size: 14px;
  color: #fff;
  .map-box {
    position: relative;
    width: 100%;
    height: 100%;
  }
  .info-boxs {
    display: flex;
    gap: 10px;
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.7292vw;
    color: #fff;
    z-index: 1;
    .info-box {
      position: relative;
      width: 9.375vw;
      background: linear-gradient(to bottom, rgba(5, 69, 109, 0.65), rgba(4, 34, 54, 0.65) 50%, rgba(4, 68, 109, 0.65));
      padding: 0.2604vw 0.5208vw;
      .count-up-box {
        display: flex;
        align-items: flex-end;
        gap: 0.1563vw;
      }
      > div {
        &:nth-child(1) {
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 0.8333vw;
          margin-bottom: 0.3125vw;
        }
        &:nth-child(2) {
          display: flex;
          justify-content: space-between;
          align-items: end;
          .countup-wrap {
            font-size: 1.1458vw;
            color: #2cfefe;
            letter-spacing: 3px;
          }
        }
        &:nth-child(3) {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.5208vw;
          height: 22px;
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
      // const addSum = ()=>{}
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
  .bottom {
    display: flex;
    gap: 20px;
    position: absolute;
    bottom: 20px;
    left: calc(21.875vw + 40px);
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
      position: relative;
      height: 100%;
      .time {
        position: absolute;
        top: 1.8229vw;
        right: 0;
        font-size: 0.625vw;
        color: #b0bac4;
      }
      .box {
        display: flex;
        flex-direction: column;
        font-size: 0.7292vw;
        > div:first-child {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.4167vw;
          background-color: #294064;
          line-height: 2em;
          color: #a4d0e5;
        }
        > div:last-child {
          flex: 1;
        }
        .gender-box {
          display: flex;
          flex-direction: column;
          padding: 0.5208vw;
          overflow: hidden;
          .gender-box-item1 {
            display: flex;
            align-items: center;
            gap: 0.5208vw;
            height: 120px;
          }
          .gender-box-item2 {
            flex: 1;
          }
          .gender-part1 {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 2px;
            > div {
              font-size: 0.7292vw;
            }
            img {
              width: 3.5417vw;
              height: 76px;
            }
          }
          .gender-part2 {
            height: 112px;
            img {
              width: 8px;
              height: 110px;
            }
          }
          .gender-part3 {
            flex: 1;
            height: 100%;
            display: flex;
            > div {
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              gap: 0.5208vw;
              .info {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                gap: 3px;
                width: 45px;
                height: 45px;
                border-radius: 50%;
                border: 2px solid #339fbb;
                font-size: 0.625vw;
                .count {
                  color: #d79d0a;
                }
                &:first-child {
                  border-color: #e75660;
                  color: #e75660;
                }
                &:last-child {
                  border-color: #4ab7fd;
                  color: #4ab7fd;
                }
              }
            }
            .chart {
              position: relative;
              flex: 1;
              height: 100%;
              overflow: hidden;
              flex-shrink: 0;
            }
          }
        }
        .lkfx-box {
          position: relative;
          background: url("@/assets/images/bigDataAnalysis/g4.png") no-repeat center bottom / 100% 85px;
          &.empty-data {
            background: none;
          }
        }
      }
      .box:nth-child(2) {
        height: 70%;
      }
      .box:nth-child(3) {
        height: 30%;
      }
    }
  }
  .section2 {
    height: 285px;
    overflow: hidden;
    .contain {
      display: flex;
      flex-direction: column;
      height: 100%;
      font-size: 0.7292vw;
      color: #cfdae5;
      .hd {
        display: flex;
      }
      .bd {
        flex: 1;
        overflow: hidden;
        .bd-row {
          display: flex;
          align-items: center;
          margin: 6px 0;
        }
      }
      .online {
        color: greenyellow;
      }
      .offline {
        color: orangered;
      }
      .bg {
        width: 100%;
        height: 31px;
        background: url("@/assets/images/bigDataAnalysis/g3.png") no-repeat center center / 100% 100%;
        > div {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      }
    }
  }
  .section3 {
    width: 100%;
    .contain {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      .box1 {
        display: flex;
        align-items: center;
        font-size: 1.0417vw;
        line-height: 2em;
        color: #00e5ff;
        > div {
          display: flex;
          justify-content: center;
          align-items: center;
          flex: 1;
        }
      }
      .box2 {
        display: flex;
        align-items: center;
        flex: 1;
        > div {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          flex: 1;
          img {
            width: 4.9479vw;
            height: 165px;
            pointer-events: none;
            user-select: none;
          }
          span {
            position: absolute;
            bottom: 50px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 1.0417vw;
            color: #00e5ff;
          }
        }
      }
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
    flex: 1;
    overflow: hidden;
    .contain {
      height: 100%;
    }
  }
  .section6 {
    height: 305px;
    .contain {
      height: 100%;
    }
  }
}
</style>
