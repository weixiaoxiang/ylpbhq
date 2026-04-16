<template>
  <div
    ref="chartPanelRef"
    class="chart-panel"
    id="chart-panel"
    :style="style"
  ></div>
  <EmptyData v-show="!data" />
</template>
<!-- 线图 -->
<script lang="ts" setup>
// import { hexToRgba } from "@/utils/format"
import { getCurrentInstance } from "vue"
const proxy = getCurrentInstance()!.proxy as any
interface Props {
  data?: any
  style?: any
  colors?: any
  path?: any
  symbol?: "circle" | "rect" | "roundRect" | "none"
  symbolSize?: number
  xAxisRotate?: any
  // custom1: 最后两个字换行 2: 每行显示2个字 3: 每行显示3个字 ....
  lineBreak?: "" | "2" | "3" | "custom1"
  nodeShadow?: any
  lineDashed?: any
  tooltipTotal?: any
  areaBackground?: any
  openEffect?: any
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
  path: undefined, // symbol路径
  symbol: "circle", // 节点样式
  symbolSize: 8, // 节点大小
  nodeShadow: false, // 是否显示节点阴影
  lineDashed: true, // 是否显示虚线
  tooltipTotal: false, // 是否显示tooltip合计数
  areaBackground: false, //是否显示区域背景
  openEffect: false
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
  const color = props.colors ? props.colors : ["#faba5a", "#7ecffd", "#01B3FF", "#9747FF"]
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
        symbol: props.path ? props.path : props.symbol,
        symbolSize: props.symbolSize,
        smooth: props.openEffect ? false : true,
        lineStyle: {
          color: color[i],
          type: props.lineDashed ? "dashed" : "solid"
        },
        itemStyle: {
          color: props.path ? "transparent" : color[i],
          borderColor: props.path ? color[i] : "#fff",
          borderWidth: 1,
          shadowBlur: props.nodeShadow ? 10 : 0, // 设置阴影模糊大小
          shadowColor: color[i], // 设置阴影颜色
          shadowOffsetX: 0, // 设置阴影 X 轴偏移
          shadowOffsetY: 0 // 设置阴影 Y 轴偏移
        },
        areaStyle: props.areaBackground
          ? {
              color: new proxy.$echarts.graphic.LinearGradient(
                0,
                0,
                0,
                1,
                [
                  {
                    offset: 0,
                    color: color[i]
                  },
                  {
                    offset: 1,
                    color: hexToRgba(color[i], 0.1)
                  }
                ],
                false
              ),
              shadowColor: "rgba(0, 0, 0, 0.1)",
              shadowBlur: 10
            }
          : null,
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
        color: "#fff",
        fontSize: 12
      },
      formatter: (params: any) => {
        let str = `${params[0].name} <br>`
        let unitStr = ""
        if (unit) {
          unitStr = `（${unit}）`
        }
        // 开启合计数
        if (props.tooltipTotal) {
          let total = 0
          params.forEach((param: any) => {
            total += param.value
          })
          str += `合计${unitStr} ： ${total} <br>`
        }
        params.forEach((param: any) => {
          const { seriesName, value } = param
          str += `${seriesName}${unitStr} ： ${value} <br>`
        })
        return str
      },
      confine: true
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
      itemWidth: 18,
      itemHeight: 10
    },
    grid: {
      top: "15%",
      right: "5%",
      left: "10",
      bottom: "5",
      containLabel: true
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
          rotate: props.xAxisRotate ? -45 : 0,
          // 文字换行, 适用于x轴文字过长
          formatter: (value: any) => {
            if (props.lineBreak) {
              // 每行显示3个字
              if (props.lineBreak === "3") {
                return value.match(/.{1,3}/g).join("\n")
              }
              // 每行显示2个字
              if (props.lineBreak === "2") {
                return value.match(/.{1,2}/g).join("\n")
              }
              // 自定义换行
              if (props.lineBreak === "custom1") {
                // 最后两个字换行
                if (value.length > 2) {
                  return value.substring(0, value.length - 2) + "\n" + value.substring(value.length - 2)
                } else {
                  return value
                }
              }
            } else {
              return value
            }
          }
          // interval: 0
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
    animation: true,
    animationDurationUpdate: 2000,
    series: data
  }
  if (props.openEffect) {
    const effects: any = []
    response?.data.forEach((item: any, index: number) => {
      const arr = item?.data.map((i: any) => {
        return [i.label, i.value]
      })

      if (arr.length < 3) return
      effects.push({
        name: item.name,
        type: "lines",
        coordinateSystem: "cartesian2d",
        symbolSize: 10,
        polyline: true,
        effect: {
          show: true,
          period: 10,
          trailLength: 0.4,
          symbolSize: 6,
          symbol: "circle",
          color: color[index]
        },
        lineStyle: {
          width: 1,
          opacity: 0
        },
        // 光点
        data: [
          {
            coords: arr
          }
        ]
      })
    })

    options.series.push(...effects)
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
</script>

<style lang="scss" scoped>
.chart-panel {
  // width: 100%;
  // height: 100%;
}
</style>
