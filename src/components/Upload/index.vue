<script lang="ts" setup>
// @ts-nocheck
import { Plus, Delete, ZoomIn, Edit } from "@element-plus/icons-vue"
import { u } from "@/utils/viewerjs"
import axios from "axios"
interface UploadProps {
  modelValue?: string | string[]
  accept?: string
  fileField?: string
  data?: {
    [key: string]: any
  }
  params?: {
    [key: string]: any
  }
  multiple?: boolean
  limit?: number
  autoUpload?: boolean
  maxSize?: number
  drag?: boolean
  action: string
  headers?: Record<string, any>
  disabled?: boolean
  preview?: boolean
  edit?: boolean
  remove?: boolean
  size?: number
  showUploadBtn?: boolean
}

const props = withDefaults(defineProps<UploadProps>(), {
  accept: ".jpg,.jpeg,.png,.gif,.webp", // 接受的文件类型
  fileField: "file", // 上传的文件字段名
  data: {}, // 上传的额外数据
  params: {}, // 上传的额外参数
  multiple: false, // 是否多选
  limit: 1, // 限制上传数量
  autoUpload: false, // 是否自动上传
  maxSize: 10, // 最大文件大小
  drag: false, // 是否拖拽上传
  headers: () => ({
    // 请求头
    Authorization: `Bearer ${getToken()}`
  }),
  disabled: false, // 是否禁用
  preview: true, // 是否显示预览
  edit: true, // 是否显示编辑
  remove: true, // 是否显示删除
  size: 108, // 组件大小
  showUploadBtn: false // 是否显示上传按钮
})

// const emit = defineEmits(["update:modelValue", "success", "error", "remove"])
const emit = defineEmits<{
  "update:modelValue": [string | string[]]
  success: [{ response: any; uploadFile: any; uploadFiles: any }]
  error: [{ error: any; uploadFile: any; uploadFiles: any }]
  remove: [{ uploadFile: any; uploadFiles: any }]
}>()
const uploadRef = ref()
const fileList = ref([])

// 上传前的验证
function beforeUpload(file) {
  // 检查文件大小
  const isLtMaxSize = file.size / 1024 / 1024 < props.maxSize
  if (!isLtMaxSize) {
    ElMessage.info(`文件大小不能超过 ${props.maxSize}MB!`)
    return false
  }

  if (props.accept) {
    if (props.accept === "*") {
      return true
    }
    // 检查文件格式
    const acceptList = props.accept.split(",").map((type) => type.trim())
    const fileExtension = "." + file.name.split(".").pop().toLowerCase()
    const isValidFormat = acceptList.includes(fileExtension)
    if (!isValidFormat) {
      ElMessage.info(`请上传 ${props.accept} 格式的文件`)
      return false
    }
  }

  return true
}
// 处理超出文件数量限制
function handleExceed(files, uploadFiles) {
  ElMessage.warning(`最多只能上传 ${props.limit} 个文件，当前已有 ${uploadFiles.length} 个文件`)
}
// 判断是否为图片文件
function isImageFile(file) {
  return file.type?.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name)
}

// 上传成功回调
function handleSuccess(response, uploadFile, uploadFiles) {
  emit("success", { response, uploadFile, uploadFiles })
}

// 上传失败回调
function handleError(error, uploadFile, uploadFiles) {
  emit("error", { error, uploadFile, uploadFiles })
}

// 手动上传
function submit() {
  // uploadRef.value?.submit()
  // 获取所有待上传的文件
  const pendingFiles = fileList.value.filter((file) => file.status === "ready" || file.status === "fail")
  if (pendingFiles.length === 0) {
    ElMessage.info("没有需要上传的文件")
    return
  }

  // 创建 FormData
  const formData = new FormData()

  // 添加所有文件到 FormData
  pendingFiles.forEach((file) => {
    formData.append(props.fileField, file.raw)
  })

  // 添加额外数据
  Object.keys(props.data).forEach((key) => {
    formData.append(key, props.data[key])
  })

  // 发起上传请求
  axios
    .post(props.action, formData, {
      headers: {
        ...props.headers,
        "Content-Type": "multipart/form-data"
      },
      params: props.params, // 额外参数
      onUploadProgress: (progressEvent) => {
        const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        pendingFiles.forEach((file) => {
          file.percentage = percentage
        })
      }
    })
    .then((response) => {
      pendingFiles.forEach((file) => {
        file.status = "success"
        handleSuccess(response, file, fileList.value)
      })
    })
    .catch((error) => {
      pendingFiles.forEach((file) => {
        file.status = "fail"
        handleError(error, file, fileList.value)
      })
    })
}

// 创建一个隐藏的文件输入框的引用
const fileInputRef = ref()
/// 触发文件选择，编辑
function handleEdit(file) {
  // 创建一个隐藏的 input 元素
  const input = document.createElement("input")
  input.type = "file"
  input.accept = props.accept
  input.style.display = "none"
  // 监听文件选择
  input.onchange = (e) => {
    const newFile = e.target.files?.[0]
    if (newFile) {
      // 先删除旧文件
      handleRemove(file, fileList.value)
      nextTick(() => {
        uploadRef.value?.handleStart(newFile)
        // 延迟100ms，手动触发选择
        // uploadRef.value?.submit()
        setTimeout(() => {
          submit()
        }, 100)
      })
    }
    // 清理临时创建的 input 元素
    document.body.removeChild(input)
  }

  // 添加到 body 并触发点击
  document.body.appendChild(input)
  input.click()
}

