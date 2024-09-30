<script lang="ts" setup>
interface Props {
  map: any
}
const props = withDefaults(defineProps<Props>(), {
  map: null
})

const { zoomIn, resetView, zoomOut } = useMapTool(props.map)
</script>
<template>
  <div class="map-tools">
    <div class="part part1">
      <el-popover
        placement="left"
        trigger="click"
        :teleported="false"
      >
        <template #reference>
          <div class="box">
            <span class="tool tool1"></span>
          </div>
        </template>
        <template #default>
          <div class="second-level">
            <div class="second-level-box"><span class="second-level-tool tool9"></span>县界</div>
            <div class="second-level-box"><span class="second-level-tool tool10"></span>乡界</div>
            <div class="second-level-box"><span class="second-level-tool tool11"></span>镇界</div>
          </div>
        </template>
      </el-popover>

      <el-popover
        placement="left"
        trigger="click"
        :teleported="false"
      >
        <template #reference>
          <div class="box">
            <span class="tool tool2"></span>
          </div>
        </template>
        <template #default>
          <div class="second-level">
            <div class="second-level-box"><span class="second-level-tool tool12"></span>测距</div>
            <div class="second-level-box"><span class="second-level-tool tool13"></span>测面</div>
          </div>
        </template>
      </el-popover>

      <div class="box"><span class="tool tool3"></span></div>
      <div class="box"><span class="tool tool4"></span></div>
    </div>
    <div class="part part2">
      <div
        class="box"
        @click="zoomIn"
      >
        <span class="tool tool5"></span>
      </div>
      <div
        class="box"
        @click="resetView"
      >
        <span class="tool tool6"></span>
      </div>
      <div
        class="box"
        @click="zoomOut"
      >
        <span class="tool tool7"></span>
      </div>
    </div>
    <div class="part part3">
      <div class="box"><span class="tool tool8"></span></div>
    </div>
  </div>
</template>

<style lang="scss">
.map-tools {
  position: absolute;
  bottom: 100px;
  right: 700px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
  z-index: 999;
  .part {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: #fff;
    .el-popper {
      padding: 0 5px;
      width: min-content !important;
      min-width: min-content;
    }
    .second-level {
      display: flex;
      .second-level-box {
        width: 50px;
        height: 32px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 12px;
        color: #333;
        cursor: pointer;
        .second-level-tool {
          width: 14px;
          height: 14px;
          margin-right: 5px;
          background-image: url("./icon/map-tool.png");
          background-repeat: no-repeat;
          background-clip: content-box;
          transition: all 0.3s;
        }
        &:hover {
          .second-level-tool {
            background-position-y: -14px;
          }
        }
      }
    }
    .box {
      width: 32px;
      height: 32px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      &:hover {
        .tool {
          background-position-y: -14px;
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
      width: 14px;
      height: 14px;
      background-image: url("./icon/map-tool.png");
      background-repeat: no-repeat;
      background-clip: content-box;
      transition: all 0.3s;
    }

    .tool1 {
      background-position: 0 0;
    }
    .tool2 {
      background-position: -28px 0;
    }
    .tool3 {
      background-position: -42px 0;
    }
    .tool4 {
      background-position: -70px 0;
    }
    .tool5 {
      width: 10px;
      background-position: -84px 0;
    }
    .tool6 {
      width: 11px;
      background-position: -94px 0;
    }
    .tool7 {
      width: 10px;
      background-position: -105px 0;
    }
    .tool8 {
      background-position: -115px 0;
    }
    .tool9 {
      background-position: -129px 0;
    }
    .tool10 {
      background-position: -143px 0;
    }
    .tool11 {
      background-position: -157px 0;
    }
    .tool12 {
      background-position: -212px 0;
    }
    .tool13 {
      background-position: -228px 0;
    }
  }
}
</style>
