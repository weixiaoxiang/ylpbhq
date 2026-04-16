<script lang="ts" setup>
const emit = defineEmits(["close"])
let props = defineProps(["detailData"])

const closePop = () => {
  emit("close") // 关闭弹框
}
</script>
<template>
  <div class="map-pop">
    <div class="map-pop-box">
      <div
        class="map-pop-title"
        style="display: flex; justify-content: space-between"
      >
        <div class="map-pop-title-text">
          巡护人员信息
          <img
            class="close"
            src="@/assets/images/aiRemoteSensing/close.png"
            alt=""
            @click="closePop"
          />
        </div>
      </div>
      <div class="map-pop-content">
        <div class="row">姓名：{{}}</div>
        <div class="row">当前状态：{{}}</div>
        <div class="row">当前速度：{{}}</div>
        <div class="row">方向：{{}}</div>
        <div class="row">最后更新时间：{{}}</div>
        <div class="spth-btn">
          <img
            src="@/assets/images/emergencyCommand/icon2.png"
            alt=""
          />
          <span>视频通话</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.map-pop {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 99999;
  background: url("@/assets/images/aiRemoteSensing/popup.png") no-repeat;
  background-position: 100% top;
  border-bottom: 2px solid rgba(44, 173, 255, 0.6);
  color: #fff;
  font-size: 14px;

  &:after {
    position: absolute;
    content: "";
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-top: 10px solid rgba(44, 173, 255, 1);
    bottom: -12px;
    left: 50%;
    transform: translateX(-50%);
  }
  &::before {
    position: absolute;
    content: "";
    top: 5px;
    bottom: -2px;
    left: 0;
    width: 2px;
    background: rgba(44, 173, 255, 0.6);
  }

  .map-pop-box {
    position: relative;
    width: 305.7px;
    height: 233.73px;
    padding-top: 5px;

    .map-pop-title {
      position: relative;

      .map-pop-title-text {
        width: 100%;
        height: 28px;
        line-height: 32px;
        padding-left: 18px;
      }

      .close {
        width: 10px;
        height: 10px;
        position: absolute;
        top: 10px;
        right: 10px;
        cursor: pointer;
      }
    }

    .map-pop-content {
      width: 100%;
      padding: 16px;
      .row {
        display: flex;
        margin-bottom: 10px;
      }
      .spth-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-left: auto;
        margin-top: 16px;
        cursor: pointer;
        width: 85.96px;
        height: 22.96px;
        border-radius: 4px;
        background: #26c353;
        color: #fff;
        img {
          margin-right: 4px;
        }
      }
    }
  }
}
</style>
