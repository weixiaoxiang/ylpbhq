import ExcelJS from "exceljs"
import { ElMessage } from "element-plus"

interface ColumnConfig {
  header: string //
  key: string
  width?: number // 10
  isImage?: boolean // false
  imageSize?: {
    height: number // 20
  }
}

interface ExportOptions {
  fileName: string
  sheetName?: string
  columns: ColumnConfig[]
  data: any[]
  imageQuality?: number
  maxImageSize?: number
}

/**
 * Excel导出工具类
 *
 * @example
 * // 基本使用示例:
 * const columns = [
 *   { header: '姓名', key: 'name', width: 20 },
 *   { header: '年龄', key: 'age', width: 10 },
 *   { header: '头像', key: 'avatar', isImage: true, width: 100, imageSize: { height: 60 } }
 * ];
 *
 * const data = [
 *   { name: '张三', age: 25, avatar: 'https://example.com/avatar1.jpg' },
 *   { name: '李四', age: 30, avatar: 'https://example.com/avatar2.jpg' }
 * ];
 *
 * await ExcelExporter.exportExcel({
 *   fileName: '员工信息表.xlsx',
 *   sheetName: '员工列表',
 *   columns,
 *   data,
 *   imageQuality: 0.8,  // 可选,图片质量
 *   maxImageSize: 100   // 可选,图片最大尺寸
 * });
 */
export class ExcelExporter {
  // 像素到点的转换比例 (1点 ≈ 1.33像素)
  private static readonly PIXELS_TO_POINTS = 0.75

  private static async processImage(
    url: string,
    targetHeight: number = 100,
    quality: number = 0.8
  ): Promise<{ base64: string; width: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          reject(new Error("无法创建canvas上下文"))
          return
        }

        // 根据目标高度计算宽度，保持原始比例
        const ratio = targetHeight / img.height
        canvas.height = targetHeight
        canvas.width = img.width * ratio

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve({
          base64: canvas.toDataURL("image/png", quality),
          width: canvas.width
        })
      }
      img.onerror = () => reject(new Error("图片加载失败"))
      img.src = url
    })
  }

  private static async downloadExcel(workbook: ExcelJS.Workbook, fileName: string) {
    try {
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      })

      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = fileName
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      throw new Error("文件下载失败")
    }
  }

  public static async exportExcel(options: ExportOptions) {
    const { fileName, sheetName = "Sheet1", columns, data, imageQuality = 0.8, maxImageSize = 100 } = options

    try {
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet(sheetName)

      // 设置列
      worksheet.columns = columns.map((col) => ({
        header: col.header,
        key: col.key,
        width: col.width || 15
      }))

      // 处理数据
      for (let i = 0; i < data.length; i++) {
        const row = worksheet.addRow(data[i])

        // 处理图片列
        for (const col of columns) {
          if (col.isImage && data[i][col.key]) {
            try {
              const imageUrl = data[i][col.key]
              const isBase64 = imageUrl.startsWith("data:image")

              // 获取单元格
              const colIndex = columns.findIndex((c) => c.key === col.key)
              const cell = row.getCell(colIndex + 1)

              // 如果是base64格式，设置单元格值为空字符串
              if (isBase64) {
                cell.value = ""
              } else {
                // 如果是网络链接，设置单元格值为链接文本
                cell.value = imageUrl
              }

              // 处理图片
              const targetHeight = col.imageSize?.height || maxImageSize
              const { base64, width } = await this.processImage(imageUrl, targetHeight, imageQuality)

              // 如果base64为空，跳过添加图片
              if (!base64) {
                continue
              }

              const imageId = workbook.addImage({
                base64: base64,
                extension: "png"
              })

              // 使用ext属性设置图片尺寸，而不是使用tl和br
              worksheet.addImage(imageId, {
                tl: { col: colIndex, row: i + 1 },
                ext: {
                  width: width,
                  height: targetHeight
                }
              })

              // 设置单元格对齐方式
              cell.alignment = {
                vertical: "middle",
                horizontal: "center",
                wrapText: true // 允许文本换行
              }
            } catch (error) {
              console.error(`处理图片失败: ${col.key}`, error)
            }
          }
        }

        // 设置行高为图片高度
        const imageColumn = columns.find((col) => col.isImage)
        if (imageColumn?.imageSize?.height) {
          // 将像素高度转换为点，并添加一些额外空间确保图片完全显示
          const rowHeight = (imageColumn.imageSize.height / this.PIXELS_TO_POINTS) * 1.3
          row.height = rowHeight
        }
      }

      await this.downloadExcel(workbook, fileName)
      ElMessage.success("导出成功")
    } catch (error) {
      console.error("导出失败:", error)
      ElMessage.error("导出失败，请重试")
      throw error
    }
  }
}
