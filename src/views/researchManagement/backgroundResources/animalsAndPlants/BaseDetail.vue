<script lang="ts" setup>
import { u } from "@/utils/viewerjs"
interface Props {
  width?: number
  height?: number
  data?: any
}
const props = withDefaults(defineProps<Props>(), {
  data: () => {}
})
const filelist = ref<any>([])
watch(
  () => props.data,
  (newVal) => {
    if (newVal.hwxjfilelist) {
      // filelist.value = newVal.hwxjfilelist.filter((item: any) => item.filebmp === "图片")?.slice(0, 10) || []
      filelist.value = newVal.hwxjfilelist?.slice(0, 10) || []
    }
  },
  { immediate: true }
)
// 物种基本信息图片预览
const viewFile = () => {
  let url = props.data.filelist?.[0]?.filepath ? "/statisUrl/" + props.data.filelist?.[0]?.filepath : ""
  u.showPreviewImg(0, [url])
}

// 红外相机抓拍图片预览
const zxzpInfo = ref<any>({}) // 抓拍信息
const showVideoPalyer = ref(false)
const view = (item: any) => {
  if (item.filebmp === "图片") {
    const urls = ["/redCareamStaticUrl/" + (item.resultfile ? item.resultfile : item.fileurl)]
    u.showPreviewImg(0, urls)
  } else if (item.filebmp === "视频") {
    zxzpInfo.value = item
    showVideoPalyer.value = true
  } else {
    ElMessage.warning("暂无内容预览")
  }
}

