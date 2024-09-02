/** 登录并返回 Token */
export function loginApi(data: any) {
  return request({
    requestBase: "VITE_BASE_API_TWO",
    url: "users/login",
    method: "post",
    data
  })
}
export function GetZH_LayerManager(params: any, controller?: AbortController): any {
  return request({
    url: "ZHCxqZl/GetZH_LayerManager",
    method: "get",
    params: params,
    signal: controller && controller.signal
  })
}
