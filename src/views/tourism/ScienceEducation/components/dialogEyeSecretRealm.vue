<template>
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
          <div class="map-pop-title-text">秘境之眼</div>

          <img
            class="close"
            src="/images/pop-close.png"
            alt=""
            @click="closePop"
          />
        </div>
        <div class="map-pop-content-box">
          <el-input
            class="searchbox"
            v-model="queryForm.filename"
            size="large"
            placeholder="请输入查询内容"
          >
            <template #append>
              <el-button
                :icon="Search"
                size="small"
                @click="search()"
              />
            </template>
          </el-input>
          <div style="display: flex; flex-wrap: wrap; height: 448px; margin-top: 20px; gap: 20px">
            <div
              class="video"
              v-for="(item, index) in list"
              :key="index"
              @click="videoFullscreen(`videoElement${index}`)"
            >
              <video
                ref="videoElement"
                :id="`videoElement${index}`"
                :src="'/imageApi' + item.filepath"
                muted
                @fullscreenchange="onFullScreenChange"
              ></video>
              <div class="mc">{{ item.filename }}</div>
            </div>
          </div>
          <div class="pagination">
            <Pagination
              v-model:total="total"
              v-model:page="queryForm.page"
              v-model:limit="queryForm.intPageSize"
              layout="prev, pager, next"
              @pagination="handleChangePage"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
  <div
    class="mark"
    v-if="showMore"
  ></div>
  <!-- </div> -->
</template>
<script lang="ts" setup>
import { scienceEducationApi } from "@/api/ScienceTourism/index"
import Pagination from "@/components/Pagination/index.vue"
import { Search } from "@element-plus/icons-vue"
const { proxy } = getCurrentInstance() as any

const showMore = ref(false) //是否显示
const showVideo = ref(false)
const title = ref("") //标题
const list = ref<any>([])
const iffullscreen = ref(false)
const currentVideo = ref()
const queryForm = reactive({
  page: 1,
  intPageSize: 6,
  filename: ""
})
const total = ref(0)
const smallList = ref<any>([])

//获取数据
const getData = () => {
  list.value = []
  scienceEducationApi.GetMjzyByPage(queryForm).then((res: any) => {
    if (res.success) {
      list.value = res.response.data
      total.value = res.response.dataCount
    }
  })
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
const closePop = () => {
  showMore.value = false // 关闭弹框
}

//  视频窗口点击进入全屏事件
const videoFullscreen = (videoElement: any) => {
  currentVideo.value = videoElement
  if (!iffullscreen.value) {
    launchFullscreen(videoElement)
    iffullscreen.value = false
  } else {
    iffullscreen.value = true
    exitFullscreen()
  }
}
//    进入全屏
function launchFullscreen(videoElement: any) {
  let currElement: any = document.getElementById(videoElement)
  if (currElement.requestFullscreen) {
    currElement.requestFullscreen()
  } else if (currElement.mozRequestFullScreen) {
    currElement.mozRequestFullScreen()
  } else if (currElement.msRequestFullscreen) {
    currElement.msRequestFullscreen()
  } else if (currElement.oRequestFullscreen) {
    currElement.oRequestFullscreen()
  } else if (currElement.webkitRequestFullscreen) {
    currElement.webkitRequestFullScreen()
  }
  currElement.muted = false
  currElement.play()
}
//    退出全屏
function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen()
  }
}
function onFullScreenChange() {
  if (!document.fullscreenElement) {
    // 执行退出全屏后的逻辑
    let currElement: any = document.getElementById(currentVideo.value)
    // currElement.muted = true
    currElement.pause()
  }
}
onMounted(() => {
  proxy.$mitt.on("openmoremjzy", (data: any) => {
    showMore.value = true
    showVideo.value = true
    title.value = "秘境之眼"

    getData()
  })
})
onBeforeUnmount(() => {
  proxy.$mitt.off("openmoremjzy")
})
</script>
<style lang="scss" scoped>
.eye-secret-realm {
  width: 100%;
  height: 100%;
  display: block;
  .linemjzy {
    margin-top: -2px;
    height: 5px;
    background: url("/statisUrl/title-linemjzy.png") no-repeat center center / cover;
  }
  .box-con {
    display: flex;
    padding: 10px !important;
  }
}
.video {
  position: relative;
  width: calc(((100% - 60px) / 3));
  height: calc(((100% - 20px) / 2));
  // margin: 0px 20px 0 0;
  cursor: pointer;
  .mc {
    width: 100%;
    height: 30px;
    background: rgba(0, 0, 0, 0.3);
    color: #fff;
    position: absolute;
    bottom: -1px;
    text-align: center;
  }
  video {
    width: 100%;
    height: 100%;
    object-fit: fill;
  }
  &:last-child {
    margin-right: 0;
  }
  &::before {
    position: absolute;
    content: "";
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    z-index: 2;
  }
  &::after {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
    content: "";
    display: block;
    width: 32px;
    height: 32px;
    background: url("/images/ScienceEducation/play.png") no-repeat;
    background-size: 100% 100%;
    z-index: 3;
  }
}
.map-pop {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 60%;
  max-height: 80%;
  background: rgba(18, 35, 53, 1);
  z-index: 99999;
  .map-pop-box {
    position: relative;
    width: 100%;
    background-image: url(/images/pop-bg.png);
    background-size: 100% 100%;
    background-repeat: no-repeat;
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
        height: calc(100% - 16px);
        padding: 13px 10px 0;
        color: #fff;
        text-align: center;

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

        .pagination {
          display: flex;
          justify-content: center;
          margin-top: 10px;
        }

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
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  width: 100%;
  height: 100%;
  background-color: #000;
  opacity: 0.5;
}

.wrap-con2 {
  height: calc(100% - 41px);
  overflow: hidden;
  padding: vw(10);
  display: flex;
  // flex-direction: column;
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
</style>
