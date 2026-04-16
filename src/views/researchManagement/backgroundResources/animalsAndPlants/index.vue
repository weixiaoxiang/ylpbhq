<script lang="ts" setup>
import {
  GetAnimalsPlantsListByPage,
  GetAnimalsPlantsStatisticalAnalysis_Bhdj,
  GetAnimalsPlantsStatisticalAnalysis_Wzzp,
  GetAnimalsPlantsStatisticalAnalysis_Zwzl,
  GetInterface
} from "@/api"
// @ts-expect-error 缺少类型声明
import { vue3ScrollSeamless } from "vue3-scroll-seamless"
import BaseDetail from "./BaseDetail.vue"
import DataAnalysis from "./DataAnalysis.vue"
import DataTable from "./DataTable.vue"
import SpeciesQuery from "./SpeciesQuery.vue"
const proxy = getCurrentInstance()!.proxy as any
const { showCSB } = storeToRefs(useConfigStore())
const changePanelTitleType = (type: string) => {
  if (type === "保护等级-更多") {
    dataTableType.value = ""
    showDataTable.value = true
  }
}
// 动植物详情弹框信息
const info = ref<any>({})
const openBaseDetail = async (data: any) => {
  const { response } = await GetInterface({
    ssmk: "地图弹框详情",
    layerid: data.treeid,
    id: data.id
  })
  response.response.filelist = response.fileslist
  response.response.hwxjfilelist = response.hwxjfilelist
  info.value = response.response
  showBaseDetail.value = true
}
const popup = ref<any>(null)
const modular = ref("动植物监测")
const {
  closePopup,
  popupInfo,
  locationMap,
  map,
  vectorFeatures,
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
  vectorLayerDeclutter: true,
  vectorLayerMode: "vectorImage",
  showClusterLayer: true,
  callBack: {
    // 地图点击动植物弹出详情弹框
    click: openBaseDetail
  }
})

// 获得植物种类
const plantData = ref<any[]>([])
const getPlantData = async () => {
  const { response } = await GetAnimalsPlantsStatisticalAnalysis_Zwzl({
    type: "植物"
  })
  plantData.value = response
}
// 获得动物种类
const animalData = ref<any>({})
const getAnimalData = async () => {
  const { response } = await GetAnimalsPlantsStatisticalAnalysis_Zwzl({
    type: "动物"
  })
  animalData.value = {
    lx: response.find((item: any) => item.name === "两栖动物")?.value ?? "",
    yl: response.find((item: any) => item.name === "鱼类动物")?.value ?? "",
    px: response.find((item: any) => item.name === "爬行动物")?.value ?? "",
    nl: response.find((item: any) => item.name === "鸟类")?.value ?? "",
    qt: response.find((item: any) => item.name === "其他无脊椎动物")?.value ?? "",
    kc: response.find((item: any) => item.name === "昆虫")?.value ?? "",
    br: response.find((item: any) => item.name === "哺乳动物")?.value ?? ""
  }
  animalData.value.total = Object.values(animalData.value)
    .filter((val) => typeof val === "number")
    .reduce((sum, val) => sum + val, 0)
}

// 获得保护等级、珍稀物种数据
const bhdjData = ref<any>({})
const zxwzData = ref<any[]>([])
const getZxwzData = async () => {
  const { response } = await GetAnimalsPlantsStatisticalAnalysis_Bhdj()
  bhdjData.value = response
  // zxwzData.value = [{}, {}, {}, {}, {}, {}]
  const { response: data1 } = await GetAnimalsPlantsListByPage({
    remark: "珍稀动物",
    page: 1,
    intPageSize: 20
  })
  const { response: data2 } = await GetAnimalsPlantsListByPage({
    remark: "珍稀植物",
    page: 1,
    intPageSize: 20
  })
  zxwzData.value = [...data1.data, ...data2.data]
}
// 查看珍稀物种详情
const viewZxwz = (event: any) => {
  // 判断是否为img
  if (event.target.tagName === "IMG") {
    const id = event.target.getAttribute("data-id")
    info.value = zxwzData.value.find((item: any) => item.id === Number(id))
    console.log(info.value, 11)

    handleShowBaseDetail()
  }
}

