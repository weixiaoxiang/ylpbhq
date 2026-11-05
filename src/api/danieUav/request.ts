import axios, { type AxiosRequestConfig } from "axios"

/**
 * 大鲵 / 司空专用请求
 * 不挂鹞落坪登录 token，避免打到大鲵接口时带上本系统 Authorization
 */
const http = axios.create({
  timeout: 0
})

http.interceptors.request.use((config) => {
  const url = config.url || ""
  // 仅在单独配置了大鲵业务 token 时才带上，不用鹞落坪登录态
  const danieToken = import.meta.env.VITE_DANIE_TOKEN
  // 大鲵业务与文件（航线 kmz 等）共用 Customer Token
  if (danieToken && (url.startsWith("/danieApi") || url.startsWith("/danieFileApi"))) {
    config.headers.Authorization = `Bearer ${danieToken}`
  }
  return config
})

http.interceptors.response.use((response) => {
  if (response.config.responseType === "blob") {
    return response.data
  }
  const data = response.data
  const url = response.config.url || ""
  // 大鲵业务接口补上 status，页面里同时判断 success 和 status
  if (url.startsWith("/danieApi") && data && typeof data === "object" && "success" in data) {
    return {
      status: data.success ? 200 : 500,
      ...data
    }
  }
  return data
})

export interface DanieRequestConfig extends AxiosRequestConfig {
  url: string
}

/** 发起请求，返回后端原始数据（大鲵接口会补 status） */
export function danieRequest<T = unknown>(config: DanieRequestConfig): Promise<T> {
  return http.request(config) as Promise<T>
}
