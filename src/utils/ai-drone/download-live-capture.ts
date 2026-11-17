/** 直播原始帧下载：文件名安全化与浏览器触发保存 */

const INVALID_FILE_CHAR_RE = /[\\/:*?"<>|]/g

export function sanitizeCaptureFileBase(raw: string): string {
  const cleaned = raw.replace(INVALID_FILE_CHAR_RE, "_").trim()
  return cleaned || "uav"
}

/** 抓拍文件名时间后缀：yyyyMMdd_HHmmss */
export function formatCaptureTimestamp(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}_${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
}

export function buildLiveCaptureFileName(deviceLabel: string, deviceSn: string): string {
  const base = sanitizeCaptureFileBase(deviceLabel || deviceSn)
  return `${base}_${formatCaptureTimestamp()}.jpg`
}

/** 在点击事件内调用，触发浏览器下载 */
export function downloadBlobAsFile(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  link.rel = "noopener"
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

/** 无原始 JPEG 时，从当前 canvas 导出（与屏幕所见一致） */
export function canvasToJpegBlob(canvas: HTMLCanvasElement, quality = 0.92): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", quality)
  })
}