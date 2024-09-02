declare type Recordable<T = any> = Record<string, T>

import { ComponentCustomProperties } from "vue"

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $fun: proxy // 这里填类型
    Cesium: any
  }
}
// 必须导出，才能在其他文件中使用
export default ComponentCustomProperties
