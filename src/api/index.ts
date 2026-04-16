// @ts-ignore
import qs from "qs"
/** 登录并返回 Token */
export function loginApi(data: any) {
  return request({
    requestBase: "VITE_BASE_API_TWO",
    url: "users/login",
    method: "post",
    data
  })
}
// /images/Upload/Pic
export function picUpload(data: any) {
  return request({
    url: "/picUpload/images/Upload/Pic",
    // url: "/gqqApi/Img/UploadPicToFile",
    method: "post",
    data
  })
}

// PC登录
export function LoginByPc(params: any): any {
  return request({
    url: "Login/LoginByPc",
    method: "post",
    headers: {
      "Content-Type": "application/json;charset=UTF-8"
    },
    data: params
  })
}

export function sendSmsCodeApi(params: any): any {
  return request({
    url: "Login/GetSMSCode",
    method: "get",
    params
  })
}
export function loginSms(data: any): any {
  return request({
    url: "Login/LoginByCode",
    method: "post",
    data
  })
}
// /api/Backend/LoginMethodList
export function LoginMethodList(): any {
  return request({
    url: "Backend/LoginMethodList",
    method: "put"
  })
}
// PutLoginMethod
export function PutLoginMethod(data: any): any {
  return request({
    url: "Backend/PutLoginMethod",
    method: "put",
    data
  })
}
// 请求刷新token
export function RefreshToken(params: any): any {
  return request({
    url: "Login/RefreshToken",
    method: "get",
    params: params
  })
}
// 巡护概况-最新轨迹 /api/IntelligentPatrol/GetXhgk_XhgjList
export function GetXhgk_XhgjList(params: any): any {
  return request({
    url: "IntelligentPatrol/GetXhgk_XhgjList",
    method: "get",
    params: params
  })
}
// 巡护概况-最新采集/api/IntelligentPatrol/GetXhgk_CollectionList
export function GetXhgk_CollectionList(params: any): any {
  return request({
    url: "IntelligentPatrol/GetXhgk_CollectionList",
    method: "get",
    params: params
  })
}
// 巡护概况-巡护均值/api/IntelligentPatrol/GetAveragePatrolValue
export function GetAveragePatrolValue(params: any): any {
  return request({
    url: "IntelligentPatrol/GetAveragePatrolValue",
    method: "get",
    params: params
  })
}
// 巡护概况-基础信息/api/IntelligentPatrol/GetXhgk_HeadTj
export function GetXhgk_HeadTj(params: any): any {
  return request({
    url: "IntelligentPatrol/GetXhgk_HeadTj",
    method: "get",
    params: params
  })
}
// 巡护概况-趋势分析/api/IntelligentPatrol/GetTrendAnalysis
export function GetTrendAnalysis(params: any): any {
  return request({
    url: "IntelligentPatrol/GetTrendAnalysis",
    method: "get",
    params: params
  })
}
// 巡护概况-获取当前巡护人员信息(实时定位)/api/IntelligentPatrol/GetXhgk_XhOnlineList
export function GetXhgk_XhOnlineList(): any {
  return request({
    url: "IntelligentPatrol/GetXhgk_XhOnlineList",
    method: "get"
  })
}
// 巡护概况-实时巡护-机构人员状态树
export function GetSsxh_UserTree(params: any): any {
  return request({
    url: "IntelligentPatrol/GetSsxh_UserTree",
    method: "get",
    params: params
  })
}
// 巡护概况-实时巡护-根据用户id获取当前巡护人员详细信息
export function GetSsxh_XhUserInfoByUserId(params: any): any {
  return request({
    url: "IntelligentPatrol/GetSsxh_XhUserInfoByUserId",
    method: "get",
    params: params
  })
}
// 巡护概况-地图功能区划查询/api/IntelligentPatrol/GetMapLineGnqh
export function GetMapLineGnqh(): any {
  return request({
    url: "IntelligentPatrol/GetMapLineGnqh",
    method: "get"
  })
}

// 巡护概况-地图界线查询/api/IntelligentPatrol/GetMapLineJx
export function GetMapLineJx(): any {
  return request({
    url: "IntelligentPatrol/GetMapLineJx",
    method: "get"
  })
}
// /api/IntelligentPatrol/GetTaskRouteByPage任务管理-任务路线管理-任务路线查询
export function GetTaskRouteByPage(params: any): any {
  return request({
    url: "IntelligentPatrol/GetTaskRouteByPage",
    method: "get",
    params
  })
}
// /api/Backend/GetSsxh_OrgTree 任务管理-任务路线管理-任务路线查询机构树
export function GetSsxh_OrgTree(params: any): any {
  return request({
    url: "Backend/GetSsxh_OrgTree",
    method: "get",
    params
  })
}
// /api/IntelligentPatrol/Addxh_taskroute 任务管理-任务路线管理-任务路线添加
export function Addxh_taskroute(data: any): any {
  return request({
    url: "IntelligentPatrol/Addxh_taskroute",
    method: "post",
    data
  })
}
// /api/IntelligentPatrol/Addxh_taskclockin 任务管理-任务管理-添加打卡点
export function Addxh_taskclockin(data: any): any {
  return request({
    url: "IntelligentPatrol/Addxh_taskclockin",
    method: "post",
    data
  })
}
// /api/IntelligentPatrol/Getxh_taskclockinByPage 任务管理-任务管理-打卡点查询
export function Getxh_taskclockinByPage(params: any): any {
  return request({
    url: "IntelligentPatrol/Getxh_taskclockinByPage",
    method: "get",
    params
  })
}
// /api/IntelligentPatrol/Updatexh_taskclockin 任务管理-任务管理-修改打卡点
export function Updatexh_taskclockin(data: any): any {
  return request({
    url: "IntelligentPatrol/Updatexh_taskclockin",
    method: "put",
    data
  })
}
// /api/IntelligentPatrol/Updatexh_taskroute 任务管理-任务路线管理-任务路线修改
export function Updatexh_taskroute(data: any): any {
  return request({
    url: "IntelligentPatrol/Updatexh_taskroute",
    method: "put",
    data
  })
}
// /api/IntelligentPatrol/Deletexh_taskroute 任务管理-任务路线管理-任务路线根据id删除
export function Deletexh_taskroute(params: any): any {
  return request({
    url: "IntelligentPatrol/Deletexh_taskroute",
    method: "get",
    params
  })
}
// /api/IntelligentPatrol/Getxh_taskinfoByPage 任务管理-任务管理-任务查询
export function Getxh_taskinfoByPage(params: any): any {
  return request({
    url: "IntelligentPatrol/Getxh_taskinfoByPage",
    method: "get",
    params
  })
}
// /api/IntelligentPatrol/Getxh_taskmissonByPage 任务管理-派发管理-派发查询
export function Getxh_taskmissonByPage(params: any): any {
  return request({
    url: "IntelligentPatrol/Getxh_taskmissonByPage",
    method: "get",
    params
  })
}
// /api/IntelligentPatrol/Addxh_taskinfo 任务管理-任务管理-创建任务
export function Addxh_taskinfo(data: any): any {
  return request({
    url: "IntelligentPatrol/Addxh_taskinfo",
    method: "post",
    data
  })
}
// /api/IntelligentPatrol/Updatexh_taskinfo 任务管理-任务管理-修改任务
export function Updatexh_taskinfo(data: any): any {
  return request({
    url: "IntelligentPatrol/Updatexh_taskinfo",
    method: "put",
    data
  })
}
// /api/IntelligentPatrol/Deletexh_taskinfo
export function Deletexh_taskinfo(params: any): any {
  return request({
    url: "IntelligentPatrol/Deletexh_taskinfo",
    method: "get",
    params
  })
}
// /api/IntelligentPatrol/GetMissonByTaskId 任务管理-任务管理-查询任务的派发记录
export function GetMissonByTaskId(params: any): any {
  return request({
    url: "IntelligentPatrol/GetMissonByTaskId",
    method: "get",
    params
  })
}

