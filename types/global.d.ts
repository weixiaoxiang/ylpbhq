declare type Recordable<T = any> = Record<string, T>

import { ComponentCustomProperties } from "vue"
declare global {
  interface Window {
    // 记录地图工具栏距右侧初始距离
    orginMaptoolSidebarRight: string
    // 记录地图工具栏距底部初始距离
    orginMaptoolSidebarBottom: string
  }
}
declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $fun: proxy // 这里填类型
    Cesium: any
  }
}
// 必须导出，才能在其他文件中使用
export default ComponentCustomProperties
