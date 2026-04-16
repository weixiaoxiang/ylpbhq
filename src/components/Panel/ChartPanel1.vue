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
  const color = props.colors ? props.colors : ["#71F28D", "#EDB53F", "#EB2927", "#9747FF", "#B90000"]
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
    title: {
      subtext: count + unit,
      subtextStyle: {
        fontSize: 20,
        color: "rgb(255, 255 ,255)"
      },
      left: "140",
      top: "48%"
    },
    graphic: [
      {
        type: "image",
        left: "150",
        top: "38%",
        style: {
          image: proxy.$fun.getImg("backgroundResources/chart-img.png"),
          width: 40,
          height: 30
        },
        bounding: "raw"
      },
      {
        type: "image",
        // 使用left和top实现居中定位
        left: "70",
        top: "center",
        style: {
          image: proxy.$fun.getImg("backgroundResources/chart-img1.png"),
          width: 200,
          height: 200
        },
        bounding: "raw"
      }
    ],
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
      orient: "vertical",
      icon: "circle",
      top: "center",
      right: "2%",
      itemWidth: 14,
      itemHeight: 10,
      data: legend,
      formatter: (name: string) => {
        const value = response.find((d) => d.name === name)?.value
        return name + "（" + value + unit + "）"
      },
      textStyle: {
        color: "#fft",
        fontSize: 12
      }
    },
    series: [
      {
        type: "pie",
        center: ["40%", "50%"],
        radius: ["40%", "58%"],
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
