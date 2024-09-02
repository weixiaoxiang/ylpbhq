<template>
  <div v-if="props.show" class="custom-modal">
    <div class="origin">
      <div ref="innerRef" class="inner" @wheel="handleWheel">
        <Close class="close panzoom-exclude" @click="close" />
        <slot name="container" />
      </div>
    </div>
    <div v-if="showShade" class="shade" @click="close" />
  </div>
</template>

<script lang="ts" setup>
import Close from "@/assets/modal/close.svg?component"
import Panzoom from "@panzoom/panzoom"
interface Props {
  show: boolean
  showShade?: boolean // 是否显示遮罩
  closeOnClickModal?: boolean // 是否可以点击shade关闭modal
  disablePanzoom?: boolean // 禁用modal的缩放和平移
  disablePan?: boolean // 禁用modal的平移
  disableZoom?: boolean // 禁用modal的缩放
}
const props = withDefaults(defineProps<Props>(), {
  show: false,
  showShade: true,
  closeOnClickModal: true,
  disablePanzoom: false,
  disablePan: false,
  disableZoom: false
})
const emit = defineEmits<{
  "update:show": [boolean]
}>()

const innerRef = ref<any>()

// 关闭
const close = () => {
  if (!props.closeOnClickModal) return
  emit("update:show", false)
}
let panZoom: any = null
const handleWheel = (event: any) => {
  // 当panZoom被初始化且开启缩放时触发
  if (panZoom && !props.disableZoom) {
    // 阻止默认事件
    event.preventDefault()
    // 缩小
    if (event.deltaY < 0) {
      panZoom.zoomIn()
    } else {
      // 放大
      panZoom.zoomOut()
    }
  }
}
watchEffect(() => {
  if (props.show) {
    // 判断是否禁止panzoom
    if (!props.disablePanzoom) {
      nextTick(() => {
        panZoom = Panzoom(innerRef.value, {
          canvas: false, // false禁止在父元素中任意位置可以拖动元素
          excludeClass: "panzoom-exclude", // 设置排除项
          overflow: "initial",
          relative: false,
          startScale: 1.2
        })
        // 是否禁止pan
        if (props.disablePan) {
          panZoom.setOptions({ disablePan: true })
        }
        // 是否禁止zoom
        if (props.disableZoom) {
          panZoom.setOptions({ disableZoom: true })
        }
      })
    }
  }
})
onMounted(() => {})
onBeforeUnmount(() => {
  // 清除panzoom
  if (panZoom) {
    panZoom.destroy()
    panZoom = null
  }
})
</script>

<style lang="scss" scoped>
.custom-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  // background-color: rgba(0, 0, 0, 0.7);
  z-index: 1000;
  .origin {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
    .inner {
      .close {
        position: absolute;
        top: -10px;
        right: 0;
        transform: translateX(calc(100% + 10px));
        cursor: pointer;
      }
    }
  }
  .shade {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
  }
}
</style>
