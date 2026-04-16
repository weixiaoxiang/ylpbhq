import { UploadRequestOptions } from "element-plus/es/components/upload/src/upload"
import { UploadVideo,UploadPicToFile } from"@/api/upload"
export const useUpload = () => {
  // 重写ElUpload上传方法
  const httpRequest = async (options: UploadRequestOptions) => {
    // console.log("文件",options)
    const fileName = options.file.name
    const formData = new FormData()
    formData.append("file", options.file)
    formData.append("path", fileName)
    return UploadVideo(formData).then((res:any) => {
      // 通知成功，数据格式保持与后端上传的返回结果一致
      if (res.success) {
        return res.response
      } else {
        ElMessage.error(res.msg)
        return Promise.reject('上传失败')
      }
    }).catch((err:any) => {
      // 通知失败，数据格式保持与后端上传的返回结果一致
      ElMessage.error(err)
    })
  }
  return {
    httpRequest
  }
}
export const useUpload1 = () => {
  // 重写ElUpload上传方法
  const httpRequest1 = async (options: UploadRequestOptions) => {
    // console.log("文件",options)
    const fileName = options.file.name
    const formData = new FormData()
    formData.append("file", options.file)
    formData.append("path", fileName)
    return UploadPicToFile(formData).then((res:any) => {
      // 通知成功，数据格式保持与后端上传的返回结果一致
      if (res.success) {
        return res.response
      } else {
        ElMessage.error(res.msg)
        return Promise.reject('上传失败')
      }
    }).catch((err:any) => {
      // 通知失败，数据格式保持与后端上传的返回结果一致
      ElMessage.error(err)
    })
  }
  return {
    httpRequest1
  }
}

