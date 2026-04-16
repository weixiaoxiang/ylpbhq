import { type App } from "vue"
import { permission } from "./permission"
import { vRipple } from "./ripple"
import { vDrag } from "./dragable"
import vTypewriter from "./vTypewriter"

/** 挂载自定义指令 */
export function loadDirectives(app: App) {
  app.directive("permission", permission)
  app.directive("ripple", vRipple)
  // 注册拖拽指令
  app.directive("dragable", vDrag)
  app.directive("typewriter", vTypewriter)
}
