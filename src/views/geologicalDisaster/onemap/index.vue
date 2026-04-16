<script setup lang="ts">
import jcAnalysis from "./component/jcAnalysis.vue"
import Left1 from "./component/left1.vue"
import Left2 from "./component/left2.vue"
import Left3 from "./component/left3.vue"
import Right1 from "./component/right1.vue"

import Right3 from "./component/right3.vue"

import Center2 from "./component/center2.vue"
import Popup from "./component/popup.vue"

import { geologicalDisasterApi } from "@/api/geologicalDisaster"
import dayjs from "dayjs"
import { useMap } from "./component/map"
import { nanoid } from "nanoid"
const { initMap, loadPopup, closePopup, popupInfo, viewTo, addLayerManageData, removeLayerManageData } = useMap()
const equipmentId = ref<any>("")
const createTime = ref<any>(dayjs().format("YYYY-MM-DD HH:mm:ss"))
const popupRef = ref()
const queryParams = ref<any>({
  Id: ""
})
const showjcAnalysis = ref(false)

// 数据分析弹窗
const openDataAnalysis = () => {
  showjcAnalysis.value = true
}

const handleClose = () => {
  showjcAnalysis.value = false
}
const handlemappopClose = () => {
  closePopup()
}
const treeData = ref<any>([])
const defaultProps = ref<any>({
  label: "monitorpointname",
  value: "monitorpointid",
  children: "Children"
})
const getData = () => {
  geologicalDisasterApi.GeologicHazard_DevicSelect({}).then((res: any) => {
    if (res.success) {
      treeData.value = res.response
      queryParams.value.Id = treeData.value[0]?.monitorpointid
      equipmentId.value = treeData.value[0]?.monitorpointid
    }
  })
}
const changeTree = (val: any) => {
  queryParams.value.Id = val
  equipmentId.value = val
  const findNode = treeData.value.find((item: any) => item.monitorpointid === val)
  createTime.value = dayjs().format("YYYY-MM-DD HH:mm:ss")
  if (findNode) {
    viewTo(findNode.lon, findNode.lat)
  }
}

onMounted(() => {
  let ele = document.getElementById("map1")
  initMap(ele)
  loadPopup(popupRef.value.$el)
  getData()
})
</script>
<template>
  <div class="geologicalDisaster-page">
    <div class="search-box">
      <!--   <el-select
        v-model="queryParams.Id"
        placeholder="请选择"
        @change="changeSelect"
      >
        <el-option
          v-for="item in options"
          :key="item.deviceserial"
          :label="item.monitorpointname"
          :value="item.deviceserial"
        >
        </el-option>
      </el-select> -->
      <el-tree-select
        v-model="equipmentId"
        node-key="monitorpointid"
        :data="treeData"
        :render-after-expand="false"
        :props="defaultProps"
        style="width: 260px"
        @change="changeTree"
      />
    </div>
    <div
      class="map"
      id="map1"
    >
      <Popup
        ref="popupRef"
        :popupInfo="popupInfo"
        @closemapPop="handlemappopClose"
      />
    </div>
    <div class="left">
      <Left1 :equipmentId="equipmentId" />
      <Left2 :equipmentId="equipmentId" />
      <Left3 :createTime="createTime" />
    </div>
    <div class="center">
      <Center2 :equipmentId="equipmentId" />
    </div>
    <div class="right">
      <Right1 :equipmentId="equipmentId" />
      <Right3 :equipmentId="equipmentId" />
    </div>
    <img
      class="analysis-btn"
      :src="$fun.getImg('researchManagement/analysis-btn.png')"
      alt=""
      @click="openDataAnalysis"
    />
    <jcAnalysis
      v-if="showjcAnalysis"
      @ClosePop="handleClose"
    />
    <!-- <LayerControl ref="layerControlRef" /> -->
    <div class="section-bar">
      <MapLayerManage
        modular="防灾减灾一张图"
        :init-checked-keys="[35]"
        @addLayer="addLayerManageData"
        @removeLayer="removeLayerManageData"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
