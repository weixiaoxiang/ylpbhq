<script lang="ts" setup>
import Header from "./components/Header/index.vue"
defineOptions({
  name: "Layout"
})
// const tagsViewStore = useTagsViewStore()
// console.log(route.path)
</script>

<template>
  <div class="main-container h-full bg-[]">
    <Header />
    <div
      class="app-main"
      id="app-main"
    >
      <!-- key 采用 route.path 和 route.fullPath 有着不同的效果，大多数时候 path 更通用 -->
      <!-- <router-view v-slot="{ Component, route }">
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
      </router-view> -->
      <router-view></router-view>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.main-container {
  background-color: #0d152a;
}
#app-main {
  // background: #36c574;
  height: calc(100% - 70px);
}
</style>
