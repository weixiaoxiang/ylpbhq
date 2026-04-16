<script lang="ts" setup>
import { GetAnimalsPlantsListByPage, GetAnimalsPlantsStatisticalAnalysis_Zwzlbleve } from "@/api"
import BaseDetail from "./BaseDetail.vue"
import { Search } from "@element-plus/icons-vue"

interface Props {
  width?: number
  height?: number
  type?: string
}
const props = withDefaults(defineProps<Props>(), {
  type: ""
})
const proxy = getCurrentInstance()!.proxy as any
// 点击更多进入时显示搜索
const params = ref<any>({
  keyword: "", // 关键字
  remark: "", // 数据类型
  plevel: "", // 保护等级
  zxwz: "", // 是否珍稀
  ke: "", // 所属科
  shu: "", // 所属属
  btype: "", // 种类
  sfhwxj: "" // 是否红外相机抓拍
})
const getList = async () => {
  let res
  if (props.type.indexOf("国家") > -1) {
    const { response } = await GetAnimalsPlantsStatisticalAnalysis_Zwzlbleve({
      datatype: props.type.indexOf("动物") > -1 ? "动物" : "植物",
      levetype: props.type.indexOf("Ⅰ级") > -1 ? "国一" : "国二",
      page: page.value,
      intPageSize: intPageSize.value
    })
    res = response
  } else {
    if (props.type) {
      params.value.remark = props.type
    }
    const { response } = await GetAnimalsPlantsListByPage({
      ...params.value,
      page: page.value,
      intPageSize: intPageSize.value
    })
    res = response
  }

  tableData.value = res.data

  total.value = res.dataCount
}
const tableColumns = ref<any[]>([
  {
    label: "中文名称",
    prop: "mc"
  },
  {
    label: "拉丁文名称",
    prop: "ldmc"
  },
  {
    label: "保护等级",
    prop: "plevel"
  },
  {
    label: "是否珍稀物种",
    prop: "zxwz"
  },
  {
    label: "所属科",
    prop: "ke"
  },
  {
    label: "所属属",
    prop: "shu"
  },
  {
    label: "物种图片",
    type: "slot",
    width: 120,
    prop: "picurl"
  },
  {
    label: "操作",
    type: "operation",
    width: 80,
    btns: [
      {
        label: "查看",
        textColor: "#00a2f3",
        bgColor: "transparent"
      }
    ]
  }
])
const tableData = ref<any>([])

const page = ref(1)
const intPageSize = ref(10)
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
const showBaseDetail = ref(false)
const info = ref<any>()
// 表格操作按钮点击事件
const handleTableBtnClick = (data: any) => {
  info.value = data.row
  showBaseDetail.value = true
}
onMounted(() => {
  proxy.$mitt.on("handleTableBtnClick", handleTableBtnClick)
  getList()
})
onBeforeUnmount(() => {
  proxy.$mitt.off("handleTableBtnClick", handleTableBtnClick)
})
</script>
<template>
  <div
    class="data-panel1"
    :style="{ width: width + 'px', height: height + 'px' }"
  >
    <div class="title-box">
      <img
        :src="$fun.getImg('researchManagement/icon14.png')"
        alt=""
      />
      {{ type }}
    </div>
    <div class="mian panzoom-exclude">
      <div
        v-if="!type"
        class="search-box"
      >
        <el-form
          :model="params"
          label-width="80px"
          inline
        >
          <el-form-item label="关键字">
            <el-input
              v-model="params.keyword"
              placeholder="请输入关键字"
              :prefix-icon="Search"
              clearable
          /></el-form-item>
          <el-form-item label="数据类型">
            <el-select
              v-model="params.remark"
              placeholder="请选择数据类型"
              :teleported="false"
              clearable
              popper-class="custom-select-popper"
            >
              <el-option
                label="植物"
                value="植物"
              />
              <el-option
                label="动物"
                value="动物"
              />
              <el-option
                label="珍稀植物"
                value="珍稀植物"
              />
              <el-option
                label="珍稀动物"
                value="珍稀动物"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="保护等级">
            <el-select
              v-model="params.plevel"
              placeholder="请选择保护等级"
              :teleported="false"
              clearable
              popper-class="custom-select-popper"
            >
              <el-option
                label="国一"
                value="国一"
              />
              <el-option
                label="国二"
                value="国二"
              />
              <el-option
                label="省一"
                value="省一"
              />
              <el-option
                label="省二"
                value="省二"
              />
            </el-select>
          </el-form-item>
          <!-- <el-form-item label="是否珍稀">
            <el-select
              v-model="params.zxwz"
              placeholder="请选择是否珍稀物种"
              :teleported="false"
              clearable
              popper-class="custom-select-popper"
            >
              <el-option
                label="是"
                value="是"
              />
              <el-option
                label="否"
                value="否"
              />
            </el-select>
          </el-form-item> -->
          <el-form-item label="所属科">
            <el-input
              v-model="params.ke"
              placeholder="请输入所属科"
              :prefix-icon="Search"
              clearable
          /></el-form-item>
          <el-form-item label="所属属">
            <el-input
              v-model="params.shu"
              placeholder="请输入所属属"
              :prefix-icon="Search"
              clearable
          /></el-form-item>
          <el-form-item label="种类">
            <el-input
              v-model="params.btype"
              placeholder="请输入种类"
              :prefix-icon="Search"
              clearable
          /></el-form-item>
          <el-form-item label="是否红外">
            <el-select
              v-model="params.sfhwxj"
              placeholder="请选择是否红外抓拍"
              :teleported="false"
              clearable
              popper-class="custom-select-popper"
            >
              <el-option
                label="是"
                value="是"
              />
              <el-option
                label="否"
                value="否"
              />
            </el-select>
          </el-form-item>
          <el-form-item class="search-btns">
            <div class="btns">
              <div
                class="btn btn1"
                @click="getList"
              >
                查询
              </div>
            </div>
          </el-form-item>
        </el-form>
      </div>
      <div class="contain-box">
        <ElTablePanel
          :show-index="true"
          :columns="tableColumns"
          :data="tableData"
        />
      </div>
      <div class="footer-box">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="intPageSize"
          :page-sizes="[10, 20, 30, 40]"
          :background="false"
          :pager-count="5"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    <teleport
      defer
      to="#dataPanel1"
    >
      <Modal
        id="baseDetail"
        v-model:show="showBaseDetail"
        disable-zoom
        :close-on-click-modal="false"
      >
        <template v-slot:container>
          <BaseDetail :data="info" />
        </template>
      </Modal>
    </teleport>
  </div>
</template>

<style lang="scss" scoped>
.data-panel1 {
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
    img {
      width: 1.3542vw;
      margin-right: 0.5208vw;
    }
  }
  .mian {
    flex: 1;
    display: flex;
    padding: 0 24px;
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
    .contain-box {
      flex: 1;
      opacity: 0.8;
      overflow: hidden;
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
</style>
