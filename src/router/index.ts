import { type RouteRecordRaw, createRouter, createWebHashHistory, createWebHistory } from "vue-router"
const Layouts = () => import("@/layouts/index.vue")
const LayoutsSystem = () => import("@/layoutsSystem/index.vue")

/**
 * 常驻路由
 * 除了 redirect/403/404/login 等隐藏页面，其他页面建议设置 Name 属性
 */
export const constantRoutes: RouteRecordRaw[] = [
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
  // ************************************* 项目正式路由start *************************************
  {
    path: "/",
    component: Layouts,
    meta: {
      title: "项目根路由"
    },
    redirect: "/patrol",
    children: [
      {
        path: "/patrol",
        name: "Patrol",
        meta: {
          title: "智能巡护"
        },
        component: () => import("@/views/patrol/index.vue"),
        redirect: "/patrol/survey",
        children: [
          {
            path: "survey",
            component: () => import("@/views/patrol/survey/index.vue"),
            name: "Survey",
            meta: {
              title: "巡护概况"
            }
          },
          {
            path: "statistics",
            component: () => import("@/views/patrol/statistics/index.vue"),
            name: "Statistics",
            meta: {
              title: "巡护统计"
            }
          },
          {
            path: "record",
            component: () => import("@/views/patrol/record/index.vue"),
            name: "Record",
            meta: {
              title: "巡护记录"
            }
          },
          {
            path: "task",
            component: () => import("@/views/patrol/task/index.vue"),
            name: "Task",
            meta: {
              title: "任务管理"
            }
          }
        ]
      }
    ]
  },
  {
    path: "/system",
    component: LayoutsSystem,
    redirect: "/system/item1-1",
    meta: {
      title: "后台项目根路由"
    },
    children: [
      {
        path: "item1-1",
        component: () => import("@/layoutsSystem/page-test/page1.vue"),
        name: "item1-1",
        meta: {
          title: "item1-1"
        }
      },
      {
        path: "item1-2",
        component: () => import("@/layoutsSystem/page-test/page2.vue"),
        name: "item1-2",
        meta: {
          title: "item1-2"
        }
      },
      {
        path: "item2",
        component: () => import("@/layoutsSystem/page-test/page3.vue"),
        meta: {
          title: "item2"
        }
      },
      {
        path: "item3",
        component: () => import("@/layoutsSystem/page-test/page4.vue"),
        meta: {
          title: "item3"
        }
      },
      {
        path: "item4",
        component: () => import("@/layoutsSystem/page-test/page5.vue"),
        meta: {
          title: "item4"
        }
      }
    ]
  }

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
