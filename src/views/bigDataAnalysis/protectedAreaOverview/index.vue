<script lang="ts" setup>
import {
  GetALargeScreenReserve_Jcgk,
  GetALargeScreenReserve_Tdlyx,
  GetAnimalsPlantsStatisticalAnalysis_Bhdj,
  GetAnimalsPlantsStatisticalAnalysis_Zwzlbleve,
  GetFamousTreesStatisticalAnalysis_Gsdj
} from "@/api"

const proxy = getCurrentInstance()!.proxy as any
const { showCSB } = storeToRefs(useConfigStore())
const popup = ref<any>(null)
const {
  map,
  popupFormatType,
  popupInfo,
  closePopup,
  vectorFeatures,
  locationMap,
  addLayerManageData,
  removeLayerManageData
} = useOlMap(popup, {
  zoom: 13,
  center: [116.0992869, 31.046022],
  openOverlay: false,
  overlayOffset: [0, -70],
  overlayPositioning: "bottom-center",
  vectorLayerDeclutter: true
})

// 功能分区数据
const chartData1 = ref<any[]>([])
const getChartData1 = async () => {
  const { response } = await GetALargeScreenReserve_Jcgk()
  chartData1.value = response
}

// 土地利用现状
const tableColumns = ref<any[]>([
  {
    label: "土地类型",
    prop: "name"
  },
  {
    label: "面积(hm²)",
    prop: "value"
  },
  {
    label: "占比率(%)",
    prop: "rate"
  }
])
const tableData = ref<any>()
const getTableData = async () => {
  const { response } = await GetALargeScreenReserve_Tdlyx()
  tableData.value = response
}

// 生物多样性数据
const bhdjData = ref<any>({})
const getZxwzData = async () => {
  const { response } = await GetAnimalsPlantsStatisticalAnalysis_Bhdj()
  bhdjData.value = response
}

// 生物多样性tab1
const tab1 = ref("动物")
const handleTab1Click = (type: string) => {
  tab1.value = type
  tab2.value = "一级保护" + type
  page.value = 1
  getSwdyxList()
}
// 生物多样性tab2
const tab2 = ref("一级保护动物")
const handleTab2Click = (type: string) => {
  tab2.value = type
  page.value = 1
  getSwdyxList()
}

// 生物多样性图片页码
const page = ref(1)
const changePage = (type: string) => {
  if (type === "pre") {
    if (page.value <= 1) {
      ElMessage.warning("已经是第一页")
      return
    }
    page.value--
  } else {
    if (page.value >= pageCount.value) {
      ElMessage.warning("已经是最后一页")
      return
    }
    page.value++
  }
  getSwdyxList()
}
// 获取生物多样性图片数据
const swdyxList = ref<any[]>([])
const pageCount = ref(0)
const getSwdyxList = async () => {
  // swdyxList.value = [{}, {}, {}, {}]
  const { response } = await GetAnimalsPlantsStatisticalAnalysis_Zwzlbleve({
    datatype: tab1.value,
    levetype: tab2.value.indexOf("一级") > -1 ? "国一" : "国二",
    page: page.value,
    intPageSize: 6
  })
  swdyxList.value = response.data
  pageCount.value = response.pageCount
}

// 获得古树名木数据
const treesLevel = ref<any>({})
const getFamousTreesLevel = async () => {
  const { response } = await GetFamousTreesStatisticalAnalysis_Gsdj()
  treesLevel.value = response
}

const showDataPanel = ref(false)
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

