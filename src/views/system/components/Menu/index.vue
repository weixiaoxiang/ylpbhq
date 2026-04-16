<script lang="ts" setup>
import RecursiveMenu from "./RecursiveMenu.vue"
interface Props {
  systemMenus: any[]
  activeTag?: { fullPath: string }
  collapse?: boolean
  mode?: "horizontal" | "vertical"
}
withDefaults(defineProps<Props>(), {
  systemMenus: () => [],
  activeTag: () => ({ fullPath: "" }),
  collapse: false,
  mode: "vertical"
})
const handleClose = (key: string, keyPath: string[]) => {
  // console.log(key, keyPath)
}
</script>
<template>
  <el-scrollbar height="100%">
    <el-menu
      :default-active="activeTag?.fullPath ?? ''"
      :router="true"
      :collapse="collapse"
      :mode="mode"
      popper-class="menu-popper"
      popper-effect="dark"
      @close="handleClose"
    >
      <recursive-menu
        v-for="menu in systemMenus"
        :key="menu.path"
        :menu-item="menu"
      /> </el-menu
  ></el-scrollbar>
</template>

<style lang="scss" scoped>
.el-menu {
  border-right: none;
  border-bottom: none;
  &.el-menu--vertical,
  &.el-menu--horizontal {
    .el-menu-item {
      transition: all 0.3s;
      &.is-active {
        color: var(--el-color-primary) !important;
        border-left: 5px solid var(--el-color-primary) !important;
        background-color: var(--el-menu-active-color) !important;
      }
      &:hover {
        background-color: var(--el-menu-active-color) !important;
      }
    }
    :deep(.el-sub-menu) {
      .el-menu-item {
        transition: all 0.3s;
        &.is-active {
          color: var(--el-color-primary) !important;
          border-left: 5px solid var(--el-color-primary) !important;
          background-color: var(--el-menu-active-color) !important;
        }
        &:hover {
          background-color: var(--el-menu-active-color) !important;
        }
      }
    }
  }
  &.el-menu--horizontal {
    .el-menu-item {
      min-width: 130px;
    }
  }
}
</style>
<style lang="scss">
// 菜单弹出框
.el-popper.is-dark {
  background: var(--el-color-primary) !important;
  color: var(--system-text-color) !important;
  border: none !important;
  .el-popper__arrow {
    &:before {
      background: var(--el-color-primary) !important;
      border: none !important;
    }
  }
}
// 菜单弹出框
.menu-popper {
  .el-menu-item {
    transition: all 0.3s;
    &.is-active {
      color: var(--el-color-primary) !important;
      border-left: 5px solid var(--el-color-primary) !important;
      background-color: var(--el-menu-active-color) !important;
    }
    &:hover {
      background-color: var(--el-menu-active-color) !important;
    }
  }
  .el-menu--horizontal .el-menu .el-menu-item.is-active {
    color: var(--el-color-primary) !important;
    border-left: 5px solid var(--el-color-primary) !important;
    background-color: var(--el-menu-active-color) !important;
  }
}
</style>
