<script lang="ts" setup>
import { GetPlaybackURL, GetPreviewURLByType, PutOneAssessment } from "@/api"
import { u } from "@/utils/viewerjs"
import {
  gsmmInstances,
  dwsjInstances,
  shqxInstances,
  jkkhInstances,
  qtsInstances,
  hwxjInstances,
  dzwlInstances,
  bchjInstances,
  lyjdInstances
} from "./mapPopupConfig"
import dayjs from "dayjs"
interface Props {
  info?: any
  infoType?: string
  // type在这里是一个枚举类型
  type?: 1 | 2 | 3
  formatName?: string
}
const props = withDefaults(defineProps<Props>(), {
  info: () => {},
  infoType: "",
  type: undefined,
  formatName: ""
})
const emit = defineEmits<{
  close: []
  handleHistoryDataClick: [any]
}>()
const dynamicPopupInstances = (type: string) => {
  if (type === "古树名木") {
    return gsmmInstances.some((item) => item.tabname === props.formatName)
  } else if (type === "动植物监测") {
    return dwsjInstances.some((item) => item.tabname === props.formatName)
  } else if (type === "水文气象站") {
    return shqxInstances.some((item) => item.tabname === props.formatName)
  } else if (type === "监控卡口") {
    return jkkhInstances.some((item) => item.tabname === props.formatName)
  } else if (type === "其他") {
    return qtsInstances.some((item) => item.tabname === props.formatName)
  } else if (type === "红外相机") {
    return hwxjInstances.some((item) => item.tabname === props.formatName)
  } else if (type === "电子围栏一张图") {
    return dzwlInstances.some((item) => item.tabname === props.formatName)
  } else if (type === "病虫害监测") {
    return bchjInstances.some((item) => item.tabname === props.formatName)
  } else if (type === "旅游景点") {
    return lyjdInstances.some((item) => item.tabname === props.formatName)
  }
  return false
}
// 定义弹框内容字段配置
const popupFileds = ref<any>([])
const { setVariable } = useCssVariables()
const classstyle = computed(() => {
  if (!props.type) {
    const random = Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")
    const mixWithBlack =
      "#" +
      random
        .match(/.{2}/g)!
        .map((hex) => {
          const color = parseInt(hex, 16)
          const mixed = Math.round(color * 0.3) // 与黑色混合,权重0.3
          return mixed.toString(16).padStart(2, "0")
        })
        .join("")
    setVariable("map-popup-fill", mixWithBlack)
    setVariable("map-popup-stroke", "#" + random)
    return `map-popup`
  }
  return `map-popup${props.type}`
})
const closePopup = () => {
  emit("close")
}
// 智能巡护-巡护概况-查看人员历史巡护数据；电子围栏-弹框点击查看历史AI分析记录
const handleHistoryDataClick = (data: any) => {
  emit("handleHistoryDataClick", Object.assign({}, data))
}
// 保留六位小数的工具函数
const formatNumber = (num: number): string => {
  if (typeof num !== "number") num = Number(num)
  return num ? num.toFixed(6) : "0.000000"
}
// 查看图片
const viewImg = (type: string) => {
  if (type === "水文气象站") {
    const imgsrcList = props.info.detail.fileurl ? ["/statisUrl" + props.info.detail.fileurl] : []
    u.showPreviewImg(0, imgsrcList)
  }
  if (type === "火情预警详情") {
    const imgsrcList = props.info.imgsrcList.map((item: string) => {
      return "/fireStaticUrl" + item
    })
    u.showPreviewImg(0, imgsrcList)
  }
  if (type === "动植物监测") {
    const imgsrcList = props.info.fileslist.map((item: any) => {
      return "/statisUrl/" + item.filepath
    })
    u.showPreviewImg(0, imgsrcList)
  }
  if (type === "古树名木") {
    const imgsrcList = props.info.fileslist.map((item: any) => {
      return "/statisUrl/" + item.filepath
    })
    u.showPreviewImg(0, imgsrcList)
  }
  if (type === "古树名木-二维码") {
    if (!props.info?.detail?.remark2) return
    const imgsrcList = ["/statisUrl" + props.info.detail.remark2]
    u.showPreviewImg(0, imgsrcList)
  }
  if (type === "虫情测报灯") {
    if (!props.info.equipmenturl) return
    const imgsrcList = ["/statisUrl" + props.info.equipmenturl]
    u.showPreviewImg(0, imgsrcList)
  }
  if (type === "病虫害监测") {
    if (!props.info.detail.equipmenturl) return
    const imgsrcList = ["/statisUrl" + props.info.detail.equipmenturl]
    u.showPreviewImg(0, imgsrcList)
  }
  if (type === "旅游景点") {
    if (props.info.fileslist.length === 0) return
    const imgsrcList: string[] = []
    props.info.fileslist.forEach((item: any) => {
      if (item.filepath) {
        imgsrcList.push("/statisUrl" + item.filepath)
      }
    })

    u.showPreviewImg(0, imgsrcList)
  }
}
// 点击按钮
const handleBtnClick = async (type: string) => {
  // 火情预警详情弹框中的研判按钮点击
  if (props.formatName === "火情预警详情") {
    let status = 0
    switch (type) {
      case "居民用火":
        status = 4
        break
      case "工业用火":
        status = 5
        break
      case "燃烧杂草":
        status = 6
        break
      case "火情":
        status = 1
        break
      case "误报":
        status = 2
        break
    }
    const { success } = await PutOneAssessment({ id: [props.info?.id || props.info?.detail.id], status }) // status不传默认为误判
    if (success) {
      ElMessage.success("研判成功:" + type)
    } else {
      ElMessage.info("研判失败:" + type)
    }
  }
}
// 全景地址点击查看
const toQj = (filed: string) => {
  if (props.info?.detail[filed]) {
    window.open(`/statisUrl/${props.info?.detail[filed]}`)
  } else {
    ElMessage.info("暂无全景地址")
  }
}
// 记录监控卡口第一帧是否加载完成
const firstFrameDisplay = ref(false)
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
// 存储防火监控点信息，有包家防火和包家防火热成像
let currentFireMonitoringInfo = ref<any>(null)
// 切换包家防火和包家防火热成像（防火监测点模块）
const handleFireMonitoringInfoClick = async (item: any) => {
  currentFireMonitoringInfo.value = item
  // 动态弹窗
  const showfiledch = currentFireMonitoringInfo.value.showfiledch?.split(",")
  const showfiled = currentFireMonitoringInfo.value.showfiled?.split(",")
  popupFileds.value =
    showfiledch?.map((item: string, index: number) => {
      return {
        filed: showfiled[index],
        filedch: item
      }
    }) || []
  // 当为监控卡口时，获取视频流地址
  if (dynamicPopupInstances("监控卡口")) {
    firstFrameDisplay.value = true
    const { response, success } = await GetPreviewURLByType({
      deviceId: currentFireMonitoringInfo.value.detail.deviceid,
      Playtype: "ws"
    })
    if (success) {
      currentFireMonitoringInfo.value.detail.videoUrl = response
    } else {
      ElMessage.info("未能获取到视频流信息，请重新加载！")
    }
  }
}
// 海康回放视频ref
const replayVideoRef = ref<any>(null)
watch(
  () => props.info,
  async (val) => {
    // console.log(val, props.formatName, 111)
    currentFireMonitoringInfo.value = null
    // 判断是否为防火监控点类型，有包家防火和包家防火热成像，做特殊处理
    if (props.info instanceof Array) {
      currentFireMonitoringInfo.value = props.info[0]
      // 动态弹窗
      const showfiledch = currentFireMonitoringInfo.value.showfiledch?.split(",")
      const showfiled = currentFireMonitoringInfo.value.showfiled?.split(",")
      popupFileds.value =
        showfiledch?.map((item: string, index: number) => {
          return {
            filed: showfiled[index],
            filedch: item
          }
        }) || []
      // 当为监控卡口时，获取视频流地址
      if (dynamicPopupInstances("监控卡口")) {
        firstFrameDisplay.value = true
        const { response, success } = await GetPreviewURLByType({
          deviceId: currentFireMonitoringInfo.value.detail.deviceid,
          Playtype: "ws"
        })
        if (success) {
          currentFireMonitoringInfo.value.detail.videoUrl = response
        } else {
          ElMessage.info("未能获取到视频流信息，请重新加载！")
        }
      }
      return
    }

    // 这两个不是动态弹窗
    if (props.formatName === "巡护人员" || props.formatName === "虫情测报灯") return
    // 动态弹窗
    const showfiledch = val.showfiledch?.split(",")
    const showfiled = val.showfiled?.split(",")
    popupFileds.value =
      showfiledch?.map((item: string, index: number) => {
        return {
          filed: showfiled[index],
          filedch: item
        }
      }) || []
    // 当为监控卡口时，获取视频流地址
    if (dynamicPopupInstances("监控卡口")) {
      firstFrameDisplay.value = true
      const { response, success } = await GetPreviewURLByType({
        deviceId: val.detail.deviceid,
        Playtype: "ws"
      })
      if (success) {
        val.detail.videoUrl = response
      } else {
        ElMessage.info("未能获取到视频流信息，请重新加载！")
      }
    }
    // 当为电子围栏时，获取视频流地址
    if (dynamicPopupInstances("电子围栏一张图")) {
      // tb_electronicfence_equipment
      firstFrameDisplay.value = true
      // const { response } = await GetPreviewURLByType({ deviceId: val.detail.deviceid, Playtype: "ws" })
      const { data } = await axios.get(
        "https://gwdm.510link.com/api/devices/dCameraInfoVServerApi/liveStart?uniqueCode=" + val.detail.equipmentid,
        {
          headers: {
            "X-MAAAPI-ApiKey": "lOvA9FzlTYkOx4cg98UOTA==",
            "X-MAAAPI-ApiSecret": "pyNB9Ld11sn3ttidM+I9cUsOGSvYUep2G73lZh3cPR4="
          }
        }
      )

      if (data) {
        val.detail.videoUrl = data?.content?.url || ""
      } else {
        ElMessage.info("未能获取到视频流信息，请重新加载！")
      }
    }

    // 当为火情预警详情时，获取视频回放流地址
    if (props.formatName === "火情预警详情") {
      const startTime = dayjs(val.starttime).subtract(2, "minute").format("YYYY-MM-DD HH:mm:ss")
      const endTime = dayjs(val.starttime).add(2, "minute").format("YYYY-MM-DD HH:mm:ss")

      firstFrameDisplay.value = true
      setTimeout(async () => {
        try {
          const { response } = await GetPlaybackURL({
            deviceId: val.cameraindexcode, // "9379a7d70df0495a8fd2a0ef2a51ab1c",  // "f3eae95f5045419aae6474a62850d79c",
            Playtype: "ws",
            beginTime: startTime,
            endTime: endTime
          })
          if (response?.url) {
            const startHkFormat =
              dayjs(startTime).format("YYYY-MM-DD") + "T" + dayjs(startTime).format("HH:mm:ss") + "Z"
            const endHkFormat = dayjs(endTime).format("YYYY-MM-DD") + "T" + dayjs(endTime).format("HH:mm:ss") + "Z"
            val.videoUrl = response.url
            ElMessage.success("播放成功，等待第一帧加载完成！")
            setTimeout(() => {
              replayVideoRef.value?.replay(response.url, startHkFormat, endHkFormat)
            }, 100)
          } else {
            ElMessage.info("未能获取到视频流信息，请重新加载！")
          }
        } catch (error) {
          ElMessage.info("请求回放地址失败！")
        } finally {
          firstFrameDisplay.value = false
        }
      }, 1000)
    }
  }
)
</script>
<template>
  <div
    id="map-popup"
    :class="classstyle"
  >
    <div
      class="close"
      @click="closePopup"
    >
      <el-icon><i-ep-circle-close /></el-icon>
    </div>
    <!-- 巡护人员 -->
    <div
      v-if="formatName === '巡护人员'"
      class="container"
    >
      <div class="title">{{ info?.title }}</div>
      <div class="box1">
        <ul class="con">
          <li>姓名：{{ info?.Real_name || "暂无" }}</li>
          <li>当前状态：{{ info?.Status || "暂无" }}</li>
          <li>当前速度：{{ info?.Speed || "暂无" }}</li>
          <li>方向：{{ info?.Direction || "暂无" }}</li>
          <li>任务类型：{{ info?.Tasktype || "暂无" }}</li>
          <li>最后更新时间：{{ info?.Uploaddate || "暂无" }}</li>
          <li class="history-data-box">
            历史巡护数据：
            <div
              class="history-data"
              @click="handleHistoryDataClick(info)"
            >
              查看
            </div>
          </li>
        </ul>
      </div>
    </div>
    <!-- 水文气象站 -->
    <div
      v-else-if="dynamicPopupInstances('水文气象站')"
      class="container"
    >
      <div class="title">{{ info?.detail?.name.includes("水") ? "水文站详细信息" : "气象站详细信息" }}</div>
      <div class="box1">
        <ul class="con flexcol">
          <template
            v-for="item in popupFileds"
            :key="item.filed"
          >
            <li v-if="item.filed !== 'fileurl'">{{ item.filedch }}：{{ info?.detail[item.filed] || "暂无" }}</li>
          </template>
        </ul>
        <div
          class="r-con"
          style="width: 230px"
          @click="viewImg('水文气象站')"
        >
          <el-image
            :src="info?.detail.fileurl ? '/statisUrl' + info.detail.fileurl : ''"
            fit="cover"
          >
            <template #error>
              <div class="image-slot">
                <i-ep-picture />
                <span style="margin-left: 3px">暂无预览</span>
              </div>
            </template></el-image
          >
        </div>
      </div>
    </div>
    <!-- 监控卡口 -->
    <div
      v-else-if="dynamicPopupInstances('监控卡口')"
      class="container"
    >
      <template v-if="currentFireMonitoringInfo">
        <div class="title multiple-title">
          <span>防火监控详细信息</span>
          <div class="multiple-title-content">
            <span
              :class="{ active: item.detail.deviceid === currentFireMonitoringInfo.detail.deviceid }"
              v-for="item in info"
              :key="item.detail.deviceid"
              @click="handleFireMonitoringInfoClick(item)"
              >{{ item.detail.mc }}</span
            >
          </div>
        </div>
        <div class="box1">
          <ul class="con flexcol">
            <li
              v-for="item in popupFileds"
              :key="item.filed"
              :title="currentFireMonitoringInfo?.detail[item.filed] || '暂无'"
            >
              {{ item.filedch }}：{{ currentFireMonitoringInfo?.detail[item.filed] || "暂无" }}
            </li>
          </ul>
          <div class="r-con">
            <div
              v-loading="firstFrameDisplay"
              element-loading-text="视频加载中，请稍后..."
              :element-loading-spinner="svg"
              element-loading-svg-view-box="-10, -10, 50, 50"
              element-loading-background="rgba(9, 20, 31, 0.6)"
              class="hk-video"
              v-if="currentFireMonitoringInfo?.detail?.statu === '在线' && currentFireMonitoringInfo?.detail?.videoUrl"
            >
              <hkVideo
                style="width: 100%; height: 100%"
                :video-url="currentFireMonitoringInfo.detail.videoUrl"
                :currentLayout="1"
                @firstFrameDisplay="firstFrameDisplay = false"
              />
            </div>
            <el-image
              v-else
              :src="''"
              fit="cover"
            >
              <template #error>
                <div class="image-slot">
                  <i-ep-picture />
                  <span style="margin-left: 3px">离线中，暂无预览</span>
                </div>
              </template></el-image
            >
          </div>
        </div>
      </template>
      <template v-else>
        <div class="title">监控卡口详细信息</div>
        <div class="box1">
          <ul class="con flexcol">
            <li
              v-for="item in popupFileds"
              :key="item.filed"
              :title="info?.detail[item.filed] || '暂无'"
            >
              {{ item.filedch }}：{{ info?.detail[item.filed] || "暂无" }}
            </li>
          </ul>
          <div class="r-con">
            <div
              v-loading="firstFrameDisplay"
              element-loading-text="视频加载中，请稍后..."
              :element-loading-spinner="svg"
              element-loading-svg-view-box="-10, -10, 50, 50"
              element-loading-background="rgba(9, 20, 31, 0.6)"
              class="hk-video"
              v-if="info?.detail?.statu === '在线' && info?.detail?.videoUrl"
            >
              <hkVideo
                style="width: 100%; height: 100%"
                :video-url="info.detail.videoUrl"
                :currentLayout="1"
                @firstFrameDisplay="firstFrameDisplay = false"
              />
            </div>
            <el-image
              v-else
              :src="''"
              fit="cover"
            >
              <template #error>
                <div class="image-slot">
                  <i-ep-picture />
                  <span style="margin-left: 3px">离线中，暂无预览</span>
                </div>
              </template></el-image
            >
          </div>
        </div>
      </template>
    </div>
    <!-- 火情预警详情 -->
    <div
      v-else-if="formatName === '火情预警详情'"
      class="container"
    >
      <div class="title">火情预警详情信息</div>
      <div class="box2">
        <ul class="con">
          <li>设备名称：{{ info?.cameraname || "暂无" }}</li>
          <li>瞭望塔位置：{{ formatNumber(info?.towerlon) + " " + formatNumber(info?.towerlat) || "暂无" }}</li>
          <li>瞭望塔海拔：{{ info?.height || "暂无" }}</li>
          <li>预警时间：{{ info?.starttime || "暂无" }}</li>
        </ul>
        <div class="b-con">
          <el-image
            :src="info?.imgsrcList?.[0] ? '/fireStaticUrl' + info.imgsrcList[0] : ''"
            fit="cover"
            @click="viewImg('火情预警详情')"
          >
            <template #error>
              <div class="image-slot">
                <i-ep-picture />
                <span style="margin-left: 3px">暂无预览</span>
              </div>
            </template></el-image
          >
          <div
            v-loading="firstFrameDisplay"
            element-loading-text="视频加载中，请稍后..."
            :element-loading-spinner="svg"
            element-loading-svg-view-box="-10, -10, 50, 50"
            element-loading-background="rgba(9, 20, 31, 0.6)"
            class="video-box"
          >
            <hkVideo
              ref="replayVideoRef"
              style="width: 100%; height: 100%"
              :video-url="info.videoUrl"
              :currentLayout="1"
              @firstFrameDisplay="firstFrameDisplay = false"
            />
          </div>
        </div>
        <div class="btns">
          <div @click="handleBtnClick('居民用火')">居民用火</div>
          <div @click="handleBtnClick('工业用火')">工业用火</div>
          <div @click="handleBtnClick('燃烧杂草')">燃烧杂草</div>
          <div @click="handleBtnClick('火情')">
            <img
              :src="$fun.getImg('researchManagement/hq-icon1.png')"
              alt=""
            />
            火情
          </div>
          <div @click="handleBtnClick('误报')">
            <img
              :src="$fun.getImg('researchManagement/hq-icon2.png')"
              alt=""
            />
            误报
          </div>
        </div>
      </div>
    </div>
    <!-- 红外相机 -->
    <div
      v-else-if="dynamicPopupInstances('红外相机')"
      class="container"
    >
      <div class="title">红外相机详细信息</div>
      <div class="box1">
        <ul class="con flexcol">
          <li
            v-for="item in popupFileds"
            :key="item.filed"
          >
            {{ item.filedch }}：{{ info?.detail[item.filed] || "暂无" }}
          </li>
        </ul>
      </div>
    </div>
    <!-- 古树名木 -->
    <div
      v-else-if="dynamicPopupInstances('古树名木')"
      class="container"
    >
      <div class="title">古树名木详细信息</div>
      <div class="box">
        <ul
          class="con"
          :class="popupFileds.length > 10 ? 'flexrow' : 'flexcol'"
        >
          <li
            v-for="item in popupFileds"
            :key="item.filed"
            :title="info?.detail[item.filed]?.length > 12 ? info?.detail[item.filed] : undefined"
          >
            <!-- 全景地址 -->
            <a
              v-if="['springqj', 'summerqj', 'autumnqj', 'winterqj'].includes(item.filed)"
              @click.prevent="toQj(item.filed)"
              >{{ item.filedch }}：<span style="color: #58baf1; cursor: pointer">点击查看</span></a
            >
            <span v-else-if="item.filed === 'ldmc'"
              >{{ item.filedch }}：<span style="font-style: italic">{{
                info?.detail[item.filed] || "暂无"
              }}</span></span
            >
            <span v-else>{{ item.filedch }}：{{ info?.detail[item.filed] || "暂无" }}</span>
          </li>
          <li @click="viewImg('古树名木-二维码')">
            <span style="color: #58baf1; cursor: pointer">点击查看二维码</span>
          </li>
        </ul>

        <div
          class="r-con"
          style="width: 330px"
          @click="viewImg('古树名木')"
        >
          <el-image
            :src="info?.fileslist?.[0]?.filepath ? '/statisUrl' + info.fileslist[0].filepath : ''"
            fit="cover"
          >
            <template #error>
              <div class="image-slot">
                <i-ep-picture />
                <span style="margin-left: 3px">暂无预览</span>
              </div>
            </template></el-image
          >
        </div>
      </div>
    </div>
    <!-- 动植物监测 -->
    <div
      v-else-if="dynamicPopupInstances('动植物监测')"
      class="container"
    >
      <div class="title">动植物监测详细信息</div>
      <div class="box">
        <ul
          class="con"
          :class="popupFileds.length >= 8 ? 'flexrow' : 'flexcol'"
        >
          <li
            v-for="item in popupFileds"
            :key="item.filed"
            :title="info?.detail[item.filed]?.length > 12 ? info?.detail[item.filed] : undefined"
          >
            <span v-if="item.filed === 'ldmc'"
              >{{ item.filedch }}：<span style="font-style: italic">{{
                info?.detail[item.filed] || "暂无"
              }}</span></span
            >
            <span v-else>{{ item.filedch }}：{{ info?.detail[item.filed] || "暂无" }}</span>
          </li>
        </ul>
        <div
          class="r-con"
          style="width: 230px"
          @click="viewImg('动植物监测')"
        >
          <el-image
            :src="info?.fileslist?.[0]?.filepath ? '/statisUrl' + info.fileslist[0].filepath : ''"
            fit="cover"
          >
            <template #error>
              <div class="image-slot">
                <i-ep-picture />
                <span style="margin-left: 3px">暂无预览</span>
              </div>
            </template></el-image
          >
        </div>
      </div>
    </div>
    <!-- 虫情测报灯 -->
    <div
      v-else-if="formatName === '虫情测报灯'"
      class="container"
    >
      <div class="title">虫情测报灯详细信息</div>
      <div class="top-three">
        <span>本月Top3害虫:</span>
        <div
          v-for="(item, index) in info?.topthree"
          :key="item.xAxis"
          class="top-three-item"
        >
          <span>{{ item.xAxis }}</span>
          <span v-if="index !== 2">、</span>
        </div>
      </div>
      <div class="box">
        <ul class="con">
          <li>设备名称：{{ info?.equipmentname || "暂无" }}</li>
          <li>所属单位：{{ info?.affiliatedunit || "暂无" }}</li>
          <li>设备品牌：{{ info?.equipmentbrand || "暂无" }}</li>
          <li>设备型号：{{ info?.equipmentmodel || "暂无" }}</li>
          <li>负责人员：{{ info?.personnel || "暂无" }}</li>
          <li>联系电话：{{ info?.telephone || "暂无" }}</li>
          <li>投运时间：{{ info?.createtime || "暂无" }}</li>
        </ul>
        <div class="r-con">
          <el-image
            :src="info?.equipmenturl ? '/statisUrl' + info?.equipmenturl : ''"
            fit="contain"
            style="height: 180px"
            @click="viewImg('虫情测报灯')"
          >
            <template #error>
              <div class="image-slot">
                <i-ep-picture />
                <span style="margin-left: 3px">暂无预览</span>
              </div>
            </template></el-image
          >
        </div>
      </div>
    </div>
    <!-- 电子围栏 -->
    <div
      v-else-if="dynamicPopupInstances('电子围栏一张图')"
      class="container"
    >
      <div class="title">电子围栏详细信息</div>
      <div class="box1">
        <ul class="con flexcol">
          <li>设备名称：{{ info?.detail.name }}</li>
          <li>设备状态：{{ info?.detail.status }}</li>
          <li>设备经度：{{ info?.detail.lon }}</li>
          <li>设备纬度：{{ info?.detail.lat }}</li>
          <li>设备电量：{{ info?.detail.dl }}%</li>
          <li>所属区域：{{ info?.detail.ssqy }}</li>
          <li
            class="history-data"
            @click="handleHistoryDataClick(info)"
          >
            点击查看历史AI分析记录
          </li>
        </ul>
        <div
          class="r-con"
          style="height: 300px"
        >
          <div
            v-loading="firstFrameDisplay"
            element-loading-text="视频加载中，请稍后..."
            :element-loading-spinner="svg"
            element-loading-svg-view-box="-10, -10, 50, 50"
            element-loading-background="rgba(9, 20, 31, 0.6)"
            class="hk-video"
            v-if="info?.detail?.status === '在线' && info?.detail?.name && info?.detail?.videoUrl"
          >
            <hkVideo
              style="width: 100%; height: 100%"
              :video-url="info.detail.videoUrl"
              :currentLayout="1"
              @firstFrameDisplay="firstFrameDisplay = false"
            />
          </div>
          <el-image
            v-else
            :src="$fun.getImg('electronicFence/no-preview.png')"
            fit="cover"
          >
            <template #error>
              <div class="image-slot">
                <i-ep-picture />
                <span style="margin-left: 3px">设备暂无预览</span>
              </div>
            </template></el-image
          >
        </div>
      </div>
    </div>
    <!-- 病虫害监测 -->
    <div
      v-else-if="dynamicPopupInstances('病虫害监测')"
      class="container"
    >
      <div class="title">病虫害监测详细信息</div>
      <div class="box">
        <ul
          class="con"
          :class="popupFileds.length > 10 ? 'flexrow' : 'flexcol'"
        >
          <li
            v-for="item in popupFileds"
            :key="item.filed"
            :title="info?.detail[item.filed]?.length > 12 ? info?.detail[item.filed] : undefined"
          >
            <span>{{ item.filedch }}：{{ info?.detail[item.filed] || "暂无" }}</span>
          </li>
        </ul>
        <div
          class="r-con"
          style="height: 260px"
          @click="viewImg('病虫害监测')"
        >
          <el-image
            :src="info?.detail?.equipmenturl ? '/statisUrl' + info.detail.equipmenturl : ''"
            fit="contain"
          >
            <template #error>
              <div class="image-slot">
                <i-ep-picture />
                <span style="margin-left: 3px">暂无预览</span>
              </div>
            </template></el-image
          >
        </div>
      </div>
    </div>
    <!-- 旅游景点 -->
    <div
      v-else-if="dynamicPopupInstances('旅游景点')"
      class="container"
    >
      <div class="title">旅游景点详细信息</div>
      <div class="box">
        <ul
          class="con"
          :class="popupFileds.length > 10 ? 'flexrow' : 'flexcol'"
        >
          <li
            v-for="item in popupFileds"
            :key="item.filed"
            :title="info?.detail[item.filed]?.length > 12 ? info?.detail[item.filed] : undefined"
          >
            <span>{{ item.filedch }}：{{ info?.detail[item.filed] || "暂无" }}</span>
          </li>
        </ul>
        <div
          class="r-con"
          @click="viewImg('旅游景点')"
        >
          <el-image
            :src="info?.fileslist?.[0]?.filepath ? '/statisUrl' + info.fileslist[0].filepath : ''"
            fit="contain"
          >
            <template #error>
              <div class="image-slot">
                <i-ep-picture />
                <span style="margin-left: 3px">暂无预览</span>
              </div>
            </template></el-image
          >
        </div>
      </div>
    </div>
    <!-- 其他动态弹窗 -->
    <div
      v-else
      class="container"
    >
      <div class="title">详细信息</div>
      <div class="box">
        <ul
          v-if="popupFileds.length > 0"
          class="con"
          :class="popupFileds.length >= 8 ? 'flexrow' : 'flexcol'"
        >
          <li
            v-for="item in popupFileds"
            :key="item.filed"
            :title="info?.detail[item.filed]?.length > 12 ? info?.detail[item.filed] : undefined"
          >
            <span v-if="item.filed === 'ldmc'"
              >{{ item.filedch }}：<span style="font-style: italic">{{
                info?.detail[item.filed] || "暂无"
              }}</span></span
            >
            <span v-else>{{ item.filedch }}：{{ info?.detail[item.filed] || "暂无" }}</span>
          </li>
        </ul>
        <EmptyData
          v-else
          description="暂无数据"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
