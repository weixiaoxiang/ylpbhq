/** 司空 OpenAPI Token，只读环境变量，不使用鹞落坪登录 token */
export function getSikongToken(): string {
  return import.meta.env.VITE_SIKONG_TOKEN || ""
}

/** 下载司空航线文件时需带的请求头参数 */
export interface SikongAuthHeader {
  token: string
  projectUuid: string
}

export function sikongAuthHeaders(header: SikongAuthHeader) {
  return {
    "X-User-Token": header.token,
    "X-Project-Uuid": header.projectUuid
  }
}

/** 设备列表把父级机场和 drones[0] 合成一条 */
export function mapDroneDeviceItem(item: { drones?: Record<string, unknown>[] }) {
  const drone = item.drones?.[0]
  if (!drone) return null
  return { ...item, ...drone }
}
