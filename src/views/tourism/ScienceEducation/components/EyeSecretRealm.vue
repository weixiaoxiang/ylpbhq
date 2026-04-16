<!-- 秘境之眼 -->
<template>
  <div class="wrap eye-secret-realm">
    <div class="wrap-header">
      <div class="title-content">
        <img
          class="title-logo"
          :src="$fun.getImg('title-icon.svg')"
          alt=""
        />
        <div class="title">秘境之眼</div>
      </div>
      <div class="title-con">
        <div class="tabs">
          <div
            class="tab"
            @click="toMore"
          >
            更多
          </div>
          <div class="tabline"></div>
        </div>
      </div>
    </div>
    <div class="linemjzy"></div>
    <div class="wrap-con2">
      <div
        class="video"
        v-for="(item, index) in smallList"
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
  </div>
</template>
<script lang="ts" setup>
import { scienceEducationApi } from "@/api/ScienceTourism/index"
const list = ref<any>([])
const iffullscreen = ref(false)
const currentVideo = ref()
const showPop = ref(false)
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
      if (list.value.length > 0 && queryForm.page == 1 && queryForm.filename == "") {
        smallList.value = list.value.slice(0, 4)
        smallList.value.forEach((item: any, index) => {
          //获取视频第几秒作为封面
          nextTick(() => {
            let video: any = document.getElementById("videoElement" + index)
            video.currentTime = 0.5
            if (typeof video !== "undefined" && typeof video.currentTime === "number") {
              const canvas = document.createElement("canvas") // 创建Canvas元素
              canvas.width = video.videoWidth // 设置Canvas大小与视频相同
              canvas.height = video.videoHeight
              const context: any = canvas.getContext("2d") // 获取Canvas上下文
              video.addEventListener("loadeddata", () => {
                context.drawImage(video, 0, 0) // 将视频内容绘制到Canvas上
                const imageData = canvas.toDataURL("image/jpeg") // 转换为Base64格式的图像数据
                video.setAttribute("poster", imageData)
              })
            }
          })
        })
      }

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
  getData()
}
const closePop = () => {
  showPop.value = false // 关闭弹框
}
const { proxy } = getCurrentInstance() as any
//打开更多页面
const toMore = () => {
  proxy.$mitt.emit("openmoremjzy")
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
    currElement.muted = true
    currElement.pause()
  }
}
onMounted(() => {
  getData()
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
  margin: 0px 20px 0 0;
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
