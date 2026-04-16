<script lang="ts" setup>
const emit = defineEmits(["close"])
let props = defineProps(["detailData"])
const timeRange = ref([])
const activeTab = ref("实时画面")

const closePop = () => {
  emit("close") // 关闭弹框
}
//切换tab
const changeTab = (type: string) => {
  activeTab.value = type
}

//控制云台
const controlChange = (type: string, action: any = 1) => {}
//查询
const search = () => {
  console.log(timeRange)
}
</script>
<template>
  <div class="map-pop">
    <div class="map-pop-box">
      <div
        class="map-pop-title"
        style="display: flex; justify-content: space-between"
      >
        <div class="map-pop-title-text">
          防火监控名称
          <img
            class="close"
            src="@/assets/images/aiRemoteSensing/close.png"
            alt=""
            @click="closePop"
          />
        </div>
      </div>
      <div class="map-pop-content">
        <div class="left">
          <div
            class="tab-btn"
            :class="{ active: activeTab == '实时画面' }"
            @click="changeTab('实时画面')"
          >
            实时画面
          </div>
          <div
            class="tab-btn"
            :class="{ active: activeTab == '历史查询' }"
            @click="changeTab('历史查询')"
          >
            历史查询
          </div>
          <div
            class="tab-btn"
            :class="{ active: activeTab == '热成像' }"
            @click="changeTab('热成像')"
          >
            热成像
          </div>
          <div class="left-box-bottom-control">
            <div class="control-box">
              <div class="conter-center"></div>
              <div
                class="btn top-btn"
                @mousedown="controlChange('UP', 0)"
                @mouseup="controlChange('UP', 1)"
              ></div>
              <div
                class="btn bottom-btn"
                @mousedown="controlChange('DOWN', 0)"
                @mouseup="controlChange('DOWN', 1)"
              ></div>
              <div
                class="btn left-btn"
                @mousedown="controlChange('LEFT', 0)"
                @mouseup="controlChange('LEFT', 1)"
              ></div>
              <div
                class="btn right-btn"
                @mousedown="controlChange('RIGHT', 0)"
                @mouseup="controlChange('RIGHT', 1)"
              ></div>
            </div>
          </div>
        </div>
        <div class="right">
          <div
            v-if="activeTab == '历史查询'"
            class="search-box"
          >
            <el-date-picker
              style="width: 240px; float: left"
              v-model="timeRange"
              type="datetimerange"
              range-separator="-"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              date-format="YYYY-MM-DD HH:mm:ss"
              format="HH:mm:ss"
              :clearable="false"
            />
            <div
              class="search-btn"
              @click="search"
            >
              <SvgIcon
                name="查询"
                style="font-size: 16px"
              />
              查询
            </div>
          </div>
          <div class="play-box"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.map-pop {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 99999;
  background: url("@/assets/images/emergencyCommand/popupbg.png") no-repeat;
  background-size: center center;
  color: #fff;
  font-size: 14px;

  &:after {
    position: absolute;
    content: "";
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-top: 10px solid rgba(44, 173, 255, 1);
    bottom: -12px;
    left: 50%;
    transform: translateX(-50%);
  }

  .map-pop-box {
    position: relative;
    width: 527px;
    height: 327px;
    padding-top: 5px;

    .map-pop-title {
      position: relative;

      .map-pop-title-text {
        width: 100%;
        height: 28px;
        line-height: 32px;
        padding-left: 18px;
      }

      .close {
        width: 10px;
        height: 10px;
        position: absolute;
        top: 10px;
        right: 10px;
        cursor: pointer;
      }
    }

    .map-pop-content {
      width: 100%;
      padding: 16px 0;
      display: flex;

      .left {
        width: 146px;

        .tab-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 88.55px;
          height: 34px;
          margin: 0 auto;
          margin-bottom: 10px;
          background: url("@/assets/images/emergencyCommand/btn-bg.png") no-repeat;
          cursor: pointer;

          &.active,
          &:hover {
            background: linear-gradient(
              270deg,
              #2aeaf7 -3%,
              rgba(42, 234, 247, 0.5) 5%,
              rgba(42, 234, 247, 0.5) 93%,
              #2aeaf7 104%
            );
            box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
          }
        }

        .left-box-bottom-control {
          height: 100px;
          width: 100px;
          margin: 0 auto;
          margin-top: 20px;
          background: url("/images/geologicalDisaster/video/control-bj.png") no-repeat center center / 100% 100%;

          .control-box {
            position: relative;
            height: 100px;

            .conter-center {
              background: url("/images/geologicalDisaster/video/center-circle.png") no-repeat;
              background-size: 100% 100%;
              width: 37px;
              height: 37px;
              position: absolute;
              left: 50%;
              top: 50%;
              transform: translate(-50%, -50%);
              /* 合并水平和垂直居中 */
            }

            .btn {
              position: absolute;
              width: 24px;
              height: 12px;
              background: url("/images/geologicalDisaster/video/control-btn.png") no-repeat;
              background-size: 100% 100%;

              &.top-btn {
                left: 50%;
                top: 12px;
                transform: translateX(-50%);
              }

              &.bottom-btn {
                left: 50%;
                bottom: 12px;
                transform: translateX(-50%) rotate(180deg);
              }

              &.left-btn {
                left: 8px;
                bottom: 45px;
                transform: rotate(270deg);
              }

              &.right-btn {
                right: 8px;
                bottom: 45px;
                transform: rotate(90deg);
              }

              &:hover {
                z-index: 9;
                cursor: pointer;
              }
            }

            &.disabled .btn {
              // pointer-events: none;
              cursor: not-allowed;
            }
          }
        }
      }

      .right {
        display: flex;
        flex-direction: column;
        flex: 1;

        .search-box {
          margin-bottom: 20px;
          :deep(.el-input__wrapper) {
            box-shadow: none;
            border-radius: 0;
            border: 1px solid rgba(255, 255, 255, 0.15);
            background: #0c284d;
          }
          :deep(.el-date-editor .el-range-input) {
            color: #fff;
          }

          .search-btn {
            float: left;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-left: 32px;
            width: 90px;
            height: 34px;
            background: rgba(0, 0, 0, 0.5);
            border: 1px solid #365375;
            color: #fff;
            text-align: center;
            cursor: pointer;

            .svg-icon {
              margin-right: 4px;
            }
          }
        }
        .play-box {
          flex: 1;
          background: #2aeaf7;

          margin-right: 20px;
        }
      }
    }
  }
}
</style>
