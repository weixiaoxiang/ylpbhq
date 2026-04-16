<script lang="ts" setup>
defineOptions({
  name: "ForestResources"
})
const { getJgList, getRyList, getRwRouteList } = useConfigStore()
onMounted(() => {
  console.log("ForestResources mounted")
  getJgList()
  getRyList()
  getRwRouteList()
})
</script>

<template>
  <div class="ForestResources h-full">
    <router-view></router-view>
  </div>
</template>

<style scoped></style>
