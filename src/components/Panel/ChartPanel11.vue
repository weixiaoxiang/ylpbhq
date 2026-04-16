<template>
  <div
    ref="chartPanelRef"
    class="chart-panel"
    id="chart-panel"
    :style="style"
  ></div>
  <EmptyData v-show="!data" />
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

  let xAxisData = response.map((item: any) => item.name)
  let seriesData = response.map((item: any) => item.value)

  let colors1 = ["#1F6CC5", "#2FD2CA", "#5A8AC1", "#2FD2CA"]
  let colors2 = ["#1F6CC51A", "#2FD2CA00", "#232E4000", "#2FD2CA00"]
  const option = {
    backgroundColor: "#09224e",
    grid: {
      left: "5%",
      right: "5%",
      top: "15%",
      bottom: "5%",
      containLabel: true
    },
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
      formatter: `{b}（亩）：{c}`,
      confine: true
    },
    xAxis: {
      data: xAxisData,
      axisTick: {
        show: false
      },
      axisLine: {
        show: false
      },
      axisLabel: {
        textStyle: {
          color: "#d1dae5"
        },
        interval: 0,
        fontSize: 12
      }
    },
    yAxis: {
      name: "单位：亩",
      type: "value",
      splitLine: {
        show: true,
        lineStyle: {
          color: "#4b596f",
          opacity: 1,
          type: "dashed"
        }
      },
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: {
        show: true,
        textStyle: {
          color: "#ffffff"
        }
      }
    },
    series: [
      {
        name: "hill",
        type: "pictorialBar",
        barCategoryGap: "5%",
        symbolClip: true,
        symbol: "path://M0,10 L10,10 C5.5,10 5.5,5 5,0 C4.5,5 4.5,10 0,10 z",
        itemStyle: {
          normal: {
            color: function (params: any) {
              return {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: colors1[params.dataIndex]
                  },
                  {
                    offset: 1,
                    color: colors2[params.dataIndex]
                  }
                  // {
                  //    offset: 1,
                  //    color: 'rgba(13,8,16,0)'
                  // }
                ],
                global: false //  缺省为  false
              }
            },
            borderColor: "#999",
            borderWidth: 1
          },
          emphasis: {
            opacity: 1
          }
        },
        // 图形上方描述文字
        label: {
          show: true,
          position: "top",
          offset: [0, 0],
          fontSize: 12,
          formatter: function (params: any) {
            let index = params.dataIndex
            let str = "{a" + index + "|" + params.value + "}"
            return str
          },
          rich: {
            a0: {
              color: "#2782EB",
              align: "center"
            },
            a1: {
              color: "#53FFF1",
              align: "center"
            },
            a2: {
              color: "#2782EB",
              align: "center"
            },
            a3: {
              color: "#53FFF1",
              align: "center"
            }
          }
        },
        emphasis: {
          itemStyle: {
            opacity: 1
          }
        },
        data: seriesData,
        z: 10
      }
    ]
  }
  chart.setOption(option)
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

<style lang="scss" scoped>
.chart-panel {
  // width: 100%;
  // height: 100%;
}
</style>
