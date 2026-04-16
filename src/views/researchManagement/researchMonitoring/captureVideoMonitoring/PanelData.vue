<script lang="ts" setup>
import { Search } from "@element-plus/icons-vue"
import {
  GetAllMonitoringList,
  GetCarListByPage,
  GetCarInsideListByPage,
  GetCarBackListByPage,
  GetCarManangListByPage,
  GetCarGjListByPage,
  PutCarIsSwById,
  GetCarTravelListByPage,
  GetCarVehicleTypeName,
  GetSpecialTimeCarListByPage,
  GetCarAlarmListByPage,
  GetCarTravelRuleAssessment
} from "@/api"
import VehicleDetails from "./VehicleDetails.vue"
import VehicleBaseDetails from "./VehicleBaseDetails.vue"
import HmdRemark from "./HmdRemark.vue"
import NbcRemark from "./NbcRemark.vue"
import dayjs from "dayjs"
import { Label } from "cesium"
interface Props {
  width?: number
  height?: number
  tab?: string
}
const props = withDefaults(defineProps<Props>(), {
  tab: "车辆进出记录"
})
const proxy = getCurrentInstance()!.proxy as any
const elTablePanelRef = ref<any>()
const tableColumns = ref<any[]>()
const tableData = ref<any>()
const loading = ref(false)
const svg = `
        <path class="path" d="
          M 30 15
          L 28 17
          M 25.61 25.61
          A 15 15, 0, 0, 1, 15 30
          A 15 15, 0, 1, 1, 27.99 7.5
          L 15 15
        " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
      `
const page = ref(1)
const intPageSize = ref(10)
const total = ref(0)
// 获得表格数据
const getTableData = async () => {
  loading.value = true
  try {
    tableData.value = []
    if (currentTab.value === "车辆进出记录") {
      const { response } = await GetCarListByPage({
        ...paramsJcjl.value,
        page: page.value,
        intPageSize: intPageSize.value
      })
      tableData.value = response.data
      total.value = response.dataCount
    }
    if (currentTab.value === "预警记录") {
      const { response } = await GetCarAlarmListByPage({
        ...paramsYjjl.value,
        page: page.value,
        intPageSize: intPageSize.value
      })
      tableData.value = response.data
      total.value = response.dataCount
    }
    if (currentTab.value === "黑名单车辆") {
      const { response } = await GetCarBackListByPage({
        ...paramsHmdcl.value,
        page: page.value,
        intPageSize: intPageSize.value
      })
      tableData.value = response.data
      total.value = response.dataCount
    }
    if (currentTab.value === "车辆管理") {
      const { response } = await GetCarManangListByPage({
        ...paramsClgl.value,
        page: page.value,
        intPageSize: intPageSize.value
      })
      tableData.value = response.data.map((item: any) => {
        item.isblacklist = item.isblacklist === "是" ? "是" : "否"
        item.isinside = item.isinside === "是" ? "是" : "否"
        // 累计进/出次数
        item.ljjc = item.cumulativegetinto + " / " + item.cumulativegetout
        return item
      })
      total.value = response.dataCount
    }
    if (currentTab.value === "智能研判") {
      if (currentSubItem.value === "行车轨迹研判") {
        const { response } = await GetCarGjListByPage({
          ...paramsXcgjyp.value,
          color: colorsList.value.join(","),
          page: page.value,
          intPageSize: intPageSize.value
        })
        tableData.value = response.data
        total.value = response.dataCount
      }
      if (currentSubItem.value === "内部车研判") {
        const { response } = await GetCarInsideListByPage({
          ...paramsNbcyp.value,
          color: colorsList.value.join(","),
          page: page.value,
          intPageSize: intPageSize.value
        })
        tableData.value = response.data
        total.value = response.dataCount
      }
      if (currentSubItem.value === "特定时段车辆研判") {
        const { response } = await GetSpecialTimeCarListByPage({
          ...paramsTdsdclyp.value,
          page: page.value,
          intPageSize: intPageSize.value
        })
        tableData.value = response.data
        total.value = response.dataCount
      }
      if (currentSubItem.value === "车辆出行规律研判") {
        const { response } = await GetCarTravelListByPage({
          ...paramsClcxglyp.value,
          color: colorsList.value.join(","),
          page: page.value,
          intPageSize: intPageSize.value
        })
        tableData.value = response.data
        total.value = response.dataCount
      }
    }
  } catch (error) {
  } finally {
    loading.value = false
  }
}
const handleCurrentChange = (val: number) => {
  page.value = val
  getTableData()
}
const handleSizeChange = (val: number) => {
  page.value = 1
  intPageSize.value = val
  getTableData()
}
const kkList = ref<any[]>([])
// 卡口列表
const getKkList = async () => {
  const { response } = await GetAllMonitoringList({
    equipmentType: "卡口监测"
  })
  kkList.value = response
}
// 获得车辆类型
const carTypeList = ref<any[]>([])
const getVehicleTypeName = async () => {
  const { response } = await GetCarVehicleTypeName()
  carTypeList.value = response
}
const currentTab = ref<string>(props.tab)
const currentSubItem = ref<string>()
const subItems = ref<string[]>([
  "行车轨迹研判",
  // "频繁出入车辆研判",
  "内部车研判",
  "特定时段车辆研判",
  "车辆出行规律研判"
])
// 切换一级tab
const changeTab = (tab: string, whether?: boolean) => {
  // 是否不需要重置查询条件
  if (!whether) {
    reset()
  }
  currentTab.value = tab
  if (tab === "车辆进出记录") {
    tableColumns.value = [
      {
        label: "车牌号",
        prop: "plateno"
      },
      {
        label: "车牌图片",
        type: "slot",
        width: 120,
        prop: "platepicurlall"
      },
      {
        label: "车辆图片",
        type: "slot",
        width: 100,
        prop: "vehiclepicurlall"
      },
      {
        label: "抓拍地点",
        prop: "monitorname"
      },
      {
        label: "是否为黑名单",
        prop: "isblacklist"
      },
      {
        label: "是否为内部车",
        prop: "isinside"
      },
      // {
      //   label: "行驶方向",
      //   prop: "fx"
      // },
      {
        label: "车速(千米/时)",
        prop: "speed"
      },
      {
        label: "抓拍时间",
        prop: "crosstime"
      },
      {
        label: "操作",
        type: "operation",
        width: 80,
        btns: [
          {
            label: "查看",
            textColor: "#00a2f3",
            bgColor: "transparent"
          }
        ]
      }
    ]
  }
  if (tab === "预警记录") {
    tableColumns.value = [
      {
        label: "预警时间",
        prop: "alarmtime"
      },
      {
        label: "预警类型",
        prop: "alarmtype"
      },
      {
        label: "预警说明",
        prop: "alarmremark"
      },
      {
        label: "是否已短信通知相关人员",
        prop: "issendsms",
        width: 180
      },
      {
        label: "推送人员",
        prop: "senduserlist"
      },
      {
        label: "发送时间",
        prop: "sendsmstime"
      }
    ]
  }
  if (tab === "黑名单车辆") {
    tableColumns.value = [
      {
        label: "车牌号",
        prop: "plateno"
      },
      {
        label: "添加时间",
        prop: "blacklisttime"
      },
      {
        label: "最新抓拍时间",
        prop: "latelysnaptime"
      },
      {
        label: "备注说明",
        prop: "blacklistremark",
        width: 180
      },
      {
        label: "操作",
        type: "operation",
        width: 200,
        btns: [
          {
            label: "解除黑名单",
            textColor: "#00a2f3",
            bgColor: "transparent"
          },
          {
            label: "车辆详情",
            textColor: "#00a2f3",
            bgColor: "transparent"
          }
        ]
      }
    ]
  }
  if (tab === "车辆管理") {
    tableColumns.value = [
      {
        label: "车牌号",
        prop: "plateno"
      },
      {
        label: "是否为黑名单车辆",
        prop: "isblacklist"
      },
      {
        label: "是否为内部车",
        prop: "isinside"
      },
      {
        label: "首次抓拍地点",
        prop: "firstsnapmonitor"
      },
      {
        label: "首次抓拍时间",
        prop: "firstsnaptime"
      },
      {
        label: "最近抓拍地点",
        prop: "latelysnapmonitor"
      },
      {
        label: "最近抓拍时间",
        prop: "latelysnaptime"
      },
      {
        label: "累计进/出次数",
        prop: "ljjc"
      },
      {
        label: "操作",
        type: "operation",
        width: 220,
        btns: [
          {
            label: "查看历史记录",
            textColor: "#00a2f3",
            bgColor: "transparent"
          },
          {
            label: "设为黑名单",
            textColor: "#00a2f3",
            bgColor: "transparent"
          }
        ]
      }
    ]
  }
  if (tab === "智能研判") {
    currentSubItem.value = "行车轨迹研判"
    changeSubItem()
  } else {
    // 当不为智能研判时，请求数据
    getTableData()
  }
}
// 切换二级tab
const changeSubItem = () => {
  // 重置查询条件
  reset()
  if (currentSubItem.value === "行车轨迹研判") {
    tableColumns.value = [
      {
        label: "车牌号",
        prop: "plateno"
      },
      {
        label: "车牌图片",
        type: "slot",
        width: 120,
        prop: "platepicurlall"
      },
      {
        label: "车辆图片",
        type: "slot",
        width: 120,
        prop: "vehiclepicurlall"
      },
      {
        label: "抓拍地点",
        prop: "monitorname"
      },
      {
        label: "车型",
        prop: "vehicletypename"
      },
      // {
      //   label: "车身颜色",
      //   prop: "color"
      // },
      {
        label: "抓拍时间",
        prop: "crosstime"
      },
      {
        label: "操作",
        type: "operation",
        width: 100,
        btns: [
          {
            label: "车辆详情",
            textColor: "#00a2f3",
            bgColor: "transparent"
          }
        ]
      }
    ]
  }
  if (currentSubItem.value === "频繁出入车辆研判") {
    tableColumns.value = [{}]
  }
  if (currentSubItem.value === "内部车研判") {
    tableColumns.value = [
      {
        label: "车牌号",
        prop: "plateno"
      },
      {
        label: "抓拍地点",
        prop: "latelysnapmonitor"
      },
      {
        label: "车型",
        prop: "vehicletypename"
      },
      // {
      //   label: "车身颜色",
      //   prop: "color"
      // },
      {
        label: "研判结果",
        prop: "suspectedinside"
      },
      {
        label: "操作",
        type: "operation",
        width: 120,
        btns: [
          {
            label: "设为内部车",
            textColor: "#00a2f3",
            bgColor: "transparent"
          }
        ]
      }
    ]
  }
  if (currentSubItem.value === "特定时段车辆研判") {
    tableColumns.value = [
      {
        label: "车牌号",
        prop: "plateno"
      },
      {
        label: "车牌图片",
        type: "slot",
        width: 120,
        prop: "platepicurlall"
      },
      {
        label: "车辆图片",
        type: "slot",
        width: 120,
        prop: "vehiclepicurlall"
      },
      {
        label: "抓拍地点",
        prop: "monitorname"
      },
      {
        label: "过车次数",
        prop: "count"
      },
      {
        label: "车速",
        prop: "speed"
      },
      {
        label: "操作",
        type: "operation",
        width: 80,
        btns: [
          {
            label: "查看",
            textColor: "#00a2f3",
            bgColor: "transparent"
          }
        ]
      }
    ]
  }
  if (currentSubItem.value === "车辆出行规律研判") {
    tableColumns.value = [
      {
        label: "车牌号",
        prop: "plateno"
      },
      {
        label: "车型",
        prop: "vehicletypename"
      },
      // {
      //   label: "车身颜色",
      //   prop: "color"
      // },
      {
        label: "是否为黑名单车辆",
        prop: "isblacklist"
      },
      {
        label: "是否为内部车",
        prop: "isinside"
      },
      {
        label: "操作",
        type: "operation",
        width: 100,
        btns: [
          {
            label: "规律详情",
            textColor: "#00a2f3",
            bgColor: "transparent"
          }
        ]
      }
    ]
  }
  getTableData()
}