#map-popup {
  font-size: 14px;
  color: #fff;
  overflow: hidden;
  .close {
    position: absolute;
    top: 5px;
    right: 5px;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    z-index: 1;
  }
  :deep(.container) {
    .title {
      font-size: 14px;
      padding: 5px 10px;
      text-align: left;
    }
    .multiple-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .multiple-title-content {
        margin-right: 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 5px;
        color: #999;
        > span {
          cursor: pointer;
          &:hover {
            color: #eee;
          }
          &.active {
            color: #eee;
          }
        }
      }
    }
    .flexrow {
      max-width: 460px !important;
      flex-direction: row !important;
      flex-wrap: wrap;
      gap: 5px;
      > li {
        width: calc(calc(100% - 5px) / 2);
      }
    }
    .flexcol {
      flex-direction: column !important;
    }

    .top-three {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: fit-content;
      line-height: 2em;
      font-size: 14px;
      padding: 2px 10px 2px 10px;
      .top-three-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
    }
    // 其他、古树名木、动植物监测.
    .box {
      position: relative;
      display: flex;
      padding: 0px 10px 5px 10px;
      margin: 0;
      gap: 10px;
      .con {
        min-width: 220px;
        max-width: 260px;
        display: flex;
        flex-direction: column;
        padding: 0;
        margin: 0;
        li {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          line-height: 24px;
        }
      }
      .r-con {
        width: 180px;
        .el-image {
          width: 100%;
          height: 100%;
          .image-slot {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            height: 100%;
            border: 1px dashed #999;
            color: var(--el-text-color-secondary);
            font-size: 14px;
          }
        }
      }
    }
    // 监控卡口、红外相机、水文气象站..
    .box1 {
      display: flex;
      padding: 10px 10px 5px 10px;
      margin: 0;
      gap: 10px;
      .con {
        min-width: 180px;
        max-width: 249px;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        padding: 0;
        margin: 0;
        li {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          line-height: 24px;
        }
        .history-data-box {
          display: flex;
        }
      }
      .r-con {
        width: 350px;
        .hk-video {
          position: relative;
          width: 100%;
          height: 100%;
        }
        .el-image {
          width: 100%;
          height: 100%;
          .image-slot {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            height: 100%;
            border: 1px dashed #999;
            color: var(--el-text-color-secondary);
            font-size: 14px;
          }
        }
      }
    }
    // 火情预警详情
    .box2 {
      width: 600px;
      display: flex;
      flex-direction: column;
      padding: 10px 10px 5px 10px;
      margin: 0;
      gap: 10px;
      font-size: 12px;
      .con {
        display: flex;
        flex-wrap: wrap;
        padding: 0;
        margin: 0;
        li {
          width: 50%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          line-height: 24px;
        }
      }
      .b-con {
        display: flex;
        gap: 4px;
        height: 240px;
        overflow: hidden;
        .el-image {
          width: 200px;
          height: 100%;
          border: 1px dashed #999;
          .image-slot {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            height: 100%;
            // border: 1px dashed #999;
            color: var(--el-text-color-secondary);
            font-size: 14px;
          }
        }
        .video-box {
          flex: 1;
          height: 100%;
        }
      }
      .btns {
        display: flex;
        gap: 5px;
        justify-content: center;
        margin-bottom: 5px;
        > div {
          display: flex;
          align-items: center;
          gap: 3px;
          padding: 3px 6px;
          border-radius: 2px;
          border: 1px solid #fff;
          line-height: 0;
          cursor: pointer;
          img {
            width: 14px;
            height: 14px;
          }
          &:nth-child(1) {
            background-color: rgba(67, 53, 167, 0.3);
            border-color: rgb(67, 53, 167);
            color: rgb(67, 53, 167);
          }
          &:nth-child(2) {
            background-color: rgba(33, 155, 157, 0.3);
            border-color: rgb(33, 155, 157);
            color: rgb(33, 155, 157);
          }
          &:nth-child(3) {
            background-color: rgba(13, 146, 244, 0.3);
            border-color: rgb(13, 146, 244);
            color: rgb(13, 146, 244);
          }
          &:nth-child(4) {
            background-color: rgba(204, 43, 82, 0.3);
            border-color: rgb(204, 43, 82);
            color: rgb(204, 43, 82);
          }
          &:nth-child(5) {
            background-color: rgba(236, 131, 5, 0.3);
            border-color: rgb(236, 131, 5);
            color: rgb(236, 131, 5);
          }
        }
      }
    }
    .history-data {
      cursor: pointer;
      color: #58baf1;
      font-size: 12px;
      width: fit-content;
      height: 22px;
      padding: 0 10px;
      border-radius: 2px;
      border: 1px solid #58baf1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  // &::before {
  //   position: absolute;
  //   top: -10px;
  //   right: 0px;
  //   transform: translateX(1px) translateY(calc(100% + 2px));
  //   display: block;
  //   content: "";
  //   width: 120px;
  //   height: 5px;
  // }
}
.map-popup {
  $stroke: var(--map-popup-stroke);
  $fill: var(--map-popup-fill);
  .close {
    // color: $stroke;
    color: #fff;
  }
  .container {
    border: 2px $stroke solid;
    background-color: $fill;
    .title {
      // 左右颜色渐变
      background: linear-gradient(to right, $stroke, $fill);
    }
  }
  // &::before {
  //   background: url("@/assets/images/patrol/popup-top1.svg") no-repeat left bottom / 100% 100%;
  // }

  &::after {
    content: "";
    position: absolute;
    bottom: -6px; // 控制三角形位置
    left: 50%; // 居中
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 7px solid transparent;
    border-right: 7px solid transparent;
    border-top: 7px solid $stroke; // 使用 $stroke 作为填充色
  }
}
.map-popup1 {
  $stroke: #2cadff;
  $fill: #051d42;
  .close {
    color: $stroke;
  }
  .container {
    border: 2px $stroke solid;
    background-color: $fill;
    .title {
      // 左右颜色渐变
      background: linear-gradient(to right, $stroke, $fill);
    }
  }
  // &::before {
  //   background: url("@/assets/images/patrol/popup-top1.svg") no-repeat left bottom / 100% 100%;
  // }

  &::after {
    content: "";
    position: absolute;
    bottom: -5px; // 控制三角形位置
    left: 50%; // 居中
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid $stroke; // 使用 $stroke 作为填充色
  }
}
.map-popup2 {
  $stroke: #28ec47;
  $fill: #042b1b;
  .close {
    color: $stroke;
  }
  .container {
    border: 2px $stroke solid;
    background-color: $fill;
    .title {
      // 左右颜色渐变
      background: linear-gradient(to right, $stroke, $fill);
    }
  }

  // &::before {
  //   background: url("@/assets/images/patrol/popup-top2.svg") no-repeat left bottom / 100% 100%;
  // }
  &::after {
    content: "";
    position: absolute;
    bottom: -5px; // 控制三角形位置
    left: 50%; // 居中
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid $stroke; // 使用 $stroke 作为填充色
  }
}
.map-popup3 {
  $stroke: #eaa727;
  $fill: #271e07;
  .close {
    color: $stroke;
  }
  .container {
    border: 2px $stroke solid;
    background-color: $fill;
    .title {
      // 左右颜色渐变
      background: linear-gradient(to right, $stroke, $fill);
    }
  }

  // &::before {
  //   background: url("@/assets/images/patrol/popup-top3.svg") no-repeat left bottom / 100% 100%;
  // }

  &::after {
    content: "";
    position: absolute;
    bottom: -5px; // 控制三角形位置
    left: 50%; // 居中
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid $stroke; // 使用 $stroke 作为填充色
  }
}
.popup-btn {
  background: linear-gradient(to right, #58baf1, #4693be 50%, #346d8d);
  color: #fff;
  border: none;
}
.empty-data {
  width: 300px;
  height: 220px;
  background-color: rgba(0, 0, 0, 0.7);
}
</style>
