// 所有图层实例 dynamicPopup: 是否需要动态弹窗 style: 弹窗内容布局类型
export const tableAllInstances = [
  {
    tabname: "mo_monitoringinfo",
    tabchname: "人脸识别",
    type: "监控卡口"
  },
  {
    tabname: "g_animals_plants",
    tabchname: "动物分布",
    type: "动植物监测"
  },
  {
    tabname: "g_yx",
    tabchname: "样线",
    type: "其他"
  },
  {
    tabname: "g_fhd",
    tabchname: "防火道",
    type: "其他"
  },
  {
    tabname: "g_scenic_spot",
    tabchname: "旅游景点",
    type: "其他"
  },
  {
    tabname: "g_animals_plants",
    tabchname: "植物分布",
    type: "动植物监测"
  },
  {
    tabname: "mo_monitoringinfo",
    tabchname: "防火监测点",
    type: "监控卡口"
  },
  {
    tabname: "tb_environmental_equipment",
    tabchname: "水质站",
    type: "水文气象站"
  },
  {
    tabname: "g_ghss",
    tabchname: "村庄",
    type: "其他"
  },
  {
    tabname: "tb_environmental_equipment",
    tabchname: "气象站",
    type: "水文气象站"
  },
  {
    tabname: "g_ghss",
    tabchname: "防火蓄水池",
    type: "其他"
  },
  {
    tabname: "mo_monitoringinfo",
    tabchname: "卡口监测",
    type: "监控卡口"
  },
  {
    tabname: "xh_reserveorg",
    tabchname: "管理站",
    type: "其他"
  },
  {
    tabname: "xh_reserveorg",
    tabchname: "应急设备器材库",
    type: "其他"
  },
  {
    tabname: "g_famous_trees",
    tabchname: "一级古树",
    type: "古树名木	"
  },
  {
    tabname: "g_ghss",
    tabchname: "界桩",
    type: "其他"
  },
  {
    tabname: "g_ghss",
    tabchname: "瞭望塔",
    type: "其他"
  },
  {
    tabname: "g_ghss",
    tabchname: "宣传牌",
    type: "其他"
  },
  {
    tabname: "g_famous_trees",
    tabchname: "二级古树",
    type: "古树名木"
  },
  {
    tabname: "g_pest_deadwood",
    tabchname: "2024年第四季度",
    type: "其他"
  },
  {
    tabname: "g_xhlx",
    tabchname: "巡护路线",
    type: "其他"
  },
  {
    tabname: "g_ghss",
    tabchname: "界碑",
    type: "其他"
  },
  {
    tabname: "ylp_gnqh_gnqhkjh",
    tabchname: "整合后功能区",
    type: "其他"
  },
  {
    tabname: "g_ircamera",
    tabchname: "红外监测点",
    type: "红外相机"
  },
  {
    tabname: "g_yd",
    tabchname: "样地",
    type: "其他"
  },
  {
    tabname: "g_gnqh",
    tabchname: "整合前功能区",
    type: "其他"
  },
  {
    tabname: "g_famous_trees",
    tabchname: "三级古树",
    type: "古树名木"
  },
  {
    tabname: "g_animals_plants",
    tabchname: "珍稀动物分布",
    type: "动植物监测"
  },
  {
    tabname: "mo_monitoringinfo",
    tabchname: "视频监测点",
    type: "监控卡口"
  },
  {
    tabname: "mo_monitoringinfo",
    tabchname: "古树监控",
    type: "监控卡口"
  },
  {
    tabname: "g_animals_plants",
    tabchname: "珍稀植物分布",
    type: "动植物监测"
  },
  {
    tabname: "tb_electronicfence_equipment",
    tabchname: "电子围栏一张图",
    type: "电子围栏一张图"
  }
]
// 古树名木
export const gsmmInstances = tableAllInstances.filter((item) => item.type === "古树名木")
// 动植物监测
export const dwsjInstances = tableAllInstances.filter((item) => item.type === "动植物监测")
// 水文气象站
export const shqxInstances = tableAllInstances.filter((item) => item.type === "水文气象站")
// 监控卡口
export const jkkhInstances = tableAllInstances.filter((item) => item.type === "监控卡口")
// 红外相机
export const hwxjInstances = tableAllInstances.filter((item) => item.type === "红外相机")
// 其他
export const qtsInstances = tableAllInstances.filter((item) => item.type === "其他")
// 电子围栏一张图
export const dzwlInstances = tableAllInstances.filter((item) => item.type === "电子围栏一张图")
