<template>
  <div class="communityBuilding-page">
    <div
      class="map"
      id="mapCommunity"
    >
      <Popup
        ref="popupRef"
        :popupInfo="popupInfo"
        @closemapPop="handlemappopClose"
      />
    </div>

    <div class="left">
      <Left1 />
    </div>
    <rightpopup
      v-show="popup"
      :popupInfo2="popupInfo2"
      @closemapPop="handlemappopClose2"
    ></rightpopup>
    <div class="right">
      <Right1
        ref="listRef"
        @handclickitem="handclickitem"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import Left1 from "./component/left1.vue"
import { useMap } from "./component/map"
import Popup from "./component/popup.vue"
import Right1 from "./component/right1.vue"
import rightpopup from "./component/rightpopup.vue"
const popup = ref(false)
const popupInfo2 = ref()
const listRef = useTemplateRef("listRef")
const { initMap, loadPopup, closePopup, popupInfo } = useMap()

const popupRef = ref()
const handlemappopClose = () => {
  closePopup()
}
const handlemappopClose2 = () => {
  popup.value = false
  listRef.value?.getData()
}

const handclickitem = (item: any) => {
  popup.value = true
  popupInfo2.value = item
}
onMounted(() => {
  let ele = document.getElementById("mapCommunity")
  initMap(ele)
  loadPopup(popupRef.value.$el)
})
</script>

<style lang="scss" scoped>
.communityBuilding-page {
  display: flex;
  justify-content: space-between;
  position: relative;
  width: 100%;
  height: 100%;
  padding: 0 20px;
  overflow: hidden;

  .map {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0px;
    top: 0px;

    .popup {
      position: absolute;
      left: 550px;
      top: 80px;
      z-index: 999;
    }
    :deep(.ol-overlaycontainer-stopevent) {
      z-index: 9999 !important;
    }

    :deep(.ol-rotate-reset) {
      display: none;
    }
    :deep(.ol-zoom-in) {
      display: none;
    }
    :deep(.ol-zoom-out) {
      display: none;
    }
  }
  .left {
    margin-top: vh(20);
    bottom: vh(20);
    z-index: 9;
    width: vw(420);
  }
  .right {
    margin-top: vh(20);
    bottom: vh(20);
    z-index: 9;
    width: vw(420);
  }
  .center {
    position: relative;
    width: vw(962);
    margin-top: vh(665);
  }
}
</style>
<style lang="scss"></style>
