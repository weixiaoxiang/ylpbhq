<script lang="ts" setup>
defineOptions({
  name: "LogoHeader"
})
const router = useRouter()
const title = import.meta.env.VITE_APP_TITLE
const active = ref(4)
interface Menu {
  id: number
  label: string
  value: string
}
const menuList = ref<Menu[]>([
  {
    id: 1,
    label: "科研管理",
    value: "/research"
  },
  {
    id: 2,
    label: "森林资源管理",
    value: "/forest"
  },
  {
    id: 3,
    label: "应急指挥",
    value: "/emergency"
  },
  {
    id: 4,
    label: "智能巡护",
    value: "/patrol"
  },
  {
    id: 5,
    label: "生态旅游",
    value: "/tourism"
  },
  {
    id: 6,
    label: "防灾减灾",
    value: "/disaster"
  },
  {
    id: 7,
    label: "AI+遥感",
    value: "/ai"
  },
  {
    id: 8,
    label: "大数据分析",
    value: "/bigdata"
  }
])
const change = (item: Menu) => {
  active.value = item.id
  // 路由跳转
  router.push(item.value)
}
// 定义时间，包含时分秒
const time = ref(formatTime(new Date()))
const intervalId = setInterval(() => {
  time.value = formatTime(new Date())
}, 1000)
onUnmounted(() => {
  intervalId && clearInterval(intervalId)
})
</script>

<template>
  <div class="app-header bgbox flex h-[70px]">
    <div class="l-con flex h-full w-[660px] items-center gap-1 px-2">
      <img
        :src="$fun.getImg('header/header-bg1.png')"
        alt=""
      />
      <div class="z-10 flex size-10 items-center justify-center bg-[#396195] font-DDIN text-[10px] text-custom3">
        LOGO
      </div>
      <div class="gap z-10 flex flex-col justify-center font-youshe font-bold">
        <span class="logo truncate text-2xl">{{ title }}</span>
        <span class="logo text-xs"
          >Anhui Yaoluoping National Nature Reserve Geographic Information and Monitoring Management Platform</span
        >
      </div>
    </div>
    <div class="r-con flex flex-1 items-center justify-between text-custom2">
      <img
        :src="$fun.getImg('header/header-bg2.png')"
        alt=""
      />
      <div class="bar z-10 flex justify-between gap-1">
        <div
          v-for="item in menuList"
          :key="item.label"
          class="bar-item bgbox flex h-[32px] w-[108px] cursor-pointer items-center justify-center"
          :class="{ active: active === item.id }"
          @click="change(item)"
        >
          {{ item.label }}
        </div>
      </div>
      <div class="z-10 mr-2 flex w-[230px] items-center justify-between">
        <div class="time text-lg">{{ time }}</div>

        <div class="flex items-center gap-2">
          <el-avatar src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
          <el-popconfirm
            title="确认退出"
            placement="bottom-end"
          >
            <template #reference>
              <div>
                超级管理员<el-icon> <i-ep-arrow-down-bold /></el-icon>
              </div>
            </template>
          </el-popconfirm>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-header {
  .l-con {
    position: relative;
    img {
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      z-index: 1;
    }
    .logo {
      /* 文字颜色上下渐变 */
      background: linear-gradient(180deg, #b5c5d0 0%, #c5e6ff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }
  .r-con {
    position: relative;
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
        background-image: url("@/assets/images/header/item-bg.png");
        &.active {
          color: #e6e3e3;
          background-image: url("@/assets/images/header/item-active-bg.png");
        }
      }
    }
    .time {
      /* 文字颜色上下渐变 */
      background: linear-gradient(180deg, #b5c5d0 0%, #c5e6ff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }
}
</style>
