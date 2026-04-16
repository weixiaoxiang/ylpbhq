<script setup lang="ts">
import { Search } from "@element-plus/icons-vue"
interface Props {
  map: any
  features: any[]
}
const props = withDefaults(defineProps<Props>(), {
  map: undefined,
  features: undefined
})
const proxy = getCurrentInstance()!.proxy as any
const results = ref<any[]>([])
const displaySearchResults = ref(false) // 是否显示查询结果
const back = () => {
  searchLayer.getSource().clear()
  if (drawTool) {
    drawTool.destroy()
    drawTool = null
  }
  if (vectorLayer) vectorLayer.setVisible(true)
  queryForm.value.type = undefined
  displaySearchResults.value = false
}
const activeTab = ref("属性管理")
const tab = ref([
  {
    name: "属性管理",
    id: 1
  },
  {
    name: "空间查询",
    id: 2
  }
])
const hcqType = ref([
  {
    value: "point",
    label: "标点",
    icon: "ai-point"
  },
  {
    value: "line",
    label: "标线",
    icon: "ai-line"
  },
  {
    value: "polygon",
    label: "标面",
    icon: "ai-polygon"
  },
  // {
  //   value: "circle",
  //   label: "圆",
  //   icon: "ai-polygon"
  // },
  {
    value: "rect",
    label: "矩形",
    icon: "ai-polygon"
  },
  {
    value: "square",
    label: "正方形",
    icon: "ai-polygon"
  },
  {
    value: "triangle",
    label: "三角形",
    icon: "ai-polygon"
  },
  {
    value: "hexagon",
    label: "六边形",
    icon: "ai-polygon"
  },
  {
    value: "star",
    label: "星星",
    icon: "ai-polygon"
  },
  {
    value: "multipoint",
    label: "多点",
    icon: "ai-polygon"
  },
  {
    value: "multilinestring",
    label: "多线",
    icon: "ai-polygon"
  },
  {
    value: "multipolygon",
    label: "多面",
    icon: "ai-polygon"
  }
])
const kjType = ref([
  {
    value: "polygon",
    label: "画面",
    icon: "ai-polygon"
  },
  {
    value: "circle",
    label: "画圆",
    icon: "ai-polygon"
  },
  {
    value: "rect",
    label: "矩形",
    icon: "ai-polygon"
  },
  {
    value: "square",
    label: "正方形",
    icon: "ai-polygon"
  },
  {
    value: "triangle",
    label: "三角形",
    icon: "ai-polygon"
  },
  {
    value: "hexagon",
    label: "六边形",
    icon: "ai-polygon"
  },
  {
    value: "star",
    label: "星星",
    icon: "ai-polygon"
  },
  {
    value: "multipoint",
    label: "多点",
    icon: "ai-polygon"
  },
  {
    value: "multilinestring",
    label: "多线",
    icon: "ai-polygon"
  },
  {
    value: "multipolygon",
    label: "多面",
    icon: "ai-polygon"
  }
])
const queryForm = ref({
  keyWord: "",
  range: 1,
  type: undefined
})
const search = () => {
  searchLayer.getSource().clear()
  displaySearchResults.value = true
  const filters = props.features.filter((item: any) => {
    return item.get("name")?.toLowerCase().indexOf(queryForm.value.keyWord.toLowerCase()) > -1
  })
  if (filters.length > 0) {
    // 隐藏矢量图层
    if (vectorLayer) vectorLayer.setVisible(false)
    // 添加搜索结果
    searchLayer.getSource().addFeatures(filters)
    results.value = filters.map((item: any) => {
      return {
        value: item.get("name"),
        id: item.get("id"),
        treeid: item.get("treeid"),
        lon: item.get("lon"),
        lat: item.get("lat"),
        tabchname: item.get("tabchname"),
        featureType: item.get("featureType")
      }
    })
  } else {
    results.value = []
  }
}

