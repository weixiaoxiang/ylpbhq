import dayjs from "dayjs"

/** 格式化时间 */
export const formatDateTime = (time: string | number | Date) => {
  return time ? dayjs(new Date(time)).format("YYYY-MM-DD HH:mm:ss") : "N/A"
}
export const formatTime = (time: string | number | Date) => {
  return time ? dayjs(new Date(time)).format("HH:mm:ss") : "N/A"
}

/** 用 JS 获取全局 css 变量 */
export const getCssVariableValue = (cssVariableName: string) => {
  let cssVariableValue = ""
  try {
    // 没有拿到值时，会返回空串
    cssVariableValue = getComputedStyle(document.documentElement).getPropertyValue(cssVariableName)
  } catch (error) {
    console.error(error)
  }
  return cssVariableValue
}

/** 用 JS 设置全局 CSS 变量 */
export const setCssVariableValue = (cssVariableName: string, cssVariableValue: string) => {
  try {
    document.documentElement.style.setProperty(cssVariableName, cssVariableValue)
  } catch (error) {
    console.error(error)
  }
}

/** 重置项目配置 */
export const resetConfigLayout = () => {
  // removeConfigLayout()
  location.reload()
}

// const path = require("path")
// const pathSrc = path.resolve(__dirname, "src")
/**
 * pathName:图片资源路径
 * base:基础路径（可选）
 */
export function getImg(pathName: string): string {
  return new URL(`/src/assets/images/${pathName}`, import.meta.url).href
}
