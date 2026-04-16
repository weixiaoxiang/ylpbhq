<script lang="ts" setup>
import {
  GetAllIrcameraList,
  GetInfraredCamera_Collect,
  GetInfraredCamera_Deletexh,
  GetInfraredCamera_FindFile,
  GetInfraredCamera_Push,
  GetInfraredCameraSpeciesList,
  GetInterface,
  InfraredCameraDownloadFilesAsZip
} from "@/api"
import InfraredSpeciesHeatMap from "./InfraredSpeciesHeatMap.vue"
import { Search } from "@element-plus/icons-vue"
import dayjs from "dayjs"
interface Props {
  width?: number
  height?: number
  name?: any
}
const props = withDefaults(defineProps<Props>(), {})
const { user } = storeToRefs(useConfigStore())
const info = ref<any>(null) // 当前红外相机详情
// 获得红外相机详情
const getDetail = async (data: any) => {
  const { response, success, msg } = await GetInterface({
    ssmk: "地图弹框详情",
    layerid: "32",
    id: data.id
  })
  if (!success) return ElMessage.error(msg)
  info.value = response.response
}

const params = ref<any>({
  hwxjname: props.name || ""
})
// 获得识别物种数据
const spnameList = ref<any>([])
interface LeftParams {
  name: string
  hwxjname: string
  page: number
  intPageSize: number
}
const leftParams = ref<LeftParams>({ name: "", hwxjname: "", page: 1, intPageSize: 12 })
const currentItem = ref<any>({})
const spnameListTotal = ref(0)
const getSpnameList = async () => {
  const { response } = await GetInfraredCameraSpeciesList({
    name: leftParams.value.name,
    hwxjname: leftParams.value.hwxjname,
    page: leftParams.value.page,
    intPageSize: leftParams.value.intPageSize
  })
  spnameList.value = response.data
  spnameListTotal.value = response.dataCount
}
const handleSpnameCurrentChange = (val: number) => {
  leftParams.value.page = val
  getSpnameList()
}
const handleSpnameSizeChange = (val: number) => {
  leftParams.value.page = 1
  leftParams.value.intPageSize = val
  getSpnameList()
}

