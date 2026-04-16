/**
 * Cesium 类型声明 - 自动导入版本
 * 直接使用Cesium包自带的类型定义
 */

// 直接引用Cesium的类型定义
/// <reference path="../../node_modules/cesium/Source/Cesium.d.ts" />

// 扩展Cesium.Viewer类，添加自定义属性
declare module "cesium" {
  interface Viewer {
    // 自定义配置属性
    CONFIG?: any
    // 其他自定义属性
    [key: string]: any
  }
}

// 全局声明
declare global {
  // 全局Cesium对象类型
  const Cesium: typeof import("cesium")

  interface Window {
    viewer: import("cesium").Viewer
  }
}

export {}
