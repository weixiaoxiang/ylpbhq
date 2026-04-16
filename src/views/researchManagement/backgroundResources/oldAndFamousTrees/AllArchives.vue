<script lang="ts" setup>
import { u } from "@/utils/viewerjs"
import BaseDetails from "./BaseDetails.vue"
import { GetFamousTreesListByPage } from "@/api"
interface Props {
  width?: number
  height?: number
}
withDefaults(defineProps<Props>(), {})
const params = ref<any>({
  keywork: ""
})
const search = () => {
  page.value = 1
  getListData()
}
// 重置
const reset = () => {
  params.value = {
    keywork: ""
  }
}
const page = ref(1)
const intPageSize = ref(12)
const total = ref(0)
const list = ref<any>([{}, {}, {}, {}])
const getListData = async () => {
  const { response } = await GetFamousTreesListByPage({
    page: page.value,
    intPageSize: intPageSize.value,
    ...params.value
  })
  list.value = response.data
  total.value = response.dataCount
}
const handleCurrentChange = (val: number) => {
  page.value = val
  getListData()
}
const handleSizeChange = (val: number) => {
  page.value = 1
  intPageSize.value = val
  getListData()
}
// 查看图片
const view = (data: any) => {
  if (data.filelist?.length > 0) {
    const url = data.filelist.map((item: any) => "/fireStaticUrl/" + item.filepath)
    u.showPreviewImg(0, url)
  } else {
    ElMessage.warning("暂无预览图片")
  }
}
// 查看详情
const info = ref<any>({})
const showBaseDetails = ref(false)
const viewDetail = (data: any) => {
  info.value = data
  showBaseDetails.value = true
}
onMounted(() => {
  getListData()
})
</script>
<template>
  <div
    class="all-archives"
    :style="{ width: width + 'px', height: height + 'px' }"
  >
    <div class="title-box">
      <img
        :src="$fun.getImg('researchManagement/icon14.png')"
        alt=""
      />古树档案
    </div>
    <div class="mian panzoom-exclude">
      <div class="main-section">
        <div class="search-box">
          <el-form
            :model="params"
            label-width="80px"
            inline
          >
            <el-form-item label="关键字">
              <el-input
                v-model="params.keywork"
                placeholder="请输入关键字"
                clearable
              />
            </el-form-item>
            <el-form-item class="search-btns">
              <div class="btns">
                <div
                  class="btn btn1"
                  @click="search"
                >
                  查询
                </div>
                <div
                  class="btn btn3"
                  @click="reset"
                >
                  重置
                </div>
              </div>
            </el-form-item>
          </el-form>
        </div>
        <div class="contain-box">
          <el-scrollbar>
            <div
              v-for="item in list"
              :key="item.id"
              class="item"
            >
              <div
                class="img-box"
                @click="view(item)"
              >
                <el-image
                  :src="item.filelist?.length > 0 ? '/fireStaticUrl/' + item.filelist[0].filepath : ''"
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
              <div class="text-box">
                <div>{{ item.mc }}</div>
                <div>
                  {{ item.tztx }}
                </div>
                <div @click="viewDetail(item)">详细信息></div>
              </div>
            </div>
          </el-scrollbar>
        </div>
        <div class="footer-box">
          <el-pagination
            v-model:current-page="page"
            v-model:page-size="intPageSize"
            :page-sizes="[12, 20, 30, 40]"
            :background="false"
            :pager-count="5"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
    <teleport
      defer
      to="#baseDetails"
    >
      <Modal
        v-model:show="showBaseDetails"
        disable-zoom
        :close-on-click-modal="false"
      >
        <template v-slot:container>
          <BaseDetails :data="info" />
        </template>
      </Modal>
    </teleport>
  </div>
</template>

<style lang="scss" scoped>
.all-archives {
  position: relative;
  width: 62.5vw;
  height: 660px;
  background: url("@/assets/images/dialog-bg.png") no-repeat center center / 100% 100%;
  display: flex;
  flex-direction: column;
  .title-box {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 70px;
    font-size: 0.9375vw;
    img {
      width: 1.3542vw;
      margin-right: 0.5208vw;
    }
  }
  .mian {
    position: relative;
    flex: 1;
    display: flex;
    padding: 0 24px;
    flex-direction: column;
    overflow-y: hidden;
    .main-section {
      position: relative;
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow-y: hidden;
      .search-box {
        :deep(.el-form) {
          .el-form-item {
            margin-right: 14px;
          }
          .el-form-item__label {
            color: #fff;
          }
          .date-box {
            .el-form-item__content {
              width: 360px;
            }
          }
          .el-form-item__content {
            border: 1px solid #304868;
            border-radius: 2px;
            width: 160px;
          }
          .search-btns {
            .el-form-item__content {
              border: none;
            }
          }
        }
        .btns {
          display: flex;
          gap: 10px;
          padding: 0 10px;
          .btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 68px;
            height: 32px;
            padding: 4px 20px;
            cursor: pointer;
          }
          .btn1 {
            background: #051a2a;
          }
          .btn2 {
            width: 100px;
            background: linear-gradient(to right, #5a8ab6, #375577);
          }
          .btn3 {
            width: 68px;
            background: linear-gradient(to right, #5a8ab6, #375577);
          }
        }
      }
      :deep(.contain-box) {
        flex: 1;
        overflow: hidden;
        .el-checkbox {
          .el-checkbox__inner {
            background-color: #253c5a;
            border: none;
          }
          .el-checkbox__input.is-checked .el-checkbox__inner {
            background-color: #15b392;
          }
          .is-checked + .el-checkbox__label {
            color: #15b392;
          }
        }
        .el-scrollbar {
          height: 100%;
          &.show-check {
            height: calc(100% - 32px);
          }
          .el-scrollbar__view {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            .item {
              position: relative;
              width: calc(calc(100% - 30px) / 4);
              height: 140px;
              border: 1px solid #057ec7;
              border-radius: 2px;
              display: flex;
              gap: 0.5208vw;
              background-color: #092239;
              font-size: 0.625vw;
              color: #fff;
              padding: 6px;
              .img-box {
                flex: 1;
                height: 100%;
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
              .text-box {
                flex: 1;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                > div {
                  line-height: 2em;
                  &:nth-child(1) {
                    font-size: 14px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                  }
                  &:nth-child(2) {
                    font-size: 12px;
                    line-height: 1.5em;
                    color: #aab4c1;
                    text-indent: 2em;
                    // 根据容器高度自动调整
                    max-height: calc(100% - 4em);
                    overflow: hidden;
                    display: -webkit-box;
                    -webkit-box-orient: vertical;
                    -webkit-line-clamp: 4; // 显示3行
                    text-overflow: ellipsis;
                  }
                  &:nth-child(3) {
                    font-size: 12px;
                    color: #45ffff;
                    cursor: pointer;
                  }
                }
              }
            }
          }
        }
      }
      .footer-box {
        margin: 10px 0 20px 0;
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
    }
  }
}
</style>