const { setVariable } = useCssVariables()
onMounted(() => {
  setVariable("maptool-sidebar-right", "calc(21.875vw + 40px)") // 设置地图工具栏距右侧距离
  setVariable("maptool-sidebar-bottom", "calc(20px)") // 设置地图工具栏距底部距离
  getChartData1() // 获取功能分区数据
  getTableData() // 获取土地利用现状数据
  getZxwzData() // 获取生物多样性基础数据
  getSwdyxList() // 获取生物多样性图片数据
  getFamousTreesLevel() // 获得古树名木数据
  // 古树名木粒子特效
  initStarEffect("tree-particle", {
    fullScreen: false,
    particles: {
      number: {
        value: 3000
      },
      color: {
        value: ["#31def1", "#caecf7"]
      }
    }
  })
})
</script>
<template>
  <div class="protected-area-overview">
    <div class="section-bar">
      <MapFeatureSearch
        :features="vectorFeatures"
        @location="locationMap"
      />
      <MapLayerManage
        :init-checked-keys="[35]"
        @addLayer="addLayerManageData"
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
          <BasePanel title="功能分区">
            <template #contain>
              <div class="contain">
                <ChartPanel9
                  dw="hm²"
                  title="总面积"
                  :show-label="false"
                  :gradient="false"
                  :colors="['#ed5e5e', '#4ed8e1', '#edab58']"
                  :data="chartData1"
                />
              </div> </template
          ></BasePanel>
        </div>
        <div
          v-show="showCSB"
          class="section2"
          key="section2"
        >
          <BasePanel title="气候土壤类型">
            <template #contain>
              <div
                class="contain"
                id="climate-particle"
              >
                <div class="item item1">
                  <div>寒湿高山气候区</div>
                  <div>海拔>1200m</div>
                </div>
                <div class="item item2">
                  <div>山地草甸土</div>
                  <div>海拔1000m以上</div>
                </div>
                <div class="item item3">
                  <div>凉湿中山气候区</div>
                  <div>海拔800m～1200m</div>
                </div>
                <div class="item item4">
                  <div>山地棕壤高山沼泽土</div>
                  <div>海拔800m以上</div>
                </div>
                <div class="item item5">
                  <div>温湿低山气候区</div>
                  <div>海拔500m～800m</div>
                </div>
                <div class="item item6">
                  <div>黄棕壤</div>
                  <div>海拔800m以下</div>
                </div>
              </div>
            </template></BasePanel
          >
        </div>
        <div
          v-show="showCSB"
          class="section3"
          key="section3"
        >
          <BasePanel title="土地利用现状">
            <template #contain>
              <div class="contain">
                <ElTablePanel
                  ref="elTablePanelRef"
                  :show-index="false"
                  :selection="false"
                  :columns="tableColumns"
                  :data="tableData"
                />
              </div> </template
          ></BasePanel>
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
          <BasePanel title="生物多样性">
            <template #contain>
              <div class="contain">
                <div class="contain-box1">
                  <div class="box1">
                    <img
                      :src="$fun.getImg('backgroundResources/bhdj-img1.png')"
                      alt=""
                    />
                    <div class="text-box">
                      <div class="dj">国家Ⅰ级</div>
                      <div>
                        动物<span class="value">{{ bhdjData.oneanimalcount }}种</span>
                      </div>
                      <div>
                        植物<span class="value">{{ bhdjData.oneplantcount }}种</span>
                      </div>
                    </div>
                  </div>
                  <div class="box2">
                    <img
                      :src="$fun.getImg('backgroundResources/bhdj-img2.png')"
                      alt=""
                    />
                    <div class="text-box">
                      <div class="dj">国家Ⅱ级</div>
                      <div>
                        动物<span class="value">{{ bhdjData.twoanimalcount }}种</span>
                      </div>
                      <div>
                        植物<span class="value">{{ bhdjData.twoplantcount }}种</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="contain-box2">
                  <div class="tab1">
                    <div
                      class="tab1-item"
                      :class="{ current: tab1 === '动物' }"
                      @click="handleTab1Click('动物')"
                    >
                      动物
                    </div>
                    <div
                      class="tab1-item"
                      :class="{ current: tab1 === '植物' }"
                      @click="handleTab1Click('植物')"
                    >
                      植物
                    </div>
                  </div>
                  <div class="tab2">
                    <div
                      class="tab2-item"
                      :class="{ current: tab2 === '一级保护' + tab1 }"
                      @click="handleTab2Click('一级保护' + tab1)"
                    >
                      <div>一级保护{{ tab1 }}</div>
                    </div>
                    <div
                      class="tab2-item"
                      :class="{ current: tab2 === '二级保护' + tab1 }"
                      @click="handleTab2Click('二级保护' + tab1)"
                    >
                      <div>二级保护{{ tab1 }}</div>
                    </div>
                  </div>
                  <div class="img-box">
                    <div class="img-main-box">
                      <div
                        v-for="(item, i) in swdyxList"
                        :key="i"
                        class="img-item"
                      >
                        <el-image
                          :src="item.filelist?.[0]?.filepath ? '/statisUrl/' + item.filelist?.[0]?.filepath : ''"
                          alt=""
                          fit="cover"
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
                        <div class="name">{{ item.mc || "暂无名称" }}</div>
                      </div>
                    </div>
                    <div
                      class="left-arrow"
                      @click="changePage('pre')"
                    >
                      <img
                        :src="$fun.getImg('bigDataAnalysis/k7.png')"
                        alt=""
                      />
                    </div>
                    <div
                      class="right-arrow"
                      @click="changePage('next')"
                    >
                      <img
                        :src="$fun.getImg('bigDataAnalysis/k8.png')"
                        alt=""
                      />
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </BasePanel>
        </div>
        <div
          v-show="showCSB"
          class="section5"
          key="section5"
        >
          <BasePanel title="古树名木">
            <template #contain>
              <div
                class="contain"
                id="tree-particle"
              >
                <div class="item item1">
                  <img
                    :src="$fun.getImg('bigDataAnalysis/k3.svg')"
                    alt=""
                  />
                  <div class="item-text">
                    <div>{{ treesLevel.onetree }}棵</div>
                    <div>一级古树名木</div>
                  </div>
                </div>
                <div class="item item2">
                  <img
                    :src="$fun.getImg('bigDataAnalysis/k4.svg')"
                    alt=""
                  />
                  <div class="item-text">
                    <div>{{ treesLevel.twotree }}棵</div>
                    <div>二级古树名木</div>
                  </div>
                </div>
                <div class="item item3">
                  <img
                    :src="$fun.getImg('bigDataAnalysis/k4.svg')"
                    alt=""
                  />
                  <div class="item-text">
                    <div>{{ treesLevel.threetree }}棵</div>
                    <div>三级古树名木</div>
                  </div>
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
.protected-area-overview {
  position: relative;
  height: 100%;
  font-size: 0.7292vw;
  color: #fff;
  .map-box {
    position: relative;
    width: 100%;
    height: 100%;
  }
  .section-bar {
    position: absolute;
    top: 20px;
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
    overflow: hidden;
    .contain {
      height: 100%;
    }
  }
  .section2 {
    // flex: 1;
    height: 250px;
    overflow: hidden;
    .contain {
      position: relative;
      height: 100%;
      background: url("@/assets/images/bigDataAnalysis/k1.png") no-repeat center center / 120% 100%;
      font-size: 0.7292vw;
      .item {
        position: absolute;
        border-bottom: 1px dashed #00e5ff;
        line-height: 1em;
      }
      .item1 {
        right: 16%;
        top: 5%;
      }
      .item2 {
        left: 20%;
        top: 12%;
      }
      .item3 {
        right: 8%;
        top: 26%;
      }
      .item4 {
        left: 10%;
        top: 35%;
      }
      .item5 {
        right: 6%;
        top: 48%;
      }
      .item6 {
        left: 16%;
        top: 55%;
      }
    }
  }
  .section3 {
    flex: 1;
    overflow: hidden;
    .contain {
      height: 100%;
    }
  }
  .section4 {
    height: 60%;
    overflow: hidden;
    .contain {
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      gap: 0.5208vw;
      .contain-box1 {
        display: flex;
        align-items: center;
        .box1,
        .box2 {
          flex: 1;
          display: flex;
          img {
            width: 5.7292vw;
            height: 4.6875vw;
          }
          .text-box {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 0.2604vw;
            > div:not(:first-child) {
              cursor: pointer;
            }
            .dj {
              font-size: 1.0417vw;
              color: #f2ab13;
              line-height: 1.5em;
            }
            .value {
              color: #f2ab13;
            }
          }
        }
        .box2 {
          .text-box {
            .dj {
              color: #20d2d4;
            }
            .value {
              color: #20d2d4;
            }
          }
        }
      }
      .contain-box2 {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.5208vw;
        overflow: hidden;
        .tab1 {
          display: flex;
          justify-content: center;
          gap: 1.0417vw;
          .tab1-item {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 5.5729vw;
            height: 25px;
            background: url("@/assets/images/bigDataAnalysis/k4.png") no-repeat center center / 100% 100%;
            cursor: pointer;
            &.current {
              background: url("@/assets/images/bigDataAnalysis/k3.png") no-repeat center center / 100% 100%;
              color: #a9c3f1;
            }
          }
        }
        .tab2 {
          display: flex;
          background-color: #0b2135;
          font-size: 0.625vw;
          .tab2-item {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 26px;
            cursor: pointer;
            &.current {
              color: #a9c3f1;
              > div {
                display: flex;
                align-items: center;
                &::before {
                  content: "";
                  width: 7px;
                  height: 9px;
                  margin-right: 0.5208vw;
                  background: url("@/assets/images/bigDataAnalysis/k5.png") no-repeat center center / 100% 100%;
                }
                &::after {
                  content: "";
                  width: 7px;
                  height: 9px;
                  margin-left: 0.5208vw;
                  background: url("@/assets/images/bigDataAnalysis/k6.png") no-repeat center center / 100% 100%;
                }
              }
            }
          }
        }
        .img-box {
          flex: 1;
          position: relative;
          padding: 0 15px;
          overflow: hidden;
          .img-main-box {
            width: 100%;
            height: 100%;
            display: flex;
            flex-wrap: wrap;
            gap: 0.5208vw;
            overflow: hidden;
            .img-item {
              display: flex;
              flex-direction: column;
              border: 1px solid #3e4f67;
              width: calc(calc(100% - 1.0417vw) / 3);
              height: calc(calc(100% - 0.5208vw) / 2);
              .el-image {
                width: 100%;
                height: 80%;
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
              .name {
                display: flex;
                height: 20%;
                align-items: center;
                justify-content: center;
                font-size: 0.625vw;
                color: #fff;
                background-color: #0e2539;
              }
            }
          }
          .left-arrow {
            position: absolute;
            top: 50%;
            left: 0;
            transform: translateY(-50%);
            cursor: pointer;
          }
          .right-arrow {
            position: absolute;
            top: 50%;
            right: 0;
            transform: translateY(-50%);
            cursor: pointer;
          }
        }
      }
    }
  }
  .section5 {
    height: 40%;
    overflow: hidden;
    .contain {
      position: relative;
      height: 100%;
      background: url("@/assets/images/bigDataAnalysis/k2.svg") no-repeat center center / 100% 100%;
      .item {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 7.2917vw;
        height: 3.5417vw;
        background: url("@/assets/images/bigDataAnalysis/k2.png") no-repeat center center / 100% 100%;
        img {
          width: 2.2917vw;
          height: 1.9792vw;
        }
        .item-text {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 0.3125vw;
          > div:nth-child(1) {
            font-size: 0.7292vw;
            color: #31def0;
          }
          > div:nth-child(1) {
            font-size: 0.8333vw;
            color: #beccdc;
          }
        }
      }
      .item1 {
        top: 3.2083vw;
        left: 1.5625vw;
      }
      .item2 {
        top: 3.2083vw;
        right: 1.5625vw;
      }
      .item3 {
        left: 50%;
        transform: translateX(-50%);
        bottom: 3.2083vw;
      }
    }
  }
}
</style>
