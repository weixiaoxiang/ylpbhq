<script lang="ts" setup>
// import { propTypes } from "@/utils/propTypes";
import { isNumber } from "@/utils/is.ts"

// eslint-disable-next-line vue/no-reserved-component-names
defineOptions({ name: "Dialog" })

const slots: any = useSlots()

// const props = defineProps({
//   modelValue: propTypes.bool.def(false),
//   title: propTypes.string.def("Dialog"),
//   showFullscreen: propTypes.bool.def(true),
//   isCenter: propTypes.bool.def(false),
//   appendToBody: propTypes.bool.def(false),
//   w: propTypes.oneOfType([String, Number]).def("40%"),
//   scroll: propTypes.bool.def(false), // 是否开启滚动条。如果是的话，按照 maxHeight 设置最大高度
//   maxHeight: propTypes.oneOfType([String, Number]).def("300px"),
// });
const props = defineProps([
  "modelValue",
  "isBg",
  "title",
  "showFullscreen",
  "isCenter",
  "appendToBody",
  "w",
  "scroll",
  "maxHeight"
])

const getBindValue = computed(() => {
  const delArr: string[] = ["showFullscreen", "title", "w", "maxHeight", "appendToBody", "isCenter"]
  const attrs = useAttrs()
  const obj: any = { ...attrs, ...props }
  for (const key in obj) {
    if (delArr.indexOf(key) !== -1) {
      delete obj[key]
    }
  }
  return obj
})

const isFullscreen = ref(false)

const toggleFull = () => {
  isFullscreen.value = !unref(isFullscreen)
}

const dialogHeight = ref(isNumber(props.maxHeight) ? `${props.maxHeight}px` : props.maxHeight)

watch(
  () => isFullscreen.value,
  async (val: boolean) => {
    // 计算最大高度
    await nextTick()
    if (val) {
      const windowHeight = document.documentElement.offsetHeight
      dialogHeight.value = `${windowHeight - 55 - 60 - (slots.footer ? 63 : 0)}px`
    } else {
      dialogHeight.value = isNumber(props.maxHeight) ? `${props.maxHeight}px` : props.maxHeight
    }
  },
  {
    immediate: true
  }
)

const dialogStyle = computed(() => {
  return {
    height: unref(dialogHeight)
  }
})
</script>

<template>
  <ElDialog
    :width="w"
    :center="isCenter"
    destroy-on-close
    lock-scroll
    v-bind="getBindValue"
    :close-on-click-modal="false"
    :append-to-body="appendToBody"
    :class="{ bacDef: props.isBg }"
  >
    <template #header>
      <div class="flex justify-between">
        <slot name="title">
          {{ title }}
        </slot>
      </div>
    </template>

    <!-- 情况一：如果 scroll 为 true，说明开启滚动条 -->
    <ElScrollbar
      v-if="scroll"
      :style="dialogStyle"
    >
      <slot></slot>
    </ElScrollbar>
    <!-- 情况二：如果 scroll 为 false，说明关闭滚动条滚动条 -->
    <slot v-else></slot>

    <template
      v-if="slots.footer"
      #footer
    >
      <slot name="footer"></slot>
    </template>
  </ElDialog>
</template>

<style lang="scss">
.bacDef {
  // background: #f5f7fa !important;

  .el-dialog__body {
    padding: 10px;
    max-height: 600px;
    overflow: scroll;
    background: #f5f7fa !important;
  }

  .el-dialog__body::-webkit-scrollbar {
    width: 0;
  }
}

.el-dialog {
  position: absolute !important;
  top: 50% !important;
  left: 50% !important;
  display: flex !important;
  flex-direction: column !important;
  max-height: 80vh !important;
  margin: 0 !important;
  overflow-y: auto !important;
  transform: translate(-50%, -50%) !important;
}

.el-dialog__header {
  margin-right: 0 !important;
  border-bottom: 1px solid var(--tags-view-border-color);
}

.el-dialog__body {
  padding: 10px 20px;
  height: 100%;
  // overflow-y: scroll;
}

.el-dialog__footer {
  border-top: 1px solid var(--tags-view-border-color);
}

.is-hover {
  &:hover {
    color: var(--el-color-primary) !important;
  }
}
</style>
