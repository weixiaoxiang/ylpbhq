<template>
  <div class="thematic-map">
    <div class="thematic-map-box">
      <div class="box-title">
        <div class="box-title-con">
          <el-scrollbar height="100%">
            <div class="box-title-con-box">
              <div class="left">
                <div class="left-center"></div>
              </div>
              <div class="right">
                <div v-for="(item, index) in dataList">
                  <div
                    class="item-box"
                    :class="{ 'item-box-active': index === activeindex }"
                  >
                    <div
                      class="item"
                      :class="{ 'item-active': index === activeindex }"
                      @click="handleClick(item, index)"
                    >
                      <img
                        src="/images/aiRemoteSensing/thematic-circle.png"
                        :class="{ 'left-icon': true, 'left-icon-active': index === activeindex }"
                      />
                      <span
                        style="margin-left: 20px"
                        :title="item.name"
                        >{{ item.name }}</span
                      >

                      <div
                        class="xz"
                        @click="handleDownload(item)"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-scrollbar>
        </div>
      </div>

      <div class="box-content">
        <div
          class="map"
          id="map"
        ></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { topicMapApi } from "@/api/aiRemoteSensing/index"
import { useMap } from "./map"
const { initMap, initLayer } = useMap()
const activeindex = ref(0)
//点击切换专题图
const handleClick = (item: any, index: any) => {
  activeindex.value = index
  let url = "/statisUrl" + item.previewAddress + "/{z}/{x}/{-y}.png"
  initLayer(url, item.maxLevel)
}
//点击下载专题图
import { ElLoading } from "element-plus"
import "element-plus/theme-chalk/el-loading.css"
const handleDownload = (item: any) => {
  let url = "/statisUrl" + item.downloadAddress
  const loading = ElLoading.service({
    lock: true,
    text: "下载中……",
    background: "rgba(0, 0, 0, 0.7)"
  })
  fetch(url)
    .then((res) => res.blob())
    .then((blob) => {
      // 将链接地址字符内容转变成blob地址
      const aLink = document.createElement("a")
      aLink.href = URL.createObjectURL(blob)
      // 文件名字
      aLink.download = item.name + ".png"
      document.body.appendChild(aLink)
      aLink.click()
      aLink.remove()
      loading.close()
    })
}

const dataList = ref<any>([])
//获取专题图列表
const getData = () => {
  topicMapApi.getTopicMaps({}).then((res: any) => {
    dataList.value = res.response || []
    nextTick(() => {
      let ele = dataList.value[activeindex.value]
      let url = "/statisUrl" + ele.previewAddress + "/{z}/{x}/{-y}.png"
      initLayer(url, ele.maxLevel)
    })
  })
}
onMounted(() => {
  let ele = document.getElementById("map")
  initMap(ele)
  getData()
})
onBeforeUnmount(() => {})
</script>

