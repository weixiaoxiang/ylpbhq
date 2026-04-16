<script lang="ts" setup>
import Bottom from "./component/bottom.vue"
import Detail from "./component/detail.vue"
import Left1 from "./component/left1.vue"
import Right1 from "./component/right1.vue"
import Right2 from "./component/right2.vue"
import Right3 from "./component/right3.vue"
import Right4 from "./component/right4.vue"
const proxy = getCurrentInstance()!.proxy as any
const router = useRouter()
const { showCSB } = storeToRefs(useConfigStore())
const popupRef = ref<any>(null)
const {
  map,
  closePopup,
  vectorFeatures,
  popupFormatType,
  popupInfo,
  locationMap,
  addLayerManageData,
  removeLayerManageData
} = useOlMap(popupRef, {
  zoom: 13,
  center: [116.10027952755078, 31.038202369116],
  modular: "综合态势分析",
  openOverlay: false,
  overlayOffset: [0, -70],
  overlayPositioning: "bottom-center"
})
// 查看历史巡护数据
const handleHistoryDataClick = (data: any) => {
  router.push({
    path: "/patrol/record",
    query: {
      userid: data.User_id
    }
  })
}
// 动画播放与暂停
let isAnimatePlay = ref(false)
const { activateThis, handlePlot, plotForm, showSavePlot, addPlot, previewCommand } = useOlPlot(map, proxy)
const operation = (type: string) => {
  if (type == "play") {
    isAnimatePlay.value = true
  } else if (type == "pause") {
    isAnimatePlay.value = false
  }
  handlePlot(type)
}
const activePage = ref("list")
const detail = ref<any>({})
const openJp = ref(false)
// 保存绘标
const onSubmit = () => {
  handlePlot("save")
}
const { setVariable } = useCssVariables()
onMounted(() => {
  setVariable("maptool-sidebar-right", "450px") // 设置地图工具栏距右侧距离
  setVariable("maptool-sidebar-bottom", "20px") // 设置地图工具栏距底部距离
  proxy.$mitt.on("activePage", (val: any) => {
    if (val) {
      activePage.value = "detail"
      detail.value = val
      setVariable("maptool-sidebar-bottom", "345px")
      window.orginMaptoolSidebarBottom = "345px"
      plotForm.value.alarmhandleid = val.alarmid
    } else {
      activePage.value = "list"
      setVariable("maptool-sidebar-bottom", "20px")
      window.orginMaptoolSidebarBottom = "20px"
    }
  })
})
</script>
<template>
  <div class="emergencyCommand">
    <div
      class="map-box"
      id="map"
    >
      <!-- <Popup
        ref="popupRef"
        @close="closePopup"
      /> -->
      <MapPopup
        ref="popupRef"
        :format-name="popupFormatType"
        :info="popupInfo"
        @close="closePopup"
        @handleHistoryDataClick="handleHistoryDataClick"
      />
      <MapTool
        v-if="map"
        :map="map"
      />
    </div>
    <div class="section-bar">
      <MapFeatureSearch
        :features="vectorFeatures"
        @location="locationMap"
      />
      <MapLayerManage
        modular="综合态势分析"
        :init-checked-keys="[35]"
        @addLayer="addLayerManageData"
        @removeLayer="removeLayerManageData"
      />
    </div>
    <transition-group
      enter-active-class="animate__animated animate__bounceInLeft"
      leave-active-class="animate__animated animate__fadeOut"
      appear
      appear-active-class="animate__animated  animate__bounceInLeft"
    >
      <Left1
        v-show="activePage == 'list' && showCSB"
        key="section1"
      />
      <Detail
        v-show="activePage == 'detail' && showCSB"
        :detail="detail"
        key="section2"
        @addPlot="addPlot"
        @previewCommand="previewCommand"
      />
    </transition-group>
    <transition
      enter-active-class="animate__animated animate__bounceInUp"
      leave-active-class="animate__animated animate__fadeOut"
      appear
      appear-active-class="animate__animated  animate__bounceInUp"
    >
      <Bottom
        v-if="activePage == 'detail' && showCSB"
        :detail="detail"
    /></transition>
    <transition
      enter-active-class="animate__animated animate__bounceInRight"
      leave-active-class="animate__animated animate__fadeOut"
      appear
      appear-active-class="animate__animated  animate__bounceInRight"
    >
      <div
        v-show="showCSB"
        class="right"
      >
        <Right1 />
        <Right2 />
        <Right4 v-if="activePage == 'detail'" />
        <Right3 />
      </div>
    </transition>
    <!-- 绘制军标 -->
    <div
      v-show="activePage == 'detail'"
      class="jp-box"
      :class="{ open: openJp }"
    >
      <div class="jp-btns">
        <div
          class="btn"
          @click="openJp = !openJp"
        >
          <img
            src="@/assets/images/emergencyCommand/jp-1.png"
            alt=""
          />
        </div>
        <div class="btns">
          <div
            class="btn1"
            @click="handlePlot('delete')"
          >
            <img
              src="@/assets/images/emergencyCommand/btn-del.png"
              alt=""
            />
          </div>
          <div
            class="btn1"
            @click="handlePlot('deleteAll')"
          >
            <img
              src="@/assets/images/emergencyCommand/btn-del1.png"
              alt=""
            />
          </div>
          <div
            class="btn1"
            @click="operation(isAnimatePlay ? 'pause' : 'play')"
          >
            <img
              :src="
                isAnimatePlay
                  ? $fun.getImg('emergencyCommand/btn-pause.png')
                  : $fun.getImg('emergencyCommand/btn-play.png')
              "
              alt=""
            />
          </div>
          <div
            class="btn1"
            @click="showSavePlot = true"
          >
            <img
              src="@/assets/images/emergencyCommand/btn-img.png"
              alt=""
            />
          </div>
        </div>
      </div>
      <div class="plot-btn-box">
        <el-button
          type="primary"
          size="small"
          @click="activateThis('Arc')"
        >
          <em class="panelIcon1"></em>
          弧线
        </el-button>
        <el-button
          type="primary"
          size="small"
          @click="activateThis('Curve')"
        >
          <em class="panelIcon2"></em>
          曲线
        </el-button>
        <el-button
          type="primary"
          size="small"
          @click="activateThis('Polyline')"
        >
          <em class="panelIcon3"></em>
          折线
        </el-button>
        <el-button
          type="primary"
          size="small"
          @click="activateThis('FreeHandLine')"
        >
          <em class="panelIcon4"></em>
          自由线
        </el-button>
        <el-button
          type="primary"
          size="small"
          @click="activateThis('Circle')"
        >
          <em class="panelIcon5"></em>
          圆
        </el-button>
        <el-button
          type="primary"
          size="small"
          @click="activateThis('Ellipse')"
        >
          <em class="panelIcon6"></em>
          椭圆
        </el-button>
        <el-button
          type="primary"
          size="small"
          @click="activateThis('ClosedCurve')"
        >
          <em class="panelIcon8"></em>
          曲线面
        </el-button>
        <el-button
          type="primary"
          size="small"
          @click="activateThis('Polygon')"
        >
          <em class="panelIcon9"></em>
          多边形
        </el-button>
        <el-button
          type="primary"
          size="small"
          @click="activateThis('RectAngle')"
        >
          <em class="panelIcon10"></em>
          矩形
        </el-button>
        <el-button
          type="primary"
          size="small"
          @click="activateThis('GatheringPlace')"
        >
          <em class="panelIcon12"></em>
          集结地
        </el-button>
        <el-button
          type="primary"
          size="small"
          @click="activateThis('Sector')"
        >
          <em class="panelIcon13"></em>
          扇形
        </el-button>
        <el-button
          type="primary"
          size="small"
          @click="activateThis('DoubleArrow')"
        >
          <em class="panelIcon14"></em>
          双箭头
        </el-button>
        <el-button
          type="primary"
          size="small"
          @click="activateThis('StraightArrow')"
        >
          <em class="panelIcon15"></em>
          细直箭头
        </el-button>
        <el-button
          type="primary"
          size="small"
          @click="activateThis('FineArrow')"
        >
          <em class="panelIcon16"></em>
          粗单尖头
        </el-button>
        <el-button
          type="primary"
          size="small"
          @click="activateThis('AssaultDirection')"
        >
          <em class="panelIcon17"></em>
          粗单直箭头
        </el-button>
        <el-button
          type="primary"
          size="small"
          @click="activateThis('AttackArrow')"
        >
          <em class="panelIcon18"></em>
          进攻方向
        </el-button>
        <el-button
          type="primary"
          size="small"
          @click="activateThis('TailedAttackArrow')"
        >
          <em class="panelIcon18"></em>
          进攻方向（尾）
        </el-button>
        <el-button
          type="primary"
          size="small"
          @click="activateThis('SquadCombat')"
        >
          <em class="panelIcon19"></em>
          分队战斗行动
        </el-button>
        <el-button
          type="primary"
          size="small"
          @click="activateThis('TailedSquadCombat')"
        >
          <em class="panelIcon19"></em>
          分队战斗行动（尾）
        </el-button>
      </div>
    </div>
    <Modal
      id="dataPanel"
      v-model:show="showSavePlot"
      disable-zoom
      disable-pan
      :show-shade="true"
      shade-color="rgba(0,0,0,0.3)"
      :close-on-click-modal="false"
    >
      <template v-slot:container>
        <el-form
          :model="plotForm"
          class="save-plot-form panzoom-exclude"
          label-width="auto"
          style="width: 400px"
        >
          <el-form-item label="档案名称">
            <el-input v-model="plotForm.mc" />
          </el-form-item>
          <el-form-item style="text-align: right">
            <div class="btn-box">
              <el-button
                type="primary"
                @click="onSubmit"
                >保存</el-button
              >
              <el-button @click="showSavePlot = false">关闭</el-button>
            </div>
          </el-form-item>
        </el-form>
      </template>
    </Modal>
  </div>