const handleItemClick = (item: any) => {
  currentItem.value = item
  params.value.dwname = item.spname
  search()
}
const changeParams = () => {
  page.value = 1
  getSpnameList()
}

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
const hwxjList = ref<any>()
// 获得红外相机列表
const getHwxjList = async () => {
  const { response } = await GetAllIrcameraList()
  hwxjList.value = response
}
// 选择所属相机，并查询该相机详情
const changeHwxj = (val: any) => {
  if (!val) {
    info.value = null
    search()
    return
  }
  const findItem = hwxjList.value.find((item: any) => item.name === val)
  getDetail(findItem)
  search()
}
// 查询
const search = () => {
  page.value = 1
  getListData()
}
const date = ref()
// 修改查询日期
const changeDate = () => {
  if (date.value) {
    params.value.beginTime = date.value[0]
    params.value.endTime = date.value[1]
  } else {
    params.value.beginTime = ""
    params.value.endTime = ""
  }
}
const page = ref(1)
const intPageSize = ref(12)
const total = ref(0)
const list = ref<any>([])
// 查询表格数据
const getListData = async () => {
  loading.value = true
  try {
    const { response } = await GetInfraredCamera_FindFile({
      ...params.value,
      page: page.value,
      intPageSize: intPageSize.value
    })
    list.value = response.data
    total.value = response.dataCount
  } catch (error) {
  } finally {
    loading.value = false
  }
}
const handleCurrentChange = (val: number) => {
  page.value = val
  getListData()
}
const handleSizeChange = (val: number) => {
  page.value = 1
  intPageSize.value = val
  getListData()
}
const selectAll = ref(false)
// 全选本页
const changeAllCheck = (value: any) => {
  list.value.forEach((item: any) => {
    item.check = value
  })
}
// 显示多选操作框
const showCheckBox = ref(false)
// 打开多选操作
const openMulti = () => {
  showCheckBox.value = true
}
// 推送操作(true推送、false取消推送)
const pushAction = async (type: boolean, id?: number) => {
  if (id) {
    const { success } = await GetInfraredCamera_Push({
      idList: [id],
      sftx: type
    })
    if (success) {
      ElMessage({
        type: "success",
        message: type ? "推送成功" : "取消推送成功"
      })
    } else {
      ElMessage({
        type: "error",
        message: type ? "推送失败" : "取消推送失败"
      })
    }
    getListData()
    closeMulti() // 关闭多选操作
    return
  }
  // 多选操作
  ElMessageBox.confirm("是否对这些数据进行" + (type ? "推送" : "取消推送") + "?", "注意", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const filters = list.value.filter((item: any) => item.check)
      const ids = filters.map((item: any) => item.id)
      const { success } = await GetInfraredCamera_Push({
        idList: ids,
        sftx: type
      })
      if (success) {
        ElMessage({
          type: "success",
          message: type ? "推送成功" : "取消推送成功"
        })
      } else {
        ElMessage({
          type: "error",
          message: type ? "推送失败" : "取消推送失败"
        })
      }
      getListData()
      closeMulti() // 关闭多选操作
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "推送取消"
      })
    })
}
// 收藏操作(true推送、false取消推送)
const collectAction = async (type: boolean, id?: number) => {
  if (id) {
    const { success } = await GetInfraredCamera_Collect({
      id: [id],
      sfcollect: type,
      collectuser: user.value.userName
    })
    if (success) {
      ElMessage({
        type: "success",
        message: type ? "收藏成功" : "取消收藏成功"
      })
    } else {
      ElMessage({
        type: "error",
        message: type ? "收藏失败" : "取消收藏失败"
      })
    }
    getListData()
    closeMulti() // 关闭多选操作
    return
  }
  // 多选操作
  ElMessageBox.confirm("是否对这些数据进行" + (type ? "收藏" : "取消收藏") + "?", "注意", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const filters = list.value.filter((item: any) => item.check)
      const ids = filters.map((item: any) => item.id)
      const { success } = await GetInfraredCamera_Collect({
        id: ids,
        sfcollect: type,
        collectuser: user.value.userName
      })
      if (success) {
        ElMessage({
          type: "success",
          message: type ? "收藏成功" : "取消收藏成功"
        })
      } else {
        ElMessage({
          type: "error",
          message: type ? "收藏失败" : "取消收藏失败"
        })
      }
      getListData()
      closeMulti() // 关闭多选操作
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "收藏取消"
      })
    })
}
// 删除操作(true推送、false取消推送)
const deleteAction = async (id?: number) => {
  let ids = []
  if (id) {
    ids = [id]
  } else {
    // 多选操作
    const filters = list.value.filter((item: any) => item.check)
    ids = filters.map((item: any) => item.id)
    if (ids.length === 0) {
      ElMessage({
        type: "info",
        message: "请选择要删除的数据"
      })
      return
    }
  }

  ElMessageBox.confirm("是否对选中的数据进行删除?", "注意", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const { success } = await GetInfraredCamera_Deletexh({
        idlist: ids
      })
      if (success) {
        ElMessage({
          type: "success",
          message: "删除成功"
        })
      } else {
        ElMessage({
          type: "error",
          message: "删除失败"
        })
      }
      getListData()
      closeMulti() // 关闭多选操作
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "删除取消"
      })
    })
}
// 关闭多选操作
const closeMulti = () => {
  // 重置勾选状态
  list.value.forEach((item: any) => {
    item.check = false
  })
  selectAll.value = false
  showCheckBox.value = false
}

