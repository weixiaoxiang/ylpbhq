<script lang="ts" setup>
interface Props {
  title?: string
  subTitle?: string
  initType?: string
  btns?: string[]
  types?: string[]
  initSelect?: string
  selectList?: any[]
  download?: boolean
}
withDefaults(defineProps<Props>(), {
  title: "",
  subTitle: "",
  initType: undefined,
  types: () => [],
  btns: () => [],
  initSelect: undefined,
  selectList: () => [],
  download: false
})
</script>

<template>
  <div class="base-panel flex h-full flex-col">
    <PanelTitle
      :title="title"
      :subTitle="subTitle"
      :initType="initType"
      :types="types"
      :btns="btns"
      :initSelect="initSelect"
      :selectList="selectList"
      :download="download"
    >
      <template #title>
        <slot name="title" />
      </template>
    </PanelTitle>
    <div class="panel-contain flex-1 overflow-hidden p-2">
      <slot name="contain" />
    </div>
  </div>
</template>

<style scoped>
.base-panel {
  background: url("@/assets/images/panel-bg.png") no-repeat center center/100% 100%;
  border-radius: 5px;
  .panel-contain {
    position: relative;
  }
}
</style>
