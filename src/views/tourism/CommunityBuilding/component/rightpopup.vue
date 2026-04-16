<template>
  <div class="model-box">
    <div class="map-pop-right">
      <div
        class="map-pop-close"
        @click="closemapPop"
      ></div>
      <div class="map-pop-box">
        <div class="map-pop-title">
          <div class="title">详情</div>
        </div>
        <div class="map-pop-content">
          <div class="content1">
            <div
              class="box"
              style="margin-bottom: 10px"
            >
              <!-- <div class="box-title">
                <div class="jt"></div>
                <div class="titlename">基本信息</div>
              </div> -->

              <div class="box-content">
                <div class="row">
                  <span class="label">问题名称：</span>
                  <span class="value">{{ popupInfo2?.mc || "" }}</span>
                </div>
                <div class="row">
                  <span class="label">责任人：</span>
                  <span class="value">{{ popupInfo2?.zrr || "" }}</span>
                </div>
                <div class="row">
                  <span class="label">所属区域：</span>
                  <span class="value">{{ popupInfo2?.sssjname || "" }}</span>
                </div>
                <div class="row">
                  <span class="label">上报人：</span>
                  <span class="value">{{ popupInfo2?.sbr || "" }}</span>
                </div>
                <div class="row">
                  <span class="label">上报人联系方式：</span>
                  <span class="value">{{ popupInfo2?.sbrlxfs || "" }}</span>
                </div>
                <div class="row">
                  <span class="label">描述：</span>
                  <span class="value">{{ popupInfo2?.procontent || "" }}</span>
                </div>
                <div class="row">
                  <span class="label">上传时间：</span>
                  <span class="value">{{ popupInfo2?.createtime || "" }}</span>
                </div>
                <div class="row">
                  <span class="label">上传照片：</span>
                  <div class="img-box">
                    <el-image
                      v-for="item in popupInfo2?.filelist"
                      :src="'/imageApi' + item.filepath"
                      :preview-teleported="true"
                      hide-on-click-modal
                      fit="contain"
                      :preview-src-list="['/imageApi' + item.filepath]"
                    >
                      <template #error>
                        <div class="error-image-slot">
                          <el-icon><Picture /></el-icon>
                          暂无图片
                        </div>
                      </template>
                    </el-image>
                  </div>
                </div>
                <div class="row">
                  <span class="label">问题状态：</span>
                  <el-select
                    style="width: 30%"
                    v-model="statue"
                    collapse-tags
                    collapse-tags-tooltip
                    placeholder="请选择"
                  >
                    <el-option
                      v-for="item in options"
                      :key="item.id"
                      :label="item.name"
                      :value="item.name"
                    >
                    </el-option>
                  </el-select>
                </div>

                <div class="row">
                  <div class="dialogbtn">
                    <div
                      class="fun-btn"
                      style="margin-right: 5px"
                      :class="{ active: currentbtnTool === 1 }"
                      @click="handleQuery"
                    >
                      <img
                        src="/images/geologicalDisaster/btn-cx.png"
                        alt=""
                      />
                      提交
                    </div>
                    <div
                      class="fun-btn"
                      :class="{ active: currentbtnTool === 2 }"
                      @click="resetQuery"
                    >
                      <img
                        src="/images/geologicalDisaster/btn-cz.png"
                        alt=""
                      />
                      返回
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Picture } from "@element-plus/icons-vue"
import { communityBuildingApi } from "@/api/CommunityBuilding"
const currentbtnTool = ref(0)
const emit = defineEmits(["closemapPop"])

interface Props {
  popupInfo2: any
}
const props = withDefaults(defineProps<Props>(), {
  popupInfo2: () => {}
})
const { user } = storeToRefs(useConfigStore())
const statue = ref<any>()

const closemapPop = () => {
  emit("closemapPop")
}

const handleQuery = async () => {
  currentbtnTool.value = 1
  const { success, msg } = await communityBuildingApi.UpdateReportStatue({
    id: props.popupInfo2.id,
    statue: statue.value,
    handleuser: user.value.userName,
    handleuserid: user.value.userId
  })
  if (success) {
    emit("closemapPop")
  } else {
    ElMessage.info(msg)
  }
}

const resetQuery = () => {
  currentbtnTool.value = 2
  emit("closemapPop")
}

