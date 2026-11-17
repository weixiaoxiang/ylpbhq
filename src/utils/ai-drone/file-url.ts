/** 无人机抓拍/录像静态资源前缀（开发代理 /fileApi） */
export const UAV_FILE_API = "/fileApi"

/** 拼接抓拍图片等相对路径 */
export function uavFileUrl(path?: string | null): string {
  if (path == null || path === "") return ""
  const text = String(path).trim()
  if (/^https?:\/\//i.test(text)) return text
  if (text.startsWith(`${UAV_FILE_API}/`) || text === UAV_FILE_API) return text
  return `${UAV_FILE_API}${text.startsWith("/") ? text : `/${text}`}`
}

/** 视频库播放地址：绝对地址直连，相对路径走文件代理 */
export function uavVideoPlayUrl(path?: string | null): string {
  if (path == null || path === "") return ""
  let trimmed = String(path).trim()
  if (/^\/fileApi(?=https?:\/\/)/i.test(trimmed)) {
    trimmed = trimmed.replace(/^\/fileApi/i, "")
  }
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return uavFileUrl(trimmed)
}
