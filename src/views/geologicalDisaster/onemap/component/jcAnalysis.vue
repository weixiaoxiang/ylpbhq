<template>
  <div class="mask">
    <div class="jcAnalysis">
      <div class="dialogleft">
        <div class="content">
          <div
            class="left-item"
            :class="{ active: item.value == activeleftTab }"
            v-for="(item, index) in lefttabs"
            :key="index"
            @click="changeleftTab(item)"
          >
            <img
              v-if="item.value !== activeleftTab"
              :src="item.iconurl"
              style="width: 20px; height: 18.23px; margin-left: 16px; margin-right: 8px"
            />
            <img
              v-else
              :src="item.iconactive"
              style="width: 20px; height: 18.23px; margin-left: 16px; margin-right: 8px"
            />
            <div
              v-if="item.value !== activeleftTab"
              class="text"
            >
              {{ item.name }}
            </div>
            <div
              v-else
              class="text1"
            >
              {{ item.name }}
            </div>
          </div>
        </div>
      </div>
      <dzspjkdialog v-if="activeleftTab == 1"></dzspjkdialog>
      <jcfxdialog v-if="activeleftTab == 2"></jcfxdialog>
      <yjjldialog v-if="activeleftTab == 3"></yjjldialog>

      <div
        class="closepop"
        @click="ClosePop"
      ></div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import dzspjkdialog from "./dzspjkdialog.vue"
import jcfxdialog from "./jcfxdialog.vue"

import yjjldialog from "./yjjldialog.vue"

const emit = defineEmits(["ClosePop"])
const ClosePop = () => {
  emit("ClosePop")
}
const activeleftTab = ref(1)
//lefttab
const lefttabs = ref<any>([
  {
    name: "地灾视频监控",
    iconurl: "/images/geologicalDisaster/left1.png",
    iconactive: "/images/geologicalDisaster/leftactive1.png",
    value: 1
  },
  {
    name: "监测分析",
    iconurl: "/images/geologicalDisaster/left2.png",
    iconactive: "/images/geologicalDisaster/leftactive2.png",
    value: 2
  },
  {
    name: "预警记录",
    iconurl: "/images/geologicalDisaster/left3.png",
    iconactive: "/images/geologicalDisaster/leftactive3.png",
    value: 3
  }
])
//切换lefttab
const changeleftTab = (item: any) => {
  activeleftTab.value = item.value //控制统计分析中的tab切换
}

onMounted(() => {})
</script>