// /api/IntelligentPatrol/Addxh_taskmisson  任务管理-任务下发-任务派发
export function Addxh_taskmisson(data: any): any {
  return request({
    url: "IntelligentPatrol/Addxh_taskmisson",
    method: "post",
    data
  })
}

// /api/IntelligentPatrol/GetRwgl_Gjxq 任务管理-任务派发-轨迹详情-巡护记录
export function GetRwgl_Gjxq(params: any): any {
  return request({
    url: "IntelligentPatrol/GetRwgl_Gjxq",
    method: "get",
    params
  })
}
// GetXhgj_XhgjListByPage
export function GetXhgj_XhgjListByPage(params: any): any {
  return request({
    url: "IntelligentPatrol/GetXhgj_XhgjListByPage",
    method: "get",
    params
  })
}
// GetPatrolTimeAxis
export function GetPatrolTimeAxis(params: any): any {
  return request({
    url: "IntelligentPatrol/GetPatrolTimeAxis",
    method: "get",
    params
  })
}
// GetPatrolTrajectoryRoute
export function GetPatrolTrajectoryRoute(params: any): any {
  return request({
    url: "IntelligentPatrol/GetPatrolTrajectoryRoute",
    method: "get",
    params
  })
}
// 科研监测
// /api/EnvironmentalMonitoring/GetAllEnvironmentalEquipment
export function GetAllEnvironmentalEquipment(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetAllEnvironmentalEquipment",
    method: "get",
    params
  })
}
// /api/EnvironmentalMonitoring/GetEnvironmentalReality
export function GetEnvironmentalReality(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetEnvironmentalReality",
    method: "get",
    params
  })
}
export function GetMeteorologicalSituation(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetMeteorologicalSituation",
    method: "get",
    params
  })
}
// GetAirQualityStatistics
export function GetAirQualityStatistics(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetAirQualityStatistics",
    method: "get",
    params
  })
}
// GetAirQualityStatistics_yxt
export function GetAirQualityStatistics_yxt(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetAirQualityStatistics_yxt",
    method: "get",
    params
  })
}
// GetAlarmClassificationStatistics
export function GetAlarmClassificationStatistics(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetAlarmClassificationStatistics",
    method: "get",
    params
  })
}
// GetMeteorologicalIndicatorsToDay
export function GetMeteorologicalIndicatorsToDay(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetMeteorologicalIndicatorsToDay",
    method: "get",
    params
  })
}
// GetWaterQualityStatistics
export function GetWaterQualityStatistics(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetWaterQualityStatistics",
    method: "get",
    params
  })
}
// GetWaterQualityIndicatorsToDay
export function GetWaterQualityIndicatorsToDay(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetWaterQualityIndicatorsToDay",
    method: "get",
    params
  })
}
// GetCurrentWaterQuality
export function GetCurrentWaterQuality(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetCurrentWaterQuality",
    method: "get",
    params
  })
}
// GetWaterQualityIndicators
export function GetWaterQualityIndicators(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetWaterQualityIndicators",
    method: "get",
    params
  })
}
// /GetPageAlarms
export function GetPageAlarms(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetPageAlarms",
    method: "get",
    params
  })
}

