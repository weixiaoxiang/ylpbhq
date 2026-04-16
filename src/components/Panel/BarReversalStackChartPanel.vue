<template>
  <div
    ref="chartPanelRef"
    class="chart-panel"
    id="chart-panel"
    :style="style"
  ></div>
  <EmptyData v-show="!data" />
</template>
<!-- 柱状图-反转-堆叠 -->
<script lang="ts" setup>
import { getCurrentInstance } from "vue"
const proxy = getCurrentInstance()!.proxy as any
interface Props {
  data?: any
  title?: any
  style?: any
  gradient?: any
  colors?: any
  showLegend?: any
}
const props = withDefaults(defineProps<Props>(), {
  style: () => {
    return {
      width: "100%",
      height: "100%"
    }
  },
  gradient: false, // 是否显示渐变
  showLegend: true // 是否显示图例
})
const chartPanelRef = ref()
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
    response.data.forEach((d: any, i: number) => {
      legend.push(d.name)
      let color1, color2
      if (props.gradient) {
        if (color[i].indexOf("|") > -1) {
          color1 = color[i].split("|")[0]
          color2 = color[i].split("|")[1]
        } else {
          color1 = hexToRgba(color[i], 0.2)
          color2 = color[i]
        }
      }
      data.push({
        name: d.name,
        type: "bar",
        yAxisIndex: 0,
        barWidth: 6,
        stack: "总量",
        itemStyle: props.gradient
          ? {
              color: new proxy.$echarts.graphic.LinearGradient(
                0,
                0,
                1,
                0,
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
              // borderRadius: [0, 40, 40, 0]
            }
          : null,
        data: d.data
      })
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
      show: props.showLegend,
      data: legend,
      align: "right",
      top: "0%",
      left: "center",
      textStyle: {
        color: "#fff",
        fontSize: 10
      },
      itemWidth: 14,
      itemHeight: 10
    },
    grid: {
      top: props.showLegend ? "10%" : "5%",
      right: "12%",
      left: "6",
      bottom: "10",
      containLabel: true
    },
    xAxis: [
      {
        name: unit,
        type: "value",
        // position: "top",
        axisLine: {
          show: true,
          lineStyle: {
            color: "rgba(255,255,255,0.2)"
          }
        },
        axisLabel: {
          color: "#3a6779",
          fontSize: 12,
          formatter: (value: number) => {
            // 判断是否为整数
            return Number.isInteger(value) ? value.toString() : ""
          }
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: "rgba(255,255,255,0.2)",
            type: "dashed"
          }
        }
      }
    ],
    yAxis: [
      {
        type: "category",
        data: xAxis,
        axisLabel: {
          formatter: "{value}",
          color: "#d8ebfd",
          fontSize: 10
        },
        axisTick: {
          show: false
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: "rgba(255,255,255,0.1)",
            width: 1
          }
        },
        splitLine: {
          show: false,
          lineStyle: {
            color: "rgba(255,255,255,0.2)",
            type: "dashed"
          }
        },
        zlevel: 10
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

<style lang="scss" scoped>
.chart-panel {
  width: 100%;
  height: 100%;
}
</style>
