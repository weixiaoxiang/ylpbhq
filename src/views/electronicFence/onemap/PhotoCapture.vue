<script lang="ts" setup>
import {
  CollectElectronIcfenceAirecord,
  GetElectronIcfenceSnapshot_FileCount,
  GetElectronIcfenceSnapshotByPage,
  GetElectronIcfenceSnapshotByType
} from "@/api"
import { Search } from "@element-plus/icons-vue"
interface Props {
  tabParams?: any
}
const props = withDefaults(defineProps<Props>(), {
  tabParams: () => ({})
})
const { user } = storeToRefs(useConfigStore())
const treeProps = {
  children: "list",
  label: "name"
}
const keyWord = ref<string>("")
const treeRef = useTemplateRef<any>("treeRef")
watch(keyWord, (val) => {
  treeRef.value!.filter(val)
})
const filterNode = (value: any, data: any) => {
  if (!value) return true
  return data.name && data.name.indexOf(value) !== -1
}
const handleCheck = (_: any, _selected: any) => {
  const equipmentids = _selected.checkedNodes
    .filter((item: any) => item.equipmentId)
    ?.map((item: any) => item.equipmentId)
    ?.join(",")
  params.value.equipmentid = equipmentids
  search()
}
const date = ref<any>()

const changeDate = () => {
  if (!date.value) {
    params.value.startTime = ""
    params.value.endTime = ""
    return
  }
  params.value.startTime = date.value[0]
  params.value.endTime = date.value[1]
}
const params = ref<any>({
  equipmentid: "",
  sfcollect: "",
  startTime: "",
  endTime: ""
})
// 获得设备列表数据
const sblbList = ref<any>([])
const nameParam = ref<string>("")
const getSblbList = async () => {
  const { response } = await GetElectronIcfenceSnapshotByType({
    name: nameParam.value
  })
  sblbList.value = response
}

const headerInfo = ref<any>({})
// 获得头部数据
const getHeadData = async () => {
  const { response } = await GetElectronIcfenceSnapshot_FileCount()
  headerInfo.value = response
}

const search = () => {
  page.value = 1
  getList()
}
const reset = () => {
  params.value = {
    equipmentid: "",
    sfcollect: "",
    startTime: "",
    endTime: ""
  }
  date.value = null
  // 清空tree选中
  treeRef.value!.setCheckedNodes([])
  search()
}
const list = ref<any>([])
const loading = ref(false)
const svg = `
        <path class="path" d="
          M 30 15
          L 28 17
          M 25.61 25.61
          A 15 15, 0, 0, 1, 15 30
          A 15 15, 0, 1, 1, 27.99 7.5
          L 15 15
        " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
      `
const page = ref(1)
const intPageSize = ref(9)
const total = ref(0)
const handleCurrentChange = (val: number) => {
  page.value = val
  getList()
}
const handleSizeChange = (val: number) => {
  page.value = 1
  intPageSize.value = val
  getList()
}
const getList = async () => {
  loading.value = true
  try {
    const { response } = await GetElectronIcfenceSnapshotByPage({
      ...params.value,
      page: page.value,
      intPageSize: intPageSize.value
    })
    total.value = response.dataCount
    list.value = response.data
  } catch (error) {
  } finally {
    loading.value = false
  }
}

const selectAll = ref(false)
const changeAllCheck = (value: any) => {
  list.value.forEach((item: any) => {
    item.check = value
  })
}
const showCheckBox = ref(false)
// 点击批量研判按钮
const openCollect = () => {
  showCheckBox.value = true
}
const cancel = () => {
  showCheckBox.value = false
}
// 确定研判
const startCollect = () => {
  ElMessageBox.confirm("是否将这些数据设置为收藏?", "注意", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const ids: any[] = []
      list.value.forEach((item: any) => {
        if (item.check) {
          ids.push(item.id)
        }
      })
      if (ids.length > 0) {
        // console.log(ids)
        const { success } = await CollectElectronIcfenceAirecord({
          id: ids,
          sfcollect: true,
          collectuser: user.value.userName
        })
        if (success) {
          ElMessage.success("收藏成功")
        }
        getList()
      } else {
        ElMessage.warning("请选择要收藏的数据")
      }
    })
    .catch(() => {
      ElMessage.info("收藏取消")
    })
    .finally(() => {
      showCheckBox.value = false
    })
}