export function GetWaterStatisticalAnalysis_list(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetWaterStatisticalAnalysis_list",
    method: "get",
    params
  })
}
// GetEnvironmentStatisticalAnalysis_list
export function GetEnvironmentStatisticalAnalysis_list(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetEnvironmentStatisticalAnalysis_list",
    method: "get",
    params
  })
}
export function GetWaterStatisticalAnalysis_Zxt(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetWaterStatisticalAnalysis_Zxt",
    method: "get",
    params
  })
}
export function GetEnvironmentStatisticalAnalysis_Zxt(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetEnvironmentStatisticalAnalysis_Zxt",
    method: "get",
    params
  })
}
// GetAllMonitoringList
export function GetAllMonitoringList(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetAllMonitoringList",
    method: "get",
    params
  })
}
// GetCarIndicatorsToDay
export function GetCarIndicatorsToDay(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetCarIndicatorsToDay",
    method: "get",
    params
  })
}
// GetCarIndicatorsToTime_Crkfx
export function GetCarIndicatorsToTime_Crkfx(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetCarIndicatorsToTime_Crkfx",
    method: "get",
    params
  })
}
// GetCarIndicatorsToTime_Llqs
export function GetCarIndicatorsToTime_Llqs(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetCarIndicatorsToTime_Llqs",
    method: "get",
    params
  })
}
// GetCarListByPage
export function GetCarListByPage(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetCarListByPage",
    method: "get",
    params
  })
}
// GetJckhbToDay
export function GetJckhbToDay(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetJckhbToDay",
    method: "get",
    params
  })
}
// GetCarManangListByPage
export function GetCarManangListByPage(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetCarManangListByPage",
    method: "get",
    params
  })
}
// GetCarBackListByPage
export function GetCarBackListByPage(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetCarBackListByPage",
    method: "get",
    params
  })
}
// EnvironmentalMonitoring/GetPestEquipmentStatistics_Rlfbt
export function GetPestEquipmentStatistics_Rlfbt(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetPestEquipmentStatistics_Rlfbt",
    method: "get",
    params
  })
}
export function GetInfraredCamera_Rlt(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetInfraredCamera_Rlt",
    method: "get",
    params
  })
}
// GetAlarmToDayCount
export function GetAlarmToDayCount(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetAlarmToDayCount",
    method: "get",
    params
  })
}
// GetCarInsideListByPage
export function GetCarInsideListByPage(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetCarInsideListByPage",
    method: "get",
    params
  })
}
// /api/EnvironmentalMonitoring/GetInfraredCamera_Push
export function GetInfraredCamera_Push(data?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetInfraredCamera_Push",
    method: "put",
    data
  })
}
// /api/EnvironmentalMonitoring/GetInfraredCamera_Collect
export function GetInfraredCamera_Collect(data?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetInfraredCamera_Collect",
    method: "put",
    data
  })
}
export function GetInfraredCamera_Deletexh(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetInfraredCamera_Deletexh",
    method: "delete",
    params,
    // 👇 关键部分：告诉 axios 用重复参数形式
    paramsSerializer: (params) => qs.stringify(params, { arrayFormat: "repeat" })
  })
}
// GetCarGjListByPage
export function GetCarGjListByPage(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetCarGjListByPage",
    method: "get",
    params
  })
}
// PutCarIsSwById
export function PutCarIsSwById(data?: any): any {
  return request({
    url: "EnvironmentalMonitoring/PutCarIsSwById",
    method: "put",
    data
  })
}
// GetCarTravelListByPage
export function GetCarTravelListByPage(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetCarTravelListByPage",
    method: "get",
    params
  })
}
// GetCarVehicleTypeName
export function GetCarVehicleTypeName(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetCarVehicleTypeName",
    method: "get",
    params
  })
}
export function APP_GetElectronicfenceWarnTypeSelect(params?: any): any {
  return request({
    url: "App/APP_GetElectronicfenceWarnTypeSelect",
    method: "get",
    params
  })
}
// GetSpecialTimeCarListByPage
export function GetSpecialTimeCarListByPage(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetSpecialTimeCarListByPage",
    method: "get",
    params,
    // 👇 关键部分：告诉 axios 用重复参数形式
    paramsSerializer: (params) => qs.stringify(params, { arrayFormat: "repeat" })
  })
}
// AddCarBackIn
export function AddCarBackIn(data?: any): any {
  return request({
    url: "EnvironmentalMonitoring/AddCarBackIn",
    method: "post",
    data
  })
}
// GetCarAlarmListByPage
export function GetCarAlarmListByPage(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetCarAlarmListByPage",
    method: "get",
    params
  })
}
// GetCarBackListInfo_Jcjltj
export function GetCarBackListInfo_Jcjltj(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetCarBackListInfo_Jcjltj",
    method: "get",
    params
  })
}
// GetfaceStatisticalAnalysis_Zpslqs
export function GetfaceStatisticalAnalysis_Zpslqs(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetfaceStatisticalAnalysis_Zpslqs",
    method: "get",
    params
  })
}
// GetfaceStatisticalAnalysis_Zpddfx
export function GetfaceStatisticalAnalysis_Zpddfx(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetfaceStatisticalAnalysis_Zpddfx",
    method: "get",
    params
  })
}
// GetfaceStatisticalAnalysis_Rylxfx
export function GetfaceStatisticalAnalysis_Rylxfx(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetfaceStatisticalAnalysis_Rylxfx",
    method: "get",
    params
  })
}
// GetfaceStatisticalAnalysis_Xbfx
export function GetfaceStatisticalAnalysis_Xbfx(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetfaceStatisticalAnalysis_Xbfx",
    method: "get",
    params
  })
}
// GetfaceListByPage
export function GetfaceListByPage(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetfaceListByPage",
    method: "get",
    params
  })
}
// GetVideoStatisticalAnalysis_Sbgk
export function GetVideoStatisticalAnalysis_Sbgk(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetVideoStatisticalAnalysis_Sbgk",
    method: "get",
    params
  })
}
// GetVideoStatisticalAnalysis_Sbtj
export function GetVideoStatisticalAnalysis_Sbtj(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetVideoStatisticalAnalysis_Sbtj",
    method: "get",
    params
  })
}
// GetVideoTree
export function GetVideoTree(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetVideoTree",
    method: "get",
    params
  })
}
// GetMmonitoringCj
export function GetMmonitoringCj(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetMmonitoringCj",
    method: "get",
    params
  })
}
export function GetInfraredCameraSpeciesList(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetInfraredCameraSpeciesList",
    method: "get",
    params
  })
}
// MmonitoringCjAddUpdate
export function MmonitoringCjAddUpdate(data?: any): any {
  return request({
    url: "EnvironmentalMonitoring/MmonitoringCjAddUpdate",
    method: "post",
    data
  })
}
// GetPreviewURLByType
export function GetPreviewURLByType(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetPreviewURLByType",
    method: "get",
    params
  })
}
export function GeologicHazard_VideoPlay(params?: any): any {
  return request({
    url: "GeologicalHazardMonitoring/GeologicHazard_VideoPlay",
    method: "get",
    params
  })
}
// GetAlarmmsgStatisticalAnalysis_Top
export function GetAlarmmsgStatisticalAnalysis_Top(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetAlarmmsgStatisticalAnalysis_Top",
    method: "get",
    params
  })
}
// GetAlarmmsgStatisticalAnalysis_Sbzpl
export function GetAlarmmsgStatisticalAnalysis_Sbzpl(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetAlarmmsgStatisticalAnalysis_Sbzpl",
    method: "get",
    params
  })
}
// GetAlarmmsgStatisticalAnalysis_Sbfx
export function GetAlarmmsgStatisticalAnalysis_Sbfx(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetAlarmmsgStatisticalAnalysis_Sbfx",
    method: "get",
    params
  })
}
// GetAlarmmsgStatisticalAnalysis_Lbfx
export function GetAlarmmsgStatisticalAnalysis_Lbfx(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetAlarmmsgStatisticalAnalysis_Lbfx",
    method: "get",
    params
  })
}
// /GetAlarmmsgStatisticalAnalysis_Sjgk
export function GetAlarmmsgStatisticalAnalysis_Sjgk(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetAlarmmsgStatisticalAnalysis_Sjgk",
    method: "get",
    params
  })
}
// GetAlarmmsgListByPage
export function GetAlarmmsgListByPage(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetAlarmmsgListByPage",
    method: "get",
    params
  })
}
// GetAlarmmsgStatus
export function GetAlarmmsgStatus(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetAlarmmsgStatus",
    method: "get",
    params
  })
}
// PutOneAssessment
export function PutOneAssessment(data?: any): any {
  return request({
    url: "EnvironmentalMonitoring/PutOneAssessment",
    method: "put",
    // paramsSerializer: {
    //   indexes: null // 这样会生成 id=1&id=2&id=3 的形式
    // },
    data: data
  })
}
// GetIrcameraStatisticalAnalysis_Sbgk
export function GetIrcameraStatisticalAnalysis_Sbgk(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetIrcameraStatisticalAnalysis_Sbgk",
    method: "get",
    params
  })
}
// GetIrcameraStatisticalAnalysis_Sbzpl
export function GetIrcameraStatisticalAnalysis_Sbzpl(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetIrcameraStatisticalAnalysis_Sbzpl",
    method: "get",
    params
  })
}
// GetHwxjZpByPage
export function GetHwxjZpByPage(params?: any): any {
  return request({
    url: "Img/GetHwxjZpByPage",
    method: "get",
    params
  })
}
export function GetInfraredCamera_FindFile(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetInfraredCamera_FindFile",
    method: "get",
    params
  })
}
export function InfraredCameraDownloadFilesAsZip(data?: any): any {
  return request({
    url: "EnvironmentalMonitoring/InfraredCameraDownloadFilesAsZip",
    method: "post",
    data,
    responseType: "blob" // 下载，很关键
  })
}
// GetAllIrcameraList
export function GetAllIrcameraList(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetAllIrcameraList",
    method: "get",
    params
  })
}
// GetAnimalsPlantsStatisticalAnalysis_Zwzl
export function GetAnimalsPlantsStatisticalAnalysis_Zwzl(params?: any): any {
  return request({
    url: "BackgroundResources/GetAnimalsPlantsStatisticalAnalysis_Zwzl",
    method: "get",
    params
  })
}
// GetAnimalsPlantsStatisticalAnalysis_Bhdj
export function GetAnimalsPlantsStatisticalAnalysis_Bhdj(params?: any): any {
  return request({
    url: "BackgroundResources/GetAnimalsPlantsStatisticalAnalysis_Bhdj",
    method: "get",
    params
  })
}
// GetTopNumber
export function GetTopNumber(params?: any): any {
  return request({
    url: "BackgroundResources/GetTopNumber",
    method: "get",
    params
  })
}
// GetNumberStatistics
export function GetNumberStatistics(params?: any): any {
  return request({
    url: "BackgroundResources/GetNumberStatistics",
    method: "get",
    params
  })
}
// GetFloraFauna
export function GetFloraFauna(params?: any): any {
  return request({
    url: "BackgroundResources/GetFloraFauna",
    method: "get",
    params
  })
}
// GetAnimalsPlantsListByPage
export function GetAnimalsPlantsListByPage(params?: any): any {
  return request({
    url: "BackgroundResources/GetAnimalsPlantsListByPage",
    method: "get",
    params
  })
}
// GetLeftMenuByTree
export function GetLeftMenuByTree(params?: any): any {
  return request({
    url: "BackgroundResources/GetLeftMenuByTree",
    method: "get",
    params
  })
}
// GetBackgroundResourcesByMenuId
export function GetBackgroundResourcesByMenuId(params?: any): any {
  return request({
    url: "BackgroundResources/GetBackgroundResourcesByMenuId",
    method: "get",
    params
  })
}
// GetFamousTreesStatisticalAnalysis_Gsdj
export function GetFamousTreesStatisticalAnalysis_Gsdj(params?: any): any {
  return request({
    url: "BackgroundResources/GetFamousTreesStatisticalAnalysis_Gsdj",
    method: "get",
    params
  })
}
// GetFamousTreesStatisticalAnalysis_Gskl
export function GetFamousTreesStatisticalAnalysis_Gskl(params?: any): any {
  return request({
    url: "BackgroundResources/GetFamousTreesStatisticalAnalysis_Gskl",
    method: "get",
    params
  })
}
// GetFamousTreesStatisticalAnalysis_Gszltj
export function GetFamousTreesStatisticalAnalysis_Gszltj(params?: any): any {
  return request({
    url: "BackgroundResources/GetFamousTreesStatisticalAnalysis_Gszltj",
    method: "get",
    params
  })
}
// GetSsxh_UserTree
export function GetSsxh_UserTree1(params?: any): any {
  return request({
    url: "BackgroundResources/GetSsxh_UserTree",
    method: "get",
    params
  })
}
// GetProblemReportListByPage
export function GetProblemReportListByPage(params?: any): any {
  return request({
    url: "BackgroundResources/GetProblemReportListByPage",
    method: "get",
    params
  })
}
// GetFamousTreesListByPage
export function GetFamousTreesListByPage(params?: any): any {
  return request({
    url: "BackgroundResources/GetFamousTreesListByPage",
    method: "get",
    params
  })
}
// GetPestEquipment_All
export function GetPestEquipment_All(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetPestEquipment_All",
    method: "get",
    params
  })
}
// GetCarTravelRuleAssessment
export function GetCarTravelRuleAssessment(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetCarTravelRuleAssessment",
    method: "get",
    params
  })
}
// GetPestEquipment_Info
export function GetPestEquipment_Info(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetPestEquipment_Info",
    method: "get",
    params
  })
}
// GetPestEquipment_Jdhcljsjtj
export function GetPestEquipment_Jdhcljsjtj(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetPestEquipment_Jdhcljsjtj",
    method: "get",
    params
  })
}
// GetPestEquipment_qs
export function GetPestEquipment_qs(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetPestEquipment_qs",
    method: "get",
    params
  })
}
// GetPestSpeciesContents
export function GetPestSpeciesContents(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetPestSpeciesContents",
    method: "get",
    params
  })
}
// GetPestEquipment_Zltj
export function GetPestEquipment_Zltj(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetPestEquipment_Zltj",
    method: "get",
    params
  })
}
// GetPestEquipment_Statistics
export function GetPestEquipment_Statistics(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetPestEquipment_Statistics",
    method: "get",
    params
  })
}
// GetPestEquipment_Sbljbzhcsl
export function GetPestEquipment_Sbljbzhcsl(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetPestEquipment_Sbljbzhcsl",
    method: "get",
    params
  })
}
// GetPestEquipmentStatistics_Sbhcgk
export function GetPestEquipmentStatistics_Sbhcgk(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetPestEquipmentStatistics_Sbhcgk",
    method: "get",
    params
  })
}
// GetPestEquipmentStatistics_Sbhcxq
export function GetPestEquipmentStatistics_Sbhcxq(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetPestEquipmentStatistics_Sbhcxq",
    method: "get",
    params
  })
}
// GetPestEquipmentStatistics_Wsdhctj
export function GetPestEquipmentStatistics_Wsdhctj(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetPestEquipmentStatistics_Wsdhctj",
    method: "get",
    params
  })
}
// GetPestEquipment_ThisMonthMonitoringReport
export function GetPestEquipment_ThisMonthMonitoringReport(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetPestEquipment_ThisMonthMonitoringReport",
    method: "get",
    params
  })
}
export function GetPestEquipment_ThisMonthMonitoring_Download(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetPestEquipment_ThisMonthMonitoring_Download",
    method: "get",
    params,
    responseType: "blob" // 下载，很关键
  })
}
// GetPestSpeciesManagementListByPage
export function GetPestSpeciesManagementListByPage(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetPestSpeciesManagementListByPage",
    method: "get",
    params
  })
}
// GetPestMonitorRecordstListByPage
export function GetPestMonitorRecordstListByPage(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetPestMonitorRecordstListByPage",
    method: "get",
    params
  })
}
export function GetEnvironmentalIndicator(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetEnvironmentalIndicator",
    method: "get",
    params
  })
}
// GetALargeScreen_Agefx
export function GetALargeScreen_Agefx(params?: any): any {
  return request({
    url: "ALargeScreenImage/GetALargeScreen_Agefx",
    method: "get",
    params
  })
}
// /api/ALargeScreenImage/GetALargeScreenSoilMonitor_EcologyReport_Download
export function GetALargeScreenSoilMonitor_EcologyReport_Download(): any {
  return request({
    url: "ALargeScreenImage/GetALargeScreenSoilMonitor_EcologyReport_Download",
    method: "post",
    responseType: "blob" // 下载，很关键
  })
}
// GetALargeScreen_CarFestivalfx
export function GetALargeScreen_CarFestivalfx(params?: any): any {
  return request({
    url: "ALargeScreenImage/GetALargeScreen_CarFestivalfx",
    method: "get",
    params
  })
}
// GetALargeScreen_Carfx
export function GetALargeScreen_Carfx(params?: any): any {
  return request({
    url: "ALargeScreenImage/GetALargeScreen_Carfx",
    method: "get",
    params
  })
}
// GetALargeScreen_CarWeekfx
export function GetALargeScreen_CarWeekfx(params?: any): any {
  return request({
    url: "ALargeScreenImage/GetALargeScreen_CarWeekfx",
    method: "get",
    params
  })
}
// GetALargeScreen_Genderfx
export function GetALargeScreen_Genderfx(params?: any): any {
  return request({
    url: "ALargeScreenImage/GetALargeScreen_Genderfx",
    method: "get",
    params
  })
}
// GetALargeScreen_Lkfx
export function GetALargeScreen_Lkfx(params?: any): any {
  return request({
    url: "ALargeScreenImage/GetALargeScreen_Lkfx",
    method: "get",
    params
  })
}
// GetALargeScreen_Monitor
export function GetALargeScreen_Monitor(params?: any): any {
  return request({
    url: "ALargeScreenImage/GetALargeScreen_Monitor",
    method: "get",
    params
  })
}
// GetALargeScreen_Sscarhb
export function GetALargeScreen_Sscarhb(params?: any): any {
  return request({
    url: "ALargeScreenImage/GetALargeScreen_Sscarhb",
    method: "get",
    params
  })
}
// GetALargeScreen_Warning
export function GetALargeScreen_Warning(params?: any): any {
  return request({
    url: "ALargeScreenImage/GetALargeScreen_Warning",
    method: "get",
    params
  })
}
// GetALargeScreenDataProfiling_FaceCarGk
export function GetALargeScreenDataProfiling_FaceCarGk(params?: any): any {
  return request({
    url: "ALargeScreenImage/GetALargeScreenDataProfiling_FaceCarGk",
    method: "get",
    params
  })
}
// GetALargeScreenDataProfiling_Jcgk
export function GetALargeScreenDataProfiling_Jcgk(params?: any): any {
  return request({
    url: "ALargeScreenImage/GetALargeScreenDataProfiling_Jcgk",
    method: "get",
    params
  })
}
// GetALargeScreenDataProfiling_Jcss
export function GetALargeScreenDataProfiling_Jcss(params?: any): any {
  return request({
    url: "ALargeScreenImage/GetALargeScreenDataProfiling_Jcss",
    method: "get",
    params
  })
}
// GetALargeScreenDataProfiling_Tdlyx
export function GetALargeScreenDataProfiling_Tdlyx(params?: any): any {
  return request({
    url: "ALargeScreenImage/GetALargeScreenDataProfiling_Tdlyx",
    method: "get",
    params
  })
}
// GetALargeScreenDataProfiling_Xhgk
export function GetALargeScreenDataProfiling_Xhgk(params?: any): any {
  return request({
    url: "ALargeScreenImage/GetALargeScreenDataProfiling_Xhgk",
    method: "get",
    params
  })
}
// GetALargeScreenDataProfiling_Qxszsj
export function GetALargeScreenDataProfiling_Qxszsj(params?: any): any {
  return request({
    url: "ALargeScreenImage/GetALargeScreenDataProfiling_Qxszsj",
    method: "get",
    params
  })
}
// GetALargeScreenSoilMonitor_Qxalarm
export function GetALargeScreenSoilMonitor_Qxalarm(params?: any): any {
  return request({
    url: "ALargeScreenImage/GetALargeScreenSoilMonitor_Qxalarm",
    method: "get",
    params
  })
}
// GetALargeScreenSoilMonitor_Tjfx
export function GetALargeScreenSoilMonitor_Tjfx(params?: any): any {
  return request({
    url: "ALargeScreenImage/GetALargeScreenSoilMonitor_Tjfx",
    method: "get",
    params
  })
}
// /GetALargeScreenSoilMonitor_TopStatict
export function GetALargeScreenSoilMonitor_TopStatict(params?: any): any {
  return request({
    url: "ALargeScreenImage/GetALargeScreenSoilMonitor_TopStatict",
    method: "get",
    params
  })
}
// GetALargeScreenSoilMonitor_ssjc
export function GetALargeScreenSoilMonitor_ssjc(params?: any): any {
  return request({
    url: "ALargeScreenImage/GetALargeScreenSoilMonitor_ssjc",
    method: "get",
    params
  })
}
// GetALargeScreenReserve_Jcgk
export function GetALargeScreenReserve_Jcgk(params?: any): any {
  return request({
    url: "ALargeScreenImage/GetALargeScreenReserve_Jcgk",
    method: "get",
    params
  })
}
// /ALargeScreenImage/GetALargeScreenReserve_Tdlyx
export function GetALargeScreenReserve_Tdlyx(params?: any): any {
  return request({
    url: "ALargeScreenImage/GetALargeScreenReserve_Tdlyx",
    method: "get",
    params
  })
}
export function GetAnimalsPlantsStatisticalAnalysis_Zwzlbleve(params?: any): any {
  return request({
    url: "ALargeScreenImage/GetAnimalsPlantsStatisticalAnalysis_Zwzlbleve",
    method: "get",
    params
  })
}
// GetALargeScreenSoilPatrol_Cjlx
export function GetALargeScreenSoilPatrol_Cjlx(params?: any): any {
  return request({
    url: "ALargeScreenImage/GetALargeScreenSoilPatrol_Cjlx",
    method: "get",
    params
  })
}
// GetALargeScreenSoilPatrol_JgRanking
export function GetALargeScreenSoilPatrol_JgRanking(params?: any): any {
  return request({
    url: "ALargeScreenImage/GetALargeScreenSoilPatrol_JgRanking",
    method: "get",
    params
  })
}
// GetALargeScreenSoilPatrol_Ranking
export function GetALargeScreenSoilPatrol_Ranking(params?: any): any {
  return request({
    url: "ALargeScreenImage/GetALargeScreenSoilPatrol_Ranking",
    method: "get",
    params
  })
}
// GetALargeScreenSoilPatrol_Sjgk
export function GetALargeScreenSoilPatrol_Sjgk(params?: any): any {
  return request({
    url: "ALargeScreenImage/GetALargeScreenSoilPatrol_Sjgk",
    method: "get",
    params
  })
}
// GetALargeScreenSoilPatrol_Week
export function GetALargeScreenSoilPatrol_Week(params?: any): any {
  return request({
    url: "ALargeScreenImage/GetALargeScreenSoilPatrol_Week",
    method: "get",
    params
  })
}
// GetSys_LayermanagerDirec
export function GetSys_LayermanagerDirec(params?: any): any {
  return request({
    url: "ALargeScreenImage/GetSys_LayermanagerDirec",
    method: "get",
    params
  })
}
// GetZH_LayerManager
export function GetZH_LayerManager(params?: any): any {
  return request({
    url: "ALargeScreenImage/GetZH_LayerManager",
    method: "get",
    params
  })
}
// GetInterface
export function GetInterface(params?: any): any {
  return request({
    url: "ALargeScreenImage/GetInterface",
    method: "get",
    params
  })
}
// GetSys_LayerImageInformation
export function GetSys_LayerImageInformation(params?: any): any {
  return request({
    url: "ALargeScreenImage/GetSys_LayerImageInformation",
    method: "get",
    params
  })
}
// GetSys_LayerImageInformation_Bch
export function GetSys_LayerImageInformation_Bch(params?: any): any {
  return request({
    url: "ALargeScreenImage/GetSys_LayerImageInformation_Bch",
    method: "get",
    params
  })
}
// GetALargeScreenSoilMonitor_EcologyEQI
export function GetALargeScreenSoilMonitor_EcologyEQI(params?: any): any {
  return request({
    url: "ALargeScreenImage/GetALargeScreenSoilMonitor_EcologyEQI",
    method: "get",
    params
  })
}
// GetALargeScreenSoilMonitor_EcologyReport
export function GetALargeScreenSoilMonitor_EcologyReport(params?: any): any {
  return request({
    url: "ALargeScreenImage/GetALargeScreenSoilMonitor_EcologyReport",
    method: "get",
    params
  })
}

