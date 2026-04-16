<script lang="ts" setup>
import CountUp from "vue-countup-v3"
import PageTabs from "../components/PageTabs.vue"
import Tree from "./Tree.vue"
import {
  GetXhgk_XhgjList,
  GetXhgk_CollectionList,
  GetAveragePatrolValue,
  GetXhgk_HeadTj,
  GetTrendAnalysis
} from "@/api"
import dayjs from "dayjs"
defineOptions({
  name: "PatrolSurvey"
})
const router = useRouter()
const proxy = getCurrentInstance()!.proxy as any
const time = ref(dayjs().format("YYYY-01-01"))
let dateTime = {
  startTime: dayjs(time.value).format("YYYY-01-01"),
  endTime: dayjs(time.value).endOf("year").format("YYYY-MM-DD")
}
const datePickerType = ref<any>("year")
const datePickerTypeCN = ref("年")
const shortcuts = [
  {
    text: "年",
    value: () => {
      datePickerType.value = "year"
      datePickerTypeCN.value = "年"
    }
  },
  {
    text: "月",
    value: () => {
      datePickerType.value = "month"
      datePickerTypeCN.value = "月"
    }
  },
  {
    text: "周",
    value: () => {
      datePickerType.value = "week"
      datePickerTypeCN.value = "周"
    }
  },
  {
    text: "日",
    value: () => {
      datePickerType.value = "date"
      datePickerTypeCN.value = "日"
    }
  }
]
const changeDate = () => {
  if (datePickerType.value === "date") {
    dateTime.startTime = dayjs(time.value).format("YYYY-MM-DD")
    dateTime.endTime = dayjs(time.value).add(1, "day").format("YYYY-MM-DD")
  } else if (datePickerType.value === "week") {
    dateTime.startTime = dayjs(time.value).startOf("week").format("YYYY-MM-DD")
    dateTime.endTime = dayjs(time.value).endOf("week").format("YYYY-MM-DD")
  } else if (datePickerType.value === "month") {
    dateTime.startTime = dayjs(time.value).format("YYYY-MM-01")
    dateTime.endTime = dayjs(time.value).endOf("month").format("YYYY-MM-DD")
  } else {
    dateTime.startTime = dayjs(time.value).format("YYYY-01-01")
    dateTime.endTime = dayjs(time.value).endOf("year").format("YYYY-MM-DD")
  }
  if (time.value) {
    getXhgk_HeadTj()
    getTrendAnalysis()
  }
}
const showTree = ref(false)
const changeShowTree = () => {
  showTree.value = !showTree.value
}
const popup = ref<any>(null)
const modular = ref("巡护概况")
const { closePopup, popupInfo, refreshXhOnline, map, addLayerManageData, removeLayerManageData } = useOlMap(popup, {
  center: [116.06260425906204, 31.02858713581041],
  zoom: 12.4423,
  modular: modular.value,
  overlayOffset: [0, -70],
  overlayPositioning: "bottom-center"
})
// 查看历史巡护数据
const handleHistoryDataClick = (data: any) => {
  router.push({
    path: "/patrol/record",
    query: {
      userid: data.User_id
    }
  })
}

