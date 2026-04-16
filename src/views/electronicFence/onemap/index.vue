<script lang="ts" setup>
import {
  GetElectronicfenceStatistics_EquipmentList,
  GetElectronicfenceStatistics_Fxgk,
  GetElectronicfenceStatistics_Fxqx,
  GetElectronicfenceStatistics_TopSpecies,
  GetElectronicfenceWarningByPage
} from "@/api"
import { Search } from "@element-plus/icons-vue"
import dayjs from "dayjs"
import PanelData from "./PanelData.vue"
// @ts-expect-error  说明原因
import { vue3ScrollSeamless } from "vue3-scroll-seamless"
const proxy = getCurrentInstance()!.proxy as any
const { showCSB } = storeToRefs(useConfigStore())
const changePanelTitleType = (type: string) => {
  if (type.indexOf("分析概括") > -1) {
    getFxgkCount(type.split("-")[1])
  }
  if (type.indexOf("分析趋势") > -1) {
    getFxqsData(type.split("-")[1])
  }
  if (type === "最新物种记录-更多") {
    initTab.value = "AI分析记录"
    showDataPanel.value = true
  }
  if (type === "预警概况-更多") {
    initTab.value = "预警记录"
    showDataPanel.value = true
  }
}
const popup = ref<any>(null)
const modular = ref("电子围栏一张图")
const {
  closePopup,
  popupInfo,
  popupFormatType,
  map,
  vectorFeatures,
  animateFeature,
  locationMap,
  addLayerManageData,
  removeLayerManageData
} = useOlMap(popup, {
  zoom: 12.5381,
  center: [116.10550826192058, 31.035296306176544],
  modular: modular.value,
  openOverlay: false,
  overlayOffset: [0, -70],
  overlayPositioning: "bottom-center",
  vectorLayerDeclutter: false
})

const addLayerData = (data: any, opt: any) => {
  if (opt.mc.indexOf("电子围栏") > -1) {
    data.forEach((item: any) => {
      item.name = item.name + `(${item.eqtypename.slice(0, 3)})`
    })
  }
  addLayerManageData(data, opt)
}

// 获得分析概况
const fxgkInfo = ref<any>({})
const getFxgkCount = async (timeType?: string) => {
  const { response } = await GetElectronicfenceStatistics_Fxgk({
    timeType: timeType || "本月"
  })
  fxgkInfo.value = {
    lsbrdw: response.find((item: any) => item.name === "陆生哺乳动物")?.value,
    rl: response.find((item: any) => item.name === "人")?.value,
    cl: response.find((item: any) => item.name === "车")?.value,
    nl: response.find((item: any) => item.name === "鸟类")?.value
  }
}

// 获得分析趋势数据
const fxqsData = ref<any>(null)
const getFxqsData = async (timeType?: string) => {
  const { response } = await GetElectronicfenceStatistics_Fxqx({
    timeType: timeType || "近半年"
  })
  if (response?.data?.length > 0) {
    fxqsData.value = {
      dw: "次",
      xAxis: response.xAxis,
      data: response.data
    }
  } else {
    fxqsData.value = null
  }
}

// 最新物种记录
const zxwzlist = ref<any[]>([])
const getZxwzList = async () => {
  // list.value = [{}, {}]
  const { response } = await GetElectronicfenceStatistics_TopSpecies()
  zxwzlist.value = response
}

// 获得设备列表数据
const sblbList = ref<any>([])
const nameParam = ref<string>("")
const getSblbList = async () => {
  const { response } = await GetElectronicfenceStatistics_EquipmentList({
    name: nameParam.value
  })
  sblbList.value = response
}

// 选择设备,动画
const selectItem = (obj: any) => {
  const id = obj.equipmentid || obj.equipmentId
  const feature = vectorFeatures.value.find((item: any) => item.get("equipmentid") === id)
  if (feature) {
    animateFeature(feature)
  } else {
    ElMessage.info("地图上没找到该设备")
  }
}