</template>

<style lang="scss" scoped>
.test {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  width: 1000px;
  height: 550px;
  z-index: 1000;
  padding: 20px;
}
.emergencyCommand {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;

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
    transition: all 0.3s ease-in-out;
    z-index: 1;
  }

  .right {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: vh(20);
    bottom: vh(20);
    right: vw(20);
    width: 420px;
  }

  .jp-box {
    position: absolute;
    // left: 460px;
    left: var(--maptool-sidebar-right);
    top: vh(35);
    transition: all 1s ease 0s;
    .jp-btns {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 47px;
      border-radius: 30px;
      background: rgba(12, 47, 82, 0.7);
      overflow: hidden;

      .btn {
        width: 47px;
        height: 47px;
        background: linear-gradient(90deg, rgba(12, 47, 82, 0.7) 7%, rgba(16, 80, 144, 0.7) 107%);
        cursor: pointer;
      }
      .btns {
        display: flex;
        align-items: center;
        width: 0;
        transition: width 1s ease 0s;
        .btn1 {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 47px;
          cursor: pointer;
          background: rgba(16, 80, 144, 0.7);
          &:not(:last-child) {
            margin-right: 4px;
          }
        }
      }
    }
    :deep(.plot-btn-box) {
      width: 0;
      height: 0;
      opacity: 0;
      overflow: hidden;
      margin-top: -30px;
      padding: 30px 10px 10px;
      background: rgba(12, 47, 82, 0.7);
      transition: all 1s ease 0s;
      .el-button {
        margin: 10px 10px 0 0;
        border-radius: 1px;
        background: rgba(16, 80, 144, 0.7);

        em {
          display: block;
          background: url("@/assets/images/emergencyCommand/plotIcon.png") 100% no-repeat;
          float: left;
          width: 22px;
          height: 24px;
          margin-right: 5px;

          &.panelIcon1 {
            background-position: 0px 0px;
          }

          &.panelIcon2 {
            background-position: -30px 0px;
          }

          &.panelIcon3 {
            width: 33px;
            background-position: -60px 0px;
          }

          &.panelIcon4 {
            width: 23px;
            background-position: -102px 0px;
          }

          &.panelIcon5 {
            width: 18px;
            background-position: -132px 0px;
          }

          &.panelIcon6 {
            width: 22px;
            background-position: -157px 0px;
          }

          &.panelIcon7 {
            width: 16px;
            background-position: -187px 0px;
          }

          &.panelIcon8 {
            width: 20px;
            background-position: -211px 0px;
          }

          &.panelIcon9 {
            width: 19px;
            background-position: -240px 0px;
          }

          &.panelIcon10 {
            width: 23px;
            background-position: -268px 0px;
          }

          &.panelIcon11 {
            background-position: -300px 0px;
          }

          &.panelIcon12 {
            width: 18px;
            background-position: -330px 0px;
          }

          &.panelIcon13 {
            width: 18px;
            background-position: -355px 0px;
          }

          &.panelIcon14 {
            width: 23px;
            background-position: -381px 0px;
          }

          &.panelIcon15 {
            width: 21px;
            background-position: -414px 0px;
          }

          &.panelIcon16 {
            width: 26px;
            background-position: -443px 0px;
          }

          &.panelIcon17 {
            width: 26px;
            background-position: -475px 0px;
          }

          &.panelIcon18 {
            width: 25px;
            background-position: -506px 0px;
          }

          &.panelIcon19 {
            width: 21px;
            background-position: -536px 0px;
          }

          &.panelIcon20 {
            width: 18px;
            background-position: -394px 0px;
          }

          &.panelIcon22 {
            width: 20px;
            background-position: -436px 0px;
          }

          &.panelIcon23 {
            width: 20px;
            background-position: -463px 0px;
          }

          &.panelIcon24 {
            width: 17px;
            background-position: -488px 0px;
          }
        }
      }
    }
    &.open {
      .btns {
        width: 252px;
      }
      .plot-btn-box {
        width: 300px;
        height: 312px;
        opacity: 1;
      }
    }
  }
  :deep(.save-plot-form) {
    background: #fff;
    padding: 20px 20px 10px 20px;
    .btn-box {
      flex: 1;
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }
  }
}
</style>
