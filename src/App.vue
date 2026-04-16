<!--
 * @Author: weixiaoxiang 1935394906@qq.com
 * @Date: 2024-12-19 09:01:28
 * @LastEditors: weixiaoxiang 1935394906@qq.com
 * @LastEditTime: 2025-09-08 10:18:58
 * @FilePath: \ylpbhq\src\App.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<script setup lang="ts">
// import useAutofit from "@/hooks/useAutofit.ts"

// 将 Element Plus 的语言设置为中文
import zhCn from "element-plus/es/locale/lang/zh-cn"
import { dayjs } from "element-plus"
import updateLocale from "dayjs/plugin/updateLocale"
dayjs.extend(updateLocale)
dayjs.updateLocale("en", { weekStart: 1 }) // 设置周开始为周一

const message = ref({
  max: 2,
  grouping: true
})

const route = useRoute()
const router = useRouter()
const { menus, user } = storeToRefs(useConfigStore())
// 监听路由变化，动态设置菜单
watch(
  () => route.fullPath,
  (val) => {
    // console.log(router.getRoutes(), "router.getRoutes()")
    // 没有菜单，不进行菜单设置
    if (menus.value?.classA?.length === 0) return
    // 是否为白名单
    const isWhite = ["/login", "redirect", "/404", "/403", "/MB"].some((white: string) => {
      return val.indexOf(white) > -1
    })
    if (isWhite) return // 白名单，不进行逻辑判断

    // 如果包含query参数，解析参数前的路径
    if (val.indexOf("?") > -1) {
      val = val.split("?")[0]
    }
    // 判断是否存在该路由
    const node = findNodes(menus.value.classA, val, { key: "fullPath" })?.[0] || undefined
    // 判断登录用户是否有该路由权限
    const hasPermission = node?.id ? user.value.routeIds.includes(node.id) : false
    if (node) {
      if (!hasPermission) {
        // 没有该路由权限
        ElMessage({
          type: "warning",
          dangerouslyUseHTMLString: true,
          duration: 3000,
          showClose: true,
          message:
            "<strong>没有该路由权限,请联系管理员&nbsp;&nbsp;<a style='color:orangered;font-size: 12px;' href='/#/login'>重新登录</a></strong>"
        })
        router.push("/login")
        return
      }
      // 获取当前节点的所有父节点
      const ancestors = findAncestors(menus.value.classA, node.id, { key: "id", hasChildren: true }) as any[]
      if (ancestors?.length > 0) {
        menus.value.activeA = ancestors[0] // 当前所属一级菜单项
        menus.value.classB = ancestors[0].children // 当前二级菜单集合
        if (ancestors[1]) {
          menus.value.activeB = ancestors[1] // 当前所属二级菜单项
          menus.value.classC = ancestors[1].children // 当前三级菜单集合
        }
      }
    } else {
      // 没有该路由权限
      ElMessage({
        type: "warning",
        dangerouslyUseHTMLString: true,
        duration: 3000,
        showClose: true,
        message:
          "<strong>没有该路由权限,请联系管理员&nbsp;&nbsp;<a style='color:orangered;font-size: 12px;' href='/#/login'>重新登录</a></strong>"
      })
    }
  },
  {
    immediate: true
  }
)
onMounted(async () => {
  // console.log(router.getRoutes(), "router.getRoutes()")
})
// useAutofit()
</script>

<template>
  <el-config-provider
    :locale="zhCn"
    :message="message"
  >
    <router-view />
  </el-config-provider>
</template>

<style scoped></style>
