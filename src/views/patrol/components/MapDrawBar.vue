<script lang="ts" setup>
interface Props {
  map: any
  loadFeatures?: any[] | null
  style?: { [key: string]: string }
  type?: string
}
const props = withDefaults(defineProps<Props>(), {
  map: null,
  loadFeatures: null, // 需要加载的数据
  style: () => {
    return {
      position: "absolute",
      top: "20px",
      left: "50%",
      transform: "translateX(-50%)"
    }
  },
  type: "新增路线"
})
const emit = defineEmits<{
  change: [any]
}>()
// "drawPoint", "drawLine", "drawPolygon", "openSelect","openModify", "removeSelect", "removeAll"
const tools: any = computed(() => {
  if (props.type === "新增路线") {
    return ["drawPoint", "drawLine", "openModify", "removeSelect", "removeAll"]
  }
  if (props.type === "编辑路线") {
    return ["openModify"]
  }
  return []
})
const { drawData, drawPoint, drawLine, drawPolygon, openSelect, openModify, removeSelect, removeAll, openBarTip } =
  useMapDrawBar(toRaw(props.map), {
    loadFeatures: props.loadFeatures,
    onlySigle: false
  })
watch(
  () => drawData,
  (val) => {
    // DrawBar组件的数据变化时，将数据传递给父组件
    emit("change", val)
  },
  {
    deep: true
  }
)
watch(
  () => props.type,
  (val) => {
    if (val === "新增路线" || val === "编辑路线") {
      openBarTip()
    }
  },
  {
    deep: true,
    immediate: true
  }
)
</script>
<template>
  <div
    class="map-draw-bar"
    :style="style"
  >
    <div
      v-if="tools.includes('drawPoint')"
      class="draw-bar-item"
      title="绘制点"
      @click="drawPoint"
    >
      <img
        src="./icon/画点.png"
        alt=""
      />
    </div>
    <div
      v-if="tools.includes('drawLine')"
      class="draw-bar-item"
      title="绘制线"
      @click="drawLine"
    >
      <img
        src="./icon/画线.png"
        alt=""
      />
    </div>
    <div
      v-if="tools.includes('drawPolygon')"
      class="draw-bar-item"
      title="绘制面"
      @click="drawPolygon"
    >
      <img
        src="./icon/画面.png"
        alt=""
      />
    </div>
    <div
      v-if="tools.includes('openSelect')"
      class="draw-bar-item"
      title="选中"
      @click="openSelect"
    >
      <img
        src="./icon/选择.png"
        alt=""
      />
    </div>
    <div
      v-if="tools.includes('openModify')"
      class="draw-bar-item"
      title="选中并编辑"
      @click="openModify"
    >
      <img
        src="./icon/选择编辑.png"
        alt=""
      />
    </div>
    <div
      v-if="tools.includes('removeSelect')"
      class="draw-bar-item"
      title="删除选中"
      @click="removeSelect"
    >
      <img
        src="./icon/删除选中.png"
        alt=""
      />
    </div>
    <div
      v-if="tools.includes('removeAll')"
      class="draw-bar-item"
      title="删除全部"
      @click="removeAll"
    >
      <img
        src="./icon/删除全部.png"
        alt=""
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.map-draw-bar {
  user-select: none;
  display: flex;
  gap: 10px;
  z-index: 999;
  .draw-bar-item {
    width: 32px;
    height: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #ffffff;
    padding: 5px;
    border-radius: 4px;
    box-shadow: 0 0 5px 1px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    img {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
