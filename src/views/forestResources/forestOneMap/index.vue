<script lang="ts" setup>
import {
  GetForestResourcesAnalysis_Hcgk,
  GetForestResourcesAnalysis_Stxflx,
  GetForestResourcesAnalysis_Zzszpm
} from "@/api"
import PageTabs from "../components/PageTabs.vue"
const { showCSB } = storeToRefs(useConfigStore())
const popup = ref<any>(null)
const modular = ref("森林资源一张图")
const {
  vectorFeatures,
  locationMap,
  closePopup,
  popupInfo,
  map,
  popupFormatType,
  addLayerManageData,
  removeLayerManageData
} = useOlMap(popup, {
  popupFormatType: "",
  zoom: 13,
  center: [116.1292869, 31.036022],
  modular: modular.value,
  openOverlay: false,
  overlayOffset: [0, -60],
  overlayPositioning: "bottom-center",
  vectorLayerMode: "vectorImage",
  vectorLayerDeclutter: true
})
// 生态修复类型
const chartData11 = ref<any>(null)
const getChartData11 = async () => {
  const { response } = await GetForestResourcesAnalysis_Stxflx()
  chartData11.value = response
}
// 种植树种排名
const chartData12 = ref<any>(null)
// 获得种植树种排名
const getPlantRankData = async () => {
  const { response } = await GetForestResourcesAnalysis_Zzszpm()
  chartData12.value = response
}
const chartData13 = ref<any>([])
// 获得核查概况数据
const getChartData13 = async () => {
  const { response } = await GetForestResourcesAnalysis_Hcgk()
  chartData13.value = response
}
const { setVariable } = useCssVariables()
onMounted(() => {
  setVariable("maptool-sidebar-right", "calc(21.875vw + 40px)") // 设置地图工具栏距右侧距离
  setVariable("maptool-sidebar-bottom", "calc(20px)") // 设置地图工具栏距底部距离
  // getSmallMData() // 获取小班面积数据
  getPlantRankData()
  getChartData13()
  getChartData11()
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
        :modular="modular"
        :init-checked-keys="[53]"
        @addLayer="addLayerManageData"
        @removeLayer="removeLayerManageData"
      />
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
          <BasePanel title="核查概况">
            <template #contain>
              <div class="contain check_box">
                <div class="check_right">
                  <div class="row1">未核查</div>
                  <div class="row2">{{ chartData13[0]?.value }}<span>件</span></div>
                </div>

                <div class="check_middle">
                  <ChartPanel13 :data="chartData13" />
                  <!-- <img src="@/assets/images/forestResources/check_bg.png" alt=""> -->
                </div>
                <div class="check_left">
                  <div class="row1">已核查</div>
                  <div class="row2">{{ chartData13[1]?.value }}<span>件</span></div>
                </div>
              </div>
            </template>
          </BasePanel>
        </div>
        <div
          v-show="showCSB"
          class="section6"
          key="section6"
        >
          <BasePanel title="生态修复类型">
            <template #contain>
              <div class="contain">
                <div class="box">
                  <div>
                    <img
                      :src="$fun.getImg('arrow-left.png')"
                      alt=""
                    />
                    小班面积
                    <img
                      :src="$fun.getImg('arrow-right.png')"
                      alt=""
                    />
                  </div>
                  <div class="gender-box">
                    <div class="gender-box-item2">
                      <ChartPanel11 :data="chartData11" />
                    </div>
                  </div>
                </div>
                <div class="box">
                  <div>
                    <img
                      :src="$fun.getImg('arrow-left.png')"
                      alt=""
                    />
                    种植树种排名
                    <img
                      :src="$fun.getImg('arrow-right.png')"
                      alt=""
                    />
                  </div>
                  <div class="lkfx-box">
                    <ChartPanel12 :data="chartData12" />
                  </div>
                </div>
              </div>
            </template>
          </BasePanel>
        </div>
      </transition-group>
    </div>

    <PageTabs class="pages-tabs" />
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
.data-summary {
  position: relative;
  height: 100%;
  font-size: 0.7292vw;
  color: #fff;

  .pages-tabs {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
  }

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

  .section5 {
    height: 30%;

    .contain {
      display: flex;
      justify-content: space-evenly;
      align-items: center;
      gap: 0.5208vw;
      height: 100%;
      margin: 0 10px;
      .check_middle {
        width: 55%;
        height: 65%;
      }
      .check_left,
      .check_right {
        .row1 {
          font-size: 14px;
          margin-bottom: 5px;
        }

        .row2 {
          font-size: 20px;
          color: #00e3ff;
          font-weight: 700;

          span {
            font-size: 14px;
            font-weight: 400;
          }
        }
      }

      .check_right {
        .row2 {
          color: #d0ae3e;
        }
      }
    }
  }

  .section6 {
    height: 70%;

    .contain {
      height: 100%;

      .box {
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

        .gender-box {
          display: flex;
          flex-direction: column;
          padding: 0.5208vw;
          overflow: hidden;

          .gender-box-item1 {
            display: flex;
            align-items: center;
            gap: 0.5208vw;
            height: 120px;
          }

          .gender-box-item2 {
            flex: 1;
            position: relative;
          }

          .gender-part1 {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 2px;

            > div {
              font-size: 0.7292vw;
            }

            img {
              width: 3.5417vw;
              height: 76px;
            }
          }

          .gender-part2 {
            height: 112px;

            img {
              width: 8px;
              height: 110px;
            }
          }

          .gender-part3 {
            flex: 1;
            height: 100%;
            display: flex;

            > div {
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              gap: 0.5208vw;

              .info {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                gap: 3px;
                width: 45px;
                height: 45px;
                border-radius: 50%;
                border: 2px solid #339fbb;
                font-size: 0.625vw;

                .count {
                  color: #d79d0a;
                }

                &:first-child {
                  border-color: #e75660;
                  color: #e75660;
                }

                &:last-child {
                  border-color: #4ab7fd;
                  color: #4ab7fd;
                }
              }
            }

            .chart {
              flex: 1;
              height: 100%;
            }
          }
        }

        .lkfx-box {
          position: relative;
          // background: url("@/assets/images/bigDataAnalysis/g4.png") no-repeat center bottom / 100% 85px;
        }
      }

      .box:nth-child(1) {
        height: 60%;
      }

      .box:nth-child(2) {
        height: 40%;
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
        background: linear-gradient(to bottom, #fefffe, #fdb66a);
        /* 渐变颜色 */
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
            background: linear-gradient(to bottom, #fefffe 70%, #56abf9);
            /* 渐变颜色 */
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