// 获得物种抓拍图片
const wzzpData = ref<any[]>([])
const getWzzpData = async () => {
  const { response } = await GetAnimalsPlantsStatisticalAnalysis_Wzzp()
  wzzpData.value = response.splice(0, 6)
}
// 预览物种抓拍图片
const preview = (url: string) => {
  u.showPreviewImg(0, [url])
}

// 显示动植物详情弹框
const showBaseDetail = ref(false)
const handleShowBaseDetail = () => {
  showBaseDetail.value = true
}

// 显示动植物数据表格
const showDataTable = ref(false)
const dataTableType = ref("动物")
const handleShowDataTable = (type: string) => {
  dataTableType.value = type
  showDataTable.value = true
}
// 显示物种数据分析
const showDataAnalysis = ref(false)
const handleShowDataAnalysis = () => {
  showDataAnalysis.value = true
}

// 显示物种查询
const showSpeciesQuery = ref(false)
const handleShowSpeciesQuery = () => {
  showSpeciesQuery.value = true
}
const { setVariable } = useCssVariables()
onMounted(() => {
  setVariable("maptool-sidebar-right", "calc(21.875vw + 40px)") // 设置地图工具栏距右侧距离
  setVariable("maptool-sidebar-bottom", "calc(305px + 40px)") // 设置地图工具栏距底部距离
  proxy.$mitt.on("changePanelTitleType", changePanelTitleType)
  getPlantData() // 获取植物种类
  getAnimalData() // 获取动物种类
  getZxwzData() // 获取珍稀物种数据
  getWzzpData() // 获取物种抓拍图片
})
onBeforeUnmount(() => {
  proxy.$mitt.off("changePanelTitleType", changePanelTitleType)
})
</script>
<template>
  <div class="animals-and-plants">
    <div class="section-bar">
      <MapFeatureSearch
        :features="vectorFeatures"
        @location="locationMap"
      />
      <MapLayerManage
        :modular="modular"
        :init-checked-keys="[35]"
        :测="false"
        :declutter="true"
        :cluster="true"
        @addLayer="addLayerManageData"
        @removeLayer="removeLayerManageData"
        @setDeclutter="setDeclutter"
        @setCluster="setCluster"
      />
      <div class="analysis-btn">
        <img
          :src="$fun.getImg('researchManagement/analysis-btn.png')"
          alt=""
          @click="handleShowDataAnalysis"
        />
        <img
          :src="$fun.getImg('backgroundResources/analysis-btn1.png')"
          alt=""
          @click="handleShowSpeciesQuery"
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
          <BasePanel title="植物种类">
            <template #contain>
              <div class="contain">
                <ChartPanel1
                  unit="种"
                  :colors="['#2fe4ab', '#eedc2a', '#42d9f4']"
                  :data="plantData"
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
          <BasePanel title="动物种类">
            <template #contain>
              <div class="contain">
                <div class="item-count">
                  <span>总数</span>
                  <span class="value">{{ animalData.total }}种</span>
                </div>
                <div class="item">
                  <div class="img-box">
                    <img
                      class="circle"
                      :src="$fun.getImg('backgroundResources/dwwz-circle.png')"
                      alt=""
                    />
                    <img
                      :src="$fun.getImg('backgroundResources/dwwz-img1.png')"
                      alt=""
                    />
                  </div>
                  <div class="text-box">
                    <div>鸟类</div>
                    <div class="value">{{ animalData.nl }}种</div>
                  </div>
                </div>
                <div class="item">
                  <div class="img-box">
                    <img
                      class="circle"
                      :src="$fun.getImg('backgroundResources/dwwz-circle.png')"
                      alt=""
                    />
                    <img
                      class="circle"
                      :src="$fun.getImg('backgroundResources/dwwz-circle.png')"
                      alt=""
                    />
                    <img
                      :src="$fun.getImg('backgroundResources/dwwz-img2.png')"
                      alt=""
                    />
                  </div>
                  <div class="text-box">
                    <div>无脊椎动物</div>
                    <div class="value">{{ animalData.qt }}种</div>
                  </div>
                </div>
                <div class="item">
                  <div class="img-box">
                    <img
                      class="circle"
                      :src="$fun.getImg('backgroundResources/dwwz-circle.png')"
                      alt=""
                    />
                    <img
                      :src="$fun.getImg('backgroundResources/dwwz-img3.png')"
                      alt=""
                    />
                  </div>
                  <div class="text-box">
                    <div>爬行类</div>
                    <div class="value">{{ animalData.px }}种</div>
                  </div>
                </div>
                <div class="item">
                  <div class="img-box">
                    <img
                      class="circle"
                      :src="$fun.getImg('backgroundResources/dwwz-circle.png')"
                      alt=""
                    />
                    <img
                      :src="$fun.getImg('backgroundResources/dwwz-img4.png')"
                      alt=""
                    />
                  </div>
                  <div class="text-box">
                    <div>两栖类</div>
                    <div class="value">{{ animalData.lx }}种</div>
                  </div>
                </div>
                <div class="item">
                  <div class="img-box">
                    <img
                      class="circle"
                      :src="$fun.getImg('backgroundResources/dwwz-circle.png')"
                      alt=""
                    />
                    <img
                      :src="$fun.getImg('backgroundResources/dwwz-img5.png')"
                      alt=""
                    />
                  </div>
                  <div class="text-box">
                    <div>哺乳类</div>
                    <div class="value">{{ animalData.br }}种</div>
                  </div>
                </div>
                <div class="item">
                  <div class="img-box">
                    <img
                      class="circle"
                      :src="$fun.getImg('backgroundResources/dwwz-circle.png')"
                      alt=""
                    />
                    <img
                      :src="$fun.getImg('backgroundResources/dwwz-img6.png')"
                      alt=""
                    />
                  </div>
                  <div class="text-box">
                    <div>昆虫类</div>
                    <div class="value">{{ animalData.kc }}种</div>
                  </div>
                </div>
                <div class="item">
                  <div class="img-box">
                    <img
                      class="circle"
                      :src="$fun.getImg('backgroundResources/dwwz-circle.png')"
                      alt=""
                    />
                    <img
                      :src="$fun.getImg('backgroundResources/dwwz-img7.png')"
                      alt=""
                    />
                  </div>
                  <div class="text-box">
                    <div>鱼类</div>
                    <div class="value">{{ animalData.yl }}种</div>
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
          <BasePanel
            title="保护等级"
            :btns="['更多']"
          >
            <template #contain>
              <div class="contain">
                <div class="box1">
                  <img
                    :src="$fun.getImg('backgroundResources/bhdj-img1.png')"
                    alt=""
                  />
                  <div class="text-box">
                    <div class="dj">国家Ⅰ级</div>
                    <div @click="handleShowDataTable('国家Ⅰ级动物')">
                      动物<span class="value">{{ bhdjData.oneanimalcount }}种</span>
                    </div>
                    <div @click="handleShowDataTable('国家Ⅰ级植物')">
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
                    <div @click="handleShowDataTable('国家Ⅱ级动物')">
                      动物<span class="value">{{ bhdjData.twoanimalcount }}种</span>
                    </div>
                    <div @click="handleShowDataTable('国家Ⅱ级植物')">
                      植物<span class="value">{{ bhdjData.twoplantcount }}种</span>
                    </div>
                  </div>
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
          <BasePanel title="珍稀物种">
            <template #contain>
              <div class="contain">
                <div class="box1">
                  <div @click="handleShowDataTable('珍稀动物')">
                    <div class="img-box">
                      <img
                        :src="$fun.getImg('backgroundResources/zxwz-icon1.png')"
                        alt=""
                      />
                      珍稀动物
                    </div>
                    <div>
                      <span calss="value">{{ bhdjData.zxanimalcount }}</span
                      >种
                    </div>
                  </div>
                  <div @click="handleShowDataTable('珍稀植物')">
                    <div class="img-box">
                      <img
                        :src="$fun.getImg('backgroundResources/zxwz-icon2.png')"
                        alt=""
                      />
                      珍稀植物
                    </div>
                    <div>
                      <span calss="value">{{ bhdjData.zxplantcount }}</span
                      >种
                    </div>
                  </div>
                </div>
                <div
                  class="box2"
                  @click="viewZxwz"
                >
                  <template v-if="zxwzData?.length > 0">
                    <vue3ScrollSeamless
                      class="scroll-wrap"
                      :classOptions="{ step: 0.1, direction: 2 }"
                      :dataList="zxwzData"
                    >
                      <ul class="ui-wrap-zxwz">
                        <li
                          class="li-item"
                          v-for="item of zxwzData"
                          :key="item.id"
                        >
                          <div class="li-img">
                            <img
                              :src="item.filelist?.[0]?.filepath ? '/statisUrl/' + item.filelist?.[0]?.filepath : ''"
                              alt=""
                              :data-id="item.id"
                            />
                          </div>
                          <div class="name">{{ item.mc }}</div>
                        </li>
                      </ul>
                    </vue3ScrollSeamless>
                  </template>
                  <EmptyData
                    v-else
                    :image-size="60"
                    :font-size="14"
                  />
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
          <BasePanel title="物种抓拍图片">
            <template #contain>
              <div class="contain">
                <div
                  v-for="item of wzzpData"
                  :key="item.id"
                  class="item"
                  @click="preview('/statisUrl/' + item.filepath)"
                >
                  <div class="img-box">
                    <img
                      :src="'/statisUrl/' + item.filepath"
                      alt=""
                    />
                  </div>
                  <div class="name">{{ item.filename }}</div>
                </div>
              </div>
            </template>
          </BasePanel>
        </div>
      </transition-group>
    </div>
    <Modal
      id="baseDetail"
      v-model:show="showBaseDetail"
      disable-zoom
      :close-on-click-modal="false"
    >
      <template v-slot:container>
        <BaseDetail :data="info" />
      </template>
    </Modal>
    <Modal
      id="dataPanel1"
      v-model:show="showDataTable"
      disable-zoom
      :close-on-click-modal="false"
    >
      <template v-slot:container>
        <DataTable :type="dataTableType" />
      </template>
    </Modal>
    <Modal
      v-model:show="showDataAnalysis"
      disable-zoom
      :close-on-click-modal="false"
    >
      <template v-slot:container>
        <DataAnalysis />
      </template>
    </Modal>
    <Modal
      id="dataPanel"
      v-model:show="showSpeciesQuery"
      disable-zoom
      :close-on-click-modal="false"
    >
      <template v-slot:container>
        <SpeciesQuery />
      </template>
    </Modal>
    <div
      class="map-box"
      id="map"
    >
      <MapPopup
        ref="popup"
        :type="1"
        format-name="动植物监测"
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
.animals-and-plants {
  position: relative;
  width: 100%;
  height: 100%;
  .map-box {
    position: relative;
    width: 100%;
    height: 100%;
  }
  :deep(.section-bar) {
    position: absolute;
    top: 20px;
    right: var(--maptool-sidebar-right);
    display: flex;
    gap: 15px;
    height: 32px;
    transition: all 0.3s ease-in-out;
    z-index: 1;
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
    width: 445px;
    .contain {
      display: flex;
      height: 100%;
    }
  }
  .section2 {
    flex: 1;
    .contain {
      position: relative;
      display: flex;
      height: 100%;
      background: url("@/assets/images/backgroundResources/dwwz-img.svg") no-repeat center center / 310px 190px;
      .item {
        position: absolute;
        display: flex;

        .img-box {
          position: relative;
          width: 4.6875vw;
          height: 4.6875vw;
          display: flex;
          align-items: center;
          justify-content: center;
          .circle {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            animation: rotate 10s linear infinite;
          }
          img {
            width: 40%;
          }
        }
        .text-box {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 0.5208vw;
          font-size: 0.8333vw;
          .value {
            font-size: 0.9375vw;
            font-weight: 600;
            color: #45ffff;
          }
        }
        &:nth-child(1) {
          top: 30px;
          left: 5%;
        }
        &:nth-child(2) {
          top: 8px;
          left: 24%;
        }
        &:nth-child(3) {
          bottom: 20px;
          left: 2%;
        }
        &:nth-child(4) {
          bottom: 20px;
          left: 22%;
        }
        &:nth-child(5) {
          top: 15px;
          right: 20%;
        }
        &:nth-child(6) {
          top: 35px;
          right: 0;
        }
        &:nth-child(7) {
          bottom: 20px;
          right: 10%;
        }
      }
      .item-count {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        bottom: 3vw;
        font-size: 0.9375vw;
        color: #fff;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background-color: rgba(0, 0, 0, 0.5);
        padding: 5px 10px;
        border-radius: 5px;
        .value {
          font-size: 1.25vw;
          color: #45ffff;
        }
      }
    }
  }
  .section3 {
    height: 20vh;
    .contain {
      height: 100%;
      display: flex;
      align-items: center;
      font-size: 0.7292vw;
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
  }
  .section4 {
    height: 27vh;
    .contain {
      height: 100%;
      display: flex;
      flex-direction: column;
      .box1 {
        display: flex;
        gap: 0.5208vw;
        > div {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 10.2083vw;
          height: 68px;
          background: url("@/assets/images/backgroundResources/zxwz-img1.png") no-repeat center center / 100% 100%;
          font-size: 12px;
          padding: 0 0.5208vw;
          color: #d3dedf;
          cursor: pointer;
          .img-box {
            display: flex;
            align-items: center;
            gap: 0.3125vw;
            img {
              margin-top: -0.5208vw;
            }
          }
          .value {
            font-size: 0.8333vw;
            color: #73e0e1;
            margin-right: 0.1563vw;
          }
          &:nth-child(2) {
            background: url("@/assets/images/backgroundResources/zxwz-img2.png") no-repeat center center / 100% 100%;
          }
        }
      }
      .box2 {
        position: relative;
        flex: 1;
        display: flex;
        align-items: center;
        margin-top: 6px;
        overflow: hidden;
      }
    }
  }
  .section5 {
    flex: 1;
    .contain {
      padding: 0.5208vw;
      height: 100%;
      display: flex;
      justify-content: space-between;
      align-content: space-between;
      flex-wrap: wrap;
      .item {
        .img-box {
          width: 8.9583vw;
          height: 4.0104vw;
          transform: skew(-15deg); // 添加倾斜效果形成平行四边形
          border: 2px solid #5ed0ef; // 蓝色边框
          box-shadow: 0 0 10px 2px rgba(89, 192, 222, 0.3); // 蓝色阴影
          overflow: hidden; // 确保内容不超出边界
          img {
            width: 100%;
            height: 100%;
            object-fit: fill;
            transform: scale(1.2) skew(15deg); // 图片反向倾斜，抵消容器的倾斜效果
          }
        }
        .name {
          text-align: center;
          color: #20d2d4;
          line-height: 2em;
          font-size: 0.8333vw;
        }
      }
    }
  }
  :deep(.scroll-wrap) {
    .ui-wrap-zxwz {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      gap: 0.4167vw;
      .li-item {
        position: relative;
        width: 6.7708vw;
        height: 6.7708vw;
        background: url("@/assets/images/backgroundResources/zxwz-img3.png") no-repeat center center / 100% 100%;
        .li-img {
          position: absolute;
          top: 1.875vw;
          left: 1.9792vw;
          width: 3.5417vw;
          height: 2.1875vw;
          border-radius: 50%;
          transform: rotate(39deg);
          overflow: hidden;
          cursor: pointer;
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transform: rotate(-34deg); // 抵消父元素的旋转，使图片保持正常
            scale: 1.3; // 稍微放大图片以避免旋转时出现空白边角
          }
        }
        .name {
          position: absolute;
          bottom: 10px;
          left: 0;
          width: 100%;
          text-align: center;
          color: #20d2d4;
        }
      }
    }
  }
  // 定义旋转360度动画
  @keyframes rotate {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
}
</style>
<style lang="scss">
.animals-and-plants {
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
  .status1 {
    color: #fff;
    padding: 0px 10px;
    background-color: #26c353;
    border-radius: 20px;
  }
}
</style>
