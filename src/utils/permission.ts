import { usePermissionStore } from "@/store/modules/permission"
/**
 * 字符权限校验
 * @param {Array} value 校验值
 * @returns {Boolean}
 */
export function checkPermi(value: string[]) {
  if (value && value instanceof Array && value.length > 0) {
    const { perms } = usePermissionStore()
    const permissionDatas = value
    const all_permission = "*:*:*"
    const permissions = perms
    const hasPermission = permissions.some((permission) => {
      return all_permission === permission || permissionDatas.includes(permission)
    })
    return !!hasPermission
  } else {
    console.error("请设置操作权限标签值")
    return false
  }
}
