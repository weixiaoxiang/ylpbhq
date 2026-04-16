<template>
  <div class="tool-section" :style="{ right: right + 'px' }">
    <div
      class="tool-item"
      v-for="(item, index) in toolOption"
      :key="index"
      @click="handleClick(item.value)"
    >
      <el-tooltip
        v-if="item.name != '图层'"
        class="box-item"
        effect="light"
        :content="item.name"
        placement="left"
      >
        <img :src="item.icon" />
      </el-tooltip>
      <img class="layer-tool" v-else :src="item.icon" />
      <div class="layer-box"  v-if="item.name == '图层'" v-show="showLayer">
        <div
          class="layer-item"
          :class="{ active: layerType == '矢量' }"
          @click="layerSwitch('矢量')"
        >
          <img src="@/assets/map/mapTool/sl.png" />
          <span>矢量</span>
        </div>
        <div
          class="layer-item"
          :class="{ active: layerType == '影像' }"
          @click="layerSwitch('影像')"
        >
          <img src="@/assets/map/mapTool/yx.png" />
          <span>影像</span>
        </div>
        <div
          class="layer-item"
          :class="{ active: layerType == '地形' }"
          @click="layerSwitch('地形')"
        >
          <img src="@/assets/map/mapTool/dx.png" />
          <span>地形</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import mapTool from "@/utils/mapTool";
import { getAssetsImages } from "@/hooks/useAssetsImages";
const props = defineProps({
  getMap: {
    type: Function as any,
    default: () => {
      return {};
    },
  },
  mapOptions: {
    type: Object as any,
    default: () => {
      return {};
    },
  },
  layerType: {
    type: String,
    default: "影像",
  },
  layerSwitch: {
    type: Function as any,
    default: () => {
      return {};
    },
  },
  ele: {
    type: String,
    default: "map",
  },
});
//距离右边距离
const right = ref(20);

