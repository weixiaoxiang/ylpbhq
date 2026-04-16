<!-- 暂无数据 通用组件 -->
<template>
  <el-empty
    :image="IMG"
    :image-size="props.imageSize"
  >
    <template v-slot:description>
      <p
        :style="{
          fontSize: props.fontSize + 'px'
        }"
        style="color: #2162ac"
      >
        {{ props.description }}
      </p>
    </template>
  </el-empty>
</template>
<script lang="ts" setup>
import IMG from "./暂无数据.svg"
interface Prop {
  description?: string
  imageSize?: number
  fontSize?: number
}
const props = withDefaults(defineProps<Prop>(), {
  description: "当前暂无数据",
  imageSize: 100,
  fontSize: 18
})
</script>
<style lang="scss" scoped>
.el-empty {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: max-content;
}
</style>
