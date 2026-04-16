<template>
  <div
    ref="chartPanelRef"
    class="chart-panel"
    id="chart-panel"
  ></div>
  <EmptyData
    v-show="!data"
    :font-size="16"
    :image-size="70"
  />
</template>

<script lang="ts" setup>
// @ts-nocheck
/* eslint-disable */
import { getCurrentInstance } from "vue"
const proxy = getCurrentInstance()!.proxy as any
interface Props {
  data?: any
  colors?: any
  unit?: string
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
  const unit = props.unit || "个"
  const color = props.colors
    ? props.colors
    : ["#68d626", "#d1338a", "#edff48", "#31b28a", "#fb5e1b", "#40d9fb", "#ff7070", "#ff9f7f", "#ff7070", "#6e81f2"]

  var datas = []
  response.forEach((value) => {
    datas.push(value.value)
  })
  var total = Math.max(...datas)
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
      formatter: `{b}（${unit}）：{c}`,
      confine: true
    },
    xAxis: {
      max: total,
      splitLine: {
        show: false
      },
      axisLine: {
        show: false
      },
      axisLabel: {
        show: false
      },
      axisTick: {
        show: false
      }
    },
    grid: {
      left: 45,
      top: "2%",
      right: 40,
      bottom: "2%",
      containLabel: true
    },
    yAxis: [
      {
        type: "category",
        inverse: false,
        data: response,
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          show: false
        }
      }
    ],
    series: [
      {
        // 内
        type: "bar",
        barWidth: 9,
        itemStyle: {
          color: new proxy.$echarts.graphic.LinearGradient(
            0,
            0,
            1,
            0,
            [
              {
                offset: 0,
                color: "#0099d2"
              },
              {
                offset: 1,
                color: hexToRgba("#0099d2", 0.3)
              }
            ],
            false
          ),
          shadowColor: "rgba(0, 0, 0, 0.1)",
          shadowBlur: 10
        },
        label: {
          show: true,
          position: "left",
          formatter: "{b}",
          color: "#fff",
          fontSize: 12
        },
        data: response,
        z: 1,
        animationEasing: "elasticOut"
      },
      {
        // 分隔
        type: "pictorialBar",
        itemStyle: {
          color: "#0e3f70"
        },
        symbolRepeat: "fixed",
        symbolMargin: 10,
        symbol: "rect",
        symbolClip: true,
        symbolSize: [1, 9],
        symbolPosition: "start",
        symbolOffset: [1, -1],
        symbolBoundingData: total,
        data: response,
        z: 2,
        animationEasing: "elasticOut"
      },
      {
        // 外边框
        type: "pictorialBar",
        symbol: "rect",
        symbolBoundingData: total,
        itemStyle: {
          color: "none"
        },
        label: {
          color: "#ffffff",
          position: "right",
          distance: 10, // 向右偏移位置
          show: true
        },
        data: datas,
        z: 0,
        animationEasing: "elasticOut"
      },
      {
        name: "外框",
        type: "bar",
        barGap: "-128%", // 设置外框粗细
        data: [
          total,
          total,
          total,
          total,
          total,
          total,
          total,
          total,
          total,
          total,
          total,
          total,
          total,
          total,
          total,
          total,
          total,
          total,
          total,
          total
        ],
        barWidth: 14,
        itemStyle: {
          color: "#0e3f70", // 填充色
          borderColor: "#076ba3", // 边框色
          borderWidth: 1, // 边框宽度
          label: {
            // 标签显示位置
            show: false,
            position: "top" // insideTop 或者横向的 insideLeft
          }
        },
        z: 0
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
