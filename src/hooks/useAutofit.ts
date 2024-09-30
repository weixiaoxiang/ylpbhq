export default function useAutofit() {
  const resizeF = () => {
    const el = document.querySelector("#app") as HTMLElement
    const width = document.documentElement.clientWidth
    const height = document.documentElement.clientHeight
    el.style.transform = "scale(" + width / 1920 + "," + height / 1080 + ")"
  }
  onMounted(() => {
    const el = document.querySelector("#app") as HTMLElement
    el.classList.add("bigdata")
    resizeF()
    window.addEventListener("resize", resizeF)
  })
  onBeforeUnmount(() => {
    const el = document.querySelector("#app") as HTMLElement
    el.classList.remove("bigdata")
    el.style.transform = "none"
    window.removeEventListener("resize", resizeF)
  })
}
