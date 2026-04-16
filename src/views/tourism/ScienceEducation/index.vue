<!-- 科普宣教 -->
<template>
  <div class="popular-science-education">
    <div style="width: 100%; height: 100%">
      <div class="row row1">
        <div class="col">
          <div class="row1-box1">
            <KeySpecies
              @getList="getList"
              :dataList="dataList5"
            ></KeySpecies>
          </div>
          <div class="row1-box1-2">
            <VirtualSpecimenMuseum></VirtualSpecimenMuseum>
          </div>
        </div>
        <div class="col">
          <div class="row1-box2">
            <EducationActivities
              @getList="getList"
              :dataList="dataList1"
            ></EducationActivities>
          </div>

          <!-- <VirtualSpecimenMuseum></VirtualSpecimenMuseum> -->
        </div>
        <div class="col">
          <div class="row1-box3">
            <CollaborativeOutcomes
              @getList="getList"
              :dataList="dataList2"
            ></CollaborativeOutcomes>
          </div>
          <div class="row1-box3-1">
            <Law
              @getList="getList"
              :dataList="dataList4"
            ></Law>
          </div>
        </div>
      </div>
      <div class="row row2">
        <div class="col">
          <div class="row2-box1">
            <EyeSecretRealm></EyeSecretRealm>
          </div>
        </div>
        <div class="col">
          <div class="row2-box2">
            <LearningClassroom
              @getList="getList"
              :dataList="dataList3"
            ></LearningClassroom>
          </div>
        </div>
      </div>
      <MorePage></MorePage>
      <DetailPage></DetailPage>
      <dialogEyeSecretRealm></dialogEyeSecretRealm>
    </div>
    <specimenMuseum v-if="isShowSpecimenMuseum"></specimenMuseum>
  </div>
</template>
<script lang="ts" setup>
import EducationActivities from "./components/EducationActivities.vue" //宣教活动
import CollaborativeOutcomes from "./components/CollaborativeOutcomes.vue"
import EyeSecretRealm from "./components/EyeSecretRealm.vue" //秘境之眼
import KeySpecies from "./components/keySpecies.vue"
import Law from "./components/law.vue"
import LearningClassroom from "./components/LearningClassroom.vue" //学习课堂
import VirtualSpecimenMuseum from "./components/VirtualSpecimenMuseum.vue"
import MorePage from "./components/more.vue"
import DetailPage from "./components/detail.vue"
import dialogEyeSecretRealm from "./components/dialogEyeSecretRealm.vue"
import specimenMuseum from "./components/specimenMuseum.vue"
import { scienceEducationApi } from "@/api/ScienceTourism/index"
const { proxy } = getCurrentInstance() as any
const dataList1 = <any>ref([]) //宣教活动
const dataList2 = <any>ref([]) //共建成果
const dataList3 = <any>ref([]) //学习课堂
const dataList4 = <any>ref([]) //法律法规
const dataList5 = <any>ref([]) //动物救助
const getList = (typename: any, typeid: any) => {
  dataList1.value = []
  dataList2.value = []
  dataList3.value = []
  dataList4.value = []
  dataList5.value = []
  scienceEducationApi.Getg_kyjcByPage({ typename: typename }).then((res: any) => {
    if (res.success) {
      if (typename == "宣教活动") {
        dataList1.value = res.response.data
      } else if (typename == "共建成果") {
        dataList2.value = res.response.data
      } else if (typename == "学习课堂") {
        dataList3.value = res.response.data
      } else if (typename == "法律法规") {
        dataList4.value = res.response.data
      } else if (typename == "动物救助") {
        dataList5.value = res.response.data
      }
    }
  })
}
const isShowSpecimenMuseum = ref<any>(false)
onMounted(() => {
  proxy.$mitt.on("openSpecimenMuseum", (data: any) => {
    isShowSpecimenMuseum.value = true
  })
  proxy.$mitt.on("closeSpecimenMuseum", (data: any) => {
    isShowSpecimenMuseum.value = false
  })
})
onBeforeUnmount(() => {
  proxy.$mitt.off("openSpecimenMuseum")
  proxy.$mitt.off("closeSpecimenMuseum")
})
</script>
<style lang="scss">
.popular-science-education {
  position: relative;
  width: 100%;
  padding: 0 20px;
  font-size: 14px;
  padding-top: 35px;
  height: 100%;
  z-index: 0;
  .row {
    display: flex;
    justify-content: space-between;
  }

  .row1 {
    height: calc((100% - 40px) / 3 * 2);
    margin-bottom: vh(20);
    // background: #fff;

    .row1-box1 {
      position: relative;
      width: vw(420);
      height: calc((100% - 20px) / 2);
      margin-bottom: vh(20);
      // z-index: 999;
      // background: #333;
    }
    .row1-box1-2 {
      position: relative;
      width: vw(420);
      height: calc((100% - 14px) / 2);
      z-index: 999;
      background: #333;
    }

    .row1-box2 {
      position: relative;
      width: vw(1000);
      height: 100%;
      margin-bottom: vh(20);
      z-index: 999;
      background: #333;
    }

    .row1-box3 {
      position: relative;
      width: vw(420);
      height: calc((100% - 20px) / 2);
      margin-bottom: vh(20);
      z-index: 999;
      background: #333;
    }
    .row1-box3-1 {
      position: relative;
      width: vw(420);
      height: calc((100% - 14px) / 2);

      z-index: 999;
      background: #333;
    }
  }

  .row2 {
    height: calc((100% - 40px) / 3);
    // background: #393a39;

    .row2-box1 {
      position: relative;
      width: vw(1440);
      height: 100%;
      //   margin-bottom: vh(20);
      z-index: 999;
      // background: #969494;
    }

    .row2-box2 {
      position: relative;
      width: vw(420);
      height: 100%;
      //   margin-bottom: vh(20);
      z-index: 999;
      // background: #aea9a9;
    }
  }

  .box {
    // background: rgba(11, 66, 56, 1);
    .box-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 36px;
      background: linear-gradient(90deg, rgba(1, 255, 209, 0.1) -3%, rgba(1, 255, 209, 0) 100%);

      .box-header-title {
        flex: 1;
        font-size: 16px;
        color: #fff;
        font-weight: 500;
        margin-left: 20px;
      }

      .box-header-more {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        color: #fff;
        font-weight: 400;
        margin-right: 20px;
        width: 50px;
        height: 20px;
        box-sizing: border-box;
        border: 1px solid rgba(255, 255, 255, 0.5);
        border-radius: 1px;
        background: #45a486;
        cursor: pointer;

        &::after {
          content: "";
          display: inline-block;
          width: 16px;
          height: 16px;
          //   background: url("/statisUrl/arrow-right.svg");
        }
      }

      .box-header-colse {
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 24px;
        margin-right: 20px;
        cursor: pointer;
      }
    }

    .box-con {
      height: calc(100% - 35px);
      padding: 10px 20px;
    }
  }
}
.wrap {
  pointer-events: all;
  color: #ffffff;
  position: relative;

  background: url("@/assets/images/panel-bg.png") no-repeat center center/100% 100%;
  // background: linear-gradient(180deg, #0c2022 3%, #0f352e 86%, #084242 115%);
  box-sizing: border-box;
  border: 1.2px solid;
  border-image: linear-gradient(180deg, rgba(193, 242, 224, 0.15) 3%, rgba(255, 255, 255, 0.35) 115%);
  backdrop-filter: blur(50px);
  z-index: 0;
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
      flex-direction: column;
      align-items: center;
      height: 28px;
      padding: 2px;
      width: 46px;
      border-radius: 1px;

      // border-bottom: 1px solid #beccdc;
      color: #fff;

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
        // transition: all 1s ease 0s;

        // &.active {
        //   opacity: 1;
        //   font-weight: 600;
        //   color: #fff;
        //   // border: 1px solid #42c9c7;

        //   background: linear-gradient(90deg, #59bbf2 0%, #336c8c 100%);
        // }
      }

      .tabline {
        margin-top: -5px;
        width: 30px;
        height: 1px;
        background: #beccdc;
      }
    }
  }
}
.line {
  margin-top: -2px;
  height: 5px;
  background: url("@/assets/images/title-line.png") no-repeat center center / cover;
}

