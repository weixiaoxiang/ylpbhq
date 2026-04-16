<!-- 抓拍详情 -->
<template>
    <div class="map-box">
        <div class="map" id="mapdiv"></div>
        <ToolBar class="toolBar" :layerType="layerType" :mapOptions="mapOptions" :getMap="getMap"
            :layerSwitch="layerSwitch" ele="mapdiv"/>
    </div>


</template>
<script lang="ts" setup>
import initMapUtil from "@/utils/map"
import { useMap } from "@/components/Map/map";
const {
    initMap,
    loadPopup,
    layerType,
    mapOptions,
    getMap,
    closePopup,
    layerSwitch,
    popupInfo,
    clearLayer,
    loadPoint,
    viewTo,
    loadPointArr,
    loadLine
} = useMap();
import ToolBar from "@/components/Map/toolBar.vue";

let mapInit: any = null
onMounted(() => {
    let ele = document.getElementById('mapdiv')
    mapInit = new initMapUtil(ele);
    initMap(mapInit); // 创建地图
});

onBeforeUnmount(() => {
    console.log("销毁地图")
    clearLayer();
    mapInit.removeMap()
})
defineExpose({
    loadPointArr, loadPoint,
    loadLine });
</script>
<style scoped lang="scss">
.map-box {
    position: relative;
    width: 100%;
    height:100%;
    .map{
        width: 100%;
        height: 100%;
    }
}
</style>