<style lang="scss" scoped>
.thematic-map {
  display: flex;
  justify-content: space-between;
  position: relative;
  width: 100%;
  height: 100%;
  padding: 20px 20px 20px 20px;
  overflow: hidden;
  .thematic-map-box {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    padding-top: 20px;
    .box-title {
      width: 500px;
      height: 100%;
      // padding: 10px;
      position: relative;
      background: linear-gradient(180deg, rgba(24, 52, 93, 0.8) 0%, rgba(27, 53, 79, 0.8) 100%);
      // border: 1px solid rgba(255, 255, 255, 0.5);
      margin-right: 20px;
      .box-title-con {
        display: flex;
        width: 100%;
        height: 100%;
        overflow: hidden;
        .el-scrollbar {
          width: 100%;
        }
        .box-title-con-box {
          display: flex;
          width: 100%;
          height: 100%;
        }
        .left {
          margin-top: 25px;
          width: 10%;
          height: auto;
          position: relative;
        }
        .right {
          margin-top: 20px;
          width: 100%;
          height: auto;
          .item-box {
            position: relative;
            width: 90%;
            height: 30px;
            margin-bottom: 20px;
            margin-left: 15px;
            cursor: pointer;

            .left-icon {
              margin-left: -30px;
              margin-right: 15px;
              width: 12.26px;
              height: 12.26px;
              background: url("/images/aiRemoteSensing/thematic-circle.png") no-repeat center center/100% 100%;
            }
            .left-icon-active {
              margin-left: -30px;
              margin-right: 15px;
              width: 28px;
              height: 28px;
              background: url("/images/aiRemoteSensing/thematic-active-circle.png") no-repeat center center/100% 100%;
            }
          }
          .item-box-active {
            position: relative;
            width: 90%;
            height: 30px;
            margin-bottom: 20px;
            &::after {
              content: "";
              position: absolute;
              left: 0;
              bottom: 0;
              width: 100%; /* 根据需要调整宽度 */
              height: 1px; /* 渐变边框的高度 */
              background: linear-gradient(90deg, rgba(68, 187, 202, 0) 1.24%, #44bbca 100%);
              /* 可选：添加一些额外的样式，如 z-index，以确保伪元素正确显示 */
            }
            .left-icon {
              margin-left: -30px;
              margin-right: 15px;
              width: 12.26px;
              height: 12.26px;
              background: url("/images/aiRemoteSensing/thematic-circle.png") no-repeat center center/100% 100%;
            }
            .left-icon-active {
              margin-left: -35px;
              margin-right: 10px;
              width: 28px;
              height: 28px;
              background: url("/images/aiRemoteSensing/thematic-active-circle.png") no-repeat center center/100% 100%;
            }
          }
          .item {
            display: flex;
            align-items: center;
            height: 27px;
            font-family: FZLanTingHeiS-R-GB;
            font-size: 14px;
            font-weight: 400;
            line-height: 27px;
            text-align: left;
            text-underline-position: from-font;
            text-decoration-skip-ink: none;
            color: #cfdae5;
            background: url("/images/aiRemoteSensing/thematic-tiao.png") no-repeat center center/100% 100%;
            span {
              display: inline-block;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
              width: 350px;
            }
          }
          .item-active {
            height: 27px;
            font-family: FZLanTingHeiS-R-GB;
            font-size: 14px;
            font-weight: 400;
            line-height: 27px;
            text-align: left;
            text-underline-position: from-font;
            text-decoration-skip-ink: none;
            color: #cfdae5;
            background: url("/images/aiRemoteSensing/thematic-tiao-active.png") no-repeat center center/100% 100%;
          }
          .xz {
            position: absolute;
            width: 12px;
            height: 13px;
            background: url("/images/aiRemoteSensing/xz.png") no-repeat center center/100% 100%;
            top: 5px;
            right: 8px;
            cursor: pointer;
          }
        }
        .left-center {
          position: absolute;
          height: calc(100% - 40px);
          width: 5px;
          background: #174c6a80;
          left: 50%;
          transform: translateX(50%);
          z-index: 0;
        }
      }

      li {
        width: 100%;
        height: 40px;
        line-height: 40px;
        position: relative;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-family: "Source Han Sans CN";
        font-size: 14px;
        font-weight: 400;
        text-align: center;
        color: rgba(255, 255, 255, 0.5);

        &.actived {
          background: linear-gradient(90deg, rgba(34, 221, 217, 0) 0.61%, #22ddd9 48.82%, rgba(34, 221, 217, 0) 100%);
          div {
            background: none;
            color: #fff;
          }
        }
        div {
          width: 132px;
          background: linear-gradient(90deg, rgba(5, 103, 101, 0) 0.61%, #056765 52.79%, rgba(5, 103, 101, 0) 100%);
        }
      }
    }
    .box-content {
      width: calc(100% - 520px);
      height: 100%;
      background: linear-gradient(180deg, rgba(24, 52, 93, 0.8) 0%, rgba(27, 53, 79, 0.8) 100%);
      position: relative;
      overflow: hidden;
      #map {
        width: 100%;
        height: 100%;
      }
    }
  }
}
</style>
