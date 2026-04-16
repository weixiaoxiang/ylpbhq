<script setup lang="ts">
interface MenuItem {
  name: string
  path: string
  fullPath: string
  icon?: string
  children?: MenuItem[]
}
defineProps<{
  menuItem: MenuItem
}>()
</script>

<template>
  <el-sub-menu
    v-if="menuItem.children?.length"
    :index="menuItem.fullPath"
  >
    <template #title>
      <el-icon size="14">
        <SvgIcon :name="menuItem.icon || '全部_all-application'" />
      </el-icon>
      <span>{{ menuItem.name }}</span>
    </template>

    <recursive-menu
      v-for="child in menuItem.children"
      :key="child.fullPath"
      :menu-item="child"
    />
  </el-sub-menu>

  <el-menu-item
    v-else
    v-ripple
    :index="menuItem.fullPath"
  >
    <el-icon size="14">
      <SvgIcon :name="menuItem.icon || '全部_all-application'" />
    </el-icon>
    <template #title>{{ menuItem.name }}</template>
  </el-menu-item>
</template>