// 当前时间
const currentTime = dayjs().format("YYYY-MM-DD HH:mm:ss")
// 获得预警概况数据
const yjgkData = ref<any>(null)
const getYjgkData = async () => {
  const { response } = await GetElectronicfenceWarningByPage({
    page: 1,
    intPageSize: 15
  })
  yjgkData.value = response.data
}
const sortItems = ref<any>([
  { label: "活跃度", value: "活跃度", direction: "asc" },
  { label: "识别总数", value: "识别总数", direction: "asc" },
  { label: "人类数量", value: "人类数量", direction: "asc" },
  { label: "车辆数量", value: "车辆数量", direction: "asc" },
  { label: "陆生哺乳动物", value: "陆生哺乳动物", direction: "asc" },
  { label: "鸟类", value: "鸟类", direction: "asc" }
])
const handleSortChange = (item: any) => {
  // console.log(item)
  let dynamic = ""
  switch (item.label) {
    case "活跃度":
      dynamic = "latelySnapTime"
      break
    case "识别总数":
      dynamic = "identifyCount"
      break
    case "人类数量":
      dynamic = "humanCount"
      break
    case "车辆数量":
      dynamic = "carCount"
      break
    case "陆生哺乳动物":
      dynamic = "animalCount"
      break
    case "鸟类":
      dynamic = "birdCount"
      break
  }
  if (dynamic !== "latelySnapTime") {
    if (item.direction === "asc") {
      sblbList.value.sort((a: any, b: any) => a[dynamic] - b[dynamic])
    } else {
      sblbList.value.sort((a: any, b: any) => b[dynamic] - a[dynamic])
    }
  } else {
    if (item.direction === "asc") {
      sblbList.value.sort((a: any, b: any) => dayjs(a[dynamic]).unix() - dayjs(b[dynamic]).unix())
    } else {
      sblbList.value.sort((a: any, b: any) => dayjs(b[dynamic]).unix() - dayjs(a[dynamic]).unix())
    }
  }
}

const showDataPanel = ref(false)
// 关闭数据面板
const closeDataPanel = () => {
  initTabParams.value = null
}
const initTab = ref<any>(null)
const initTabParams = ref<any>(null)
// 点击地图弹框中点击查看历史AI分析记录
const handleHistoryData = (data: any) => {
  initTab.value = "AI分析记录"
  initTabParams.value = data
  showDataPanel.value = true
}
// 查看图片
const view = (event: any) => {
  // 判断是否为img
  if (event.target.tagName === "IMG") {
    const item = event.target.getAttribute("data-item")
    if (item) {
      const info = JSON.parse(item)
      if (info.filetype === "图片") {
        if (info.fileurl) {
          const url =
            info.fileurl.indexOf("http") !== -1
              ? info.fileurl.replace(";", "")
              : "/statisUrl/" + info.fileurl.replace(";", "")
          u.showPreviewImg(0, [url])
        } else {
          ElMessage.warning("暂无预览图片")
        }
      }
    }
  }
}

