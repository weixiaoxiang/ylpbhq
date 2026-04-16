<script lang="ts" setup>
defineOptions({
  name: "Patrol"
})
const { getJgList, getRyList, getRwRouteList, cachedComponents } = useConfigStore()
// const route = useRoute()
onMounted(() => {
  // console.log("Patrol mounted")
  getJgList()
  getRyList()
  getRwRouteList()
})
</script>

<template>
  <div class="patrol h-full">
    <!-- 动态缓存 -->
    <router-view v-slot="{ Component }">
      <keep-alive :include="cachedComponents">
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </div>
</template>

<style scoped></style>
