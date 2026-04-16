import { GetSsxh_OrgTree, GetSsxh_UserTree, GetTaskRouteByPage, LoginByPc, LoginMethodList, loginSms } from "@/api"
import { menuApi } from "@/api/SystemManage/menu"
import { generateDynamicRoutes } from "@/router"
import MENULIST from "./menu.json"
/**
 * 为树形结构的每个节点添加 fullPath
 * @param list 要处理的树形数据
 * @param parentPath 父节点的路径
 */
function addFullPath(list: any[], parentPath: string = "") {
  list.forEach((item) => {
    // 判断当前节点的 path 是否以 '/' 开头
    if (item.path.startsWith("/")) {
      item.fullPath = item.path
    } else {
      // 如果不是以 '/' 开头，需要拼接父路径
      // 确保父路径末尾有 '/'
      const normalizedParentPath = parentPath.endsWith("/") ? parentPath : `${parentPath}/`
      item.fullPath = `${normalizedParentPath}${item.path}`
    }

    // 如果有子节点，递归处理
    if (item.children && item.children.length > 0) {
      addFullPath(item.children, item.fullPath)
    }
  })
  return list
}
let sortMenuList: any,
  effectiveMenuList: any,
  menuList: any,
  fullPathRootList: any,
  allList: any,
  systemList: any,
  noSystemList: any,
  rootList: any
