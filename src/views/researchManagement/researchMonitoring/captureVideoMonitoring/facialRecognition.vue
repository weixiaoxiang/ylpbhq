<script lang="ts" setup>
import {
  GetfaceListByPage,
  GetfaceStatisticalAnalysis_Rylxfx,
  GetfaceStatisticalAnalysis_Xbfx,
  GetfaceStatisticalAnalysis_Zpddfx,
  GetfaceStatisticalAnalysis_Zpslqs
} from "@/api"
import { u } from "@/utils/viewerjs"
// @ts-ignore
import { vue3ScrollSeamless } from "vue3-scroll-seamless"
import CaptureRecord from "./CaptureRecord.vue"
const proxy = getCurrentInstance()!.proxy as any
const { showCSB } = storeToRefs(useConfigStore())
const changePanelTitleType = (type: string) => {
  if (type.indexOf("抓拍数量趋势") > -1) {
    const timeType = type.split("-")[1]
    getLinedata(timeType)
  }
  if (type.indexOf("人员分析") > -1) {
    const timeType = type.split("-")[1]
    getRadarData(timeType)
    getBarData(timeType)
    getPieData(timeType)
  }
  if (type === "抓拍记录-更多") {
    showCaptureRecord.value = true
  }
}
// 地图
const popup = ref<any>(null)
const modular = ref("人脸识别")
const {
  closePopup,
  map,
  popupInfo,
  popupFormatType,
  vectorFeatures,
  locationMap,
  addLayerManageData,
  removeLayerManageData
} = useOlMap(popup, {
  zoom: 12.20477,
  center: [116.16027952755078, 30.97908202369116],
  modular: modular.value,
  openOverlay: false,
  overlayOffset: [0, -70],
  overlayPositioning: "bottom-center"
})
// 抓拍数量趋势
const linedata = ref<any>(null)
const getLinedata = async (timeType?: string) => {
  const { response } = await GetfaceStatisticalAnalysis_Zpslqs({
    timeType: timeType || "日"
  })
  if (response?.[0]?.childer?.length > 0) {
    linedata.value = {
      dw: "单位:人",
      xAxis: response?.[0].childer?.map((item: any) => item.name),
      data: response.map((item: any) => ({
        name: item.name,
        data: item.childer.map((item: any) => ({
          label: item.name,
          value: item.value
        }))
      }))
    }
  } else {
    linedata.value = null
  }
}
// 抓拍记录列表
const zpjlList = ref<any>([])
const getZpjlList = async () => {
  const { response } = await GetfaceListByPage({
    page: 1,
    intPageSize: 99
  })
  zpjlList.value = response.data
}
const handleImageError = (event: any) => {
  event.target.src = proxy.$fun.getImg("avatar-no.png")
}
const showCaptureRecord = ref(false)
const viewZpjl = (event: any) => {
  if (event.target?.className.indexOf("view") > -1) {
    const snapurlall = event.target.src
    if (!snapurlall) return ElMessage.warning("暂无预览")
    u.showPreviewImg(0, [snapurlall])
  }
}
// 抓拍地点分析
const radarData = ref()
const getRadarData = async (timeType?: string) => {
  // radarData.value = {
  //   dw: "人",
  //   xAxis: ["烂泥坳", "锁口山", "祖师庙", "韶关", "骆驼坳"],
  //   data: [
  //     {
  //       name: "人数",
  //       data: [
  //         { name: "烂泥坳", value: "867.784" },
  //         { name: "锁口山", value: "418.636" },
  //         { name: "祖师庙", value: "756.956" },
  //         { name: "韶关", value: "504.631" },
  //         { name: "骆驼坳", value: "188.199" }
  //       ]
  //     }
  //   ]
  // }
  const { response } = await GetfaceStatisticalAnalysis_Zpddfx({
    timeType: timeType || "今日"
  })
  if (response?.length > 0) {
    response?.forEach((item: any) => {
      item.name = item.label = item.name.replace("人脸识别", "")
    })

    radarData.value = {
      dw: "人",
      xAxis: response?.map((item: any) => item.name),
      data: [
        {
          name: "单位：人",
          data: response
        }
      ]
    }
  } else {
    radarData.value = null
  }
}
// 人员类型分析
const barData = ref()
const getBarData = async (timeType?: string) => {
  const { response } = await GetfaceStatisticalAnalysis_Rylxfx({
    timeType: timeType || "今日"
  })
  if (response?.length > 0) {
    barData.value = {
      dw: "人",
      xAxis: response?.map((item: any) => item.name),
      data: [
        {
          name: "",
          data: response.map((item: any) => ({
            label: item.name,
            value: item.value
          }))
        }
      ]
    }
  } else {
    barData.value = null
  }
}
// 性别分析
const pieData = ref()
const getPieData = async (timeType?: string) => {
  // pieData.value = [
  //   {
  //     name: "男",
  //     value: 175
  //   },
  //   {
  //     name: "女",
  //     value: 234
  //   }
  // ]
  const { response } = await GetfaceStatisticalAnalysis_Xbfx({
    timeType: timeType || "今日"
  })
  if (response?.length > 0) {
    pieData.value = response
  } else {
    pieData.value = null
  }
}
const { setVariable } = useCssVariables()
onMounted(() => {
  setVariable("maptool-sidebar-right", "calc(21.875vw + 40px)") // 设置地图工具栏距右侧距离
  setVariable("maptool-sidebar-bottom", "calc(305px + 40px)") // 设置地图工具栏距底部距离
  proxy.$mitt.on("changePanelTitleType", changePanelTitleType)
  getLinedata() // 抓拍数量趋势
  getZpjlList() // 抓拍记录
  getRadarData() // 抓拍地点分析
  getBarData() // 人员类型分析
  getPieData() // 性别分析
})
onBeforeUnmount(() => {
  proxy.$mitt.off("changePanelTitleType", changePanelTitleType)
})
</script>
<template>
  <div class="facialRecognition">
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
          <BasePanel
            title="抓拍数量趋势"
            initType="日"
            :types="['日', '月', '年']"
          >
            <template #contain>
              <div class="contain">
                <LineChartPanel
                  :node-shadow="true"
                  :open-effect="true"
                  :areaBackground="true"
                  :colors="['#4a7ad3']"
                  :data="linedata"
                />
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
            title="抓拍记录"
            :btns="['更多']"
          >
            <template #contain>
              <div
                v-if="zpjlList.length > 0"
                class="contain"
                @click="viewZpjl"
              >
                <vue3ScrollSeamless
                  class="scroll-wrap"
                  :classOptions="{ step: 0.1 }"
                  :dataList="zpjlList"
                >
                  <ul class="ui-wrap-zpjl">
                    <li
                      class="li-item"
                      v-for="(item, i) of zpjlList"
                      :key="i"
                    >
                      <img
                        class="li-img view"
                        :src="item.snapurlall ? '/vehicleStaticUrl' + item.snapurlall : ''"
                        alt=""
                        @error="handleImageError"
                      />
                      <div class="r-con">
                        <div class="item">
                          <div>
                            <img
                              :src="$fun.getImg('researchManagement/zpjl-icon1.png')"
                              alt=""
                            />
                            <span>{{ item.cameraname || "暂无" }}</span>
                          </div>
                          <div>
                            <img
                              :src="$fun.getImg('researchManagement/zpjl-icon2.png')"
                              alt=""
                            />
                            <span>{{ item.gender || "暂无" }}</span>
                          </div>
                        </div>
                        <div class="item">
                          <div>
                            <img
                              :src="$fun.getImg('researchManagement/zpjl-icon3.png')"
                              alt=""
                            />
                            <span>{{ item.age || "暂无" }}</span>
                          </div>
                          <div>
                            <img
                              :src="$fun.getImg('researchManagement/zpjl-icon4.png')"
                              alt=""
                            />
                            <span>{{ item.eventtime || "暂无" }}</span>
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </vue3ScrollSeamless>
              </div>
              <EmptyData v-else />
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
          class="section3"
          key="section3"
        >
          <BasePanel
            title="人员分析"
            initType="今日"
            :types="['今日', '近7天', '近30天']"
          >
            <template #contain>
              <div class="contain">
                <div class="box">
                  <div>
                    <img
                      :src="$fun.getImg('arrow-left.png')"
                      alt=""
                    />
                    抓拍地点分析
                    <img
                      :src="$fun.getImg('arrow-right.png')"
                      alt=""
                    />
                  </div>
                  <div>
                    <RadarChartPanel
                      :colors="['#f0ac24']"
                      :data="radarData"
                    />
                  </div>
                </div>
                <div class="box">
                  <div>
                    <img
                      :src="$fun.getImg('arrow-left.png')"
                      alt=""
                    />
                    人员类型分析
                    <img
                      :src="$fun.getImg('arrow-right.png')"
                      alt=""
                    />
                  </div>
                  <div>
                    <BarReversalChartPanel
                      :show-legend="false"
                      :colors="['#3690f8|#7ee8ec']"
                      :gradient="true"
                      :data="barData"
                    />
                  </div>
                </div>
                <div class="box">
                  <div>
                    <img
                      :src="$fun.getImg('arrow-left.png')"
                      alt=""
                    />
                    性别分析
                    <img
                      :src="$fun.getImg('arrow-right.png')"
                      alt=""
                    />
                  </div>
                  <div>
                    <HollowPieChartPanel
                      dw="人"
                      title="总人数"
                      :show-legend="false"
                      :gradient="false"
                      :showLabel="true"
                      :colors="['#44fbb1', '#fb745d']"
                      :data="pieData"
                    />
                  </div>
                </div>
              </div>
            </template>
          </BasePanel></div
      ></transition-group>
    </div>
    <Modal
      id="captureRecord"
      v-model:show="showCaptureRecord"
      disable-zoom
      :close-on-click-modal="false"
    >
      <template v-slot:container>
        <CaptureRecord />
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
      />
      <MapTool
        v-if="map"
        :map="map"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.facialRecognition {
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
    gap: 0.2604vw;
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
    width: 47.9167vw;
    .contain {
      display: flex;
      height: 100%;
    }
  }
  .section2 {
    flex: 1;
    .contain {
      display: flex;
      height: 100%;
      :deep(.scroll-wrap) {
        flex: 1;
        .ui-wrap-zpjl {
          display: flex;
          flex-direction: column;
          gap: 0.5208vw;
          padding: 0;
          margin: 0;
          .li-item {
            display: flex;
            align-items: center;
            gap: 0.5208vw;
            list-style: none;
            width: 23.6979vw;
            height: 56px;
            padding: 0.5208vw;
            background: url("@/assets/images/researchManagement/zpjl-bg.png") no-repeat center center / 100% 100%;
            .li-img {
              width: 40px;
              height: 40px;
            }
            .r-con {
              flex: 1;
              height: 100%;
              display: flex;
              gap: 0.2604vw;
              flex-direction: column;
              justify-content: space-around;
              .item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 0.7292vw;
                > div {
                  display: flex;
                  align-items: center;
                  gap: 0.5208vw;
                  img {
                    width: 0.9375vw;
                  }
                  &:last-child {
                    width: 9.375vw;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  .section3 {
    height: 100%;
    color: #fff;
    .contain {
      display: flex;
      flex-direction: column;
      height: 100%;
      .box {
        position: relative;
        display: flex;
        flex-direction: column;
        font-size: 0.7292vw;
        > div:first-child {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.4167vw;
          background-color: #294064;
          line-height: 2em;
          color: #a4d0e5;
        }
        > div:last-child {
          flex: 1;
        }
      }
      .box:nth-child(1) {
        height: 28.57%;
      }
      .box:nth-child(2) {
        height: 42.86%;
      }
      .box:nth-child(3) {
        height: 28.57%;
      }
    }
  }
}
</style>
<style lang="scss">
.facialRecognition {
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
}
</style>
