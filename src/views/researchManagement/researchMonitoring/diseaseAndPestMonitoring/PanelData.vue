<script lang="ts" setup>
interface Props {
  width?: number
  height?: number
  tab?: string
  tabParams?: any
}
const props = withDefaults(defineProps<Props>(), {
  tab: "统计分析"
})
const tabs = ["统计分析", "害虫管理", "监测记录", "枯木多时相对比"]
const currentTab = ref<string>(props.tab)
// 切换tab
const changeTab = (tab: string) => {
  currentTab.value = tab
}
// 组件映射，懒加载
// 使用 defineAsyncComponent 包装异步组件
const componentMap: any = {
  统计分析: defineAsyncComponent(() => import("./DataAnalysis.vue")),
  害虫管理: defineAsyncComponent(() => import("./PestManagement.vue")),
  监测记录: defineAsyncComponent(() => import("./MonitoringRecord.vue")),
  枯木多时相对比: defineAsyncComponent(() => import("./TimeComparison.vue"))
}
// 计算当前应该显示的组件
const currentComponent = computed(() => componentMap[currentTab.value])
onMounted(() => {})
onBeforeUnmount(() => {})
</script>
<template>
  <div
    class="data-panel"
    :style="{ width: width + 'px', height: height + 'px' }"
  >
    <div class="title-box">
      <img
        :src="$fun.getImg(`researchManagement/icon14.png`)"
        alt=""
      />
      {{ currentTab }}
    </div>
    <div class="tabs-level1 panzoom-exclude">
      <div
        v-for="item in tabs"
        :key="item"
        :class="{ current: currentTab === item }"
        @click="changeTab(item)"
      >
        <img
          :src="$fun.getImg(`researchManagement/d${item}.png`)"
          alt=""
        />
        <span>{{ item }}</span>
      </div>
    </div>
    <div class="mian panzoom-exclude">
      <div class="main-section">
        <component
          :is="currentComponent"
          :tab-params="tabParams"
        ></component>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.data-panel {
  position: relative;
  width: 62.5vw;
  height: 720px;
  background: url("@/assets/images/dialog-bg.png") no-repeat center center / 100% 100%;
  display: flex;
  flex-direction: column;
  .title-box {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 70px;
    font-size: 0.9375vw;
    img {
      width: 1.3542vw;
      margin-right: 0.5208vw;
    }
  }
  .tabs-level1 {
    position: absolute;
    top: 0;
    bottom: 0;
    left: -10px;
    transform: translateX(-100%);
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-top: 100px;
    border: 1px solid #00a2f3;
    background: linear-gradient(
      to bottom,
      rgba(0, 70, 151, 1) 0,
      rgba(17, 82, 168, 0.47) 8%,
      rgba(2, 48, 58, 0) 50%,
      rgba(17, 82, 168, 0.6) 94%,
      rgba(0, 70, 151, 1) 100%
    );
    > div {
      position: relative;
      display: flex;
      align-items: center;
      width: 9.0625vw;
      height: 40px;
      padding-left: 0.9375vw;
      font-size: 0.7292vw;
      color: #6f9cce;
      cursor: pointer;
      img {
        width: 0.9375vw;
        margin-right: 0.3125vw;
      }
      span {
        transition: all 0.3s;
      }
      &.current span,
      &:hover span {
        background: linear-gradient(to right, #0cc1c7, #feb47b); /* 渐变颜色 */
        -webkit-background-clip: text;
        color: transparent;
        font-size: 0.8333vw;
        font-weight: bold;
      }
      &.current {
        background: linear-gradient(to left, rgba(30, 60, 112, 0.2), rgba(30, 60, 112, 1));
        &::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 0.2083vw;
          background-color: #25ccea;
        }
      }
    }
  }
  .mian {
    position: relative;
    flex: 1;
    display: flex;
    padding: 0 24px;
    flex-direction: column;
    overflow-y: hidden;
    .main-section {
      position: relative;
      flex: 1;
      display: flex;
      flex-direction: column;
      padding-bottom: 25px;
      overflow-y: hidden;
    }
  }
}
</style>
<style lang="scss">
.data-panel {
  .el-input__wrapper,
  .el-input__inner {
    background-color: #0c284d;
    color: #aab4c1;
    box-shadow: none;
  }
  .el-date-editor {
    background-color: #0c284d !important;
    color: #aab4c1 !important;
    box-shadow: none !important;
  }
  .el-range-input {
    color: #aab4c1 !important;
  }
  .el-range-separator {
    color: #aab4c1 !important;
  }
}
</style>
