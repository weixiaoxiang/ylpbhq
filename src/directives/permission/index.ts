import { type Directive } from "vue"

/** 权限指令，和权限判断函数 checkPermission 功能类似 */
export const permission: Directive = {
  mounted(el, binding) {
    console.log(el, binding)
  }
}
