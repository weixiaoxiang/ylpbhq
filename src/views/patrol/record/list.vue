<script lang="ts" setup>
import { GetXhgj_XhgjListByPage } from "@/api"
interface Props {
  initParams?: any // 初始化list参数
}
const props = withDefaults(defineProps<Props>(), {
  initParams: () => {}
})

const emit = defineEmits<{
  handleToAdd: []
  handleToView: [any]
}>()
const { ryList, jgList } = storeToRefs(useConfigStore())
const proxy = getCurrentInstance()!.proxy as any
// 参数
const date = ref<any>()
const params = ref<any>({})
// 初始化list参数
if (props.initParams) {
  params.value = props.initParams
}
const page = ref<number>(1)
const intPageSize = ref<number>(6)
const changeDate = () => {
  if (date.value) {
    params.value.startTime = date.value[0]
    params.value.endTime = date.value[1]
  } else {
    params.value.startTime = ""
    params.value.endTime = ""
  }
}
const reset = () => {
  date.value = ""
  params.value = {}
  page.value = 1
  intPageSize.value = 6
  getList()
}
const search = () => {
  page.value = 1
  intPageSize.value = 6
  getList()
}
const list = ref<any>([])
const total = ref<any>(0)
const getList = async () => {
  const { response } = await GetXhgj_XhgjListByPage({
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
      <el-tree-select
        v-model="params.userid"
        :data="ryList"
        :props="{ label: 'Name', value: 'Id', children: 'Children' }"
        :render-after-expand="false"
        :check-on-click-node="true"
        :default-expand-all="true"
        placeholder="请选择相关人员"
        clearable
        filterable
      />
      <el-tree-select
        v-model="params.orgid"
        :data="jgList"
        :props="{ label: 'Name', value: 'Id', children: 'Children' }"
        :render-after-expand="false"
        :check-on-click-node="true"
        :default-expand-all="true"
        placeholder="请选择机构"
        clearable
      />
      <el-date-picker
        class="date-picker"
        v-model="date"
        type="daterange"
        range-separator="至"
        start-placeholder="开始时间"
        end-placeholder="结束时间"
        placement="bottom-start"
        value-format="YYYY-MM-DD"
        size="default"
        popper-class="custom-datepicker-popper"
        @change="changeDate"
      />
      <el-select
        v-model="params.xhtype"
        :teleported="false"
        placeholder="请选择巡护方式"
        popper-class="custom-select-popper"
        clearable
      >
        <el-option
          label="步行"
          value="步行"
        />
        <el-option
          label="驾车"
          value="驾车"
        />
        <el-option
          label="骑行"
          value="骑行"
        />
      </el-select>
      <div class="btns">
        <div
          class="btn"
          @click="reset"
        >
          重置
        </div>
        <div
          class="btn"
          @click="search"
        >
          查询
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
          <div class="box-hd">{{ item.XhRq }}</div>
          <div class="box-item">
            <div>
              <span class="name">巡护人:</span>
              <span class="value">{{ item.User_Name }}</span>
            </div>
            <div>
              <span class="name">时长:</span>
              <span class="value">{{ item.Xhtime }}小时</span>
            </div>
            <div>
              <span class="name">采集数:</span>
              <span class="value">{{ item.CollectionCount }}</span>
            </div>
            <div>
              <span class="name">报警数:</span>
              <span class="value">{{ item.AlarmCount }}</span>
            </div>
            <div>
              <span class="name">巡护方式:</span>
              <span class="value">{{ item.Xhtype }}</span>
            </div>
            <div>
              <span class="name">总里程:</span>
              <span class="value">{{ item.Xhkm }}千米</span>
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
      background: linear-gradient(to bottom right, #5a89b5, #375577);
      cursor: pointer;
    }
    .btn:first-child {
      background: #030b12;
      border: 1px solid #355173;
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
