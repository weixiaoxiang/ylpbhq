<script lang="ts" setup>
const router = useRouter()
const active = ref("保护区简介")
const toRoute = (item: any) => {
  active.value = item
}
const backHome = () => {
  router.push("/")
}
</script>
<template>
  <div class="main-container">
    <div class="app-header ban">
      <!-- <div class="app-header-box ban"> -->
      <img
        :src="'/statisUrl/ecotourism/header-title-logo.svg'"
        class="logo"
        alt=""
        @click="backHome"
      />
      <div
        class="item"
        :class="{ active: active === '保护区简介' }"
        @click="toRoute('保护区简介')"
      >
        保护区简介
      </div>
      <div class="division">/</div>
      <div
        class="item"
        :class="{ active: active === '历史沿革' }"
        @click="toRoute('历史沿革')"
      >
        历史沿革
      </div>
      <div class="division">/</div>
      <div
        class="item"
        :class="{ active: active === '自然景观' }"
        @click="toRoute('自然景观')"
      >
        自然景观
      </div>
      <div class="division">/</div>
      <div
        class="item"
        :class="{ active: active === '自然资源' }"
        @click="toRoute('自然资源')"
      >
        自然资源
      </div>
      <div class="division">/</div>
      <!-- </div> -->
    </div>
    <div
      class="app-main ban"
      id="app-main"
    >
      <router-view></router-view>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.main-container {
  position: relative;
  width: 100vw;
  min-width: min-content;
  // height: 5950px;
  margin: auto;
  background: url("/statisUrl/ecotourism/bhqjj-bg.png") no-repeat;
  background-size: 100% 100%;
  color: #fff;
  font-size: 16px;
  .ban {
    width: 1740px;
    margin: 0 auto;
  }
  .app-header {
    position: relative;
    height: 108px;
    padding: 0 15px 15px 15px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: flex-end;
    align-items: center;
    top: 0;
    left: 0;
    z-index: 999;
    .logo {
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
    }
    .item {
      height: 100%;
      padding: 0 5px;
      color: #222222;
      font: 700 20px "宋体";
      line-height: 120px;
      cursor: pointer;
      transition: all 0.3s;
      &.active {
        background-color: #efd1cb;
        color: #b92218;
      }
    }
    .division {
      color: #222;
      margin: 26px 10px 0 10px;
      font-size: 24px;
      &:last-of-type {
        display: none;
      }
    }
  }
  #app-main {
    // height: calc(100% - 108px);
  }
}
</style>