// 点击搜索结果
const handleClick = (item: any) => {
  // console.log(item)
  const { lon, lat } = item
  props.map.getView().animate({
    center: [lon, lat],
    duration: 1000,
    zoom: 20
  })
}
//切换tab
const clickTab = (item: any) => {
  if (drawTool) {
    drawTool.destroy()
    drawTool = null
  }
  activeTab.value = item.name
}
// 存储绘制工具实例
let drawTool: any = null
// 空间查询和缓冲区查询
const geomQuery = (feature: any) => {
  // 清空搜索结果，显示搜索结果
  results.value = []
  searchLayer.getSource().clear() // 清空搜索图层
  displaySearchResults.value = true
  // 隐藏矢量图层
  if (vectorLayer) vectorLayer.setVisible(false)
  // return
  props.features.forEach((item: any) => {
    const intersectsData: any = intersects(feature.getGeometry(), item.getGeometry())
    // 如果相交，则添加到结果中
    if (intersectsData.intersects) {
      // 添加搜索结果
      searchLayer.getSource().addFeature(item)
      results.value.push({
        value: item.get("name"),
        id: item.get("id"),
        treeid: item.get("treeid"),
        lon: item.get("lon"),
        lat: item.get("lat"),
        tabchname: item.get("tabchname"),
        featureType: item.get("featureType")
      })
    }
  })
}
//切换类型
const changeType = ({ value }: any) => {
  if (queryForm.value.type === value) {
    queryForm.value.type = undefined
    if (drawTool) {
      drawTool.destroy()
      drawTool = null
    }
    return
  }
  queryForm.value.type = value
  if (!drawTool) {
    // 创建绘制工具实例
    drawTool = new DrawOLShape(toRaw(props.map), {
      title: "绘制图层",
      zIndex: 2,
      style: {
        pointIcon: proxy.$fun.getImg("researchManagement/kkmap-icon.png"),
        iconScale: 1,
        strokeColor: "#e67e22",
        strokeWidth: 2,
        lineDash: [10, 10],
        fillColor: "rgba(26, 188, 156,0.3)"
      },
      clearable: true,
      single: true // 只允许单次绘制
    })
  }
  if (value === "point") {
    drawTool.drawPoint({
      buffer: activeTab.value === "属性管理" ? queryForm.value.range * 1000 : false, // 缓冲区距离（米）
      end: geomQuery
    })
  }
  if (value === "circle") {
    drawTool.drawCircle({
      buffer: activeTab.value === "属性管理" ? queryForm.value.range * 1000 : false, // 缓冲区距离（米）
      end: geomQuery
    })
  }
  if (value === "line") {
    drawTool.drawLine({
      buffer: activeTab.value === "属性管理" ? queryForm.value.range * 1000 : false, // 缓冲区距离（米）
      end: geomQuery
    })
  }
  if (value === "polygon") {
    drawTool.drawPolygon({
      buffer: activeTab.value === "属性管理" ? queryForm.value.range * 1000 : false, // 缓冲区距离（米）
      end: geomQuery
    })
  }
  if (value === "rect") {
    drawTool.drawRect({
      buffer: activeTab.value === "属性管理" ? queryForm.value.range * 1000 : false, // 缓冲区距离（米）
      end: geomQuery
    })
  }
  // 正方形
  if (value === "square") {
    drawTool.drawSquare({
      buffer: activeTab.value === "属性管理" ? queryForm.value.range * 1000 : false, // 缓冲区距离（米）
      end: geomQuery
    })
  }
  // 三角形
  if (value === "triangle") {
    drawTool.drawTriangle({
      buffer: activeTab.value === "属性管理" ? queryForm.value.range * 1000 : false, // 缓冲区距离（米）
      end: geomQuery
    })
  }
  // 六边形
  if (value === "hexagon") {
    drawTool.drawHexagon({
      buffer: activeTab.value === "属性管理" ? queryForm.value.range * 1000 : false, // 缓冲区距离（米）
      end: geomQuery
    })
  }
  // 五角星
  if (value === "star") {
    drawTool.drawStar({
      buffer: activeTab.value === "属性管理" ? queryForm.value.range * 1000 : false, // 缓冲区距离（米）
      end: geomQuery
    })
  }
  // 多点
  if (value === "multipoint") {
    drawTool.drawMultiPoint({
      buffer: activeTab.value === "属性管理" ? queryForm.value.range * 1000 : false, // 缓冲区距离（米）
      end: geomQuery
    })
  }
  // 多线
  if (value === "multilinestring") {
    drawTool.drawMultiLineString({
      buffer: activeTab.value === "属性管理" ? queryForm.value.range * 1000 : false, // 缓冲区距离（米）
      end: geomQuery
    })
  }
  // 多面
  if (value === "multipolygon") {
    drawTool.drawMultiPolygon({
      buffer: activeTab.value === "属性管理" ? queryForm.value.range * 1000 : false, // 缓冲区距离（米）
      end: geomQuery
    })
  }
}
let vectorLayer: any = null // 矢量图层
let searchLayer: any = null // 搜索图层
onMounted(() => {
  // 获取矢量图层,查询时隐藏，返回时显示
  props.map.getLayers().forEach((item: any) => {
    if (item.get("title") === "矢量图层") vectorLayer = item
  })
  // 创建搜索图层，查询时显示，返回时隐藏
  searchLayer = new VectorLayer({
    zIndex: 4,
    declutter: true,
    source: new VectorSource()
  })
  props.map.addLayer(searchLayer)
})
onBeforeUnmount(() => {
  // 删除搜索图层
  if (searchLayer) {
    searchLayer.getSource().clear()
    props.map.removeLayer(searchLayer)
  }
})
</script>
<template>
  <div class="right2 wrapair">
    <div class="wrap-header">
      <div class="title-content">
        <img
          class="title-logo"
          :src="$fun.getImg('title-icon.svg')"
          alt=""
        />
        <div class="title">信息管理</div>
      </div>
    </div>
    <div class="line"></div>
    <div
      v-show="!displaySearchResults"
      class="wrap-con"
    >
      <div class="tabs">
        <div
          class="tab"
          :class="{ active: activeTab == item.name }"
          v-for="(item, index) in tab"
          @click="clickTab(item)"
        >
          <span> {{ item.name }}</span>
        </div>
      </div>
      <div
        v-if="activeTab == '属性管理'"
        class="form-item"
      >
        <div class="label">关键字查询</div>
        <div class="value">
          <el-input
            v-model="queryForm.keyWord"
            style="width: 100%"
            placeholder="请输入查询信息"
            @keyup.enter="search"
          >
            <template #append>
              <el-button
                :icon="Search"
                @click="search"
              />
            </template>
          </el-input>
        </div>
      </div>
      <div
        v-if="activeTab == '属性管理'"
        class="form-item"
      >
        <div class="label">缓冲区查询</div>
        <div class="value">
          <el-input-number
            v-model="queryForm.range"
            :min="1"
            :max="10"
            style="width: 85%"
            controls-position="right"
          />
          <span style="padding-left: 10px">千米</span>
        </div>
      </div>
      <div
        v-if="activeTab == '属性管理'"
        class="hcq-type-box"
      >
        <el-scrollbar
          style="width: 100%"
          height="100%"
        >
          <div
            class="hcq-type-box-item"
            v-for="(item, index) in hcqType"
            :key="index"
            :class="{ active: item.value == queryForm.type }"
            @click="changeType(item)"
          >
            <div class="text">{{ item.label }}</div>
            <div class="icon-box">
              <SvgIcon :name="item.icon" />
            </div>
          </div>
        </el-scrollbar>
      </div>
      <div
        v-if="activeTab == '空间查询'"
        class="hcq-type-box"
      >
        <el-scrollbar
          style="width: 100%"
          height="100%"
        >
          <div
            class="hcq-type-box-item"
            v-for="(item, index) in kjType"
            :key="index"
            :class="{ active: item.value == queryForm.type }"
            @click="changeType(item)"
          >
            <div class="text">{{ item.label }}</div>
            <div class="icon-box">
              <SvgIcon :name="item.icon" />
            </div>
          </div>
        </el-scrollbar>
      </div>
    </div>
    <transition
      enter-active-class="animate__animated animate__fadeIn"
      leave-active-class="animate__animated animate__fadeOut"
      :appear="false"
      appear-active-class="animate__animated animate__fadeIn"
    >
      <div
        v-if="displaySearchResults"
        class="search-results"
      >
        <div class="search-results-header">
          <el-page-header @back="back">
            <template #content>
              <span
                >搜索结果: <b style="color: #e67e22">{{ results.length }}</b
                >条</span
              >
            </template>
          </el-page-header>
          <el-divider style="margin: 10px 0" />
        </div>
        <div class="search-results-content">
          <el-scrollbar height="100%">
            <div
              class="search-results-item"
              v-for="(item, index) in results"
              :key="index"
              @click="handleClick(item)"
            >
              <div>
                <span style="color: #1abc9c">{{ item.tabchname }}</span> - {{ item.value }}
              </div>
              <div class="search-results-item-info">经度:{{ item.lon }} 纬度:{{ item.lat }}</div>
            </div>
          </el-scrollbar>
        </div>
      </div>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
