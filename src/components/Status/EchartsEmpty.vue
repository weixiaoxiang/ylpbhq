<!-- echarts 图标暂无数据 通用组件 -->
<template>
  <el-empty :image="$fun.getAssetsImages('暂无数据.svg')" :image-size="props.imageSize">
    <template v-slot:description>
      <p style="font-size: 18px; color: #2162ac">{{ props.description }}</p>
    </template>
  </el-empty>
</template>
<script lang="ts" setup>
interface Prop {
  description?: string
  imageSize?: number
}
const props = withDefaults(defineProps<Prop>(), {
  description: "图表暂无数据",
  imageSize: 200
})
</script>
