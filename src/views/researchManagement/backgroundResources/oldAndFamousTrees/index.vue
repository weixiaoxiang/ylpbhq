<script lang="ts" setup>
import {
  GetFamousTreesListByPage,
  GetFamousTreesStatisticalAnalysis_Gsdj,
  GetFamousTreesStatisticalAnalysis_Gskl,
  GetFamousTreesStatisticalAnalysis_Gszltj,
  GetInterface
} from "@/api"
import AllArchives from "./AllArchives.vue"
import BaseDetails from "./BaseDetails.vue"
import ProblemReport from "./ProblemReport.vue"
const proxy = getCurrentInstance()!.proxy as any
const { showCSB } = storeToRefs(useConfigStore())
const changePanelTitleType = (type: string) => {
  if (type === "古树档案-更多") {
    showOldAndFamousTreesData.value = true
  }
}

// 获得古树科类
const barData = ref<any>(null)
const getBarData = async () => {
  const { response } = await GetFamousTreesStatisticalAnalysis_Gskl()
  if (response?.length > 0) {
    barData.value = {
      dw: "棵",
      xAxis: response.map((item: any) => item.name),
      data: response.map((item: any) => item.value)
    }
  } else {
    barData.value = null
  }
}

// 获得古树等级
const treesLevel = ref<any>({})
const getFamousTreesLevel = async () => {
  const { response } = await GetFamousTreesStatisticalAnalysis_Gsdj()
  treesLevel.value = response
}

