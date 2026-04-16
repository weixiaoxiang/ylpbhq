/**
 * 3D地图工具栏
 * author: 魏晓翔
 */
export default function useMapTool() {
  const { showCSB } = storeToRefs(useConfigStore())
  let measureTool: any = null
  // 测量
  const measureDraw = (type: string) => {
    if (!measureTool) {
    }
    if (type === "测距") {
    }
    if (type === "测面") {
    }
  }
  // 清除测量
  const removeMeasure = () => {
    if (measureTool) {
    }
  }
  // 监听document全屏，改变除map.getTargetElement()以外的元素的显示状态
  const changeElementDisplay = () => {
    const element = window.viewer.scene.canvas
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
    const element = window.viewer.scene.canvas
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      element?.requestFullscreen()
    }
  }
  const initCamera = {
    destination: [116.08732077806539, 30.87604217657325, 16068],
    orientation: [0.11105460590878202, -0.7723774476940868, 0.00012528923976695694]
  }
  // 参考cesium-navigation-es6的缩放算法
  const zoom = (direction: number) => {
    const camera = window.viewer?.camera
    if (!camera) return

    // 获取屏幕中心点
    const center = new Cesium.Cartesian2(window.viewer.canvas.clientWidth / 2, window.viewer.canvas.clientHeight / 2)

    // 获取屏幕中心对应的地球表面点
    const pickedPosition = camera.pickEllipsoid(center, window.viewer.scene.globe.ellipsoid)
    if (!pickedPosition) return

    // 获取当前相机位置
    const currentPosition = camera.position

    // 计算从目标点到相机的方向向量
    const directionVector = Cesium.Cartesian3.subtract(currentPosition, pickedPosition, new Cesium.Cartesian3())
    Cesium.Cartesian3.normalize(directionVector, directionVector)

    // 计算缩放距离：基于当前高度动态计算
    const height = camera.positionCartographic?.height || 1000000
    const zoomDistance = (height / 10000) * 8000 * direction

    // 计算新位置
    const newPosition = Cesium.Cartesian3.add(
      currentPosition,
      Cesium.Cartesian3.multiplyByScalar(directionVector, zoomDistance, new Cesium.Cartesian3()),
      new Cesium.Cartesian3()
    )

    // 执行缩放动画，保持当前朝向不变
    camera.flyTo({
      destination: newPosition,
      orientation: {
        heading: camera.heading,
        pitch: camera.pitch,
        roll: camera.roll
      },
      duration: 1.0,
      easingFunction: Cesium.EasingFunction.LINEAR_NONE,
      complete: () => {
        console.log(direction > 0 ? "放大完成" : "缩小完成", "距离:", Math.abs(zoomDistance))
      }
    })
  }
  // 放大
  const zoomIn = () => {
    zoom(-1) // 向目标点靠近
  }
  // 缩小
  const zoomOut = () => {
    zoom(1) // 远离目标点
  }
  // 重置
  const resetView = () => {
    // window.viewer?.camera.flyHome()
    window.viewer?.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(...(initCamera.destination as [number, number, number])),
      orientation: {
        heading: initCamera.orientation[0],
        pitch: initCamera.orientation[1],
        roll: initCamera.orientation[2]
      }
    })
  }

  const baseMapType = ref("影像底图")
  // 切换地图
  const switchMap = (type: string) => {
    baseMapType.value = type
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