// 下载
const showDownloadBox = ref(false)
const exportData = async (type: string) => {
  let data
  // 定义列配置
  // const columns = [
  //   { header: "ID", key: "id", width: 5 },
  //   { header: "设备名称", key: "dename", width: 20 },
  //   { header: "红外相机监测点id", key: "pointid", width: 20 },
  //   { header: "监测点名称", key: "ptname", width: 10 },
  //   { header: "文件名称", key: "filename", width: 20 },
  //   { header: "文件编号", key: "filenum", width: 20 },
  //   { header: "文件拍摄时间", key: "filetime", width: 20 },
  //   { header: "文件上传时间", key: "createdtime", width: 20 },
  //   { header: "文件最后更新时间", key: "lastupdatedtime", width: 20 },
  //   { header: "文件扩展后缀名", key: "fileextension", width: 20 },
  //   { header: "上传类型", key: "uploadtype", width: 10 },
  //   { header: "视频封面图", key: "coverurl", width: 10 },
  //   { header: "文件大小", key: "filesize", width: 20 },
  //   { header: "文件url", key: "fileurl", width: 20 },
  //   { header: "文件fid", key: "filefid", width: 10 },
  //   { header: "经度", key: "lon", width: 20 },
  //   { header: "纬度", key: "lat", width: 20 },
  //   { header: "海拔", key: "althb", width: 20 },
  //   { header: "温度（华氏度）", key: "temperature", width: 20 },
  //   { header: "影像识别分类", key: "classify", width: 20 },
  //   { header: "识别进度", key: "identifyprocess", width: 20 },
  //   { header: "是否识别成功", key: "identifysuccess", width: 20 },
  //   { header: "识别消息", key: "identifymsg", width: 20 },
  //   { header: "视频分辨率", key: "videosize", width: 20 },
  //   { header: "色彩类型", key: "colormode", width: 20 },
  //   { header: "视频录制时长(sec秒)", key: "videolength", width: 20 },
  //   { header: "文件格式", key: "filebmp", width: 20 },
  //   { header: "视频/音频识别后文件url", key: "resultfile", width: 20 },
  //   { header: "视频/音频识别结果数据文件url", key: "resultfiledata", width: 20 },
  //   { header: "纠正物种名", key: "correctname", width: 20 },
  //   { header: "操作人名", key: "username", width: 20 },
  //   { header: "识别类型", key: "idtype", width: 20 },
  //   { header: "ai识别结果分类", key: "aitype", width: 20 },
  //   { header: "识别物种列表", key: "spnamelist", width: 20 },
  //   { header: "识别物种分类列表", key: "detnamelist", width: 20 },
  //   { header: "是否精彩影像", key: "wonderful", width: 20 },
  //   { header: "是否推送", key: "sftx", width: 20 }
  // ]
  // if (type === "本页") {
  //   const { response } = await GetInfraredCamera_FindFile({
  //     ...params.value,
  //     page: page.value,
  //     intPageSize: intPageSize.value
  //   })
  //   data = response.data
  // } else {
  //   const { response } = await GetInfraredCamera_FindFile({
  //     ...params.value,
  //     page: 1,
  //     intPageSize: 10000000
  //   })
  //   data = response.data
  // }
  // data = data.map((item: any) => {
  //   item.fileurl = "http://39.145.39.46:9001" + item.fileurl
  //   item.resultfile = "http://39.145.39.46:9001" + item.resultfile
  //   item.coverurl = "http://39.145.39.46:9001" + item.coverurl
  //   return item
  // })
  // // 导出Excel
  // try {
  //   await ExcelExporter.exportExcel({
  //     fileName: `红外相机抓拍导出-${dayjs().format("YYYY-MM-DD HH:mm:ss")}.xlsx`,
  //     sheetName: "路线表",
  //     columns,
  //     data,
  //     imageQuality: 0.8,
  //     maxImageSize: 100
  //   })
  // } catch (error) {
  //   console.error("导出失败:", error)
  // }
  loading.value = true
  try {
    const { response } = await GetInfraredCamera_FindFile({
      ...params.value,
      page: type === "本页" ? page.value : 1,
      intPageSize: type === "本页" ? intPageSize.value : 10000000
    })
    data = response.data.map((item: any) => item.id)
    const blob = await InfraredCameraDownloadFilesAsZip({ idList: data })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `红外相机抓拍_${dayjs().format("YYYY-MM-DD HH:mm:ss")}.zip`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
  } catch (error) {
  } finally {
    loading.value = false
  }
}

const zxzpInfo = ref<any>({})
const showVideoPalyer = ref(false)
const view = (item: any) => {
  if (item.filebmp === "图片") {
    const urls = ["/redCareamStaticUrl/" + (item.resultfile ? item.resultfile : item.fileurl)]
    u.showPreviewImg(0, urls)
  } else if (item.filebmp === "视频") {
    zxzpInfo.value = item
    showVideoPalyer.value = true
  } else {
    ElMessage.warning("暂无内容预览")
  }
}

