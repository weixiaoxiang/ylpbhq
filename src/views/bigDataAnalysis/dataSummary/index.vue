<script lang="ts" setup>
import {
  GetALargeScreenDataProfiling_FaceCarGk,
  GetALargeScreenDataProfiling_Jcgk,
  GetALargeScreenDataProfiling_Jcss,
  GetALargeScreenDataProfiling_Qxszsj,
  GetALargeScreenDataProfiling_Tdlyx,
  GetALargeScreenDataProfiling_Xhgk,
  GetAnimalsPlantsStatisticalAnalysis_Bhdj,
  GetPestEquipment_Jdhcljsjtj
} from "@/api"
import CountUp from "vue-countup-v3"
const proxy = getCurrentInstance()!.proxy as any
const { showCSB } = storeToRefs(useConfigStore())
const popup = ref<any>(null)
const {
  map,
  popupInfo,
  popupFormatType,
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

// 生物多样性数据
const bhdjData = ref<any>({})
const getZxwzData = async () => {
  const { response } = await GetAnimalsPlantsStatisticalAnalysis_Bhdj()
  bhdjData.value = response
}

// 八大害虫累计数量
const chartData2 = ref<any[]>([])
const getChartData2 = async () => {
  const { response } = await GetPestEquipment_Jdhcljsjtj()
  chartData2.value = response.map((item: any) => ({
    name: item.xAxis,
    value: item.yAxis
  }))
}

// 获得人车概况数据
const rcgkData = ref<any>({
  carLjCount: 0,
  faceLjCount: 0,
  ljgetinitCount: 0,
  ljgetoutCount: 0
})
const getRcgkData = async () => {
  const { response } = await GetALargeScreenDataProfiling_FaceCarGk()
  rcgkData.value = response
}

// 获得基础概况数据
const jcgkData = ref<any>({})
const getJcgkData = async () => {
  const { response } = await GetALargeScreenDataProfiling_Jcgk()
  jcgkData.value = {
    slfgl: response.find((item: any) => item.name === "森林覆盖率")?.value?.toFixed(0),
    zmj: response.find((item: any) => item.name === "总面积")?.value?.toFixed(0),
    ldl: response.find((item: any) => item.name === "林地率")?.value?.toFixed(0)
  }
}

// 获得基础设施数据
const jcssData = ref<any>({})
const getJcssData = async () => {
  const { response } = await GetALargeScreenDataProfiling_Jcss()
  jcssData.value = {
    xjg: response.find((item: any) => item.name === "宣教馆")?.value?.toFixed(0),
    jb: response.find((item: any) => item.name === "界碑")?.value,
    zs: response.find((item: any) => item.name === "界桩")?.value,
    zp: response.find((item: any) => item.name === "指示牌")?.value,
    qc: response.find((item: any) => item.name === "气象观测站")?.value
  }
}

// 获得土地利用现状数据
const chartData1 = ref<any>(null)
const getTdlyxData = async () => {
  const { response } = await GetALargeScreenDataProfiling_Tdlyx()
  if (response?.length > 0) {
    response.forEach((item: any) => {
      // 字段前两位
      item.name = item.name.slice(0, 2)
      item.value = item.value.toFixed(0)
    })
    chartData1.value = response
  } else {
    chartData1.value = null
  }
}

// 获得巡护概况数据
const xhgkData = ref<any>({})
const getXhgkData = async () => {
  const { response } = await GetALargeScreenDataProfiling_Xhgk()
  xhgkData.value = response
}

// 获得气象数据
const qxData = ref<any>({})
const getQxData = async () => {
  const { response } = await GetALargeScreenDataProfiling_Qxszsj()
  qxData.value = response
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
  getZxwzData() // 获取生物多样性数据
  getChartData2() // 获取八大害虫累计数量
  getRcgkData() // 获得人车概况数据
  getJcgkData() // 获得基础概况数据
  getJcssData() // 获得基础设施数据
  getTdlyxData() // 获得土地利用现状数据
  getXhgkData() // 获得巡护概况数据
  getQxData() // 获得气象数据
})
</script>

