<script lang="ts" setup>
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

const zoomIn = () => {
  zoom(-1) // 向目标点靠近
}

const zoomOut = () => {
  zoom(1) // 远离目标点
}

const initCamera = {
  destination: [116.08732077806539, 30.87604217657325, 16068],
  orientation: [0.11105460590878202, -0.7723774476940868, 0.00012528923976695694]
}
const resetHome = () => {
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
</script>
<template>
  <div class="zoom-control">
    <div
      class="zoom-control-item"
      @click="zoomIn"
    >
      <i-ep-plus />
    </div>
    <div
      class="zoom-control-item"
      @click="resetHome"
    >
      <i-ep-refresh-right />
    </div>
    <div
      class="zoom-control-item"
      @click="zoomOut"
    >
      <i-ep-minus />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.zoom-control {
  position: absolute;
  right: 20px;
  bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 18px;
  border-radius: 5px;
  z-index: 1000;
  .zoom-control-item {
    display: flex;
    align-items: center;
    padding: 5px;
    color: #fff;
    background-color: rgba(0, 0, 0, 0.7);
    cursor: pointer;
  }
}
</style>
