<script lang="ts" setup>
interface Props {
  title: string
}
withDefaults(defineProps<Props>(), {
  title: "基础面板"
})
</script>

<template>
  <div class="panel-title pb-2">
    <div class="flex items-center">
      <img
        :src="$fun.getImg('title-circle.png')"
        alt=""
      />
      <span class="-ml-4 mt-2 text-lg text-white">{{ title }}</span>
    </div>
    <div class="line"></div>
  </div>
</template>

<style scoped>
.panel-title {
  position: relative;
  background: url("@/assets/images/title-bg.png") no-repeat center / 100%;
  .line {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 5px;
    height: 5px;
    background: url("@/assets/images/title-line.png") no-repeat center center / cover;
  }
}
</style>