// ALargeScreenImage/GetALargeScreen_ElectronicMonitorSbgk
export function GetALargeScreen_ElectronicMonitorSbgk(params?: any): any {
  return request({
    url: "ALargeScreenImage/GetALargeScreen_ElectronicMonitorSbgk",
    method: "get",
    params
  })
}
// api/ALargeScreenImage/GetALargeScreen_ElectronicMonitorYjlx
export function GetALargeScreen_ElectronicMonitorYjlx(params?: any): any {
  return request({
    url: "ALargeScreenImage/GetALargeScreen_ElectronicMonitorYjlx",
    method: "get",
    params
  })
}
// GetALargeScreen_ElectronicMonitorYjqs
export function GetALargeScreen_ElectronicMonitorYjqs(params?: any): any {
  return request({
    url: "ALargeScreenImage/GetALargeScreen_ElectronicMonitorYjqs",
    method: "get",
    params
  })
}
// GetALargeScreen_ElectronicMonitorAIsbgk
export function GetALargeScreen_ElectronicMonitorAIsbgk(params?: any): any {
  return request({
    url: "ALargeScreenImage/GetALargeScreen_ElectronicMonitorAIsbgk",
    method: "get",
    params
  })
}
// GetALargeScreen_ElectronicMonitorWzsbTop
export function GetALargeScreen_ElectronicMonitorWzsbTop(params?: any): any {
  return request({
    url: "ALargeScreenImage/GetALargeScreen_ElectronicMonitorWzsbTop",
    method: "get",
    params
  })
}
// GetALargeScreen_ElectronicMonitorReport
export function GetALargeScreen_ElectronicMonitorReport(params?: any): any {
  return request({
    url: "ALargeScreenImage/GetALargeScreen_ElectronicMonitorReport",
    method: "get",
    params
  })
}
export function GetALargeScreen_ElectronicReport_Download(params?: any): any {
  return request({
    url: "ALargeScreenImage/GetALargeScreen_ElectronicReport_Download",
    method: "get",
    params,
    responseType: "blob" // 下载，很关键
  })
}
export function GetALargeScreenSoilMonitor_Wljyl(params?: any): any {
  return request({
    url: "ALargeScreenImage/GetALargeScreenSoilMonitor_Wljyl",
    method: "get",
    params
  })
}

