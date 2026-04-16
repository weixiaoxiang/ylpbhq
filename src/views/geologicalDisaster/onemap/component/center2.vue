<template>
  <div class="geologicalDisaster-section wrapgeo">
    <div class="wrap-header">
      <div class="title-content">
        <img
          class="title-logo"
          :src="$fun.getImg('title-icon.svg')"
          alt=""
        />
        <div class="title">位移形变监测</div>
      </div>
      <div class="title-con">
        <div class="tabs">
          <div
            class="tab"
            :class="{ active: activeTab == item }"
            v-for="(item, index) in typeOption"
            :key="index"
            @click="clickTab(item)"
          >
            {{ item }}
          </div>
        </div>
      </div>
    </div>
    <div class="linebottom"></div>
    <div class="wrap-con">
      <div
        id="chart1"
        class="chart"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as echarts from "echarts"
// import dayjs from "dayjs"
const typeOption = ref(["今日", "近7天", "近14天"])
const activeTab = ref("近7天")
const clickTab = (val: any) => {
  activeTab.value = val
  getData()
}
import { geologicalDisasterApi } from "@/api/geologicalDisaster"
// import { HexToRGB, formatRoundNum } from "@/utils/index";
import dayjs from "dayjs"
// import * as echarts from "echarts"
const props = defineProps({
  equipmentId: {
    type: [Number, String],
    default: null
  }
})

let chart1: any = null
const getData = async () => {
  chart1?.dispose && chart1.dispose() // 销毁实例
  let chart: any = document.getElementById("chart1")
  chart.removeAttribute("_echarts_instance_")
  chart1 = echarts.init(chart as HTMLDivElement)
  let option: any = null

  let gcbh: any = [] //高程变化
  let bxlbh: any = [] //北向量变化
  let dxlbh: any = [] //东向量变化
  // let query = {
  //   startTime: dayjs().format("YYYY-MM-DD 00:00:00"),
  //   endTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
  //   equipmentId: props.equipmentId
  // }

  let query = {
    startTime: "",
    endTime: "",
    equipmentId: props.equipmentId
  }
  if (activeTab.value == "今日") {
    query.startTime = dayjs().format("YYYY-MM-DD 00:00:00")
    query.endTime = dayjs().format("YYYY-MM-DD HH:mm:ss")
  } else if (activeTab.value == "近7天") {
    query.startTime = dayjs().subtract(7, "day").startOf("day").format("YYYY-MM-DD 00:00:00")
    query.endTime = dayjs().format("YYYY-MM-DD HH:mm:ss")
  } else if (activeTab.value == "近14天") {
    query.startTime = dayjs().subtract(14, "day").startOf("day").format("YYYY-MM-DD 00:00:00")
    query.endTime = dayjs().format("YYYY-MM-DD HH:mm:ss")
  }
  let { response } = await geologicalDisasterApi.GetDisplacementDeformation(query)
  let dataAll = []
  let MaxData: any = []
  let max: any = []
  if (response) {
    gcbh = response.GC
    bxlbh = response.BXL
    dxlbh = response.DXL
    dataAll.push(gcbh)
    dataAll.push(bxlbh)
    dataAll.push(dxlbh)

    //最大值
    max = dataAll.reduce((a: any, b: any) => {
      return a > b ? a : b
    })
    max = formatRoundNum(max)
    let data = []
    gcbh.forEach((item, index) => {
      MaxData.push(max)
      data.push(item.statisticalTime)
    })

    let colors = [
      {
        type: "linear",
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [
          {
            offset: 0,
            color: "#79DCF9" // 0% 处的颜色
          },
          {
            offset: 1,
            color: "#3A84DF" // 100% 处的颜色
          }
        ],
        global: false // 缺省为 false
      },
      {
        type: "linear",
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [
          {
            offset: 0,
            color: "#FBD673" // 0% 处的颜色
          },
          {
            offset: 1,
            color: "#D95923" // 100% 处的颜色
          }
        ],
        global: false // 缺省为 false
      }
    ]
    option = {
      color: colors,
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow"
        }
      },
      grid: {
        top: "15%",
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true
      },
      legend: {
        data: ["高程变化", "北向量变化", "东向量变化"],
        textStyle: {
          color: "#999"
        }
      },
      xAxis: [
        {
          name: "时",
          type: "category",
          data: data,
          axisTick: {
            show: false //隐藏X轴刻度
          },
          axisLabel: {
            rotate: 0,
            fontSize: 12,
            color: "#CFDAE5", //x轴文字颜色
            interval: "auto",
            formatter: function (value: any) {
              let name = value
              if (activeTab.value === "今日") {
                name = dayjs(name).format("H点")
              } else if (activeTab.value === "近7天") {
                name = dayjs(name).format("D号")
              } else if (activeTab.value === "近14天") {
                name = dayjs(name).format("D号")
              }
              return name
            }
          },
          axisLine: {
            show: false // 隐藏X轴轴线
          }
        }
      ],
      yAxis: [
        {
          name: "单位：mm",
          type: "value",
          axisLine: {
            lineStyle: {
              color: "#CFDAE5" //y轴颜色
            }
          },
          axisLabel: {
            // "formatter": "{value} T/h"
            formatter: "{value}"
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: "#636e72", // 设置刻度线颜色为白色
              type: [2, 3],
              dashOffset: 2
            }
          }
        }
      ],
      series: [
        {
          type: "line",
          showSymbol: true,
          symbolSize: 10,
          smooth: true,
          name: "高程变化",
          data: gcbh,
          symbol: "circle",
          lineStyle: {
            color: "#3ECEE2"
          },
          itemStyle: {
            color: "#fff",
            borderColor: "rgba(255,255,255,0.5)",
            borderWidth: 4
          }
        },
        {
          type: "bar",
          barWidth: 18,
          barGap: "0",
          name: "北向量变化",
          data: bxlbh
        },
        {
          type: "bar",
          barWidth: 18,
          barGap: "0",
          name: "东向量变化",
          data: dxlbh
        },
        {
          name: "背景",
          type: "bar",
          barWidth: 40,
          // barGap: "-100%",

          data: MaxData,
          itemStyle: {
            color: "rgba(255,255,255,0.1)"
          },
          tooltip: {
            show: false
          }
        }
      ]
    }
  }

  chart1.clear()
  if (option) {
    chart1.setOption(option)
  }
  window.addEventListener("resize", resizeChart)
}
//窗口大小改变事件
function resizeChart() {
  chart1.resize()
}
function formatRoundNum(number: any) {
  let bite = 0
  if (number < 10) {
    return 10
  }
  while (number >= 10) {
    number /= 10
    bite += 1
  }
  return Math.ceil(number) * Math.pow(10, bite)
}

watch(
  () => props.equipmentId,
  (newVal, oldVal) => {
    if (newVal) {
      nextTick(() => {
        getData()
      })
    }
  },
  {
    immediate: true
  }
)
onBeforeUnmount(() => {
  window.removeEventListener("resize", resizeChart)
})
</script>

<style lang="scss" scoped>
.geologicalDisaster-section {
  height: vh(301);
  margin: 20px 0;
}
</style>
