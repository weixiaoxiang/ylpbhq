<template>
  <div class="left1 wrapcom">
    <div class="wrap-header">
      <div class="title-content">
        <img
          class="title-logo"
          :src="$fun.getImg('title-icon.svg')"
          alt=""
        />
        <div class="title">社区概况</div>
      </div>
    </div>
    <div class="line"></div>
    <div class="wrap-con">
      <div class="search-box-comm">
        <el-input
          class="searchbox"
          v-model="queryForm.name"
          size="large"
          placeholder="请输入查询信息"
        >
          <template #append>
            <el-button
              :icon="Search"
              size="small"
              @click="search()"
            />
          </template>
        </el-input>
      </div>
      <LayerControl @glFeatures="glFeatures"></LayerControl>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search } from "@element-plus/icons-vue"
import LayerControl from "./layerControl/index.vue"
import { useMap } from "./map"

const { glFeatures } = useMap()

// const props = defineProps({
//   equipmentId: {
//     type: Number as any,
//     default: null
//   }
// })
const queryForm = reactive({
  page: 1,
  intPageSize: 10,
  name: "",
  typename: "",
  typeid: ""
})
//查询
const search = () => {
  // queryForm.page = 1
  // getData()
}

// watch(
//   () => props.equipmentId,
//   (newVal, oldVal) => {
//     if (newVal) {
//       getData()
//     }
//   }
// )

const getData = async () => {}

onMounted(() => {
  getData()
})
onBeforeUnmount(() => {})
</script>
<style lang="scss" scoped>
.left1 {
  height: vh(940);
  margin-top: vh(20);
}
.wrapcom {
  pointer-events: all;
  color: #ffffff;
  position: relative;

  background: url("/images/cb-bg.png") no-repeat center center/100% 100%;

  box-sizing: border-box;
  border: 1.2px solid;
  border-image: linear-gradient(180deg, rgba(193, 242, 224, 0.15) 3%, rgba(255, 255, 255, 0.35) 115%);
  backdrop-filter: blur(50px);

  // &::after {
  //   position: absolute;
  //   right: 0;
  //   bottom: 0;
  //   content: "";
  //   display: block;
  //   width: 0;
  //   height: 0;
  //   border-top: 10px solid transparent;
  //   border-right: 10px solid rgba(255, 255, 255, 0.35);
  //   border-bottom: 10px solid rgba(255, 255, 255, 0.35);
  //   border-left: 10px solid transparent;
  // }

  .wrap-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 41px;
    padding: 0 2px 0 12px;
    background: url("/statisUrl/title-bg.png") no-repeat center center / 100% 100%;
    // background: url("@/assets/IntelligentPatrol/wrap-header-bg.png") no-repeat;
    // background-size: 100% 100%;

    .title-content {
      display: flex;
    }

    .title-logo {
      height: 50px;
      width: 50px;
      margin-left: -20px;
    }

    .updatetime {
      font-family: Source Sans 3;
      font-size: 12px;
      height: 12px;
      font-weight: 400;
      line-height: 12px;
      text-align: left;
      text-underline-position: from-font;
      text-decoration-skip-ink: none;
      color: #ffffff;
      margin-right: 15px;
    }

    .title {
      display: flex;
      align-items: center;
      font-size: 16px;

      // &::before {
      //   content: "";
      //   display: inline-block;
      //   width: 17.2px;
      //   height: 16px;
      //   margin-right: 10px;
      //   background: url("@/assets/IntelligentPatrol/wrap-header-icon.png") no-repeat;
      //   background-size: 100% 100%;
      // }
    }

    .title-con {
      margin-right: vw(20);
    }
    .tabs {
      display: flex;

      align-items: center;
      height: 28px;
      padding: 2px;
      border-radius: 1px;
      // background: #11403b;
      border: 1px solid rgba(255, 255, 255, 0.25);
      // margin-left: vw(100);

      .tab {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 46px;
        height: 24px;
        text-align: center;
        opacity: 0.5;
        font-size: 14px;
        cursor: pointer;
        transition: all 1s ease 0s;

        &.active {
          opacity: 1;
          font-weight: 600;
          color: #fff;
          // border: 1px solid #42c9c7;

          background: linear-gradient(90deg, #59bbf2 0%, #336c8c 100%);
        }
      }
    }
  }
  .line {
    margin-top: -2px;
    height: 5px;
    background: url("/statisUrl/title-line.png") no-repeat center center / cover;
  }
  .linebottom {
    margin-top: -2px;
    height: 5px;
    background: url("/statisUrl/title-line2.png") no-repeat center center / cover;
  }

  .wrap-con {
    height: calc(100% - 41px);
    overflow: hidden;
    padding: vw(10);
    position: relative;
    .search-box-comm {
      height: 36px;
      padding: 0 10px;
    }
  }
}

:deep(.el-input) {
  // width: 90%;
  height: 30px;
  color: #fff;

  border: 1px solid #ffffff26;
  position: relative;
  border-radius: 1px;
  outline: none;
  text-indent: 25px;
  background-color: transparent;
  font-size: 14px;
  background: rgba(13, 54, 101, 0.5);

  .el-input__wrapper {
    padding: 0px 7px;
    box-shadow: unset;
    background-color: transparent;

    .el-input__inner {
      color: #fff;
    }

    .el-input__inner::placeholder {
      font-size: 12px;
      color: rgba(217, 217, 217, 0.5);
    }

    &.is-focus {
      box-shadow: unset;
    }
  }
  // background: #0C284D;

  .el-input-group__append {
    background-color: transparent;
    color: #fff;
    box-shadow: unset;

    .el-button {
      padding: 3px 11px;
      font-weight: 550;
    }
  }
}
</style>
