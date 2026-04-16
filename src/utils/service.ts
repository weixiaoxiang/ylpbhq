import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios"
import axiosController from "@/utils/axios-controller"
import { ElMessage } from "element-plus"
import { get, merge } from "lodash-es"
import { getToken } from "./cache/cookies"
import { RefreshToken } from "@/api"
// 根据requestBase参数引入多个baseURL的解决方案
interface BaseAxiosRequestConfig extends AxiosRequestConfig {
  requestBase?: string
}
// 控制刷新token的状态
let isRefreshing = false
// 存储刷新token期间过来的401请求
let requestList: any[] = []
/** 创建请求实例 */
function createService() {
  // 创建一个 axios 实例命名为 service
  const service = axios.create()
  // 请求拦截
  service.interceptors.request.use(
    (config) => {
      // 添加cancelToken
      config.cancelToken = new axios.CancelToken((cancel: any) => {
        const url = config.url || ""
        axiosController.addPending(url, cancel)
      })
      return config
    },
    // 发送失败
    (error) => Promise.reject(error)
  )
  // 响应拦截（可根据具体业务作出相应的调整）
  service.interceptors.response.use(
    (response) => {
      // 在响应之后，移除已完成的请求
      const url = response.config.url || ""
      axiosController.removePending(url)
      // apiData 是 api 返回的数据
      const apiData = response.data
      // 二进制数据则直接返回
      const responseType = response.request?.responseType
      if (responseType === "blob" || responseType === "arraybuffer") return apiData
      // 这个 code 是和后端约定的业务 code
      let code
      if ("code" in apiData) {
        code = apiData.code
      } else if ("status" in apiData) {
        code = apiData.status
      }
      // 如果没有 code, 代表这不是项目后端开发的 api
      if (code === undefined) {
        ElMessage.error("非本系统的接口")
        return Promise.reject(new Error("非本系统的接口"))
      }
      switch (code) {
        case 0:
          // 本系统采用 code === 0 来表示没有业务错误
          return apiData
        case 200:
          // 本系统采用 code === 200 来表示没有业务错误
          return apiData
        default:
          console.log(response)

          // 不是正确的 code
          ElMessage.error(apiData.msg || "Error")
          return Promise.reject(new Error("Error"))
      }
    },
    async (error) => {
      // 在响应之后，移除已完成的请求cancelToken
      if (error.config) {
        const url = error.config.url || ""
        axiosController.removePending(url)
      }

      const originalRequest = error.config
      // status 是 HTTP 状态码
      const status = get(error, "response.status")
      switch (status) {
        case 400:
          error.message = "请求错误"
          break
        case 401:
          // Token 过期时
          error.message = "token失效"
          break
        case 403:
          error.message = "拒绝访问"
          break
        case 404:
          error.message = "请求地址出错"
          break
        case 408:
          error.message = "请求超时"
          break
        case 429:
          error.message = "访问过于频繁，请稍后重试"
          break
        case 500:
          error.message = "服务器内部错误"
          break
        case 501:
          error.message = "服务未实现"
          break
        case 502:
          error.message = "网关错误"
          break
        case 503:
          error.message = "服务不可用"
          break
        case 504:
          error.message = "网关超时"
          break
        case 505:
          error.message = "HTTP 版本不受支持"
          break
        default:
          break
      }
      if (error.message === "canceled") {
        // 判断axios请求是否被中断
      } else if (error.message === "token失效" && !originalRequest._retry) {
        // token失效，无感知刷新token
        if (!isRefreshing) {
          // ElMessage.warning("token验证失效,正在刷新token...")
          isRefreshing = true
          originalRequest._retry = true
          try {
            const { response } = await RefreshToken({ token: getToken() })
            setToken(response.token)
            originalRequest.headers["Authorization"] = "Bearer " + response.token
            // console.log("1.刷新token成功,新的token:", response.token)
            requestList.forEach((cb) => cb(response.token))
            requestList = []
            return service(originalRequest)
          } catch (e) {
            requestList = []
            useConfigStoreHook().logout() // 重定向到登录页面
            return Promise.reject(e)
          } finally {
            isRefreshing = false
          }
        }
        // 正在刷新中，把请求挂起
        return new Promise((resolve) => {
          requestList.push((token: any) => {
            // console.log(originalRequest, "2.正在重新请求接口，使用新的token")
            originalRequest.headers["Authorization"] = "Bearer " + token
            resolve(service(originalRequest))
          })
        })
      } else if (error.message === "页面路由切换，取消未响应的请求") {
        return Promise.reject("页面路由切换，取消未响应的请求")
      } else {
        // console.log("谢谢, 请再试一次")
        ElMessage.error(error.message)
      }
      return Promise.reject(error)
    }
  )
  return service
}

/** 创建请求方法 */
function createRequest(service: AxiosInstance) {
  return function <T>(config: BaseAxiosRequestConfig): Promise<T> {
    const token = getToken()
    let baseURL = import.meta.env.VITE_BASE_API
    // 使用第二套API
    if (config.requestBase == "VITE_BASE_API_TWO") {
      baseURL = import.meta.env.VITE_BASE_API_TWO
    } else if (config.requestBase) {
      baseURL = config.requestBase
    }
    let ContentType = ""
    if (config.method === "get") {
      ContentType = "application/x-www-form-urlencoded;charset=UTF-8" // form data
    } else {
      ContentType = "application/json;charset=UTF-8" // request payload
    }
    const defaultConfig = {
      headers: {
        // 携带 Token
        Authorization: token ? `Bearer ${token}` : undefined,
        "Content-Type": ContentType
      },
      timeout: 0, //5000,
      baseURL: baseURL,
      data: {}
    }
    // 将默认配置 defaultConfig 和传入的自定义配置 config 进行合并成为 mergeConfig
    const mergeConfig = merge(defaultConfig, config)
    return service(mergeConfig)
  }
}

/** 用于网络请求的实例 */
const service = createService()
/** 用于网络请求的方法 */
export const request = createRequest(service)
