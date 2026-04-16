import { type RouteRecordRaw, RouterView, createRouter, createWebHashHistory, createWebHistory } from "vue-router"
const Layouts = () => import("@/layouts/index.vue")

/**
 * 常驻路由
 * 除了 redirect/403/404/login 等隐藏页面，其他页面建议设置 Name 属性
 */
export const constantRoutes: RouteRecordRaw[] | any = [
  {
    path: "/redirect",
    component: Layouts,
    meta: {
      hidden: true
    },
    children: [
      {
        path: ":path(.*)",
        component: () => import("@/views/redirect/index.vue")
      }
    ]
  },
  {
    path: "/403",
    component: () => import("@/views/error-page/403.vue"),
    meta: {
      hidden: true
    }
  },
  {
    path: "/404",
    component: () => import("@/views/error-page/404.vue"),
    meta: {
      hidden: true
    },
    alias: "/:pathMatch(.*)*"
  },
  {
    path: "/login",
    component: () => import("@/views/login/index.vue")
  }
  // ************************************* 项目正式路由start *************************************
  // 全部定义为动态路由
  // ************************************* 项目正式路由end *************************************
]
/** 路由模式 */
export const history =
  import.meta.env.VITE_ROUTER_HISTORY === "hash"
    ? createWebHashHistory(import.meta.env.VITE_PUBLIC_PATH)
    : createWebHistory(import.meta.env.VITE_PUBLIC_PATH)

const router = createRouter({
  history,
  routes: constantRoutes
})

export interface MenuRoute {
  // 组件路径（可选）
  component?: string
  // 组件名称（必选）
  componentName: string
  // 路径（必选）
  path: string
  // 图标（可选）
  icon?: string
  // 名称（必选）
  name: string
  // 固定路由（可选）
  affix?: boolean
  // 权限（可选）
  perm?: string
  // 重定向路径（可选）
  redirect?: string
  // 是否可见（可选）
  visible?: boolean
  // 子路由（可选）
  children?: MenuRoute[]
  // 全路径（可选）
  fullPath?: string
}
/** 添加动态路由，传入的是一个树形结构的数组，所以要考虑路由的层级关系 */
export function generateDynamicRoutes(menuRoutes: MenuRoute[]) {
  // 使用正确的 glob 模式匹配所有组件
  const modules = import.meta.glob(["/src/views/**/*.vue", "/src/layouts/**/*.vue"])
  const generateRoute = (menu: MenuRoute): RouteRecordRaw => {
    const route: any = {
      path: menu.path,
      name: menu.componentName,
      // 如果有组件路径就加载组件，没有就渲染子路由
      component: menu.component ? modules[`/src${menu.component}.vue`] : { render: () => h(RouterView) },
      meta: {
        title: menu.name,
        icon: menu.icon,
        affix: menu.affix || false,
        perm: menu.perm,
        visible: menu.visible ?? true,
        fullPath: menu.fullPath
      }
    }
    // if (menu.fullPath?.includes("/tourism")) {
    //   console.log(route, 1111111)
    // }
    if (menu.redirect) {
      route.redirect = menu.redirect
    }
    // 递归处理子路由
    if (menu.children && menu.children.length > 0) {
      route.children = menu.children.map((child) => generateRoute(child)) as any
    }

    return route
  }

  try {
    // 遍历菜单树生成路由
    menuRoutes.forEach((menu) => {
      const route = generateRoute(menu)
      router.addRoute(route)
    })
    return true
  } catch (error) {
    console.error("添加动态路由失败:", error)
    return false
  }
}

/** 重置路由 */
export function resetRouter() {
  // 注意：所有动态路由路由必须带有 Name 属性，否则可能会不能完全重置干净
  try {
    router.getRoutes().forEach((route) => {
      const { name, meta } = route
      if (name && (meta.roles as any)?.length) {
        router.hasRoute(name) && router.removeRoute(name)
      }
    })
  } catch {
    // 强制刷新浏览器也行，只是交互体验不是很好
    window.location.reload()
  }
}

export default router
