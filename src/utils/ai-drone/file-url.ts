/** 大鲵文件服务前缀，对应开发代理 /danieFileApi */
export const DANIE_FILE_API = "/danieFileApi"

/** 拼接抓拍图片等相对路径 */
export function danieFileUrl(path?: string | null): string {
  if (path == null || path === "") return ""
  const text = String(path).trim()
  if (/^https?:\/\//i.test(text)) return text
  if (text.startsWith(`${DANIE_FILE_API}/`) || text === DANIE_FILE_API) return text
  return `${DANIE_FILE_API}${text.startsWith("/") ? text : `/${text}`}`
}

/** 视频库播放地址：绝对地址直连，相对路径走文件代理 */
export function danieVideoPlayUrl(path?: string | null): string {
  if (path == null || path === "") return ""
  let trimmed = String(path).trim()
  if (/^\/danieFileApi(?=https?:\/\/)/i.test(trimmed) || /^\/fileApi(?=https?:\/\/)/i.test(trimmed)) {
    trimmed = trimmed.replace(/^\/(danieFileApi|fileApi)/i, "")
  }
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return danieFileUrl(trimmed)
}
