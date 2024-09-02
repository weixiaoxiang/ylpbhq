import { type App } from "vue"
// import { loadElementPlus } from "./element-plus"
// import { loadElementPlusIcon } from "./element-plus-icon"
import { loadVxeTable } from "./vxe-table"

export function loadPlugins(app: App) {
  // loadElementPlus(app) // 全局导入 Element Plus
  // loadElementPlusIcon(app)// 全局导入 Element Plus 图标
  loadVxeTable(app) // 全局导入 vxe-table
}
