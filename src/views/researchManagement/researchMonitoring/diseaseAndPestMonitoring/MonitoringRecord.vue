<script lang="ts" setup>
import {
  GetPestEquipment_All,
  GetPestEquipment_Info,
  GetPestMonitorRecordstListByPage,
  GetPestSpeciesContents
} from "@/api"

interface Props {
  width?: number
  height?: number
  tabParams?: any
}
const props = withDefaults(defineProps<Props>(), {
  tabParams: () => {}
})
const info = ref<any>(null)
// 获得虫情测报灯详情,根据id
const getBaseDetail = async (data: any) => {
  const { response } = await GetPestEquipment_Info({
    id: data.id
  })
  info.value = response
}
// 获得害虫列表
const pestList = ref<any[]>([])
const getPestList = async () => {
  const { response } = await GetPestSpeciesContents()
  pestList.value = response
}
// 获得虫情测报灯列表
const pestEquipmentList = ref<any[]>([])
const getPestEquipmentList = async () => {
  const { response } = await GetPestEquipment_All()
  pestEquipmentList.value = response
}
const changeEquipment = (val: any) => {
  if (!val) {
    info.value = null
    search()
    return
  }
  const findItem = pestEquipmentList.value.find((item: any) => item.equipmentname === val)
  getBaseDetail(findItem)
  search()
}
const params = ref<any>({
  equipmentname: props.tabParams?.equipmentname || "",
  sfnum: "",
  pesttype: "",
  startTime: "",
  endTime: ""
})
const date = ref<any>([])
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
  const { response } = await GetPestMonitorRecordstListByPage({
    ...params.value,
    page: page.value,
    intPageSize: intPageSize.value
  })
  list.value = response.data
  total.value = response.dataCount
  if (list.value.length > 0) {
    toDetail(list.value[0])
  } else {
    data.value = {}
  }
}
const search = () => {
  page.value = 1
  getListData()
}
const reset = () => {
  params.value = {}
  date.value = []
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

// 点击图片预览
const preview = () => {
  if (data.value.aiidentifyurl) {
    const urls = ["/statisUrl/" + data.value.aiidentifyurl, "/statisUrl/" + data.value.sampleurl]
    u.showPreviewImg(0, urls)
  } else {
    ElMessage.warning("暂无识别图片")
  }
}
// 点击查看设备图片
const previewEquipment = () => {
  if (info.value.equipmenturl) {
    const urls = ["/statisUrl/" + info.value.equipmenturl]
    u.showPreviewImg(0, urls)
  } else {
    ElMessage.warning("暂无图片预览")
  }
}

// 显示详情
const showBaseDetail = ref(false)
const data = ref<any>({})
const toDetail = (item: any) => {
  item.pestlist =
    item.pesttype?.split(",").map((d: any) => {
      const pest = d.split("x")
      return {
        pestname: pest[0],
        pestcount: pest[1]
      }
    }) || []
  data.value = item
  showBaseDetail.value = true
}
onMounted(() => {
  getPestList() // 获得害虫列表
  // getPestEquipmentList() // 获得虫情测报灯列表
  // getListData()
  // 如果props.tabParams有值，则根据tabParams查询
  Promise.all([getPestEquipmentList()]).then(() => {
    if (props.tabParams) {
      changeEquipment(props.tabParams.equipmentname)
    } else {
      getListData()
    }
  })
})
</script>
<template>
  <div class="monitoring-record">
    <div
      v-if="info"
      class="info-box"
    >
      <div class="info-box-title">
        设备基本信息
        <el-tag
          v-if="info.equipmenturl"
          type="success"
          size="small"
          effect="dark"
          style="cursor: pointer"
          @click="previewEquipment"
          >查看图片</el-tag
        >
      </div>
      <div class="info-box-content">
        <div class="info-box-content-item">
          <div class="info-box-content-item-title">Top3害虫：</div>
          <div class="info-box-content-item-value">
            <template v-if="info.topthree?.length > 0">
              <span v-for="(item, index) in info.topthree">
                {{ item.xAxis }}-{{ item.yAxis }}只<span v-if="index !== info.topthree.length - 1"> &nbsp;</span>
              </span>
            </template>
            <span v-else>暂无</span>
          </div>
        </div>
        <div class="info-box-content-item">
          <div class="info-box-content-item-title">设备名称：</div>
          <div class="info-box-content-item-value">{{ info.equipmentname }}</div>
        </div>
        <div class="info-box-content-item">
          <div class="info-box-content-item-title">所属单位：</div>
          <div class="info-box-content-item-value">{{ info.affiliatedunit }}</div>
        </div>
        <div class="info-box-content-item">
          <div class="info-box-content-item-title">设备品牌：</div>
          <div class="info-box-content-item-value">{{ info.equipmentbrand }}</div>
        </div>
        <div class="info-box-content-item">
          <div class="info-box-content-item-title">设备型号：</div>
          <div class="info-box-content-item-value">{{ info.equipmentmodel }}</div>
        </div>
        <div class="info-box-content-item">
          <div class="info-box-content-item-title">经度：</div>
          <div class="info-box-content-item-value">{{ info.lon }}</div>
        </div>
        <div class="info-box-content-item">
          <div class="info-box-content-item-title">纬度：</div>
          <div class="info-box-content-item-value">{{ info.lat }}</div>
        </div>
        <div class="info-box-content-item">
          <div class="info-box-content-item-title">设备状态：</div>
          <div class="info-box-content-item-value">{{ info.statue }}</div>
        </div>
        <div class="info-box-content-item">
          <div class="info-box-content-item-title">实时数据：</div>
          <div class="info-box-content-item-value">{{ info.records || "暂无" }}</div>
        </div>
      </div>
      <el-divider />
    </div>
    <div class="search-box">
      <el-form
        label-width="80px"
        inline
      >
        <el-form-item label="设备名称">
          <el-select
            v-model="params.equipmentname"
            placeholder="请选择设备名称"
            :teleported="false"
            clearable
            filterable
            popper-class="custom-select-popper"
            @change="changeEquipment"
          >
            <el-option
              v-for="item in pestEquipmentList"
              :key="item.equipmentname"
              :label="item.equipmentname"
              :value="item.equipmentname"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="害虫数量">
          <el-select
            v-model="params.sfnum"
            placeholder="请选择害虫数量"
            :teleported="false"
            clearable
            popper-class="custom-select-popper"
          >
            <el-option
              label="有"
              value="有"
            />
            <el-option
              label="无"
              value="无"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="害虫种类">
          <el-select
            v-model="params.pesttype"
            placeholder="请选择害虫种类"
            :teleported="false"
            clearable
            filterable
            popper-class="custom-select-popper"
          >
            <el-option
              v-for="item in pestList"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="采样时间"
          class="date-box"
        >
          <el-date-picker
            v-model="date"
            type="datetimerange"
            range-separator="-"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
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
        <template v-if="list.length > 0">
          <div
            v-for="item in list"
            class="item"
            @click="toDetail(item)"
          >
            <div class="img-box">
              <el-image
                :src="'/statisUrl/' + item.sampleurl"
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
              <div>设备名称：{{ item.equipmentname }}</div>
              <div>害虫数量：{{ item.pestnum }}</div>
              <div>害虫种类：{{ item.pesttype }}</div>
              <div>采样时间：{{ item.sampletime }}</div>
            </div>
          </div>
        </template>
        <EmptyData v-else />
      </el-scrollbar>
      <div class="detail-box corner">
        <el-image
          :src="'/statisUrl/' + data.aiidentifyurl"
          alt=""
          fit="fill"
          @click="preview"
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
              <span style="margin-left: 3px">暂无识别图片</span>
            </div>
          </template></el-image
        >
        <el-scrollbar class="detail-wrap">
          <div class="detail-box-content">
            <div class="hd">
              <img
                :src="$fun.getImg('backgroundResources/icon1.png')"
                alt=""
              />
              <span>分析报告</span>
            </div>
            <div class="content">
              <div>采样时间：{{ data.sampletime }}</div>
              <div>设备名称：{{ data.equipmentname }}</div>
              <div>害虫数量：{{ data.pestnum }}</div>
              <div class="table">
                <div class="thead">
                  害虫名称<br />
                  害虫数量
                </div>
                <div
                  v-for="item in data.pestlist"
                  class="tbody"
                >
                  {{ item.pestname }}<br />
                  {{ item.pestcount }}只
                </div>
              </div>
              <div>备注：{{ data.remark }}</div>
              <div>分析员：{{ data.analyst }}</div>
            </div>
          </div></el-scrollbar
        >
        <div class="corner-top-left"></div>
        <div class="corner-top-right"></div>
        <div class="corner-bottom-left"></div>
        <div class="corner-bottom-right"></div>
      </div>
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
</template>

<style lang="scss" scoped>
.monitoring-record {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  color: #fff;
  font-size: 0.7292vw;
  .info-box {
    display: flex;
    flex-direction: column;
    .info-box-title {
      font-size: 0.9375vw;
      color: #fff;
      margin-bottom: 20px;
    }
    .info-box-content {
      display: flex;
      flex-wrap: wrap;
      column-gap: 30px;
      row-gap: 10px;
      padding-left: 30px;
      font-size: 0.8333vw;
      .info-box-content-item {
        display: flex;
        align-items: center;
      }
    }
  }
  .search-box {
    :deep(.el-form) {
      .el-form-item {
        margin-right: 14px;
      }
      .el-form-item__label {
        color: #fff;
      }
      .el-form-item__content {
        border: 1px solid #304868;
        border-radius: 2px;
        width: 160px;
      }
      .date-box {
        .el-form-item__content {
          width: 352px;
        }
      }
      .search-btns {
        .el-form-item__content {
          width: fit-content;
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
    display: flex;
    gap: 0.7292vw;
    overflow: hidden;
    .el-scrollbar {
      width: 60%;
      height: 100%;
      .el-scrollbar__view {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        .item {
          position: relative;
          width: calc(calc(100% - 20px) / 3);
          height: 180px;
          border: 1px solid #057ec7;
          border-radius: 2px;
          background-color: #092239;
          font-size: 0.625vw;
          color: #fff;
          cursor: pointer;
          .img-box {
            width: 100%;
            height: 100px;
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
            height: 80px;
            display: flex;
            flex-direction: column;
            justify-content: space-evenly;
            font-size: 0.625vw;
            padding: 0 0.2604vw;
            background-color: rgba(0, 0, 0, 0.2);
          }
        }
      }
    }

    .detail-box {
      flex: 1;
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 0.5208vw;
      font-size: 0.7292vw;
      &.corner {
        position: relative;
        .corner-top-left,
        .corner-bottom-right,
        .corner-top-right,
        .corner-bottom-left {
          position: absolute;
          inset: 0;
          user-select: none;
          pointer-events: none;
        }
        .corner-top-left::before,
        .corner-bottom-right::after,
        .corner-top-right::before,
        .corner-bottom-left::after {
          content: "";
          position: absolute;
          width: 6px;
          height: 6px;
        }
        .corner-top-left::before {
          top: 0;
          left: 0;
          border-top: 1px solid #38eaed;
          border-left: 1px solid #38eaed;
        }
        .corner-bottom-right::after {
          bottom: 0;
          right: 0;
          border-bottom: 1px solid #38eaed;
          border-right: 1px solid #38eaed;
        }
        .corner-top-right::before,
        .corner-bottom-left::after {
          content: "";
          position: absolute;
          width: 6px;
          height: 6px;
        }
        .corner-top-right::before {
          top: 0;
          right: 0;
          border-top: 1px solid #38eaed;
          border-right: 1px solid #38eaed;
        }
        .corner-bottom-left::after {
          bottom: 0;
          left: 0;
          border-bottom: 1px solid #38eaed;
          border-left: 1px solid #38eaed;
        }
      }
      .el-image {
        height: 200px;
        overflow: hidden;
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
      .detail-wrap {
        flex: 1;
      }
      .detail-box-content {
        user-select: text;
        line-height: 2em;
        color: #86a1bc;
        .hd {
          display: flex;
          align-items: center;
          height: 1.6667vw;
          color: #3be3de;
          gap: 0.3125vw;
          img {
            width: 0.9375vw;
          }
        }
        .table {
          display: flex;
          line-height: 1.5em;
          width: fit-content;
          border-radius: 0.1042vw;
          overflow: hidden;
          .thead {
            padding: 3px 0.5208vw;
            background-color: #1f4765;
          }
          .tbody {
            padding: 3px 0.5208vw;
            background-color: #173f66;
          }
        }
      }
      .edit-btn {
        position: absolute;
        bottom: 10px;
        right: 10px;
        display: flex;
        align-items: center;
        gap: 0.2083vw;
        padding: 0.2604vw 0.7292vw;
        color: #2bf6f7;
        border-radius: 2px;
        border: 1px solid #2bf6f7;
        cursor: pointer;
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
}
</style>
