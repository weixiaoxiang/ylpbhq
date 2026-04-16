<!-- 宣教活动 -->
<template>
  <div class="wrap education-activities">
    <div class="wrap-header">
      <div class="title-content">
        <img
          class="title-logo"
          :src="$fun.getImg('title-icon.svg')"
          alt=""
        />
        <div class="title">宣教活动</div>
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
    <div class="linekpxj"></div>
    <div class="wrap-con">
      <el-carousel
        :autoplay="true"
        indicator-position=""
      >
        <el-carousel-item
          v-for="(item, index) in list"
          :key="index"
          @click="toDetail(item)"
        >
          <div class="image">
            <img
              :src="'/imageApi/' + item.coverimgurl"
              alt=""
              style="object-fit: cover"
            />
            <div class="title">{{ item.mc }}</div>
          </div>
          <div class="info">
            <span>{{
              item.contents
                .replace(/<\/?[^>]*>/g, "")
                .replaceAll("nbsp;", "")
                .replace(/\&/g, "")
            }}</span>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>
  </div>
</template>
<script lang="ts" setup>
const { proxy } = getCurrentInstance() as any
import { onMounted, ref } from "vue"
const emit = defineEmits(["getList"])
let props = defineProps(["dataList"])
const list = ref<any>([])
watch(
  () => props.dataList,
  (newVal: any) => {
    list.value = newVal
  },
  {
    immediate: true
  }
)
//打开更多页面
const toMore = () => {
  proxy.$mitt.emit("openmore", { typename: "宣教活动", typeid: 5 })
}

//查看详情
const toDetail = (item: any) => {
  proxy.$mitt.emit("opendetail", { data: item, txt: "宣教活动" })
}
onMounted(() => {
  emit("getList", "宣教活动", 5)
})
</script>
<style lang="scss" scoped>
.education-activities {
  width: 100%;
  height: 100%;
  display: block;

  .linekpxj {
    margin-top: -2px;
    height: 5px;
    background: url("/statisUrl/title-linexjhd.png") no-repeat center center / cover;
  }
  // .box-con {
  //   position: relative;

  .image {
    position: relative;
    width: 100%;
    height: calc(100% - 56px);
    img {
      width: 100%;
      height: 100%;
    }
    .title {
      position: absolute;
      bottom: 0;
      width: 100%;
      height: 30px;
      background: #0000004b;
      color: #fff;
      line-height: 30px;
      padding: 0 10px;
    }
  }
  .info {
    height: 56px;
    padding: 10px 0;
    color: #fff;
    font-size: 14px;
    font-weight: normal;
    line-height: 18px;
    span {
      text-indent: 2em;
      display: -webkit-box; /* 必须设置display属性为-webkit-box */
      overflow: hidden; /* 超出部分隐藏 */
      text-overflow: ellipsis; /* 显示省略号 */
      -webkit-line-clamp: 2; /* 限制显示两行 */
      -webkit-box-orient: vertical; /* 垂直方向上的换行 */
    }
  }
  // }
}
:deep(.el-carousel--horizontal) {
  height: 100% !important;
  .el-carousel__indicators--horizontal {
    bottom: -12px;
  }
}
:deep(.el-carousel__container) {
  height: 100% !important;
  .el-carousel__item {
    cursor: pointer;
    // display: flex !important;
  }
}
</style>
