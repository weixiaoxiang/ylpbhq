<template>
  <div
    ref="chartPanelRef"
    class="chart-panel"
    id="chart-panel"
    :style="style"
  ></div>
  <EmptyData
    class="empty-data"
    v-show="!data"
    :font-size="14"
    :image-size="60"
  />
</template>
<!-- 柱状图 -->
<script lang="ts" setup>
import { getCurrentInstance } from "vue"
const proxy = getCurrentInstance()!.proxy as any
interface Props {
  data?: any
  title?: any
  style?: any
  xAxisRotate?: any
  // custom1: 最后两个字换行 2: 每行显示2个字 3: 每行显示3个字 ....
  lineBreak?: "" | "2" | "3" | "custom1"
  gradient?: any
  colors?: any
  barWidth?: number
}
const props = withDefaults(defineProps<Props>(), {
  style: () => {
    return {
      width: "100%",
      height: "100%"
    }
  },
  lineBreak: "", //  x轴文字是否换行,默认不换行，按字数换行的值为2或3
  xAxisRotate: false, // x轴文字是否倾斜
  gradient: false, // 是否显示渐变
  barWidth: 25 // 柱子宽度
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
// props.data数据结构
// {
//   dw: "只", // 单位
//   xAxis: ["美国白蛾", "春尺蠖",], // x轴数据
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
const setOption = async () => {
  const response = props.data
  const color = props.colors ? props.colors : ["#71F28D", "#EDB53F", "#EB2927", "#9747FF", "#B90000"]

  let xAxis: any = [],
    data: any = []
  const legend: any = []
  const unit = response.dw
  if (!response || response?.data.length === 0) {
    chart = null
    return
  } else {
    xAxis = response.xAxis
    data = response.data.map((d: any, i: number) => {
      legend.push(d.name)
      let color1, color2
      if (props.gradient) {
        if (color[i].indexOf("|") > -1) {
          color1 = color[i].split("|")[0]
          color2 = color[i].split("|")[1]
        } else {
          color1 = color[i]
          color2 = hexToRgba(color[i], 0.2)
        }
      }
      return {
        name: d.name,
        type: "bar",
        yAxisIndex: 0,
        barWidth: props.barWidth || 25,
        barMinWidth: 10,
        barMaxWidth: 25,
        label: {
          show: true,
          position: "top",
          fontSize: 12,
          color: "#33BFEA"
        },
        itemStyle: props.gradient
          ? {
              color: new proxy.$echarts.graphic.LinearGradient(
                0,
                0,
                0,
                1,
                [
                  {
                    offset: 0,
                    color: color1
                  },
                  {
                    offset: 0.9,
                    color: color2
                  }
                ],
                false
              ),
              shadowColor: "rgba(0, 0, 0, 0.1)",
              shadowBlur: 10
            }
          : null,
        data: d.data
      }
    })
  }

  const options = {
    title: {
      show: props.title,
      text: props.title,
      textStyle: {
        fontSize: 14,
        color: "rgb(51,133,255)"
      },
      left: "center",
      top: "1%"
    },
    color: color,
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(0,0,0,0.7)",
      borderWidth: 0,
      axisPointer: {
        type: "shadow"
      },
      textStyle: {
        color: "#fff",
        fontSize: 12
      },
      formatter: (params: any) => {
        let str = `${params[0].name} <br>`
        params.forEach((param: any) => {
          const { seriesName, value } = param
          str += `${seriesName}(${unit}) ： ${value} <br>`
        })
        return str
      }
    },
    legend: {
      show: false,
      data: legend,
      align: "right",
      top: "top",
      left: "center",
      textStyle: {
        color: "#fff",
        fontSize: 12
      },
      itemWidth: 10,
      itemHeight: 14
    },
    grid: {
      top: "15%",
      right: "5%",
      left: "2",
      bottom: "5",
      containLabel: true
    },
    xAxis: [
      {
        type: "category",
        data: xAxis,
        axisLine: {
          show: false
        },
        axisTick: {
          show: false // 是否显示坐标轴轴线
        },
        axisLabel: {
          margin: 10,
          color: "#CFDAE5",
          fontSize: 12
        }
      }
    ],
    yAxis: [
      {
        show: false
      }
    ],
    animation: true,
    animationDurationUpdate: 2000,
    series: data
  }
  chart.setOption(options)
  timer && clearInterval(timer)
  startTooltipAnimation()
}
let timer: any = null,
  currentIndex: any = 0
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

defineExpose({
  resize
})
</script>

<style lang="scss">
.chart-panel {
  // width: 100%;
  // height: 100%;
}
.empty-data {
  .el-empty__description {
    margin-top: 8px !important;
  }
}
</style>
