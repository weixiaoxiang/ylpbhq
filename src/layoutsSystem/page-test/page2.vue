<script lang="ts" setup>
defineOptions({
  name: "item1-2"
})
const input = ref()
ElMessage.success("This is a success message")
</script>

<template>
  <div class="app-container group">
    item1-2
    <el-input
      v-model="input"
      placeholder="请输入内容"
    />
    <el-button type="primary">Primary</el-button>
  </div>
</template>

<style scoped></style>
