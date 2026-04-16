<script lang="ts" setup>
interface Props {
  map: any
  disabled?: boolean
  style?: any
  // 设置需要隐藏的工具名称常量
  hiddenTools?: string[]
}

// 添加工具名称常量
const TOOL_NAMES = {
  MEASURE: "measure",
  CLEAR: "clear",
  FULLSCREEN: "fullscreen",
  ZOOM_IN: "zoomIn",
  RESET_VIEW: "resetView",
  ZOOM_OUT: "zoomOut",
  SWITCH_MAP: "switchMap",
  TOGGLE_SIDEBAR: "toggleSidebar"
} as const

const props = withDefaults(defineProps<Props>(), {
  map: null,
  disabled: true,
  style: {},
  hiddenTools: () => [] as string[]
})

// 添加判断工具是否显示的方法
const isToolVisible = (toolName: string) => !props.hiddenTools.includes(toolName)

const {
  zoomIn,
  resetView,
  zoomOut,
  baseMapType,
  switchMap,
  measureDraw,
  removeMeasure,
  fullScreen,
  toggleContainerSidebar
} = useMapTool(toRaw(props.map))
</script>
<template>
  <div
    class="map-tools"
    :style="style"
  >
    <div class="part part1">
      <el-popover
        v-if="isToolVisible(TOOL_NAMES.MEASURE)"
        placement="left"
        trigger="click"
        :teleported="false"
      >
        <template #reference>
          <div class="box">
            <el-tooltip
              class="box-item"
              effect="light"
              content="测量"
              placement="top"
              :enterable="false"
              :disabled="disabled"
            >
              <span class="tool tool2"></span>
            </el-tooltip>
          </div>
        </template>
        <template #default>
          <div class="second-level">
            <div
              class="second-level-box"
              @click="measureDraw('测距')"
            >
              <span class="second-level-tool tool12"></span>测距
            </div>
            <div
              class="second-level-box"
              @click="measureDraw('测面')"
            >
              <span class="second-level-tool tool13"></span>测面
            </div>
          </div>
        </template>
      </el-popover>
      <div
        v-if="isToolVisible(TOOL_NAMES.CLEAR)"
        class="box"
        @click="removeMeasure"
      >
        <el-tooltip
          class="box-item"
          effect="light"
          content="清除"
          placement="top"
          :enterable="false"
          :disabled="disabled"
        >
          <span class="tool tool3"></span>
        </el-tooltip>
      </div>
      <div
        v-if="isToolVisible(TOOL_NAMES.FULLSCREEN)"
        class="box"
        @click="fullScreen"
      >
        <el-tooltip
          class="box-item"
          effect="light"
          content="全屏"
          placement="top"
          :enterable="false"
          :disabled="disabled"
        >
          <span class="tool tool4"></span>
        </el-tooltip>
      </div>
    </div>
    <div class="part part2">
      <div
        v-if="isToolVisible(TOOL_NAMES.ZOOM_IN)"
        class="box"
        @click="zoomIn"
      >
        <span class="tool tool5"></span>
      </div>
      <div
        v-if="isToolVisible(TOOL_NAMES.RESET_VIEW)"
        class="box"
        @click="resetView"
      >
        <span class="tool tool6"></span>
      </div>
      <div
        v-if="isToolVisible(TOOL_NAMES.ZOOM_OUT)"
        class="box"
        @click="zoomOut"
      >
        <span class="tool tool7"></span>
      </div>
    </div>
    <div class="part part3">
      <el-popover
        v-if="isToolVisible(TOOL_NAMES.SWITCH_MAP)"
        placement="left"
        trigger="click"
        :teleported="false"
      >
        <template #reference>
          <div class="box">
            <el-tooltip
              class="box-item"
              effect="light"
              content="切换地图"
              placement="top"
              :enterable="false"
              :disabled="disabled"
            >
              <span class="tool tool8"></span>
            </el-tooltip>
          </div>
        </template>
        <template #default>
          <div class="second-level">
            <div
              class="second-level-box-img"
              :class="{ active: baseMapType === '影像底图' }"
              @click="switchMap('影像底图')"
            >
              <img
                class="second-level-tool"
                src="./icon/tile-bg.png"
                alt=""
              />影像
            </div>
            <div
              class="second-level-box-img"
              :class="{ active: baseMapType === '矢量底图' }"
              @click="switchMap('矢量底图')"
            >
              <img
                class="second-level-tool-img"
                src="./icon/vector-bg.png"
                alt=""
              />矢量
            </div>
          </div>
        </template>
      </el-popover>
      <div
        v-if="isToolVisible(TOOL_NAMES.TOGGLE_SIDEBAR)"
        class="box"
        @click="toggleContainerSidebar()"
      >
        <el-tooltip
          class="box-item"
          effect="light"
          content="侧边切换可见"
          placement="top"
          :enterable="false"
          :disabled="disabled"
        >
          <span class="tool tool14"></span>
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.map-tools {
  position: absolute;
  bottom: var(--maptool-sidebar-bottom);
  right: var(--maptool-sidebar-right);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
  z-index: 990;
  transition: all 0.3s ease-in-out;
  .part {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 5px;
    .el-popper {
      padding: 5px;
      width: min-content !important;
      min-width: min-content;
      background-color: #0a142b;
      border: none;
      box-shadow: none;
      .el-popper__arrow:before {
        background-color: #0a142b !important;
        border: none;
      }
    }
    .second-level {
      display: flex;
      background-color: #0a142b;
      .second-level-box {
        width: 80px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 12px;
        color: #e9e9e9;
        cursor: pointer;
        margin: 5px 0;
        .second-level-tool {
          width: 36px;
          height: 36px;
          margin-right: 5px;
          background-image: url("./icon/map-tool.png");
          background-repeat: no-repeat;
          background-clip: content-box;
          transition: all 0.3s;
          background-position-y: -43px;
        }
        &:hover {
          .second-level-tool {
            background-position-y: 0px;
          }
        }
      }
      .second-level-box-img {
        width: 80px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 12px;
        color: #e9e9e9;
        margin: 5px 0;
        cursor: pointer;
        gap: 6px;
        img {
          max-width: 36px;
          height: 36px;
        }
        &.active {
          color: #e5a426;
          font-weight: 700;
          img {
            border: 1px solid #e5a426;
          }
        }
      }
    }
    .box {
      width: 36px;
      height: 36px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      background-color: #0a142b;
      transform: scale(0.8);
      &:hover {
        .tool {
          background-position-y: 0px;
        }
      }
    }
    & > div:not(:last-child) {
      position: relative;
      &::after {
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60%;
        height: 1px;
        content: "";
        background: #ccc;
      }
    }
    .tool {
      width: 36px;
      height: 36px;
      background-image: url("./icon/map-tool.png");
      background-repeat: no-repeat;
      background-clip: content-box;
      transition: all 0.3s;
      background-position-y: -43px;
    }

    .tool1 {
      background-position-x: 0;
    }
    .tool2 {
      background-position-x: -72px;
    }
    .tool3 {
      background-position-x: -108px;
    }
    .tool4 {
      background-position-x: -180px;
    }
    .tool5 {
      background-position-x: -216px;
    }
    .tool6 {
      background-position-x: -252px;
    }
    .tool7 {
      background-position-x: -288px;
    }
    .tool8 {
      background-position-x: -324px;
    }
    .tool9 {
      background-position-x: -360px;
    }
    .tool10 {
      background-position-x: -396px;
    }
    .tool11 {
      background-position-x: -432px;
    }
    .tool12 {
      background-position-x: -576px;
    }
    .tool13 {
      background-position-x: -612px;
    }
    .tool14 {
      background-position-x: -648px;
    }
  }
}
</style>
