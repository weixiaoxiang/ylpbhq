<script lang="ts" setup>
import TagsView from "./components/TagsView/index.vue"
const route = useRoute()

const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
const tagsViewStore = useTagsViewStore()
const { activeTag } = storeToRefs(tagsViewStore)

// 监听路由变化
watch(
  () => route.path,
  (path) => {
    tagsViewStore.addVisitedView({
      path,
      name: route.name,
      meta: {
        title: route.meta.title || "no-name"
      }
    })
    activeTag.value = {
      path,
      name: route.name,
      title: route.meta.title || "no-name"
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="main-container flex h-full gap-3">
    <div class="w-[200px] bg-slate-500">
      <el-menu
        :default-active="activeTag?.path ?? ''"
        :router="true"
        class="el-menu-vertical-demo"
        @close="handleClose"
      >
        <el-sub-menu index="/item1">
          <template #title>
            <el-icon><i-ep-location /></el-icon>
            <span>导航一</span>
          </template>
          <el-menu-item index="/item1-1">项目一</el-menu-item>
          <el-menu-item index="/item1-2">项目二</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/item2">
          <el-icon><i-ep-menu /></el-icon>
          <span>导航二</span>
        </el-menu-item>
        <el-menu-item index="/item3">
          <el-icon><i-ep-document /></el-icon>
          <span>导航三</span>
        </el-menu-item>
        <el-menu-item index="/item4">
          <el-icon><i-ep-setting /></el-icon>
          <span>导航四</span>
        </el-menu-item>
      </el-menu>
    </div>
    <div class="app-main relative flex-1">
      <TagsView />
      <!-- key 采用 route.path 和 route.fullPath 有着不同的效果，大多数时候 path 更通用 -->
      <router-view v-slot="{ Component, route }">
        <transition
          name="el-fade-in"
          mode="out-in"
        >
          <keep-alive :include="tagsViewStore.cachedViews">
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
</template>

<style lang="scss" scoped></style>
