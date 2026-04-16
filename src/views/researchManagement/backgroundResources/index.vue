<script lang="ts" setup>
import PageTabs from "./components/PageTabs.vue"
defineOptions({
  name: "BackgroundResources"
})
onMounted(() => {})
</script>

<template>
  <div class="background-resources h-full">
    <PageTabs class="pages-tabs" />
    <router-view></router-view>
  </div>
</template>

<style scoped lang="scss">
.background-resources {
  position: relative;
  height: 100%;
  font-size: 14px;
  color: #fff;
  .pages-tabs {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-100%);
  }
}
</style>
