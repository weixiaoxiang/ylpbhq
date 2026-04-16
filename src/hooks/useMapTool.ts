/**
 * 地图工具栏
 * author: 魏晓翔
 */
import { Map } from "ol"
interface CustomMap extends Map {
  CONFIG: {
    center: [number, number]
    zoom: number
    [key: string]: any
  }
}
export default function useMapTool(map: CustomMap) {
  const { showCSB } = storeToRefs(useConfigStore())
  let measureTool: any = null
  // 测量
  const measureDraw = (type: string) => {
    if (!measureTool) {
      measureTool = new MeasureTool({
        map: map
      })
    }
    if (type === "测距") {
      measureTool.changeType("LineString")
    }
    if (type === "测面") {
      measureTool.changeType("Polygon")
    }
  }
  // 清除测量
  const removeMeasure = () => {
    if (measureTool) {
      measureTool.removeInteraction()
      measureTool = null
    }
  }
  // 监听document全屏，改变除map.getTargetElement()以外的元素的显示状态
  const changeElementDisplay = () => {
    const element = map.getTargetElement()
    // 判断是否全屏
    if (document.fullscreenElement) {
      // 遍历子元素
      Array.from(element?.children || []).forEach((item: any) => {
        if (!item.classList.contains("ol-viewport")) {
          item.style.display = "none"
        }
      })
    } else {
      // 遍历子元素
      Array.from(element?.children || []).forEach((item: any) => {
        if (!item.classList.contains("ol-viewport")) {
          item.style.display = "flex"
        }
      })
    }
  }
  document.addEventListener("fullscreenchange", changeElementDisplay)
  // 全屏
  const fullScreen = () => {
    const element = map.getTargetElement()
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      element?.requestFullscreen()
    }
    nextTick(() => {
      map.updateSize()
    })
  }
  const originCenter = map.CONFIG.center
  const orginZoom = map.CONFIG.zoom
  const zoomIn = () => {
    const view = map.getView()
    const zoom = view.getZoom()!
    view.animate({
      zoom: zoom + 1,
      duration: 250
    })
  }
  const zoomOut = () => {
    const view = map.getView()
    const zoom = view.getZoom()!
    view.animate({
      zoom: zoom - 1,
      duration: 250
    })
  }
  const resetView = () => {
    const view = map.getView()
    view.animate({
      center: originCenter,
      zoom: orginZoom,
      duration: 250
    })
  }

  const baseMapType = ref("影像底图")
  // 切换地图
  const switchMap = (type: string) => {
    baseMapType.value = type
    map.CONFIG.baseMapType = type
    // 手动派发 moveend 事件
    map.dispatchEvent("moveend")
  }

  const { setVariable, getVariable } = useCssVariables()
  window.orginMaptoolSidebarRight = getVariable("maptool-sidebar-right") // 记录地图工具栏距右侧初始距离
  window.orginMaptoolSidebarBottom = getVariable("maptool-sidebar-bottom") // 记录地图工具栏距底部初始距离
  // 通过修改--maptool-sidebar-的值来实现页面侧边栏的显示隐藏切换，并同步修改maptool的样式
  const toggleContainerSidebar = (right?: string, bottom?: string) => {
    // right\bottom 为空时，使用默认值
    right = right || "20px"
    bottom = bottom || "20px"
    showCSB.value = !showCSB.value // 切换侧边栏的显示状态
    // 修改css变量,同步maptool的样式
    setVariable("maptool-sidebar-right", showCSB.value ? window.orginMaptoolSidebarRight : right)
    setVariable("maptool-sidebar-bottom", showCSB.value ? window.orginMaptoolSidebarBottom : bottom)
  }
  onBeforeUnmount(() => {
    // 清除测量
    if (measureTool) {
      measureTool.removeInteraction()
      measureTool = null
    }
    document.removeEventListener("fullscreenchange", changeElementDisplay)
  })
  return {
    /**
     * 测量
     */
    measureDraw,
    /**
     * 清除测量
     */
    removeMeasure,
    /**
     * 全屏
     */
    fullScreen,
    /**
     * 放大
     */
    zoomIn,
    /**
     * 重置
     */
    resetView,
    /**
     * 缩小
     */
    zoomOut,
    /**
     * 地图类型
     */
    baseMapType,
    /**
     * 切换地图
     */
    switchMap,
    /**
     * 切换页面侧边栏的显示状态
     */
    toggleContainerSidebar
  }
}
