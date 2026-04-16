<template>
  <div
    ref="chartPanelRef"
    class="chart-panel"
    id="chart-panel"
  ></div>
  <EmptyData v-show="!data" />
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
    : ["#68d626", "#d1338a", "#edff48", "#31b28a", "#fb5e1b", "#40d9fb", "#ff7070", "#ff9f7f", "#6e81f2", "#6e81f2"]
  let count = 0
  const data = response.map((d, i) => {
    count += d.value
    return {
      name: d.name,
      value: d.value,
      itemStyle: {
        color: color[i]
      }
    }
  })
  const legend: any = response.map((d) => d.name)
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
    legend: {
      show: true,
      type: "scroll",
      orient: "vertical",
      icon: "rect",
      top: "center",
      right: "2%",
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 8,
      data: legend,
      formatter: (name: string) => {
        const value = response.find((d) => d.name === name)?.value
        return name + "（" + value + unit + "）"
      },
      textStyle: {
        color: "#fft",
        fontSize: 12
      },
      ...{
        pageButtonItemGap: 5, // 翻页按钮之间的间距
        pageButtonGap: 5, // 翻页按钮与图例之间的间距
        pageButtonPosition: "end", // 翻页按钮位置：'start' | 'end'
        pageIconColor: "#fff", // 翻页按钮颜色
        pageIconInactiveColor: "rgba(255,255,255,0.3)", // 翻页按钮禁用颜色
        pageIconSize: 12, // 翻页按钮大小
        pageTextStyle: {
          color: "#fff",
          fontSize: 12
        }
      }
    },
    series: [
      {
        type: "pie",
        center: ["35%", "50%"],
        radius: ["55%", "80%"],
        label: {
          show: false,
          fontSize: 10, //此处修改字体大小
          lineHeight: 16,
          color: "inherit"
        },
        labelLine: {
          show: false,
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
        },
        select: {
          disabled: false,
          itemStyle: {
            borderWidth: 2,
            borderColor: "#fff",
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
            scale: true
          }
        }
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
