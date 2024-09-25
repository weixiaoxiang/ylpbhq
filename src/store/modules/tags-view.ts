const VITE_APP_TITLE = import.meta.env.VITE_APP_TITLE
const key = VITE_APP_TITLE + "-tags-view"
export const useTagsViewStore = defineStore(
  "tags-view",
  () => {
    // const cacheTagsView = true // 是否缓存标签栏数据
    const visitedViews = ref<any[]>([])
    const cachedViews = ref<string[]>(["item1-1", "item1-2"])
    const activeTag = ref<any>({})

    // 添加visitedViews
    const addVisitedView = (view: any) => {
      if (view.path.includes("/redirect/")) return
      if (visitedViews.value.some((v) => v.path === view.path)) return
      visitedViews.value.push(view)
    }
    // 删除visitedViews
    const delVisitedView = (view: any) => {
      if (view.path.includes("/redirect/")) return
      const index = visitedViews.value.findIndex((v) => v.path === view.path)
      if (index !== -1) visitedViews.value.splice(index, 1)
    }
    // 删除缓存的view
    const delCachedView = (view: any) => {
      if (view.path.includes("/redirect/")) return
      if (typeof view.name !== "string") return
      const index = cachedViews.value.indexOf(view.name)
      if (index !== -1) cachedViews.value.splice(index, 1)
    }
    // 删除其他的visitedViews
    const delOthersVisitedViews = (view: any) => {
      if (view.path.includes("/redirect/")) return
      visitedViews.value = visitedViews.value.filter((v) => {
        return v.meta?.affix || v.path === view.path
      })
    }
    // 删除其他的cachedViews
    const delOthersCachedViews = (view: any) => {
      if (view.path.includes("/redirect/")) return
      if (typeof view.name !== "string") return
      const index = cachedViews.value.indexOf(view.name)
      if (index !== -1) {
        cachedViews.value = cachedViews.value.slice(index, index + 1)
      } else {
        // 如果 index = -1, 没有缓存的 tags
        cachedViews.value = []
      }
    }
    // 删除所有的visitedViews
    const delAllVisitedViews = () => {
      // 保留固定的 tags
      visitedViews.value = []
    }

    // 删除所有的cachedViews
    const delAllCachedViews = () => {
      cachedViews.value = []
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
