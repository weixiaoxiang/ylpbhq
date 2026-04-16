<!-- 共建成果 -->
<template>
  <div class="wrap collaborative-outcomes">
    <div class="wrap-header">
      <div class="title-content">
        <img
          class="title-logo"
          :src="$fun.getImg('title-icon.svg')"
          alt=""
        />
        <div class="title">共建成果</div>
      </div>
      <div class="title-con">
        <div class="tabs">
          <div
            class="tab"
            @click="toMore"
          >
            更多
          </div>
          <div class="tabline"></div>
        </div>
      </div>
    </div>
    <div class="line"></div>
    <div class="wrap-con">
      <div
        class="item"
        v-for="(item, index) in list"
        :class="{ 'no-before-style': index === 0 }"
        :key="index"
        @click="toDetail(item)"
      >
        <div
          class="first-list"
          v-if="index == 0"
        >
          <div class="img-box">
            <img
              style="width: 100%; height: 100%"
              :src="item.coverimgurl"
              alt=""
            />
          </div>
          <div class="content-box">
            <div class="time">{{ item.publishtime ? item.publishtime.substr(0, 10) : "" }}</div>
            <span class="title">{{ item.mc }}</span>
            <div class="info">
              <span>{{
                item.contents
                  .replace(/<\/?[^>]*>/g, "")
                  .replaceAll("nbsp;", "")
                  .replace(/\&/g, "")
              }}</span>
            </div>
          </div>
        </div>
        <span
          class="name"
          v-if="index !== 0"
          >{{ item.mc }}</span
        >
        <span
          class="time"
          v-if="index !== 0"
          >{{ item.publishtime ? item.publishtime.substr(0, 10) : "" }}</span
        >
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
const { proxy } = getCurrentInstance() as any
import { onMounted, ref } from "vue"
const emit = defineEmits(["getList"])
let props = defineProps(["dataList"])
const list = ref<any>([])
let truncatedContents = ref()
watch(
  () => props.dataList,
  (newVal: any) => {
    if (newVal.length > 3) {
      list.value = newVal.slice(0, 3)
    } else {
      list.value = newVal
    }
  },
  {
    immediate: true
  }
)
//打开更多页面
const toMore = () => {
  proxy.$mitt.emit("openmore", { typename: "共建成果", typeid: 1 })
}
//查看详情
const toDetail = (item: any) => {
  proxy.$mitt.emit("opendetail", { data: item, txt: "共建成果" })
}

onMounted(() => {
  emit("getList", "共建成果", 1)
})
</script>
<style lang="scss" scoped>
.collaborative-outcomes {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
