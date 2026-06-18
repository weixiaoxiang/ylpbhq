/** 使用说明（操作指南）列表项 */
export interface SysCzznListItem {
  id: number
  name: string
  path: string
  /** 资源类型，如 pdf、mp4 */
  type: string
  sort: number
}

/** /api/Backend/SysCzznList 响应体 */
export interface SysCzznListApiResult {
  status: number
  success: boolean
  msg: string
  msgDev: string
  response: SysCzznListItem[]
}

export const usageInstructionsApi = {
  /** 使用说明列表 */
  getSysCzznList() {
    return request({
      url: `/Backend/SysCzznList`,
      method: `get`
    }) as Promise<SysCzznListApiResult>
  }
}