<template>
  <div class="data-summary">
    <div class="section-bar">
      <MapFeatureSearch
        :features="vectorFeatures"
        @location="locationMap"
      />
      <MapLayerManage
        :init-checked-keys="[34]"
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
          <BasePanel title="基础概况">
            <template #contain>
              <div class="contain">
                <img
                  :src="$fun.getImg('bigDataAnalysis/i20.png')"
                  alt=""
                />
                <img
                  :src="$fun.getImg('bigDataAnalysis/i21.png')"
                  alt=""
                />
                <img
                  :src="$fun.getImg('bigDataAnalysis/i20.png')"
                  alt=""
                />
                <div class="box1 box-bg">森林覆盖率</div>
                <div class="box2 box-bg">总面积</div>
                <div class="box3 box-bg">林地率</div>
                <div class="box4">{{ jcgkData.slfgl }}%</div>
                <div class="box5">{{ jcgkData.zmj }}hm²</div>
                <div class="box6">{{ jcgkData.ldl }}%</div>
              </div>
            </template>
          </BasePanel>
        </div>
        <div
          v-show="showCSB"
          class="section2"
          key="section2"
        >
          <BasePanel title="基础设施">
            <template #contain>
              <div class="contain">
                <div class="box">
                  <img
                    :src="$fun.getImg('bigDataAnalysis/i24.png')"
                    alt=""
                  />
                  <div class="value-box">
                    <span>{{ jcssData.xjg }}</span
                    >㎡
                  </div>
                  <div class="text-box">宣教馆</div>
                </div>
                <div class="box">
                  <img
                    :src="$fun.getImg('bigDataAnalysis/i25.png')"
                    alt=""
                  />
                  <div class="value-box">
                    <span>{{ jcssData.jb }}</span
                    >个
                  </div>
                  <div class="text-box">界碑</div>
                </div>
                <div class="box">
                  <img
                    :src="$fun.getImg('bigDataAnalysis/i26.png')"
                    alt=""
                  />
                  <div class="value-box">
                    <span>{{ jcssData.zs }}</span
                    >个
                  </div>
                  <div class="text-box">界桩</div>
                </div>
                <div class="box">
                  <img
                    :src="$fun.getImg('bigDataAnalysis/i27.png')"
                    alt=""
                  />
                  <div class="value-box">
                    <span>{{ jcssData.zp }}</span
                    >个
                  </div>
                  <div class="text-box">指示牌</div>
                </div>
                <div class="box">
                  <img
                    :src="$fun.getImg('bigDataAnalysis/i28.png')"
                    alt=""
                  />
                  <div class="value-box">
                    <span>{{ jcssData.qc }}</span
                    >个
                  </div>
                  <div class="text-box">气象观测站</div>
                </div>
              </div>
            </template>
          </BasePanel>
        </div>
        <div
          v-show="showCSB"
          class="section3"
          key="section3"
        >
          <BasePanel title="土地利用现状">
            <template #contain>
              <div class="contain">
                <ChartPanel6
                  dw="hm²"
                  :colors="['#00e3ff', '#d0ae3e']"
                  :data="chartData1"
                />
              </div>
            </template>
          </BasePanel>
        </div>
        <div
          v-show="showCSB"
          class="section4"
          key="section4"
        >
          <BasePanel title="生物多样性">
            <template #contain>
              <div class="contain">
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
            </template></BasePanel
          >
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
          class="section5"
          key="section5"
        >
          <BasePanel title="人车概况">
            <template #contain>
              <div class="contain">
                <div class="box1">
                  <span class="title">实时累计车辆</span>
                  <span class="value"><count-up :end-val="rcgkData.carLjCount"></count-up>辆</span>
                </div>
                <img
                  class="arrow"
                  :src="$fun.getImg('bigDataAnalysis/i52.png')"
                  alt=""
                />
                <div class="box2">
                  <div class="item">
                    <img
                      :src="$fun.getImg('bigDataAnalysis/i53.png')"
                      alt=""
                    />
                    <div class="item-con">
                      <div class="title">今日累计抓拍人数</div>
                      <div class="value value1"><count-up :end-val="rcgkData.faceLjCount"></count-up>人</div>
                    </div>
                  </div>
                  <div class="item">
                    <img
                      :src="$fun.getImg('bigDataAnalysis/i54.png')"
                      alt=""
                    />
                    <div class="item-con">
                      <div class="title">今日累计进场车辆</div>
                      <div class="value value2"><count-up :end-val="rcgkData.ljgetinitCount"></count-up>辆</div>
                    </div>
                  </div>
                  <div class="item">
                    <img
                      :src="$fun.getImg('bigDataAnalysis/i55.png')"
                      alt=""
                    />
                    <div class="item-con">
                      <div class="title">今日累计出场车辆</div>
                      <div class="value value3"><count-up :end-val="rcgkData.ljgetoutCount"></count-up>辆</div>
                    </div>
                  </div>
                </div>
              </div>
            </template></BasePanel
          >
        </div>
        <div
          v-show="showCSB"
          class="section6"
          key="section6"
        >
          <BasePanel title="气象数据">
            <template #contain>
              <div class="contain">
                <div class="item">
                  <img
                    class="img1"
                    :src="$fun.getImg('bigDataAnalysis/i43.png')"
                    alt=""
                  />
                  <div class="item-con">
                    <div class="value1">{{ qxData.AQI }}</div>
                    <div>AQI</div>
                  </div>
                </div>
                <div class="item">
                  <img
                    class="img2"
                    :src="$fun.getImg('bigDataAnalysis/i44.png')"
                    alt=""
                  />
                  <div class="item-con">
                    <div class="value2">{{ qxData.PM }}<span>ug/m²</span></div>
                    <div>PM2.5</div>
                  </div>
                </div>
                <div class="item">
                  <img
                    class="img2"
                    :src="$fun.getImg('bigDataAnalysis/i45.png')"
                    alt=""
                  />
                  <div class="item-con">
                    <div class="value2">
                      {{ qxData.wd }}
                      <span>℃</span>
                    </div>
                    <div>温度</div>
                  </div>
                </div>
                <div class="item">
                  <img
                    class="img2"
                    :src="$fun.getImg('bigDataAnalysis/i46.png')"
                    alt=""
                  />
                  <div class="item-con">
                    <div class="value2">
                      {{ qxData.sd }}
                      <span>%</span>
                    </div>
                    <div>湿度</div>
                  </div>
                </div>
                <div class="item">
                  <img
                    class="img1"
                    :src="$fun.getImg('bigDataAnalysis/i47.png')"
                    alt=""
                  />
                  <div class="item-con">
                    <div class="value1">{{ qxData.WQI }}</div>
                    <div>WQI</div>
                  </div>
                </div>
                <div class="item">
                  <img
                    class="img2"
                    :src="$fun.getImg('bigDataAnalysis/i49.png')"
                    alt=""
                  />
                  <div class="item-con">
                    <div class="value2">
                      {{ qxData.rjy }}
                      <span>mg/L</span>
                    </div>
                    <div>溶解氧</div>
                  </div>
                </div>
                <div class="item">
                  <img
                    class="img2"
                    :src="$fun.getImg('bigDataAnalysis/i48.png')"
                    alt=""
                  />
                  <div class="item-con">
                    <div class="value2">
                      {{ qxData.sw }}
                      <span>℃</span>
                    </div>
                    <div>水温</div>
                  </div>
                </div>
                <div class="item">
                  <img
                    class="img2"
                    :src="$fun.getImg('bigDataAnalysis/i50.png')"
                    alt=""
                  />
                  <div class="item-con">
                    <div class="value2">
                      {{ qxData.zd }}
                      <span>NTU</span>
                    </div>
                    <div>浊度</div>
                  </div>
                </div>
              </div>
            </template>
          </BasePanel>
        </div>
        <div
          v-show="showCSB"
          class="section7"
          key="section7"
        >
          <BasePanel title="巡护概况">
            <template #contain>
              <div class="contain">
                <div class="box1">
                  当日统计 <span>{{ xhgkData.xhrsCount || 0 }}人</span>
                </div>
                <div class="box2">
                  <div class="item">
                    <img
                      :src="$fun.getImg('bigDataAnalysis/i40.png')"
                      alt=""
                    />
                    <div class="item-con">
                      <div>巡护次数</div>
                      <div>
                        已完成<span>{{ xhgkData.xhcsCount || 0 }}</span> 次
                      </div>
                    </div>
                  </div>
                  <div class="item">
                    <img
                      :src="$fun.getImg('bigDataAnalysis/i41.png')"
                      alt=""
                    />
                    <div class="item-con">
                      <div>巡护公里</div>
                      <div>
                        已完成<span>{{ xhgkData.xhglCount || 0 }}</span> km
                      </div>
                    </div>
                  </div>
                  <div class="item">
                    <img
                      :src="$fun.getImg('bigDataAnalysis/i56.png')"
                      alt=""
                    />
                    <div class="item-con">
                      <div>巡护时长</div>
                      <div>
                        已完成<span>{{ xhgkData.xhscCount || 0 }}</span> h
                      </div>
                    </div>
                  </div>
                </div>
              </div></template
            ></BasePanel
          >
        </div>
        <div
          v-show="showCSB"
          class="section8"
          key="section8"
        >
          <BasePanel title="八大害虫累计数量">
            <template #contain>
              <div class="contain">
                <ChartPanel7
                  unit="只"
                  :data="chartData2"
                />
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
.data-summary {
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
    height: 30%;
    .contain {
      position: relative;
      height: 100%;
      display: flex;
      justify-content: space-evenly;
      color: #d8ebfd;
      font-size: 0.7292vw;
      img:nth-child(1),
      img:nth-child(3) {
        width: 5.0521vw;
        height: 83px;
        align-self: center;
      }
      img:nth-child(2) {
        width: 8.125vw;
        height: 145px;
      }
      .box-bg {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 4.7917vw;
        height: 27px;
        background: url("@/assets/images/bigDataAnalysis/i22.png") no-repeat center center / 100% 100%;
      }
      .box1 {
        position: absolute;
        left: 0.7292vw;
        bottom: 1.85vh;
      }
      .box2 {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        bottom: 2.77vh;
      }
      .box3 {
        position: absolute;
        right: 0.7292vw;
        bottom: 1.85vh;
      }
      .box4 {
        position: absolute;
        left: 2.3438vw;
        top: 6.4vh;
        font-size: 0.9375vw;
        color: #f6941d;
      }
      .box5 {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        top: 4.4vh;
        font-size: 0.9375vw;
        color: #fff;
      }
      .box6 {
        position: absolute;
        right: 2.3438vw;
        top: 6.4vh;
        font-size: 0.9375vw;
        color: #ef5a23;
      }
    }
  }
  .section2 {
    height: 20%;
    overflow: hidden;
    .contain {
      height: 100%;
      display: flex;
      justify-content: space-around;
      gap: 0.2604vw;
      color: #d8ebfd;
      .box {
        display: flex;
        justify-content: space-around;
        flex-direction: column;
        align-items: center;
        img {
          width: 2.9167vw;
          height: 2.9167vw;
        }
        .value-box {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 2.6042vw;
          background: url("@/assets/images/bigDataAnalysis/i29.png") no-repeat center center / 100% 100%;
          font-size: 0.625vw;
          line-height: 1.5em;
          span {
            font-size: 0.9375vw;
          }
        }
        .text-box {
          font-size: 0.7292vw;
        }
      }
    }
  }
  .section3 {
    height: 30%;
    .contain {
      height: 100%;
    }
  }
  .section4 {
    height: 20%;
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
  .section5 {
    height: 20%;
    .contain {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5208vw;
      height: 100%;
      .box1 {
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        width: 7.0313vw;
        height: 7.2917vw;
        background: url("@/assets/images/bigDataAnalysis/i51.png") no-repeat center center / 90% 90%;
        .title {
          position: absolute;
          top: 0px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 0.7292vw;
          color: #fff;
          text-wrap: nowrap;
        }
        .value {
          display: flex;
          font-size: 0.7292vw;
          color: #fff;
        }
      }
      .arrow {
        width: 2.3438vw;
        height: 1.9271vw;
      }
      .box2 {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
        gap: 0.2604vw;
        height: 100%;
        .item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.5208vw;
          img {
            width: 1.8229vw;
            height: 1.8229vw;
          }
          .item-con {
            display: flex;
            flex-direction: column;
            align-items: center;
            font-size: 0.625vw;
            .value {
              display: flex;
              align-items: center;
              gap: 5px;
            }
            .value1 {
              color: #65dbfe;
            }
            .value2 {
              color: #5df0d7;
            }
            .value3 {
              color: #f0e74c;
            }
            .countup-wrap {
              font-size: 0.7292vw;
            }
          }
        }
      }
    }
  }
  .section6 {
    height: 20%;
    .contain {
      height: 100%;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      grid-auto-rows: 1fr;
      gap: 0.2604vw;
      .item {
        display: flex;
        align-items: center;
        gap: 0.3125vw;
        .img1 {
          width: 2.7083vw;
          height: 2.7083vw;
        }
        .img2 {
          width: 1.9792vw;
          height: 1.9792vw;
          // 添加阴影效果
          filter: drop-shadow(0 0 5px rgba(0, 227, 255, 0.5));
        }
        .item-con {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 3px;
          .value1 {
            font-size: 0.8333vw;
            font-weight: 700;
            background: linear-gradient(to bottom, #fefffe, #fdb66a); /* 渐变颜色 */
            -webkit-background-clip: text;
            color: transparent;
          }
          .value2 {
            font-size: 0.7292vw;
            font-weight: 700;
            background: linear-gradient(to bottom, #fefffe, #56abf9); /* 渐变颜色 */
            -webkit-background-clip: text;
            color: transparent;
          }
        }
      }
    }
  }
  .section7 {
    height: 30%;
    .contain {
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      position: relative;
      height: 100%;
      padding: 0.5208vw;
      background: url("@/assets/images/bigDataAnalysis/i39.png") no-repeat center 40% / 15.625vw 118px;
      .box1 {
        position: absolute;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 0.8333vw;
        font-weight: 700;
        background: linear-gradient(to bottom, #fefffe, #fdb66a); /* 渐变颜色 */
        -webkit-background-clip: text;
        color: transparent;
      }
      .box2 {
        display: flex;
        justify-content: space-between;
        align-items: center;
        .item {
          display: flex;
          gap: 0.3125vw;
          img {
            width: 2.2917vw;
            height: 34px;
          }
          .item-con {
            display: flex;
            flex-direction: column;
            gap: 0.2604vw;
            justify-content: center;
            font-size: 0.625vw;
            font-weight: 700;
            background: linear-gradient(to bottom, #fefffe 70%, #56abf9); /* 渐变颜色 */
            -webkit-background-clip: text;
            color: transparent;
            span {
              font-size: 0.7292vw;
            }
          }
        }
      }
    }
  }
  .section8 {
    height: 30%;
    .contain {
      height: 100%;
    }
  }
}
</style>
