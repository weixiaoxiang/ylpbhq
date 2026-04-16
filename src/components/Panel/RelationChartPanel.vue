<template>
  <div
    ref="chartPanelRef"
    class="chart-panel"
    id="chart-panel"
    :style="style"
  ></div>
  <EmptyData v-show="!data" />
</template>
<!-- 关系图 -->
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
const emit = defineEmits<{
  chartClick: [any]
}>()

const chartPanelRef = ref("")
let chart: any = null
const initChart = async () => {
  if (!chart) {
    chart = proxy.$echarts.init(chartPanelRef.value, null, {
      devicePixelRatio: 2.5
    })
  }
  // 添加节点点击事件
  chart.on("click", (params: any) => {
    const customData = params.data.customData
    if (customData) {
      // 触发父组件事件
      emit("chartClick", customData)
    }
  })
  window.addEventListener("resize", resize)
}
const resize = () => {
  if (chart) {
    chart.resize()
  }
}
// 扁平化处理节点
const flattenTree = (nodes: any[]): any[] => {
  const result: any[] = []
  const stack = [...nodes]

  while (stack.length) {
    const node = stack.pop()
    if (node) {
      result.push(node)
      if (node.children) {
        stack.push(...node.children)
      }
    }
  }
  return result
}
const config: any = {
  界: {
    symbolSize: 120,
    cateSymbol: "image://" + proxy.$fun.getImg("backgroundResources/界.png"),
    color: "#4335A7"
  },
  门: {
    symbolSize: 60,
    cateSymbol: "image://" + proxy.$fun.getImg("backgroundResources/门.png"),
    color: "#4335A7"
  },
  纲: {
    symbolSize: 50,
    cateSymbol: "image://" + proxy.$fun.getImg("backgroundResources/纲.png"),
    color: "#4335A7"
  },
  目: {
    symbolSize: 45,
    cateSymbol: "image://" + proxy.$fun.getImg("backgroundResources/目.png"),
    color: "#4335A7"
  },
  科: {
    symbolSize: 40,
    cateSymbol: "image://" + proxy.$fun.getImg("backgroundResources/科.png"),
    color: "#4335A7"
  },
  属: {
    symbolSize: 35,
    cateSymbol: "image://" + proxy.$fun.getImg("backgroundResources/属.png"),
    color: "#4335A7"
  },
  种: {
    symbolSize: 25,
    cateSymbol: "image://" + proxy.$fun.getImg("backgroundResources/种.png"),
    color: "#4335A7"
  }
}
const setOption = async () => {
  let myGraphData,
    nodeData: any[] = [],
    linksData: any[] = [],
    categories: any[] = [],
    legendData: any[] = []
  if (!props.data) {
    chart = null
    return
  } else {
    // 扁平化处理节点
    myGraphData = flattenTree([props.data])
    console.log(myGraphData)

    myGraphData.forEach((item: any) => {
      // 必须物种名不能重复
      if (item.level === "种") {
        // 生成节点数据
        nodeData.push({
          name: item.name,
          // symbol: "image://https://picsum.photos/200/200",
          symbolSize: config[item.level].symbolSize,
          category: item.level,
          customData: {
            id: item.id,
            name: item.name,
            level: item.level
          },
          draggable: true
        })
      } else {
        // 生成节点数据
        nodeData.push({
          name: item.name,
          symbolSize: config[item.level].symbolSize,
          category: item.level,
          draggable: true
        })
      }

      // 生成分类数据
      categories.push({
        name: item.level,
        symbol: config[item.level].cateSymbol
      })
      // 生成图例数据
      legendData.push({
        name: item.level,
        icon: config[item.level].cateSymbol
      })
      // 生成连线数据
      if (item.children) {
        item.children.forEach((child: any) => {
          linksData.push({
            source: item.name,
            target: child.name,
            lineStyle: {
              color: "#65fed6" //"source"
            }
          })
        })
      }
    })
  }

  // return
  let options = {
    tooltip: {
      backgroundColor: "rgba(0,0,0,0.7)",
      borderWidth: 0,
      axisPointer: {
        type: "shadow"
      },
      textStyle: {
        color: "#fff",
        fontSize: 12
      },
      formatter: "{b}"
    },
    legend: {
      show: true,
      data: legendData,
      backgroundColor: "rgba(0,0,0,0.7)",
      borderWidth: 0,
      textStyle: {
        color: "#15B392"
      },
      orient: "horizontal",
      left: "center",
      bottom: 10,
      itemWidth: 16,
      itemHeight: 16
    },
    animationDuration: 0,
    animationEasingUpdate: "quinticInOut",
    series: [
      {
        name: "知识图谱",
        type: "graph",
        layout: "force",
        force: {
          repulsion: 300, // 节点排斥力
          gravity: 0.15, // 节点重力
          edgeLength: 15, // 连线长度
          layoutAnimation: true // 布局动画
        },
        data: nodeData,
        links: linksData,
        categories: categories,
        roam: true, // 是否开启拖拽
        label: {
          show: true,
          position: "bottom",
          formatter: "{b}",
          fontSize: 10,
          fontStyle: "600",
          color: "#4afef1"
        },
        lineStyle: {
          opacity: 0.9,
          width: 1.5,
          curveness: 0
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
}
</style>
