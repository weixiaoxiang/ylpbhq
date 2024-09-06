<script lang="ts" setup></script>

<template>
  <div class="app-container">
    模板
    <span class="">响应式</span>
    <el-button type="primary">Primary</el-button>
    <div class="mx-auto mt-2 h-[400px] w-2/4 overflow-hidden rounded-md border-2 p-2 shadow-sm hover:shadow-md">
      <el-scrollbar height="100%">
        <div class="box grid grid-cols-3 gap-2">
          <div
            v-for="i in 20"
            :key="i"
            class="flex h-[80px] items-center justify-center overflow-hidden bg-slate-500 shadow-sm hover:shadow-md hover:shadow-[rgba(255,0,0,0.1)]"
          >
            <img
              src="https://picsum.photos/200/100"
              class="transition-all duration-700 hover:rotate-6 hover:scale-125"
            />
          </div>
        </div>
      </el-scrollbar>
    </div>
    <div class="mx-auto mt-2 grid w-1/2 gap-2 rounded-md border p-2 shadow-base"></div>
  </div>
</template>

<style lang="scss" scoped>
.box {
  .box1 {
    // master分支
    font-size: 20px;

    font-style: italic;
    font-weight: bold;
    // 测试123
    // ceshi
  }
}
</style>
