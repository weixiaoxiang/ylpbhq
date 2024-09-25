<script lang="ts" setup>
const tagsViewStore = useTagsViewStore()
</script>

<template>
  <div class="main-container flex h-full gap-3">
    <div class="app-main">
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
