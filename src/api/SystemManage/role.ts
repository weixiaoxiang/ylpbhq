// import request from "@/utils/request";
let baseUrl = "/api"

export const roleApi = {
  //列表查询
  getDataByPage(params: any) {
    return request({
      url: `/Backend/GetPageRoles`,
      method: `get`,
      params
    })
  },

  //添加
  add(data: any) {
    return request({
      url: `/Backend/AddRole`,
      method: `post`,
      data
    })
  },

  //修改
  update(data: any) {
    return request({
      url: `/Backend/UpdateRole`,
      method: `put`,
      data
    })
  },
  //删除
  delete(params: any) {
    return request({
      url: `/Backend/DeleteRoleByRoleId`,
      method: `delete`,
      params
    })
  },
  //详情
  getDetail(params: any): any {
    return request({
      url: `/Backend/GetRoleById`,
      method: `get`,
      params
    })
  },
  //修改状态
  updateStatus(data: any) {
    return request({
      url: `/Backend/UpdateRoleEffective`,
      method: `put`,
      data
    })
  }
}
