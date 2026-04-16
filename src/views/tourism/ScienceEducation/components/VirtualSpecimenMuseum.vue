<!-- 虚拟标本馆 科技馆展示-->
<template>
  <div class="wrap virtual-specimen-museum">
    <div class="wrap-header">
      <div class="title-content">
        <img
          class="title-logo"
          :src="$fun.getImg('title-icon.svg')"
          alt=""
        />
        <div class="title">科技馆展示</div>
      </div>
    </div>
    <div class="line"></div>
    <div
      class="wrap-con"
      @click="toPano()"
    >
      <img
        src="https://qlf.ahhsgef.com/assets/003-5302df6a.jpg"
        style="width: 100%; height: 100%"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
const { proxy } = getCurrentInstance() as any
import { useRouter } from "vue-router"
const router = useRouter()
const toPano = () => {
  proxy.$mitt.emit("openSpecimenMuseum")
}
</script>
<style lang="scss" scoped>
.virtual-specimen-museum {
  width: 100%;
  height: 100%;
  display: block;
}

:deep(.el-carousel--horizontal) {
  height: 100% !important;
}

:deep(.el-carousel__container) {
  height: 100% !important;

  .el-carousel__item {
    display: flex !important;
  }

  img {
    width: calc(100% - 48px);
    height: 100%;
    margin: auto;
    padding: 0 4px;
  }
}

:deep(.el-carousel__arrow--left) {
  left: 0px;
  width: 24px;
  height: 24px;
  background: url("/images/ScienceEducation/arrow1.png") no-repeat;
  background-size: 100% 100%;

  .el-icon {
    display: none;
  }
}

:deep(.el-carousel__arrow--right) {
  // right: 0px;
  width: 24px;
  height: 24px;
  background: url("/images/ScienceEducation/arrow.png") no-repeat;
  background-size: 100% 100%;
  .el-icon {
    display: none;
  }
}
:deep(.el-carousel__container) {
  .el-carousel__item {
    cursor: pointer;
  }
}
</style>
