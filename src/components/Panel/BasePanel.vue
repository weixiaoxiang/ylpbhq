<script lang="ts" setup>
interface Props {
  title: string
}
withDefaults(defineProps<Props>(), {
  title: "基础面板"
})
</script>

<template>
  <div class="base-panel flex h-full flex-col">
    <PanelTitle :title="title" />
    <div class="panel-contain flex-1 overflow-hidden p-2">
      <slot name="contain" />
    </div>
  </div>
</template>

<style scoped>
.base-panel {
  background: url("@/assets/images/panel-bg.png") no-repeat center center/100% 100%;
}
</style>
