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
            <el-input
              class="searchbox"
              v-model="queryForm.mc"
              size="large"
              placeholder="请输入关键字查询"
            >
              <template #append>
                <el-button
                  :icon="Search"
                  size="small"
                  @click="search()"
                />
              </template>
            </el-input>
            <div
              class="list"
              v-loading="loading"
              element-loading-background="rgba(18, 35, 53, 0.8)"
            >
              <div
                class="item"
                v-for="(item, index) in list"
                :key="index"
                @click="toDetail(item)"
              >
                <span class="name">{{ item.mc }}</span>
                <span class="time">{{ item.publishtime }}</span>
              </div>
              <div v-if="list.length == 0">暂无数据</div>
            </div>
            <div class="pagination">
              <Pagination
                :background="true"
                layout="prev, pager, next"
                :total="total"
                v-model:page="queryForm.page"
                v-model:page-size="queryForm.intPageSize"
                @pagination="handleChangePage"
              ></Pagination>
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
import { scienceEducationApi } from "@/api/ScienceTourism/index"
const showMore = ref(false) //是否显示
const title = ref("") //标题
const emit = defineEmits(["getList"])
let props = defineProps(["dataList"])
const queryForm = reactive({
  page: 1,
  intPageSize: 10,
  mc: "",
  typename: "",
  typeid: ""
})
const total = ref(0)
const list = ref<any>([])
const showVideo = ref(false)
const loading = ref<any>(false)
//获取数据
const getData = () => {
  loading.value = true
  scienceEducationApi
    .Getg_kyjcByPage(queryForm)
    .then((res: any) => {
      if (res.success) {
        list.value = res.response.data
        total.value = res.response.dataCount
      } else {
        list.value = []
        total.value = 0
      }
      loading.value = false
    })
    .finally(() => {})
}
//查询
const search = () => {
  queryForm.page = 1
  getData()
}
//分页
const handleChangePage = (info: any) => {
  queryForm.page = info.page
  getData()
}
//关闭
const close = () => {
  showMore.value = false
}
//查看详情
const toDetail = (item: any) => {
  proxy.$mitt.emit("opendetail", { data: item, txt: title.value })
}
onMounted(() => {
  proxy.$mitt.on("openmore", (data: any) => {
    showMore.value = true
    if (data.typename == "秘境之眼") {
      showVideo.value = true
      title.value = data.typename
    } else {
      showVideo.value = false
      if (data.typename == "宣教活动") {
        title.value = "宣教活动"
      } else {
        title.value = data.typename
      }
      queryForm.mc = ""
      queryForm.page = 1
      // queryForm.typeid = data.typeid
      queryForm.typename = data.typename
      list.value = []
      total.value = 0
      getData()
    }
  })
})
onBeforeUnmount(() => {
  proxy.$mitt.off("openmore")
})
</script>
<style lang="scss" scoped>
.map-pop {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 60%;
  max-height: 80%;
  z-index: 99999;
  background: rgba(18, 35, 53, 1);
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
        height: calc(100% - 42px);
        padding: 13px 10px 0;
        color: #fff;
        text-align: center;

        .box-con {
          width: 520px;
          margin: 60px auto 30px;
        }

        :deep(.el-input) {
          width: 60%;
          height: 30px;
          color: #fff;
          border: 1px solid #fff; //改为白色
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

        .list {
          height: calc(100% - 160px);
          overflow: auto;
          margin-top: 20px;
          padding: 0 30px;

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
              border: 1px solid #bfe7ff;
              background: #bfe7ff;
              box-shadow: 0px 0px 8px 3px #00aeff80;
            }

            &:hover {
              color: #00e3ff;
            }
          }
        }

        .pagination {
          display: flex;
          justify-content: center;
          margin-top: 36px;
          overflow: hidden;
          :deep(.el-pagination) {
            margin-bottom: 10px;
            justify-content: center;
            font-size: 0.7292vw;
            .el-select {
              width: 6.6667vw;
            }
            .el-pager {
              li {
                color: #fff;
                margin: 0 0.2604vw;
                background-color: #0b2a4e;
                border-top-left-radius: 10px;
                border-bottom-right-radius: 10px;
                font-size: 0.7292vw;
                min-width: 1.6667vw;
              }
              li.is-active {
                color: #fff;
                background-color: #5886b2;
                border-top-left-radius: 10px;
                border-bottom-right-radius: 10px;
              }
            }
            .el-pagination__sizes,
            .el-pagination__total {
              color: #fff;
            }
            .el-input__wrapper {
              padding: 1px 2px;
              background-color: rgba(60, 93, 128, 0.5);
              box-shadow: none;
              .el-input__inner {
                color: #fff;
              }
            }
            .el-pagination__editor.el-input {
              width: 2.0833vw;
            }
            .el-pagination__jump {
              color: #fff;
              margin-left: 0.8333vw;
            }
            button,
            button.is-disabled,
            button:disabled {
              background: none;
              color: #fff;
              min-width: 1.6667vw;
              margin-left: 0.8333vw;
            }
          }
        }

        // div {
        //   margin-bottom: 10px;
        //   width: 340px;
        //   height: 204px;
        // }

        .info-box {
          max-height: 350px;
          overflow-y: auto;

          .info-content {
            li {
              width: 100%;
              font-family: "Source Han Sans CN";
              font-size: 14px;
              line-height: 21px;
              color: rgba(255, 255, 255, 0.75);

              &.inline {
                display: inline-block;
                width: calc(50% - 5px);
              }

              &.media {
                display: flex;
                margin-top: 3px;
                line-height: 14px;

                .media-box {
                  width: 470px;
                }

                &:last-child {
                  margin-top: 10px;
                }
              }

              :deep(.el-image),
              video {
                width: 150px;
                height: 84px;
                margin: 10px 10px 0 0;

                &:nth-child(3n) {
                  margin-right: 0;
                }

                &:nth-child(1),
                &:nth-child(2),
                &:nth-child(3) {
                  margin-top: 0;
                }
              }
            }
          }
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
</style>
