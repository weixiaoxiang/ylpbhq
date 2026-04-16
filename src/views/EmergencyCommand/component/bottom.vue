<script setup lang="ts">
const { proxy } = getCurrentInstance() as any
const xthsData = ref<any>([{}, {}, {}, {}, {}])

onMounted(() => {})
onBeforeUnmount(() => {})
</script>
<template>
  <div class="left1">
    <BasePanel
      title="协调会商"
      class="overflow-hidden"
    >
      <template #contain>
        <div class="con">
          <AgoraVideo />
          <!-- <div
            class="item"
            v-for="(item, index) in xthsData"
            :key="index"
          >
            <div class="fullscreen">
              <SvgIcon
                class="icon"
                name="全屏"
              />
            </div>
            <div class="avator">
              <img
                src="@/assets/images/emergencyCommand/defaultAvator.png"
                alt=""
              />
            </div>
            <div class="btns">
              <img
                src="@/assets/images/emergencyCommand/video.png"
                alt=""
              />
              <img
                src="@/assets/images/emergencyCommand/voice.png"
                alt=""
              />
              <img
                src="@/assets/images/emergencyCommand/phone.png"
                alt=""
              />
            </div>
          </div> -->
        </div>
      </template>
    </BasePanel>
  </div>
</template>

<style lang="scss" scoped>
.left1 {
  position: absolute;
  bottom: vh(20);
  left: 460px;
  right: 460px;
  height: 305px;
  color: #fff;
  .con {
    border: 1px solid #0c233b;
    height: 100%;
  }
}
</style>
