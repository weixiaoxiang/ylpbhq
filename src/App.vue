<script setup lang="ts">
// import autofit from "autofit.js"
// import { autofitfix, fitEls } from "@/utils/autofitfix.js"
// import useAutofit from "@/hooks/useAutofit.ts"

// 将 Element Plus 的语言设置为中文
import zhCn from "element-plus/es/locale/lang/zh-cn"

onMounted(async () => {
  // autofit.init({
  //   dh: 1080,
  //   dw: 1920,
  //   el: "#app",
  //   resize: true
  // })
  // await nextTick()
  // autofitfix({
  //   baseEl: "#app",
  //   fitEls,
  //   resize: true
  // })
})
// useAutofit()
</script>

<template>
  <el-config-provider :locale="zhCn">
    <router-view />
  </el-config-provider>
</template>

<style scoped></style>
