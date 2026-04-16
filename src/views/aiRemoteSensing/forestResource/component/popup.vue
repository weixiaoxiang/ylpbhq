<template>
  <div class="map-pop">
    <div class="map-pop-box">
      <div
        class="map-pop-title"
        style="display: flex; justify-content: space-between"
      >
        <div class="map-pop-title-text">
          详情
          <img
            class="close"
            src="@/assets/images/aiRemoteSensing/close.png"
            alt=""
            @click="closePop"
          />
        </div>
      </div>
      <div class="map-pop-content">
        <div class="map-pop-content-box">
          <div class="map-pop-content-box-row">
            <div class="jiantou"></div>
            <div>小班号：{{ detailData?.xiao_ban || "" }}</div>
          </div>
          <div class="map-pop-content-box-row">
            <div class="jiantou"></div>
            <div>土地权属：{{ detailData?.ld_qs || "" }}</div>
          </div>
          <div class="map-pop-content-box-row">
            <div class="jiantou"></div>
            <div>森林类别：{{ detailData?.sen_lin_lb || "" }}</div>
          </div>
          <div class="map-pop-content-box-row">
            <div class="jiantou"></div>
            <div>起源名称：{{ detailData?.qi_yuan || "" }}</div>
          </div>
          <div class="map-pop-content-box-row">
            <div class="jiantou"></div>
            <div>土地利用：{{ detailData?.di_lei || "" }}</div>
          </div>
          <div class="map-pop-content-box-row">
            <div class="jiantou"></div>
            <div>林种结构：{{ detailData?.lin_zhong || "" }}</div>
          </div>
          <div class="map-pop-content-box-row">
            <div class="jiantou"></div>
            <div>优势树种：{{ detailData?.you_shi_sz || "" }}</div>
          </div>
          <div class="map-pop-content-box-row">
            <div class="jiantou"></div>
            <div>郁闭度：{{ detailData?.lmsyqs || "" }}</div>
          </div>
          <div class="map-pop-content-box-row">
            <div class="jiantou"></div>
            <div>面积：{{ detailData?.mian_ji.toFixed(2) || 0 }}公顷</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const emit = defineEmits(["close"])
let props = defineProps(["detailData"])

const closePop = () => {
  emit("close") // 关闭弹框
}
</script>

<style lang="scss" scoped>
.map-pop {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 99999;
  background: url("@/assets/images/aiRemoteSensing/popup.png") no-repeat;
  background-size: 100% center;
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

  .map-pop-box {
    position: relative;
    width: 498px;
    // max-height: 369px;
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
      padding: 16px 20px;
      padding-bottom: 8px;
      .map-pop-content-box {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        width: 100%;

        color: #fff;

        .map-pop-content-box-row {
          display: flex;
          align-items: center;
          width: 48%;
          margin-bottom: 16px;
        }
      }
    }
  }
}
</style>
