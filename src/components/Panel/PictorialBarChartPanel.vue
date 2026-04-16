<template>
  <div
    ref="chartPanelRef"
    class="chart-panel"
    id="chart-panel"
  ></div>
  <EmptyData
    v-show="!data"
    :font-size="14"
    :image-size="60"
  />
</template>
<!-- 性别象形图 -->
<script lang="ts" setup>
// @ts-nocheck
/* eslint-disable */
import { getCurrentInstance } from "vue"
const proxy = getCurrentInstance()!.proxy as any
interface Props {
  data?: any
}
const props = withDefaults(defineProps<Props>(), {})
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
  const unit = response.dw || "个"
  let yAxis: any = [],
    data: any = []
  const color = props.colors ? props.colors : ["#71F28D", "#EDB53F", "#EB2927", "#9747FF", "#B90000"]
  let count = 0
  const symbol1 = "image://" + proxy.$fun.getImg("bigDataAnalysis/g7.svg")
  const symbol2 = "image://" + proxy.$fun.getImg("bigDataAnalysis/g8.svg")

  if (!response || response?.data.length === 0) {
    chart = null
    return
  } else {
    yAxis = response.yAxis
    data = response.data.map((d, i) => {
      count += d.value
      if (d.name === "男") {
        return {
          symbol: symbol1,
          value: d.value
        }
      } else {
        return {
          symbol: symbol2,
          value: d.value
        }
      }
    })
  }
  var maxData = count || 100
  const options = {
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(0,0,0,0.7)",
      borderWidth: 0,
      axisPointer: {
        type: "shadow"
      },
      textStyle: {
        color: "#fff",
        fontSize: 12
      },
      formatter: `{b}（${unit}）：{c}`
      // confine: true
    },
    xAxis: {
      show: false,
      max: maxData,
      splitLine: { show: false },
      offset: 10,
      axisLine: {
        lineStyle: {
          color: "#999"
        }
      },
      axisLabel: {
        margin: 10
      }
    },
    yAxis: {
      show: false,
      data: yAxis,
      inverse: true,
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: {
        margin: 10,
        color: "#999",
        fontSize: 16
      }
    },
    grid: {
      top: "0",
      bottom: "0",
      left: "5%",
      right: "35"
    },
    series: [
      {
        // current data
        type: "pictorialBar",
        symbol: symbol1,
        symbolRepeat: "fixed",
        symbolMargin: "5%",
        symbolClip: true,
        symbolSize: [10, 18],
        symbolBoundingData: maxData,
        data: data,
        z: 10
      },
      {
        // full data
        type: "pictorialBar",
        itemStyle: {
          opacity: 0.2
        },
        label: {
          show: true,
          formatter: (params: any) => {
            return Math.round((params.value * 100) / maxData) + " %"
          },
          position: "right",
          color: "#fff",
          fontSize: 12,
          opacity: 0.9
        },
        animationDuration: 0,
        symbolRepeat: "fixed",
        symbolMargin: "5%",
        symbol: symbol1,
        symbolSize: [10, 18],
        symbolBoundingData: maxData,
        data: data,
        z: 5
      }
    ],
    animation: true,
    animationDurationUpdate: 2000
  }
  chart.setOption(options)
  timer && clearInterval(timer)

  // startTooltipAnimation()
}
let timer: any = null,
  currentIndex: any = 0
// 开始tooltip动画，高亮和选中当前项
const startTooltipAnimation = () => {
  const dataLen = chart.getOption().series[0].data.length
  chart.dispatchAction({
    type: "showTip",
    seriesIndex: 0,
    dataIndex: currentIndex
  })
  currentIndex = (currentIndex + 1) % dataLen
  timer = setInterval(() => {
    chart.dispatchAction({
      type: "showTip",
      seriesIndex: 0,
      dataIndex: currentIndex
    })
    currentIndex = (currentIndex + 1) % dataLen
  }, 3000) // 每3秒移动一次
}
// 销毁chart
const disposeChart = () => {
  if (chart) {
    window.removeEventListener("resize", resize)
    chart.dispose()
    chart = null
    chartPanelRef.value = ""
  }
  timer && clearInterval(timer)
}
watch(
  () => props.data,
  (val) => {
    if (val) {
      if (!chart) {
        initChart()
      }
      setOption()
    } else {
      disposeChart()
    }
  }
)
onMounted(() => {
  if (props.data) {
    initChart()
    setOption()
  }
})
onBeforeUnmount(() => {
  disposeChart()
})
</script>

<style lang="scss" scoped>
.chart-panel {
  width: 100%;
  height: 100%;
  // height: 280px;
}
</style>