// 车辆进出记录-抓拍时间
const dateJcjl = ref<any>([
  dayjs().subtract(1, "month").format("YYYY-MM-DD 00:00:00"),
  dayjs().format("YYYY-MM-DD 23:59:59")
])
// 预警记录-预警时间
const dateYjjl = ref<any>()
// 黑名单车辆-添加日期
const dateHmdcl = ref<any>()
// 智能研判-行车轨迹研判-研判日期
const dateXcgjyp = ref<any>([
  dayjs().subtract(1, "month").format("YYYY-MM-DD 00:00:00"),
  dayjs().format("YYYY-MM-DD 23:59:59")
])
// 智能研判-行车轨迹研判-车身颜色
const colorsList = ref<string[]>([])
// 智能研判-内部车研判-研判日期
const dateNbcyp = ref<any>([
  dayjs().subtract(1, "year").format("YYYY-MM-DD 00:00:00"),
  dayjs().format("YYYY-MM-DD 23:59:59")
])
// 智能研判-特定时段车辆研判-研判日期不包含时分秒
const dateTdsdclyp = ref<any>([dayjs().subtract(1, "month").format("YYYY-MM-DD"), dayjs().format("YYYY-MM-DD")])
// 智能研判-特定时段车辆研判-研判时间
const dateTimeTdsdclyp = ref<any>()
const timeeTdsdclypOptions = ref<any>([
  {
    label: "8:00PM-9:00PM",
    value: "20:00"
  },
  {
    label: "9:00PM-10:00PM",
    value: "21:00"
  },
  {
    label: "10:00PM-11:00PM",
    value: "22:00"
  },
  {
    label: "11:00PM-12:00PM",
    value: "23:00"
  },
  {
    label: "12:00AM-1:00AM",
    value: "00:00"
  },
  {
    label: "1:00AM-2:00AM",
    value: "01:00"
  },
  {
    label: "2:00AM-3:00AM",
    value: "02:00"
  },
  {
    label: "3:00AM-4:00AM",
    value: "03:00"
  },
  {
    label: "4:00AM-5:00AM",
    value: "04:00"
  }
])
// 智能研判-车辆出行规律研判-规律详情-研判日期
const dateClcxglypDetails = ref<any>()
// 车辆进出记录-查询参数
const paramsJcjl = ref<any>({
  plateno: "",
  monitorname: "",
  startTime: dateJcjl.value[0],
  endTime: dateJcjl.value[1]
})
// 预警记录-查询参数
const paramsYjjl = ref<any>({
  alarmtype: "",
  alarmremark: "",
  startTime: "",
  endTime: ""
})
// 黑名单车辆-查询参数
const paramsHmdcl = ref<any>({
  plateno: "",
  startTime: "",
  endTime: ""
})
// 车辆管理-查询参数
const paramsClgl = ref<any>({
  plateno: "",
  isinside: "",
  isblacklist: ""
})
// 智能研判-行车轨迹研判-查询参数
const paramsXcgjyp = ref<any>({
  plateno: "",
  vehicletypename: "",
  startTime: dateXcgjyp.value[0],
  endTime: dateXcgjyp.value[1]
})
// 智能研判-内部车研判-查询参数
const paramsNbcyp = ref<any>({
  plateno: "",
  vehicletypename: "",
  startTime: dateNbcyp.value[0],
  endTime: dateNbcyp.value[1]
})
// 智能研判-特定时段车辆研判-查询参数
const paramsTdsdclyp = ref<any>({
  monitorname: "",
  startTime: dateTdsdclyp.value[0],
  endTime: dateTdsdclyp.value[1],
  startHour: "",
  endHour: ""
})
// 智能研判-车辆出行规律研判-查询参数
const paramsClcxglyp = ref<any>({
  plateno: "",
  vehicletypename: "",
  startTime: "",
  endTime: ""
})
// 智能研判-车辆出行规律研判-规律详情-查询参数
const paramsClcxglypDetails = ref<any>({
  plateno: "",
  starttime: "",
  endtime: ""
})

