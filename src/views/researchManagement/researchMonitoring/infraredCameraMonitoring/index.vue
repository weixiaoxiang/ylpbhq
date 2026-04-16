<script lang="ts" setup>
import {
  GetInfraredCamera_FindFile,
  GetIrcameraStatisticalAnalysis_Sbgk,
  GetIrcameraStatisticalAnalysis_Sbzpl,
  GetIrcameraStatisticalAnalysis_Wzphb,
  GetIrcameraWgList
} from "@/api"
import { u } from "@/utils/viewerjs"
import AllCapture from "./AllCapture.vue"
//@ts-ignore
import dayjs from "dayjs"
// @ts-expect-error  说明原因
import { vue3ScrollSeamless } from "vue3-scroll-seamless"
const proxy = getCurrentInstance()!.proxy as any
const { showCSB } = storeToRefs(useConfigStore())

const changePanelTitleType = (type: string) => {
  if (type === "最新抓拍-更多") {
    showAllCapture.value = true
  }
  if (type.indexOf("物种排行榜") > -1) {
    getTableData(type.split("-")[1])
  }
  // console.log(type)
}
const popup = ref<any>(null)
const modular = ref("红外相机监测")
const {
  closePopup,
  popupInfo,
  popupFormatType,
  map,
  vectorFeatures,
  locationMap,
  addHwxjWgPolygon,
  addLayerManageData,
  removeLayerManageData
} = useOlMap(popup, {
  zoom: 12.20477,
  center: [116.16027952755078, 30.97908202369116],
  modular: modular.value,
  openOverlay: false,
  overlayOffset: [0, -70],
  overlayPositioning: "bottom-center",
  vectorLayerDeclutter: false,
  callBack: {
    click: (data: any) => {
      // console.log(data, 333)
      name.value = data.name
      showAllCapture.value = true
    }
  }
})
// 是否显示抓拍记录;
const showAllCapture = ref(false)
// 地图被点击的红外相机名称
const name = ref<any>(null)

// 获得红外相机网格并加载在地图上
const getHwxjWgList = async () => {
  const { response } = await GetIrcameraWgList()
  addHwxjWgPolygon(response)
}
// 当前时间
const currentTime = dayjs().format("YYYY/MM/DD HH:mm:ss")

// 数据概况
const sbgkData = ref<any>({})
// 获取数据概况
const getSbgkData = async () => {
  const { response } = await GetIrcameraStatisticalAnalysis_Sbgk()
  sbgkData.value = {
    jrValue1: response.find((item: any) => item.name === "今日上传数量").value1,
    jrValue2: response.find((item: any) => item.name === "今日上传数量").value2,
    ljValue1: response.find((item: any) => item.name === "累计上传数量").value1,
    ljValue2: response.find((item: any) => item.name === "累计上传数量").value2,
    qkValue1: response.find((item: any) => item.name === "设备情况").value1,
    qkValue2: response.find((item: any) => item.name === "设备情况").value2
  }
}
// 物种排行榜
const tableColumns = ref<any[]>([
  {
    label: "物种",
    prop: "name"
  },
  {
    label: "抓拍图片数(张)",
    prop: "piccount"
  },
  {
    label: "出现相机数(台)",
    prop: "cameracount"
  },
  {
    label: "出现次数(次)",
    prop: "numcount"
  },
  {
    label: "出现区域(个)",
    prop: "wgcount"
  }
])
// 物种排行榜数据
const tableData = ref<any>()
// 获取物种排行榜数据
const getTableData = async (timeType?: string) => {
  const { response } = await GetIrcameraStatisticalAnalysis_Wzphb({
    timeType: timeType || "总计"
  })
  tableData.value = response
}
// 设备抓拍率数据
const lineBarData = ref<any>(null)
// 获取设备抓拍率数据
const getLineBarData = async () => {
  // linedata.value = {}
  // lineBarData.value = {
  //   dw: ["%", "张"],
  //   xAxis: ["01", "02", "03", "04", "05", "06"],
  //   data: [
  //     {
  //       name: "抓拍率",
  //       type: "line",
  //       dw: "%",
  //       data: [
  //         { label: "01", value: 86.784 },
  //         { label: "02", value: 10 }
  //       ]
  //     },
  //     {
  //       name: "照片上传数量",
  //       type: "bar",
  //       dw: "张",
  //       data: [
  //         { label: "01", value: 10 },
  //         { label: "02", value: 60 }
  //       ]
  //     }
  //   ]
  // }
  // return
  const { response } = await GetIrcameraStatisticalAnalysis_Sbzpl()
  if (response?.[0]?.childer?.length > 0) {
    lineBarData.value = {
      dw: ["%", "张"],
      xAxis: response[0].childer.map((item: any) => item.name),
      data: response.map((item: any) => {
        if (item.name === "抓拍率") {
          return {
            name: item.name,
            type: "line",
            dw: "%",
            data: item.childer.map((item: any) => ({
              label: item.name,
              value: item.value
            }))
          }
        }
        if (item.name === "照片上传数量") {
          return {
            name: item.name,
            type: "bar",
            dw: "张",
            data: item.childer.map((item: any) => ({
              label: item.name,
              value: item.value
            }))
          }
        }
      })
    }
  } else {
    lineBarData.value = null
  }
}