defineEmits<{
  "update:show": [boolean]
}>()
</script>
<template>
  <div
    class="data-panel"
    :style="{ width: width + 'px', height: height + 'px' }"
  >
    <div class="title-box">
      <img
        :src="$fun.getImg('researchManagement/icon14.png')"
        alt=""
      />
      物种详情
    </div>
    <div class="mian panzoom-exclude">
      <div class="section1">
        <div class="contain-box">
          <div class="info-box1">
            <div class="info-item">
              <div class="title">
                <img
                  :src="$fun.getImg('backgroundResources/icon6.png')"
                  alt=""
                />
                拉丁学名：
              </div>
              <div class="text">
                <el-text
                  class="latin-text"
                  truncated
                >
                  {{ data.ldmc || "暂无" }}
                </el-text>
              </div>
            </div>
            <div class="info-item">
              <div class="title">
                <img
                  :src="$fun.getImg('backgroundResources/icon6.png')"
                  alt=""
                />
                俗称/俗名：
              </div>
              <div class="text">{{ data.mc || "暂无" }}</div>
            </div>
            <div class="info-item">
              <div class="title">
                <img
                  :src="$fun.getImg('backgroundResources/icon6.png')"
                  alt=""
                />
                所属纲：
              </div>
              <div class="text">{{ data.gang || "暂无" }}</div>
            </div>
            <div class="info-item">
              <div class="title">
                <img
                  :src="$fun.getImg('backgroundResources/icon6.png')"
                  alt=""
                />
                所属目:
              </div>
              <div class="text">{{ data.mu || "暂无" }}</div>
            </div>
            <div class="info-item">
              <div class="title">
                <img
                  :src="$fun.getImg('backgroundResources/icon6.png')"
                  alt=""
                />
                所属科属：
              </div>
              <div class="text">{{ data.ke + "-" + data.shu }}</div>
            </div>
            <div class="info-item">
              <div class="title">
                <img
                  :src="$fun.getImg('backgroundResources/icon6.png')"
                  alt=""
                />
                保护等级：
              </div>
              <div class="text">{{ data.plevel || "暂无" }}</div>
            </div>
            <div class="info-item">
              <div class="title">
                <img
                  :src="$fun.getImg('backgroundResources/icon6.png')"
                  alt=""
                />
                是否珍稀：
              </div>
              <div class="text">{{ data.zxwz || "否" }}</div>
            </div>
          </div>
          <div class="info-box2">
            <div class="info-item">
              <div class="title">
                <img
                  :src="$fun.getImg('backgroundResources/icon6.png')"
                  alt=""
                />
                目标特征：
              </div>
              <div class="text">
                <el-text
                  line-clamp="5"
                  :title="data.tztx || '暂无'"
                >
                  {{ data.tztx || "暂无" }}
                </el-text>
              </div>
            </div>
          </div>
          <div class="info-box3">
            <div class="info-item">
              <div class="title">
                <img
                  :src="$fun.getImg('backgroundResources/icon6.png')"
                  alt=""
                />
                生活习性：
              </div>
              <div class="text">
                <el-text
                  line-clamp="2"
                  :title="data.habit || '暂无'"
                >
                  {{ data.habit || "暂无" }}
                </el-text>
              </div>
            </div>
          </div>
        </div>
        <div
          class="img-box"
          @click="viewFile"
        >
          <el-image
            :src="data.filelist?.[0]?.filepath ? '/statisUrl/' + data.filelist?.[0]?.filepath : ''"
            fit="cover"
          >
            <template #placeholder>
              <el-skeleton
                class="image-placeholder"
                style="width: 100%; height: 100%"
                animated
              >
                <template #template>
                  <el-skeleton-item
                    variant="image"
                    style="width: 100%; height: 100%"
                  />
                </template>
              </el-skeleton>
            </template>
            <template #error>
              <div class="image-slot">
                <i-ep-picture />
                <span style="margin-left: 3px">暂无预览</span>
              </div>
            </template>
          </el-image>
        </div>
      </div>
      <div
        v-show="filelist?.length > 0"
        class="section2"
      >
        <div class="info-item">
          <div class="title">
            <img
              :src="$fun.getImg('backgroundResources/icon6.png')"
              alt=""
            />
            红外相机抓拍：
          </div>
          <div class="item-box">
            <el-scrollbar>
              <div class="item-box-content">
                <div
                  v-for="item in filelist"
                  class="item"
                  @click="view(item)"
                >
                  <div class="img-box">
                    <el-image
                      :src="
                        item.filebmp === '图片'
                          ? '/redCareamStaticUrl/' + (item.resultfile ? item.resultfile : item.fileurl)
                          : '/redCareamStaticUrl/' + item.coverurl
                      "
                      alt=""
                      fit="fill"
                    >
                      <template #placeholder>
                        <el-skeleton
                          class="image-placeholder"
                          style="width: 100%; height: 100%"
                          animated
                        >
                          <template #template>
                            <el-skeleton-item
                              variant="image"
                              style="width: 100%; height: 100%"
                            />
                          </template>
                        </el-skeleton>
                      </template>
                      <template #error>
                        <div class="image-slot">
                          <i-ep-picture />
                          <span style="margin-left: 3px">暂无预览</span>
                        </div>
                      </template></el-image
                    >
                  </div>
                  <div class="box">
                    <div class="name">
                      <span>{{ item.dename }}</span>
                    </div>
                    <div class="name">
                      <span>{{ item.filetime }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </el-scrollbar>
          </div>
        </div>
      </div>
    </div>
    <teleport
      defer
      to="#baseDetail"
    >
      <Modal
        v-model:show="showVideoPalyer"
        disable-zoom
        :close-on-click-modal="false"
      >
        <template v-slot:container>
          <div
            class="panzoom-exclude"
            style="width: 800px"
          >
            <VideoPlayer
              :src="'/redCareamStaticUrl/' + (zxzpInfo.resultfile ? zxzpInfo.resultfile : zxzpInfo.fileurl)"
            />
          </div>
        </template>
      </Modal>
    </teleport>
  </div>
</template>

<style lang="scss" scoped>
.data-panel {
  // width: 67.7083vw;
  width: min-content;
  // height: 450px;
  background: url("@/assets/images/dialog-bg.png") no-repeat center center / 100% 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  .title-box {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 70px;
    img {
      width: 1.3542vw;
      margin-right: 0.5208vw;
    }
  }
  .mian {
    flex: 1;
    display: flex;
    padding: 0 24px 24px 24px;
    flex-direction: column;
    justify-content: space-between;
    overflow-y: hidden;
    line-height: 2em;
    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.2083vw;
      font-size: 0.8333vw;
      color: #fff;
      .title {
        display: flex;
        align-items: center;
        height: 1.25vw;
        img {
          width: 0.625vw;
          margin-right: 0.2083vw;
        }
      }
      :deep(.text) {
        padding-left: 0.625vw;
        .el-text {
          color: #fff;
          font-size: 0.8333vw;
        }
      }
    }
    .section1 {
      display: flex;
      gap: 0.5208vw;
      .contain-box {
        display: flex;
        flex-direction: column;
        gap: 0.5208vw;
        .info-box1 {
          display: flex;
          justify-content: space-between;
          gap: 0.2083vw;
          white-space: nowrap;
        }
      }
      .img-box {
        max-height: 200px;
        max-width: 100%;
        .el-image {
          width: 260px;
          height: 100%;
        }
      }
    }
    .section2 {
      margin-top: 10px;
      display: flex;
      width: 100%;
      gap: 1.0417vw;
      :deep(.item-box) {
        max-width: 62.5vw;
        position: relative;
        .el-scrollbar {
          width: 100%;
        }
        .item-box-content {
          display: flex;
          gap: 0.3125vw;
          // height: 120px;
        }
        .item {
          position: relative;
          width: 200px;
          height: 150px;
          flex-shrink: 0;
        }
      }
    }
    .img-box {
      width: 100%;
      height: 100%;
    }
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
    .box {
      display: flex;
      flex-direction: column;
      // gap: 2px;
      padding: 4px 0.3125vw;
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: rgba(0, 0, 0, 0.4);
      > div {
        font-size: 0.625vw;
        color: #fff;
        line-height: 1.5em;
      }
    }
  }
}
</style>