// 重置所有查询参数
const reset = () => {
  paramsJcjl.value = {
    startTime: dateJcjl.value[0],
    endTime: dateJcjl.value[1]
  }
  paramsYjjl.value = {}
  paramsHmdcl.value = {}
  paramsClgl.value = {}
  paramsXcgjyp.value = {
    startTime: dateXcgjyp.value[0],
    endTime: dateXcgjyp.value[1]
  }
  paramsNbcyp.value = {}
  paramsTdsdclyp.value = {
    startTime: dateTdsdclyp.value[0],
    endTime: dateTdsdclyp.value[1]
  }
  paramsClcxglyp.value = {}
  colorsList.value = []
  dateJcjl.value = [dayjs().subtract(1, "month").format("YYYY-MM-DD 00:00:00"), dayjs().format("YYYY-MM-DD 23:59:59")]
  dateYjjl.value = ""
  dateHmdcl.value = ""
  dateXcgjyp.value = [dayjs().subtract(1, "month").format("YYYY-MM-DD 00:00:00"), dayjs().format("YYYY-MM-DD 23:59:59")]
  dateNbcyp.value = [dayjs().subtract(1, "year").format("YYYY-MM-DD 00:00:00"), dayjs().format("YYYY-MM-DD 23:59:59")]
  dateTdsdclyp.value = [dayjs().subtract(1, "month").format("YYYY-MM-DD"), dayjs().format("YYYY-MM-DD")]
  dateClcxglypDetails.value = ""
  page.value = 1
  intPageSize.value = 10
  total.value = 0
  showRuleDetails.value = false // 隐藏规律详情
}
// 查询
const search = () => {
  page.value = 1
  getTableData()
}
// 新增黑名单车辆
const hmdDialogType = ref<string>("")
const openAddHmdDialog = () => {
  hmdDialogType.value = "新增"
  showHmdBzsmDialog.value = true
}

const exportLoading = ref<boolean>(false)
// 导出表格
const exportExcel = async () => {
  let columns: any[] = []
  let data: any[] = []
  const intPageSize = 1000
  exportLoading.value = true
  try {
    if (currentTab.value === "车辆进出记录") {
      const { response } = await GetCarListByPage({
        ...paramsJcjl.value,
        page: 1,
        intPageSize: intPageSize
      })
      columns = [
        { header: "车牌号", key: "plateno", width: 20 },
        { header: "车牌图片", key: "platepicurlall", width: 20 },
        { header: "车辆图片", key: "vehiclepicurlall", width: 20 },
        { header: "抓拍地点", key: "monitorname", width: 10 },
        { header: "是否为黑名单", key: "isblacklist", width: 10 },
        { header: "是否为内部车", key: "isinside", width: 10 },
        // { header: "行驶方向", key: "ammonia", width: 10 },
        { header: "车速(km/h)", key: "speed", width: 10 },
        { header: "抓拍时间", key: "time", width: 10 }
      ]
      data = response.data
    }
    if (currentTab.value === "预警记录") {
      const { response } = await GetCarAlarmListByPage({
        ...paramsJcjl.value,
        page: 1,
        intPageSize: intPageSize
      })
      columns = [
        { header: "预警时间", key: "crosstime", width: 10 },
        { header: "预警类型", key: "alarmtype", width: 10 },
        { header: "预警说明", key: "alarmremark", width: 10 },
        { header: "是否已短信通知相关人员", key: "issendsms", width: 10 },
        { header: "推送人员", key: "senduserlist", width: 10 },
        { header: "发送时间", key: "sendsmstime", width: 10 }
      ]
      data = response.data
    }
    // 黑名单车辆
    if (currentTab.value === "黑名单车辆") {
      const { response } = await GetCarBackListByPage({
        ...paramsHmdcl.value,
        page: 1,
        intPageSize: intPageSize
      })
      columns = [
        { header: "车牌号", key: "plateno", width: 10 },
        { header: "添加时间", key: "blacklisttime", width: 10 },
        { header: "最新抓拍时间", key: "latelysnaptime", width: 10 },
        { header: "备注说明", key: "blacklistremark", width: 10 }
      ]
      data = response.data
    }
    // 车辆管理
    if (currentTab.value === "车辆管理") {
      const { response } = await GetCarManangListByPage({
        ...paramsClgl.value,
        page: 1,
        intPageSize: intPageSize
      })
      columns = [
        { header: "车牌号", key: "plateno", width: 10 },
        { header: "是否为黑名单车辆", key: "isblacklist", width: 10 },
        { header: "是否为内部车", key: "isinside", width: 10 },
        { header: "首次抓拍地点", key: "firstsnapmonitor", width: 10 },
        { header: "首次抓拍时间", key: "firstsnaptime", width: 10 },
        { header: "最近抓拍地点", key: "latelysnapmonitor", width: 10 },
        { header: "最近抓拍时间", key: "latelysnaptime", width: 10 },
        { header: "累计进/出次数", key: "ljjc", width: 10 }
      ]
      data = response.data
    }
    // 智能研判
    if (currentTab.value === "智能研判") {
      if (currentSubItem.value === "行车轨迹研判") {
        const { response } = await GetCarGjListByPage({
          ...paramsXcgjyp.value,
          color: colorsList.value.join(","),
          page: 1,
          intPageSize: intPageSize
        })
        columns = [
          { header: "车牌号", key: "plateno", width: 10 },
          { header: "车牌图片", key: "platepicurlall", width: 10 },
          { header: "车辆图片", key: "vehiclepicurlall", width: 10 },
          { header: "抓拍地点", key: "monitorname", width: 10 },
          { header: "车型", key: "vehicletypename", width: 10 },
          // { header: "车身颜色", key: "color", width: 10 },
          { header: "抓拍时间", key: "crosstime", width: 10 }
        ]
        data = response.data
      }
      // 内部车研判
      if (currentSubItem.value === "内部车研判") {
        const { response } = await GetCarGjListByPage({
          ...paramsXcgjyp.value,
          color: colorsList.value.join(","),
          page: 1,
          intPageSize: intPageSize
        })
        columns = [
          { header: "车牌号", key: "plateno", width: 10 },
          { header: "抓拍地点", key: "latelysnapmonitor", width: 10 },
          { header: "车型", key: "vehicletypename", width: 10 },
          // { header: "车身颜色", key: "color", width: 10 },
          { header: "研判结果", key: "suspectedinside", width: 10 }
        ]
        data = response.data
      }
      // 特定时段车辆研判
      if (currentSubItem.value === "特定时段车辆研判") {
        const { response } = await GetCarGjListByPage({
          ...paramsXcgjyp.value,
          color: colorsList.value.join(","),
          page: 1,
          intPageSize: intPageSize
        })
        columns = [
          { header: "车牌号", key: "plateno", width: 10 },
          { header: "车牌图片", key: "platepicurlall", width: 10 },
          { header: "车辆图片", key: "vehiclepicurlall", width: 10 },
          { header: "抓拍地点", key: "monitorname", width: 10 },
          { header: "过车次数", key: "count", width: 10 },
          { header: "车速", key: "speed", width: 10 }
        ]
        data = response.data
      }
      // 车辆出行规律研判
      if (currentSubItem.value === "车辆出行规律研判") {
        const { response } = await GetCarGjListByPage({
          ...paramsXcgjyp.value,
          color: colorsList.value.join(","),
          page: 1,
          intPageSize: intPageSize
        })
        columns = [
          { header: "车牌号", key: "plateno", width: 10 },
          { header: "车型", key: "vehicletypename", width: 10 },
          // { header: "车身颜色", key: "color", width: 10 },
          { header: "是否为黑名单车辆", key: "isblacklist", width: 10 },
          { header: "是否为内部车", key: "isinside", width: 10 }
        ]
        data = response.data
      }
    }
    // 导出
    ExcelExporter.exportExcel({
      fileName: `${currentTab.value}表格导出-${dayjs().format("YYYY-MM-DD HH:mm:ss")}.xlsx`,
      sheetName: currentTab.value,
      columns,
      data
    })
  } catch (error) {
  } finally {
    exportLoading.value = false
  }
}

