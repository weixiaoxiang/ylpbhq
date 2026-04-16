export const communityBuildingApi = {
  //社区共建--获取社区概况左边树结构
  GetCommunityListByTree(params: any) {
    return request({
      url: `/Ecotourism/GetCommunityListByTree`,
      method: `get`,
      params
    })
  },
  //社区共建--获取共建管理问题上报
  GetCommunity_ReportListByPage(params: any) {
    return request({
      url: `/Ecotourism/GetCommunity_ReportListByPage`,
      method: `get`,
      params
    })
  },
  // 社区共建--获取社区概况地图上的
  GetCommunityListByMap(params: any) {
    return request({
      url: `/Ecotourism/GetCommunityListByMap`,
      method: `get`,
      params
    })
  },
  //
  UpdateReportStatue(data: any): any {
    return request({
      url: `/Ecotourism/UpdateReportStatue`,
      method: `put`,
      data
    })
  }
}
