<!-- 法律法规 -->
<template>
  <div class="wrap law">
    <div class="wrap-header">
      <!-- <div class="box-header-title">法律法规</div>
      <div
        class="box-header-more"
        @click="toMore"
      >
        更多
      </div> -->
      <div class="title-content">
        <img
          class="title-logo"
          :src="$fun.getImg('title-icon.svg')"
          alt=""
        />
        <div class="title">法律法规</div>
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
  proxy.$mitt.emit("openmore", { typename: "法律法规", typeid: "3" })
}
//查看详情
const toDetail = (item: any) => {
  proxy.$mitt.emit("opendetail", { data: item, txt: "法律法规" })
}
const truncateChineseText = (text: any, maxLength: any) => {
  // 正则表达式匹配一个汉字
  const chineseCharRegex = /[\u4e00-\u9fa5]/g

  // 使用match方法获取所有汉字并计算其数量
  let matches = text.match(chineseCharRegex)
  let chineseCharCount = matches ? matches.length : 0
  // 如果汉字数量小于等于maxLength，则直接返回原文本
  if (chineseCharCount <= maxLength) {
    return text
  }
  // 截取前maxLength个汉字
  let truncatedText = ""
  let charCount = 0
  for (let i = 0; i < text.length; i++) {
    let char = text.charAt(i)
    if (chineseCharRegex.test(char)) {
      truncatedText += char
      charCount++
      if (charCount === maxLength) {
        break
      }
    } else {
      // 如果遇到非汉字字符，可以选择跳过或者添加到结果中
    }
  }

  // 添加省略号
  truncatedText += "..."

  return truncatedText
}
onMounted(() => {
  emit("getList", "法律法规", 3)
})
</script>
<style lang="scss" scoped>
.law {
  width: 100%;
  height: 100%;
}
</style>
