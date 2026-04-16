<script lang="ts" setup>
import { Getxh_taskinfoByPage, Getxh_taskmissonByPage } from "@/api"
import EmptyData from "@/components/Status/EmptyData.vue"
interface Props {}
withDefaults(defineProps<Props>(), {})

const emit = defineEmits<{
  handleToAdd: []
  handleToView: [any, any]
  handleToDistribute: [any]
  handleToModify: [any]
  handleToRemove: [any]
}>()
const { rwztList, rwztPfList, rwlxList, ryList } = storeToRefs(useConfigStore())
const proxy = getCurrentInstance()!.proxy as any
const tab = ref<string>("任务管理")
const changeTab = (_tab: string) => {
  tab.value = _tab
  if (_tab === "任务管理") {
    paramsRw.value = {
      mc: "",
      status: ""
    }
  }
  if (_tab === "派发管理") {
    paramsPf.value = {
      taskname: "",
      type: "",
      username: "",
      status: "",
      startTime: "",
      endTime: ""
    }
    date.value = ""
  }
  page.value = 1
  intPageSize.value = 6
  getList()
}
const date = ref<any>([])
const changeDate = () => {
  if (date.value) {
    paramsPf.value.startTime = date.value[0]
    paramsPf.value.endTime = date.value[1]
  } else {
    paramsPf.value.startTime = ""
    paramsPf.value.endTime = ""
  }
}
// 任务管理参数
const paramsRw = ref<any>({
  mc: "",
  status: ""
})
// 派发管理参数
const paramsPf = ref<any>({
  taskname: "",
  type: "",
  username: "",
  status: "",
  startTime: "",
  endTime: ""
})
const page = ref<number>(1)
const intPageSize = ref<number>(6)
const list = ref<any>([])
const total = ref(0)
const getList = async () => {
  let res
  if (tab.value === "任务管理") {
    res = await Getxh_taskinfoByPage({
      ...paramsRw.value,
      page: page.value,
      intPageSize: intPageSize.value
    })
    list.value = res.response.data
  }
  if (tab.value === "派发管理") {
    res = await Getxh_taskmissonByPage({
      ...paramsPf.value,
      page: page.value,
      intPageSize: intPageSize.value
    })
    list.value = res.response.data
  }

  total.value = res.response.dataCount
}
const handleCurrentChange = () => {
  getList()
}
const add = () => {
  emit("handleToAdd")
}
const view = (data: any) => {
  emit("handleToView", data, tab.value)
}
const distribute = (data: any) => {
  // console.log("派发")
  emit("handleToDistribute", data)
}
const modify = (data: any) => {
  emit("handleToModify", data)
}
const remove = (data: any) => {
  console.log("删除")
  emit("handleToRemove", data)
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
    <div class="tabs">
      <div
        class="tab-item"
        :class="{ active: tab === '任务管理' }"
        @click="changeTab('任务管理')"
      >
        任务管理
      </div>
      <div
        class="tab-item"
        :class="{ active: tab === '派发管理' }"
        @click="changeTab('派发管理')"
      >
        派发管理
      </div>
    </div>
    <div class="search-box">
      <el-input
        v-if="tab === '任务管理'"
        v-model="paramsRw.mc"
        placeholder="请输入任务名称"
        clearable
      />
      <el-select
        v-if="tab === '任务管理'"
        v-model="paramsRw.status"
        placeholder="请选择状态"
        :teleported="false"
        popper-class="custom-select-popper"
        clearable
      >
        <el-option
          v-for="item in rwztList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-input
        v-if="tab === '派发管理'"
        v-model="paramsPf.taskname"
        placeholder="请输入任务名称"
        clearable
      />
      <el-select
        v-if="tab === '派发管理'"
        v-model="paramsPf.type"
        placeholder="请选择任务类型"
        popper-class="custom-select-popper"
        clearable
      >
        <el-option
          v-for="item in rwlxList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-tree-select
        v-if="tab === '派发管理'"
        v-model="paramsPf.username"
        :data="ryList"
        :props="{ label: 'Name', value: 'Name', children: 'Children' }"
        :render-after-expand="false"
        :check-on-click-node="true"
        :default-expand-all="true"
        placeholder="请选择人员"
        clearable
        filterable
      />
      <el-select
        v-if="tab === '派发管理'"
        v-model="paramsPf.status"
        placeholder="请选择任务状态"
        popper-class="custom-select-popper"
        clearable
      >
        <el-option
          v-for="item in rwztPfList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-date-picker
        class="date-picker"
        v-if="tab === '派发管理'"
        v-model="date"
        type="daterange"
        value-format="YYYY-MM-DD"
        range-separator="至"
        start-placeholder="开始时间"
        end-placeholder="结束时间"
        placement="bottom-start"
        size="default"
        popper-class="custom-datepicker-popper"
        @change="changeDate"
      />
    </div>
    <div class="btns">
      <div
        class="btn"
        @click="getList"
      >
        查询
      </div>
      <div
        v-if="tab === '任务管理'"
        class="btn"
        @click="add"
      >
        新增
      </div>
    </div>
    <el-scrollbar height="100%">
      <div
        v-if="list.length > 0"
        class="con"
      >
        <div
          class="box"
          v-for="item in list"
          :key="item.Id"
          @click="view(item)"
        >
          <div
            v-if="tab === '任务管理'"
            class="box-item"
          >
            <div
              class="box-hd"
              :class="[item.statue === '启用' ? 'type1' : item.statue === '停用' ? 'type2' : 'type3']"
            >
              <div class="box-hd-title">
                <span>{{ item.taskheader }}</span>
                <span
                  v-if="item.tasknumber"
                  class="bh"
                  >{{ item.tasknumber }}</span
                >
              </div>
              <div class="hd-status hd-status1">{{ item.statue }}</div>
            </div>
            <div class="box-bd">
              <div>
                <span class="name">路线名称:</span>
                <span class="value">{{ item.LineName }}</span>
              </div>
              <div>
                <span class="name">路线长度:</span>
                <span class="value">{{ item.lxcd }}km</span>
              </div>
              <div>
                <span class="name">创建人员:</span>
                <span class="value">{{ item.CreakTaskName }}</span>
              </div>
              <div>
                <span class="name">创建时间:</span>
                <span class="value">{{ item.launchtime }}</span>
              </div>
            </div>
          </div>
          <div
            v-if="tab === '派发管理'"
            class="box-item"
          >
            <div
              class="box-hd"
              :class="[
                item.statue === 0
                  ? 'type1'
                  : item.statue === 1
                    ? 'type2'
                    : item.statue === 2
                      ? 'type3'
                      : item.statue === 3
                        ? 'type4'
                        : item.statue === 4
                          ? 'type5'
                          : ''
              ]"
            >
              <div class="box-hd-title">
                <el-tooltip
                  class="box-item"
                  effect="dark"
                  :content="item.taskheader"
                  placement="top"
                >
                  <el-text truncated>
                    {{ item.taskheader }}
                  </el-text>
                </el-tooltip>

                <span
                  v-if="item.missonnumber"
                  class="bh"
                  >{{ item.missonnumber }}</span
                >
              </div>
              <div class="hd-status hd-status1">
                {{
                  item.statue === 0
                    ? "未开始"
                    : item.statue === 1
                      ? "进行中"
                      : item.statue === 2
                        ? "已完成"
                        : item.statue === 3
                          ? "任务终止"
                          : item.statue === 4
                            ? "任务过期"
                            : ""
                }}
              </div>
            </div>
            <div class="box-bd">
              <div>
                <span class="name">任务类型:</span>
                <span class="value">{{ item.remark }}</span>
              </div>
              <div>
                <span class="name">执行人员:</span>
                <span class="value">{{ item.impname }}</span>
              </div>
              <div class="date">
                <span class="name">起止时间:</span>
                <span class="value">{{ item.commitcontent }}-{{ item.committime }}</span>
              </div>
            </div>
          </div>
          <div
            v-if="tab === '任务管理'"
            class="box-btns"
          >
            <div
              v-if="item.statue === '启用'"
              @click.stop="distribute(item)"
            >
              派发
            </div>
            <div @click.stop="modify(item)">编辑</div>
            <div @click.stop="remove(item)">删除</div>
          </div>
        </div>
      </div>
      <EmptyData
        v-else
        description="暂无数据"
      />
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
  .tabs {
    display: flex;
    gap: 10px;
    padding: 10px 10px 0 10px;
    user-select: none;
    .tab-item {
      line-height: 2em;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgb(28, 45, 63);
      cursor: pointer;
      &.active {
        background: linear-gradient(to bottom, #8ec4e4, #3275c0);
      }
    }
  }
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
      padding: 4px 20px;
      background: linear-gradient(to right, #5a8ab6, #375577);
      cursor: pointer;
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
    overflow-y: hidden;
    padding: 10px;

    .box {
      box-shadow: 0px 0px 4px 1px rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      overflow: hidden;
      border: #3b5b7f solid 1px;
      color: #aab2b8;
      cursor: pointer;
      &:hover {
        background: linear-gradient(to bottom, rgba(37, 100, 171, 0.5), rgba(23, 44, 71, 0.5));
        color: #fff;
      }

      .box-item {
        .box-hd {
          height: 40px;
          display: flex;
          // gap: 6px;
          justify-content: space-between;
          align-items: center;
          color: #fff;
          padding: 10px;
          font-size: 16px;
          .box-hd-title {
            display: flex;
            align-items: center;
            gap: 6px;
            .bh {
              padding: 3px 6px;
              border-radius: 3px;
            }
            .el-text {
              max-width: 120px;
              color: #fff;
              font-size: 16px;
            }
          }
          .hd-status {
            padding-left: 14px;
            font-size: 12px;
            &::before {
              display: inline-block;
              content: "";
              width: 10px;
              height: 10px;
              border-radius: 50%;
              background-color: inherit;
              margin-right: 5px;
            }
          }

          &.type1 {
            background-color: #28594d;
            .bh {
              background-color: #436e68;
            }
            .hd-status {
              color: #27ed46;
              &::before {
                background-color: #27ed46;
              }
            }
          }
          &.type2 {
            background-color: #f0932b;
            .bh {
              background-color: #ffbe76;
            }
            .hd-status {
              color: #d63031;
              &::before {
                background-color: #d63031;
              }
            }
          }
          &.type3 {
            background-color: #718093;
            .bh {
              background-color: #7f8fa6;
            }
            .hd-status {
              color: #222f3e;
              &::before {
                background-color: #222f3e;
              }
            }
          }
          &.type4 {
            background-color: #eb8317;
            .bh {
              background-color: #f3c623;
            }
            .hd-status::before {
              background-color: #f3c623;
            }
          }
          &.type5 {
            background-color: #18b176;
            .bh {
              background-color: #b6ffa1;
            }
            .hd-status::before {
              background-color: #b6ffa1;
            }
          }
        }
        .box-bd {
          padding: 10px;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          > div:not(.box-item-hd) {
            display: flex;
            align-items: center;
            line-height: 2em;
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
              width: 70px;
            }
            .value {
              flex: 1;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }
          .date {
            grid-column: 1 / 3;
          }
        }
      }
      .box-btns {
        margin-bottom: 10px;
        display: flex;
        justify-content: center;
        gap: 20px;
        > div {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          line-height: 2em;
          border-radius: 2px;
          background-color: #05101a;
          border: 1px solid #365375;
          cursor: pointer;
          &:nth-child(3) {
            background-color: #b55d5a;
            border-color: 1px solid #cc8e8c;
          }
        }
      }
    }
  }
}
</style>