const gjTableColumns = ref([
  {
    prop: "XhRq",
    label: "巡护时间",
    width: "120px",
    showOverflowTooltip: true
  },
  {
    prop: "User_Name",
    label: "巡护人"
  },
  {
    prop: "Xhtype",
    label: "巡护方式"
  },
  {
    prop: "Xhtime",
    label: "巡护时长"
  },
  {
    type: "slot", // 自定义插槽模式
    prop: "CollectionCount|AlarmCount",
    label: "采集/报警点",
    width: "100px"
  }
])
const gjTableData = ref<any[]>()
// 最新轨迹
const getXhgk_XhgjList = async () => {
  const { response } = await GetXhgk_XhgjList({ Take: 15 })
  gjTableData.value = response
}
const cjTableColumns = ref([
  {
    prop: "collectionname",
    label: "采集名称",
    showOverflowTooltip: true
  },
  {
    prop: "uploaddate",
    label: "采集时间",
    showOverflowTooltip: true
  },
  {
    prop: "user_Name",
    label: "采集人",
    showOverflowTooltip: true
  },
  {
    prop: "describe",
    label: "描述",
    showOverflowTooltip: true
  },
  {
    label: "采集图片",
    type: "slot",
    width: "120px"
  }
])
const cjTableData = ref<any[]>()
const getXhgk_CollectionList = async () => {
  const { response } = await GetXhgk_CollectionList({ Take: 15 })
  cjTableData.value = response
}
// line chart data
const lineData = ref<any>()
const getAveragePatrolValue = async (type = "巡护均值-巡护里程") => {
  let dw, paramsType
  switch (type) {
    case "巡护均值-巡护里程":
      dw = "km"
      paramsType = "巡护里程"
      break
    case "巡护均值-巡护时长":
      dw = "min"
      paramsType = "巡护时长"
      break
    case "巡护均值-巡护次数":
      dw = "次"
      paramsType = "巡护次数"
      break

    default:
      break
  }
  const { response } = await GetAveragePatrolValue({ type: paramsType })

  response.nowYear.forEach((i: any) => {
    i.date = i.date.split("-")[1]
  })
  response.lastYear.forEach((i: any) => {
    i.date = i.date.split("-")[1]
  })
  lineData.value = {
    dw,
    xAxis: response.nowYear.map((i: any) => i.date),
    data: [
      {
        name: "去年",
        data: response.lastYear.map((i: any) => {
          return {
            value: i.value,
            label: i.date
          }
        })
      },
      {
        name: "今年",
        data: response.nowYear.map((i: any) => {
          return {
            value: i.value,
            label: i.date
          }
        })
      }
    ]
  }
}

const changePanelTitleType = (type: string) => {
  getAveragePatrolValue(type)
}
const xhInfo = ref<any>({
  Xhkm: 0,
  XhCount: 0,
  XhTime: 0,
  XhAlarm: 0,
  XhCollection: 0,
  XhAllUser: 0
})
const getXhgk_HeadTj = async () => {
  const { response } = await GetXhgk_HeadTj({
    TimeType: datePickerTypeCN.value,
    ...dateTime
  })
  xhInfo.value = response
}
const xhcslineData = ref<any>()
const barData = ref()
const getTrendAnalysis = async () => {
  let _date, _dateType
  if (datePickerTypeCN.value === "日") {
    _date = {
      // 七天前
      startTime: dayjs(time.value).subtract(6, "day").format("YYYY-MM-DD"),
      endTime: dayjs(time.value).format("YYYY-MM-DD")
    }
    _dateType = "周"
  } else {
    _date = dateTime
    _dateType = datePickerTypeCN.value
  }
  const { response } = await GetTrendAnalysis({
    TimeType: _dateType,
    ..._date
  })
  if (response) {
    xhcslineData.value = {
      dw: "次",
      xAxis: response.map((i: any) => i.date),
      data: [
        {
          name: "次数",
          data: response.map((i: any) => {
            return {
              value: i.count,
              label: i.date
            }
          })
        }
      ]
    }
    barData.value = {
      dw: "km",
      xAxis: response.map((i: any) => i.date),
      data: response.map((i: any) => i.km)
    }
  }
}
let refreshXhOnlineIntervalId: number
const { setVariable } = useCssVariables()
onMounted(() => {
  setVariable("maptool-sidebar-right", "20px") // 设置地图工具栏距右侧距离
  setVariable("maptool-sidebar-bottom", "20px") // 设置地图工具栏距底部距离
  // 刷新在线人员
  refreshXhOnlineIntervalId = setInterval(() => {
    refreshXhOnline()
  }, 60000)
  proxy.$mitt.on("changePanelTitleType", changePanelTitleType)
  getXhgk_XhgjList()
  getXhgk_CollectionList()
  getAveragePatrolValue()
  getXhgk_HeadTj()
  getTrendAnalysis()
})
onBeforeUnmount(() => {
  proxy.$mitt.off("changePanelTitleType", changePanelTitleType)
  refreshXhOnlineIntervalId && clearInterval(refreshXhOnlineIntervalId) // 清除定时器
})
</script>

