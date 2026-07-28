/** 红外相机视频静态资源前缀 */
export const INFRARED_VIDEO_STATIC_PREFIX = "/redCareamStaticUrl/"

/** 视频源选项，与 VideoPlayer 组件 sources 字段结构一致 */
export interface InfraredVideoSourceOption {
  label: string
  src: string
}

/** 红外相机抓拍记录中可用于播放的字段 */
export interface InfraredCaptureVideoFields {
  resultfile?: string
  fileurl?: string
}

/**
 * 根据抓拍记录构建视频源列表
 * - resultfile：AI 识别视频
 * - fileurl：原始视频
 * 仅返回有值的源，供 VideoPlayer 多源切换使用
 */
export function buildInfraredCaptureVideoSources(
  item?: InfraredCaptureVideoFields | null
): InfraredVideoSourceOption[] {
  if (!item) return []

  const sources: InfraredVideoSourceOption[] = []

  if (item.resultfile) {
    sources.push({
      label: "AI视频",
      src: INFRARED_VIDEO_STATIC_PREFIX + item.resultfile
    })
  }

  if (item.fileurl) {
    sources.push({
      label: "原视频",
      src: INFRARED_VIDEO_STATIC_PREFIX + item.fileurl
    })
  }

  return sources
}
