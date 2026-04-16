export const menuApi = {
  //列表查询
  getDataTree(params: any): any {
    return request({
      url: `/Backend/GetRouteTree`,
      method: `get`,
      params
    })
  },

  //添加
  add(data: any) {
    return request({
      url: `/Backend/AddRoute`,
      method: `post`,
      data
    })
  },

  //修改
  update(data: any) {
    return request({
      url: `/Backend/UpdateRoute`,
      method: `put`,
      data
    })
  },
  //删除
  delete(params: any) {
    return request({
      url: `/Backend/DeleteRouteByRouteId`,
      method: `delete`,
      params
    })
  },
  //详情
  getDetail(params: any) {
    return request({
      url: `/Backend/GetRouteById`,
      method: `get`,
      params
    })
  }
}