// $topHeaderHeight: vh(118);
.geologicalDisaster-page {
  display: flex;
  justify-content: space-between;
  position: relative;
  width: 100%;
  height: 100%;
  padding: 0 20px;
  overflow: hidden;

  .map {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0px;
    top: 0px;

    .popup {
      position: absolute;
      // width: 100%;
      // height: 100%;
      left: 550px;
      top: 80px;
      z-index: 999;
    }
    :deep(.ol-overlaycontainer-stopevent) {
      z-index: 9999 !important;
    }

    :deep(.ol-rotate-reset) {
      display: none;
    }
    :deep(.ol-zoom-in) {
      display: none;
    }
    :deep(.ol-zoom-out) {
      display: none;
    }
  }

  .left {
    margin-top: vh(20);
    bottom: vh(20);
    z-index: 9;
    width: vw(466);
  }
  .right {
    margin-top: vh(20);
    bottom: vh(20);
    z-index: 9;
    width: vw(426);
  }
  .center {
    position: relative;
    width: vw(962);
    // margin-top: vh(20);
    margin-top: vh(665);
  }
  .section-bar {
    position: absolute;
    top: vh(40);
    right: calc(var(--maptool-sidebar-right) + 100px);
    display: flex;
    gap: 15px;
    height: 32px;
    transition: all 0.3s ease-in-out;
    z-index: 1;
  }
  .analysis-btn {
    position: absolute;
    top: vh(40);
    right: vw(455);
    z-index: 999;
    cursor: pointer;
  }
}
</style>
<style lang="scss">
.geologicalDisaster-page {
  .wrapgeo {
    pointer-events: all;
    color: #ffffff;
    position: relative;

    background: url("@/assets/images/panel-bg.png") no-repeat center center/100% 100%;
    // background: linear-gradient(180deg, #0c2022 3%, #0f352e 86%, #084242 115%);
    box-sizing: border-box;
    border: 1.2px solid;
    border-image: linear-gradient(180deg, rgba(193, 242, 224, 0.15) 3%, rgba(255, 255, 255, 0.35) 115%);
    backdrop-filter: blur(50px);

    // &::after {
    //   position: absolute;
    //   right: 0;
    //   bottom: 0;
    //   content: "";
    //   display: block;
    //   width: 0;
    //   height: 0;
    //   border-top: 10px solid transparent;
    //   border-right: 10px solid rgba(255, 255, 255, 0.35);
    //   border-bottom: 10px solid rgba(255, 255, 255, 0.35);
    //   border-left: 10px solid transparent;
    // }

    .wrap-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 41px;
      padding: 0 2px 0 12px;
      background: url("@/assets/images/title-bg.png") no-repeat center center / 100% 100%;
      // background: url("@/assets/IntelligentPatrol/wrap-header-bg.png") no-repeat;
      // background-size: 100% 100%;

      .title-content {
        display: flex;
      }

      .title-logo {
        height: 50px;
        width: 50px;
        margin-left: -20px;
      }

      .updatetime {
        font-family: Source Sans 3;
        font-size: 12px;
        height: 12px;
        font-weight: 400;
        line-height: 12px;
        text-align: left;
        text-underline-position: from-font;
        text-decoration-skip-ink: none;
        color: #ffffff;
        margin-right: 15px;
      }

      .title {
        display: flex;
        align-items: center;
        font-size: 16px;

        // &::before {
        //   content: "";
        //   display: inline-block;
        //   width: 17.2px;
        //   height: 16px;
        //   margin-right: 10px;
        //   background: url("@/assets/IntelligentPatrol/wrap-header-icon.png") no-repeat;
        //   background-size: 100% 100%;
        // }
      }

      .title-con {
        margin-right: vw(20);
      }
      .tabs {
        display: flex;

        align-items: center;
        height: 28px;
        padding: 2px;
        border-radius: 1px;
        // background: #11403b;
        border: 1px solid rgba(255, 255, 255, 0.25);
        // margin-left: vw(100);

        .tab {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 46px;
          height: 24px;
          text-align: center;
          opacity: 0.5;
          font-size: 14px;
          cursor: pointer;
          transition: all 1s ease 0s;

          &.active {
            opacity: 1;
            font-weight: 600;
            color: #fff;
            // border: 1px solid #42c9c7;

            background: linear-gradient(90deg, #59bbf2 0%, #336c8c 100%);
          }
        }
      }
    }
    .line {
      margin-top: -2px;
      height: 5px;
      background: url("@/assets/images/title-line.png") no-repeat center center / cover;
    }
    .linebottom {
      margin-top: -2px;
      height: 5px;
      background: url("@/assets/images/title-line2.png") no-repeat center center / cover;
    }

    .wrap-con {
      height: calc(100% - 41px);
      overflow: hidden;
      padding: vw(10);

      .chart {
        width: 100%;
        height: 100%;
      }
    }
    .tableList {
      height: 100%;

      &.el-table {
        background: transparent !important;
        color: rgba(255, 255, 255, 0.8);
        --el-table-row-hover-bg-color: linear-gradient(90deg, #29a2b0 0%, #1e4e9c 100%);
        --el-table-border: none;

        // --el-table-tr-bg-color: #204b78;
        --el-table-tr-bg-color: #183559;

        // --el-fill-color-lighter: #183559;
        --el-fill-color-lighter: #204b78;
        .el-table__cell {
          color: #a7d2ca;
          padding: 0;

          border-bottom: 2px solid #172e50 !important;
          color: #dde3e8 !important;
        }

        tbody tr {
          height: 32px;
        }
      }
      .level {
        display: flex;
        align-items: center;
        font-size: 14px;
        justify-content: center;

        .icon {
          position: relative;
          width: 4px;
          height: 4px;
          margin-right: 5px;
          border-radius: 50%;

          &::after {
            content: "";
            display: inline-block;
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translateX(-50%) translateY(-50%);
            width: 8px;
            height: 8px;
            opacity: 0.3;
            border-radius: 50%;
            box-sizing: border-box;
            border: 1px solid #fff;
            background: rgba(224, 0, 0, 0.3);
          }
        }
      }
    }
  }

  .el-table__inner-wrapper:before {
    bottom: 0;
    height: 0px;
    left: 0;
  }
  .search-box {
    position: absolute;
    top: 35px;
    left: 28vw;
    width: 150px;
    height: 32px;
    z-index: 10;
    span {
      color: #fff;
    }
  }

  :deep(.search-box) {
    display: flex;
    align-items: center;
    position: absolute;
    pointer-events: all;
    top: 120px;
    left: 120px;
    width: 280px;
    z-index: 99;

    .el-input__wrapper {
      width: 200px;
      height: 34px;
      line-height: 34px;
      background: rgba(12, 42, 40, 0.85);
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.35) inset;
      border-radius: 0;

      .el-input__inner {
        height: 34px;
        line-height: 34px;
        color: #fff;
      }
    }
    .el-select__wrapper {
      width: 140px;
    }
    .el-select__input {
      color: #fff;
    }
  }
  :deep(.hover-row) {
    background: linear-gradient(90deg, #29a2b0 0%, #1e4e9c 100%);
    // z-index: 999;
  }
  :deep(.el-table--enable-row-hover .el-table__body tr:hover) {
    background: linear-gradient(90deg, #29a2b0 0%, #1e4e9c 100%);
  }
}
</style>