.right2 {
  height: vh(420);
  margin-top: vh(15);
  overflow: hidden;
}
.wrapair {
  pointer-events: all;
  color: #ffffff;
  position: relative;
  background: url("/images/cb-bg.png") no-repeat center center/100% 100%;
  box-sizing: border-box;
  border: 1.2px solid;
  border-image: linear-gradient(180deg, rgba(193, 242, 224, 0.15) 3%, rgba(255, 255, 255, 0.35) 115%);
  backdrop-filter: blur(50px);
  .wrap-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 41px;
    padding: 0 2px 0 12px;
    background: url("@/assets/images/title-bg.png") no-repeat center center / 100% 100%;
    .title-content {
      display: flex;
    }

    .title-logo {
      height: 50px;
      width: 50px;
      margin-left: -20px;
    }
    .title {
      display: flex;
      align-items: center;
      font-size: 16px;
    }

    .title-con {
      margin-right: vw(20);
    }
  }
  .line {
    margin-top: -2px;
    height: 5px;
    background: url("@/assets/images/title-line.png") no-repeat center center / cover;
  }
  .linebottom {
    margin-top: -2px;
    height: 5px;
    background: url("@/assets/images/title-line2.png") no-repeat center center / cover;
  }

  .wrap-con {
    display: flex;
    height: calc(100% - 41px);
    overflow: hidden;
    padding: vw(10);
    position: relative;
  }
  :deep(.search-results) {
    overflow: hidden;
    padding: vw(10);
    position: absolute;
    top: 41px;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;

    .search-results-header {
      margin-bottom: 10px;
      .el-page-header__content {
        color: #fff;
        font-size: 14px;
      }
    }
    .search-results-content {
      flex: 1;
      overflow: hidden;
      .search-results-item {
        display: flex;
        flex-direction: column;
        gap: 5px;
        font-size: 12px;
        // margin-bottom: 5px;
        padding: 6px;
        cursor: pointer;
        .search-results-item-info {
          color: #fff;
          font-size: 12px;
          margin-left: 60px;
        }
        &:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      }
    }
  }
}
.wrap-con {
  padding: 20px;
  flex-direction: column;
  .tabs {
    display: flex;
    align-items: center;
    width: 257px;
    height: 30.76px;
    border: 1px solid rgba(40, 118, 171, 0.5);
    margin: 0 auto;
    margin-top: 8px;
    margin-bottom: 20px;
    .tab {
      flex: 1;
      text-align: center;
      line-height: 30.76px;
      font-family: FZLTHJW;
      font-size: 14px;
      font-weight: normal;
      color: #ffffff;
      cursor: pointer;
      &:nth-child(2) {
        &.active {
          transform: rotate(180deg);
          span {
            display: inline-block;
            transform: rotate(180deg);
          }
        }
      }
    }
    .active {
      background: url("@/assets/images/aiRemoteSensing/tab-active-bg.png") no-repeat;
      background-size: 100% 100%;
    }
  }
  .form-item {
    margin-bottom: 20px;
    .label {
      font-size: 16px;
      font-weight: normal;
      line-height: 24px;
      text-align: justify;
      color: #ffffff;
      margin-bottom: 8px;
    }
    :deep(.value) {
      .el-input-number__decrease,
      .el-input-number__increase {
        background: #2e65a3;
        color: #fff;
        outline: none;
        border: none;
        border-radius: 0;
      }
      .el-input {
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
        .el-input-group__append {
          background-color: #2e65a3 !important;
          color: inherit;
          box-shadow: none;
          border-top-right-radius: 0px;
          border-bottom-right-radius: 0px;
        }
      }
    }
  }
  .hcq-type-box {
    flex: 1;
    overflow: hidden;
    .hcq-type-box-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 10px;
      // flex: 1;
      width: 30%;
      height: 64.5px;
      background: url("@/assets/images/aiRemoteSensing/hcq-bg.png") no-repeat;
      background-size: 100% 100%;
      opacity: 0.6;
      cursor: pointer;
      .text {
        font-size: 14px;
        font-weight: normal;
        line-height: 14px;
        text-align: justify;
        color: #31ced8;
        margin-bottom: 10px;
      }
      .icon-box {
        font-size: 22px;
      }
      &.active,
      &:hover {
        opacity: 1;
        background: url("@/assets/images/aiRemoteSensing/hcq-active-bg.png") no-repeat;
        background-size: 100% 100%;
      }
    }
  }
  :deep(.el-scrollbar) {
    .el-scrollbar__view {
      display: flex;
      justify-content: flex-start;
      flex-wrap: wrap;
      gap: 10px;
    }
  }
}
</style>