const { setVariable } = useCssVariables()
onMounted(() => {
  setVariable("maptool-sidebar-right", "calc(21.875vw + 40px)") // 设置地图工具栏距右侧距离
  setVariable("maptool-sidebar-bottom", "calc(20px)") // 设置地图工具栏距底部距离
  proxy.$mitt.on("changePanelTitleType", changePanelTitleType)
  getFxgkCount() // 获得分析概况数据
  getFxqsData() // 获得分析趋势数据
  getZxwzList() // 获得最新物种记录
  getSblbList() // 获得设备列表数据
  getYjgkData() // 获得预警概况数据
})
onBeforeUnmount(() => {
  proxy.$mitt.off("changePanelTitleType", changePanelTitleType)
})
</script>
<template>
  <div class="electronicFence-onemap">
    <div class="section-bar">
      <MapFeatureSearch
        :features="vectorFeatures"
        @location="locationMap"
      />
      <MapLayerManage
        :modular="modular"
        :init-checked-keys="[35]"
        @addLayer="addLayerData"
        @removeLayer="removeLayerManageData"
      />
    </div>
    <div class="left">
      <transition-group
        enter-active-class="animate__animated animate__bounceInLeft"
        leave-active-class="animate__animated animate__fadeOut"
        appear
        appear-active-class="animate__animated animate__bounceInLeft"
      >
        <div
          v-show="showCSB"
          class="section1"
          key="section1"
        >
          <BasePanel
            title="分析概括"
            init-type="本月"
            :types="['本月', '本年', '累计']"
          >
            <template #contain>
              <div class="contain">
                <div class="item">
                  <div class="label">陆生哺乳动物识别</div>
                  <div class="value">{{ fxgkInfo.lsbrdw }}个</div>
                </div>
                <div class="item">
                  <div class="label">人类识别</div>
                  <div class="value">{{ fxgkInfo.rl }}个</div>
                </div>
                <div class="item">
                  <div class="label">鸟类识别</div>
                  <div class="value">{{ fxgkInfo.nl }}个</div>
                </div>
                <div class="item">
                  <div class="label">车辆识别</div>
                  <div class="value">{{ fxgkInfo.cl }}个</div>
                </div>
              </div>
            </template>
          </BasePanel>
        </div>
        <div
          v-show="showCSB"
          class="section2"
          key="section2"
        >
          <BasePanel
            title="分析趋势"
            init-type="近半年"
            :types="['近半年', '近一年', '累计']"
          >
            <template #contain>
              <div class="contain">
                <LineChartPanel
                  path="path://M 0 -8 L 7 -4 L 7 4 L 0 8 L -7 4 L -7 -4 Z M 0 -2 A 2 2 0 1 1 0 2 A 2 2 0 1 1 0 -2 Z"
                  :symbol-size="14"
                  :node-shadow="true"
                  :open-effect="true"
                  :data="fxqsData"
                  :colors="['#246eff', '#ffcb4a', '#2eff54', '#fb463c']"
                />
              </div>
            </template>
          </BasePanel>
        </div>
        <div
          v-show="showCSB"
          class="section3"
          key="section3"
        >
          <BasePanel
            title="最新物种记录"
            :btns="['更多']"
          >
            <template #contain>
              <div
                class="contain"
                @click="view"
              >
                <div class="thead row">
                  <div>设备名称</div>
                  <div>事件识别</div>
                  <div>时间</div>
                  <div>图片/视频</div>
                </div>
                <vue3ScrollSeamless
                  class="scroll-wrap"
                  :classOptions="{ singleHeight: 38, waitTime: 5000 }"
                  :dataList="zxwzlist"
                >
                  <ul class="ui-wrap-zxzp">
                    <li
                      class="li-item row"
                      v-for="(item, i) of zxwzlist"
                      :key="i"
                    >
                      <div>
                        <el-text truncated>{{ item.name }}</el-text>
                      </div>
                      <div>
                        <el-text truncated>{{ item.eventname || "无名称" }}</el-text>
                      </div>
                      <div>
                        <el-text truncated>{{ item.identifytime }}</el-text>
                      </div>
                      <div class="img-box">
                        <img
                          v-show="item.fileurl"
                          :src="
                            item.fileurl?.indexOf('http') !== -1
                              ? item.fileurl?.replace(';', '')
                              : '/statisUrl/' + item.fileurl?.replace(';', '')
                          "
                          alt=""
                          class="img-item"
                          :data-item="JSON.stringify(item)"
                        />
                        <div
                          v-if="item.filetype === '图片' && item.fileurl"
                          class="png-tip"
                        ></div>
                        <div
                          v-else-if="item.filetype === '视频' && item.fileurl"
                          class="video-tip"
                        ></div>
                      </div>
                    </li>
                  </ul>
                </vue3ScrollSeamless>
              </div>
            </template>
          </BasePanel>
        </div>
      </transition-group>
    </div>
    <div class="right">
      <transition-group
        enter-active-class="animate__animated animate__bounceInRight"
        leave-active-class="animate__animated animate__fadeOut"
        appear
        appear-active-class="animate__animated animate__bounceInRight"
      >
        <div
          v-show="showCSB"
          class="section4"
          key="section4"
        >
          <BasePanel title="设备列表">
            <template #contain>
              <div class="contain">
                <el-input
                  class="input-box"
                  v-model="nameParam"
                  placeholder="请输入设备名称"
                  :suffix-icon="Search"
                  clearable
                  @change="getSblbList"
                />
                <SortControls
                  :sort-items="sortItems"
                  @sort-change="handleSortChange"
                />
                <el-scrollbar class="warp-scrollbar">
                  <div class="warp">
                    <div
                      v-for="item of sblbList"
                      :key="item.id"
                      class="item"
                      @click="selectItem(item)"
                    >
                      <div class="item-content1">
                        <div class="name">{{ item.name }}</div>
                        <div class="value">识别总数：{{ item.identifyCount }}次</div>
                      </div>
                      <div class="item-content2">
                        <div class="item-content2-box">
                          <img
                            :src="$fun.getImg('electronicFence/icon1.png')"
                            alt=""
                          />
                          <span>人类：{{ item.humanCount }}次</span>
                        </div>
                        <div class="item-content2-box">
                          <img
                            :src="$fun.getImg('electronicFence/icon2.png')"
                            alt=""
                          />
                          <span>车辆：{{ item.carCount }}次</span>
                        </div>
                        <div class="item-content2-box">
                          <img
                            :src="$fun.getImg('electronicFence/icon3.png')"
                            alt=""
                          />
                          <span>陆生哺乳动物：{{ item.animalCount }}次</span>
                        </div>
                        <div class="item-content2-box">
                          <img
                            :src="$fun.getImg('electronicFence/icon4.png')"
                            alt=""
                          />
                          <span>鸟类：{{ item.birdCount }}次</span>
                        </div>
                      </div>
                      <div class="item-content3">最近通信时间：{{ item.latelySnapTime }}</div>
                    </div>
                  </div>
                </el-scrollbar>
              </div>
            </template>
          </BasePanel>
        </div>
        <div
          v-show="showCSB"
          class="section5"
          key="section5"
        >
          <BasePanel
            title="预警概况"
            :btns="['更多']"
          >
            <template #contain>
              <div class="contain">
                <div class="time">更新时间：{{ currentTime }}</div>

                <div class="wrap">
                  <el-scrollbar>
                    <div
                      v-for="item of yjgkData"
                      :key="item.id"
                      class="item"
                      @click="selectItem(item)"
                    >
                      <div class="title">
                        <div class="tip">{{ item.status }}</div>
                        <div class="date">{{ item.warntime }}</div>
                      </div>
                      <div class="content">
                        <div class="content-item">
                          <div>预警设备</div>
                          <div>{{ item.name || "无名称" }}</div>
                        </div>
                        <div class="content-item">
                          <div>预警描述</div>
                          <div>{{ item.describe || "无描述" }}</div>
                        </div>
                        <div
                          v-if="item.warntype"
                          class="type-tip"
                        >
                          {{ item.warntype }}
                        </div>
                      </div>
                    </div></el-scrollbar
                  >
                </div>
              </div>
            </template>
          </BasePanel>
        </div>
      </transition-group>
    </div>
    <Modal
      id="dataPanel"
      v-model:show="showDataPanel"
      disable-zoom
      :close-on-click-modal="false"
      @close="closeDataPanel"
    >
      <template v-slot:container>
        <PanelData
          :tab="initTab"
          :tab-params="initTabParams"
        />
      </template>
    </Modal>
    <div
      class="map-box"
      id="map"
    >
      <MapPopup
        ref="popup"
        :type="1"
        :format-name="popupFormatType"
        :info="popupInfo"
        @close="closePopup"
        @handleHistoryDataClick="handleHistoryData"
      />
      <MapTool
        v-if="map"
        :map="map"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.electronicFence-onemap {
  position: relative;
  height: 100%;
  color: #fff;
  .map-box {
    position: relative;
    width: 100%;
    height: 100%;
  }
  .section-bar {
    position: absolute;
    top: 20px;
    // right: calc(21.875vw + 40px);
    right: var(--maptool-sidebar-right);
    display: flex;
    gap: 15px;
    height: 32px;
    z-index: 1;
    transition: all 0.3s ease-in-out;
  }
  .left {
    display: flex;
    flex-direction: column;
    gap: 20px;
    position: absolute;
    top: 20px;
    bottom: 20px;
    left: 20px;
    z-index: 1;
    overflow: hidden;
    > div {
      width: 21.875vw;
    }
  }
  .right {
    display: flex;
    flex-direction: column;
    gap: 20px;
    position: absolute;
    top: 20px;
    bottom: 20px;
    right: 20px;
    z-index: 1;
    overflow: hidden;
    > div {
      width: 21.875vw;
    }
  }
  .section1 {
    flex: 1;
    .contain {
      position: relative;
      height: 100%;
      background: url("@/assets/images/electronicFence/bg1.png") no-repeat center center / 80% 80%;
      .item {
        position: absolute;
        display: flex;
        flex-direction: column;
        .label {
          font-size: 0.7292vw;
          color: #fff;
          width: 3.125vw;
        }
        .value {
          font-size: 0.9375vw;
          color: #00e3ff;
        }
      }
      .item:nth-child(1) {
        top: 30px;
        left: 40px;
      }
      .item:nth-child(2) {
        top: 30px;
        right: 40px;
      }
      .item:nth-child(3) {
        bottom: 30px;
        left: 40px;
      }
      .item:nth-child(4) {
        bottom: 30px;
        right: 40px;
      }
    }
  }
  .section2 {
    flex: 1;
    .contain {
      display: flex;
      height: 100%;
    }
  }
  .section3 {
    flex: 1;
    overflow: hidden;
    :deep(.contain) {
      display: flex;
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 0.5208vw;
      .row {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 38px;
        background: url("@/assets/images/researchManagement/zxzp-bg.png") no-repeat center bottom / 100% 14px;
        padding-bottom: 6px;
        gap: 5px;
        > div {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;

          &:nth-child(1) {
            width: 20%;
          }
          &:nth-child(2) {
            width: 20%;
          }
          &:nth-child(3) {
            width: 30%;
          }
          &:nth-child(4) {
            width: 30%;
            img {
              object-fit: cover;
              width: 90%;
              height: 80%;
            }
          }
          .png-tip {
            width: 0.4167vw !important;
            height: 0.4167vw !important;
            border-radius: 50%;
            background: #2cf663;
          }
          .video-tip {
            width: 0.4167vw !important;
            height: 0.4167vw !important;
            border-radius: 50%;
            background: #ff2855;
          }
        }
        .img-box {
          position: relative;
          .png-tip,
          .video-tip {
            position: absolute;
            top: 0.1042vw;
            right: 0.2604vw;
          }
        }
      }
      .thead {
        display: flex;
        align-items: center;
        color: #38cafe;
        font-size: 0.7292vw;
        .png-tip,
        .video-tip {
          margin: 0 0.1563vw;
        }
      }
      .scroll-wrap {
        flex: 1;
        overflow: hidden;
        .ui-wrap-zxzp {
          height: 100%;
          display: flex;
          flex-direction: column;
          background-color: #192f49;
          margin: 0;
          padding: 0;
          font-size: 0.625vw;
          .el-text {
            font-size: 0.625vw;
            color: #fff;
          }
        }
      }
    }
  }
  .section4 {
    flex: 1;
    overflow: hidden;
    .contain {
      display: flex;
      flex-direction: column;
      height: 100%;
      gap: 0.5208vw;
      :deep(.input-box) {
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
          border: 2px solid #1a3a6a;
          box-shadow: 0 0 0.5208vw 0.1042vw rgba(26, 58, 106, 0.5);
          cursor: pointer;
          .item-content1 {
            display: flex;
            align-items: center;
            .name {
              width: 7.2917vw;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              font-size: 0.7292vw;
              color: #ddf3fc;
            }
            .value {
              margin-left: 0.2604vw;
              border: 1px solid #038af9;
              font-size: 0.625vw;
              color: #038af9;
              // padding: 0 0.2083vw;
            }
          }
          .item-content2 {
            display: flex;
            justify-content: space-between;
            align-items: center;
            .item-content2-box {
              display: flex;
              align-items: center;
              gap: 0.2604vw;
              img {
                width: 0.7292vw;
                height: 0.7292vw;
              }
              span {
                font-size: 0.625vw;
                color: rgba(255, 255, 255, 0.65);
              }
            }
          }
          .item-content3 {
            font-size: 0.625vw;
            color: rgba(255, 255, 255, 0.65);
          }
        }
        // 奇数行
        .item:nth-child(odd) {
          background-color: #152c45;
        }
        // 偶数行
        .item:nth-child(even) {
          background-color: #1a3957;
          border-color: #24539a;
        }
      }
    }
  }
  .section5 {
    height: 38vh;
    .contain {
      position: relative;
      display: flex;
      flex-direction: column;
      height: 100%;
      .time {
        position: absolute;
        top: 0px;
        right: 0px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        font-size: 0.625vw;
        color: #667689;
        height: 22px;
        cursor: pointer;
      }
      .wrap {
        margin-top: 30px;
        overflow-y: auto;
        .item {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 5px;
          margin-bottom: 20px;
          .title {
            display: flex;
            align-items: center;
            gap: 15px;
            .tip {
              font-size: 0.625vw;
              color: #fff;
              background-color: #f95f17;
              border-radius: 25% 75% 27% 73% / 100% 0% 100% 0%;
              padding: 2px 10px;
            }
            .date {
              font-size: 0.625vw;
              color: #ddf3fc;
            }
          }
          .content {
            position: relative;
            background: url("@/assets/images/electronicFence/bg2.png") no-repeat center center / 100% 100%;
            padding: 10px;
            .content-item {
              display: flex;
              align-items: center;
              gap: 10px;
              font-size: 0.625vw;
              color: #ddf3fc;
              line-height: 2em;
            }
            .type-tip {
              position: absolute;
              top: 15px;
              right: 15px;
              padding: 3px 6px;
              background: #0f4488;
              color: #ddf3fc;
              font-size: 0.625vw;
            }
          }
        }
      }
    }
  }
}
</style>
<style lang="scss">
.electronicFence-onemap {
  .el-input__wrapper {
    background-color: #0c284d;
    color: #aab4c1;
    box-shadow: none;
  }
  .el-select__wrapper {
    background-color: #0c284d;
    color: #aab4c1;
    box-shadow: none;
  }
  .el-date-editor {
    background-color: #0c284d;
    color: #aab4c1;
    box-shadow: none;
  }
  .el-range-input {
    color: #aab4c1;
  }
  .el-range-separator {
    color: #aab4c1;
  }
  .el-select__placeholder {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #aab4c1;
  }
  .el-table {
    thead {
      font-size: 0.6771vw;
    }
    tbody {
      font-size: 0.6771vw;
    }
  }
}
</style>
