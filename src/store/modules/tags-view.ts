const key = "systemTagsViewStore"
const { menus } = storeToRefs(useConfigStore())
export const useTagsViewStore = defineStore(
  "tags-view",
  () => {
    // const cacheTagsView = true // 是否缓存标签栏数据
    // 从config中获取默认affix的视图
    const affixNodes = findNodes(menus.value.classA, true, { key: "affix" })
    const affixViews = affixNodes.map((node) => {
      return {
        path: node.path,
        title: node.name,
        icon: node.icon,
        affix: node.affix,
        fullPath: node.fullPath
      }
    })
    const visitedViews = ref<any[]>([...affixViews]) // 已访问的视图
    const cachedViews = ref<string[]>(["SystemUser"]) // 缓存的视图名称
    const activeTag = ref<any>({}) // 当前激活的视图

    // 添加visitedViews
    const addVisitedView = (view: any) => {
      if (view.fullPath.includes("/redirect/")) return
      if (visitedViews.value.some((v) => v.fullPath === view.fullPath)) return
      visitedViews.value.push(view)
    }
    // 删除visitedViews
    const delVisitedView = (view: any) => {
      if (view.fullPath.includes("/redirect/")) return
      const index = visitedViews.value.findIndex((v) => v.fullPath === view.fullPath)
      if (index !== -1) visitedViews.value.splice(index, 1)
    }
    // 删除缓存的view
    const delCachedView = (view: any) => {
      if (view.fullPath.includes("/redirect/")) return
      if (typeof view.name !== "string") return
      const index = cachedViews.value.indexOf(view.name)
      if (index !== -1) cachedViews.value.splice(index, 1)
    }
    // 删除其他的visitedViews
    const delOthersVisitedViews = (view: any) => {
      if (view.fullPath.includes("/redirect/")) return
      visitedViews.value = visitedViews.value.filter((v) => {
        return v?.affix || v.fullPath === view.fullPath
      })
    }
    // 删除其他的cachedViews
    const delOthersCachedViews = (view: any) => {
      if (view.fullPath.includes("/redirect/")) return
      if (typeof view.name !== "string") return
      // 只保留固定affix的 tags和当前的view，如果存在的话。
      cachedViews.value = cachedViews.value.filter((v: any) => {
        return v?.affix || v.fullPath === view.fullPath
      })
    }
    // 删除所有的visitedViews
    const delAllVisitedViews = () => {
      // 保留固定affix的 tags
      visitedViews.value = visitedViews.value.filter((v: any) => {
        return v?.affix
      })
    }

    // 删除所有的cachedViews
    const delAllCachedViews = () => {
      // 只保留固定affix的 tags
      cachedViews.value = cachedViews.value.filter((v: any) => {
        return v?.affix
      })
    }
    return {
      visitedViews,
      cachedViews,
      activeTag,
      addVisitedView,
      delVisitedView,
      delCachedView,
      delOthersVisitedViews,
      delOthersCachedViews,
      delAllVisitedViews,
      delAllCachedViews
    }
  },
  {
    // 本地存储，指在值发生变化时，自动存储到本地
    persist: {
      key,
      storage: localStorage,
      paths: ["visitedViews"]
    }
  }
)

/** 在 setup 外使用 */
export function useTagsViewStoreHook() {
  return useTagsViewStore(store)
}
