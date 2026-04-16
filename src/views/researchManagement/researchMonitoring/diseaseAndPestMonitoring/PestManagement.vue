<script lang="ts" setup>
import { GetPestSpeciesManagementListByPage } from "@/api"
import { Search } from "@element-plus/icons-vue"
interface Props {
  width?: number
  height?: number
}
withDefaults(defineProps<Props>(), {})
const keyword = ref("")
const page = ref(1)
const intPageSize = ref(12)
const total = ref(0)
const list = ref<any>([])
const getListData = async () => {
  const { response } = await GetPestSpeciesManagementListByPage({
    keyword: keyword.value,
    page: page.value,
    intPageSize: intPageSize.value
  })
  list.value = response.data
  total.value = response.dataCount
}
const search = () => {
  page.value = 1
  getListData()
}
const reset = () => {
  keyword.value = ""
  getListData()
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
// 显示详情
const showBaseDetail = ref(false)
const data = ref<any>({})
const toDetail = (item: any) => {
  data.value = item
  showBaseDetail.value = true
}
onMounted(() => {
  getListData()
})
</script>
<template>
  <div class="pest-management">
    <div class="search-box">
      <el-form
        label-width="80px"
        inline
      >
        <el-form-item label="害虫名称">
          <el-input
            v-model="keyword"
            placeholder="请输入害虫名称"
            :prefix-icon="Search"
            clearable
        /></el-form-item>
        <el-form-item class="search-btns">
          <div class="btns">
            <div
              class="btn btn1"
              @click="search"
            >
              <i-ep-search style="margin-right: 4px" />
              查询
            </div>
            <div
              class="btn btn3"
              @click="reset"
            >
              <i-ep-refresh style="margin-right: 4px" />
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
          class="item"
          @click="toDetail(item)"
        >
          <div class="img-box">
            <el-image
              :src="item.filelist?.[0]?.filepath ? '/statisUrl/' + item.filelist?.[0]?.filepath : ''"
              alt=""
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
              </template></el-image
            >
          </div>
          <div class="box">{{ item.pestname }}</div>
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
    <transition
      enter-active-class="animate__animated animate__backInDown"
      leave-active-class="animate__animated animate__backOutUp "
      :appear="false"
      appear-active-class="animate__animated animate__backInDown"
    >
      <div
        v-show="showBaseDetail"
        class="base-detail"
      >
        <el-page-header
          title="返回"
          @back="showBaseDetail = false"
        >
          <template #content>
            <span style="font-size: 14px; color: #fff"> 害虫详情 </span>
          </template>
          <div style="font-size: 20px; margin: 8px 0; color: #3ce5e0">{{ data.pestname || "暂无" }}</div>
        </el-page-header>
        <div class="section">
          <div class="section-contain-box">
            <div class="info-box1">
              <div class="info-item">
                <div class="title latin-text">
                  <img
                    :src="$fun.getImg('backgroundResources/icon6.png')"
                    alt=""
                  />
                  拉丁学名：
                </div>
                <div class="text latin-text">
                  <el-text
                    truncated
                    :title="data.latinname"
                  >
                    {{ data.latinname || "暂无" }}
                  </el-text>
                </div>
              </div>
              <div class="info-item">
                <div class="title">
                  <img
                    :src="$fun.getImg('backgroundResources/icon6.png')"
                    alt=""
                  />
                  所属门：
                </div>
                <div class="text">{{ data.men || "暂无" }}</div>
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
                  所属科：
                </div>
                <div class="text">{{ data.ke || "暂无" }}</div>
              </div>
              <div class="info-item">
                <div class="title">
                  <img
                    :src="$fun.getImg('backgroundResources/icon6.png')"
                    alt=""
                  />
                  所属属：
                </div>
                <div class="text">{{ data.shu || "暂无" }}</div>
              </div>
            </div>
            <div class="info-box2">
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
                    line-clamp="6"
                    :title="data.lifestylehabits"
                  >
                    {{ data.lifestylehabits || "暂无" }}
                  </el-text>
                </div>
              </div>
              <div class="info-item">
                <div class="title">
                  <img
                    :src="$fun.getImg('backgroundResources/icon6.png')"
                    alt=""
                  />
                  防止措施：
                </div>
                <div
                  class="text"
                  :title="data.preventivemeasures"
                >
                  <el-text line-clamp="10">
                    {{ data.preventivemeasures || "暂无" }}
                  </el-text>
                </div>
              </div>
            </div>
          </div>
          <div class="img-box">
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
      </div>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
.pest-management {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  color: #fff;
  font-size: 0.7292vw;
  .search-box {
    :deep(.el-form) {
      .el-form-item {
        margin-right: 14px;
        .el-input {
          border: 1px solid #304868;
        }
      }
      .el-form-item__label {
        color: #fff;
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
        height: 32px;
        padding: 4px 1.0417vw;
        cursor: pointer;
      }
      .btn1 {
        background: #08182c;
      }
      .btn3 {
        background: linear-gradient(to right, #5a8ab6, #375577);
      }
    }
  }
  :deep(.contain-box) {
    flex: 1;
    overflow: hidden;
    .el-scrollbar {
      height: 100%;
      .el-scrollbar__view {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        .item {
          position: relative;
          width: calc(calc(100% - 30px) / 4);
          height: 180px;
          border: 1px solid #057ec7;
          border-radius: 2px;
          display: flex;
          align-items: center;
          background-color: #092239;
          font-size: 0.625vw;
          color: #fff;
          .img-box {
            width: 100%;
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
          .box {
            display: flex;
            justify-content: center;
            line-height: 32px;
            font-size: 0.7292vw;
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background-color: rgba(0, 0, 0, 0.4);
          }
        }
      }
    }
  }
  .footer-box {
    margin: 10px 0 0 0;
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
  .base-detail {
    position: absolute;
    inset: 0;
    padding: 0.5208vw;
    background-color: #0b2d52;
    .section {
      display: flex;
      justify-content: space-between;
      .section-contain-box {
        width: 53%;
        display: flex;
        flex-direction: column;
        gap: 0.5208vw;
        .info-box1 {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.5208vw;
          .info-item {
            width: calc(calc(100% - 1.0417vw) / 3);
          }
        }
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
      }
      .img-box {
        width: 45%;
        max-height: 400px;
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
    }
  }
}
</style>
