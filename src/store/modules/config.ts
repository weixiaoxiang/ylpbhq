export const useConfigStore = defineStore(
  "config",
  () => {
    const username = ref<string>("weixiaoxiang")
    const user = ref<{
      name: string
      age: number
    }>({
      name: "weixiaoxiang",
      age: 20
    })
    return { username, user }
  },
  {
    // 本地存储，指在值发生变化时，自动存储到本地
    persist: {
      key: "configStore",
      storage: localStorage,
      paths: []
    }
  }
)
/** 在 setup 外使用 */
export function useConfigStoreHook() {
  return useConfigStore(store)
}
