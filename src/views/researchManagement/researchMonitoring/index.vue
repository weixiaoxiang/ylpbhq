<script lang="ts" setup>
import PageTabs from "./components/PageTabs.vue"
defineOptions({
  name: "ResearchManagement"
})
onMounted(() => {})
</script>

<template>
  <div class="researchManagement h-full">
    <PageTabs class="pages-tabs" />
    <router-view></router-view>
  </div>
</template>

<style scoped lang="scss">
.researchManagement {
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
