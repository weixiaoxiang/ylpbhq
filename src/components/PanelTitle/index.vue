<script lang="ts" setup>
interface Props {
  title: string
  subTitle?: string
  initType?: string
  types?: string[]
  btns?: string[]
  initSelect?: string
  selectList?: any[]
  download?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  title: "",
  subTitle: "",
  initType: "巡护里程",
  types: () => [],
  btns: () => [],
  initSelect: "",
  selectList: () => [],
  download: false
})
const proxy = getCurrentInstance()!.proxy as any

const activeType = ref(props.initType)
const selectValue = ref(props.initSelect)
const changeType = (type: any) => {
  activeType.value = type
  proxy.$mitt.emit("changePanelTitleType", props.title + "-" + type)
}
const handleBtn = () => {
  if (props.title === "车辆进出记录") {
    changeType("更多")
  }
  if (props.title === "预警监测") {
    changeType("更多")
  }
  if (props.title === "抓拍记录") {
    changeType("更多")
  }
  if (props.title === "最新抓拍") {
    changeType("更多")
  }
  if (props.title === "火情预警") {
    changeType("更多")
  }
  if (props.title === "保护等级") {
    changeType("更多")
  }
  if (props.title === "古树档案") {
    changeType("更多")
  }
  if (props.title === "害虫统计") {
    changeType("详情")
  }
  if (props.title === "最新物种记录") {
    changeType("更多")
  }
  if (props.title === "预警概况") {
    changeType("更多")
  }
  if (props.title === "学习课堂") {
    changeType("更多")
  }
}
const handleDownload = () => {
  proxy.$mitt.emit("changePanelTitleType", props.title + "-" + "download")
}
// 处理选项数据的计算属性
const processedSelectList = computed(() => {
  return (
    props.selectList?.map((item) => {
      if (typeof item === "object" && item !== null) {
        return {
          label: item.label,
          value: item.value
        }
      }
      return {
        label: String(item),
        value: item
      }
    }) || []
  )
})
// 选择
const changeSelect = (value: any) => {
  proxy.$mitt.emit("changePanelTitleType", props.title + "-" + value)
}
</script>

<template>
  <div class="panel-title">
    <div class="flex items-center">
      <img
        class="h-[42px]"
        :src="$fun.getImg('title-icon.svg')"
        alt=""
      />
      <div class="title-text mt-1 text-lg text-white">
        <!-- 主标题 -->
        <span v-if="title">{{ title }}</span>
        <slot name="title" />
      </div>
    </div>
    <div class="tool-box">
      <el-select
        v-if="selectList?.length > 0"
        v-model="selectValue"
        placeholder="请选择"
        :teleported="true"
        popper-class="custom-select-popper"
        size="small"
        @change="changeSelect"
      >
        <el-option
          v-for="item in processedSelectList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <div
        v-for="type in types"
        :key="type"
        class="tool"
        :class="{ active: activeType === type }"
        v-ripple="{ color: 'rgba(68, 228, 202,0.9)', duration: 600 }"
        @click="changeType(type)"
      >
        {{ type }}
      </div>
      <div
        v-for="btn in btns"
        :key="btn"
      >
        <div
          v-if="btn === '更多'"
          class="btn"
          @click="handleBtn"
        >
          更多
        </div>
        <div
          v-if="btn === '详情'"
          class="btn"
          @click="handleBtn"
        >
          详情
        </div>
      </div>
      <div
        class="download-btn"
        v-if="download"
        @click="handleDownload"
      >
        <img
          :src="$fun.getImg('bigDataAnalysis/m5.png')"
          alt=""
        />
      </div>
    </div>
    <div
      v-if="subTitle"
      class="-ml-2 mt-1 text-[.625vw] text-[#b0bac4]"
    >
      <!-- 副标题 -->
      <span>{{ subTitle }}</span>
    </div>
    <div class="line"></div>
  </div>
</template>

<style scoped lang="scss">
.panel-title {
  position: relative;
  background: url("@/assets/images/title-bg.png") no-repeat center center / 100% 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 10px;
  .line {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0px;
    height: 1px;
    background: #406991;
    margin: 0 8px;
    // background: url("@/assets/images/title-line.png") no-repeat center center / cover;
    &::before {
      content: "";
      position: absolute;
      top: 50%;
      left: -15px;
      transform: translateY(-50%);
      width: 26px;
      height: 26px;
      background: url("@/assets/images/title-rect-icon.png") no-repeat center center / cover;
    }
    &::after {
      content: "";
      position: absolute;
      top: 50%;
      right: -15px;
      transform: translateY(-50%);
      width: 26px;
      height: 26px;
      background: url("@/assets/images/title-rect-icon.png") no-repeat center center / cover;
    }
  }
  .title-text {
    font-size: 0.9375vw;
  }
  :deep(.tool-box) {
    display: flex;
    align-items: center;
    font-size: 0.7292vw;
    .el-select {
      width: 5.2083vw;
      .el-select__wrapper {
        background-color: #142335;
        color: #aab4c1;
        box-shadow: none;
      }
    }

    .tool {
      display: flex;
      align-items: center;
      height: 24px;
      padding: 0 12px;
      color: #adb2b8;
      background: #142335;
      cursor: pointer;
      &.active {
        background: linear-gradient(to right, #58baf1, #4693be 50%, #346d8d);
        color: #fff;
      }
    }
    .btn {
      color: #beccdc;
      text-decoration: underline;
      cursor: pointer;
      margin: 0 5px;
    }
    .download-btn {
      width: 26px;
      height: 26px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 5px;
      cursor: pointer;
    }
  }
}
</style>
