/**
 * 自适应屏幕。方案被放弃，因为不同分辨率下，文字会变形，不适合大屏幕展示。
 * author: 魏晓翔
 */
export default function useAutofit() {
  const route = useRoute()
  const resizeF = () => {
    const el = document.querySelector("#app") as HTMLElement
    const width = document.documentElement.clientWidth
    const height = document.documentElement.clientHeight
    el.style.transform = "scale(" + width / 1920 + "," + height / 1080 + ")"
  }
  const addAutofit = () => {
    const el = document.querySelector("#app") as HTMLElement
    el.classList.add("bigdata")
    resizeF()
    window.addEventListener("resize", resizeF)
  }
  const removeAutofit = () => {
    const el = document.querySelector("#app") as HTMLElement
    el.classList.remove("bigdata")
    el.style.transform = "none"
    window.removeEventListener("resize", resizeF)
  }
  watch(
    route,
    (val) => {
      // const whiteList = ["/login"]
      // const hasY = ["/login", "/ecotourism/briefIntroduction"]
      // const mode = import.meta.env.MODE
      // const body = document.querySelector("body") as HTMLElement
      // if (mode === "production") {
      // if (whiteList.includes(val.path)) {
      //   removeAutofit()
      // } else {
      //   addAutofit()
      //   if (hasY.includes(val.path)) {
      //     body.style.overflowY = "auto"
      //   } else {
      //     body.style.overflowY = "hidden"
      //   }
      // }
      // if (hasY.includes(val.path)) {
      //   body.style.overflowY = "auto"
      // } else {
      //   body.style.overflowY = "hidden"
      // }
      // } else {
      // if (whiteList.includes(val.path)) {
      //   removeAutofit()
      // } else {
      //   addAutofit()
      // }
      // if (whiteList.includes(val.path)) {
      //   removeAutofit()
      // } else {
      //   const el = document.querySelector("#app") as HTMLElement
      //   el.classList.add("bigdata")
      // }
      // }
    },
    {
      immediate: true
    }
  )
  onMounted(() => {
    // addAutofit()
  })
  onBeforeUnmount(() => {
    // removeAutofit()
  })
  return { addAutofit, removeAutofit }
}
