<script lang="ts" setup>
import { GetAllEnvironmentalEquipment, GetPageAlarms } from "@/api"
interface Props {
  width?: number
  height?: number
  type?: string
  id?: string
}
const props = withDefaults(defineProps<Props>(), {
  type: "水文"
})

defineEmits<{
  "update:show": [boolean]
}>()
const params = ref<any>({
  equipmentId: props.id,
  factor: "",
  level: "",
  startTime: "",
  endTime: ""
})
const bjsbList = ref<any[]>([])
// 获得水质站列表
const getAllEnvironmentalEquipment = async () => {
  const { response } = await GetAllEnvironmentalEquipment({
    equipmentType: "气象"
  })
  bjsbList.value = response
}
const bjyzList = ["PM2.5", "湿度", "温度", "负氧离子", "光照强度", "风向", "风速", "降雨量"]
const search = () => {
  page.value = 1
  getList()
}
const reset = () => {
  params.value = {}
  date.value = []
  page.value = 1
  getList()
}
const getList = async () => {
  tableData.value = []
  const { response } = await GetPageAlarms({
    ...params.value,
    page: page.value,
    intPageSize: intPageSize.value
  })
  tableData.value = response.data
  total.value = response.dataCount
}
const date = ref<any>()
const changeDate = () => {
  if (date.value) {
    params.value.startTime = date.value[0]
    params.value.endTime = date.value[1]
  } else {
    params.value.startTime = ""
    params.value.endTime = ""
  }
}

const tableColumns = ref<any[]>([
  {
    label: "报警时间",
    prop: "createTime"
  },
  {
    label: "报警设备",
    prop: "equipmentId"
  },
  {
    label: "报警等级",
    prop: "level"
  },
  {
    label: "监测因子",
    prop: "factor"
  },
  {
    label: "报警说明",
    prop: "instructions"
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
onMounted(() => {
  getAllEnvironmentalEquipment()
  getList()
})
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
      报警监测
    </div>
    <div class="mian panzoom-exclude">
      <div class="search-box">
        <el-form
          :model="params"
          label-width="80px"
          inline
        >
          <el-form-item label="报警设备">
            <el-select
              v-model="params.equipmentId"
              placeholder="请选择报警设备"
              :teleported="false"
              clearable
              popper-class="custom-select-popper"
            >
              <el-option
                v-for="item in bjsbList"
                :key="item.Id"
                :label="item.name"
                :value="item.equipmentId"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="报警等级">
            <el-select
              v-model="params.level"
              placeholder="请选择报警等级"
              :teleported="false"
              clearable
              popper-class="custom-select-popper"
            >
              <el-option
                label="一级报警"
                value="一级报警"
              />
              <el-option
                label="二级报警"
                value="二级报警"
              />
              <el-option
                label="三级报警"
                value="三级报警"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="监测因子">
            <el-select
              v-model="params.factor"
              placeholder="请选择监测因子"
              :teleported="false"
              clearable
              popper-class="custom-select-popper"
            >
              <el-option
                v-for="item in bjyzList"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            label="报警时间"
            class="date-box"
          >
            <el-date-picker
              v-model="date"
              type="daterange"
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
  </div>
</template>

<style lang="scss" scoped>
.data-panel {
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
            width: 240px;
          }
        }
        .el-form-item__content {
          border: 1px solid #304868;
          border-radius: 2px;
          width: 140px;
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
          background: linear-gradient(to right, #5a8ab6, #375577);
        }
        .btn2 {
          background: #051324;
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
        .el-pager {
          li {
            color: #fff;
            margin: 0 5px;
            background-color: #0b2a4e;
            border-top-left-radius: 10px;
            border-bottom-right-radius: 10px;
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
          width: 40px;
        }
        .el-pagination__jump {
          color: #fff;
        }
        button,
        button.is-disabled,
        button:disabled {
          background: none;
          color: #fff;
        }
      }
    }
  }
}
</style>
