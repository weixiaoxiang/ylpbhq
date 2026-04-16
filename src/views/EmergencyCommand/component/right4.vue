<script setup lang="ts">
onMounted(() => {})
</script>
<template>
  <div class="right4">
    <BasePanel title="无人机监测">
      <template #contain>
        <div class="con">
          <div class="wrj"></div>
          <div class="info">
            <div class="row">
              <img
                src="@/assets/images/emergencyCommand/icon-jd.png"
                alt=""
              />
              <span class="label">经度：</span>
              <span class="value">120.45</span>
            </div>
            <div class="row">
              <img
                src="@/assets/images/emergencyCommand/icon-wd.png"
                alt=""
              />
              <span class="label">纬度：</span>
              <span class="value">120.45</span>
            </div>
            <div class="row">
              <img
                src="@/assets/images/emergencyCommand/icon-fxgd.png"
                alt=""
              />
              <span class="label">飞行高度：</span>
              <span class="value">434m</span>
            </div>
            <div class="row">
              <img
                src="@/assets/images/emergencyCommand/icon-fxsd.png"
                alt=""
              />
              <span class="label">飞行速度：</span>
              <span class="value">34m/s</span>
            </div>
          </div>
        </div>
      </template>
    </BasePanel>
  </div>
</template>
<style lang="scss" scoped>
.right4 {
  height: vh(234);
  margin-top: vh(20);
  color: #fff;
  .con {
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
    .wrj {
      width: 251.07px;
      height: 100%;
      border: 1px solid #2769c6;
      margin-right: 8px;
    }
    .info {
      padding: 16px 0;
      .row {
        display: flex;
        align-items: center;
        font-size: 14px;
        &:not(:last-child) {
          margin-bottom: 22px;
        }
        img {
          margin-right: 4px;
        }
        &:nth-child(1),
        &:nth-child(2) {
          .value {
            color: #1e8fcc;
          }
        }
        &:nth-child(3) {
          .value {
            color: #1fbb77;
          }
        }
        &:nth-child(4) {
          .value {
            color: #fa9f18;
          }
        }
      }
    }
  }
}
</style>
