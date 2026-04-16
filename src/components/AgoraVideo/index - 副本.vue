<script lang="ts" setup>
const localStream = ref<any>(null)
const remoteStreams = ref<any[]>([{}, {}, {}, {}])
</script>

<template>
  <div class="agora-video-panel">
    <div class="agora-view">
      <div class="agora-video agora-video-local">
        <!-- 自定义控件-->
        <StreamPlayer
          v-if="localStream"
          name="本地频道"
          :stream="localStream"
          domId="123"
        ></StreamPlayer>
        <div
          v-else
          class="agora-video-avator--default"
        >
          <img
            src="@/assets/images/emergencyCommand/defaultAvator.png"
            alt=""
          />
        </div>
        <div class="agora-video-btns">
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
          <img
            src="@/assets/images/emergencyCommand/fullscreen.png"
            alt=""
          />
        </div>
      </div>
      <div class="agora-video agora-video-remote">
        <div
          v-for="item in remoteStreams"
          :key="item.id"
          class="agora-video-remote-item"
        >
          <StreamPlayer
            v-if="item.remoteStream"
            :name="item.name"
            :domId="item.domId"
            :stream="item.remoteStream"
          ></StreamPlayer>
          <div
            v-else
            class="agora-video-avator--default"
          >
            <img
              src="@/assets/images/emergencyCommand/defaultAvator.png"
              alt=""
            />
          </div>
          <div class="agora-video-btns">
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
            <img
              src="@/assets/images/emergencyCommand/fullscreen.png"
              alt=""
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.agora-video-panel {
  height: 100%;
  width: 100%;
  .agora-view {
    height: 100%;
    width: 100%;
    display: flex;
    gap: 10px;
    .agora-video {
      position: relative;
    }
    .agora-video-local {
      width: 40%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: rgb(15, 44, 75);
    }
    .agora-video-remote {
      width: 60%;
      height: 100%;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      grid-auto-rows: 1fr;
      gap: 10px;
      .agora-video-remote-item {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: rgb(15, 44, 75);
      }
    }
  }
}
.agora-video-avator--default {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #133b68;
  display: flex;
  align-items: center;
  justify-content: center;
  img {
    width: 40px;
    height: 46px;
  }
}
.agora-video-btns {
  position: absolute;
  bottom: 5px;
  right: 5px;
  display: flex;
  align-items: center;
  gap: 5px;
  img {
    cursor: pointer;
    width: 20px;
    height: 20px;
  }
}
</style>