// 获得古树保护等级
const treesProtectionLevel = ref<any>(null)
const getTreesProtectionLevel = async () => {
  const { response } = await GetFamousTreesStatisticalAnalysis_Gszltj()
  treesProtectionLevel.value = response
    .map((item: any) => ({
      label: item.name,
      value: item.value
    }))
    .sort((a: any, b: any) => b.value - a.value) // 按value降序排序
    .splice(0, 10)
}
// 获得古树档案
let currentLimit = 0
const currentTree = ref<any>({})
let famousTreesList: any = []
const getFamousTreesListByPage = async () => {
  const { response } = await GetFamousTreesListByPage({
    intPageSize: 50,
    page: 1
  })
  famousTreesList = response.data
  currentTree.value = famousTreesList[currentLimit]
}
// 预览图片
const preview = () => {
  if (currentTree.value.filelist?.length > 0) {
    const url = currentTree.value.filelist.map((item: any) => "/fireStaticUrl/" + item.filepath)
    u.showPreviewImg(0, url)
  } else {
    ElMessage.warning("暂无预览图片")
  }
}
// 翻页
const paging = (type: string) => {
  if (type === "prev") {
    if (currentLimit > 0) {
      currentLimit--
      currentTree.value = famousTreesList[currentLimit]
    } else {
      ElMessage.warning("已经是第一项")
    }
  } else {
    if (currentLimit < famousTreesList.length - 1) {
      currentLimit++
      currentTree.value = famousTreesList[currentLimit]
    } else {
      ElMessage.warning("已经是最后一项")
    }
  }
}
// 显示古树档案弹框
const showOldAndFamousTreesData = ref(false)
// 显示古树详情弹框
const showBaseDetails = ref(false)
// 打开古树详情弹框
const openBaseDetail = async (data: any) => {
  const { response } = await GetInterface({
    ssmk: "地图弹框详情",
    layerid: data.treeid,
    id: data.id
  })
  response.response.filelist = response.fileslist
  response.response.hwxjfilelist = response.hwxjfilelist
  currentTree.value = response.response
  showBaseDetails.value = true
}
// 显示问题上报弹框
const showProblemReport = ref(false)
const popup = ref<any>(null)
const modular = ref("古树名木")
const {
  closePopup,
  popupInfo,
  map,
  vectorFeatures,
  locationMap,
  addLayerManageData,
  removeLayerManageData,
  setDeclutter,
  setCluster
} = useOlMap(popup, {
  zoom: 12.20477,
  center: [116.16027952755078, 30.97908202369116],
  modular: modular.value,
  openOverlay: false,
  overlayOffset: [0, -60],
  overlayPositioning: "bottom-center",
  vectorLayerDeclutter: false,
  // showClusterLayer: false,
  callBack: {
    // 地图点击古树名木弹出详情弹框
    click: openBaseDetail
  }
})
// 地图定位
const toLocation = () => {
  locationMap({
    type: "古树名木-古树档案定位",
    data: [Number(currentTree.value.lon), Number(currentTree.value.lat)]
  })
}
const { setVariable } = useCssVariables()
onMounted(() => {
  setVariable("maptool-sidebar-right", "calc(21.875vw + 40px)") // 设置地图工具栏距右侧距离
  setVariable("maptool-sidebar-bottom", "calc(305px + 40px)") // 设置地图工具栏距底部距离
  proxy.$mitt.on("changePanelTitleType", changePanelTitleType)
  getBarData() // 古树科类
  getFamousTreesLevel() // 古树等级
  getTreesProtectionLevel() // 古树保护等级
  getFamousTreesListByPage() // 古树档案
})
</script>
<template>
  <div class="old-and-famous-trees">
    <div class="section-bar">
      <MapFeatureSearch
        :features="vectorFeatures"
        @location="locationMap"
      />
      <MapLayerManage
        :modular="modular"
        :init-checked-keys="[35]"
        :init-legend-checkbox="true"
        @addLayer="addLayerManageData"
        @removeLayer="removeLayerManageData"
        @setDeclutter="setDeclutter"
        @setCluster="setCluster"
      />
      <div
        v-show="false"
        class="analysis-btn"
        @click="showProblemReport = true"
      >
        <img
          :src="$fun.getImg('backgroundResources/c4.png')"
          alt=""
        />
      </div>
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
          <BasePanel title="古树科类">
            <template #contain>
              <div class="contain">
                <Bar3DChartPanel
                  :left-colors="['#3CE4FC', '#3268F6']"
                  :right-colors="['#3CE4FC', '#1d3a6e']"
                  :top-colors="['#3ce4fc', '#3ce4fc']"
                  :data="barData"
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
          <BasePanel title="古树等级">
            <template #contain>
              <div class="contain">
                <div class="left-box">
                  <div class="title">一级古树：{{ treesLevel.onetree }}棵</div>
                  <div class="title">二级古树：{{ treesLevel.twotree }}棵</div>
                  <div class="title">三级古树：{{ treesLevel.threetree }}棵</div>
                </div>
                <div class="right-box">
                  <div class="item">
                    <div class="title">
                      <span class="num num1">01</span>
                      <span>一级古树</span>
                    </div>
                    <div class="table">
                      <div class="thead">
                        树龄<br />
                        数量
                      </div>
                      <div class="tbody">
                        ≥500年<br />
                        {{ treesLevel.onetree }}棵
                      </div>
                    </div>
                  </div>
                  <div class="item">
                    <div class="title">
                      <span class="num num2">02</span>
                      <span>二级古树</span>
                    </div>
                    <div class="table">
                      <div class="thead">
                        树龄<br />
                        数量
                      </div>
                      <div class="tbody">
                        300-349<br />
                        {{ treesLevel.twotree_1 }}棵
                      </div>
                      <div class="tbody">
                        350-399<br />
                        {{ treesLevel.twotree_2 }}棵
                      </div>
                      <div class="tbody">
                        400-449<br />
                        {{ treesLevel.twotree_3 }}棵
                      </div>
                      <div class="tbody">
                        449-499<br />
                        {{ treesLevel.twotree_4 }}棵
                      </div>
                    </div>
                  </div>
                  <div class="item">
                    <div class="title">
                      <span class="num num3">03</span>
                      <span>三级古树</span>
                    </div>
                    <div class="table">
                      <div class="thead">
                        树龄<br />
                        数量
                      </div>
                      <div class="tbody">
                        100-149<br />
                        {{ treesLevel.threetree_1 }}棵
                      </div>
                      <div class="tbody">
                        150-199<br />
                        {{ treesLevel.threetree_2 }}棵
                      </div>
                      <div class="tbody">
                        200-249<br />
                        {{ treesLevel.threetree_3 }}棵
                      </div>
                      <div class="tbody">
                        250-299<br />
                        {{ treesLevel.threetree_4 }}棵
                      </div>
                    </div>
                  </div>
                </div>
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
          class="section3"
          key="section3"
        >
          <BasePanel title="古树数量">
            <template #contain>
              <div class="contain">
                <div class="chart-box">
                  <RandomBubbleChartPanel :data="treesProtectionLevel" />
                  <BubbleAnimation
                    class="bubble-animation"
                    :max-bubbles="8"
                    :min-bubbles="6"
                    :min-size="25"
                    :max-size="35"
                    :min-duration="5"
                    :max-duration="10"
                    :min-distance="150"
                    :max-distance="300"
                    :colors="['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeead', '#ffaaa5']"
                  />
                </div>
              </div>
            </template>
          </BasePanel>
        </div>
        <div
          v-show="showCSB"
          class="section4"
          key="section4"
        >
          <BasePanel
            title="古树档案"
            :btns="['更多']"
          >
            <template #contain>
              <div class="contain">
                <div
                  class="left-arrow"
                  @click="paging('prev')"
                ></div>
                <div
                  class="right-arrow"
                  @click="paging('next')"
                ></div>
                <div class="info-box">
                  <el-image
                    :src="currentTree.filelist?.length > 0 ? '/fireStaticUrl/' + currentTree.filelist[0].filepath : ''"
                    alt=""
                    fit="fill"
                    @click="preview"
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
                  <div class="info">
                    <div class="name">{{ currentTree.mc || "暂无" }}</div>
                    <div class="con">
                      <span>纲名：{{ currentTree.gang || "暂无" }}</span>
                      <span>目名：{{ currentTree.mu || "暂无" }}</span>
                      <span>科名：{{ currentTree.ke || "暂无" }}</span>
                      <span>属名：{{ currentTree.shu || "暂无" }}</span>
                    </div>
                  </div>
                </div>
                <div class="list">
                  <div class="table">
                    <div class="thead">胸径</div>
                    <div class="tbody">{{ currentTree.gs_xj ? `${currentTree.gs_xj}cm` : "暂无" }}</div>
                    <div class="thead">株高</div>
                    <div class="tbody">{{ currentTree.gs_zg ? `${currentTree.gs_zg}m` : "暂无" }}</div>
                    <div class="thead">数目</div>
                    <div class="tbody">{{ currentTree.gs_sm || "暂无" }}株</div>
                  </div>
                  <div class="table">
                    <div class="thead">种名</div>
                    <div class="tbody">{{ currentTree.zhongmc || "暂无" }}</div>
                    <div class="thead">树龄</div>
                    <div class="tbody">{{ currentTree.gs_sl || "暂无" }}年</div>
                    <div class="thead">级别</div>
                    <div class="tbody">{{ currentTree.plevel || "暂无" }}</div>
                  </div>
                </div>
                <div class="btns">
                  <div
                    class="btn"
                    @click="toLocation"
                  >
                    <img
                      :src="$fun.getImg('backgroundResources/b8.png')"
                      alt=""
                    />
                    地图定位
                  </div>
                  <div
                    class="btn"
                    @click="showBaseDetails = true"
                  >
                    <img
                      :src="$fun.getImg('backgroundResources/b9.png')"
                      alt=""
                    />
                    查看详情
                  </div>
                </div>
              </div>
            </template>
          </BasePanel>
        </div>
      </transition-group>
    </div>
    <Modal
      id="baseDetails"
      v-model:show="showOldAndFamousTreesData"
      disable-zoom
      :close-on-click-modal="false"
    >
      <template v-slot:container>
        <AllArchives />
      </template>
    </Modal>
    <Modal
      v-model:show="showBaseDetails"
      disable-zoom
      :close-on-click-modal="false"
    >
      <template v-slot:container>
        <BaseDetails :data="currentTree" />
      </template>
    </Modal>
    <Modal
      v-model:show="showProblemReport"
      disable-zoom
      :close-on-click-modal="false"
    >
      <template v-slot:container>
        <ProblemReport />
      </template>
    </Modal>
    <div
      class="map-box"
      id="map"
    >
      <MapPopup
        ref="popup"
        :type="1"
        format-name="古树名木"
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
.old-and-famous-trees {
  position: relative;
  width: 100%;
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
    .analysis-btn {
      display: flex;
      flex-direction: column;
      gap: 0.7813vw;
      width: 4.0104vw;
    }
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
    width: 39.0625vw;
    .contain {
      display: flex;
      height: 100%;
    }
  }
  .section2 {
    flex: 1;
    .contain {
      display: flex;
      gap: 0.4167vw;
      height: 100%;
      .left-box {
        width: 10.4167vw;
        padding-top: 20px;
        background: url("@/assets/images/backgroundResources/b1.png") no-repeat center center / 9.6354vw 204px;
        .title {
          text-align: center;
          font-size: 0.7292vw;
          color: #fff;
          line-height: 60px;
        }
      }
      .right-box {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        color: #d8ebfd;
        font-size: 0.7292vw;
        .item {
          height: 80px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 0.5208vw;
          padding-left: 30px;
          background: url("@/assets/images/backgroundResources/b2.png") no-repeat left center / 22px 76px;
          .title {
            display: flex;
            align-items: center;
            gap: 0.5208vw;
            .num {
              width: 24px;
              text-align: center;
              font-size: 0.625vw;
              &.num1 {
                color: #fbe048;
                background: url("@/assets/images/backgroundResources/b3.png") no-repeat center bottom / 100% 6px;
              }
              &.num2 {
                color: #91c3f4;
                background: url("@/assets/images/backgroundResources/b4.png") no-repeat center bottom / 100% 6px;
              }
              &.num3 {
                color: #fe947e;
                background: url("@/assets/images/backgroundResources/b5.png") no-repeat center bottom / 100% 6px;
              }
            }
          }
          .table {
            display: flex;
            line-height: 1.5em;
            width: fit-content;
            border-radius: 0.1042vw;
            overflow: hidden;
            .thead {
              padding: 3px 0.5208vw;
              background-color: #194570;
            }
            .tbody {
              padding: 3px 0.5208vw;
              background-color: #193653;
            }
          }
        }
      }
    }
  }
  .section3 {
    flex: 1;
    .contain {
      padding: 0.5208vw;
      height: 100%;
      background: url("@/assets/images/backgroundResources/c1.svg") no-repeat center center / 100% 100%;
      .chart-box {
        position: relative;
        height: 80%;
        .bubble-animation {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
      }
    }
  }
  .section4 {
    height: 305px;
    .contain {
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      position: relative;
      padding: 0.5208vw 1.0417vw;
      height: 100%;
      font-size: 0.625vw;
      .left-arrow {
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 1.0417vw;
        height: 1.0417vw;
        background: url("@/assets/images/backgroundResources/b6.png") no-repeat center center / 100% 100%;
        cursor: pointer;
      }
      .right-arrow {
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 1.0417vw;
        height: 1.0417vw;
        background: url("@/assets/images/backgroundResources/b7.png") no-repeat center center / 100% 100%;
        cursor: pointer;
      }
      .info-box {
        width: fit-content;
        height: 100px;
        display: flex;
        color: #d8ebfd;
        .el-image {
          width: 100px;
          height: 100px;
          margin-right: 0.625vw;
          border-radius: 8px;
          overflow: hidden;
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
        .info {
          width: 10.4167vw;
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          .name {
            height: 20px;
            line-height: 20px;
            font-size: 0.8333vw;
            color: #fff;
            margin: 6px 0;
            padding-left: 10px;
            background: url("@/assets/images/backgroundResources/b10.png") no-repeat left center / 157px 19px;
          }
          .con {
            display: flex;
            flex-wrap: wrap;
            font-size: 0.7292vw;
            span {
              width: 50%;
              height: 24px;
              line-height: 24px;
            }
          }
        }
      }
      .list {
        display: flex;
        flex-direction: column;
        align-items: center;
        .table {
          width: 100%;
          display: flex;
          line-height: 1.5em;
          border-radius: 0.1042vw;
          overflow: hidden;
          .thead {
            width: 2.0833vw;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 30px;
            background-color: #1e3f55;
          }
          .tbody {
            flex: 1;
            text-align: center;
            background-color: #162c44;
            height: 30px;
            padding: 0 3px;
            line-height: 30px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }
      .btns {
        display: flex;
        justify-content: space-evenly;
        color: #2aeaf7;
        .btn {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.2083vw;
          padding: 0.1563vw 0.3125vw;
          border-radius: 0.1042vw;
          border: 1px solid #2aeaf7;
          cursor: pointer;
          img {
            width: 0.7292vw;
          }
        }
      }
    }
  }
}
</style>
<style lang="scss">
.old-and-famous-trees {
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
}
</style>
