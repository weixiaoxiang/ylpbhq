<script lang="ts" setup>
interface Props {
  name: string
  domId: string
  stream: any
}
withDefaults(defineProps<Props>(), {
  name: "",
  domId: "",
  stream: {}
})
</script>
<template>
  <div class="agora-video-box">
    <div class="agora-title">
      <span>{{ name }}</span>
    </div>
    <div
      class="agora-video-player"
      ref="player"
      :id="domId"
    ></div>
  </div>
</template>

<style lang="scss" scoped>
.agora-video-box {
  height: 100%;
  width: 100%;
  .agora-title {
    height: 30px;
    line-height: 30px;
    text-align: center;
    font-size: 14px;
    background-color: #000;
    color: #fff;
  }
  .agora-video-player {
    height: calc(100% - 30px);
    width: 100%;
    background-color: #000;
  }
}
</style>
