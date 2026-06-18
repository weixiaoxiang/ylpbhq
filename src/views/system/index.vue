<script lang="ts" setup>
// import TagsView from "./components/TagsView/index.vue"
import breadcrumb from "./components/Breadcrumb/index.vue"
import Menu from "./components/Menu/index.vue"
import UsageInstructionsDialog from "./components/UsageInstructionsDialog.vue"
const route = useRoute()
const router = useRouter()

const tagsViewStore = useTagsViewStore()
const { cachedViews, activeTag } = storeToRefs(tagsViewStore)
const { menus } = storeToRefs(useConfigStore())
// 侧边系统菜单
const systemMenus = computed(() => menus.value?.classA.find((item: any) => item.name === "系统管理")?.children ?? [])
// 顶部菜单
const noSystemMenus = computed(() => menus.value?.classA.filter((item: any) => item.name !== "系统管理") ?? [])
// 收纳菜单
const storage = ref(false)
const handleStorage = () => {
  storage.value = !storage.value
}

// 监听路由变化
watch(
  () => route.fullPath,
  (val) => {
    const fNodes = findNodes(systemMenus.value, val, { key: "fullPath" })
    const icon = fNodes?.[0]?.icon || "" // 获取图标icon
    // 添加已访问的视图
    tagsViewStore.addVisitedView({
      name: route.name,
      title: route.meta.title,
      icon: icon,
      affix: false,
      fullPath: val
    })
    activeTag.value = {
      fullPath: val,
      name: route.name,
      title: route.meta.title
    }
  },
  { immediate: true }
)
// 监听屏幕大小，收缩菜单
const handleResize = () => {
  if (window.innerWidth < 1200) {
    storage.value = true
  } else {
    storage.value = false
  }
}
const { logout, user, defaultRedirect } = useConfigStore()
const toManage = () => {
  router.push(defaultRedirect)
}

const usageInstructionsVisible = ref(false)
const openUsageInstructions = () => {
  usageInstructionsVisible.value = true
}
onMounted(() => {
  window.addEventListener("resize", handleResize)
})
onUnmounted(() => {
  window.removeEventListener("resize", handleResize)
})
</script>
<template>
  <div class="system h-full">
    <div class="system-header">
      <div class="logo">
        <img
          :src="$fun.getImg('header/head-logo.svg')"
          alt=""
        />
        <h3>安徽鹞落坪国家级自然保护区地理信息与监测管理平台</h3>
      </div>
      <Menu
        class="menu-box"
        :system-menus="noSystemMenus"
        mode="horizontal"
      />
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
              <el-dropdown-item @click="toManage">管理系统</el-dropdown-item>
              <el-dropdown-item>修改密码</el-dropdown-item>
              <el-dropdown-item @click="openUsageInstructions">使用说明</el-dropdown-item>
              <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <div class="system-container">
      <div
        class="system-menu h-full"
        :class="{ 'menu-storage': !storage }"
      >
        <Menu
          class="menu-box"
          :collapse="storage"
          :system-menus="systemMenus"
          :active-tag="activeTag"
        />
        <div
          class="storage"
          v-ripple="{ color: 'rgba(30, 30, 30,0.1)', duration: 600 }"
          @click="handleStorage"
        >
          <SvgIcon
            v-if="storage"
            name="收起菜单_menu-fold-one"
          />
          <SvgIcon
            v-else
            name="展开菜单_menu-unfold-one"
          />
        </div>
      </div>
      <div class="app-main relative flex-1">
        <!-- <TagsView /> -->

        <breadcrumb />
        <!-- key 采用 route.path 和 route.fullPath 有着不同的效果，大多数时候 path 更通用 -->
        <router-view v-slot="{ Component, route }">
          <transition
            name="el-zoom-in-center"
            mode="out-in"
          >
            <keep-alive :include="cachedViews">
              <component
                :is="Component"
                :key="route.path"
                class="app-container-grow"
              />
            </keep-alive>
          </transition>
        </router-view>
      </div>
    </div>
    <UsageInstructionsDialog v-model="usageInstructionsVisible" />
  </div>
</template>

<style lang="scss" scoped>
.system {
  font-family: var(--system-font-family);
  background-color: #fff;

  .system-header {
    height: var(--system-header-height);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    overflow: hidden;

    .logo {
      display: flex;
      align-items: center;
      gap: 10px;

      h3 {
        font-size: 24px;
        display: flex;
        align-items: end;
        margin: 0;
        // margin-top: 20px;
        white-space: nowrap;
      }
    }

    .menu-box {
      flex: 1;
      margin: 0 30px;
      overflow: hidden;
    }

    .el-dropdown {
      .el-dropdown-link {
        display: flex;
        gap: 5px;
        align-items: center;
      }
    }
  }

  .system-container {
    display: flex;
    gap: 12px;
    height: calc(100% - var(--system-header-height));
    background-color: var(--system-bg-color);
    overflow: hidden;

    .system-menu {
      display: flex;
      flex-direction: column;
      background-color: var(--system-menu-bg-color);

      &.menu-storage {
        width: 200px;
      }

      .menu-box {
        flex: 1;
      }

      .storage {
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-top: 5px solid var(--system-bg-color);
        font-size: 24px;
        cursor: pointer;
      }
    }

    .app-main {
      background-color: var(--system-bg-color);
      overflow: hidden;

      .app-container-grow {
        // height: calc(100% - 34px);
        width: calc(100% - 20px);
        height: calc(100% - 60px);
        // background-color: var(--el-bg-color);
      }
    }
  }
}
</style>
