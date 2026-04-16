<script lang="ts" setup>
import dayjs from "dayjs"
import { GetAllMonitoringList, GetfaceListByPage } from "@/api"
import { u } from "@/utils/viewerjs"
interface Props {
  width?: number
  height?: number
}
withDefaults(defineProps<Props>(), {})
// 获得监控卡口列表
const kkList = ref<any[]>([])
const getKkList = async () => {
  const { response } = await GetAllMonitoringList({
    equipmentType: "人脸识别"
  })
  kkList.value = response
}
const params = ref<any>({
  cameraname: "",
  gender: "",
  startTime: dayjs().format("YYYY-MM-DD"),
  endTime: dayjs().add(1, "day").format("YYYY-MM-DD")
})
const checkAll = ref(false)
const isIndeterminate = ref(false)
const handleCheckAllChange = (val: any) => {
  ageList.value = val ? agesList : []
  isIndeterminate.value = false
}
const handleCheckedAgeChange = (value: any) => {
  const checkedCount = value.length
  checkAll.value = checkedCount === agesList.length
  isIndeterminate.value = checkedCount > 0 && checkedCount < agesList.length
}
const ageList = ref<string[]>([])
const agesList = ["婴幼儿", "儿童", "少年", "青少年", "青年", "壮年", "中年", "中老年", "老年"]
const search = () => {
  page.value = 1
  getListData()
}
const reset = () => {
  params.value = {
    cameraname: "",
    gender: "",
    startTime: dayjs().format("YYYY-MM-DD"),
    endTime: dayjs().add(1, "day").format("YYYY-MM-DD")
  }
  page.value = 1
  intPageSize.value = 10
  total.value = 0
  getListData()
}
const dateType = ref("今日")
const dateTypes = ["今日", "近7天", "近30天", "全年", "自定义"]
const changeDataType = (type: string) => {
  dateType.value = type
  if (type === "今日") {
    params.value.startTime = dayjs().format("YYYY-MM-DD")
    params.value.endTime = dayjs().add(1, "day").format("YYYY-MM-DD")
  }
  if (type === "近7天") {
    params.value.startTime = dayjs().subtract(6, "day").format("YYYY-MM-DD")
    params.value.endTime = dayjs().format("YYYY-MM-DD")
  }
  if (type === "近30天") {
    params.value.startTime = dayjs().subtract(29, "day").format("YYYY-MM-DD")
    params.value.endTime = dayjs().format("YYYY-MM-DD")
  }
  if (type === "全年") {
    params.value.startTime = dayjs().startOf("year").format("YYYY-MM-DD")
    params.value.endTime = dayjs().format("YYYY-MM-DD")
  }
  if (type === "自定义") {
    params.value.startTime = ""
    params.value.endTime = ""
  }
  console.log(params.value.startTime + "--" + params.value.endTime)
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
  const { response } = await GetfaceListByPage({
    ...params.value,
    age: ageList.value.join(","),
    page: page.value,
    intPageSize: intPageSize.value
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
const preview = (data: any) => {
  if (!data.bkgurlall) {
    return ElMessage.warning("暂无预览")
  }
  const url = "/vehicleStaticUrl" + data.bkgurlall
  u.showPreviewImg(0, [url])
}
const videoSrc = ref("")
const showVideoPalyer = ref(false)
const playVideo = (data: any) => {
  // if (!data.videourl) {
  //   return ElMessage.warning("暂无视频")
  // }
  // videoSrc.value = data.videourl
  showVideoPalyer.value = true
}
onMounted(() => {
  getKkList() // 获取监控卡口列表
  getListData() // 获取抓拍记录列表
})
</script>
<template>
  <div
    class="capture-record"
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
            <el-form-item label="抓拍设备">
              <el-select
                v-model="params.cameraname"
                placeholder="请选择抓拍设备"
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
            <el-form-item label="性别">
              <el-select
                v-model="params.gender"
                placeholder="请选择性别"
                :teleported="false"
                clearable
                popper-class="custom-select-popper"
              >
                <el-option
                  label="男"
                  value="male"
                />
                <el-option
                  label="女"
                  value="female"
                />
              </el-select>
            </el-form-item>
            <el-form-item
              label="抓拍时段"
              class="date-box"
            >
              <div
                v-for="type in dateTypes"
                :key="type"
                class="btn"
                :class="{ current: dateType === type }"
                @click="changeDataType(type)"
              >
                {{ type }}
              </div>
              <el-date-picker
                key="datatime"
                v-if="dateType === '自定义'"
                v-model="date"
                type="daterange"
                range-separator="-"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                value-format="YYYY-MM-DD"
                popper-class="custom-datepicker-popper"
                @change="changeDate"
              />
            </el-form-item>
            <el-form-item
              label-width="80px"
              label="年龄段"
              class="age-box"
            >
              <el-checkbox
                v-model="checkAll"
                :indeterminate="isIndeterminate"
                style="margin-right: 20px"
                @change="handleCheckAllChange"
              >
                全选
              </el-checkbox>
              <el-checkbox-group
                v-model="ageList"
                @change="handleCheckedAgeChange"
              >
                <el-checkbox
                  v-for="(item, index) in agesList"
                  :key="index"
                  :label="item"
                  :value="item"
                />
              </el-checkbox-group>
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
                  class="btn btn2"
                  @click="reset"
                >
                  重置
                </div>
              </div>
            </el-form-item>
          </el-form>
        </div>
        <div class="contain-box">
          <el-scrollbar height="100%">
            <div
              v-for="item in list"
              :key="item.id"
              class="item"
            >
              <el-image
                :src="item.snapurlall ? '/vehicleStaticUrl' + item.snapurlall : ''"
                fit="fill"
                @click="preview(item)"
              >
                <template #error>
                  <div class="image-slot">
                    <i-ep-picture />
                    <span style="margin-left: 3px">暂无预览</span>
                  </div>
                </template>
              </el-image>
              <div
                class="box1"
                :class="[item.gender === '男' ? 'male' : 'female']"
              >
                {{ item.gender }}
              </div>
              <div class="box2">
                <span>{{ item.cameraname || "暂无" }}</span>
                <span>{{ item.eventtime || "暂无" }}</span>
                <img
                  :src="$fun.getImg('researchManagement/player-video.png')"
                  alt=""
                  @click="playVideo(item)"
                />
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
      to="#captureRecord"
    >
      <Modal
        id="video-palyer"
        v-model:show="showVideoPalyer"
        disable-zoom
        :close-on-click-modal="false"
      >
        <template v-slot:container>
          <div
            class="panzoom-exclude"
            style="width: 800px"
          >
            <VideoPlayer src="http://vjs.zencdn.net/v/oceans.mp4" />
          </div>
        </template>
      </Modal>
    </teleport>
  </div>
</template>

<style lang="scss" scoped>
.capture-record {
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
              width: max-content;
              border: none;
              .el-date-editor {
                width: 360px;
              }
            }
            .btn {
              display: flex;
              align-items: center;
              justify-content: center;
              // width: 68px;
              height: 32px;
              padding: 0 0.7292vw;
              cursor: pointer;
              background-color: #0a428d;
              font-size: 0.625vw;
              margin: 0 0.2604vw;
              &.current {
                background-color: #04162e;
              }
            }
          }
          .age-box {
            .el-form-item__content {
              width: min-content;
              border: none;
              flex-wrap: nowrap;
            }
            .el-checkbox {
              margin-right: 1.0417vw;
            }
            .is-checked + .el-checkbox__label {
              color: #15b392;
            }
            .el-checkbox__label {
              color: #beccdc;
              font-size: 0.7292vw;
            }
            .el-checkbox__inner {
              background-color: #253c5a;
              border: none;
            }
            .el-checkbox__input.is-checked .el-checkbox__inner {
              background-color: #15b392;
            }
            .el-checkbox-group {
              display: flex;
            }
          }
          .el-form-item__content {
            border: 1px solid #304868;
            border-radius: 2px;
            width: 180px;
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
            background: #19ba6c;
          }
          .btn2 {
            background: linear-gradient(to right, #5a8ab6, #375577);
          }
        }
      }
      .contain-box {
        flex: 1;
        overflow: hidden;
        :deep(.el-scrollbar) {
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
              .el-image {
                flex: 1;
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
              .box1 {
                position: absolute;
                top: 5px;
                left: 0;
                padding: 3px 0.5208vw;
                border-top-right-radius: 8px;
                border-bottom-right-radius: 8px;
                &.male {
                  background-color: #287cbd;
                }
                &.female {
                  background-color: #f00;
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
