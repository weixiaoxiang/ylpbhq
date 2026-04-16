<template>
  <div
    ref="chartPanelRef"
    class="chart-panel"
    id="chart-panel"
  ></div>
  <EmptyData v-show="!data" />
</template>
<!-- 空心圆饼图 -->
<script lang="ts" setup>
// @ts-nocheck
/* eslint-disable */
import { getCurrentInstance } from "vue"
const proxy = getCurrentInstance()!.proxy as any
interface Props {
  data?: any
  title?: any
  colors?: any
  gradient?: any
  showLabel?: any
  showLegend?: any
  dw?: any
}
const props = withDefaults(defineProps<Props>(), {
  gradient: true, // 是否显示渐变
  showLabel: false, // 是否显示标签
  showLegend: true // 是否显示图例
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
  const unit = props.dw || "个"
  const color = props.colors ? props.colors : ["#71F28D", "#EDB53F", "#EB2927", "#9747FF", "#B90000"]
  let count = 0
  const data = response.map((d, i) => {
    count += d.value
    return {
      name: d.name,
      value: d.value,
      itemStyle: {
        color: props.gradient
          ? new proxy.$echarts.graphic.LinearGradient(
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
                  offset: 0.8,
                  color: hexToRgba(color[i], 0.1)
                }
              ],
              false
            )
          : color[i]
      }
    }
  })
  const legend: any = response.map((d) => d.name)
  const func = (params) => {
    if (params.name !== "") {
      return params.name + ":" + params.value + "\n" + params.percent + "%"
    } else {
      return ""
    }
  }
  const options = {
    title: {
      show: props.title,
      text: props.title,
      textStyle: {
        fontSize: 16,
        color: "rgb(255, 255 ,255)"
      },
      textAlign: "center",
      subtext: count,
      subTextAlign: "center",
      subtextStyle: {
        fontSize: 16,
        color: "rgb(255, 255 ,255)"
      },
      left: "48%",
      top: props.showLegend ? "30%" : "40%"
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
      formatter: `{b}（${unit}）：{c}`,
      confine: true
    },
    legend: {
      show: props.showLegend,
      orient: "horizontal",
      icon: "rect",
      bottom: "10",
      left: "center",
      itemWidth: 14,
      itemHeight: 10,
      data: legend,
      textStyle: {
        color: "#fff",
        fontSize: 10
      }
    },
    series: [
      {
        type: "pie",
        center: props.showLegend ? ["50%", "40%"] : ["50%", "50%"],
        radius: ["50%", "70%"],
        label: {
          show: props.showLabel,
          formatter: func,
          fontSize: 10, //此处修改字体大小
          lineHeight: 16,
          color: "inherit"
        },
        labelLine: {
          show: props.showLabel,
          length: 6, //引导线的长度
          length2: 16,
          color: "#ffffff",
          lineStyle: {
            width: 1 //引导线的宽度
          }
        },
        labelLayout: {
          draggable: true
        },
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)"
          }
        }
      },
      {
        type: "pie",
        center: props.showLegend ? ["50%", "40%"] : ["50%", "50%"],
        radius: ["75%", "78%"],
        itemStyle: {
          shadowBlur: 2,
          shadowColor: "rgba(0, 118, 239,1)",
          color: "#3e5d7b"
        },
        label: {
          show: false
        },
        tooltip: {
          show: false
        },
        data: [1000]
      }
    ],
    animation: true,
    animationDurationUpdate: 2000
  }
  chart.setOption(options)
  timer && clearInterval(timer)
  startTooltipAnimation()
}
let timer: any = null,
  currentIndex: any = 0
// 开始tooltip动画，高亮和选中当前项
const startTooltipAnimation = () => {
  if (!chart) return

  const dataLen = chart.getOption().series[0].data.length
  if (dataLen === 0) return

  let lastIndex = -1 // 记录上一次选中的索引

  const showTipAndSelect = (index: number) => {
    // 清除上一次的选中和高亮状态
    if (lastIndex !== -1) {
      chart.dispatchAction({
        type: "downplay",
        seriesIndex: 0,
        dataIndex: lastIndex
      })
      chart.dispatchAction({
        type: "unselect",
        seriesIndex: 0,
        dataIndex: lastIndex
      })
    }

    // 高亮和选中当前项
    chart.dispatchAction({
      type: "highlight",
      seriesIndex: 0,
      dataIndex: index
    })

    chart.dispatchAction({
      type: "showTip",
      seriesIndex: 0,
      dataIndex: index
    })

    chart.dispatchAction({
      type: "select",
      seriesIndex: 0,
      dataIndex: index
    })

    lastIndex = index // 更新上一次选中的索引
  }

  // 初始显示
  showTipAndSelect(currentIndex)
  currentIndex = (currentIndex + 1) % dataLen

  // 定时切换显示
  timer = setInterval(() => {
    showTipAndSelect(currentIndex)
    currentIndex = (currentIndex + 1) % dataLen
  }, 3000)
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
