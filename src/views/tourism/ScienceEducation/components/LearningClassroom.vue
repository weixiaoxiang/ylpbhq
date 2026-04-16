<!-- 学习课堂 -->
<template>
  <div class="wrap learnin-classroom">
    <!-- <div class="wrap-header">
      <div class="title-content">
        <img
          class="title-logo"
          :src="$fun.getImg('title-icon.svg')"
          alt=""
        />
        <div class="title">学习课堂</div>
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
    <div class="wrap-con">
      <div
        class="item"
        :class="{ 'no-before-style': index === 0 }"
        v-for="(item, index) in list"
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
    </div> -->
    <BasePanel
      title="学习课堂"
      :btns="['更多']"
    >
      <template #contain>
        <div class="contain wrap-con">
          <div
            class="item"
            :class="{ 'no-before-style': index === 0 }"
            v-for="(item, index) in list"
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
      </template>
    </BasePanel>
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
  proxy.$mitt.emit("openmore", { typename: "学习课堂", typeid: 2 })
}
//查看详情
const toDetail = (item: any) => {
  proxy.$mitt.emit("opendetail", { data: item, txt: "学习课堂" })
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
const changePanelTitleType = (type: string) => {
  if (type === "学习课堂-更多") {
    toMore()
  }
}
onMounted(() => {
  emit("getList", "学习课堂", 2)
  proxy.$mitt.on("changePanelTitleType", changePanelTitleType)
})
onBeforeUnmount(() => {
  proxy.$mitt.off("changePanelTitleType", changePanelTitleType)
})
</script>
<style lang="scss" scoped>
.learnin-classroom {
  width: 100%;
  height: 100%;
  .box-con {
    padding: 10px 20px !important;
    overflow: auto;
    .item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      font-size: 16px;
      font-weight: normal;
      font-family: 思源黑体;
      text-align: justify; /* 浏览器可能不支持 */
      color: #ffffff;
      cursor: pointer;
      .name {
        flex: 1;
        margin-right: 10px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      &:last-child {
        margin-bottom: 0;
      }
      &::before {
        content: "";
        display: inline-block;
        width: 8px;
        height: 8px;
        margin-right: 10px;
        border-radius: 50%;
        border: 1px solid #3fffa3;

        box-shadow: inset 0px 0px 9.3px 0px #53ffc1;
      }
      &:hover {
        color: #3fffa3;
      }
    }
  }
}
</style>
