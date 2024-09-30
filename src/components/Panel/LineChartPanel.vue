<template>
  <div
    ref="chartPanelRef"
    class="chart-panel"
    id="chart-panel"
    :style="style"
  >
    <EchartsEmpty v-if="!chart" />
  </div>
</template>

<script lang="ts" setup>
// import { hexToRgba } from "@/utils/format"
import { getCurrentInstance } from "vue"
const proxy = getCurrentInstance()!.proxy as any
interface Props {
  data?: any
  style?: any
}
const props = withDefaults(defineProps<Props>(), {
  style: () => {
    return {
      width: "100%",
      height: "100%"
    }
  }
})
const chartPanelRef = ref("")
let chart: any = null
const initChart = async () => {
  if (!chart) {
    chart = proxy.$echarts.init(chartPanelRef.value, null, {
      devicePixelRatio: 2.5
    })
  }
  window.addEventListener("resize", resize)
}
const resize = () => {
  if (chart) {
    chart.resize()
  }
}
const setOption = () => {
  const response = props.data
  const color = ["#faba5a", "#7ecffd", "#01B3FF", "#9747FF"]
  let xAxis: any = [],
    data: any = []
  const legend: any = []
  const unit = response.dw
  if (response?.data.length === 0) {
    chart = null
    return
  } else {
    xAxis = response.xAxis
    data = response.data.map((d: any, i: any) => {
      legend.push(d.name)
      return {
        name: d.name,
        type: "line",
        data: d.data,
        symbol: "circle",
        symbolSize: 8,
        smooth: false,
        lineStyle: {
          color: color[i],
          type: "dashed"
        },
        itemStyle: {
          color: color[i],
          borderColor: "#fff",
          borderWidth: 1
        },
        zlevel: 9
      }
    })
  }
  const options = {
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(0,0,0,0.7)",
      borderWidth: 0,
      axisPointer: {
        type: "shadow"
      },
      textStyle: {
        color: "#fff"
      },
      formatter: (params: any) => {
        let str = `${params[0].name} <br>`
        params.forEach((param: any) => {
          const { seriesName, value } = param
          str += `${seriesName}（${unit}） ： ${value} <br>`
        })
        return str
      }
    },
    legend: {
      data: legend,
      align: "right",
      top: "top",
      left: "center",
      textStyle: {
        color: "#fff",
        fontSize: 12
      },
      itemWidth: 20,
      itemHeight: 16
    },
    grid: {
      top: "15%",
      right: "5%",
      left: "8%",
      bottom: "15%"
    },
    xAxis: [
      {
        type: "category",
        data: xAxis,
        axisLine: {
          show: true,
          lineStyle: {
            color: "#686a6c",
            type: "dashed"
          }
        },
        axisTick: {
          show: false // 是否显示坐标轴轴线
        },
        axisLabel: {
          margin: 10,
          color: "#c3cdd7",
          fontSize: 14,
          interval: 0
        }
      }
    ],
    yAxis: [
      {
        name: unit,
        nameTextStyle: {
          fontSize: 14,
          color: "#8a96a8"
        },
        axisLabel: {
          formatter: "{value}",
          color: "#6c7880"
        },
        axisTick: {
          show: false // 是否显示坐标轴轴线
        },
        axisLine: {
          show: false
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: "#32414c",
            type: "dashed"
          }
        }
      }
    ],
    series: data
  }
  chart.setOption(options)
}
watch(
  () => props.data,
  () => {
    if (!chart) {
      initChart()
    }
    setOption()
  }
)
onMounted(() => {
  initChart()
  setOption()
})
onBeforeUnmount(() => {
  if (chart) {
    window.removeEventListener("resize", resize)
    chart.dispose()
    chart = null
    chartPanelRef.value = ""
  }
})
</script>

<style lang="scss" scoped>
.chart-panel {
  // width: 100%;
  // height: 100%;
}
</style>
