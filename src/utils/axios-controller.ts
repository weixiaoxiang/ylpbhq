// 导入axios的Canceler类型
import type { Canceler } from "axios"

// 定义待处理请求的接口类型
interface PendingType {
  url: string // 请求URL
  cancel: Canceler // 取消请求的函数
}

/**
 * Axios控制器类 - 用于管理和取消HTTP请求
 * 使用单例模式确保全局只有一个实例
 */
class AxiosController {
  // 单例实例
  private static instance: AxiosController
  // 存储待处理的请求数组
  private pending: PendingType[] = []

  // 私有构造函数,防止外部直接实例化
  private constructor() {}

  /**
   * 获取AxiosController的单例实例
   * @returns AxiosController实例
   */
  public static getInstance(): AxiosController {
    if (!AxiosController.instance) {
      AxiosController.instance = new AxiosController()
    }
    return AxiosController.instance
  }

  /**
   * 添加待处理的请求
   * @param url 请求URL
   * @param cancel 取消请求的函数
   */
  addPending(url: string, cancel: Canceler) {
    this.pending.push({
      url,
      cancel
    })
  }

  /**
   * 移除指定URL的待处理请求
   * @param url 要移除的请求URL
   */
  removePending(url: string) {
    const index = this.pending.findIndex((p) => p.url === url)
    if (index > -1) {
      this.pending.splice(index, 1)
    }
  }

  /**
   * 取消并移除所有待处理的请求
   * 通常在路由切换时调用
   */
  removeAllPending() {
    this.pending.forEach((p) => {
      p.cancel("页面路由切换，取消未响应的请求")
    })
    this.pending = []
  }
}

// 导出AxiosController的单例实例
export default AxiosController.getInstance()
