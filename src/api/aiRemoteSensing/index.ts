// 森林资源
export const forestResourcesApi = {
  //森林资源-分类获取森林资源分析
  getTypeForestResources(params: any) {
    return request({
      url: `/ForestResources/GetTypeForestResources`,
      method: `get`,
      params
    })
  },
  //森林资源-获取森林资源列表
  getPageForestResources(params: any) {
    return request({
      url: `/ForestResources/GetPageForestResources`,
      method: `get`,
      params
    })
  }
}
// 一张图
export const oneMapApi = {
  //地理信息-监测设备
  getMonitorEquipmentList(params: any) {
    return request({
      url: `/ForestResources/GetMonitorEquipmentList`,
      method: `get`,
      params
    })
  }
}
// 专题图
export const topicMapApi = {
  //专题地图-获取专题地图列表
  getTopicMaps(params: any) {
    return request({
      url: `/ForestResources/GetTopicMaps`,
      method: `get`,
      params
    })
  }
}
// 地类对比
export const landTypeApi = {
  //影像管理-获取影像数据
  getSys_LayerImageInformation(params: any) {
    return request({
      url: `/ALargeScreenImage/GetSys_LayerImageInformation`,
      method: `get`,
      params
    })
  },
  //地类对比-获取地类变化列表-时间集合下拉
  getLandTypeChange_timeframe(params: any) {
    return request({
      url: `/ForestResources/GetLandTypeChange_timeframe`,
      method: `get`,
      params
    })
  },
  //地类对比- 获取地类变化列表
  getLandTypeChangeList(params: any) {
    return request({
      url: `/ForestResources/GetLandTypeChangeList`,
      method: `get`,
      params
    })
  }
}
