export const geologicalDisasterApi = {
  //获取所有站点  监测站点
  GetAllGeologicHazardEquipment(params: any) {
    return request({
      url: `/GeologicalHazardMonitoring/GetAllGeologicHazardEquipment`,
      method: `get`,
      params
    })
  },
  //雨量监测
  GetRainfallMonitoring(params: any): any {
    return request({
      url: `/GeologicalHazardMonitoring/GetRainfallMonitoring`,
      method: `get`,
      params
    })
  },

  //设备状态
  GetGeologicHazardDeviceStatus(params: any): any {
    return request({
      url: `/GeologicalHazardMonitoring/GetGeologicHazardDeviceStatus`,
      method: `get`,
      params
    })
  },

  //位移形变监测
  GetDisplacementDeformation(params: any): any {
    return request({
      url: `/GeologicalHazardMonitoring/GetDisplacementDeformation`,
      method: `get`,
      params
    })
  },
  //监测预警
  GeEarlyWarning(params: any): any {
    return request({
      url: `/GeologicalHazardMonitoring/GeEarlyWarning`,
      method: `get`,
      params
    })
  },
  //地表裂缝监测

  GetSurfaceCracks(params: any): any {
    return request({
      url: `/GeologicalHazardMonitoring/GetSurfaceCracks`,
      method: `get`,
      params
    })
  },
  //根据设备id获取最新一条监测数据
  GetGeologicHazardReality(params: any): any {
    return request({
      url: `/GeologicalHazardMonitoring/GetGeologicHazardReality`,
      method: `get`,
      params
    })
  },
  //根据设备id获取最新五条报警记录
  GetLatestAlarmRecord(params: any): any {
    return request({
      url: `/GeologicalHazardMonitoring/GetLatestAlarmRecord`,
      method: `get`,
      params
    })
  },
  GeEarlyWarningByEqId(params: any): any {
    return request({
      url: `/GeologicalHazardMonitoring/GeEarlyWarningByEqId`,
      method: `get`,
      params
    })
  },

  //根据设备id获取土壤含水率监测
  GetSoilMoistureContent(params: any): any {
    return request({
      url: `/GeologicalHazardMonitoring/GetSoilMoistureContent`,
      method: `get`,
      params
    })
  },
  //左边树结构
  GeologicHazard_VideoTree(params: any): any {
    return request({
      url: `/GeologicalHazardMonitoring/GeologicHazard_VideoTree`,
      method: `get`,
      params
    })
  },
  GeologicHazard_DevicSelect(params: any): any {
    return request({
      url: `/GeologicalHazardMonitoring/GeologicHazard_DevicSelect`,
      method: `get`,
      params
    })
  },
  //分页查询告警记录列表
  GetPageAlarmRecord(data: any): any {
    return request({
      url: `/GeologicalHazardMonitoring/GetPageAlarmRecord`,
      method: `post`,
      data
    })
  }
}

export const videoApi = {
  //待修改
  getPlayVideoUrl(params: any): any {
    return request({
      url: `/GeologicalHazardMonitoring/getPlayVideoUrl`,
      method: `get`,
      params
    })
  }
}
