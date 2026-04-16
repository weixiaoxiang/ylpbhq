<script setup lang="ts">
const configStore = useConfigStore()
const { defaultRedirect } = storeToRefs(configStore)
</script>
<template>
  <div class="error-page">
    <div class="error-page-svg">
      <slot />
    </div>
    <router-link :to="defaultRedirect">
      <el-button type="primary">回到首页</el-button>
    </router-link>
  </div>
</template>

<style lang="scss" scoped>
.error-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  &-svg {
    width: 400px;
    margin-bottom: 50px;
  }
}
</style>
