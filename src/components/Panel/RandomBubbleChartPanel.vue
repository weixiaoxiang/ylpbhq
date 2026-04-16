<template>
  <div
    ref="chartPanelRef"
    class="chart-panel"
    id="chart-panel"
    :style="style"
  ></div>
  <EmptyData v-show="!data" />
</template>
<!-- 随机气泡图 -->
<script lang="ts" setup>
import { getCurrentInstance } from "vue"
const proxy = getCurrentInstance()!.proxy as any
interface Props {
  data?: any
  title?: any
  style?: any
}
const props = withDefaults(defineProps<Props>(), {
  style: () => {
    return {
      width: "100%",
      height: "100%"
    }
  }
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
  const color = ["#71F28D", "#EDB53F", "#EB2927", "#9747FF", "#B90000"]
  let data: any = []
  if (response?.length === 0) {
    chart = null
    return
  } else {
    const symbol1 = "image://" + proxy.$fun.getImg("backgroundResources/c2.png")
    const symbol2 = "image://" + proxy.$fun.getImg("backgroundResources/c3.png")
    const colors = ["#23C280", "#0BABC7"]
    const minSize = 50,
      maxSize = 75
    // 获取最大值和最小值
    const maxValue = Math.max(...response.map((item: any) => item.value))
    const minValue = Math.min(...response.map((item: any) => item.value))
    response.forEach((item: any, i: number) => {
      // 计算线性映射的symbolSize
      const symbolSize = minSize + ((item.value - minValue) / (maxValue - minValue)) * (maxSize - minSize)

      data.push({
        name: item.label,
        symbol: i % 2 === 0 ? symbol1 : symbol2,
        symbolSize: symbolSize,
        value: item.value,
        label: {
          show: true,
          lineHeight: 18,
          // 居中
          align: "center",
          verticalAlign: "middle",
          formatter: (params: any) => {
            return `{name|${params.name}}\n{value|${params.value}棵}`
          },
          rich: {
            name: {
              fontSize: 14,
              // color: i % 2 === 0 ? colors[0] : colors[1]
              color: "#eee",
              fontWeight: "bold"
            },
            value: {
              fontSize: 14,
              // color: i % 2 === 0 ? colors[0] : colors[1],
              color: "#eee",
              fontWeight: "bold",
              fontStyle: "oblique"
            }
          }
        }
      })
    })
  }

  const options = {
    color: color,
    animation: true,
    animationDurationUpdate: 2000,
    series: [
      {
        type: "graph",
        layout: "force",
        draggable: true,
        force: {
          repulsion: [80, 120], // 修改为范围值，使节点之间的排斥力动态变化
          gravity: 0.1, // 增加重力使运动更明显
          edgeLength: [30, 50], // 修改为范围值，使连线长度动态变化
          friction: 0.1, // 添加摩擦力，使运动更自然
          layoutAnimation: true
        },
        roam: false, // 允许缩放和平移
        symbol: "circle",
        symbolSize: 0,
        width: 60,
        height: 60,
        data: data,
        itemStyle: {
          borderColor: "#fff",
          borderWidth: 2,
          shadowColor: "rgba(124, 245, 255, 0.1)",
          shadowBlur: 20
        },
        // 添加动画配置
        animationDuration: 1000,
        animationEasing: "cubicOut",
        animationDelay: function (idx: number) {
          return idx * 100
        }
      }
    ]
  }
  chart.setOption(options)
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
      chart.dispose()
      chart = null
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
  if (chart) {
    window.removeEventListener("resize", resize)
    chart.dispose()
    chart = null
    chartPanelRef.value = ""
  }
})

defineExpose({
  resize
})
</script>

<style lang="scss" scoped>
.chart-panel {
  // width: 100%;
  // height: 100%;
  position: relative;
  z-index: 1;
}
</style>
