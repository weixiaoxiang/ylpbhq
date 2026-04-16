// import request from "@/utils/request";
let baseUrl = "/api"

export const userApi = {
  //列表查询
  getDataByPage(params: any) {
    return request({
      url: `/Backend/GetPageUsers`,
      method: `get`,
      params
    })
  },
  //添加
  add(data: any) {
    return request({
      url: `/Backend/AddUser`,
      method: `post`,
      data
    })
  },

  //修改
  update(data: any) {
    return request({
      url: `/Backend/PutUser`,
      method: `put`,
      data
    })
  },
  //删除
  delete(params: any) {
    return request({
      url: `/Backend/DeleteUserByUserId`,
      method: `delete`,
      params
    })
  },
  //详情
  getDetail(params: any) {
    return request({
      url: `/Backend/GetUserByUserId`,
      method: `get`,
      params
    })
  },
  //修改密码
  updatePwd(data: any) {
    return request({
      url: `/Backend/PutPwdByUserId`,
      method: `put`,
      data: data
    })
  },
  //重置密码
  // resetPwd(params: any) {
  //   return request({
  //     url: `/Backend/ResetPwd`,
  //     method: `get`,
  //     params,
  //   });
  // },
  //修改状态
  updateStatus(params: any) {
    return request({
      url: `/Backend/PutUserStatusByUserId`,
      method: `put`,
      params
    })
  }
}
