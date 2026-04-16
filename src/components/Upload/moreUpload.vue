<!-- 多图上传组件 -->
<template>
  <el-upload
    multiple
    :class="{ 'single-uploader__icon': fileList.length >= props.limit }"
    v-model:file-list="fileList"
    list-type="picture-card"
    :before-upload="handleBeforeUpload"
    :http-request="handleUpload"
    :on-remove="handleRemove"
    :on-preview="previewImg"
    :limit="props.limit"
    :on-exceed="handleExceed"
  >
    <i-ep-plus v-if="fileList.length < props.limit" />
  </el-upload>

  <el-dialog v-model="dialogVisible">
    <img
      w-full
      :src="previewImgUrl"
      alt="Preview Image"
    />
  </el-dialog>
</template>

<script setup lang="ts">
import { UploadRawFile, UploadRequestOptions, UploadUserFile, UploadFile, UploadProps } from "element-plus"
import FileAPI from "@/api/file"

import { getImagesUrl } from "@/components/hooks/changeImagesUrl"
const emit = defineEmits(["update:modelValue", "message"])

const props = defineProps({
  /**
   * 文件路径集合
   */
  modelValue: {
    type: Array<string>,
    default: () => []
  },
  /**
   * 文件上传数量限制
   */
  limit: {
    type: Number,
    default: 10
  }
})

const previewImgUrl = ref("")
const dialogVisible = ref(false)

const fileList = ref([] as UploadUserFile[])
watch(
  () => props.modelValue,
  (newVal: any) => {
    if (newVal && typeof newVal == "string") {
      fileList.value.push({ url: newVal } as UploadUserFile)
    } else {
      const filePaths = fileList.value.map((file) => file.url)
      // 监听modelValue文件集合值未变化时，跳过赋值
      if (
        filePaths.length > 0 &&
        filePaths.length === newVal.length &&
        filePaths.every((x) => newVal.some((y) => y === x)) &&
        newVal.every((y) => filePaths.some((x) => x === y))
      ) {
        return
      }

      fileList.value = newVal.map((filePath) => {
        return { url: filePath } as UploadUserFile
      })
    }
  },
  { immediate: true }
)
// 限制上次张数的提示
function handleExceed(files: UploadRawFile[], fileList: UploadUserFile[]) {
  ElMessage.warning(`当前限制选择 ${props.limit} 个文件，本次选择了 ${files.length} 个文件`)
}
/**
 * 自定义图片上传
 *
 * @param params
 */
async function handleUpload(options: UploadRequestOptions): Promise<any> {
  // 上传API调用
  const data = await FileAPI.uploadImage(options.file)
  // if (data.code === 0) {
  //   ElMessage.success("上传成功");
  //   imgUrl.value = data.data;
  // }
  // 上传成功需手动替换文件路径为远程URL，否则图片地址为预览地址 blob:http://
  const fileIndex = fileList.value.findIndex((file) => file.uid == (options.file as any).uid)
  fileList.value.splice(fileIndex, 1, {
    name: data.data.substring(data.data.lastIndexOf("=") + 1),
    url: getImagesUrl(data.data)
  } as UploadUserFile)
  // fileList.value.forEach((file: any) => {
  //  if(data?.data.length>0){
  //   data?.data.forEach((item: any) => {
  //     if (item.fileName.indexOf(file.name.slice(0, file.name.length - 4)) != -1) {
  //       file.name = item.fileName
  //       file.url = item.fileUrl
  //     }
  //   })
  //  }
  //  else{
  //   if(data.data.indexOf(file.name.slice(0, file.name.length - 4)) != -1){
  //     file.url = data.data
  //   }
  //  }
  // })
  emit(
    "update:modelValue",
    fileList.value.map((file) => file.url)
  )
  emit(
    "message",
    fileList.value.map((file) => file.url)
  )
}

/**
 * 删除图片
 */
function handleRemove(removeFile: UploadFile) {
  const filePath = removeFile.url
  emit(
    "update:modelValue",
    fileList.value.map((file) => file.url)
  )
  emit(
    "message",
    fileList.value.map((file) => file.url)
  )
  // if (filePath) {
  //   FileAPI.deleteByPath(filePath).then(() => {
  //     // 删除成功回调
  //     emit(
  //       "update:modelValue",
  //       fileList.value.map((file) => file.url)
  //     );
  //   });
  // }
}

/**
 * 限制用户上传文件的格式和大小
 */
function handleBeforeUpload(file: UploadRawFile) {
  if (file.size > 5 * 1048 * 1048) {
    ElMessage.warning("上传图片不能大于5M")
    return false
  }
  return true
}

/**
 * 预览图片
 */
const previewImg: UploadProps["onPreview"] = (uploadFile) => {
  previewImgUrl.value = uploadFile.url!
  dialogVisible.value = true
}
</script>
<style lang="scss" scoped>
.single-uploader__icon {
  :deep(.el-upload-list--picture-card) {
    .el-upload--picture-card {
      display: none !important;
    }
  }
}

:deep(.el-upload-list__item.is-success:focus:not(:hover) .el-icon--close-tip) {
  display: none !important;
}
</style>