// 最新抓拍
const list = ref<any>([])
const getList = async () => {
  // list.value = [{}, {}]
  const { response } = await GetInfraredCamera_FindFile({
    page: 1,
    intPageSize: 15
  })
  list.value = response.data
}
const showVideoPalyer = ref(false)
const zxzpInfo = ref<any>({})
const viewZxzp = (event: any) => {
  if (event.target?.className === "img-item") {
    const itemData = event.target.dataset.item
    if (itemData) {
      const item = JSON.parse(itemData)
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
  }
}

// 获得珍稀物种数据
const zxwzList = ref<any[]>([])
const getZxwzList = async () => {
  zxwzList.value = [
    {
      name: "安徽麝",
      cameraCount: 1,
      picCount: 1,
      level: "国I级",
      img: "/statisUrl/animalsplants/动物/物种/安徽麝.jpg"
    },
    {
      name: "东方白鹳",
      cameraCount: 1,
      picCount: 1,
      level: "国I级",
      img: "/statisUrl/animalsplants/动物/物种/东方白鹳.jpg"
    },
    {
      name: "金钱豹",
      cameraCount: 1,
      picCount: 1,
      level: "国I级",
      img: "/statisUrl/animalsplants/动物/物种/金钱豹.jpg"
    },
    {
      name: "白鹤",
      cameraCount: 1,
      picCount: 1,
      level: "国I级",
      img: "/statisUrl/animalsplants/动物/物种/白鹤.jpg"
    }
  ]
}
// 查看珍稀物种
const viewZxwz = (item: any) => {
  if (item.img) {
    const urls = [item.img]
    u.showPreviewImg(0, urls)
  } else {
    ElMessage.warning("暂无内容预览")
  }
}

let cleanup: any
const { setVariable } = useCssVariables()
onMounted(() => {
  setVariable("maptool-sidebar-right", "calc(21.875vw + 40px)") // 设置地图工具栏距右侧距离
  setVariable("maptool-sidebar-bottom", "calc(305px + 40px)") // 设置地图工具栏距底部距离
  proxy.$mitt.on("changePanelTitleType", changePanelTitleType)
  getHwxjWgList() // 红外相机网格列表
  getSbgkData() // 数据概况
  getTableData() // 物种排行榜
  getLineBarData() // 设备抓拍率
  getList() // 最新抓拍
  nextTick(() => {
    // 添加椭圆运动,返回cleanup函数，用于清除椭圆运动
    cleanup = createEllipticalMotion(document.getElementById("EllipticalMotion")!, 0.1, "远小近大")
  })
  getZxwzList() // 珍稀物种
})
onBeforeUnmount(() => {
  proxy.$mitt.off("changePanelTitleType", changePanelTitleType)
  cleanup && cleanup()
})
</script>
<template>
  <div class="infraredCamera-monitoring">
    <div class="section-bar">
      <MapFeatureSearch
        :features="vectorFeatures"
        @location="locationMap"
      />
      <MapLayerManage
        :modular="modular"
        :init-checked-keys="[35]"
        @addLayer="addLayerManageData"
        @removeLayer="removeLayerManageData"
      />
    </div>
    <div class="bottom">
      <transition-group
        enter-active-class="animate__animated animate__bounceInDown"
        leave-active-class="animate__animated animate__fadeOut"
        appear
        appear-active-class="animate__animated  animate__bounceInDown"
      >
        <div
          v-show="showCSB"
          class="section1"
          key="section1"
        >
          <BasePanel title="数据概况">
            <template #contain>
              <div class="contain">
                <div class="time">更新时间：{{ currentTime }}</div>
                <div class="box">
                  <div class="item">
                    <img
                      :src="$fun.getImg('researchManagement/sjgk-img1.svg')"
                      alt=""
                    />
                    <div class="item-box corner">
                      <div class="hd">累计上传数量</div>
                      <div class="row">
                        <div class="name">
                          <img
                            :src="$fun.getImg('researchManagement/icon18.png')"
                            alt=""
                          />
                          <div>图片</div>
                        </div>
                        <div class="value1">{{ sbgkData.ljValue1 }}</div>
                      </div>
                      <div class="row">
                        <div class="name">
                          <img
                            :src="$fun.getImg('researchManagement/icon19.png')"
                            alt=""
                          />
                          <div>视频</div>
                        </div>
                        <div class="value1">{{ sbgkData.ljValue2 }}</div>
                      </div>
                      <div class="corner-top-right"></div>
                      <div class="corner-bottom-left"></div>
                    </div>
                  </div>
                  <div class="item">
                    <img
                      :src="$fun.getImg('researchManagement/sjgk-img2.svg')"
                      alt=""
                    />
                    <div class="item-box corner">
                      <div class="hd">今日上传数量</div>
                      <div class="row">
                        <div class="name">
                          <img
                            :src="$fun.getImg('researchManagement/icon18.png')"
                            alt=""
                          />
                          <div>图片</div>
                        </div>
                        <div class="value1">{{ sbgkData.jrValue1 }}</div>
                      </div>
                      <div class="row">
                        <div class="name">
                          <img
                            :src="$fun.getImg('researchManagement/icon19.png')"
                            alt=""
                          />
                          <div>视频</div>
                        </div>
                        <div class="value1">{{ sbgkData.jrValue2 }}</div>
                      </div>
                      <div class="corner-top-right"></div>
                      <div class="corner-bottom-left"></div>
                    </div>
                  </div>
                  <div class="item">
                    <img
                      :src="$fun.getImg('researchManagement/sjgk-img3.svg')"
                      alt=""
                    />
                    <div class="item-box corner">
                      <div class="hd">设备情况</div>
                      <div class="row">
                        <div class="name">
                          <img
                            :src="$fun.getImg('researchManagement/online.png')"
                            alt=""
                          />
                          <div>在线</div>
                        </div>
                        <div class="value2">{{ sbgkData.qkValue1 }}</div>
                      </div>
                      <div class="row">
                        <div class="name">
                          <img
                            :src="$fun.getImg('researchManagement/offline.png')"
                            alt=""
                          />
                          <div>离线</div>
                        </div>
                        <div class="value3">{{ sbgkData.qkValue2 }}</div>
                      </div>
                      <div class="corner-top-right"></div>
                      <div class="corner-bottom-left"></div>
                    </div>
                  </div>
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
            title="物种排行榜"
            initType="总计"
            :types="['总计', '近一周', '近一月', '近一年']"
          >
            <template #contain>
              <div class="contain">
                <ElTablePanel
                  ref="elTablePanelRef"
                  :columns="tableColumns"
                  :data="tableData"
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
          <BasePanel title="设备抓拍率">
            <template #contain>
              <div class="contain">
                <LineBarChartPanel
                  :lineColors="['#e6b825']"
                  :gradient="true"
                  :barColors="['#30b6ff|#dcf8f9']"
                  :area-background="true"
                  :open-division="false"
                  :data="lineBarData"
                />
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
          <BasePanel
            title="最新抓拍"
            :btns="['更多']"
          >
            <template #contain>
              <div
                class="contain"
                @click="viewZxzp"
              >
                <div class="thead row">
                  <div>物种</div>
                  <div>相机编号</div>
                  <div>时间</div>
                  <div>
                    图片
                    <div class="png-tip"></div>
                    / 视频
                    <div class="video-tip"></div>
                  </div>
                </div>
                <!-- <vue3ScrollSeamless
                  class="scroll-wrap"
                  :classOptions="{ step: 0.2 }"
                  :dataList="list"
                > -->
                <el-scrollbar class="scroll-wrap">
                  <ul class="ui-wrap-zxzp">
                    <li
                      class="li-item row"
                      v-for="(item, i) of list"
                      :key="i"
                    >
                      <div>
                        <el-text truncated>{{ item.spnamelist || item.detnamelist || "无名称" }}</el-text>
                      </div>
                      <div>
                        <el-text truncated>{{ item.dename }}</el-text>
                      </div>
                      <div>{{ item.createdtime }}</div>
                      <div class="img-box">
                        <img
                          :src="
                            item.filebmp === '图片'
                              ? '/redCareamStaticUrl/' + (item.resultfile ? item.resultfile : item.fileurl)
                              : '/redCareamStaticUrl/' + item.coverurl
                          "
                          alt=""
                          class="img-item"
                          :data-item="JSON.stringify(item)"
                        />
                        <div
                          v-if="item.filebmp !== '视频'"
                          class="png-tip"
                        ></div>
                        <div
                          v-else
                          class="video-tip"
                        ></div>
                      </div>
                    </li>
                  </ul>
                </el-scrollbar>
                <!-- </vue3ScrollSeamless> -->
              </div>
            </template>
          </BasePanel>
        </div>
        <div
          v-show="showCSB"
          class="section5"
          key="section5"
        >
          <BasePanel title="珍稀物种">
            <template #contain>
              <div class="contain">
                <div
                  class="boxs"
                  id="EllipticalMotion"
                >
                  <div
                    v-for="(item, i) of zxwzList"
                    :key="i"
                    class="box"
                    @click="viewZxwz(item)"
                  >
                    <div class="info">
                      <div class="info-item">
                        <span>{{ item.name }}</span>
                        <span>出现相机数{{ item.cameraCount }}台</span>
                      </div>
                      <div class="info-item">
                        <span>国I级</span>
                        <span>上传相片数{{ item.picCount }}张</span>
                      </div>
                    </div>
                    <img
                      :src="item.img"
                      alt=""
                    />
                  </div>
                </div>
              </div>
            </template>
          </BasePanel>
        </div>
      </transition-group>
    </div>
    <Modal
      id="fireWarning"
      v-model:show="showAllCapture"
      disable-zoom
      :close-on-click-modal="false"
      @close="name = null"
    >
      <template v-slot:container>
        <AllCapture :name="name" />
      </template>
    </Modal>
    <Modal
      id="video-palyer"
      v-model:show="showVideoPalyer"
      disable-zoom
      :close-on-click-modal="false"
    >
      <template v-slot:container>
        <div
          class="panzoom-exclude"
          style="width: 800px"
        >
          <VideoPlayer :src="'/redCareamStaticUrl/' + (zxzpInfo.resultfile ? zxzpInfo.resultfile : zxzpInfo.fileurl)" />
        </div>
      </template>
    </Modal>
    <div
      class="map-box"
      id="map"
    >
      <!-- <MapPopup
        ref="popup"
        :type="1"
        :format-name="popupFormatType"
        :info="popupInfo"
        @close="closePopup"
      /> -->
      <MapTool
        v-if="map"
        :map="map"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.infraredCamera-monitoring {
  position: relative;
  height: 100%;

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

  .bottom {
    display: flex;
    gap: 20px;
    position: absolute;
    bottom: 20px;
    left: 20px;
    right: calc(21.875vw + 40px);
    z-index: 1;
    overflow: hidden;

    > div {
      height: 305px;
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
    // width: calc(calc(100% - 40px) / 3);
    flex: 1;

    .contain {
      // display: flex;
      height: 100%;

      .time {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        font-size: 0.625vw;
        color: #667689;
        height: 22px;
      }

      .box {
        height: calc(100% - 22px);
        display: flex;
        justify-content: space-between;

        .item {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 15px;

          .item-box {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            width: 6.7708vw;
            height: 80px;
            font-size: 0.8854vw;
            padding: 0px 0.3125vw;
            color: #fff;
            font-size: 0.625vw;
            background: url("@/assets/images/researchManagement/sjgk-bg.png") no-repeat center center / 100% 100%;

            .hd {
              font-size: 0.7292vw;
              text-align: center;
              line-height: 2em;
            }

            .row {
              display: flex;
              justify-content: space-between;

              .name {
                display: flex;
                gap: 0.3125vw;

                img {
                  width: 0.7292vw;
                  height: 0.7292vw;
                }
              }

              .value1 {
                color: #38e6ea;
                font-size: 0.9375vw;
              }

              .value2 {
                color: #28ed47;
                font-size: 0.9375vw;
              }

              .value3 {
                color: #9c9c9c;
                font-size: 0.9375vw;
              }
            }

            &.corner {
              position: relative;

              &::before,
              &::after {
                content: "";
                position: absolute;
                width: 6px;
                height: 6px;
              }

              &::before {
                top: 0;
                left: 0;
                border-top: 1px solid #38eaed;
                border-left: 1px solid #38eaed;
              }

              &::after {
                bottom: 0;
                right: 0;
                border-bottom: 1px solid #38eaed;
                border-right: 1px solid #38eaed;
              }

              .corner-top-right::before,
              .corner-bottom-left::after {
                content: "";
                position: absolute;
                width: 6px;
                height: 6px;
              }

              .corner-top-right::before {
                top: 0;
                right: 0;
                border-top: 1px solid #38eaed;
                border-right: 1px solid #38eaed;
              }

              .corner-bottom-left::after {
                bottom: 0;
                left: 0;
                border-bottom: 1px solid #38eaed;
                border-left: 1px solid #38eaed;
              }
            }
          }
        }
      }
    }
  }

  .section2 {
    // width: calc(calc(100% - 40px) / 3);
    width: 26.0417vw;

    .contain {
      display: flex;
      height: 100%;
    }
  }

  .section3 {
    // width: calc(calc(100% - 40px) / 3);
    flex: 1;

    .contain {
      display: flex;
      height: 100%;
    }
  }

  .section4 {
    flex: 1;
    overflow: hidden;

    :deep(.contain) {
      display: flex;
      flex-direction: column;
      gap: 0.5208vw;
      overflow: hidden;
      height: 100%;
      .row {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 38px;
        background: url("@/assets/images/researchManagement/zxzp-bg.png") no-repeat center bottom / 100% 14px;
        padding-bottom: 6px;

        > div {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;

          &:nth-child(1) {
            width: 25%;
          }

          &:nth-child(2) {
            width: 15%;
          }

          &:nth-child(3) {
            width: 35%;
          }

          &:nth-child(4) {
            width: 25%;

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
          .img-item {
            height: 100%;
          }
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
        height: 100%;
        .ui-wrap-zxzp {
          flex: 1;
          overflow-y: auto;
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

  .section5 {
    height: 38vh;
    overflow: hidden;
    .contain {
      position: relative;
      display: flex;
      height: 100%;
      background: url("@/assets/images/researchManagement/zxwz-bg.png") no-repeat center bottom / 15.1042vw 290px;

      .boxs {
        position: absolute;
        bottom: 20px;
        left: 0;
        right: 0;
        height: 220px;

        .box {
          position: absolute;
          width: 85px;
          height: 105px;
          background: url("@/assets/images/researchManagement/zxwz-bg1.png") no-repeat center center / 100% 100%;
          transform-origin: center center;

          .info {
            position: absolute;
            top: 0px;
            left: 50%;
            transform: translate(-50%, -100%);
            padding: 6px;
            font-size: 0.7292vw;
            color: #fff;
            // width: 160px;
            width: max-content;
            height: 48px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            background: url("@/assets/images/researchManagement/zxwz-bg2.png") no-repeat center center / 100% 100%;

            .info-item {
              display: flex;
              justify-content: space-between;
              gap: 0.1563vw;
              align-items: center;

              span:first-child {
                color: #39e6ea;
              }

              &:nth-child(2) {
                span:first-child {
                  display: flex;
                  align-items: center;
                  font-size: 0.625vw;
                  color: #fff;
                  background-color: #f54340;
                }
              }
            }
          }

          img {
            position: absolute;
            left: 50%;
            top: 14px;
            transform: translateX(-49%);
            width: 58px;
            height: 58px;
            border-radius: 50%;
            overflow: hidden;
            cursor: pointer;
          }
        }
      }
    }
  }
}
</style>
<style lang="scss">
.infraredCamera-monitoring {
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
