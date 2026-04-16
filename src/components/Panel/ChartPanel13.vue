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
import centreImg from "@/assets/images/forestResources/check_bg.png"
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

const setOption = async () => {
  const response = props.data
  var data = response
  const option = {
    backgroundColor: "transparent",
    color: ["#00E3FF", "#D0AE3E"],
    grid: {
      top: "-10%",
      right: 0,
      bottom: 0,
      left: 0,
      containLabel: true
    },
    legend: {
      show: false
    },
    tooltip: {
      show: false
    },
    emphasis: {
      // 设置高亮时显示标签
      scale: false // 设置高亮时放大图形
    },
    graphic: {
      elements: [
        {
          type: "image",
          z: 3,
          style: {
            image: centreImg,
            width: 187,
            height: 115
          },
          left: "center",
          top: "center"
        }
      ]
    },
    series: [
      {
        type: "pie",
        hoverOffset: 25,
        startAngle: 180, // 起始角度
        clockwise: false, // 是否顺时针
        radius: ["98%", "92%"],
        center: ["50%", "50%"],
        avoidLabelOverlap: true,
        label: {
          show: false,
          formatter: "{b}: {d}"
        },
        data: data,
        zlevel: 40
      }
    ]
  }
  chart.setOption(option)
  // timer && clearInterval(timer)
  // startTooltipAnimation()
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
  // timer = setInterval(() => {
  //     chart.dispatchAction({
  //         type: "showTip",
  //         seriesIndex: 0,
  //         dataIndex: currentIndex
  //     })
  //     currentIndex = (currentIndex + 1) % dataLen
  // }, 3000) // 每3秒移动一次
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
  // background: url('@/assets/images/forestResources/check_bg.png') no-repeat;
  // background-size: 100% 100%;
}
</style>