.wrap-con {
  height: calc(100% - 41px);
  overflow: hidden;
  padding: vw(10);
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  .item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: vh(16);
    font-size: 16px;
    font-weight: normal;
    font-family: 思源黑体;
    text-align: justify;
    /* 浏览器可能不支持 */
    color: #ffffff;
    cursor: pointer;

    .name {
      flex: 1;
      margin-right: 10px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &:last-child {
      margin-bottom: 0;
    }

    &::before {
      content: "";
      display: inline-block;
      width: 8px;
      height: 8px;
      margin-right: 10px;
      border-radius: 50%;
      border: 1px solid #bfe7ff;
      // box-shadow: inset 0px 0px 9.3px 0px #53ffc1;
      background: #bfe7ff;
      box-shadow: 0px 0px 8px 3px #00aeff80;
    }

    &:hover {
      color: #00e3ff;
    }
  }

  .no-before-style::before {
    content: none; /* 或者你可以设置其他属性来隐藏或改变伪元素 */
    display: none; /* 这将完全隐藏伪元素 */
  }
}

.first-list {
  width: 100%;
  height: vh(120);
  // background: #333;
  display: flex;
  .img-box {
    width: 113px;
    background: #fff;
    margin-right: 10px;
  }
  .content-box {
    flex: 1;
    .time {
      font-family: FZLanTingHeiS-R-GB;
      font-size: 12px;
      font-weight: 400;
      line-height: 18px;
      text-align: left;
      text-underline-position: from-font;
      text-decoration-skip-ink: none;
    }

    .title {
      height: 18px;
      font-family: Microsoft YaHei;
      font-size: 14px;
      font-weight: 700;
      line-height: 18px;
      text-align: left;
      text-underline-position: from-font;
      text-decoration-skip-ink: none;
      color: #00e3ff;
    }

    // .discripe {
    //   font-family: FZLanTingHeiS-R-GB;
    //   font-size: 12px;
    //   font-weight: 400;
    //   line-height: 18px;
    //   text-align: left;
    //   text-underline-position: from-font;
    //   text-decoration-skip-ink: none;
    //   color: #d8ebfd;
    // }

    .info {
      height: 56px;
      padding: 10px 0;
      color: #d8ebfd;
      font-size: 12px;
      font-weight: normal;
      font-weight: 400;
      line-height: 18px;
      span {
        // text-indent: 2em;
        display: -webkit-box; /* 必须设置display属性为-webkit-box */
        overflow: hidden; /* 超出部分隐藏 */
        text-overflow: ellipsis; /* 显示省略号 */
        -webkit-line-clamp: 2; /* 限制显示两行 */
        -webkit-box-orient: vertical; /* 垂直方向上的换行 */
      }
      &:hover {
        color: #00e3ff;
      }
    }
  }
}
</style>
