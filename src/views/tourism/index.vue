<script lang="ts" setup>
import { useScroll } from "@vueuse/core"

const proxy = getCurrentInstance()?.proxy as any
const route = useRoute()
const router = useRouter()
const configStore = useConfigStore()
const { menus, user, defaultRedirect } = storeToRefs(configStore)
const catalogue = ref(
  menus.value.classB.filter((item: any) => !["科普宣教", "社区共建", "生态全景"].includes(item.name))
)
// 跳转
const toRoute = (item: any) => {
  router.push(item.fullPath)
}
// 返回首页
const backHome = () => {
  const node = findNode(menus.value.classA, "3")
  if (node) {
    const child = node.children
    menus.value.classB = child
  } else {
  }
  router.push(defaultRedirect.value)
}
const appMainBan = ref<boolean>(true)
// 监听路由,修改背景图片
watch(
  () => route.fullPath,
  () => {
    const title = menus?.value?.activeB?.name
    nextTick(() => {
      const container = document.querySelector(".main-container") as HTMLElement
      let bg = ""
      if (title === "保护区简介") {
        bg = "/statisUrl/ecotourism/bhqjj-bg.png"
        appMainBan.value = true
      }
      if (title === "历史沿革") {
        bg = "/statisUrl/ecotourism/lsyg-bg.png"
        appMainBan.value = false
      }
      if (title === "自然景观") {
        bg = "/statisUrl/ecotourism/zrjg-bg.png"
        appMainBan.value = false
      }
      if (title === "自然资源") {
        bg = "/statisUrl/ecotourism/zrzy-bg.png"
        appMainBan.value = false
      }
      if (title === "古树名木") {
        bg = "/statisUrl/ecotourism/gsmm-bg.png"
        appMainBan.value = false
      }
      container.style.background = `url(${bg}) no-repeat center center / 100% 100%`
    })
    // 路由跳转结束后，重置滚动状态至顶部
    window.scrollTo({
      top: 0
      // behavior: "smooth" // 使用平滑滚动效果
    })
  },
  {
    immediate: true
  }
)
// 是否粘性
// 使用 useScroll 监听页面滚动
const { y: scrollY } = useScroll(window)
const isSticky = computed(() => scrollY.value > 108)

onMounted(async () => {
  // 粒子特效
  // initStarEffect("particle", {
  //   fullScreen: false,
  //   particles: {
  //     number: {
  //       value: 40, // 粒子数量
  //       density: {
  //         enable: true // 启用密度控制
  //       }
  //     },
  //     shape: {
  //       type: "character",
  //       options: {
  //         character: {
  //           value: ["生态旅游", "鹞落坪", "国家级", "保护区", "简介", "历史沿革", "自然景观", "自然资源", "古树名木"], // 可以是字符数组
  //           font: "Verdana",
  //           style: "",
  //           weight: "400"
  //         }
  //       }
  //     },
  //     move: {
  //       enable: true, // 启用粒子运动
  //       speed: {
  //         min: 0.2,
  //         max: 1
  //       }
  //     },
  //     size: {
  //       value: {
  //         min: 4, // 最小粒子尺寸
  //         max: 8 // 最大粒子尺寸
  //       },
  //       animation: {
  //         enable: false
  //       }
  //     }
  //   }
  // })
})
</script>
<template>
  <div class="main-container">
    <div id="particle"></div>
    <div
      ref="headerRef"
      class="app-header ban"
      :class="{ 'is-sticky': isSticky }"
    >
      <img
        :src="'/statisUrl/ecotourism/header-title-logo.svg'"
        class="logo"
        alt=""
        @click="backHome"
      />
      <template
        v-for="item in catalogue"
        :key="item.id"
      >
        <div
          class="item"
          v-permission="item.id"
          :class="{ active: menus?.activeB?.id === item.id }"
          v-ripple="{ color: 'rgba(239, 209, 203, 0.7)', duration: 600 }"
          @click="toRoute(item)"
        >
          {{ item.name }}
        </div>
        <div
          v-permission="item.id"
          class="division"
        >
          /
        </div>
      </template>
      <div class="user-info">
        <el-dropdown trigger="click">
          <div class="el-dropdown-link">
            <span> {{ user.userName }} </span><el-icon style="margin-top: 2px"> <i-ep-arrow-down-bold /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="configStore.logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <div
      class="app-main"
      :class="{ ban: appMainBan }"
      id="app-main"
    >
      <router-view v-slot="{ Component }">
        <transition
          mode="out-in"
          enter-active-class="animate__animated animate__fadeIn"
          leave-active-class="animate__animated animate__fadeOut"
        >
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
    <el-backtop :bottom="100">
      <div class="backtop">
        <SvgIcon name="返回顶部" />
      </div>
    </el-backtop>
  </div>
</template>

<style lang="scss" scoped>
.main-container {
  position: relative;
  width: 100vw;
  min-width: min-content;
  margin: auto;
  // background: url("/statisUrl/ecotourism/bhqjj-bg.png") no-repeat;
  // background-size: 100% 100%;
  color: #fff;
  font-size: 0.8333vw;
  #particle {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    pointer-events: none;
    user-select: none;
    z-index: 0; /* 确保粒子效果在底层 */
  }
  .ban {
    width: 90.625vw;
    margin: 0 auto;
  }
  .app-header {
    position: relative;
    height: 108px;
    padding: 0 0.7813vw 15px 0.7813vw;
    border-bottom: 1px solid rgba(11, 25, 44, 0.5);
    display: flex;
    justify-content: flex-end;
    align-items: center;
    top: 0;
    left: 0;
    z-index: 999;
    user-select: none;
    &.is-sticky {
      position: sticky;
      background: rgba(255, 255, 255, 0.2); // 可以添加一些视觉效果
      backdrop-filter: blur(5px);
      // filter: invert(9);
      // background-image: radial-gradient(transparent 2px, #faf9f2 4px);
      background-size: 4px 4px;
      border-bottom-color: rgba(0, 0, 0, 0.1);
      box-shadow: 0 0 10px 2px rgba(0, 0, 0, 0.1);
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
    }
    .logo {
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 33.8542vw;
      height: 2.3438vw;
      transition: all 0.3s ease-in-out;
      cursor: pointer;
    }
    .item {
      height: 100%;
      padding: 0 5px;
      color: #222222;
      font: 700 1.0417vw "宋体";
      line-height: 120px;
      cursor: pointer;
      // transition: all 0s ease-in-out 0.6s;
      transition-delay: 0.4s;
      &.active {
        background-color: rgba(239, 209, 203, 0.7);
        color: #b92218;
      }
    }
    .division {
      color: #222;
      margin: 26px 0.5208vw 0 0.5208vw;
      font-size: 24px;
      &:last-of-type {
        display: none;
      }
    }
    .user-info {
      position: absolute;
      right: 10px;
      top: 10px;
      cursor: pointer;
    }
  }
  #app-main {
    // height: calc(100% - 108px);
  }
  .backtop {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #fff;
    box-shadow: 0 0 5px 1px rgba(0, 0, 0, 0.05);
    color: #1989fa;
    border-radius: 50%;
  }
}
</style>
