<template>
  <div>
    <div
      class="map-pop"
      v-if="showMore"
    >
      <div class="map-pop-box">
        <div class="map-pop-content">
          <div
            class="map-pop-title"
            style="display: flex; justify-content: space-between"
          >
            <div class="map-pop-title-text">{{ title }}</div>

            <img
              src="/images/pop-close.png"
              alt=""
              @click="close"
            />
          </div>
          <div class="map-pop-content-box">
            <div
              class="info"
              style="height: 100%; overflow: auto"
            >
              <!-- <img
                :src="'/fileApi/' + detail.coverimgurl"
                alt=""
                align="left"
                style="width: 200px; margin: 0 10px; object-fit: cover" /> -->
              <h2 style="text-align: center; margin-bottom: 10px">{{ detail.mc }}</h2>
              <h5 style="text-align: center; margin-bottom: 10px">
                作者：{{ detail.author || "暂无" }} | 来源：{{ detail.sources || "暂无" }} | 发布时间：{{
                  detail.publishtime || "暂无"
                }}
              </h5>
              <div
                class="htmlContent"
                v-dompurify-html="detail.contents"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      class="mark"
      v-if="showMore"
    ></div>
  </div>
</template>
<script lang="ts" setup>
const { proxy } = getCurrentInstance() as any
import Pagination from "@/components/Pagination/index.vue"
import { Close, Search } from "@element-plus/icons-vue"
import { reactive, ref, onMounted } from "vue"
const showMore = ref(false) //是否显示
const title = ref("") //标题
const detail = ref<any>({})

//关闭
const close = () => {
  showMore.value = false
}
onMounted(() => {
  proxy.$mitt.on("opendetail", (data: any) => {
    showMore.value = true
    title.value = data.txt
    detail.value = data.data
  })
})
onBeforeUnmount(() => {
  proxy.$mitt.off("opendetail")
})
</script>
<style lang="scss" scoped>
.more-page {
  position: absolute;
  top: 100px;
  left: 40px;
  right: 40px;
  bottom: 100px;
  background: #0b4238;
  z-index: 99;

  .box-con {
    // width: 520px;
    margin: 20px auto 30px;
    overflow-y: scroll;
    color: #fff;

    img {
      width: 100%;
    }
  }

  :deep(.el-input) {
    width: 100%;
    color: #fff;
    border: 1px solid rgba(1, 255, 209, 1);
    position: relative;
    border-radius: 1px;
    outline: none;
    text-indent: 25px;
    background-color: transparent;
    font-size: 14px;

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

    .el-input-group__append {
      background-color: transparent;
      color: #01ffd1;
      box-shadow: unset;

      .el-button {
        padding: 3px 11px;
        font-weight: 550;
      }
    }
  }

  .list {
    height: calc(100% - 216px);
    overflow: auto;
    margin-top: 20px;

    .item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
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
        border: 1px solid #3fffa3;

        box-shadow: inset 0px 0px 9.3px 0px #53ffc1;
      }

      &:hover {
        color: #3fffa3;
      }
    }
  }

  .pagination {
    display: flex;
    justify-content: center;
    margin-top: 36px;
  }
}

.map-pop {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 60%;
  background: rgba(18, 35, 53, 1);
  z-index: 99999;

  .map-pop-box {
    position: relative;
    // height: 335px;
    // width: 300px;
    width: 100%;
    height: 100%;
    background-size: 100% 100%;
    background-repeat: no-repeat;

    .map-pop-border {
      content: "";
      position: absolute;

      &.top {
        top: 0;
        width: 167px;
        height: 2px;
        //   background: url('@/assets/images/IntelligentPatrol/pop-border-top.svg') no-repeat;
        background:
          linear-gradient(135deg, transparent 0px, rgba(1, 255, 209, 1) 0) top left,
          linear-gradient(-135deg, transparent 0px, rgba(1, 255, 209, 1) 0) top right,
          linear-gradient(-45deg, transparent 2px, rgba(1, 255, 209, 1) 0) bottom right,
          linear-gradient(45deg, transparent 0px, rgba(1, 255, 209, 1) 0) bottom left;
        background-size: 50% 50%;
        background-repeat: no-repeat;
      }

      &.bottom {
        bottom: 0;
        right: 0;
        width: 167px;
        height: 2px;
        //   background: url('@/assets/images/IntelligentPatrol/pop-border-top.svg') no-repeat;
        background:
          linear-gradient(135deg, transparent 2px, rgba(1, 255, 209, 1) 0) top left,
          linear-gradient(-135deg, transparent 0px, rgba(1, 255, 209, 1) 0) top right,
          linear-gradient(-45deg, transparent 0px, rgba(1, 255, 209, 1) 0) bottom right,
          linear-gradient(45deg, transparent 0px, rgba(1, 255, 209, 1) 0) bottom left;
        background-size: 50% 50%;
        background-repeat: no-repeat;
      }

      &.left {
        bottom: 16px;
        width: 1px;
        height: 225px;
        background: linear-gradient(180deg, rgba(1, 255, 209, 0) 0%, #01ffd1 52.5%, rgba(1, 255, 209, 0) 100%);
      }

      &.right {
        bottom: 16px;
        right: 0;
        width: 1px;
        height: 225px;
        background: linear-gradient(180deg, rgba(1, 255, 209, 0) 0%, #01ffd1 52.5%, rgba(1, 255, 209, 0) 100%);
      }
    }

    .map-pop-content {
      width: 100%;
      height: 100%;
      padding: 16px 20px 16px 20px;

      .map-pop-title {
        padding: 0 30px;
        line-height: 16px;
        font-family: "Source Han Sans CN";
        font-size: 16px;
        font-weight: 500;
        color: #fff;

        img {
          width: 22px;
          height: 22px;
          margin: 5px 20px 0 0;
          float: right;
          cursor: pointer;
        }

        .map-pop-title-text {
          width: 112px;
          height: 32px;
          line-height: 32px;
          text-align: center;
          margin-bottom: 10px;
        }
      }

      .map-pop-content-box {
        width: 100%;
        max-height: 80vh;
        overflow-y: auto;
        height: calc(100% - 42px);
        padding: 13px 30px 0;
        margin: 0 auto;
        color: #fff;
        // background: rgba(13, 54, 101, 0.5);
        .box-con {
          width: 520px;
          margin: 60px auto 30px;
        }

        :deep(.el-input) {
          width: 60%;
          height: 30px;
          color: #fff;
          border: 1px solid rgba(1, 255, 209, 1);
          position: relative;
          border-radius: 1px;
          outline: none;
          text-indent: 25px;
          background-color: transparent;
          font-size: 14px;
          background: #0f221e;

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

          .el-input-group__append {
            background-color: transparent;
            color: #01ffd1;
            box-shadow: unset;

            .el-button {
              padding: 3px 11px;
              font-weight: 550;
            }
          }
        }

        .list {
          height: calc(100% - 160px);
          overflow: auto;
          margin-top: 20px;

          .item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
            font-size: 16px;
            font-weight: normal;
            font-family: 思源黑体;
            text-align: justify;
            /* 浏览器可能不支持 */
            color: rgba(#fff, 0.75);
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
              border: 1px solid #3fffa3;

              box-shadow: inset 0px 0px 9.3px 0px #53ffc1;
            }

            &:hover {
              color: #3fffa3;
            }
          }
        }

        .pagination {
          display: flex;
          justify-content: center;
          margin-top: 36px;
        }
      }
    }
  }
}

.mark {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 9999;
  width: 100%;
  height: 100%;
  background-color: #000;
  opacity: 0.5;
}

.info::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Edge */
}
</style>
