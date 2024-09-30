import { createApp } from "vue"
import App from "./App.vue"
import store from "@/store"
import router from "@/router"
import "@/router/permission"
// load
import { loadSvg } from "@/icons"
import { loadPlugins } from "@/plugins"
import { loadDirectives } from "@/directives"

// css
import "normalize.css"
import "element-plus/dist/index.css"
import "element-plus/theme-chalk/dark/css-vars.css"
import "vxe-table/lib/style.css"
import "vxe-table-plugin-element/dist/style.css"
import "@/styles/index.scss"
// 引入animate.css
import "animate.css"
import { getImg } from "@/utils"
import * as echarts from "echarts"
import mitt from "mitt"
import piniaPluginPersist from "pinia-plugin-persistedstate"
store.use(piniaPluginPersist)
const app = createApp(App)
/** 加载插件 */
loadPlugins(app)
/** 加载全局 SVG */
loadSvg(app)
/** 加载自定义指令 */
loadDirectives(app)

app.use(store).use(router)

// 挂在全局生效的方法
app.config.globalProperties.$fun = {
  getImg: getImg
}

// 挂载echarts
app.config.globalProperties.$echarts = echarts

// 挂载mitt
app.config.globalProperties.$mitt = mitt()

router.isReady().then(() => {
  app.mount("#app")
})
