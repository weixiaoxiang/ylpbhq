// const path = require("path")
// const pathSrc = path.resolve(__dirname, "src")
/**
 * pathName:图片资源路径
 * base:基础路径（可选）
 */
export function getImg(pathName: string): string {
  return new URL(`/src/assets/images/${pathName}`, import.meta.url).href
}