// 收藏
const collect = async (item: any) => {
  const ids: any[] = []
  ids.push(item.id)
  const { success } = await CollectElectronIcfenceAirecord({
    id: ids,
    sfcollect: !item.sfcollect,
    collectuser: user.value.userName
  })
  if (success) {
    item.sfcollect = !item.sfcollect
    ElMessage.success(item.sfcollect ? "收藏成功" : "取消收藏成功")
    //
  } else {
    ElMessage.warning(item.sfcollect ? "收藏失败" : "取消收藏失败")
  }
  getList()
}
// 查看图片
const view = (item: any) => {
  if (item.filetype === "图片") {
    if (item.fileurl) {
      const url =
        item.fileurl.indexOf("http") !== -1
          ? item.fileurl.replace(";", "")
          : "/statisUrl/" + item.fileurl.replace(";", "")
      u.showPreviewImg(0, [url])
    } else {
      ElMessage.warning("暂无预览图片")
    }
  }
}
onMounted(async () => {
  getHeadData()
  // 如果是为了记录抓拍，则根据tabParams查询
  if (props.tabParams) {
    if (!props.tabParams.detail.name) return
    nameParam.value = props.tabParams.detail.name
    await getSblbList()
  } else {
    // 默认直接打开图片抓拍
    getSblbList() // 获得设备列表
    getList() // 获得列表数据
  }
})
</script>
<template>
  <div class="photo-capture">
    <div class="left-con">
      <h3>电子围栏监测点</h3>
      <div class="tree">
        <el-input
          v-model.trim="keyWord"
          placeholder="请输入设备名称"
          :prefix-icon="Search"
          clearable
          size="small"
        />
        <el-scrollbar class="warp-scrollbar">
          <el-tree
            :data="sblbList"
            ref="treeRef"
            class="tree-data"
            :props="treeProps"
            node-key="id"
            default-expand-all
            show-checkbox
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            @check="handleCheck"
          >
            <template #default="{ node, data }">
              <div
                v-if="data.list"
                class="father-node-label"
              >
                {{ data.name }}（{{ data.list.length }}）
              </div>
              <div
                v-else
                class="child-node-label"
              >
                <span class="label-text"> {{ data.name }}</span>
              </div>
            </template>
          </el-tree>
        </el-scrollbar>
      </div>
    </div>

    <div class="right-con">
      <div class="right-main">
        <div class="header-box">
          <div class="info-box">
            <div class="info-box-item">全部（抓拍总数：{{ headerInfo.total }}张）</div>
            <div class="info-box-item">
              <span>旗舰型：{{ headerInfo.qjCount }}张</span>
              <span>增强型：{{ headerInfo.zqCount }}张</span>
            </div>
          </div>
          <div class="search-box">
            <el-form
              :model="params"
              label-width="80px"
              inline
            >
              <el-form-item label="是否收藏">
                <el-select
                  v-model="params.sfcollect"
                  placeholder="请选择是否收藏"
                  :teleported="false"
                  clearable
                  popper-class="custom-select-popper"
                >
                  <el-option
                    label="是"
                    :value="true"
                  />
                  <el-option
                    label="否"
                    :value="false"
                  />
                </el-select>
              </el-form-item>
              <el-form-item
                label="抓拍时间"
                class="date-box"
              >
                <div class="date-types"></div>
                <el-date-picker
                  v-model="date"
                  type="daterange"
                  value-format="YYYY-MM-DD"
                  placeholder="请选择时间"
                  popper-class="custom-datepicker-popper"
                  @change="changeDate"
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
                    class="btn btn1"
                    @click="reset"
                  >
                    重置
                  </div>
                  <div
                    v-if="!showCheckBox"
                    class="btn btn1"
                    @click="openCollect"
                  >
                    批量收藏
                  </div>
                  <div
                    v-if="showCheckBox"
                    class="btn btn1"
                    @click="startCollect"
                  >
                    确定
                  </div>
                  <div
                    v-if="showCheckBox"
                    class="btn btn1"
                    @click="cancel"
                  >
                    取消
                  </div>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </div>
        <div
          v-loading="loading"
          element-loading-text="数据加载中..."
          :element-loading-spinner="svg"
          element-loading-svg-view-box="-10, -10, 50, 50"
          element-loading-background="rgba(9, 58, 121, 0.6)"
          class="contain-box"
        >
          <el-row v-show="showCheckBox">
            <el-checkbox
              v-model="selectAll"
              label="全选"
              @change="changeAllCheck"
            />
          </el-row>
          <el-scrollbar
            v-if="list.length > 0"
            :class="{ 'show-check': showCheckBox }"
          >
            <div
              v-for="item in list"
              :key="item.id"
              class="item"
              @click="view(item)"
            >
              <div class="img-box">
                <el-image
                  v-if="item.filetype === '图片'"
                  :src="
                    item.fileurl?.indexOf('http') !== -1
                      ? item.fileurl?.replace(';', '')
                      : '/statisUrl' + item.fileurl?.replace(';', '')
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
                <VideoPlayer
                  v-if="item.filetype === '视频' && item.fileurl"
                  style="width: 100%; height: 100%"
                  :src="
                    item.fileurl?.indexOf('http') !== -1
                      ? item.fileurl?.replace(';', '')
                      : '/statisUrl' + item.fileurl?.replace(';', '')
                  "
                />
              </div>
              <div class="box">
                <div>
                  <span><b>设备名称：</b> {{ item.name }}</span>
                  <span><b>事件识别：</b> {{ item.eventname }}</span>
                </div>
                <div class="time-box">
                  <span><b>识别时间：</b> {{ item.identifytime }}</span>
                </div>
              </div>
              <div
                class="check-box"
                @click.stop
              >
                <el-checkbox
                  v-show="showCheckBox"
                  v-model="item.check"
                />
                <img
                  class="collect-img"
                  v-show="!showCheckBox"
                  :src="
                    item.sfcollect
                      ? $fun.getImg('electronicFence/collect.svg')
                      : $fun.getImg('electronicFence/no-collect.svg')
                  "
                  alt=""
                  @click.stop="collect(item)"
                />
              </div>
            </div>
          </el-scrollbar>
          <EmptyData v-else />
        </div>
        <div class="footer-box">
          <el-pagination
            v-model:current-page="page"
            v-model:page-size="intPageSize"
            :page-sizes="[9, 18, 32]"
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
  </div>