<template>
  <div class="survey relative flex h-full gap-[20px] p-[20px] text-lg text-white">
    <div
      class="map-box"
      id="map"
    >
      <div class="section-bar">
        <MapLayerManage
          :modular="modular"
          :init-checked-keys="[35]"
          @addLayer="addLayerManageData"
          @removeLayer="removeLayerManageData"
        />
      </div>
      <MapPopup
        ref="popup"
        format-name="巡护人员"
        :info="popupInfo"
        @close="closePopup"
        @handleHistoryDataClick="handleHistoryDataClick"
      />
      <MapTool
        v-if="map"
        :map="map"
        :hidden-tools="['toggleSidebar']"
      />
    </div>
    <div class="mt-[15px] flex flex-1 flex-col gap-[20px]">
      <div class="relative z-10 flex h-[58vh] w-max">
        <div class="flex w-[255px] flex-1 flex-col items-center bg-[#0b142b] bg-opacity-100 p-4">
          <el-date-picker
            v-model="time"
            :type="datePickerType"
            placeholder="请选择日期"
            size="default"
            popper-class="custom-datepicker-popper"
            value-format="YYYY-MM-DD"
            :shortcuts="shortcuts"
            @change="changeDate"
          />
          <PageTabs class="mt-12" />
        </div>
        <div
          :class="{ show: showTree }"
          class="absolute bottom-0 left-[255px] top-0 flex w-[340px] flex-col gap-3 bg-[#1e3450] bg-opacity-80 p-2"
        >
          <div class="flex items-center justify-between leading-loose">
            <span>选择人员</span>
            <el-icon
              class="cursor-pointer"
              @click="changeShowTree"
              ><i-ep-caret-bottom
            /></el-icon>
          </div>
          <Tree class="flex-1" />
        </div>
      </div>
      <div class="z-10 flex flex-1 gap-[20px] overflow-hidden">
        <div class="flex-1">
          <BasePanel title="最新轨迹">
            <template #contain>
              <ElTablePanel
                :columns="gjTableColumns"
                :data="gjTableData"
              />
            </template>
          </BasePanel>
        </div>
        <div class="flex-1">
          <BasePanel title="最新采集">
            <template #contain>
              <ElTablePanel
                :columns="cjTableColumns"
                :data="cjTableData"
              />
            </template>
          </BasePanel>
        </div>
        <div class="flex-1">
          <BasePanel
            title="巡护均值"
            :types="['巡护里程', '巡护时长', '巡护次数']"
          >
            <template #contain>
              <LineChartPanel
                key="巡护均值"
                :node-shadow="true"
                :area-background="true"
                :open-effect="true"
                :data="lineData"
              />
            </template>
          </BasePanel>
        </div>
      </div>
    </div>
    <div class="r-con z-10 mt-[15px] flex w-[420px] flex-col gap-[20px]">
      <div class="h-[330px]">
        <BasePanel title="基础概况">
          <template #contain>
            <div class="grid h-full grid-cols-3">
              <div class="flexbox-col">
                <span class="gk-name text-custom4">巡护总里数</span>
                <div class="flex items-center gap-2">
                  <count-up
                    :end-val="xhInfo.Xhkm"
                    class="text-light text-2xl"
                  ></count-up>
                  <span class="text-custom4 text-sm">KM</span>
                </div>
                <img
                  :src="$fun.getImg('patrol/bg1.png')"
                  alt=""
                  class="animate-img -mt-3"
                />
              </div>
              <div class="flexbox-col">
                <span class="gk-name text-custom4">巡护总次数</span>
                <div class="flex items-center gap-2">
                  <count-up
                    :end-val="xhInfo.XhCount"
                    class="text-light text-2xl"
                  ></count-up>
                  <span class="text-custom4 text-sm">次</span>
                </div>
                <img
                  :src="$fun.getImg('patrol/bg2.png')"
                  alt=""
                  class="animate-img -mt-3"
                />
              </div>
              <div class="flexbox-col">
                <span class="gk-name text-custom4">巡护总时长</span>
                <div class="flex items-center gap-2">
                  <count-up
                    :end-val="xhInfo.XhTime"
                    class="text-light text-2xl"
                  ></count-up>
                  <span class="text-custom4 text-sm">小时</span>
                </div>
                <img
                  :src="$fun.getImg('patrol/bg3.png')"
                  alt=""
                  class="animate-img -mt-3"
                />
              </div>
              <div class="flexbox-col">
                <span class="gk-name text-custom4">巡护报警数</span>
                <div class="flex items-center gap-2">
                  <count-up
                    :end-val="xhInfo.XhAlarm"
                    class="text-light text-2xl"
                  ></count-up>
                  <span class="text-custom4 text-sm">次</span>
                </div>
                <img
                  :src="$fun.getImg('patrol/bg4.png')"
                  alt=""
                  class="animate-img -mt-3"
                />
              </div>
              <div class="flexbox-col">
                <span class="gk-name text-custom4">巡护采集数</span>
                <div class="flex items-center gap-2">
                  <count-up
                    :end-val="xhInfo.XhCollection"
                    class="text-light text-2xl"
                  ></count-up>
                  <span class="text-custom4 text-sm">个</span>
                </div>
                <img
                  :src="$fun.getImg('patrol/bg4.png')"
                  alt=""
                  class="animate-img -mt-3"
                />
              </div>
              <div class="flexbox-col">
                <span class="gk-name text-custom4">人员总数</span>
                <div class="flex items-center gap-2">
                  <count-up
                    :end-val="xhInfo.XhAllUser"
                    class="text-light text-2xl"
                  ></count-up>
                  <span class="text-custom4 text-sm">人</span>
                </div>
                <img
                  :src="$fun.getImg('patrol/bg4.png')"
                  alt=""
                  class="animate-img -mt-3"
                />
              </div>
            </div>
          </template>
        </BasePanel>
      </div>
      <div class="flex-1 overflow-hidden">
        <BasePanel
          title="趋势分析"
          class="overflow-hidden"
        >
          <template #contain>
            <div class="relative flex h-1/2 flex-col">
              <div class="flexbox gap-2 bg-[#294064] text-sm leading-loose text-custom3">
                <img
                  :src="$fun.getImg('arrow-left.png')"
                  alt=""
                />
                巡护次数
                <img
                  :src="$fun.getImg('arrow-right.png')"
                  alt=""
                />
              </div>
              <div class="flex-1">
                <LineChartPanel
                  path="path://M 0 -8 L 7 -4 L 7 4 L 0 8 L -7 4 L -7 -4 Z M 0 -2 A 2 2 0 1 1 0 2 A 2 2 0 1 1 0 -2 Z"
                  key="巡护次数"
                  :data="xhcslineData"
                  :colors="['#15B392']"
                />
              </div>
            </div>
            <div class="relative flex h-1/2 flex-col">
              <div class="flexbox gap-2 bg-[#294064] text-sm leading-loose text-custom3">
                <img
                  :src="$fun.getImg('arrow-left.png')"
                  alt=""
                />
                巡护里程
                <img
                  :src="$fun.getImg('arrow-right.png')"
                  alt=""
                />
              </div>
              <div class="flex-1">
                <Bar3DChartPanel
                  key="巡护里程"
                  :data="barData"
                />
              </div>
            </div>
          </template>
        </BasePanel>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.survey {
  color: #fff;
  .map-box {
    width: calc(100% - 21.875vw - 60px);
    height: 58vh;
    position: absolute;
    top: 35px;
    left: 20px;
    // background: url("@/assets/images/map-bg.svg") no-repeat;
    background-size: 100%;
    background-position: center;
    z-index: 0;
    .section-bar {
      position: absolute;
      top: 20px;
      right: var(--maptool-sidebar-right);
      display: flex;
      gap: 15px;
      height: 32px;
      transition: all 0.3s ease-in-out;
      z-index: 1;
    }
  }
  .show {
    height: 50px;
    overflow: hidden;
  }
  .animate-img {
    position: relative;
    animation: rotate 0.5s ease-in infinite alternate;
  }
  @keyframes rotate {
    from {
      transform: translateY(-1px);
    }
    to {
      transform: translateY(0px);
    }
  }
  .r-con {
    width: 21.875vw;
    .gk-name {
      font-size: 0.9375vw;
    }
  }
}
</style>
<style lang="scss">
.survey {
  .text-light {
    text-shadow:
      -2px -2px 3px rgba(255, 255, 255, 0.7),
      2px 2px 3px rgba(255, 255, 255, 0.7) !important;
  }
  .el-input__wrapper {
    background-color: #0c284d;
    box-shadow: 0 0 0 1px #304868 inset;
    color: #fff;
    .el-input__inner,
    .el-input__prefix {
      color: #fff;
    }
  }
}
</style>
