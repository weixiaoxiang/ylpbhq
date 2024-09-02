// const path = require("path")
// const pathSrc = path.resolve(__dirname, "src")
/**
 * pathName:图片资源路径
 * base:基础路径（可选）
 */
export function getAssetsImages(pathName: string, base?: string) {
  if (!base) {
    return new URL(`/src/assets/images/${pathName}`, import.meta.url).href
  } else {
    const strPath = `/src/assets/${base}` + `${pathName}`
    return new URL(strPath, import.meta.url).href
  }
}
