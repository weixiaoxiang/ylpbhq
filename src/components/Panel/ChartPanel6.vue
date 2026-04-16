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
import { graphic } from "echarts"
import { getCurrentInstance } from "vue"
const proxy = getCurrentInstance()!.proxy as any
interface Props {
  data?: any
  dw?: any
  colors?: any
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
  const unit = props.dw || "个"
  const color = props.colors ? props.colors : ["#71F28D", "#EDB53F", "#EB2927", "#9747FF", "#B90000"]
  const data = response.map((d, i) => {
    return {
      name: d.name,
      value: d.value,
      itemStyle: {
        color: color[i]
      }
    }
  })
  const iconLegend = [
    {
      name: "交通",
      icon: "image://" + proxy.$fun.getImg("bigDataAnalysis/i30.png")
    },
    {
      name: "耕地",
      icon: "image://" + proxy.$fun.getImg("bigDataAnalysis/i31.png")
    },
    {
      name: "水域",
      icon: "image://" + proxy.$fun.getImg("bigDataAnalysis/i32.png")
    },
    {
      name: "其他",
      icon: "image://" + proxy.$fun.getImg("bigDataAnalysis/i33.png")
    },
    {
      name: "草地",
      icon: "image://" + proxy.$fun.getImg("bigDataAnalysis/i34.png")
    },
    {
      name: "林地",
      icon: "image://" + proxy.$fun.getImg("bigDataAnalysis/i35.png")
    },
    {
      name: "园地",
      icon: "image://" + proxy.$fun.getImg("bigDataAnalysis/i36.png")
    },
    {
      name: "建筑",
      icon: "image://" + proxy.$fun.getImg("bigDataAnalysis/i37.png")
    }
  ]
  const legend: any = response.map((d) => {
    return {
      name: d.name,
      icon: iconLegend.find((i) => i.name === d.name)?.icon
    }
  })
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
      orient: "vertical",
      icon: "rect",
      top: "center",
      right: "10",
      width: 20,
      height: 150,
      itemWidth: 14,
      itemHeight: 30,
      data: legend,
      textStyle: {
        color: "#fff",
        fontSize: 12,
        lineHeight: 14
      },
      formatter: (name: string) => {
        const value = response.find((d) => d.name === name)?.value
        return name + "\n" + value + unit
      }
    },
    series: [
      {
        type: "pie",
        center: ["30%", "50%"],
        radius: ["68%", "78%"],
        label: {
          show: false
        },
        labelLine: {
          show: false
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
        zlevel: 3
      },
      {
        center: ["30%", "50%"],
        radius: ["50%", "68%"],
        type: "pie",
        label: {
          show: false
        },
        emphasis: {
          show: false
        },
        labelLine: {
          show: false
        },
        animation: false,
        tooltip: {
          show: false
        },
        itemStyle: {
          opacity: 0.3
        },
        data: data,
        zlevel: 2
      },
      {
        type: "pie",
        emphasis: {
          show: false
        },
        center: ["30%", "50%"],
        radius: ["0%", "0%"],
        labelLine: {
          show: false //指示线隐藏
        },
        label: {
          show: true,
          position: "center",
          formatter: [
            "{a|}" // 使用富文本标记设置文字样式和背景图片
          ].join("\n"),
          rich: {
            a: {
              fontSize: 12,
              width: 60, // 设置背景图片宽度
              height: 60, // 设置背景图片高度
              backgroundColor: {
                image: proxy.$fun.getImg("bigDataAnalysis/i38.png") // 设置背景图片
              }
            }
          }
        },
        data: data
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