// GetAnimalsPlantsStatisticalAnalysis_Wzzp

export function GetAnimalsPlantsStatisticalAnalysis_Wzzp(params?: any): any {
  return request({
    url: "BackgroundResources/GetAnimalsPlantsStatisticalAnalysis_Wzzp",
    method: "get",
    params
  })
}
// GetIrcameraStatisticalAnalysis_Wzphb
export function GetIrcameraStatisticalAnalysis_Wzphb(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetIrcameraStatisticalAnalysis_Wzphb",
    method: "get",
    params
  })
}
// EnvironmentalMonitoring/GetIrcameraWgList
export function GetIrcameraWgList(params?: any): any {
  return request({
    url: "EnvironmentalMonitoring/GetIrcameraWgList",
    method: "get",
    params
  })
}
// ForestResources/GetPlaybackURL
export function GetPlaybackURL(params?: any): any {
  return request({
    url: "VideoCapture/GetPlaybackURL",
    method: "get",
    params
  })
}
// GetPtzControl
export function GetPtzControl(params?: any): any {
  return request({
    url: "VideoCapture/GetPtzControl",
    method: "get",
    params
  })
}

// 个推推送鉴权token
export function GetGeTuiToken(): any {
  return request({
    url: "VideoCapture/GetGeTuiToken",
    method: "get"
  })
}
// 个推推送:根据别名单推
export function GetGeTuiToOneByAlias(params?: any): any {
  return request({
    url: "VideoCapture/GetGeTuiToOneByAlias",
    method: "get",
    params
  })
}
// Ecotourism/GetReservePanorama
export function GetReservePanorama(params?: any): any {
  return request({
    url: "Ecotourism/GetReservePanorama",
    method: "get",
    params
  })
}

