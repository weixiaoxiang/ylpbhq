import store from "@/store"
export const useConfigStore = defineStore(
  "config",
  () => {
    return {}
  },
  {
    persist: {
      key: "configStore",
      storage: localStorage,
      paths: ["ROUTE_PATH"]
    }
  }
)
/** 在 setup 外使用 */
export function useConfigStoreHook() {
  return useConfigStore(store)
}
