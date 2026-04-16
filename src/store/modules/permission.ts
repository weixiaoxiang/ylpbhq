// import { useRouter } from "vue-router";
// import type { RouteRecordRaw } from "vue-router";
// type RouteRecordRaw = typeof RouteRecordRaw;
import { defineStore } from "pinia";
import { constantRoutes } from "@/router";
import  store  from "@/store";
// import { handleTree } from "@/utils/tree";
// import { getMenuPermissionssByUserIdApi } from "@/api/index";
// import { flatMultiLevelRoutes, generateRoute } from "@/utils/routerHelper";
const modules = import.meta.glob("../../views/**/**.vue");
const Layout = () => import("@/layouts/index.vue");

// const ParentView = () => import("@/layout/components/ParentView/index.vue");
/**
 * Use meta.role to determine if the current user has permission
 *
 * @param roles 用户角色集合
 * @param route 路由
 * @returns
 */
const hasPermission = (roles: string[], route: any) => {
  if (route.meta && route.meta.roles) {
    // 角色【超级管理员】拥有所有权限，忽略校验
    if (roles.includes("ROOT")) {
      return true;
    }
    return roles.some((role) => {
      if (route.meta?.roles !== undefined) {
        return (route.meta.roles as string[]).includes(role);
      }
    });
  }
  return false;
};

/**
 * 递归过滤有权限的异步(动态)路由
 *
 * @param routes 接口返回的异步(动态)路由
 * @param roles 用户角色集合
 * @returns 返回用户有权限的异步(动态)路由
 */
// const filterAsyncRoutes = (routes: any[]) => {
//   const asyncRoutes: [] = [];

//   routes.forEach((route) => {
//     // console.log(route);
//     const tmpRoute = { ...route }; // ES6扩展运算符复制新对象
//     if (tmpRoute.component?.toString() == "Layout") {
//       tmpRoute.component = Layout;
//     } else if (tmpRoute.component?.toString() == "ParentView") {
//       tmpRoute.component = ParentView;
//     } else if (route.redirect && route.type == 1) {
//       if (tmpRoute.component?.toString() == "Layout" || !tmpRoute.component){
//         tmpRoute.component = Layout;
//       } else if (tmpRoute.component?.toString() == "ParentView") {
//         tmpRoute.component = ParentView;
//       }
//     } else {
//       const component = modules[`../../views/${tmpRoute.component}.vue`];
//       if (component) {
//         tmpRoute.component = component;
//       } else {
//         tmpRoute.component = modules[`../../views/error-page/404.vue`];
//       }
//     }

//     if (tmpRoute.children) {
//       tmpRoute.children = filterAsyncRoutes(tmpRoute.children);
//     }

//     asyncRoutes.push(tmpRoute);
//   });

//   return asyncRoutes;
// };

// setup
export const usePermissionStore = defineStore("permission", () => {
  // state
  const homeRoutes = ref<any[]>([]);
  const routes = ref<any[]>([]);
  const perms = ref<Array<string>>([]); // 用户权限编码集合 → 判断按钮权限

  // actions
  async function setRoutes(newRoutes: any[]) {
    routes.value = constantRoutes.concat(newRoutes);
  }

  // 递归过滤树
  function filterData2(arr, menu) {
    return arr.filter((item) => {
      if (item.children) {
        item.children = filterData2(item.children, menu);
      }
      if (!item.meta || !item.meta.title) {
        return true;
      }
      let index = menu.findIndex((i) => i.name == item.meta.title);
      if (index != -1) {
        return true;
      }
    });
  }
  /**
   * 生成动态路由
   *
   * @param roles 用户角色集合
   * @returns
   */
  // function generateRoutes(flag: boolean = true) {
  //   return new Promise<any[]>(async (resolve, reject) => {
  //     if (!flag) {
  //       setRoutes([]);
  //       resolve([]);
  //       return
  //     }
  //     let { response } = await getMenuPermissionssByUserIdApi({
  //       userId: localStorage.getItem("userId"),
  //     });
  //     let home = response.find((item) => item.perm === "home");
  //     let dynamicRouter:any= []
  //     if (home) {
  //       dynamicRouter = response.filter(i => {
  //         if (i.treePath) {
  //           return i.treePath.indexOf(home.treePath)==-1
  //         }
  //         return true
  //       })
  //       homeRoutes.value =[]
  //       response.forEach(i => {
  //         if (i.treePath && i.treePath.indexOf(home.treePath) != -1 && i.type != 3) {
  //           homeRoutes.value.push({
  //             Id:i.Id,
  //             path: i.path,
  //             name: i.name,
  //             pId: i.pId,
  //             type: i.type,
  //             redirect: i.redirect
  //           });
  //         }
  //       })
  //       homeRoutes.value = handleTree(homeRoutes.value, "Id", "pId", "children");
  //     }
  //     const menus = dynamicRouter || [];
  //     perms.value = response
  //       .filter((item) => item.type == 3)
  //       .map((item) => item.perm);
  //     let routers = menus.filter((item) => item.type != 3);
  //     routers = handleTree(routers, "Id", "pId", "children");
  //     let route = generateRoute(routers);
  //     const accessedRoutes = filterAsyncRoutes(route);
  //     setRoutes(accessedRoutes);
  //     resolve(accessedRoutes);
     
  //   });
  // }
  /**
   * 混合模式左侧菜单
   */
  const mixLeftMenu = ref<any[]>([]);
  function getMixLeftMenu(activeTop: string) {
    routes.value.forEach((item) => {
      if (item.path === activeTop) {
        mixLeftMenu.value = item.children || [];
      }
    });
  }
  return {
    homeRoutes,
    routes,
    perms,
    setRoutes,
    // generateRoutes,
    getMixLeftMenu,
    mixLeftMenu,
  };
});

// 非setup
export function usePermissionStoreHook() {
  return usePermissionStore(store);
}
