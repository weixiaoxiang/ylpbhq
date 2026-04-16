<script lang="ts" setup>
import { u } from "@/utils/viewerjs"
import { GetCarBackListInfo_Jcjltj } from "@/api"
interface Props {
  data?: any
}
const props = withDefaults(defineProps<Props>(), {
  data: {}
})
console.log(props.data)
// 预览图片
const preview = (url: string) => {
  u.showPreviewImg(0, [url])
}
const linedata = ref<any>(null)
const getLineData = async () => {
  const { response } = await GetCarBackListInfo_Jcjltj({
    plateno: props.data.plateno
  })
  if (response?.[0]?.childer?.length > 0) {
    linedata.value = {
      dw: "次",
      xAxis: response?.[0].childer?.map((item: any) => item.name),
      data: response.map((item: any) => ({
        name: item.name,
        data: item.childer.map((item: any) => ({
          label: item.name,
          value: item.value
        }))
      }))
    }
  } else {
    linedata.value = null
  }
}
onMounted(() => {
  getLineData()
})
</script>
<template>
  <div class="vehicle-details">
    <h3>车辆详情</h3>
    <div class="contain panzoom-exclude">
      <div class="row">
        <div class="col">
          <div class="label">车牌号码:</div>
          <el-text
            class="value"
            truncated
          >
            {{ data.plateno || "暂无" }}
          </el-text>
        </div>
        <div class="col">
          <div class="label">添加时间:</div>
          <el-text
            class="value"
            truncated
          >
            {{ data.blacklisttime || "暂无" }}
          </el-text>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <div class="label">车身颜色:</div>
          <el-text
            class="value"
            truncated
            >{{ "暂无" }}</el-text
          >
        </div>
        <div class="col">
          <div class="label">车型:</div>
          <el-text
            class="value"
            truncated
          >
            {{ data.vehicletypename || "暂无" }}
          </el-text>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <div class="label">是否为黑名单:</div>
          <el-text
            class="value"
            truncated
          >
            {{ data.isblacklist || "暂无" }}
          </el-text>
        </div>
        <div class="col">
          <div class="label">是否为内部车:</div>
          <el-text
            class="value"
            truncated
          >
            {{ data.isinside || "暂无" }}
          </el-text>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <div class="label">黑名单备注:</div>
          <el-text
            class="value"
            line-clamp="2"
          >
            {{ data.blacklistremark || "暂无" }}
          </el-text>
        </div>
        <div class="col">
          <div class="label">内部车备注:</div>
          <el-text
            class="value"
            line-clamp="2"
            >{{ "暂无" }}</el-text
          >
        </div>
      </div>
      <div class="row">
        <div class="col">
          <div class="label">品牌:</div>
          <el-text
            class="value"
            truncated
          >
            {{ "暂无" }}
          </el-text>
        </div>
        <div class="col">
          <div class="label">子品牌:</div>
          <el-text
            class="value"
            truncated
            >{{ "暂无" }}</el-text
          >
        </div>
      </div>
      <div class="row">
        <div class="col">
          <div class="label">最近抓拍地点:</div>
          <el-text
            class="value"
            truncated
            >{{ data.latelysnapmonitor || "暂无" }}</el-text
          >
        </div>
        <div class="col">
          <div class="label">抓拍时间点:</div>
          <el-text
            class="value"
            truncated
            >{{ data.latelysnaptime || "暂无" }}</el-text
          >
        </div>
      </div>
      <div class="row">
        <div class="col">
          <div class="label">行驶方向:</div>
          <el-text
            class="value"
            truncated
          >
            {{ "暂无" }}
          </el-text>
        </div>
        <div class="col">
          <div class="label">车速:</div>
          <el-text
            class="value"
            truncated
            >{{ "暂无" }}</el-text
          >
        </div>
      </div>
    </div>
    <div class="box panzoom-exclude">
      <div class="box-item">
        <div class="title">车辆图片/视频:</div>
        <div class="box-item-body">
          <div class="img">
            <el-image
              :src="'/vehicleStaticUrl' + data.vehiclepicurlall"
              fit="contain"
              @click="preview('/vehicleStaticUrl' + data.vehiclepicurlall)"
            >
              <template #error>
                <div class="image-slot">
                  <i-ep-picture />
                  <span style="margin-left: 3px">暂无预览</span>
                </div>
              </template>
            </el-image>
          </div>
          <div
            v-show="false"
            class="video-box"
          >
            <!-- <VideoPlayer
              proportion="vjs-4-3"
              src="https://vjs.zencdn.net/v/oceans.mp4"
            /> -->
            <video
              src="https://vjs.zencdn.net/v/oceans.mp4"
              controls
              muted
              :autoplay="false"
              loop
            ></video>
          </div>
        </div>
      </div>
      <div class="box-item">
        <div class="title">
          黑名单用户进出记录统计
          <el-tooltip
            placement="right"
            popper-class="custom-popper"
          >
            <template #content>
              <div class="tip">
                抓拍率<br />
                抓拍率:有效照片的数量/所有照片数*100%
              </div>
            </template>
            <i-ep-warning style="margin-left: 5px" />
          </el-tooltip>
        </div>
        <div class="box-item-body">
          <LineChartPanel
            :areaBackground="true"
            :open-effect="true"
            :colors="['#08b9ed', '#ef9a17']"
            :data="linedata"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.vehicle-details {
  display: flex;
  flex-direction: column;
  width: 45.9375vw;
  height: 700px;
  background: url("@/assets/images/dialog-bg1.png") no-repeat center center / 100% 100%;
  font-size: 0.7292vw;
  color: #beccdc;
  padding: 20px 1.8229vw 35px 1.8229vw;
  h3 {
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    font-size: 1.25vw;
    font-weight: bold;
    font-style: italic;
  }
  .contain {
    display: flex;
    flex-direction: column;
    .row {
      display: flex;
      align-items: center;
      gap: 0.5208vw;
      padding: 8px 0;
      border-bottom: 1px solid #4977a1;
      .col {
        display: flex;
        height: 100%;
        width: 50%;
        line-height: 1.5em;
        .label {
          width: 6.25vw;
          height: 100%;
          text-align: left;
          font-size: 0.7292vw;
          color: #426e98;
        }
        .value {
          flex: 1;
          overflow: hidden;
          width: 100%;
          color: #beccdc;
          font-size: 0.7292vw;
        }
      }
    }
  }
  .box {
    display: flex;
    flex: 1;
    gap: 0.5208vw;
    overflow: hidden;
    > .box-item {
      height: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      // background: url("@/assets/images/dialog-bg2.png") no-repeat center center / 100% 100%;
      .title {
        display: flex;
        align-items: center;
        line-height: 2em;
        color: #fff;
        font-size: 0.7292vw;
      }
      &:first-child {
        width: 40%;
      }
      &:last-child {
        width: 60%;
      }
      .box-item-body {
        position: relative;
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.2604vw;
        padding: 0.2604vw;
        overflow: hidden;
        .img {
          flex: 1;
          // height: 50%;
          overflow: hidden;
          .el-image {
            width: 100%;
            height: 100%;
            .image-slot {
              display: flex;
              justify-content: center;
              align-items: center;
              width: 100%;
              height: 100%;
              border: 1px dashed #999;
              color: var(--el-text-color-secondary);
              font-size: 0.9375vw;
            }
          }
        }
        .video-box {
          flex: 1;
          // height: 50%;
          overflow: hidden;
          video {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
        }
      }
    }
  }
}
</style>
<style lang="scss">
.vehicle-details {
  .custom-popper {
    background: none !important;
    border: none !important;
    padding: 0 !important;
    .el-popper__arrow {
      display: none !important;
    }
    .tip {
      width: 155px;
      height: 36px;
      font-size: 8px;
      padding: 4px 0 4px 14px;
      line-height: 16px;
      background: url("@/assets/images/researchManagement/bg2.png") no-repeat center center / 100% 100%;
    }
  }
}
</style>