const hotMapDialog = ref(false)
/** 物种热力图接口参数，与当前列表筛选（时间、相机、物种）对齐 */
const heatMapApiParams = computed(() => ({
  // startTime: params.value.beginTime ?? "",
  // endTime: params.value.endTime ?? "",
  // hwxjname: params.value.hwxjname ?? "",
  dwname: params.value.dwname ?? ""
}))
const openHotMapDialog = () => {
  hotMapDialog.value = true
}
onMounted(() => {
  Promise.all([getHwxjList()]).then(() => {
    if (props.name) {
      changeHwxj(props.name)
    } else {
      getListData()
    }
    // 获得识别物种数据
    getSpnameList()
  })
})
</script>
<template>
  <div
    class="all-capture"
    :style="{ width: width + 'px', height: height + 'px' }"
  >
    <div class="title-box">
      <img
        :src="$fun.getImg('researchManagement/icon14.png')"
        alt=""
      />全部抓拍
    </div>
    <div class="mian panzoom-exclude">
      <div class="left-con">
        <div class="left-con-title">
          <h3>识别物种统计</h3>
          <span>{{ spnameListTotal }}条</span>
        </div>
        <div class="input-box-warp">
          <el-input
            class="input-box"
            v-model="leftParams.name"
            placeholder="物种查询"
            :suffix-icon="Search"
            clearable
            @change="changeParams"
          />
          <el-input
            class="input-box"
            v-model="leftParams.hwxjname"
            placeholder="相机查询"
            :suffix-icon="Search"
            clearable
            @change="changeParams"
          />
        </div>

        <el-scrollbar class="warp-scrollbar">
          <div class="warp">
            <div
              v-for="item of spnameList"
              :key="item.id"
              class="item"
              :class="{ active: item.id === currentItem.id }"
              @click="handleItemClick(item)"
            >
              <span>物种名称：{{ item.spname }}</span>
              <span>抓拍次数：{{ item.snapcount }}</span>
              <span>首次抓拍卡口：{{ item.firstsnapmonitor }}</span>
              <span>首次抓拍时间：{{ item.firstsnaptime }}</span>
              <span>最近抓拍卡口：{{ item.latelysnapmonitor }}</span>
              <span>最近抓拍时间：{{ item.latelysnaptime }}</span>
            </div>
          </div>
        </el-scrollbar>
        <div class="footer-box">
          <el-pagination
            v-model:current-page="page"
            v-model:page-size="intPageSize"
            :background="false"
            size="small"
            :pager-count="5"
            layout="prev, next"
            :total="spnameListTotal"
            @size-change="handleSpnameSizeChange"
            @current-change="handleSpnameCurrentChange"
          />
        </div>
      </div>
      <div
        v-loading="loading"
        element-loading-text="请稍候..."
        :element-loading-spinner="svg"
        element-loading-svg-view-box="-10, -10, 50, 50"
        element-loading-background="rgba(0, 0, 0, 0.7)"
        class="main-section"
      >
        <div
          v-if="info"
          class="info-box"
        >
          <div class="info-box-title">相机基本信息</div>
          <div class="info-box-content">
            <div class="info-box-content-item">
              <div class="info-box-content-item-title">相机名称：</div>
              <div class="info-box-content-item-value">{{ info.name }}</div>
            </div>
            <div class="info-box-content-item">
              <div class="info-box-content-item-title">相机编号：</div>
              <div class="info-box-content-item-value">{{ info.code }}</div>
            </div>
            <div class="info-box-content-item">
              <div class="info-box-content-item-title">相机电量：</div>
              <div class="info-box-content-item-value">{{ info.battery }}%</div>
            </div>
            <div class="info-box-content-item">
              <div class="info-box-content-item-title">设备状态：</div>
              <div class="info-box-content-item-value">{{ info.dlstate }}</div>
            </div>
            <div class="info-box-content-item">
              <div class="info-box-content-item-title">经度：</div>
              <div class="info-box-content-item-value">{{ info.lon }}</div>
            </div>
            <div class="info-box-content-item">
              <div class="info-box-content-item-title">纬度：</div>
              <div class="info-box-content-item-value">{{ info.lat }}</div>
            </div>
          </div>
          <el-divider />
        </div>
        <div class="search-box">
          <el-form
            :model="params"
            label-width="80px"
            inline
          >
            <el-form-item label="物种名称">
              <el-input
                v-model="params.dwname"
                placeholder="请输入物种名称"
                :suffix-icon="Search"
                clearable
            /></el-form-item>
            <el-form-item label="所属相机">
              <el-select
                v-model="params.hwxjname"
                placeholder="请选择所属相机"
                :teleported="false"
                clearable
                filterable
                popper-class="custom-select-popper"
                @change="changeHwxj"
              >
                <el-option
                  v-for="item in hwxjList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.name"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="是否收藏">
              <el-select
                v-model="params.sfcollect"
                placeholder="请选择是否收藏"
                :teleported="false"
                clearable
                filterable
                popper-class="custom-select-popper"
              >
                <el-option
                  label="是"
                  :value="true"
                />
                <el-option
                  label="否"
                  :value="false"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="是否推送">
              <el-select
                v-model="params.sftx"
                placeholder="请选择是否推送"
                :teleported="false"
                clearable
                filterable
                popper-class="custom-select-popper"
              >
                <el-option
                  label="是"
                  :value="true"
                />
                <el-option
                  label="否"
                  :value="false"
                />
              </el-select>
            </el-form-item>
            <el-form-item
              label="抓拍时间"
              class="date-box"
            >
              <el-date-picker
                v-model="date"
                type="datetimerange"
                range-separator="-"
                value-format="YYYY-MM-DD HH:mm:ss"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
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
                  v-if="!showCheckBox"
                  class="btn btn2"
                  @click="openMulti"
                >
                  多选操作
                </div>
                <div
                  v-if="showCheckBox"
                  class="btn btn4"
                  @click="pushAction(true)"
                >
                  推送
                </div>
                <div
                  v-if="showCheckBox"
                  class="btn btn4"
                  @click="pushAction(false)"
                >
                  取消推送
                </div>
                <div
                  v-if="showCheckBox"
                  class="btn btn5"
                  @click="collectAction(true)"
                >
                  收藏
                </div>
                <div
                  v-if="showCheckBox"
                  class="btn btn5"
                  @click="collectAction(false)"
                >
                  取消收藏
                </div>
                <div
                  v-if="showCheckBox"
                  class="btn btn6"
                  @click="deleteAction()"
                >
                  批量删除
                </div>
                <div
                  v-if="showCheckBox"
                  class="btn btn2"
                  @click="closeMulti"
                >
                  取消操作
                </div>
              </div>
            </el-form-item>
            <el-form-item class="search-btns">
              <div class="btns">
                <div
                  class="btn btn2"
                  @click="showDownloadBox = !showDownloadBox"
                >
                  {{ showDownloadBox ? "关闭下载" : "下载" }}
                </div>
                <div
                  v-if="showDownloadBox"
                  class="btn btn3"
                  @click="exportData('本页')"
                >
                  下载本页
                </div>
              </div>
            </el-form-item>
            <el-form-item
              v-if="!params.hwxjname"
              class="search-btns"
            >
              <div class="btns">
                <div
                  class="btn btn3"
                  @click="openHotMapDialog"
                >
                  物种热力
                </div>
              </div>
            </el-form-item>
          </el-form>
        </div>
        <div class="contain-box">
          <el-row v-show="showCheckBox">
            <el-checkbox
              v-model="selectAll"
              label="全选"
              @change="changeAllCheck"
            />
          </el-row>
          <el-scrollbar
            v-if="list.length > 0"
            :class="{ 'show-check': showCheckBox }"
          >
            <div
              v-for="item in list"
              class="item"
              @click="view(item)"
            >
              <div class="img-box">
                <el-image
                  :src="
                    item.filebmp === '图片'
                      ? '/redCareamStaticUrl/' + (item.resultfile ? item.resultfile : item.fileurl)
                      : '/redCareamStaticUrl/' + item.coverurl
                  "
                  alt=""
                  fit="fill"
                >
                  <template #placeholder>
                    <el-skeleton
                      class="image-placeholder"
                      style="width: 100%; height: 100%"
                      animated
                    >
                      <template #template>
                        <el-skeleton-item
                          variant="image"
                          style="width: 100%; height: 100%"
                        />
                      </template>
                    </el-skeleton>
                  </template>
                  <template #error>
                    <div class="image-slot">
                      <i-ep-picture />
                      <span style="margin-left: 3px">暂无预览</span>
                    </div>
                  </template></el-image
                >
              </div>
              <div class="img-box-tip">{{ item.filebmp }}</div>
              <div
                class="check-box"
                @click.stop
              >
                <el-checkbox
                  v-show="showCheckBox"
                  v-model="item.check"
                />
                <div
                  class="imgs-box"
                  v-show="!showCheckBox"
                >
                  <img
                    class="collect-img"
                    :src="
                      item.sftx ? $fun.getImg('electronicFence/push.svg') : $fun.getImg('electronicFence/no-push.svg')
                    "
                    alt=""
                    @click.stop="pushAction(!item.sftx, item.id)"
                  />
                  <img
                    class="collect-img"
                    :src="
                      item.sfcollect
                        ? $fun.getImg('electronicFence/collect.svg')
                        : $fun.getImg('electronicFence/no-collect.svg')
                    "
                    alt=""
                    @click.stop="collectAction(!item.sfcollect, item.id)"
                  />
                  <img
                    class="collect-img"
                    :src="$fun.getImg('electronicFence/delete.svg')"
                    alt=""
                    @click.stop="deleteAction(item.id)"
                  />
                </div>
              </div>
              <div class="box">
                <div>
                  <span>{{ item.dename }}</span>
                  <span>{{ item.createdtime }}</span>
                </div>
                <div>{{ item.spnamelist || item.detnamelist }}</div>
              </div>
            </div>
          </el-scrollbar>
          <EmptyData v-else />
        </div>
        <div class="footer-box">
          <el-pagination
            v-model:current-page="page"
            v-model:page-size="intPageSize"
            :page-sizes="[12, 20, 30, 40]"
            :background="false"
            :pager-count="5"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
    <teleport
      defer
      to="#fireWarning"
    >
      <Modal
        v-model:show="showVideoPalyer"
        disable-zoom
        :close-on-click-modal="false"
      >
        <template v-slot:container>
          <div
            class="panzoom-exclude"
            style="width: 800px"
          >
            <VideoPlayer
              :src="'/redCareamStaticUrl/' + (zxzpInfo.resultfile ? zxzpInfo.resultfile : zxzpInfo.fileurl)"
            />
          </div>
        </template>
      </Modal>
    </teleport>
    <teleport
      defer
      to="#fireWarning"
    >
      <Modal
        v-model:show="hotMapDialog"
        disable-zoom
        :showShade="false"
        :close-on-click-modal="false"
      >
        <template v-slot:container>
          <InfraredSpeciesHeatMap :api-params="heatMapApiParams" />
        </template>
      </Modal>
    </teleport>
  </div>