</template>

<style lang="scss" scoped>
.photo-capture {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  gap: 0.5208vw;
  color: #fff;
  font-size: 0.7292vw;
  .left-con {
    display: flex;
    flex-direction: column;
    gap: 0.2604vw;
    width: 16.0417vw;
    background: #02142a;
    border-radius: 0.3125vw;
    box-shadow: 0 0 1.0417vw 0.1042vw rgba(255, 255, 255, 0.3) inset;
    padding: 0.5208vw;
    h3 {
      line-height: 2em;
      font-size: 0.8333vw;
      font-weight: normal;
      color: #beccdc;
      margin: 0;
    }
    :deep(.input-box) {
      height: 32px;
      .el-input__wrapper {
        background-color: #0c284d;
        border: 1px solid #304868 !important;
        box-shadow: none;
        border-radius: 0;
      }
    }
    :deep(.tree) {
      display: flex;
      flex-direction: column;
      gap: 10px;
      overflow-y: hidden;
      // height: 450px;
      height: 100%;
      background-color: #011226;
      box-shadow: 0 0 8px 1px rgba(255, 255, 255, 0.1) inset;
      border-radius: 4px;
      padding: 1.0417vw 0.7292vw;
      .el-input__wrapper {
        background-color: #0c284d;
        color: #aab4c1;
        box-shadow: none;
      }
      .tree-data {
        background: transparent !important;
        .el-tree-node__expand-icon {
          color: #aab4c1 !important;
        }
        .el-tree-node:focus > .el-tree-node__content {
          background-color: #1b345a;
        }
        .el-tree-node__content:hover {
          background-color: #1b345a;
        }
        .el-tree-node__content {
          // height: 42px;
          height: fit-content;
        }
        .father-node-label {
          font-size: 0.8333vw;
          color: #fff;
        }
        .child-node-label {
          height: 42px;
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.7292vw;
          color: #fff;
          padding: 0 1.0417vw;
          > div {
            display: flex;
            align-items: center;
            &.offLine {
              filter: brightness(0.5);
              cursor: not-allowed;
            }
            .label-text {
              display: inline-block;
              margin-left: 6px;
              margin-right: 8px;
            }
            img {
              width: 1.1458vw;
            }
          }
          &.active {
            background-color: #1b345a;
          }
        }

        .is-checked {
          .child-node-label {
            background: url("@/assets/images/patrol/active-circle.png") no-repeat left center / 10px 10px;
          }
        }
        .el-checkbox {
          .is-indeterminate {
            .el-checkbox__inner {
              background: #01b3ff;
              border: 1px solid #01b3ff;
            }
          }
          .el-checkbox__inner {
            background: rgb(17, 34, 46);
            border: 1px solid #3e3e3e;
          }
        }
        .el-checkbox.is-checked {
          .el-checkbox__inner {
            background: #01b3ff;
            border: 1px solid #01b3ff;
          }
        }
        .el-tree-node__expand-icon {
          color: #01b3ff;
        }
      }
    }
    .warp-scrollbar {
      flex: 1;
      overflow: hidden;
      .warp {
        display: flex;
        flex-direction: column;
        gap: 0.5208vw;
        .item {
          display: flex;
          flex-direction: column;
          gap: 0.5208vw;
          padding: 0.5208vw;
          background-color: #152c45;
          border: 2px solid #1a3a6a;
          box-shadow: 0 0 0.5208vw 0.1042vw rgba(26, 58, 106, 0.5);
          cursor: pointer;
          .item-content1 {
            display: flex;
            align-items: center;
            .name {
              width: 7.2917vw;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              font-size: 0.7292vw;
              color: #ddf3fc;
            }
            .value {
              margin-left: 0.2604vw;
              border: 1px solid #038af9;
              font-size: 0.625vw;
              color: #038af9;
              // padding: 0 0.2083vw;
            }
          }
          .item-content2 {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 0.5208vw;
            .item-content2-box {
              display: flex;
              align-items: center;
              gap: 0.2604vw;
              img {
                width: 0.7292vw;
                height: 0.7292vw;
              }
              span {
                font-size: 0.625vw;
                color: rgba(255, 255, 255, 0.65);
              }
            }
          }
          .item-content3 {
            font-size: 0.625vw;
            color: rgba(255, 255, 255, 0.65);
          }
        }
        .item.active {
          border-color: #27ae60;
        }
      }
    }
  }
  .right-con {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 0.5208vw;
    .right-info {
      display: flex;
      justify-content: space-between;
      > div {
        width: 8.3333vw;
        height: 3.4375vw;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.4167vw;
        img {
          width: 2.0833vw;
          height: 2.0833vw;
        }
        .nr {
          .value {
            margin-top: 0.2604vw;
            display: flex;
            gap: 0.5208vw;
            color: #3be3de;
            font-size: 0.625vw;
            span {
              display: flex;
              align-items: center;
              gap: 0.3125vw;
              img {
                width: 0.7292vw;
                height: 0.5208vw;
              }
            }
          }
          .name {
            white-space: wrap;
            width: 4.6875vw;
            color: #999;
            font-size: 0.625vw;
          }
        }
      }
      > div:nth-child(1) {
        background: url("@/assets/images/backgroundResources/bg1.png") no-repeat center center / 100% 100%;
      }
      > div:nth-child(2) {
        background: url("@/assets/images/backgroundResources/bg2.png") no-repeat center center / 100% 100%;
      }
      > div:nth-child(3) {
        background: url("@/assets/images/backgroundResources/bg1.png") no-repeat center center / 100% 100%;
      }
      > div:nth-child(4) {
        background: url("@/assets/images/backgroundResources/bg2.png") no-repeat center center / 100% 100%;
      }
      > div:nth-child(5) {
        background: url("@/assets/images/backgroundResources/bg1.png") no-repeat center center / 100% 100%;
      }
    }
    .right-main {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      .header-box {
        display: flex;
        align-items: center;
        gap: 0.5208vw;
        .info-box {
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          padding: 0.5208vw;
          gap: 0.5208vw;
          height: calc(100% - 0.9375vw);
          border-radius: 0.3125vw;
          background-color: #03152b;
          margin-bottom: 0.9375vw;
          .info-box-item {
            display: flex;
            align-items: center;
            gap: 0.5208vw;
          }
        }
        .search-box {
          flex: 1;
          overflow: hidden;
          :deep(.el-form) {
            .el-form-item {
              margin-right: 14px;
              .el-form-item__content {
                border: 1px solid #304868;
                border-radius: 2px;
                width: 160px;
              }
            }
            .el-form-item__label {
              color: #fff;
            }
            .date-box {
              .el-form-item__content {
                border: none;
                width: 240px;
              }
              .el-date-editor {
                width: 240px;
                border: 1px solid #304868;
                border-radius: 2px;
              }
            }
            .el-input__inner {
              color: #aab4c1;
            }
            .search-btns {
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
                  background: #041324;
                }
                .btn2 {
                  background: linear-gradient(to right, #5a8ab6, #375577);
                }
              }
              .el-form-item__content {
                border: none;
                width: fit-content;
              }
            }
          }
        }
      }

      :deep(.contain-box) {
        position: relative;
        flex: 1;
        opacity: 0.8;
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
          height: calc(100% - 32px);
          .el-scrollbar__view {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            .item {
              position: relative;
              width: calc(calc(100% - 20px) / 3);
              // height: 250px;
              border: 1px solid #057ec7;
              border-radius: 2px;
              display: flex;
              flex-direction: column;
              background-color: #092239;
              font-size: 0.625vw;
              color: #fff;
              .img-box {
                width: 100%;
                height: 180px;
                .el-image {
                  width: 100%;
                  height: 100%;
                  .image-slot {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 100%;
                    height: 100%;
                    color: var(--el-text-color-secondary);
                    font-size: 0.9375vw;
                  }
                }
              }
              .check-box {
                position: absolute;
                top: 8px;
                right: 8px;
                .el-checkbox {
                  height: initial;
                  .el-checkbox__label {
                    font-size: 0.7292vw;
                  }
                  .el-checkbox__inner {
                    background-color: #3cab93;
                  }
                }
                .collect-img {
                  width: 1.4583vw;
                  background-color: rgba(0, 0, 0, 0.7);
                  padding: 0.2604vw;
                  border-radius: 0.3125vw;
                  cursor: pointer;
                }
              }
              .box {
                display: flex;
                flex-direction: column;
                gap: 0.3125vw;
                padding: 6px 0.5208vw;
                background-color: rgba(0, 0, 0, 0.4);
                > div {
                  display: flex;
                  align-items: center;
                  font-size: 0.625vw;
                  color: #fff;
                  > span {
                    // flex: 1;
                    b {
                      color: #0875d0;
                    }
                  }
                  span:nth-child(1) {
                    width: 50%;
                  }
                }
                .time-box {
                  span {
                    width: 100% !important;
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