const options = ref<any>([
  {
    id: 1,
    name: "已处理"
  },
  {
    id: 2,
    name: "未处理"
  }
])

watch(
  () => props.popupInfo2,
  (val) => {
    if (val) {
      statue.value = val.statue
    }
  }
)
onMounted(() => {})
</script>

<style lang="scss" scoped>
.model-box {
  position: fixed; /* 固定位置 */
  z-index: 1000; /* 确保模态对话框位于顶部，可以根据需要调整 */
  left: 0;
  top: 0;
  width: 100%; /* 全屏宽度 */
  height: 100%; /* 全屏高度 */
  background-color: rgba(0, 0, 0, 0.8); /* 黑色背景，带有40%的不透明度 */
  // justify-content: center; /* 水平居中（需要配合flex布局） */
  // align-items: center; /* 垂直居中（需要配合flex布局） */
  display: flex; /* 使用flex布局来实现居中 */
  .map-pop-right {
    width: vw(800);
    height: fit-content;
    margin-left: vw(660);
    margin-top: vh(130);
    background: url("/images/rightpop-bg.png") no-repeat center center / 100% 100%;
    display: flex;
    position: relative;
    // &:after {
    //   position: absolute;
    //   content: "";
    //   border-left: 10px solid transparent;
    //   border-right: 10px solid transparent;
    //   border-top: 10px solid #2cadff;
    //   bottom: -12px;
    //   left: 50%;
    //   transform: translateX(-50%);
    // }
  }
  .map-pop-box {
    height: 100%;
    width: 100%;
  }

  .map-pop-title {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 28px;
    margin-top: 15px;
    .title {
      width: 241px;
      height: 20px;
      text-align: center;
      line-height: 20px;
      font-size: 14px;
      font-weight: 500;
      color: #fff;
    }
    img {
      position: absolute;
      right: 10px;
      cursor: pointer;
      width: 20px;
      height: 20px;
    }
  }

  .map-pop-content {
    display: flex;
    justify-content: space-between;
    height: calc(100% - 28px);
    width: 100%;
    padding: 10px 10px 16px;
    overflow-y: auto;
    .box-title {
      display: flex;
      align-items: center;
      width: 100%;
      height: 28px;
      padding: 0 10px;

      // margin-bottom: 10px;
    }
    .content1 {
      width: 100%;
      font-size: 14px;
      .jt {
        width: 16px;
        height: 15px;
        background: url("/images/geologicalDisaster/dialogimage/jt.png") no-repeat center center;
      }
      .titlename {
        width: 57.14px;
        height: 18px;
        margin-left: 10px;
        color: #2cfefe;
      }
      .box-content {
        margin-left: 30px;
        // display: flex;
        // flex-wrap: wrap;
        color: #beccdc;
        .row {
          display: flex;
          align-items: center;

          width: 100%;
          margin-top: 10px;
          margin-bottom: 10px;
          // &:not(:last-child) {
          //   margin-bottom: 8px;
          // }
          .label,
          .value {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-family: Inter;
            font-size: 14px;
            font-weight: 400;
            line-height: 16.94px;
            text-align: end;
            text-underline-position: from-font;
            text-decoration-skip-ink: none;
          }
          .img-box {
            display: flex;
            align-items: center;
            .el-image {
              width: 8.3333vw;
              height: 6.25vw;
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
          .label {
            width: 120px;
          }
        }
        .dialogbtn {
          display: flex;
          justify-content: space-evenly;
          width: 100%;
          .fun-btn {
            width: 88.55px;
            height: 33.73px;
            display: flex;
            align-items: center;
            justify-content: center;
            // margin-right: 8px;
            background: #00000080;

            border: 1px solid #365375;
            border-radius: 2px;
            color: #fff;
            cursor: pointer;

            &.active {
              background: linear-gradient(270deg, #365375 0%, #5b8bb7 100%);

              img {
                opacity: 1;
              }
            }
          }
        }
      }
    }
  }

  .map-pop-close {
    position: absolute;
    top: 35px;
    right: 50px;
    width: 10px;
    height: 10px;
    background: url("/images/geologicalDisaster/dialogimage/close.png") no-repeat center center;
    cursor: pointer;
    z-index: 999;
  }
}
</style>
