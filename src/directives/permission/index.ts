import { type Directive, type DirectiveBinding } from "vue"
import { useConfigStoreHook } from "@/store/modules/config"

/** 将值统一转换为字符串数组，支持数字和字符串混合 */
function normalizeRequiredIds(value: number | number[] | string | string[] | undefined): string[] {
  if (value == null) return []
  const array = Array.isArray(value) ? value : [value]
  return array.map((id) => String(id))
}

/** 将 routeIds 转换为字符串数组，支持数字和字符串混合 */
function normalizeRouteIds(routeIds: (number | string)[] | undefined): string[] {
  if (!Array.isArray(routeIds) || !routeIds.length) return []
  return routeIds.map((id) => String(id))
}

function hasPermission(routeIds: (number | string)[] | undefined, requiredIds: string[], requireAny: boolean): boolean {
  if (!requiredIds.length) return true
  const normalizedRouteIds = normalizeRouteIds(routeIds)

  if (!normalizedRouteIds.length) return false

  return requireAny
    ? requiredIds.some((requiredId) => normalizedRouteIds.includes(requiredId))
    : requiredIds.every((requiredId) => normalizedRouteIds.includes(requiredId))
}

function applyVisibility(el: HTMLElement, allowed: boolean) {
  el.style.display = allowed ? "" : "none"
}

function evaluatePermission(el: HTMLElement, binding: DirectiveBinding<number | number[] | string | string[]>) {
  const configStore = useConfigStoreHook()
  const userRouteIds = configStore.user?.routeIds as (number | string)[] | undefined
  const requiredIds = normalizeRequiredIds(binding.value)
  const requireAny = !!binding.modifiers.any
  const allowed = hasPermission(userRouteIds, requiredIds, requireAny)
  applyVisibility(el as HTMLElement, allowed)
}

/**
 * v-permission 指令
 * 用法：
 *  - 要求全部包含： v-permission="[1,2,3]" 或 v-permission="1" 或 v-permission="['1','2']"
 *  - 任一包含即可： v-permission.any="[1,2,3]"
 * 支持数字和字符串类型，会自动进行类型转换比较（如 "1" 和 1 视为相同）
 * 无传值时默认放行。
 */
export const permission: Directive<HTMLElement, number | number[] | string | string[]> = {
  mounted(el, binding) {
    evaluatePermission(el as HTMLElement, binding)
  },
  updated(el, binding) {
    evaluatePermission(el as HTMLElement, binding)
  }
}