const changeDate = () => {
  if (currentTab.value === "车辆进出记录") {
    if (dateJcjl.value) {
      paramsJcjl.value.startTime = dateJcjl.value[0]
      paramsJcjl.value.endTime = dateJcjl.value[1]
    } else {
      paramsJcjl.value.startTime = ""
      paramsJcjl.value.endTime = ""
    }
  }
  if (currentTab.value === "预警记录") {
    if (dateYjjl.value) {
      paramsYjjl.value.startTime = dateYjjl.value[0]
      paramsYjjl.value.endTime = dateYjjl.value[1]
    } else {
      paramsYjjl.value.startTime = ""
      paramsYjjl.value.endTime = ""
    }
  }
  if (currentTab.value === "黑名单车辆") {
    if (dateHmdcl.value) {
      paramsHmdcl.value.startTime = dateHmdcl.value[0]
      paramsHmdcl.value.endTime = dateHmdcl.value[1]
    } else {
      paramsHmdcl.value.startTime = ""
      paramsHmdcl.value.endTime = ""
    }
  }
  if (currentTab.value === "智能研判") {
    if (currentSubItem.value === "行车轨迹研判") {
      if (dateXcgjyp.value) {
        paramsXcgjyp.value.startTime = dateXcgjyp.value[0]
        paramsXcgjyp.value.endTime = dateXcgjyp.value[1]
      } else {
        paramsXcgjyp.value.startTime = ""
        paramsXcgjyp.value.endTime = ""
      }
    }
    if (currentSubItem.value === "内部车研判") {
      if (dateNbcyp.value) {
        paramsNbcyp.value.startTime = dateNbcyp.value[0]
        paramsNbcyp.value.endTime = dateNbcyp.value[1]
      } else {
        paramsNbcyp.value.startTime = ""
        paramsNbcyp.value.endTime = ""
      }
    }
    if (currentSubItem.value === "特定时段车辆研判") {
      if (dateTdsdclyp.value) {
        paramsTdsdclyp.value.startTime = dateTdsdclyp.value[0]
        paramsTdsdclyp.value.endTime = dateTdsdclyp.value[1]
      } else {
        paramsTdsdclyp.value.startTime = ""
        paramsTdsdclyp.value.endTime = ""
      }
      paramsTdsdclyp.value.startHour = []
      paramsTdsdclyp.value.endHour = []
      dateTimeTdsdclyp.value?.forEach((item: any) => {
        paramsTdsdclyp.value.startHour.push(item)
        paramsTdsdclyp.value.endHour.push(dayjs(item, "HH:mm").add(1, "hour").format("HH:mm"))
      })
    }
    if (currentSubItem.value === "车辆出行规律研判") {
      if (dateClcxglypDetails.value) {
        paramsClcxglypDetails.value.starttime = dateClcxglypDetails.value[0]
        paramsClcxglypDetails.value.endtime = dateClcxglypDetails.value[1]
      } else {
        paramsClcxglypDetails.value.starttime = ""
        paramsClcxglypDetails.value.endtime = ""
      }
      getRuleDetails()
    }
  }
}
// 表格详情数据
const tbInfo = ref<any>()
// 表格操作按钮点击事件
const handleTableBtnClick = async (data: any) => {
  // console.log(data)
  const { type, tableTypeLevel1, tableTypeLevel2, row } = data
  if (type === "查看" && tableTypeLevel1 === "车辆进出记录") {
    tbInfo.value = row
    showClxqBaseDialog.value = true
  }
  if (type === "解除黑名单" && tableTypeLevel1 === "黑名单车辆") {
    ElMessageBox.confirm("解除黑名单，确定吗?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    })
      .then(async () => {
        const { success, msg } = await PutCarIsSwById({
          id: row.Id,
          updatetype: 1,
          issf: "否"
        })
        if (success) {
          ElMessage.success("操作成功")
        } else {
          ElMessage.info(msg)
        }
        getTableData()
      })
      .catch(() => {
        ElMessage.info("取消解除")
      })
  }
  if (type === "车辆详情" && tableTypeLevel1 === "黑名单车辆") {
    tbInfo.value = row
    showClxqDialog.value = true
  }
  if (type === "查看历史记录" && tableTypeLevel1 === "车辆管理") {
    paramsJcjl.value.plateno = row.plateno || "皖AM1234"
    changeTab("车辆进出记录", true)
  }
  if (type === "设为黑名单" && tableTypeLevel1 === "车辆管理") {
    tbInfo.value = row
    showHmdBzsmDialog.value = true
  }
  if (type === "车辆详情" && tableTypeLevel1 === "智能研判" && tableTypeLevel2 === "行车轨迹研判") {
    tbInfo.value = row
    showClxqBaseDialog.value = true
  }
  if (type === "设为内部车" && tableTypeLevel1 === "智能研判" && tableTypeLevel2 === "内部车研判") {
    tbInfo.value = row
    showNbcBzsmDialog.value = true
  }
  if (type === "查看" && tableTypeLevel1 === "智能研判" && tableTypeLevel2 === "特定时段车辆研判") {
    tbInfo.value = row
    showClxqBaseDialog.value = true
  }
  if (type === "规律详情" && tableTypeLevel1 === "智能研判" && tableTypeLevel2 === "车辆出行规律研判") {
    dateClcxglypDetails.value = [dayjs().subtract(1, "month").format("YYYY-MM-DD"), dayjs().format("YYYY-MM-DD")]
    paramsClcxglypDetails.value = {
      plateno: row.plateno, //"皖HL2539"
      starttime: dateClcxglypDetails.value[0],
      endtime: dateClcxglypDetails.value[1]
    }
    getRuleDetails()
    showRuleDetails.value = true
  }
}
// 车辆详情弹窗显示(不包含图表)
const showClxqBaseDialog = ref<boolean>(false)
// 车辆详情弹窗显示
const showClxqDialog = ref<boolean>(false)
// 设为黑名单备注说明弹窗显示
const showHmdBzsmDialog = ref<boolean>(false)
// 设为内部车备注说明弹窗显示
const showNbcBzsmDialog = ref<boolean>(false)
// 规律详情显示
const showRuleDetails = ref<boolean>(false)
// 规律详情返回
const ruleDetailsGoBack = () => {
  showRuleDetails.value = false
}
// 规律详情loading
const ruleDetailsLoading = ref<boolean>(false)

// 获取规律详情
const ruleDetailsData = ref<any>({})
// 获取规律详情
const getRuleDetails = async () => {
  ruleDetailsLoading.value = true
  try {
    const { response } = await GetCarTravelRuleAssessment(paramsClcxglypDetails.value)
    ruleDetailsData.value = response
    ruleDetailsTableColumns1.value = response.capturesCamearList.name.map((item: any, index: number) => {
      return {
        label: item,
        prop: "v" + index
      }
    })
    const obj1: any = {}
    response.capturesCamearList.value.forEach((item: any, index: number) => {
      obj1["v" + index] = item
    })
    ruleDetailsTableData1.value = [obj1]
    ruleDetailsTableColumns2.value = response.capturesNumList.name.map((item: any, index: number) => {
      return {
        label: item,
        prop: "v" + index
      }
    })
    const obj2: any = {}
    response.capturesNumList.value.forEach((item: any, index: number) => {
      obj2["v" + index] = item
    })
    ruleDetailsTableData2.value = [obj2]
  } finally {
    ruleDetailsLoading.value = false
  }
}

// 抓拍地点统计表格字段
const ruleDetailsTableColumns1 = ref<any>([
  {
    label: "研判日期",
    prop: "sj"
  },
  {
    label: "车牌号",
    prop: "sj"
  },
  {
    label: "祖师庙卡口入口",
    width: 130,
    prop: "sj"
  },
  {
    label: "祖师庙卡口出口",
    width: 130,
    prop: "sj"
  },
  {
    label: "锁山口入口",
    width: 130,
    prop: "sj"
  },
  {
    label: "锁山口出口",
    width: 130,
    prop: "sj"
  },
  {
    label: "烂泥凹卡口入口",
    width: 130,
    prop: "sj"
  },
  {
    label: "烂泥凹卡口出口",
    width: 130,
    prop: "sj"
  },
  {
    label: "骆驼坳入口",
    width: 130,
    prop: "sj"
  },
  {
    label: "骆驼坳出口",
    width: 130,
    prop: "sj"
  },
  {
    label: "昭关卡口入口",
    width: 130,
    prop: "sj"
  },
  {
    label: "昭关卡口出口",
    width: 130,
    prop: "sj"
  }
])
// 抓拍地点统计表格数据
const ruleDetailsTableData1 = ref<any>([{ sj: "" }])
// 抓拍次数统计表格字段
const ruleDetailsTableColumns2 = ref<any>([
  {
    label: "研判日期",
    width: 80,
    prop: "sj"
  },
  {
    label: "车牌号",
    prop: "sj"
  },
  {
    label: "0:00~5:00",
    width: 100,
    prop: "sj"
  },
  {
    label: "6:00~7:00",
    width: 100,
    prop: "sj"
  },
  {
    label: "8:00~9:00",
    width: 100,
    prop: "sj"
  },
  {
    label: "10:00~12:00",
    width: 120,
    prop: "sj"
  },
  {
    label: "13:00~14:00",
    width: 120,
    prop: "sj"
  },
  {
    label: "15:00~16:00",
    width: 120,
    prop: "sj"
  },
  {
    label: "17:00~18:00",
    width: 120,
    prop: "sj"
  },
  {
    label: "19:00~20:00",
    width: 120,
    prop: "sj"
  },
  {
    label: "21:00~24:00",
    width: 120,
    prop: "sj"
  }
])

const test = ref<any>()
// 抓拍次数统计表格数据
const ruleDetailsTableData2 = ref<any>([{ sj: "" }])
// 车辆进出记录表格数据
onMounted(() => {
  proxy.$mitt.on("handleTableBtnClick", handleTableBtnClick)
  getKkList() // 获得卡口列表
  getVehicleTypeName() // 获得车辆类型
  changeTab(currentTab.value)
})
// 销毁前
onBeforeUnmount(() => {
  proxy.$mitt.off("handleTableBtnClick", handleTableBtnClick)
})
</script>
<template>
  <div
    class="data-panel"
    :style="{ width: width + 'px', height: height + 'px' }"
  >
    <div class="title-box">
      <img
        :src="$fun.getImg('researchManagement/icon14.png')"
        alt=""
      />
      {{ currentTab }}
    </div>
    <div class="tabs-level1 panzoom-exclude">
      <div
        :class="{ current: currentTab === '车辆进出记录' }"
        @click="changeTab('车辆进出记录')"
      >
        <span>车辆进出记录</span>
      </div>
      <div
        :class="{ current: currentTab === '预警记录' }"
        @click="changeTab('预警记录')"
      >
        <span>预警记录</span>
      </div>
      <div
        :class="{ current: currentTab === '黑名单车辆' }"
        @click="changeTab('黑名单车辆')"
      >
        <span>黑名单车辆</span>
      </div>
      <div
        :class="{ current: currentTab === '车辆管理' }"
        @click="changeTab('车辆管理')"
      >
        <span>车辆管理</span>
      </div>
      <div
        :class="{ current: currentTab === '智能研判' }"
        @click="changeTab('智能研判')"
      >
        <span>智能研判</span>
      </div>
    </div>
    <div class="mian panzoom-exclude">
      <div
        v-if="currentTab === '智能研判'"
        class="tabs-level2"
      >
        <el-segmented
          v-model="currentSubItem"
          :options="subItems"
          class="custom-segmented"
          @change="changeSubItem"
        />
      </div>
      <div class="main-section">
        <div class="search-box">
          <el-form
            v-if="currentTab === '车辆进出记录'"
            :model="paramsJcjl"
            label-width="80px"
            inline
          >
            <el-form-item label="车牌号">
              <el-input
                v-model="paramsJcjl.plateno"
                placeholder="请输入车牌号"
                :prefix-icon="Search"
                clearable
            /></el-form-item>
            <el-form-item label="抓拍地点">
              <el-select
                v-model="paramsJcjl.monitorname"
                placeholder="请选择抓拍地点"
                :teleported="false"
                clearable
                popper-class="custom-select-popper"
              >
                <el-option
                  v-for="item in kkList"
                  :key="item.id"
                  :label="item.mc"
                  :value="item.mc"
                />
              </el-select>
            </el-form-item>
            <el-form-item
              label="抓拍时间"
              class="date-box"
            >
              <el-date-picker
                v-model="dateJcjl"
                type="datetimerange"
                range-separator="-"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                popper-class="custom-datepicker-popper"
                @change="changeDate"
              />
            </el-form-item>
            <el-form-item class="search-btns">
              <div class="btns">
                <div
                  class="btn btn1"
                  @click="search"
                >
                  查询
                </div>
                <div
                  class="btn btn2"
                  :class="{ exportLoading: exportLoading }"
                  @click="exportExcel"
                >
                  导出
                </div>
              </div>
            </el-form-item>
          </el-form>
          <el-form
            v-if="currentTab === '预警记录'"
            :model="paramsYjjl"
            label-width="80px"
            inline
          >
            <el-form-item label="预警类型">
              <el-select
                v-model="paramsYjjl.alarmtype"
                placeholder="请选择预警类型"
                :teleported="false"
                clearable
                popper-class="custom-select-popper"
              >
                <el-option
                  label="黑名单预警"
                  value="黑名单预警"
                />
                <el-option
                  label="峰值预警"
                  value="峰值预警"
                />
                <el-option
                  label="拥堵预警"
                  value="拥堵预警"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="预警说明">
              <el-input
                v-model="paramsYjjl.alarmremark"
                placeholder="请输入预警说明"
                :prefix-icon="Search"
                clearable
            /></el-form-item>
            <el-form-item
              label="预警时间"
              class="date-box"
            >
              <el-date-picker
                v-model="dateYjjl"
                type="datetimerange"
                range-separator="-"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                popper-class="custom-datepicker-popper"
                @change="changeDate"
              />
            </el-form-item>
            <el-form-item class="search-btns">
              <div class="btns">
                <div
                  class="btn btn1"
                  @click="search"
                >
                  查询
                </div>
                <div
                  class="btn btn2"
                  :class="{ exportLoading: exportLoading }"
                  @click="exportExcel"
                >
                  导出
                </div>
              </div>
            </el-form-item>
          </el-form>
          <el-form
            v-if="currentTab === '黑名单车辆'"
            :model="paramsHmdcl"
            label-width="80px"
            inline
          >
            <el-form-item label="车牌号">
              <el-input
                v-model="paramsHmdcl.plateno"
                placeholder="请输入车牌号"
                :prefix-icon="Search"
                clearable
            /></el-form-item>
            <el-form-item
              label="添加日期"
              class="date-box"
            >
              <el-date-picker
                v-model="dateHmdcl"
                type="datetimerange"
                range-separator="-"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                popper-class="custom-datepicker-popper"
                @change="changeDate"
              />
            </el-form-item>
            <el-form-item class="search-btns">
              <div class="btns">
                <div
                  class="btn btn1"
                  @click="search"
                >
                  查询
                </div>
                <div
                  class="btn btn2"
                  @click="openAddHmdDialog"
                >
                  新增
                </div>
                <div
                  class="btn btn2"
                  :class="{ exportLoading: exportLoading }"
                  @click="exportExcel"
                >
                  导出
                </div>
              </div>
            </el-form-item>
          </el-form>
          <el-form
            v-if="currentTab === '车辆管理'"
            :model="paramsClgl"
            label-width="80px"
            inline
          >
            <el-form-item label="车牌号">
              <el-input
                v-model="paramsClgl.plateno"
                placeholder="请输入车牌号"
                :prefix-icon="Search"
                clearable
            /></el-form-item>
            <el-form-item
              label-width="140px"
              label="是否为黑名单车辆"
            >
              <el-select
                v-model="paramsClgl.isblacklist"
                placeholder="请选择是否"
                :teleported="false"
                clearable
                popper-class="custom-select-popper"
              >
                <el-option
                  label="是"
                  value="是"
                />
                <el-option
                  label="否"
                  value="否"
                />
              </el-select>
            </el-form-item>
            <el-form-item
              label-width="140px"
              label="是否为内部车辆"
            >
              <el-select
                v-model="paramsClgl.isinside"
                placeholder="请选择是否"
                :teleported="false"
                clearable
                popper-class="custom-select-popper"
              >
                <el-option
                  label="是"
                  value="是"
                />
                <el-option
                  label="否"
                  value="否"
                />
              </el-select>
            </el-form-item>
            <el-form-item class="search-btns">
              <div class="btns">
                <div
                  class="btn btn1"
                  @click="search"
                >
                  查询
                </div>
                <div
                  class="btn btn2"
                  :class="{ exportLoading: exportLoading }"
                  @click="exportExcel"
                >
                  导出
                </div>
              </div>
            </el-form-item>
          </el-form>
          <el-form
            v-if="currentTab === '智能研判' && currentSubItem === '行车轨迹研判'"
            :model="paramsXcgjyp"
            label-width="80px"
            inline
          >
            <el-form-item label="车牌号">
              <el-input
                v-model="paramsXcgjyp.plateno"
                placeholder="请输入车牌号"
                :prefix-icon="Search"
                clearable
            /></el-form-item>
            <el-form-item label="车型">
              <el-select
                v-model="paramsXcgjyp.vehicletypename"
                placeholder="请选择车型"
                :teleported="false"
                clearable
                popper-class="custom-select-popper"
              >
                <el-option
                  v-for="item in carTypeList"
                  :key="item.name"
                  :label="item.name"
                  :value="item.name"
                />
              </el-select>
            </el-form-item>
            <el-form-item
              label="研判日期"
              class="date-box"
            >
              <el-date-picker
                v-model="dateXcgjyp"
                type="datetimerange"
                range-separator="-"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                popper-class="custom-datepicker-popper"
                @change="changeDate"
              />
            </el-form-item>
            <!-- <el-form-item
              label-width="80px"
              label="车身颜色"
              class="colors-box"
            >
              <el-checkbox-group v-model="colorsList">
                <el-checkbox
                  label="白色"
                  value="白色"
                />
                <el-checkbox
                  label="黑色"
                  value="黑色"
                />
                <el-checkbox
                  label="红色"
                  value="红色"
                />
                <el-checkbox
                  label="蓝色"
                  value="蓝色"
                />
                <el-checkbox
                  label="绿色"
                  value="绿色"
                />
                <el-checkbox
                  label="紫色"
                  value="紫色"
                />
              </el-checkbox-group>
            </el-form-item> -->
            <el-form-item class="search-btns">
              <div class="btns">
                <div
                  class="btn btn1"
                  style="width: 100px"
                  @click="search"
                >
                  开始研判
                </div>
                <div
                  class="btn btn2"
                  :class="{ exportLoading: exportLoading }"
                  @click="exportExcel"
                >
                  导出
                </div>
              </div>
            </el-form-item>
          </el-form>
          <el-form
            v-if="currentTab === '智能研判' && currentSubItem === '内部车研判'"
            :model="paramsNbcyp"
            label-width="80px"
            inline
          >
            <el-form-item label="车牌号">
              <el-input
                v-model="paramsNbcyp.plateno"
                placeholder="请输入车牌号"
                :prefix-icon="Search"
                clearable
            /></el-form-item>
            <el-form-item label="车型">
              <el-select
                v-model="paramsNbcyp.vehicletypename"
                placeholder="请选择车型"
                :teleported="false"
                clearable
                popper-class="custom-select-popper"
              >
                <el-option
                  v-for="item in carTypeList"
                  :key="item.name"
                  :label="item.name"
                  :value="item.name"
                />
              </el-select>
            </el-form-item>
            <el-form-item
              label="研判日期"
              class="date-box"
            >
              <el-date-picker
                v-model="dateNbcyp"
                type="datetimerange"
                range-separator="-"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                popper-class="custom-datepicker-popper"
                @change="changeDate"
              />
            </el-form-item>
            <!-- <el-form-item
              label-width="80px"
              label="车身颜色"
              class="colors-box"
            >
              <el-checkbox-group v-model="colorsList">
                <el-checkbox
                  label="白色"
                  value="白色"
                />
                <el-checkbox
                  label="黑色"
                  value="黑色"
                />
                <el-checkbox
                  label="红色"
                  value="红色"
                />
                <el-checkbox
                  label="蓝色"
                  value="蓝色"
                />
                <el-checkbox
                  label="绿色"
                  value="绿色"
                />
                <el-checkbox
                  label="紫色"
                  value="紫色"
                />
              </el-checkbox-group>
            </el-form-item> -->
            <el-form-item class="search-btns">
              <div class="btns">
                <div
                  class="btn btn1"
                  style="width: 100px"
                  @click="search"
                >
                  开始研判
                </div>
                <div
                  class="btn btn2"
                  :class="{ exportLoading: exportLoading }"
                  @click="exportExcel"
                >
                  导出
                </div>
              </div>
            </el-form-item>
          </el-form>
          <el-form
            v-if="currentTab === '智能研判' && currentSubItem === '特定时段车辆研判'"
            :model="paramsTdsdclyp"
            label-width="80px"
            inline
          >
            <el-form-item label="抓拍地点">
              <el-select
                v-model="paramsTdsdclyp.monitorname"
                placeholder="请选择抓拍地点"
                :teleported="false"
                clearable
                popper-class="custom-select-popper"
              >
                <el-option
                  v-for="item in kkList"
                  :key="item.id"
                  :label="item.mc"
                  :value="item.mc"
                />
              </el-select>
            </el-form-item>
            <el-form-item
              label="研判日期"
              class="date-time-box"
            >
              <el-date-picker
                style="flex: 1"
                v-model="dateTdsdclyp"
                type="daterange"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
                popper-class="custom-datepicker-popper"
                @change="changeDate"
              />
              <!-- <el-time-picker
                style="flex: 1"
                v-model="dateTimeTdsdclyp"
                is-range
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                value-format="HH"
                popper-class="custom-timepicker-popper"
                :teleported="false"
                @change="changeDate"
              /> -->
              <el-select
                v-model="dateTimeTdsdclyp"
                placeholder="请选择特定时段"
                style="flex: 1"
                popper-class="custom-select-popper"
                clearable
                multiple
                collapse-tags
                @change="changeDate"
              >
                <el-option
                  v-for="item in timeeTdsdclypOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item class="search-btns">
              <div class="btns">
                <div
                  class="btn btn1"
                  style="width: 100px"
                  @click="search"
                >
                  开始研判
                </div>
                <div
                  class="btn btn2"
                  :class="{ exportLoading: exportLoading }"
                  @click="exportExcel"
                >
                  导出
                </div>
              </div>
            </el-form-item>
          </el-form>
          <el-form
            v-if="currentTab === '智能研判' && currentSubItem === '车辆出行规律研判'"
            :model="paramsClcxglyp"
            label-width="80px"
            inline
          >
            <el-form-item label="车牌号">
              <el-input
                v-model="paramsClcxglyp.plateno"
                placeholder="请输入车牌号"
                :prefix-icon="Search"
                clearable
            /></el-form-item>
            <el-form-item label="车型">
              <el-select
                v-model="paramsClcxglyp.vehicletypename"
                placeholder="请选择车型"
                :teleported="false"
                clearable
                popper-class="custom-select-popper"
              >
                <el-option
                  v-for="item in carTypeList"
                  :key="item.name"
                  :label="item.name"
                  :value="item.name"
                />
              </el-select>
            </el-form-item>
            <!-- <el-form-item
              label-width="80px"
              label="车身颜色"
              class="colors-box"
            >
              <el-checkbox-group v-model="colorsList">
                <el-checkbox
                  label="白色"
                  value="白色"
                />
                <el-checkbox
                  label="黑色"
                  value="黑色"
                />
                <el-checkbox
                  label="红色"
                  value="红色"
                />
                <el-checkbox
                  label="蓝色"
                  value="蓝色"
                />
                <el-checkbox
                  label="绿色"
                  value="绿色"
                />
                <el-checkbox
                  label="紫色"
                  value="紫色"
                />
              </el-checkbox-group>
            </el-form-item> -->
            <el-form-item class="search-btns">
              <div class="btns">
                <div
                  class="btn btn1"
                  style="width: 100px"
                  @click="search"
                >
                  开始研判
                </div>
                <div
                  class="btn btn2"
                  :class="{ exportLoading: exportLoading }"
                  @click="exportExcel"
                >
                  导出
                </div>
              </div>
            </el-form-item>
          </el-form>
        </div>
        <div
          v-loading="loading"
          element-loading-text="数据加载中..."
          :element-loading-spinner="svg"
          element-loading-svg-view-box="-10, -10, 50, 50"
          element-loading-background="rgba(9, 58, 121, 0.6)"
          class="contain-box"
        >
          <ElTablePanel
            ref="elTablePanelRef"
            :tableTypeLevel1="currentTab"
            :tableTypeLevel2="currentSubItem"
            :showIndex="true"
            :selection="true"
            :columns="tableColumns"
            :data="tableData"
          />
        </div>
        <div class="footer-box">
          <el-pagination
            v-model:current-page="page"
            v-model:page-size="intPageSize"
            :page-sizes="[10, 20, 30, 40]"
            :background="false"
            :pager-count="5"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>

      <transition
        enter-active-class="animate__animated animate__backInDown"
        leave-active-class="animate__animated animate__backOutUp"
        :appear="false"
        appear-active-class="animate__animated animate__backInDown"
      >
        <div
          v-if="showRuleDetails"
          class="rule-details"
          v-loading="ruleDetailsLoading"
          element-loading-text="数据加载中..."
          :element-loading-spinner="svg"
          element-loading-svg-view-box="-10, -10, 50, 50"
          element-loading-background="rgba(9, 58, 121, 0.6)"
        >
          <el-scrollbar height="100%">
            <el-page-header @back="ruleDetailsGoBack">
              <template #content>
                <div
                  :class="{ exportLoading: exportLoading }"
                  @click="exportExcel"
                >
                  导出
                </div>
              </template>
            </el-page-header>
            <div
              class="search-box"
              style="padding: 0 10px"
            >
              <span style="margin-right: 5px">研判日期：</span>
              <el-date-picker
                v-model="dateClcxglypDetails"
                type="daterange"
                range-separator="-"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                value-format="YYYY-MM-DD"
                popper-class="custom-datepicker-popper"
                :clearable="false"
                @change="changeDate"
              />
            </div>
            <div
              v-show="!ruleDetailsLoading"
              class="main"
            >
              <p>
                在<span>{{ paramsClcxglypDetails.starttime }}</span
                >至<span>{{ paramsClcxglypDetails.endtime }}</span
                >期间，对特定车辆<span>{{ paramsClcxglypDetails.plateno }}</span
                >的出行规律进行了全面分析。结果显示，该车辆共被卡口抓拍<span>{{ ruleDetailsData.capturesNum }}</span
                >次，其中地点<span>{{ ruleDetailsData.capturesMaxNumCamearName }}</span
                >抓拍次数最多，达到<span>{{ ruleDetailsData.capturesMaxNum }}</span
                >次，占总抓拍次数的<span>{{ ruleDetailsData.capturesPercentage }}</span
                >%。从时间段次数统计来看，<span>{{ ruleDetailsData.duringHours }}</span
                >为该车辆的出行高峰时段，占总出行次数的<span>{{ ruleDetailsData.duringHoursPercentage }}</span
                >%此外，该车辆停留时间超过3小时的情况共发生了<span>{{ ruleDetailsData.exceedThreeHoursNum }}</span
                >次，占总出行次数的<span>{{ ruleDetailsData.exceedThreeHoursNumPercentage }}</span
                >%，其中最长单次停留时间达到了<span>{{ ruleDetailsData.longHours }}</span
                >小时。
              </p>
              <div class="section">
                <div class="title">
                  <img
                    :src="$fun.getImg('researchManagement/arrow.png')"
                    alt=""
                  />
                  <span>抓拍地点统计</span>
                </div>
                <ElTablePanel
                  :selection="false"
                  :columns="ruleDetailsTableColumns1"
                  :data="ruleDetailsTableData1"
                />
              </div>
              <div class="section">
                <div class="title">
                  <img
                    :src="$fun.getImg('researchManagement/arrow.png')"
                    alt=""
                  />
                  <span>抓拍次数统计</span>
                </div>
                <ElTablePanel
                  :selection="false"
                  :columns="ruleDetailsTableColumns2"
                  :data="ruleDetailsTableData2"
                />
              </div>
              <div class="section">
                <div class="title">
                  <img
                    :src="$fun.getImg('researchManagement/arrow.png')"
                    alt=""
                  />
                  <span>停留时间统计</span>
                </div>
                <p>
                  <span>{{ paramsClcxglypDetails.starttime }}</span> 至<span>{{ paramsClcxglypDetails.endtime }}</span
                  >，该车辆的总停留时间达到了<span>{{ ruleDetailsData.TotalHours }}</span
                  >小时，平均每次停留时间为<span>{{ ruleDetailsData.stopTimeAve }}</span
                  >分钟。其中，停留时间4小时以内的情况共发生了<span>{{ ruleDetailsData.withinFourHoursNum }}</span
                  >次，占总出行次数的<span>{{ ruleDetailsData.withinFourHoursNumPercentage }}</span
                  >%；停留时间超过4小时的情况共发生了<span>{{ ruleDetailsData.exceedFourHoursNum }}</span
                  >次，占总出行次数的<span>{{ ruleDetailsData.exceedFourHoursNumPercentage }}</span
                  >%。
                </p>
              </div>
            </div>
          </el-scrollbar>
        </div>
      </transition>
    </div>
    <teleport
      defer
      to="#dataPanel"
    >
      <Modal
        v-model:show="showClxqBaseDialog"
        disable-zoom
        :showShade="false"
        :close-on-click-modal="false"
      >
        <template v-slot:container>
          <VehicleBaseDetails :data="tbInfo" />
        </template>
      </Modal>
      <Modal
        v-model:show="showClxqDialog"
        disable-zoom
        :showShade="false"
        :close-on-click-modal="false"
      >
        <template v-slot:container>
          <VehicleDetails :data="tbInfo" />
        </template>
      </Modal>
      <Modal
        v-model:show="showHmdBzsmDialog"
        disable-zoom
        :showShade="false"
        :close-on-click-modal="false"
      >
        <template v-slot:container>
          <HmdRemark
            v-model:show="showHmdBzsmDialog"
            v-model:type="hmdDialogType"
            :data="tbInfo"
            @refresh="getTableData"
          />
        </template>
      </Modal>
      <Modal
        v-model:show="showNbcBzsmDialog"
        disable-zoom
        :showShade="false"
        :close-on-click-modal="false"
      >
        <template v-slot:container>
          <NbcRemark
            v-model:show="showNbcBzsmDialog"
            :data="tbInfo"
            @refresh="getTableData"
          />
        </template>
      </Modal>
    </teleport>
  </div>
</template>

<style lang="scss" scoped>
.data-panel {
  position: relative;
  width: 62.5vw;
  height: 720px;
  background: url("@/assets/images/dialog-bg.png") no-repeat center center / 100% 100%;
  display: flex;
  flex-direction: column;
  user-select: text;
  .title-box {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 70px;
    font-size: 0.9375vw;
    img {
      width: 1.3542vw;
      margin-right: 0.5208vw;
    }
  }
  .tabs-level1 {
    position: absolute;
    top: 45px;
    left: -10px;
    transform: translateX(-100%);
    display: flex;
    flex-direction: column;
    gap: 10px;
    > div {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 10.625vw;
      height: 65px;
      font-size: 0.7292vw;
      background: url("@/assets/images/researchManagement/data-panel-item.png") no-repeat center center / 100% 100%;
      cursor: pointer;
      span {
        transition: all 0.3s;
      }
      &.current span,
      &:hover span {
        background: linear-gradient(to right, #0cc1c7, #feb47b); /* 渐变颜色 */
        -webkit-background-clip: text;
        color: transparent;
        font-size: 0.9375vw;
        font-weight: bold;
      }
      &.current {
        background: url("@/assets/images/researchManagement/active-data-panel-item.png") no-repeat center center / 100%
          100%;
      }
    }
  }
  .mian {
    position: relative;
    flex: 1;
    display: flex;
    padding: 0 24px;
    flex-direction: column;
    overflow-y: hidden;
    :deep(.tabs-level2) {
      margin: 10px 0;
      .custom-segmented {
        background: #08203b;
        .el-segmented__item-selected {
          background: #194570;
        }
        .el-segmented__item-label {
          font-size: 0.8333vw;
          color: #beccdc;
        }
        .el-segmented__item.is-selected {
          .el-segmented__item-label {
            color: #fff !important;
          }
        }
        .el-segmented__item {
          padding: 10px 10px;
        }
        .el-segmented__item:not(.is-disabled):not(.is-selected):hover {
          background: #04101e;
        }
      }
    }
    .main-section {
      position: relative;
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow-y: hidden;
      .search-box {
        :deep(.el-form) {
          .el-form-item {
            margin-right: 14px;
          }
          .el-form-item__label {
            color: #fff;
          }
          .date-box {
            .el-form-item__content {
              width: 352px;
            }
          }
          .date-time-box {
            .el-form-item__content {
              display: flex;
              gap: 10px;
              width: 480px;
            }
          }
          .colors-box {
            .el-form-item__content {
              width: min-content;
              border: none;
            }
            .el-checkbox-group {
              display: flex;
              .is-checked + .el-checkbox__label {
                color: #15b392;
              }
              .el-checkbox__label {
                color: #beccdc;
              }
              .el-checkbox__inner {
                background-color: #253c5a;
                border: none;
              }
              .el-checkbox__input.is-checked .el-checkbox__inner {
                background-color: #15b392;
              }
            }
          }
          .el-form-item__content {
            border: 1px solid #304868;
            border-radius: 2px;
            width: 160px;
          }
          .search-btns {
            .el-form-item__content {
              border: none;
            }
          }
        }
        .btns {
          display: flex;
          gap: 10px;
          padding: 0 10px;
          .btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 68px;
            height: 32px;
            padding: 4px 20px;
            cursor: pointer;
          }
          .btn1 {
            background: #19ba6c;
          }
          .btn2 {
            background: linear-gradient(to right, #5a8ab6, #375577);
          }
        }
      }
      .contain-box {
        flex: 1;
        opacity: 0.8;
        overflow: hidden;
      }
      .footer-box {
        margin: 10px 0 20px 0;
        :deep(.el-pagination) {
          margin-bottom: 10px;
          justify-content: center;
          font-size: 0.7292vw;
          .el-select {
            width: 6.6667vw;
          }
          .el-pager {
            li {
              color: #fff;
              margin: 0 0.2604vw;
              background-color: #0b2a4e;
              border-top-left-radius: 10px;
              border-bottom-right-radius: 10px;
              font-size: 0.7292vw;
              min-width: 1.6667vw;
            }
            li.is-active {
              color: #fff;
              background-color: #5886b2;
              border-top-left-radius: 10px;
              border-bottom-right-radius: 10px;
            }
          }
          .el-pagination__sizes,
          .el-pagination__total {
            color: #fff;
          }
          .el-input__wrapper {
            padding: 1px 2px;
            background-color: rgba(60, 93, 128, 0.5);
            box-shadow: none;
            .el-input__inner {
              color: #fff;
            }
          }
          .el-pagination__editor.el-input {
            width: 2.0833vw;
          }
          .el-pagination__jump {
            color: #fff;
            margin-left: 0.8333vw;
          }
          button,
          button.is-disabled,
          button:disabled {
            background: none;
            color: #fff;
            min-width: 1.6667vw;
            margin-left: 0.8333vw;
          }
        }
      }
    }
    :deep(.rule-details) {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 4px;
      right: 0;
      flex: 1;
      overflow-y: hidden;
      background-color: #07203d;
      z-index: 1;
      .el-page-header {
        margin: 10px;
        .el-page-header__title,
        .el-page-header__content {
          color: #fff;
          cursor: pointer;
          font-size: 0.8333vw;
        }
      }
      .main {
        padding: 0 1.0417vw;
        p {
          text-indent: 2em;
          line-height: 1.5em;
          font-size: 0.8333vw;
          color: #fff;
          span {
            color: orangered;
          }
        }
        .section {
          margin: 10px 0;
          .title {
            display: flex;
            align-items: center;
            gap: 6px;
            margin: 10px 0;
            font-size: 0.9375vw;
            span {
              color: #29efef;
            }
          }
          span {
            color: orangered;
          }
        }
      }
    }
  }
}
</style>