// 将MENULIST根据sort升序
sortMenuList = MENULIST.sort((a: any, b: any) => a.sort - b.sort)
// 将sortMenuList筛选effective!==false的,菜单中不展示/login等页面
effectiveMenuList = sortMenuList.filter((item: any) => item.effective)
// 菜单列表
menuList = arrayToTree(
  JSON.parse(JSON.stringify(effectiveMenuList)),
  { id: "id", pid: "pId", children: "children" },
  true
)
fullPathRootList = addFullPath(menuList)
// 完整列表
allList = arrayToTree(JSON.parse(JSON.stringify(sortMenuList)), { id: "id", pid: "pId", children: "children" }, false)
systemList = findNodes(allList, "System", { key: "componentName" })
noSystemList = removeNode(allList, "System", { key: "componentName" })
rootList = [...systemList, ...noSystemList]
noSystemList.forEach((item: any) => {
  if (item.componentName === "Layouts") {
    for (let i = 0; i < item.children.length; i++) {
      if (item.children[i].componentName === "Tourism") {
        for (let j = 0; j < item.children[i].children.length; j++) {
          if (
            ["TourismPanorama", "ScienceEducation", "CommunityBuilding"].includes(
              item.children[i].children[j].componentName
            )
          ) {
            item.children.push(JSON.parse(JSON.stringify(item.children[i].children[j])))
            item.children[i].children.splice(j, 1)
            j--
          }
        }
        rootList.push(JSON.parse(JSON.stringify(item.children[i])))
        item.children.splice(i, 1)
        i--
      }
    }
  }
})
generateDynamicRoutes(addFullPath(rootList))
export const useConfigStore = defineStore(
  "config",
  () => {
    const user = ref<any>({}) // 用户信息
    const router = useRouter()
    const route = useRoute()
    // 默认跳转的路由
    const defaultRedirect = ref<string>("/")
    const login = async (username: string, password: string) => {
      username = username.trim()
      password = password.trim()
      const encryptPass = encryptText(password)
      const key = md5(username + encryptPass + "abc")
      const { response, success, msg } = await LoginByPc({
        userName: username,
        pass: encryptPass,
        key
      })
      if (success) {
        user.value = {
          userId: response.userId,
          userName: response.userName,
          roleType: response.roleType,
          routeIds: response.routeIds
        }
        if (response.defaultRedirect) {
          defaultRedirect.value = response.defaultRedirect
        }
        setToken(response.token)
        // 获得头部菜单数据
        await getMenus()
        const redirect = route.query.redirect as string
        if (redirect) {
          router.push({ path: redirect })
        } else {
          router.push({ path: defaultRedirect.value })
        }
        ElMessage.success("登录成功")
      } else {
        ElMessage.info(msg)
      }
    }
    const loginWithSms = async (phone: string, code: string) => {
      phone = phone.trim()
      code = code.trim()
      const { response, success, msg } = await loginSms({
        phone,
        code
      })
      if (success) {
        user.value = {
          userId: response.userId,
          userName: response.userName,
          roleType: response.roleType,
          routeIds: response.routeIds
        }
        defaultRedirect.value = response.defaultRedirect
        setToken(response.token)
        // 获得头部菜单数据
        await getMenus()
        const redirect = route.query.redirect as string
        if (redirect) {
          router.push({ path: redirect })
        } else {
          router.push({ path: defaultRedirect.value })
        }
        ElMessage.success("登录成功")
      } else {
        ElMessage.info(msg)
      }
    }
    const loginMethodList = async () => {
      const { response, success, msg } = await LoginMethodList()
      if (success) {
        return response
      } else {
        ElMessage.info(msg)
        return null
      }
    }
    const logout = () => {
      // 清空user和menus
      user.value = {}
      defaultRedirect.value = "/"
      menus.value = {
        activeA: {}, //当前页面所属一级菜单项
        activeB: {}, //当前页面所属二级菜单项
        classA: [], //当前页面所属一级菜单集合
        classB: [], //当前页面所属二级菜单集合
        classC: [] //当前页面所属三级菜单集合
      }
      // 清空全部localstorage
      localStorage.clear()
      removeToken()
      router.push("/login")
    }

    // 菜单数据
    const menus = ref<any>({
      activeA: {}, //当前页面所属一级菜单项
      activeB: {}, //当前页面所属二级菜单项
      classA: [], //当前页面所属一级菜单集合
      classB: [], //当前页面所属二级菜单集合
      classC: [] //当前页面所属三级菜单集合
    })
    // todo:需要对接接口
    const getMenus = async () => {
      // await getRouteTree()
      if (menus.value.classA.length > 0) return
      menus.value.classA = fullPathRootList
    }
    // 获得所有菜单
    const getRouteTree = async () => {
      const { response } = await menuApi.getDataTree({
        effective: true
      })
      response.forEach((item: any) => {
        MENULIST.forEach((a: any) => {
          if (item.componentName === a.componentName) {
            console.log(1)
            a.id = item.Id
            a.pId = item.pId
          }
        })
      })
      console.log(JSON.stringify(MENULIST, null, 2))
      // await creatDynamicRoutes(response)
    }
    // 根据菜单列表动态生态路由
    const creatDynamicRoutes = async (MENULIST: any) => {
      MENULIST.forEach((item: any) => {
        item.id = item.Id
      })
      // 将MENULIST根据sort升序
      sortMenuList = MENULIST.sort((a: any, b: any) => a.sort - b.sort)
      // 将sortMenuList筛选effective!==false的,菜单中不展示/login等页面
      effectiveMenuList = sortMenuList.filter((item: any) => item.effective)
      // 菜单列表
      menuList = arrayToTree(
        JSON.parse(JSON.stringify(effectiveMenuList)),
        { id: "id", pid: "pId", children: "children" },
        true
      )
      fullPathRootList = addFullPath(menuList)
      // 完整列表
      allList = arrayToTree(
        JSON.parse(JSON.stringify(sortMenuList)),
        { id: "id", pid: "pId", children: "children" },
        false
      )
      systemList = findNodes(allList, "System", { key: "componentName" })
      noSystemList = removeNode(allList, "System", { key: "componentName" })
      rootList = [...systemList, ...noSystemList]
      noSystemList.forEach((item: any) => {
        if (item.componentName === "Layouts") {
          for (let i = 0; i < item.children.length; i++) {
            if (item.children[i].componentName === "Tourism") {
              for (let j = 0; j < item.children[i].children.length; j++) {
                if (
                  ["TourismPanorama", "ScienceEducation", "CommunityBuilding"].includes(
                    item.children[i].children[j].componentName
                  )
                ) {
                  item.children.push(JSON.parse(JSON.stringify(item.children[i].children[j])))
                  item.children[i].children.splice(j, 1)
                  j--
                }
              }
              rootList.push(JSON.parse(JSON.stringify(item.children[i])))
              item.children.splice(i, 1)
              i--
            }
          }
        }
      })
      await generateDynamicRoutes(addFullPath(rootList))
    }
    // 缓存组件
    const cachedComponents = ref<string[]>([])

    /**
     * 控制页面侧边面板的显示状态
     * @description 用于控制科研监测等页面中的侧边面板显示/隐藏
     * - true: 显示侧边面板
     * - false: 隐藏侧边面板
     * @default true
     */
    const showCSB = ref<boolean>(true)
    // 监听页面变化，重置showCSB为true
    watch(
      () => route.path,
      (val) => {
        if (val) {
          showCSB.value = true
        }
      }
    )
    // 智能巡护-任务状态
    const rwztList = ref<any>([
      {
        label: "启用",
        value: "启用"
      },
      {
        label: "停用",
        value: "停用"
      }
    ])
    // 智能巡护-派发任务状态
    const rwztPfList = ref<any>([
      {
        label: "未开始",
        value: "0"
      },
      {
        label: "进行中",
        value: "1"
      },
      {
        label: "已完成",
        value: "2"
      },
      {
        label: "任务终止",
        value: "3"
      },
      {
        label: "任务过期",
        value: "4"
      }
    ])
    // 智能巡护-任务类型
    const rwlxList = ref<any>([
      {
        label: "临时任务",
        value: "临时任务"
      },
      {
        label: "周期任务",
        value: "周期任务"
      }
    ])
    // 智能巡护-任务路线
    const rwRouteList = ref<any>([])
    const getRwRouteList = async () => {
      const { response } = await GetTaskRouteByPage({ page: 1, intPageSize: 1000 })
      rwRouteList.value = response.data.map((item: any) => {
        return {
          label: item.mc,
          value: item.Id,
          ...item
        }
      })
    }
    // 智能巡护-人员列表
    const ryList = ref<any>([])
    const getRyList = async () => {
      const { response } = await GetSsxh_UserTree({})
      ryList.value = response
    }
    // 智能巡护-机构列表
    const jgList = ref<any>([])
    const getJgList = async () => {
      if (jgList.value.length > 0) return
      const { response } = await GetSsxh_OrgTree({})
      jgList.value = response
    }
    return {
      login,
      loginWithSms,
      loginMethodList,
      logout,
      /**
       * 菜单数据
       */
      menus,
      /**
       * 获取菜单数据
       */
      getMenus,
      /**
       * 用户信息
       */
      user,
      /**
       * 默认跳转的路由
       */
      defaultRedirect,
      /**
       * 缓存组件
       */
      cachedComponents,
      /**
       * 控制页面侧边面板的显示状态，例如科研监测中的一张图的侧边面板
       */
      showCSB,
      rwztList,
      rwztPfList,
      ryList,
      getRyList,
      rwRouteList,
      getRwRouteList,
      rwlxList,
      jgList,
      getJgList
    }
  },
  {
    // 本地存储，只在值发生变化时，自动存储到本地
    persist: {
      key: "configStore",
      storage: localStorage,
      // 需要存储的属性
      paths: ["user", "defaultRedirect", "menus"]
    }
  }
)
/** 在 setup 外使用 */
export function useConfigStoreHook() {
  return useConfigStore(store)
}