// /api/Ecotourism/GetPanoramaList
export function GetPanoramaList(params?: any): any {
  return request({
    url: "Ecotourism/GetPanoramaList",
    method: "get",
    params
  })
}
// BackgroundResources/GetFamousTreesQjListByPage
export function GetFamousTreesQjListByPage(params?: any): any {
  return request({
    url: "BackgroundResources/GetFamousTreesQjListByPage",
    method: "get",
    params
  })
}

// api/Emergency/GetAlarm__XhOnlineList
export function GetAlarm__XhOnlineList(params?: any): any {
  return request({
    url: "Emergency/GetAlarm__XhOnlineList",
    method: "get",
    params
  })
}
// /api/Emergency/GetDroneRecordList
export function GetDroneRecordList(params?: any): any {
  return request({
    url: "Emergency/GetDroneRecordList",
    method: "get",
    params
  })
}

// GetAlarm_HandleByPage
export function GetAlarm_HandleByPage(params?: any): any {
  return request({
    url: "Emergency/GetAlarm_HandleByPage",
    method: "get",
    params
  })
}
// GetAlarm_MsgEmergencyList
export function GetAlarm_MsgEmergencyList(params?: any): any {
  return request({
    url: "Emergency/GetAlarm_MsgEmergencyList",
    method: "get",
    params
  })
}
// GetAlarm_CommandRecordByPage
export function GetAlarm_CommandRecordByPage(params?: any): any {
  return request({
    url: "Emergency/GetAlarm_CommandRecordByPage",
    method: "get",
    params
  })
}
// AddCommand
export function AddCommand(data?: any): any {
  return request({
    url: "Emergency/AddCommand",
    method: "post",
    data: data
  })
}
// UpdateCommand
export function UpdateCommand(data?: any): any {
  return request({
    url: "Emergency/UpdateCommand",
    method: "put",
    data: data
  })
}
// DeleteCommandRecord
export function DeleteCommandRecord(params?: any): any {
  return request({
    url: "Emergency/DeleteCommandRecord",
    method: "get",
    params: params
  })
}
// PutAlarm_HandleStatusById
export function PutAlarm_HandleStatusById(data?: any): any {
  return request({
    url: "Emergency/PutAlarm_HandleStatusById",
    method: "put",
    data: data
  })
}

