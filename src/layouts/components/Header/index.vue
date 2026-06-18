<script lang="ts" setup>
import UsageInstructionsDialog from "@/views/system/components/UsageInstructionsDialog.vue"

defineOptions({
  name: "LogoHeader"
})
const { logout, user } = useConfigStore()
const { menus } = storeToRefs(useConfigStore())
const router = useRouter()
const title = import.meta.env.VITE_APP_TITLE
const change = (item: any) => {
  // 路由跳转
  router.push(item.fullPath)
}
// 定义时间，包含年月日时分秒
const time = ref(formatDateTime(new Date()))
const intervalId = setInterval(() => {
  time.value = formatDateTime(new Date())
}, 1000)
// 系统管理
const toSystem = () => {
  router.push("/system")
}

const usageInstructionsVisible = ref(false)
const openUsageInstructions = () => {
  usageInstructionsVisible.value = true
}
onBeforeUnmount(() => {
  intervalId && clearInterval(intervalId)
})
</script>

<template>
  <!-- 弹窗不参与顶栏 flex 布局 -->
  <UsageInstructionsDialog v-model="usageInstructionsVisible" />
  <div class="app-header bgbox flex h-[70px]">
    <div class="l-con flex h-full items-center gap-1 px-2 pt-1">
      <img
        class="bg"
        :src="$fun.getImg('header/header-bg1.png')"
        alt=""
      />
      <img
        class="l-logo mr-2"
        :src="$fun.getImg('header/head-logo.svg')"
        alt=""
      />
      <div class="gap z-10 flex flex-col justify-center font-bold">
        <span class="logo text1 truncate">{{ title }}</span>
        <span class="logo text2"
          >Anhui Yaoluoping National Nature Reserve Geographic Information and Monitoring Management Platform</span
        >
      </div>
    </div>
    <div class="r-con z-10 flex flex-1 items-center justify-between text-custom2">
      <img
        :src="$fun.getImg('header/header-bg2.png')"
        alt=""
      />
      <div class="bar z-10 flex justify-between gap-1">
        <template
          v-for="item in menus.classA"
          :key="item.name"
        >
          <div
            v-permission="item.id"
            v-if="item.name !== '系统管理'"
            class="bar-item bgbox cursor-pointer"
            :class="{ active: menus?.activeA?.id === item.id }"
          >
            <div class="bar-item-text">{{ item.name }}</div>
            <div
              v-if="item.children?.length > 0"
              class="bar-item-children"
            >
              <div
                v-permission="child.id"
                v-for="child in item.children"
                :key="child.id"
                class="div-underline"
                :class="{ current: menus?.activeB?.id === child.id, 'size-small': child.title?.length > 5 }"
                v-ripple="{ color: 'rgba(30, 161, 223,0.5)', duration: 600 }"
                @click.stop="change(child)"
              >
                {{ child.name }}
              </div>
            </div>
          </div>
        </template>
      </div>
      <div class="r-section z-10 mr-2 flex items-center gap-2 justify-between">
        <div class="time">{{ time }}</div>

        <div class="flex items-center gap-2">
          <el-dropdown trigger="click">
            <div class="el-dropdown-link">
              <el-avatar
                class="avatar"
                :size="32"
                src="https://picsum.photos/id/1/60/60"
              />
              <span> {{ user.userName }} </span><el-icon style="margin-top: 2px"> <i-ep-arrow-down-bold /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="toSystem">系统管理</el-dropdown-item>
                <el-dropdown-item>修改密码</el-dropdown-item>
                <el-dropdown-item @click="openUsageInstructions">使用说明</el-dropdown-item>
                <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.app-header {
  .l-con {
    width: 34.375vw;
    /* width: 660px; */
    position: relative;
    padding-top: 20px;
    img.bg {
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      height: 87px;
      pointer-events: none;
      z-index: 10;
    }
    .logo {
      /* 文字颜色上下渐变 */
      background: linear-gradient(180deg, #b5c5d0 0%, #c5e6ff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .text1 {
      font-size: 1.1458vw;
    }
    .text2 {
      font-size: 0.7813vw;
    }
    .l-logo {
      z-index: 11;
    }
  }
  .r-con {
    min-width: 52.0833vw;
    position: relative;
    z-index: 999;
    img {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 88px;
      pointer-events: none;
    }
    .bar {
      .bar-item {
        position: relative;
        display: flex;
        flex-direction: column;
        width: 5.625vw;
        height: 32px;
        text-align: center;
        line-height: 32px;
        font-size: 0.8333vw;
        &.active {
          .bar-item-text {
            color: #e6e3e3;
            background-image: url("@/assets/images/header/item-active-bg.png");
          }
        }
        &:hover {
          .bar-item-children {
            height: initial;
            opacity: 1;
          }
        }
        .bar-item-text {
          width: 100%;
          height: 32px;
          text-align: center;
          line-height: 32px;
          font-size: 0.8333vw;
          background-image: url("@/assets/images/header/item-bg.png");
          background-size: inherit;
        }
        .bar-item-children {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: absolute;
          top: 32px;
          left: 0;
          width: 4.8958vw;
          height: 0;
          opacity: 0;
          overflow: hidden;
          transition: all 0.5s;
          font-size: 0.7292vw;
          background-color: #16426e;
          color: #afb6c1;
          border-bottom-left-radius: 2px;
          border-bottom-right-radius: 2px;
          box-shadow: 0 0 5px 1px rgba(255, 255, 255, 0.1);
          > div {
            width: 100%;
          }
          .current {
            &::before {
              content: "";
              position: absolute;
              left: 50%;
              bottom: 0;
              width: 100%;
              height: 2px;
              background-color: #3cefff;
              transform-origin: center;
              transform: translate(-50%, 0) scaleX(1);
              transition: transform 0.3s ease-in-out;
            }
          }
          .size-small {
            font-size: 0.625vw;
          }
        }
      }
    }
    .r-section {
      // width: 11.9792vw;
      width: fit-content;
      font-size: 0.7292vw;
      .time {
        font-size: 0.7292vw;
        /* 文字颜色上下渐变 */
        background: linear-gradient(180deg, #b5c5d0 0%, #c5e6ff 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .el-dropdown {
        margin-left: 10px;
        :deep(.el-dropdown-link) {
          .avatar {
            width: 1.6667vw;
            height: 1.6667vw;
          }
          display: flex;
          gap: 5px;
          align-items: center;
          /* 文字颜色上下渐变 */
          background: linear-gradient(180deg, #b5c5d0 0%, #c5e6ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      }
    }
  }
  .div-underline {
    position: relative;
    &::before {
      content: "";
      position: absolute;
      left: 50%;
      bottom: 0;
      width: 100%;
      height: 2px;
      background-color: #3cefff;
      transform-origin: center;
      transform: translate(-50%, 0) scaleX(0);
      transition: transform 0.3s ease-in-out;
    }
    &:hover::before {
      transform: translate(-50%, 0) scaleX(1);
    }
  }
}
</style>
<style lang="scss">
// .avatar {
//   width: 2.0833vw;
//   height: 2.0833vw;
//   img {
//   }
// }
.logout-popconfirm {
  background: #204778 !important;
  border: none !important;
  color: #fff !important;
  .el-popper__arrow {
    &:before {
      background: #204778 !important;
      border: none !important;
    }
  }
}
</style>