// 移除文件
function handleRemove(uploadFile, uploadFiles) {
  // fileList.value中删除uploadFile
  fileList.value = fileList.value.filter((item) => item.uid !== uploadFile.uid)
  emit("remove", { uploadFile })
}
// 预览
const preview = (file) => {
  u.showPreviewImg(0, [file.url])
}

watchEffect(() => {
  fileList.value = props.modelValue
})
// 暴露 提交方法
defineExpose({
  submit
})
</script>

<template>
  <el-upload
    ref="uploadRef"
    v-model:file-list="fileList"
    :action="action"
    :headers="headers"
    :name="fileField"
    :data="data"
    :multiple="multiple"
    :drag="drag"
    :limit="limit"
    :accept="accept"
    :auto-upload="autoUpload"
    :disabled="disabled"
    :before-upload="beforeUpload"
    :on-success="handleSuccess"
    :on-error="handleError"
    :on-remove="handleRemove"
    :on-exceed="handleExceed"
    :class="['upload-wall', { 'upload-disabled': disabled }]"
    :style="{ '--upload-size': `${size}px` }"
    list-type="picture-card"
  >
    <div class="upload-trigger">
      <el-icon class="upload-icon"><Plus /></el-icon>
      <div>选择文件</div>
    </div>

    <template #file="{ file }">
      <div class="upload-item">
        <!-- 如果是图片且有 URL，显示图片 -->
        <template v-if="isImageFile(file) && file.url">
          <img
            :src="file.url"
            class="upload-image"
            @click="preview && $emit('preview', file)"
          />
        </template>
        <!-- 如果不是图片或没有 URL，显示文件图标 -->
        <template v-else>
          <div class="file-thumbnail">
            <div class="file-name">{{ file.name }}</div>
          </div>
        </template>

        <!-- 上传中的加载状态 -->
        <div
          v-if="file.status === 'uploading'"
          class="upload-loading"
        >
          <el-progress
            type="circle"
            :percentage="file.percentage || 0"
          />
        </div>

        <!-- 操作按钮 -->
        <div
          class="upload-actions"
          v-if="!disabled"
        >
          <el-icon
            v-if="edit"
            @click.stop="handleEdit(file)"
            ><Edit
          /></el-icon>
          <el-icon
            v-if="remove"
            @click.stop="handleRemove(file, fileList)"
            ><Delete
          /></el-icon>
          <el-icon
            v-if="preview && file.url && isImageFile(file)"
            @click.stop="preview(file)"
          >
            <ZoomIn />
          </el-icon>
        </div>
      </div>
    </template>
  </el-upload>

  <el-button
    v-if="!autoUpload && showUploadBtn"
    type="primary"
    class="submit-btn"
    size="small"
    @click="submit"
  >
    上传文件
  </el-button>
</template>

<style scoped lang="scss">
.upload-wall {
  :deep(.el-upload--picture-card) {
    width: var(--upload-size);
    height: var(--upload-size);
    border-radius: 4px;
    border: 2px dashed #d9d9d9;
    background-color: #fafafa;
    transition: border-color 0.3s;
    margin: 0 8px 8px 0;

    &:hover {
      border-color: var(--el-color-primary);
      .upload-trigger {
        color: var(--el-color-primary);
        .upload-icon {
          color: var(--el-color-primary);
        }
      }
    }

    .el-upload-dragger {
      width: 100%;
      height: 100%;
    }
  }
  :deep(.el-upload-list--picture-card) {
    .el-upload-list__item {
      width: var(--upload-size);
      height: var(--upload-size);
    }
  }

  .upload-trigger {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 10px;
    width: 100%;
    height: 100%;
    color: #8c939d;
    font-size: 14px;
  }

  .upload-icon {
    color: #8c939d;
    transition: color 0.3s;
  }

  .upload-item {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-radius: 4px;

    .upload-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .file-thumbnail {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3px;
      background-color: rgba(0, 0, 0, 0.1);
      color: #8c939d;
    }

    :deep(.upload-loading) {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(0, 0, 0, 0.5);

      .el-progress {
        width: 90%;
        height: 90%;
        .el-progress-circle {
          width: 100% !important;
          height: 100% !important;
        }
        .el-progress__text {
          color: #fafafa;
        }
      }
    }

    .upload-actions {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: space-evenly;
      // gap: 16px;
      background-color: rgba(0, 0, 0, 0.5);
      opacity: 0;
      transition: opacity 0.3s;

      &:hover {
        opacity: 1;
      }

      .el-icon {
        color: #fff;
        font-size: 20px;
        cursor: pointer;
        transition: color 0.3s;

        &:hover {
          color: var(--el-color-primary);
        }
      }
    }
  }
}
</style>
