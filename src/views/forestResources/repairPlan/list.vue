<script lang="ts" setup>
import { GetForestResourcesPlanListByPage } from "@/api"

interface Props {}
withDefaults(defineProps<Props>(), {})

const emit = defineEmits<{
  handleToAdd: [any]
  handleToView: [any]
}>()
const proxy = getCurrentInstance()!.proxy as any
// 参数
const params = ref<any>({
  keyword: "",
  type: ""
})
const page = ref<number>(1)
const intPageSize = ref<number>(6)
const typeList = [
  { label: "封山育林", value: "1" },
  { label: "新造林", value: "2" },
  { label: "森林抚育", value: "3" },
  { label: "退化林修复", value: "4" }
]
const reset = () => {
  params.value = {}
  page.value = 1
  intPageSize.value = 6
  getList()
}
const list = ref<any>([
  {
    id: 1,
    mc: "规划名称1",
    type: "新造林",
    nf: "2023",
    mj: "34",
    jine: "100000"
  },
  {
    id: 2,
    mc: "规划名称2",
    type: "新造林",
    nf: "2023",
    mj: "34",
    jine: "100000"
  },
  {
    id: 3,
    mc: "规划名称3",
    type: "新造林",
    nf: "2023",
    mj: "34",
    jine: "100000"
  }
])
const total = ref<any>(0)
const getList = async () => {
  const { response } = await GetForestResourcesPlanListByPage({
    page: page.value,
    intPageSize: intPageSize.value,
    ...params.value
  })
  list.value = response.data
  total.value = response.dataCount
}
const handleCurrentChange = () => {
  getList()
}
const add = () => {
  emit("handleToAdd", true)
}
const view = (data: any) => {
  emit("handleToView", data)
}
onMounted(() => {
  getList()
  proxy.$mitt.on("refresh-list", getList)
})
onUnmounted(() => {
  proxy.$mitt.off("refresh-list", getList)
})
</script>
<template>
  <div class="list">
    <div class="search-box">
      <el-input
        v-model="params.keyword"
        placeholder="请输入搜索关键字"
        clearable
      />
      <el-select
        v-model="params.type"
        placeholder="请选择任务类型"
        popper-class="custom-select-popper"
        clearable
      >
        <el-option
          v-for="item in typeList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <div class="btns">
        <div
          class="btn"
          @click="getList"
        >
          查询
        </div>
        <div
          class="btn"
          @click="reset"
        >
          重置
        </div>

        <div
          class="btn"
          @click="add"
        >
          新增
        </div>
      </div>
    </div>
    <el-scrollbar height="100%">
      <div class="con">
        <div
          class="box"
          v-for="item in list"
          :key="item.id"
          @click="view(item)"
        >
          <div class="box-hd">{{ item.planname }}</div>
          <div class="box-item">
            <div>
              <span class="name">年份:</span>
              <span class="value">{{ item.years }}</span>
            </div>
            <div>
              <span class="name">面积:</span>
              <span class="value">{{ item.planarea }}</span>
            </div>
            <div>
              <span class="name">类型:</span>
              <span class="value">{{ item.plantype }}</span>
            </div>
            <div>
              <span class="name">金额:</span>
              <span class="value">{{ item.amount }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-scrollbar>
    <el-pagination
      v-model:current-page="page"
      v-model:page-size="intPageSize"
      :page-sizes="[10, 20, 30, 40]"
      :background="false"
      :pager-count="5"
      layout="total, pager, jumper"
      :total="total"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<style lang="scss" scoped>
.list {
  display: flex;
  flex-direction: column;
  font-size: 14px;
  color: #fff;
  width: 420px;
  position: absolute;
  top: 20px;
  right: 20px;
  bottom: 20px;
  background-color: rgba(11, 25, 39, 0.9);
  border: 1px solid #505b65;
  border-radius: 6px;
  box-shadow: 0 0 10px 1px rgba(255, 255, 255, 0.2) inset;
  z-index: 998;
  :deep(.search-box) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    padding: 10px;
    .el-input__wrapper,
    .el-select__wrapper {
      background-color: #121f28;
      box-shadow: none;
      border: 1px solid #656d74;
      border-radius: 0;
    }
    .date-picker {
      width: 100%;
      grid-column: 1 / 3;
      .el-range-separator {
        color: #a8abb2 !important;
      }
    }
    .btns {
      padding: 0;
      grid-column: 2;
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
      background: #030b12;
      cursor: pointer;
      border: 1px solid #355173;
    }
    .btn:first-child {
      background: linear-gradient(to bottom right, #5a89b5, #375577);
    }
  }
  :deep(.el-pagination) {
    margin-bottom: 10px;
    justify-content: center;
    .el-pager {
      li {
        background: transparent;
        color: #fff;
      }
      li.is-active {
        color: #195bdf;
        background-color: rgba(26, 39, 52, 0.5);
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
  }
  .con {
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex: 1;
    overflow-y: hidden;
    padding: 10px;

    .box {
      background-color: #0b2135;
      // box-shadow: 0px 0px 4px 1px rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      border: #3b5b7f solid 1px;
      color: #aab2b8;
      cursor: pointer;
      &:hover {
        background: linear-gradient(to bottom, rgba(37, 100, 171, 0.5), rgba(23, 44, 71, 0.5));
        color: #fff;
      }
      .box-hd {
        position: relative;
        font-size: 16px;
        line-height: 2em;
        color: #fff;
        padding: 10px;
        &::before {
          position: absolute;
          bottom: 0;
          left: 0;
          content: "";
          display: inline-block;
          width: 100%;
          height: 1px;
          background: linear-gradient(to right, rgba(88, 134, 178, 1), rgba(11, 33, 53, 1));
          opacity: 0.5;
          margin-right: 10px;
        }
      }
      .box-item {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
        padding: 10px;
        > div {
          display: flex;
          line-height: 2em;
          align-items: center;
          overflow: hidden;
          &::before {
            content: "";
            display: inline-block;
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: linear-gradient(to bottom, rgba(88, 134, 178, 1), rgba(11, 33, 53, 1));
            margin-right: 5px;
          }
          .name {
            // width: 70px;
          }
          .value {
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }
    }
  }
}
</style>
