import axios, { type AxiosRequestConfig } from "axios"
import { getToken } from "@/utils/cache/cookies"

/**
 * 无人机业务请求：走鹞落坪 /api，携带登录 Token
 * 司空 OpenAPI（/uavApi）仍用调用方传入的 X-User-Token，不挂本系统 Authorization
 */
const http = axios.create({
  timeout: 0
})

const API_BASE = import.meta.env.VITE_BASE_API

http.interceptors.request.use((config) => {
  const url = config.url || ""
  if (url.startsWith("/uavApi")) {
    config.baseURL = ""
    return config
  }
  config.baseURL = API_BASE
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use((response) => {
  if (response.config.responseType === "blob") {
    return response.data
  }
  const data = response.data
  const url = response.config.url || ""
  const isSikong = url.startsWith("/uavApi")
  if (
    !isSikong &&
    data &&
    typeof data === "object" &&
    "success" in data &&
    typeof (data as { success?: unknown }).success === "boolean"
  ) {
    const ok = (data as { success: boolean }).success
    return {
      status: ok ? 200 : 500,
      ...data
    }
  }
  if (!isSikong && data && typeof data === "object" && "code" in data && !("status" in data)) {
    const code = (data as { code?: number }).code
    const ok = code === 0 || code === 200
    return {
      status: ok ? 200 : 500,
      ...data
    }
  }
  return data
})

/** 发起无人机相关请求 */
export function uavRequest<T = unknown>(config: AxiosRequestConfig): Promise<T> {
  return http.request(config) as Promise<T>
}
