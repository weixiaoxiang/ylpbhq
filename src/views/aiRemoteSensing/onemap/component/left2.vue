<template>
  <div class="left2 wrapair">
    <div class="wrap-header">
      <div class="title-content">
        <img
          class="title-logo"
          :src="$fun.getImg('title-icon.svg')"
          alt=""
        />
        <div class="title">生物多样性</div>
      </div>
    </div>
    <div class="line"></div>
    <div class="wrap-con">
      <div class="contain1">
        <div class="box1">
          <img
            :src="$fun.getImg('backgroundResources/bhdj-img1.png')"
            alt=""
          />
          <div class="text-box">
            <div class="dj">国家Ⅰ级</div>
            <div>
              动物<span class="value"
                ><b>{{ bhdjData.oneanimalcount }}</b
                >种</span
              >
            </div>
            <div>
              植物<span class="value"
                ><b>{{ bhdjData.oneplantcount }}</b
                >种</span
              >
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
              动物<span class="value"
                ><b>{{ bhdjData.twoanimalcount }}</b
                >种</span
              >
            </div>
            <div>
              植物<span class="value"
                ><b>{{ bhdjData.twoplantcount }}</b
                >种</span
              >
            </div>
          </div>
        </div>
      </div>
      <div class="contain2">
        <div class="box1">
          <div class="bg">
            <div class="imgbox1"></div>
          </div>

          <div class="text-box">
            <div class="zx">珍稀动物</div>
            <div class="text">
              <span class="value">{{ bhdjData.zxanimalcount }}</span
              >种
            </div>
          </div>
        </div>
        <div class="box2">
          <div class="bg">
            <div class="imgbox2"></div>
          </div>
          <div class="text-box">
            <div class="zx">珍稀植物</div>
            <div class="text">
              <span class="value">{{ bhdjData.zxplantcount }}</span
              >种
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { GetAnimalsPlantsStatisticalAnalysis_Bhdj } from "@/api"

// 生物多样性数据
const bhdjData = ref<any>({
  zxplantcount: 0,
  zxanimalcount: 0,
  oneplantcount: 0,
  oneanimalcount: 0,
  twoplantcount: 0,
  twoanimalcount: 0,
  twopanthcount: 0
})
const getData = async () => {
  const { response } = await GetAnimalsPlantsStatisticalAnalysis_Bhdj()
  bhdjData.value = response
}

onMounted(() => {
  getData()
})
onBeforeUnmount(() => {})
</script>
<style lang="scss" scoped>
.left2 {
  height: vh(278);
  margin-top: vh(15);
}
.wrapair {
  pointer-events: all;
  color: #ffffff;
  position: relative;

  background: url("/images/cb-bg.png") no-repeat center center/100% 100%;

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
    position: relative;

    .contain1 {
      height: 50%;
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
            b {
              font-size: 1.1458vw;
            }
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
    .contain2 {
      height: 50%;
      display: flex;
      align-items: center;
      font-size: 0.7292vw;
      margin-top: 10px;
      .box1,
      .box2 {
        flex: 1;
        display: flex;

        .bg {
          width: 109.74px;
          height: 65.22px;
          position: relative;
          background: url("/images/aiRemoteSensing/swdyx-bg.png") no-repeat center center / cover;
          .imgbox1 {
            width: 43px;
            height: 43px;
            position: absolute;
            background: url("/images/aiRemoteSensing/zxdw.png") no-repeat center center / cover;
            left: 50%;
            top: -10px;
            transform: translateX(-50%);
          }
          .imgbox2 {
            width: 43px;
            height: 43px;
            position: absolute;
            background: url("/images/aiRemoteSensing/zxzw.png") no-repeat center center / cover;
            left: 50%;
            top: -10px;
            transform: translateX(-50%);
          }
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
          .zx {
            font-family: FZZongYi-M05;
            font-size: 20px;
            font-weight: 400;
            line-height: 18px;
            text-align: left;
            text-underline-position: from-font;
            text-decoration-skip-ink: none;

            color: #d8ebfd;
          }
          .text {
            font-family: Microsoft YaHei;
            font-size: 10px;
            font-weight: 700;
            line-height: 18px;
            text-align: left;
            text-underline-position: from-font;
            text-decoration-skip-ink: none;

            color: #d8ebfd;
          }
          .value {
            font-family: Microsoft YaHei;
            font-size: 20px;
            font-weight: 700;
            line-height: 18px;
            text-align: left;
            text-underline-position: from-font;
            text-decoration-skip-ink: none;

            color: #d8ebfd;
          }
        }
      }
      // .box2 {
      //   .text-box {
      //     .dj {
      //       color: #20d2d4;
      //     }
      //     .value {
      //       color: #20d2d4;
      //     }
      //   }
      // }
    }
  }
}

:deep(.el-input) {
  // width: 90%;
  height: 30px;
  color: #fff;

  border: 1px solid #ffffff26;
  position: relative;
  border-radius: 1px;
  outline: none;
  text-indent: 25px;
  background-color: transparent;
  font-size: 14px;
  background: rgba(13, 54, 101, 0.5);

  .el-input__wrapper {
    padding: 0px 7px;
    box-shadow: unset;
    background-color: transparent;

    .el-input__inner {
      color: #fff;
    }

    .el-input__inner::placeholder {
      font-size: 12px;
      color: rgba(217, 217, 217, 0.5);
    }

    &.is-focus {
      box-shadow: unset;
    }
  }
  // background: #0C284D;

  .el-input-group__append {
    background-color: transparent;
    color: #fff;
    box-shadow: unset;

    .el-button {
      padding: 3px 11px;
      font-weight: 550;
    }
  }
}
</style>