// ForestResources/GetForestResourcesAnalysis_Hcgk
export function GetForestResourcesAnalysis_Hcgk(params?: any): any {
  return request({
    url: "ForestResources/GetForestResourcesAnalysis_Hcgk",
    method: "get",
    params
  })
}
// GetForestResourcesAnalysis_Stxflx
export function GetForestResourcesAnalysis_Stxflx(params?: any): any {
  return request({
    url: "ForestResources/GetForestResourcesAnalysis_Stxflx",
    method: "get",
    params
  })
}
// GetForestResourcesAnalysis_Zzszpm
export function GetForestResourcesAnalysis_Zzszpm(params?: any): any {
  return request({
    url: "ForestResources/GetForestResourcesAnalysis_Zzszpm",
    method: "get",
    params
  })
}
// GetForestResourcesPlanListByPage
export function GetForestResourcesPlanListByPage(params?: any): any {
  return request({
    url: "ForestResources/GetForestResourcesPlanListByPage",
    method: "get",
    params
  })
}
// /AddForestResourcesPlan
export function AddForestResourcesPlan(data?: any): any {
  return request({
    url: "ForestResources/AddForestResourcesPlan",
    method: "post",
    data: data
  })
}
// UpdateForestResourcesPlan
export function UpdateForestResourcesPlan(data?: any): any {
  return request({
    url: "ForestResources/UpdateForestResourcesPlan",
    method: "put",
    data: data
  })
}
// DeleteForestResourcesPlan
export function DeleteForestResourcesPlan(params?: any): any {
  return request({
    url: "ForestResources/DeleteForestResourcesPlan",
    method: "get",
    params: params
  })
}
// /GetForestResourcesPreparedListByPage
export function GetForestResourcesPreparedListByPage(params?: any): any {
  return request({
    url: "ForestResources/GetForestResourcesPreparedListByPage",
    method: "get",
    params
  })
}
// AddForestResourcesPrepared
export function AddForestResourcesPrepared(data?: any): any {
  return request({
    url: "ForestResources/AddForestResourcesPrepared",
    method: "post",
    data: data
  })
}
// UpdateForestResourcesPrepared
export function UpdateForestResourcesPrepared(data?: any): any {
  return request({
    url: "ForestResources/UpdateForestResourcesPrepared",
    method: "put",
    data: data
  })
}
// CheckForestResourcesPrepared
export function CheckForestResourcesPrepared(data?: any): any {
  return request({
    url: "ForestResources/CheckForestResourcesPrepared",
    method: "put",
    data: data
  })
}
export function GetElectronicfenceStatistics_Fxgk(params?: any): any {
  return request({
    url: "ElectronicFence/GetElectronicfenceStatistics_Fxgk",
    method: "get",
    params
  })
}
// ElectronicFence/GetElectronicfenceStatistics_Fxqx
export function GetElectronicfenceStatistics_Fxqx(params?: any): any {
  return request({
    url: "ElectronicFence/GetElectronicfenceStatistics_Fxqx",
    method: "get",
    params
  })
}
// ElectronicFence/GetElectronicfenceStatistics_TopSpecies
export function GetElectronicfenceStatistics_TopSpecies(params?: any): any {
  return request({
    url: "ElectronicFence/GetElectronicfenceStatistics_TopSpecies",
    method: "get",
    params
  })
}
// GetElectronicfenceWarningByPage
export function GetElectronicfenceWarningByPage(params?: any): any {
  return request({
    url: "ElectronicFence/GetElectronicfenceWarningByPage",
    method: "get",
    params
  })
}
// GetElectronicfenceEquipmentTreeList
export function GetElectronicfenceStatistics_EquipmentList(params?: any): any {
  return request({
    url: "ElectronicFence/GetElectronicfenceStatistics_EquipmentList",
    method: "get",
    params
  })
}
// GetElectronIcfenceAirecord_FileCount
export function GetElectronIcfenceAirecord_FileCount(params?: any): any {
  return request({
    url: "ElectronicFence/GetElectronIcfenceAirecord_FileCount",
    method: "get",
    params
  })
}
// GetElectronIcfenceAirecordByPage
export function GetElectronIcfenceAirecordByPage(params?: any): any {
  return request({
    url: "ElectronicFence/GetElectronIcfenceAirecordByPage",
    method: "get",
    params
  })
}
// CollectElectronIcfenceAirecord
export function CollectElectronIcfenceAirecord(data?: any): any {
  return request({
    url: "ElectronicFence/CollectElectronIcfenceAirecord",
    method: "put",
    data: data
  })
}
// GetElectronIcfenceSnapshot_FileCount
export function GetElectronIcfenceSnapshot_FileCount(): any {
  return request({
    url: "ElectronicFence/GetElectronIcfenceSnapshot_FileCount",
    method: "get"
  })
}
// GetElectronIcfenceSnapshotByPage
export function GetElectronIcfenceSnapshotByPage(params?: any): any {
  return request({
    url: "ElectronicFence/GetElectronIcfenceSnapshotByPage",
    method: "get",
    params
  })
}
// GetElectronIcfenceSnapshotByType
export function GetElectronIcfenceSnapshotByType(params?: any): any {
  return request({
    url: "ElectronicFence/GetElectronIcfenceSnapshotByType",
    method: "get",
    params
  })
}
// GetElectronicfenceEquipmentTreeList
export function GetElectronicfenceEquipmentTreeList(params?: any): any {
  return request({
    url: "ElectronicFence/GetElectronicfenceEquipmentTreeList",
    method: "get",
    params
  })
}

// 获取电子围栏直播，
// https://gwdm.510link.com/api/devices/dCameraInfoVServerApi/liveStart?protocol=&uniqueCode=1052010
export function liveStart(params?: any): any {
  return request({
    url: "api/devices/dCameraInfoVServerApi/liveStart",
    method: "get",
    headers: {
      "X-MAAAPI-ApiKey": "lOvA9FzlTYkOx4cg98UOTA==",
      "X-MAAAPI-ApiSecret": "pyNB9Ld11sn3ttidM+I9cUsOGSvYUep2G73lZh3cPR4="
    },
    params,
    requestBase: "/dzwlApi"
  })
}