</template>

<style lang="scss" scoped>
.all-capture {
  position: relative;
  width: 62.5vw;
  height: 800px;
  background: url("@/assets/images/dialog-bg.png") no-repeat center center / 100% 100%;
  display: flex;
  flex-direction: column;
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
  .mian {
    position: relative;
    flex: 1;
    display: flex;
    gap: 0.5208vw;
    padding: 0 24px;
    overflow-y: hidden;
    .left-con {
      display: flex;
      flex-direction: column;
      gap: 0.2604vw;
      width: 25%;
      height: 95%;
      background: #02142a;
      border-radius: 0.3125vw;
      box-shadow: 0 0 1.0417vw 0.1042vw rgba(255, 255, 255, 0.3) inset;
      padding: 0.5208vw;
      .left-con-title {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1.0417vw;
        color: #999;
        h3 {
          font-size: 0.9375vw;
        }
        span {
          font-size: 0.8333vw;
        }
      }
      :deep(.input-box-warp) {
        display: flex;
        gap: 0.3125vw;
        .input-box {
          height: 32px;
          .el-input__wrapper {
            background-color: #0c284d;
            border: 1px solid #304868 !important;
            box-shadow: none;
            border-radius: 0;
          }
        }
      }
      .warp-scrollbar {
        flex: 1;
        overflow: hidden;
        .warp {
          display: flex;
          flex-direction: column;
          gap: 0.5208vw;
          .item {
            display: flex;
            flex-direction: column;
            gap: 0.5208vw;
            padding: 0.5208vw;
            background-color: #152c45;
            border: 2px solid #1a3a6a;
            box-shadow: 0 0 0.5208vw 0.1042vw rgba(26, 58, 106, 0.5);
            color: #aaa;
            cursor: pointer;
          }
          .item.active {
            border-color: #27ae60;
          }
        }
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
    .main-section {
      position: relative;
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow-y: hidden;
      .info-box {
        display: flex;
        flex-direction: column;
        .info-box-title {
          font-size: 0.9375vw;
          color: #fff;
          margin-bottom: 20px;
        }
        .info-box-content {
          display: flex;
          gap: 30px;
          padding-left: 30px;
          font-size: 0.8333vw;
          .info-box-content-item {
            display: flex;
            align-items: center;
          }
        }
      }
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
              width: 360px;
            }
          }
          .el-form-item__content {
            border: 1px solid #304868;
            border-radius: 2px;
            min-width: 160px;
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
            // width: 68px;
            height: 32px;
            padding: 4px 20px;
            cursor: pointer;
          }
          .btn1 {
            background: #19ba6c;
          }
          .btn2 {
            // width: 100px;
            background: linear-gradient(to right, #5a8ab6, #375577);
          }
          .btn3 {
            // width: 68px;
            background: linear-gradient(to right, #6e34c6, #d5b885);
          }
          .btn4 {
            // width: 100px;
            background: linear-gradient(to right, #53c283, #1b5369);
          }
          .btn5 {
            // width: 100px;
            background: linear-gradient(to right, #20bed6, #572e80);
          }
          .btn6 {
            // width: 100px;
            background: #e74c3c;
          }
        }
      }
      :deep(.contain-box) {
        flex: 1;
        overflow: hidden;
        .el-checkbox {
          .el-checkbox__inner {
            background-color: #253c5a;
            border: none;
          }
          .el-checkbox__input.is-checked .el-checkbox__inner {
            background-color: #15b392;
          }
          .is-checked + .el-checkbox__label {
            color: #15b392;
          }
        }
        .el-scrollbar {
          height: 100%;
          &.show-check {
            height: calc(100% - 32px);
          }
          .el-scrollbar__view {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            .item {
              position: relative;
              width: calc(calc(100% - 30px) / 4);
              height: 180px;
              border: 1px solid #057ec7;
              border-radius: 2px;
              display: flex;
              align-items: center;
              background-color: #092239;
              font-size: 0.625vw;
              color: #fff;
              .img-box {
                width: 100%;
                height: 100%;
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
                    font-size: 0.9375vw;
                  }
                }
              }
              .img-box-tip {
                position: absolute;
                top: 8px;
                left: 8px;
                font-size: 0.7292vw;
                padding: 3px 0.3125vw;
                background-color: rgba(0, 0, 0, 0.7);
              }
              .check-box {
                position: absolute;
                top: 8px;
                right: 8px;
                .el-checkbox {
                  height: initial;
                  .el-checkbox__label {
                    font-size: 0.7292vw;
                  }
                }
              }
              .box {
                display: flex;
                flex-direction: column;
                gap: 2px;
                padding: 4px 0.3125vw;
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                background-color: rgba(0, 0, 0, 0.4);
                > div {
                  font-size: 0.625vw;
                  color: #fff;
                  &:first-child {
                    display: flex;
                    justify-content: space-between;
                  }
                }
              }
              .check-box {
                position: absolute;
                top: 8px;
                right: 8px;
                z-index: 99;
                .el-checkbox {
                  height: initial;
                  .el-checkbox__label {
                    font-size: 0.7292vw;
                  }
                  .el-checkbox__inner {
                    // background-color: #3cab93;
                  }
                }
                .imgs-box {
                  display: flex;
                  gap: 5px;
                  .collect-img {
                    width: 1.4583vw;
                    background-color: rgba(0, 0, 0, 0.7);
                    padding: 0.2604vw;
                    border-radius: 0.3125vw;
                    cursor: pointer;
                  }
                }
              }
            }
          }
        }
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
  }
}
</style>