const showLayer = ref(false);
const isFullscreen = ref(false);
const toolOption = ref<any>([
  {
    name: "测距",
    value: "测距",
    icon: getAssetsImages("map/mapTool/icon-line.png"),
  },
  {
    name: "测面",
    value: "测面",
    icon: getAssetsImages("map/mapTool/icon-polygon.png"),
  },
  {
    name: "放大",
    value: "放大",
    icon: getAssetsImages("map/mapTool/icon-zoomIn.png"),
  },
  {
    name: "缩小",
    value: "缩小",
    icon: getAssetsImages("map/mapTool/icon-zoomOut.png"),
  },
  {
    name: "复位",
    value: "复位",
    icon: getAssetsImages("map/mapTool/icon-fw.png"),
  },
  {
    name: "全屏",
    value: "全屏",
    icon: getAssetsImages("map/mapTool/icon-fullscreen.png"),
  },
  {
    name: "图层",
    value: "图层",
    icon: getAssetsImages("map/mapTool/icon-layer.png"),
  },
  // {
  //   name: '清除',
  //   value: '清除',
  //   icon: 'svg-icon-清除'
  // },
  {
    name: '下载',
    value: '导出',
    icon: getAssetsImages("map/mapTool/icon-download.png"),
  }
]);
let tool = ref<any>(null);
let map: any = null; // 地图实例
//切换工具
const handleClick = (type) => {
  if (type == "全屏") {
    let element: any = document.getElementById(props.ele);
    if (!element) {
      return;
    }
    isFullscreen.value = !isFullscreen.value;
    if (isFullscreen.value) {
      if (element?.requestFullscreen) {
        element?.requestFullscreen();
      } else if (element?.webkitRequestFullscreen) {
        element?.webkitRequestFullscreen();
      } else if (element?.mozRequestFullScreen) {
        element?.mozRequestFullScreen();
      } else if (element?.msRequestFullscreen) {
        element?.msRequestFullscreen();
      }
      return;
    }
    // 退出全屏
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.hasOwnProperty("mozCancelFullScreen")) {
      (document as any).mozCancelFullScreen();
    } else if (document.hasOwnProperty("webkitCancelFullScreen")) {
      (document as any).webkitCancelFullScreen();
    } else if (document.hasOwnProperty("msExitFullscreen")) {
      (document as any).msExitFullscreen();
    }
  } else if (type == "导出") {
    exportImg();
  } else if (type == "图层") {
    showLayer.value = !showLayer.value;
  } else {
    if (!map) {
      map = props.getMap();
      console.log("获取地图", map);
      tool = new mapTool(map, props.mapOptions);
    }
    toolClick(type);
  }
};
const toolClick = (type: any) => {
  nextTick(() => {
    switch (type) {
      case "放大":
        tool.zoomIn();
        break;
      case "缩小":
        tool.zoomOut();
        break;
      case "复位":
        tool.resetView();
        break;
      case "测距":
        tool.addMesure("LineString");
        break;
      case "测面":
        tool.addMesure("Polygon");
        break;
      case "清除":
        tool.clearMap();
        break;
    }
  });
};
//导出图片
function exportImg() {
  if (!map) {
    map = props.getMap();
  }
  nextTick(() => {
    // console.log(map);
    map.once("rendercomplete", () => {
      const mapCanvas: any = document.createElement("canvas");
      const size = map.getSize();
      mapCanvas.width = size[0];
      mapCanvas.height = size[1];
      const mapContext = mapCanvas.getContext("2d");
      Array.prototype.forEach.call(
        document.querySelectorAll(".ol-layer canvas"),
        function (canvas) {
          if (canvas.width > 0) {
            const opacity = canvas.parentNode.style.opacity;
            mapContext.globalAlpha = opacity === "" ? 1 : Number(opacity);
            const transform = canvas.style.transform;
            // Get the transform parameters from the style's transform matrix
            const matrix = transform
              // eslint-disable-next-line
              .match(/^matrix\(([^\(]*)\)$/)[1]
              .split(",")
              .map(Number);
            // Apply the transform to the export map context
            CanvasRenderingContext2D.prototype.setTransform.apply(
              mapContext,
              matrix
            );
            mapContext.drawImage(canvas, 0, 0);
          }
        }
      );
      // @ts-ignore
      if (navigator.msSaveBlob) {
        // link download attribuute does not work on MS browsers
        // @ts-ignore
        navigator.msSaveBlob(mapCanvas.msToBlob(), "map.png");
      } else {
        let a: any = document.createElement("a");
        let url = mapCanvas.toDataURL();
        a.href = url;
        a.download = "map.png"; // 下载名称
        a.click();
        window.URL.revokeObjectURL(url);
      }
    });
    map.renderSync();
  });
}
const { proxy } = getCurrentInstance() as any;
onMounted(() => {
  document.addEventListener("fullscreenchange", function (event) {
    if (!document.fullscreenElement) {
      isFullscreen.value = false;
    }
  });
  proxy.$mitt.on("mapTool", (val) => {
    if (val == "on") {
      setTimeout(() => {
        let dialogWidth: any =
          document.querySelector(".right-dialog")?.clientWidth;
        right.value = dialogWidth + 40;
      }, 500);
    } else {
      right.value = 20;
    }
  });
});
</script>
<style scoped lang="scss">
.tool-section {
  position: absolute;
  bottom: vh(10);
  right: 20px;
  padding: 16px;
  padding-top: 30px;
  font-size: 14px;
  color: #fff;
  background: url("@/assets/map/mapTool/tool-bg.png") no-repeat;
  background-size: 100% 100%;
  transition: all 1s ease 0s;
  pointer-events: all;

  .tool-item {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    margin-bottom: 10px;
    background: url("@/assets/map/mapTool/tool-item-bg.png") no-repeat;
    background-size: 100% 100%;
    cursor: pointer;
    &:last-child {
      margin-bottom: 0;
    }
    img {
      width: 30px;
      height: 30px;
    }
    &:nth-child(1),
    &:nth-child(2) {
      img {
        width: 28px;
        height: 28px;
      }
    }
    &:nth-child(5),
    &:nth-child(6),
    &:nth-child(7) {
      img {
        width: 24px;
        height: 24px;
      }
    }
         &:nth-child(8) {
           img {
             width: 22px;
             height: 22px;
           }
         }
  }
}
.layer-tool:hover {
  + .layer-box {
    display: flex;
  }
}
.layer-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: absolute;
  right: 80px;
  bottom: -50%;
  height: 86px;
  padding: 10px;
  background: #0d3934;
  transition: all 1s ease 0s;
  z-index: 9999;
  &::after {
    content: "";
    position: absolute;
    right: -20px;
    bottom: 20px;
    width: 0;
    height: 0;
    border-top: 10px solid transparent;
    border-right: 10px solid transparent;
    border-left: 10px solid #0d3934;
    border-bottom: 10px solid transparent;
  }
  .layer-item {
    position: relative;
    width: 66px;
    height: 66px;
    border: 2px solid #d8d8d8;
    background: #ffffff;
    img {
      width: 100% !important;
      height: 100% !important;
    }
    span {
      display: block;
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      bottom: 7px;
      width: 28px;
      height: 16px;
      line-height: 16px;
      text-align: center;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(4px);
      font-size: 12px;
      color: #fff;
    }
    &:nth-child(2) {
      margin: 0 10px;
    }
    &:hover,
    &.active {
      border: 2px solid #1befd7;
      span {
        background: #1befd7;
        backdrop-filter: none;
        color: #222222;
      }
    }
  }
}
</style>
