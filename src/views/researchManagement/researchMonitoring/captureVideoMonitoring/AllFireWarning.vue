<script lang="ts" setup>
import { GetAlarmmsgListByPage, GetAlarmmsgStatus, GetAllMonitoringList, PutOneAssessment } from "@/api"
import { u } from "@/utils/viewerjs"
interface Props {
  width?: number
  height?: number
}
withDefaults(defineProps<Props>(), {})
// 获得火情预警卡口列表
const kkList = ref<any>([])
const getKkList = async () => {
  const { response } = await GetAllMonitoringList({
    equipmentType: "防火监控点"
  })
  kkList.value = response
}
// 获得研判状态列表
const ypztList = ref<any>([])
const getYpztList = async () => {
  const { response } = await GetAlarmmsgStatus({
    equipmentType: "防火监控点"
  })
  ypztList.value = response
}
const params = ref<any>({
  status: "",
  cameraname: "",
  startTime: "",
  endTime: ""
})
const search = () => {
  page.value = 1
  getListData()
}
// 点击批量研判按钮
const judgment = () => {
  showCheckBox.value = true
}
// 确定研判
const startJudgment = () => {
  ElMessageBox.confirm("是否将这些数据研判为误报?", "注意", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const ids = list.value.filter((item: any) => item.check).map((item: any) => item.id)
      const { success } = await PutOneAssessment({ id: ids, status: 2 }) // status不传默认为误判
      if (success) {
        ElMessage.success("研判成功")
      } else {
        ElMessage.info("研判失败")
      }
      getListData()
    })
    .catch(() => {
      ElMessage.info("研判取消")
    })
}
const cancel = () => {
  showCheckBox.value = false
}
const date = ref()
const changeDate = () => {
  if (date.value) {
    params.value.startTime = date.value[0]
    params.value.endTime = date.value[1]
  } else {
    params.value.startTime = ""
    params.value.endTime = ""
  }
}
const page = ref(1)
const intPageSize = ref(12)
const total = ref(0)
const list = ref<any>([])
const getListData = async () => {
  const { response } = await GetAlarmmsgListByPage({
    ...params.value,
    page: page.value,
    intPageSize: intPageSize.value
  })
  response.data.forEach((item: any) => {
    item.imgsrcList = []
    if (item.imgsrc) {
      item.imgsrcList = item.imgsrc.split(";")
    }
  })
  list.value = response.data
  total.value = response.dataCount
}
const handleCurrentChange = (val: number) => {
  page.value = val
  selectAll.value = false
  getListData()
}
const handleSizeChange = (val: number) => {
  page.value = 1
  intPageSize.value = val
  selectAll.value = false
  getListData()
}
const selectAll = ref(false)
const changeAllCheck = (value: any) => {
  list.value.forEach((item: any) => {
    item.check = value
  })
}
const showCheckBox = ref(false)
const changeCheck = (item: any) => {
  // console.log(item)
}
// 查看图片
const view = (data: any) => {
  if (data.imgsrcList.length > 0) {
    const url = data.imgsrcList.map((item: string) => "/fireStaticUrl/" + item).reverse()
    u.showPreviewImg(0, url)
  } else {
    ElMessage.warning("暂无预览图片")
  }
}
onMounted(() => {
  getKkList()
  getYpztList()
  getListData()
})
</script>
<template>
  <div
    class="all-fireWarning"
    :style="{ width: width + 'px', height: height + 'px' }"
  >
    <div class="title-box">
      <img
        :src="$fun.getImg('researchManagement/icon14.png')"
        alt=""
      />抓拍记录
    </div>
    <div class="mian panzoom-exclude">
      <div class="main-section">
        <div class="search-box">
          <el-form
            :model="params"
            label-width="80px"
            inline
          >
            <el-form-item label="研判状态">
              <el-select
                v-model="params.status"
                placeholder="请选择研判状态"
                :teleported="false"
                clearable
                popper-class="custom-select-popper"
              >
                <el-option
                  v-for="item in ypztList"
                  :key="item.value"
                  :label="item.name"
                  :value="item.value" /></el-select
            ></el-form-item>
            <el-form-item label="设备名称">
              <el-select
                v-model="params.cameraname"
                placeholder="请选择设备名称"
                :teleported="false"
                clearable
                popper-class="custom-select-popper"
              >
                <el-option
                  v-for="item in kkList"
                  :key="item.id"
                  :label="item.mc"
                  :value="item.mc"
                />
              </el-select>
            </el-form-item>
            <el-form-item
              label="预警时间"
              class="date-box"
            >
              <el-date-picker
                v-model="date"
                type="datetimerange"
                range-separator="-"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
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
                  v-if="!showCheckBox"
                  class="btn btn2"
                  @click="judgment"
                >
                  批量研判
                </div>
                <div
                  v-if="showCheckBox"
                  class="btn btn3"
                  @click="startJudgment"
                >
                  确定
                </div>
                <div
                  v-if="showCheckBox"
                  class="btn btn3"
                  @click="cancel"
                >
                  取消
                </div>
              </div>
            </el-form-item>
          </el-form>
        </div>
        <div class="contain-box">
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
                  :src="
                    item.imgsrcList.length === 0
                      ? ''
                      : item.imgsrcList.length === 1
                        ? '/fireStaticUrl/' + item.imgsrcList[0]
                        : '/fireStaticUrl/' + item.imgsrcList[1]
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
              <div
                class="check-box"
                @click.stop
              >
                <el-checkbox
                  v-show="showCheckBox"
                  v-model="item.check"
                  @change="changeCheck(item)"
                />
              </div>
              <div
                class="box1"
                :class="[
                  item.status === '未研判'
                    ? 'type1'
                    : item.status === '火情'
                      ? 'type2'
                      : item.status === '误报'
                        ? 'type3'
                        : item.status === '重复火情'
                          ? 'type4'
                          : item.status === '居民用火'
                            ? 'type5'
                            : item.status === '工业用火'
                              ? 'type6'
                              : 'type7'
                ]"
              >
                {{ item.status }}
              </div>
              <div class="box2">
                <span>{{ item.cameraname }}</span>
                <span>{{ item.starttime }}</span>
              </div>
            </div>
          </el-scrollbar>
          <EmptyData v-else />
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
  </div>
</template>

<style lang="scss" scoped>
.all-fireWarning {
  position: relative;
  width: 62.5vw;
  height: 720px;
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
              width: 250px;
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
            background: #19ba6c;
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
              .check-box {
                position: absolute;
                top: 8px;
                right: 8px;
                .el-checkbox {
                  height: initial;
                  .el-checkbox__label {
                    font-size: 0.7292vw;
                  }
                }
              }
              .box1 {
                position: absolute;
                top: 5px;
                left: 0;
                padding: 3px 0.5208vw;
                border-top-right-radius: 8px;
                border-bottom-right-radius: 8px;
                background-color: #287cbd;
                &.type1 {
                  background-color: rgb(67, 53, 167);
                }
                &.type2 {
                  background-color: rgb(33, 155, 157);
                }
                &.type3 {
                  background-color: rgb(13, 146, 244);
                }
                &.type4 {
                  background-color: rgb(204, 43, 82);
                }
                &.type5 {
                  background-color: rgb(236, 131, 5);
                }
                &.type6 {
                  background-color: rgb(35, 93, 220);
                }
                &.type7 {
                  background-color: rgb(232, 67, 172);
                }
              }
              .box2 {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 4px 0.5208vw;
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                background-color: rgba(0, 0, 0, 0.4);
                // mix-blend-mode: difference;
                img {
                  width: 0.8333vw;
                  cursor: pointer;
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
