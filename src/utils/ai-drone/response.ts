/** 大鲵分页：有的接口 response 是数组，有的是 { data, dataCount } */
export function unwrapPage(res: { success?: boolean; response?: unknown } | null | undefined): {
  list: Record<string, unknown>[]
  total: number
} {
  const body = res?.response
  if (Array.isArray(body)) {
    return { list: body as Record<string, unknown>[], total: body.length }
  }
  if (body && typeof body === "object" && Array.isArray((body as { data?: unknown }).data)) {
    const page = body as { data: Record<string, unknown>[]; dataCount?: number; count?: number }
    return { list: page.data, total: page.dataCount ?? page.count ?? page.data.length }
  }
  return { list: [], total: 0 }
}

/** 业务是否成功。司空接口用 code === 0，大鲵用 success */
export function isDanieOk(res: { success?: boolean; status?: number; code?: number } | null | undefined): boolean {
  if (!res) return false
  if (res.code === 0) return true
  return res.success === true || res.status === 200
}