<style lang="scss" scoped>
.mask {
  position: fixed;
  margin-left: -20px;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 999;
}
.jcAnalysis {
  position: absolute; /* 固定位置 */
  z-index: 1000; /* 确保模态对话框位于顶部，可以根据需要调整 */
  left: 50%;
  top: 45%;
  transform: translate(-50%, -50%);
  display: flex; /* 使用flex布局来实现居中 */
  gap: 10px;

  .dialogleft {
    background: url("images/geologicalDisaster/dialogleft.png") no-repeat center center / cover;
    width: 158px;
    height: vh(879);
    z-index: 10000;
    .content {
      margin-top: 60px;
    }
    .left-item {
      display: flex;
      margin-bottom: 20px;
      align-items: center;
      cursor: pointer;
      &.active {
        background: linear-gradient(-90deg, rgba(30, 60, 112, 0.2) 0%, #1e3c70 100%);

        &::before {
          content: "";
          display: inline-block;
          width: 4px;
          height: 40px;
          background: #25ccea;
        }
      }

      .text {
        font-family: Microsoft YaHei;
        font-size: 18px;
        font-weight: 400;
        line-height: 40px;
        text-align: left;
        text-underline-position: from-font;
        text-decoration-skip-ink: none;
        color: #5e8bb8;
        font-size: 16px;
      }
      .text1 {
        font-family: Microsoft YaHei;
        font-size: 18px;
        font-weight: 400;
        line-height: 40px;
        text-align: left;
        text-underline-position: from-font;
        text-decoration-skip-ink: none;
        color: #fff;
        font-size: 16px;
      }
    }
  }
  .closepop {
    position: absolute;
    top: 0%;
    right: 10px;
    width: 40px;
    height: 40px;
    background: url("/images/geologicalDisaster/closepop.png") no-repeat center center / 20px 20px;
    cursor: pointer;
  }

  .data-panel {
    width: vw(1616);
    height: vh(885);
    margin-left: vw(220);
    margin-top: vh(110);
    background: url("/images/geologicalDisaster/dialog-bg.png") no-repeat center center / 100% 100%;
    display: flex;
    flex-direction: column;
    .title-box {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 70px;
      color: #fff;
      img {
        width: 1.3542vw;
        margin-right: 0.5208vw;
      }
    }
    .mian {
      flex: 1;
      display: flex;
      padding: 0 24px;
      flex-direction: column;
      overflow-y: hidden;
      height: calc(100% - 70px);

      .wrapjc {
        background: none !important;

        .wrap-header {
          display: flex;
          align-items: center;
          height: 18px;
          padding: 0 16px;
          color: #fff;
          font-size: 16px;
          font-weight: 700;

          .jt {
            width: 16px;
            height: 15px;
            background: url("/images/geologicalDisaster/dialogimage/jt.png") no-repeat center center;
          }
          .titlename {
            width: 100%;
            height: 18px;
            margin-left: 10px;

            color: #2cfefe;
          }
        }

        .wrap-content {
          padding: 20px;
        }
      }
      .wrap1 {
        .select-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          --el-input-border-color: #0052d9;
          .status-box {
            flex: 1;
            .box {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 67px;
              height: 32px;
              margin-left: 10px;
              border-radius: 3px;
              background: rgba(0, 207, 158, 0.1);
              border: 1px solid rgba(0, 207, 158, 1);
              color: rgba(0, 207, 158, 1);
              .icon {
                position: relative;
                width: 66px;
                height: 36px;
                margin-right: 5px;
                border-radius: 50%;
                background: rgba(0, 207, 158, 0.3);
                &::before {
                  content: "";
                  position: absolute;
                  left: 50%;
                  top: 50%;
                  transform: translateX(-50%) translateY(-50%);
                  width: 8px;
                  height: 8px;
                  border-radius: 50%;
                  background: rgba(0, 207, 158, 1);
                }
              }
              span {
                font-weight: 500;
                font-size: 14px;
              }
            }
            .offline {
              background: rgba(153, 153, 153, 0.1);
              border: 1px solid rgba(153, 153, 153, 1);
              color: #999;
              .icon {
                background: rgba(153, 153, 153, 0.3);

                &::before {
                  content: "";
                  background: #999;
                }
              }
            }
            .blue {
              background: rgba(0, 82, 217, 0.1);
              border: 1px solid rgba(0, 82, 217, 1);
              color: #999;

              .icon {
                background: rgba(0, 82, 217, 0.3);

                &::before {
                  content: "";
                  background: rgba(0, 82, 217, 1);
                }
              }
            }
            .yellow {
              background: rgba(217, 182, 0, 0.1);
              border: 1px solid rgba(217, 182, 0, 1);
              color: #999;

              .icon {
                background: rgba(217, 182, 0, 0.3);

                &::before {
                  content: "";
                  background: rgba(217, 182, 0, 1);
                }
              }
            }
            .orange {
              background: rgba(217, 117, 0, 0.1);
              border: 1px solid rgba(217, 117, 0, 1);
              color: #999;

              .icon {
                background: rgba(217, 117, 0, 0.3);

                &::before {
                  content: "";
                  background: rgba(217, 117, 0, 1);
                }
              }
            }
            .red {
              background: rgba(217, 26, 0, 0.1);
              border: 1px solid rgba(217, 26, 0, 1);
              color: #999;

              .icon {
                background: rgba(217, 26, 0, 0.3);

                &::before {
                  content: "";
                  background: rgba(217, 26, 0, 1);
                }
              }
            }
          }
          .updatetime {
            margin-left: 40px;
            opacity: 0.5;
            color: #000000;
          }
          :deep(.el-input__wrapper) {
            border-radius: 3px;
          }
        }
        .jc-data {
          display: flex;
          align-content: center;
          justify-content: space-between;

          margin-top: 20px;
          .odd-background {
            width: 193.67px;
            height: 65.33px;
            background: url("/images/geologicalDisaster/row1-2.png") no-repeat center center;
            background-size: 100% 100%;
          }
          .even-background {
            width: 193.67px;
            height: 65.33px;
            background: url("/images/geologicalDisaster/row1-1.png") no-repeat center center;
            background-size: 100% 100%;
          }
          .data-item {
            display: flex;
            align-items: center;
            width: 193.67px;
            height: 65.33px;

            .icon {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 66px;
              height: 36px;
              margin-right: 16px;
              img {
                width: 28px;
                height: 28px;
              }
            }
            .data {
              .name {
                color: #beccdc;
                font-family: Microsoft YaHei;
                font-size: 12px;
                font-weight: 400;
                line-height: 18px;
                text-align: left;
                text-underline-position: from-font;
                text-decoration-skip-ink: none;
              }
              .value {
                color: #3be3de;
                font-family: Quantico;
                font-size: 20px;
                font-weight: 700;
                line-height: 18px;
                text-align: left;
                text-underline-position: from-font;
                text-decoration-skip-ink: none;
              }
            }
          }
        }
      }
      .wrap2 {
        height: calc(100% - 185px);
        .wrap2-content {
          height: calc(100% - 90px);
          background-color: #000;
        }
        .tabs {
          display: flex;
          align-items: center;
          margin-top: 18px;
          .tab-item {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 161px;
            height: 38px;
            color: #ffffff;
            font-family: FZLanTingHeiS-R-GB;
            line-height: 18px;
            text-align: left;
            text-underline-position: from-font;
            text-decoration-skip-ink: none;

            font-size: 14px;
            font-weight: normal;
            margin-right: 9px;
            background: url("/images/geologicalDisaster/row2-2.png") no-repeat center center;
            background-size: 100% 100%;
            cursor: pointer;
            &.active {
              color: #2cfefe;
              background: url("/images/geologicalDisaster/row2-1.png") no-repeat center center;
              background-size: 100% 100%;
            }
          }
        }
        .search-box {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 35px;
          height: 36px;
          .btns {
            display: flex;
            align-items: center;
            border: 1px solid rgba(0, 0, 0, 0.1);
            height: 36px;

            .btn {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 78px;
              height: 36px;
              color: #000000;
              font-size: 16px;
              cursor: pointer;

              .svg-icon {
                margin-right: 10px;
              }

              &.active {
                color: #0052d9;
                background: rgba(0, 82, 217, 0.2);
              }
            }
          }
        }
        .table-box,
        .echart-box {
          overflow: auto;
          height: calc(100% - 36px);
          padding-top: 15px;
          .chart {
            width: 100%;
            height: 100%;
            background-color: #16d148;
          }
        }
        .wyxb-box {
          height: 100%;
          width: 100%;
          background-color: #fff;

          .b2 {
            width: 10px;
            height: 10px;
            background: #16d148;
            border-radius: 50%;
          }
          .cszb {
            position: absolute;
            left: 151px;
            top: 76px;
            transform: translateX(-50%) translateY(-50%);
          }
          .currentposition {
            position: absolute;
            z-index: 2;
            transform: scale(1);
            font-weight: 700;
          }
          .yj-circle {
            position: absolute;
            left: 151px;
            top: 76px;
            transform: translateX(-50%) translateY(-50%);
            border-radius: 50%;
            border: 1px solid;
          }
          .row1 {
            position: relative;
            display: flex;
            align-items: center;
            height: 50%;
            .zb {
              position: relative;
              width: 300px;
              height: 150px;
              .xline {
                position: absolute;
                top: 0;
                bottom: 0;
                width: 1px;
                background: #e7e7e7;
              }
              .yline {
                position: absolute;
                left: 0;
                right: 0;
                height: 1px;
                background: #e7e7e7;
              }
              .x {
                position: absolute;
                top: 0;
                bottom: 0;
                left: 150px;
                width: 2px;
                background: #16d148;
                &::after {
                  content: "Y北方向";
                  display: inline-block;
                  position: absolute;
                  top: 0;
                  left: 15px;
                  color: #333;
                  font-size: 14px;
                  white-space: nowrap;
                }
              }
              .y {
                position: absolute;
                left: 0;
                right: 0;
                top: 75px;
                height: 2px;
                background: #16d148;
                &::after {
                  content: "X东方向";
                  display: inline-block;
                  position: absolute;
                  top: 5px;
                  right: 0;
                  color: #333;
                  font-size: 14px;
                  white-space: nowrap;
                }
              }
            }
            .rule {
              width: 300px;
              height: 150px;
            }
          }
          .row2 {
            width: 100%;
            margin-top: 16px;
          }
          .row3 {
            display: flex;
            align-items: center;
            height: 20px;
            margin-bottom: 10px;
            .col {
              display: flex;
              align-items: center;
              margin-right: 20px;
              span {
                margin-left: 6px;
              }
            }
            .b1 {
              width: 15px;
              height: 15px;
              border: 1px solid #e7e7e7;
            }

            .b3 {
              height: 16px;
              color: #000;
              font-size: 14px;
            }
          }
          .wy-tabs {
            position: absolute;
            bottom: 0;
            right: 0;
            display: flex;
            height: 40px;
            border-radius: 4px;
            overflow: hidden;
            border: 1px solid #e7e7e7;
            .tab {
              width: 40px;
              line-height: 40px;
              color: #333;
              cursor: pointer;
              text-align: center;
              &:nth-child(2) {
                border-left: 1px solid #e7e7e7;
                border-right: 1px solid #e7e7e7;
              }
              &.active {
                background: #0052d9;
                color: #fff;
              }
            }
          }
        }
      }
    }
  }
}
</style>
<style lang="scss">
.custom-segmented {
  background: #08203b !important;
  .el-segmented__item-selected {
    background: #194570;
  }
  .el-segmented__item-label {
    font-size: 0.7292vw;
    color: #beccdc;
  }
  .el-segmented__item.is-selected {
    .el-segmented__item-label {
      color: #fff !important;
    }
  }
  .el-segmented__item {
    padding: 0 4px;
  }
  .el-segmented__item:not(.is-disabled):not(.is-selected):hover {
    background: #04101e;
  }
}

.el-select__wrapper {
  align-items: center;
  background-color: #0c284d;
  // border-radius: var(--el-border-radius-base);
  box-shadow: none !important;
  box-sizing: border-box;
  border: 1px solid #ffffff26;

  cursor: pointer;
  display: flex;
  font-size: 14px;
  gap: 6px;
  line-height: 24px;
  min-height: 32px;
  padding: 4px 12px;
  position: relative;
  text-align: left;
  transform: translateZ(0);
  transition: var(--el-transition-duration);
}
</style>
