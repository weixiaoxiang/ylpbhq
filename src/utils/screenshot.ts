import html2canvas from "html2canvas"

/**
 * 截取指定元素并下载
 * @param elementId 要截图的元素ID
 * @param fileName 下载的文件名（可选，默认为 'screenshot'）
 * @param scale 缩放比例（可选，默认为 2，用于提高清晰度）
 */
export const captureAndDownload = async (elementId: string, fileName = "screenshot", scale = 2) => {
  try {
    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error(`未找到ID为 ${elementId} 的元素`)
    }

    // 创建 canvas
    const canvas = await html2canvas(element, {
      scale, // 提高清晰度
      useCORS: true, // 允许跨域图片
      allowTaint: true, // 允许跨域图片
      backgroundColor: null, // 透明背景
      logging: false, // 关闭日志
      imageTimeout: 15000, // 图片加载超时时间
      foreignObjectRendering: false // 使用 canvas 渲染
    })

    // 转换为图片并下载
    const link = document.createElement("a")
    link.download = `${fileName}.png`
    link.href = canvas.toDataURL("image/png", 1.0) // 最高质量
    link.click()

    // 清理
    link.remove()
  } catch (error) {
    console.error("截图失败:", error)
    throw error
  }
}

/**
 * 截取指定元素并返回 base64
 * @param elementId 要截图的元素ID
 * @param scale 缩放比例（可选，默认为 2）
 * @returns Promise<string> base64 图片数据
 */
export const captureToBase64 = async (elementId: string, scale = 2): Promise<string> => {
  try {
    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error(`未找到ID为 ${elementId} 的元素`)
    }

    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
      imageTimeout: 15000,
      foreignObjectRendering: false
    })

    return canvas.toDataURL("image/png", 1.0)
  } catch (error) {
    console.error("截图失败:", error)
    throw error
  }
}
