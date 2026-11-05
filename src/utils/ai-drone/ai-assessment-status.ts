/** 识别结果是否已经研判 */
export function isAiResultAssessed(item: { is_assessment?: boolean; assessment_result?: string | null }): boolean {
  if (item.is_assessment === true) return true
  const result = item.assessment_result
  return result != null && String(result).trim() !== ""
}
